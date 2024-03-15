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
    return newEvent;
  }

  async updateEventsFaculty(faculty: Faculty) {
    return this.eventModel.updateMany(
      { 'faculty._id': faculty._id },
      {
        $set: {
          faculty: {
            _id: faculty._id,
            name: faculty.name,
            mc: faculty.mc,
          },
        },
      },
    );
  }

  async updateEvent(id: string, dto: UpdateEventDTO): Promise<Event> {
    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updatedEvent) {
      throw new BadRequestException('Event not found');
    }
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
