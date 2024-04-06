import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PipelineStage } from 'mongoose';
import { Event } from './schemas/event.schema';
import {
  CreateEventDTO,
  EventResponseDto,
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

  // Create event -----------------------------------------------------
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

    return this.mapEventToResponseDto(newEvent);
  }

  // Find event by id -----------------------------------------------------
  async findEventById(_id: string): Promise<EventResponseDto> {
    const events = await this.eventModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(_id) } },
      { $project: this.getEventProjectionStage() },
    ]);

    if (!events.length) throw new BadRequestException('Event not found');

    return this.mapEventToResponseDto(events[0]);
  }

  // Find events ----------------------------------------------------------------
  async findEvents(
    dto: FindEventsDTO,
  ): Promise<
    Omit<EventResponseDto, 'description' | 'banner_image_url' | 'faculty.mc'>[]
  > {
    const pipeline: PipelineStage[] = [];
    const match: any = {};

    if (dto.facultyId) {
      const faculty = await this.facultyModel.findById(dto.facultyId);
      if (!faculty) throw new BadRequestException('Faculty not found');

      match['_id'] = {
        $in: faculty.event_ids.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    match['deleted_at'] = null;

    if (dto.name) match['name'] = { $regex: dto.name, $options: 'i' };
    if (dto.start_date) match['start_date'] = { $gte: dto.start_date };
    if (dto.final_closure_date)
      match['final_closure_date'] = { $lte: dto.final_closure_date };
    if (dto.mcName)
      match['faculty.mc.name'] = { $regex: dto.mcName, $options: 'i' };

    pipeline.push({ $match: match });
    pipeline.push({ $project: this.getEventProjectionStage() });

    if (dto.sort) pipeline.push({ $sort: { [dto.sort]: -1 } });
    if (dto.skip) pipeline.push({ $skip: Number(dto.skip) });
    if (dto.limit) pipeline.push({ $limit: Number(dto.limit) });

    const events = await this.eventModel.aggregate(pipeline);
    return events.map((event) => this.mapEventToResponseDto(event));
  }

  // Update event -------------------------------------------------------------
  async updateEvent(
    eventId: string,
    dto: UpdateEventDTO,
    bannerImage?: Express.Multer.File,
  ): Promise<EventResponseDto> {
    const event = await this.eventModel.findOne({
      _id: eventId,
      deleted_at: null,
    });
    if (!event) throw new BadRequestException('Event not found');

    const {
      name,
      description,
      start_date,
      first_closure_date,
      final_closure_date,
    } = dto;

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
      { _id: { $in: event.contribution_ids } },
      {
        event: {
          _id: event._id,
          name: event.name,
          final_closure_date: event.first_closure_date,
        },
      },
    );

    return this.mapEventToResponseDto(await event.save());
  }

  // Remove event -------------------------------------------------------------
  async removeEvent(eventId: string): Promise<void> {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new BadRequestException('Event not found');

    event.deleted_at = new Date();
    await this.contributionModel.updateMany(
      { _id: { $in: event.contribution_ids } },
      { deleted_at: new Date() },
    );

    await event.save();
  }

  private getEventProjectionStage(): any {
    return {
      name: 1,
      start_date: 1,
      first_closure_date: 1,
      final_closure_date: 1,
      faculty: 1,
      number_of_contributions: { $size: '$contribution_ids' },
      is_accepting_new_contribution: {
        $gte: ['$first_closure_date', new Date()],
      },
      is_contributions_editable: { $gte: ['$final_closure_date', new Date()] },
    };
  }

  // Map event to response dto -----------------------------------------------------
  private mapEventToResponseDto(event: any): EventResponseDto {
    return {
      _id: event._id,
      name: event.name,
      description: event.description,
      banner_image_url: event.banner_image_url,
      start_date: event.start_date,
      first_closure_date: event.first_closure_date,
      final_closure_date: event.final_closure_date,
      is_accepting_new_contribution: event.is_accepting_new_contribution,
      is_contributions_editable: event.is_contributions_editable,
      number_of_contributions: event.number_of_contributions,
      faculty: event.faculty,
    };
  }
}
