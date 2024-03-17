import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../shared-modules/database/schemas/event/event.schema';
import { CreateEventDTO, FindEventsDTO, UpdateEventDTO } from './event.dtos';
import { Faculty } from 'src/shared-modules/database/schemas/faculty/faculty.schema';
import { User } from 'src/shared-modules/database/schemas/user/user.schema';
import { Contribution } from 'src/shared-modules/database/schemas/contribution/contribution.schema';

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
          number_of_contributions: { $size: 'contribution_ids' },
          contribution_ids: 0,
          published_contribution_ids: 0,
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

    const { name, start_date, final_closure_date, limit, skip, sort } = dto;

    return this.eventModel.aggregate([
      {
        $match: {
          'faculty._id': user.faculty._id,
          name: { $regex: name || '', $options: 'i' },
          start_date: { $gte: start_date },
          final_closure_date: { $lte: final_closure_date },
        },
      },
      {
        $project: {
          number_of_contributions: { $size: 'contribution_ids' },
          contribution_ids: 0,
          published_contribution_ids: 0,
        },
      },
      { $sort: { [sort]: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);
  }

  async findEvents(dto: FindEventsDTO): Promise<Event[]> {
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

    const conditions = {};
    name && (conditions['name'] = { $regex: name, $options: 'i' });
    start_date && (conditions['start_date'] = { $gte: start_date });
    final_closure_date &&
      (conditions['final_closure_date'] = { $lte: final_closure_date });

    return this.eventModel.aggregate([
      {
        $match: conditions,
      },
      {
        $project: {
          name: 1,
          start_date: 1,
          first_closure_date: 1,
          final_closure_date: 1,
          faculty: 1,
          number_of_contributions: {
            $cond: {
              if: { $isArray: '$contribution_ids' }, // Check if contribution_ids is an array
              then: { $size: '$contribution_ids' }, // Calculate size if it's an array
              else: 0, // Return 0 if contribution_ids is not an array (i.e., null or not present)
            },
          },
        },
      },
      { $sort: { [sort]: -1 } },
      { $skip: 0 },
      { $limit: 100 },
    ]);
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
}
