import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PipelineStage } from 'mongoose';
import { Event } from './schemas/event.schema';
import {
  CreateEventDTO,
  EventResponseDto,
  EventsResponseDto,
  FindEventsDTO,
  UpdateEventDTO,
} from './event.dtos';
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

  async createEvent(dto: CreateEventDTO): Promise<EventResponseDto> {
    const {
      name,
      start_date,
      first_closure_date,
      final_closure_date,
      facultyId,
    } = dto;
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

    return {
      _id: newEvent._id,
      name: newEvent.name,
      start_date: newEvent.start_date,
      first_closure_date: newEvent.first_closure_date,
      final_closure_date: newEvent.final_closure_date,
      is_accepting_new_contribution: this.isAcceptingNewContributions(
        newEvent.first_closure_date,
      ),
      is_contributions_editable: this.isContributionsEditable(
        newEvent.final_closure_date,
      ),
      number_of_contributions: newEvent.contribution_ids.length,
      faculty: {
        _id: faculty._id,
        name: faculty.name,
        mc: faculty.mc,
      },
    };
  }

  async findEventById(_id: string): Promise<EventResponseDto> {
    const event = await this.eventModel.findById(_id).exec();
    return {
      _id: event._id,
      name: event.name,
      start_date: event.start_date,
      first_closure_date: event.first_closure_date,
      final_closure_date: event.final_closure_date,
      is_accepting_new_contribution: this.isAcceptingNewContributions(
        event.first_closure_date,
      ),
      is_contributions_editable: this.isContributionsEditable(
        event.final_closure_date,
      ),
      number_of_contributions: event.contribution_ids.length,
      faculty: event.faculty,
    };
  }

  async findEvents(dto: FindEventsDTO): Promise<EventsResponseDto[]> {
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

    const match = {};

    if (facultyId) {
      const faculty = await this.facultyModel.findById(facultyId);
      if (!faculty) throw new BadRequestException('Faculty not found');
      match['_id'] = {
        $in: faculty.event_ids.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
    if (name) match['name'] = { $regex: name, $options: 'i' };
    if (start_date) match['start_date'] = { $gte: start_date };
    if (final_closure_date) {
      match['final_closure_date'] = { $lte: final_closure_date };
    }
    if (mcName) {
      match['faculty.mc.name'] = { $regex: mcName, $options: 'i' };
    }

    const project = {
      name: 1,
      start_date: 1,
      first_closure_date: 1,
      final_closure_date: 1,
      number_of_contributions: { $size: '$contribution_ids' },
      is_accepting_new_contribution: this.isAcceptingNewContributions(
        new Date('$first_closure_date'),
      ),
      is_contributions_editable: this.isContributionsEditable(
        new Date('$final_closure_date'),
      ),
    };

    pipeline.push({ $match: match });
    pipeline.push({ $project: project });
    if (sort) pipeline.push({ $sort: { [sort]: -1 } });
    if (skip) pipeline.push({ $skip: Number(skip) });
    if (limit) pipeline.push({ $limit: Number(limit) });

    return this.eventModel.aggregate(pipeline);
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

  async removeEvent(id: string): Promise<void> {
    const event = await this.eventModel.findById(id);
    if (!event) throw new BadRequestException('Event not found');
    event.deleted_at = new Date();

    await this.contributionModel.updateMany(
      {
        _id: { $in: event.contribution_ids },
      },
      { deleted_at: new Date() },
    );
    await event.save();
    return;
  }

  isAcceptingNewContributions(firstClosureDate: Date): boolean {
    return firstClosureDate > new Date();
  }

  isContributionsEditable(finalClosureDate: Date): boolean {
    return finalClosureDate > new Date();
  }
}
