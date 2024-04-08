import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Event } from './schemas/event.schema';
import {
  CreateEventDTO,
  EventResponseDto,
  FindEventsDTO,
  UpdateEventDTO,
} from './event.dtos';
import { Faculty } from 'src/faculty/schemas/faculty.schema';
import { StorageService } from 'src/shared-modules/storage/storage.service';
import { UtilService } from 'src/shared-modules/util/util.service';

@Injectable()
export class EventService {
  constructor(
    @InjectModel('Event') private eventModel: Model<Event>,
    @InjectModel('Faculty') private facultyModel: Model<Faculty>,
    private storageService: StorageService,
    private utilService: UtilService,
  ) {}

  // Create event -------------------------------------------------------------
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
    this.ensureDateValid(start_date, first_closure_date, final_closure_date);

    // Find faculty
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

    // Upload banner image
    if (bannerImage) {
      newEvent.banner_image_url =
        await this.storageService.uploadPublicFile(bannerImage);
    }

    await newEvent.save();
    return await this.findEventById(newEvent._id);
  }

  // Find event by Id -------------------------------------------------------------
  async findEventById(_id: string): Promise<EventResponseDto> {
    const events = await this.eventModel.aggregate([
      {
        $match: {
          _id: this.utilService.mongoId(_id),
        },
      },
      {
        $lookup: {
          from: 'contributions',
          localField: '_id',
          foreignField: 'event._id',
          as: 'contributions',
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          banner_image_url: 1,
          start_date: 1,
          first_closure_date: 1,
          final_closure_date: 1,
          is_accepting_new_contribution: {
            $cond: {
              if: {
                $and: [
                  { $gte: ['$first_closure_date', new Date()] },
                  { $lte: ['$start_date', new Date()] },
                ],
              },
              then: true,
              else: false,
            },
          },
          is_contributions_editable: {
            $cond: {
              if: {
                $gte: ['$final_closure_date', new Date()],
              },
              then: true,
              else: false,
            },
          },
          number_of_contributions: { $size: '$contributions' },
          faculty: 1,
        },
      },
    ]);
    if (events.length === 0) return;
    const event = events[0];
    return this.utilService.santinizeEvent(
      event,
      event.is_accepting_new_contribution,
      event.is_contributions_editable,
      event.number_of_contributions,
    );
  }

  // Find events -------------------------------------------------------------
  async findEvents(dto: FindEventsDTO): Promise<EventResponseDto[]> {
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

    if (name) match['name'] = { $regex: name, $options: 'i' };
    if (start_date) match['start_date'] = { $gte: start_date };
    if (final_closure_date) {
      match['final_closure_date'] = { $lte: final_closure_date };
    }
    if (mcName) {
      match['faculty.mc.name'] = { $regex: mcName, $options: 'i' };
    }
    if (facultyId) match['faculty._id'] = this.utilService.mongoId(facultyId);

    const project = {
      name: 1,
      start_date: 1,
      first_closure_date: 1,
      final_closure_date: 1,
      faculty: 1,
      is_accepting_new_contribution: {
        $cond: {
          if: {
            $gte: ['$first_closure_date', new Date()],
          },
          then: true,
          else: false,
        },
      },
      is_contributions_editable: {
        $cond: {
          if: {
            $gte: ['$final_closure_date', new Date()],
          },
          then: true,
          else: false,
        },
      },
    };

    pipeline.push({ $match: match });
    pipeline.push({ $project: project });
    if (sort) pipeline.push({ $sort: { [sort]: -1 } });
    if (skip) pipeline.push({ $skip: Number(skip) });
    if (limit) pipeline.push({ $limit: Number(limit) });

    const events = await this.eventModel.aggregate(pipeline);

    return events.map((event) =>
      this.utilService.santinizeEvent(
        event,
        event.is_accepting_new_contribution,
        event.is_contributions_editable,
        event.number_of_contributions,
      ),
    );
  }

  // Update event -------------------------------------------------------------
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
      _id: eventId,
    });
    if (!event) return;

    if (name) event.name = name;
    if (description) event.description = description;
    if (start_date) event.start_date = start_date;
    if (first_closure_date) event.first_closure_date = first_closure_date;
    if (final_closure_date) event.final_closure_date = final_closure_date;

    this.ensureDateValid(
      event.start_date,
      event.first_closure_date,
      event.final_closure_date,
    );

    if (bannerImage) {
      // Delete old banner image
      if (event.banner_image_url) {
        await this.storageService.deletePublicFile(event.banner_image_url);
      }
      // Upload new banner image
      event.banner_image_url =
        await this.storageService.uploadPublicFile(bannerImage);
    }

    await event.save();

    return await this.findEventById(eventId);
  }

  // Remove event -------------------------------------------------------------
  async removeEvent(eventId: string): Promise<void> {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new BadRequestException('Event not found');
    event.deleted_at = new Date();

    await event.save();
    return;
  }

  // Ensure date valid -------------------------------------------------------------
  ensureDateValid(
    startDate: Date,
    firstClosureDate: Date,
    finalClosureDate: Date,
  ): void {
    if (startDate < new Date()) {
      throw new BadRequestException('Start date must be in the future');
    }
    if (firstClosureDate < startDate) {
      throw new BadRequestException(
        'First closure date must be after start date',
      );
    }
    if (finalClosureDate < firstClosureDate) {
      throw new BadRequestException(
        'Final closure date must be after first closure date',
      );
    }
  }
}
