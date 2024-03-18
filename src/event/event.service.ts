import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Event } from './schemas/event.schema';
import { CreateEventDTO, FindEventsDTO, UpdateEventDTO } from './event.dtos';
import { Faculty } from 'src/faculty/schemas/faculty.schema';
import { User } from 'src/user/schemas/user.schema';
import { Contribution } from 'src/contribution/schemas/contribution.schema';

@Injectable()
export class EventService {
  constructor(
    @InjectModel('Event') private eventModel: Model<Event>,
    @InjectModel('Faculty') private facultyModel: Model<Faculty>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Contribution') private contributionModel: Model<Contribution>,
  ) {}

  async createEventByUserFaculty(
    userId: string,
    createEventDto: CreateEventDTO,
  ): Promise<Event> {
    const user = await this.userModel.findById(userId).exec();
    if (!user.faculty) throw new BadRequestException('User has no faculty');

    const faculty = await this.facultyModel.findById(user.faculty._id);

    const { name, start_date, first_closure_date, final_closure_date } =
      createEventDto;

    const newEvent = new this.eventModel({
      name,
      start_date,
      first_closure_date,
      final_closure_date,
      faculty: {
        _id: faculty._id,
        name: faculty.name,
        mc: faculty.mc,
      },
    });
    await newEvent.save();

    await faculty.updateOne({ $push: { event_ids: newEvent._id } });

    return newEvent;
  }

  async createEvent(createEventDto: CreateEventDTO): Promise<Event> {
    const {
      name,
      start_date,
      first_closure_date,
      final_closure_date,
      facultyId,
    } = createEventDto;
    const faculty = await this.facultyModel.findById(facultyId);
    if (!faculty) throw new BadRequestException('Faculty not found');

    const newEvent = new this.eventModel({
      name,
      start_date,
      first_closure_date,
      final_closure_date,
      faculty: {
        _id: faculty._id,
        name: faculty.name,
        mc: faculty.mc,
      },
    });
    await newEvent.save();

    faculty.event_ids.push(newEvent._id);
    await faculty.save();

    return newEvent;
  }

  async getEventDetails(_id: string): Promise<Event> {
    const events = this.eventModel.aggregate([
      { $match: { _id } },
      {
        $project: {
          name: 1,
          start_date: 1,
          first_closure_date: 1,
          final_closure_date: 1,
          faculty: 1,
          number_of_contributions: { $size: 'contribution_ids' },
        },
      },
    ]);
    return events[0];
  }

  async findEventsByUserFaculty(
    userId: string,
    dto: FindEventsDTO,
  ): Promise<Event[]> {
    const user = await this.userModel.findById(userId).exec();
    if (!user.faculty) throw new BadRequestException('User has no faculty');

    return this.eventModel.aggregate(
      this.genFindEventsPipeline({
        ...dto,
        facultyId: user.faculty._id,
      }),
    );
  }

  async findEvents(dto: FindEventsDTO): Promise<Event[]> {
    return this.eventModel.aggregate(this.genFindEventsPipeline(dto));
  }

  async updateEvent(id: string, dto: UpdateEventDTO): Promise<Event> {
    const { name, start_date, first_closure_date, final_closure_date } = dto;

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(
        id,
        { name, start_date, final_closure_date, first_closure_date },
        { new: true },
      )
      .exec();

    await this.contributionModel.updateMany(
      {
        _id: { $in: updatedEvent.contribution_ids },
      },
      { event: { _id: updatedEvent._id, name: updatedEvent.name } },
    );

    return updatedEvent;
  }

  async updateEventByUserFaculty(
    userId: string,
    eventId: string,
    dto: UpdateEventDTO,
  ): Promise<Event> {
    const user = await this.userModel.findById(userId).exec();
    if (!user.faculty) throw new BadRequestException('User has no faculty');

    const faculty = await this.facultyModel.findById(user.faculty._id);
    if (!faculty) throw new BadRequestException('Faculty not found');
    if (!faculty.event_ids.includes(eventId)) {
      throw new BadRequestException('Event not found in faculty');
    }

    const { name, start_date, first_closure_date, final_closure_date } = dto;

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        { name, start_date, final_closure_date, first_closure_date },
        { new: true },
      )
      .exec();

    await this.contributionModel.updateMany(
      {
        _id: { $in: updatedEvent.contribution_ids },
      },
      { event: { _id: updatedEvent._id, name: updatedEvent.name } },
    );

    return updatedEvent;
  }

  async removeEvent(id: string) {
    await this.eventModel.findByIdAndDelete(id).exec();
  }

  async removeEventFromUserFaculty(userId: string, eventId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user.faculty) throw new BadRequestException('User has no faculty');

    const faculty = await this.facultyModel.findById(user.faculty._id);
    if (!faculty) throw new BadRequestException('Faculty not found');
    if (!faculty.event_ids.includes(eventId)) {
      throw new BadRequestException('Event not found in faculty');
    }

    await this.eventModel.findByIdAndDelete(eventId).exec();
    await faculty.updateOne({ $pull: { event_ids: eventId } });
  }

  genFindEventsPipeline(dto: FindEventsDTO): PipelineStage[] {
    const {
      facultyId,
      name,
      start_date,
      final_closure_date,
      mcName,
      limit,
      skip,
      sort,
    } = dto;

    const pipeline: PipelineStage[] = [];

    const matchConditions = {};
    facultyId && (matchConditions['faculty._id'] = facultyId);
    name && (matchConditions['name'] = { $regex: name, $options: 'i' });
    start_date && (matchConditions['start_date'] = { $gte: start_date });
    final_closure_date &&
      (matchConditions['final_closure_date'] = { $lte: final_closure_date });
    mcName &&
      (matchConditions['faculty.mc.name'] = { $regex: mcName, $options: 'i' });

    const project = {
      name: 1,
      start_date: 1,
      first_closure_date: 1,
      final_closure_date: 1,
      number_of_contributions: {
        $cond: {
          if: { $isArray: '$contribution_ids' },
          then: { $size: '$contribution_ids' },
          else: 0,
        },
      },
    };

    pipeline.push({ $match: matchConditions });
    pipeline.push({ $project: project });

    if (sort) pipeline.push({ $sort: { [sort]: -1 } });
    if (skip) pipeline.push({ $skip: Number(skip) });
    if (limit) pipeline.push({ $limit: Number(limit) });

    return pipeline;
  }
}
