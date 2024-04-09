import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { EventResponseDto } from 'src/event/event.dtos';
import { Event } from 'src/event/schemas/event.schema';
import { FacultyResponseDto } from 'src/faculty/faculty.dtos';
import { Faculty } from 'src/faculty/schemas/faculty.schema';

@Injectable()
export class UtilService {
  mongoId(id: string): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(id);
  }

  sanitizeFaculty(faculty: Faculty): FacultyResponseDto {
    return {
      _id: faculty._id,
      name: faculty.name,
      description: faculty.description,
      banner_image_url: faculty.banner_image_url,
      mc: faculty.mc,
    };
  }

  santinizeEvent(
    event: Event,
    is_accepting_new_contribution: boolean,
    is_contributions_editable: boolean,
    number_of_contributions: number,
  ): EventResponseDto {
    return {
      _id: event._id,
      name: event.name,
      description: event.description,
      banner_image_url: event.banner_image_url,
      start_date: event.start_date,
      first_closure_date: event.first_closure_date,
      final_closure_date: event.final_closure_date,
      is_accepting_new_contribution,
      is_contributions_editable,
      number_of_contributions,
      faculty: event.faculty,
    };
  }
}
