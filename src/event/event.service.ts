import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './schemas/event.schema';
import { CreateEventDTO } from './dtos/create-event.dto';
import { UpdateEventDTO } from './dtos/update-event.dto';
import { FacultyService } from 'src/faculty/faculty.service';

@Injectable()
export class EventService {
  constructor(
    @InjectModel('Event') private eventModel: Model<Event>,
    private facultyService: FacultyService,
  ) {}

  async getAllEvent(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }

  async createEvent(createEventDto: CreateEventDTO): Promise<Event> {
    const {
      name,
      start_date,
      first_closure_date,
      final_closure_date,
      facultyId,
    } = createEventDto;
    // find faculty
    const faculty = await this.facultyService.findById(facultyId);
    if (!faculty) {
      throw new BadRequestException('Faculty not found');
    }
    // check if event already exists
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
    // create new event
    const newEvent = new this.eventModel({
      name,
      start_date,
      first_closure_date,
      final_closure_date,
      faculty: {
        _id: faculty._id,
        name: faculty.name,
      },
    });
    await newEvent.save();
    return newEvent;
  }

  async updateEvent(
    id: string,
    updateEventDto: UpdateEventDTO,
  ): Promise<Event> {
    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
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
