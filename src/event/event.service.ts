import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './schemas/event.schema';
import { FacultyService } from 'src/faculty/faculty.service';
import { CreateEventDTO, FindEventDTO, UpdateEventDTO } from './event.dtos';
import { UserService } from 'src/user/user.service';
import { Faculty } from 'src/faculty/schemas/faculty.schema';

@Injectable()
export class EventService {
  constructor(
    @InjectModel('Event') private eventModel: Model<Event>,
    @Inject(forwardRef(() => FacultyService))
    private facultyService: FacultyService,
    private userService: UserService,
  ) {}

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

  async findEvents(dto: FindEventDTO): Promise<Event[]> {
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

    return this.eventModel.aggregate([
      {
        $match: {
          'faculty._id': facultyId,
          'faculty.mc.name': { $regex: mcName, $options: 'i' },
          name: { $regex: name, $options: 'i' },
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

  async findEventsByUserFaculty(
    userId: string,
    dto: FindEventDTO,
  ): Promise<Event[]> {
    const user = await this.userService.findOneById(userId);
    if (!user.faculty) throw new BadRequestException('User has no faculty');

    const { name, start_date, final_closure_date, limit, skip, sort } = dto;

    return this.eventModel.aggregate([
      {
        $match: {
          'faculty._id': user.faculty._id,
          name: { $regex: name, $options: 'i' },
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

  async createEvent(createEventDto: CreateEventDTO): Promise<Event> {
    const {
      name,
      start_date,
      first_closure_date,
      final_closure_date,
      facultyId,
    } = createEventDto;
    const faculty = await this.facultyService.findOneById(facultyId);
    if (!faculty) {
      throw new BadRequestException('Faculty not found');
    }
    const currentEvent = await this.eventModel
      .findOne({
        name: {
          $regex: new RegExp(`^${name}$`, 'i'),
        },
      })
      .exec();
    if (currentEvent) {
      throw new BadRequestException('Event already exists');
    }
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
    await this.facultyService.addEventId(facultyId, newEvent._id);
    return newEvent;
  }

  async updateEventsFaculty(event_ids: string[], faculty: Faculty) {
    await this.eventModel.updateMany(
      { _id: { $in: event_ids } },
      { faculty: { _id: faculty._id, name: faculty.name, mc: faculty.mc } },
    );
    return;
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
    return updatedEvent;
  }

  async removeEvent(id: string): Promise<Event> {
    const removedEvent = await this.eventModel.findByIdAndDelete(id).exec();
    if (!removedEvent) {
      throw new BadRequestException('Event not found');
    }
    return removedEvent;
  }
}
