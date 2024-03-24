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
import { StorageService } from 'src/shared-modules/storage/storage.service';

@Injectable()
export class EventService {
  constructor(
    @InjectModel('Event') private eventModel: Model<Event>,
    @InjectModel('Faculty') private facultyModel: Model<Faculty>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Contribution') private contributionModel: Model<Contribution>,
    private storageService: StorageService,
  ) {}

  async createEvent(
    dto: CreateEventDTO,
    bannerImage?: Express.Multer.File,
  ): Promise<EventResponseDto> {
    const {
      name,
      description,
      start_date,
      first_closure_date,
      final_closure_date,
      facultyId,
    } = dto;
    const faculty = await this.facultyModel.findById(facultyId);
    if (!faculty) throw new BadRequestException('Faculty not found');

    const newEvent = new this.eventModel({
      name,
      description,
      start_date,
      first_closure_date,
      final_closure_date,
      faculty: {
        _id: faculty._id,
        name: faculty.name,
        mc: faculty.mc,
      },
    });
    if (bannerImage) {
      newEvent.banner_image_url =
        await this.storageService.uploadPublicFile(bannerImage);
    }
    await newEvent.save();

    faculty.event_ids.push(newEvent._id);
    await faculty.save();

    return {
      _id: newEvent._id,
      name: newEvent.name,
      description: newEvent.description,
      banner_image_url: newEvent.banner_image_url,
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
    const event = await this.eventModel
      .findOne({
        _id: new mongoose.Types.ObjectId(_id),
        deleted_at: null,
      })
      .exec();
    return {
      _id: event._id,
      name: event.name,
      description: event.description,
      banner_image_url: event.banner_image_url,
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
    match['deleted_at'] = null;
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

  async updateEvent(
    eventId: string,
    dto: UpdateEventDTO,
    bannerImage?: Express.Multer.File,
  ): Promise<EventResponseDto> {
    const {
      name,
      description,
      start_date,
      first_closure_date,
      final_closure_date,
    } = dto;

    const event = await this.eventModel.findOne({
      _id: new mongoose.Types.ObjectId(eventId),
      deleted_at: null,
    });
    if (!event) throw new BadRequestException('Event not found');

    if (name) event.name = name;
    if (description) event.description = description;
    if (start_date) event.start_date = start_date;
    if (first_closure_date) event.first_closure_date = first_closure_date;
    if (final_closure_date) event.final_closure_date = final_closure_date;

    if (bannerImage) {
      if (event.banner_image_url) {
        await this.storageService.deletePublicFile(event.banner_image_url);
      }
      event.banner_image_url =
        await this.storageService.uploadPublicFile(bannerImage);
    }

    await this.contributionModel.updateMany(
      {
        _id: { $in: event.contribution_ids },
      },
      {
        event: {
          _id: event._id,
          name: event.name,
          final_closure_date: event.first_closure_date,
        },
      },
    );

    return {
      _id: event._id,
      name: event.name,
      description: event.description,
      banner_image_url: event.banner_image_url,
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

  async removeEvent(eventId: string): Promise<void> {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new BadRequestException('Event not found');
    event.deleted_at = new Date();

    await this.contributionModel.updateMany(
      {
        _id: { $in: event.contribution_ids },
      },
      { deleted_at: new Date() },
    );

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
