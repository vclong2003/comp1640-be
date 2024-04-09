import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { EventResponseDto } from 'src/event/event.dtos';
import { Event } from 'src/event/schemas/event.schema';
import { FacultyResponseDto } from 'src/faculty/faculty.dtos';
import { Faculty } from 'src/faculty/schemas/faculty.schema';
import { User } from 'src/user/schemas/user.schema';
import { UserResponseDto } from 'src/user/user.dtos';

@Injectable()
export class UtilService {
  mongoId(id: string): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(id);
  }

  sanitizeUser(user: User): UserResponseDto {
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      phone: user.phone,
      dob: user.dob,
      gender: user.gender,
      role: user.role,
      disabled: user.disabled,
      faculty: user.faculty,
    };
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
