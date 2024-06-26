import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './schemas/event.schema';
import {
  CreateEventDTO,
  EventResponseDto,
  FindEventsDTO,
  UpdateEventDTO,
} from './event.dtos';
import { Faculty } from 'src/faculty/schemas/faculty.schema';
import { StorageService } from 'src/shared-modules/storage/storage.service';
import { EventHelper } from './event.helper';
import { IAccessTokenPayload } from 'src/shared-modules/jwt/jwt.interfaces';
import { ERole } from 'src/user/user.enums';

@Injectable()
export class EventService {
  constructor(
    @InjectModel('Event') private eventModel: Model<Event>,
    @InjectModel('Faculty') private facultyModel: Model<Faculty>,
    private storageService: StorageService,
    private helper: EventHelper,
  ) {}

  // Create event -------------------------------------------------------------
  async createEvent(
    user: IAccessTokenPayload,
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
    this.helper.ensureDateValid(
      start_date,
      first_closure_date,
      final_closure_date,
    );

    // Find faculty
    let faculty;
    if (user.role === ERole.MarketingCoordinator) {
      this.helper.ensureUserHaveFaculty(user);
      faculty = await this.facultyModel.findById(user.facultyId);
    } else {
      faculty = await this.facultyModel.findById(facultyId);
    }
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
      const resizedBannerImage = await this.storageService.resizeImage(
        bannerImage,
        1400,
      );
      newEvent.banner_image_url =
        await this.storageService.uploadPublicFile(resizedBannerImage);
    }

    await newEvent.save();
    return await this.findEventById(newEvent._id);
  }

  // Find event by Id -------------------------------------------------------------
  async findEventById(_id: string): Promise<EventResponseDto> {
    const events = await this.eventModel.aggregate([
      {
        $match: {
          _id: this.helper.mongoId(_id),
        },
      },
      this.helper.generateFindEventsPipelineLookup(),
      this.helper.generateFindEventsPipelineProjection(true),
    ]);
    if (events.length === 0) return;
    const event = events[0];
    return this.helper.santinizeEvent(
      event,
      event.is_accepting_new_contribution,
      event.is_contributions_editable,
      event.number_of_contributions,
    );
  }

  // Find events -------------------------------------------------------------
  async findEvents(
    user: IAccessTokenPayload,
    dto: FindEventsDTO,
  ): Promise<EventResponseDto[]> {
    let pipeline;
    if (user.role === ERole.Admin || user.role === ERole.MarketingManager) {
      pipeline = this.helper.generateFindEventsPipeline(dto);
    } else {
      this.helper.ensureUserHaveFaculty(user);
      pipeline = this.helper.generateFindEventsPipeline({
        ...dto,
        facultyId: user.facultyId,
      });
    }

    const events = await this.eventModel.aggregate(pipeline);

    return events.map((event) =>
      this.helper.santinizeEvent(
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

    this.helper.ensureDateValid(
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
      const resizedBannerImage = await this.storageService.resizeImage(
        bannerImage,
        1400,
      );
      event.banner_image_url =
        await this.storageService.uploadPublicFile(resizedBannerImage);
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
}
