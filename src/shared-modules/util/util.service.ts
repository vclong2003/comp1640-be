import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { ContributionResponseDto } from 'src/contribution/contribution.dtos';
import { Contribution } from 'src/contribution/schemas/contribution.schema';
import { EventResponseDto } from 'src/event/event.dtos';
import { Event } from 'src/event/schemas/event.schema';
import { FacultyResponseDto } from 'src/faculty/faculty.dtos';
import { Faculty } from 'src/faculty/schemas/faculty.schema';
import { User } from 'src/user/schemas/user.schema';
import { UserResponseDto } from 'src/user/user.dtos';
import { FileDto } from '../storage/storage.dtos';

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
    };
  }

  sanitizeFaculty(faculty: Faculty): FacultyResponseDto {
    return {
      _id: faculty._id,
      name: faculty.name,
      description: faculty.description,
      banner_image_url: faculty.banner_image_url,
      mc: {
        _id: faculty.mc._id,
        name: faculty.mc.name,
        email: faculty.mc.email,
      },
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
      faculty: {
        _id: event.faculty._id,
        name: event.faculty.name,
        mc: {
          _id: event.faculty.mc._id,
          name: event.faculty.mc.name,
          email: event.faculty.mc.email,
        },
      },
    };
  }

  santinizeContribution(
    contribution: Contribution,
    images: FileDto[],
    documents: FileDto[],
    is_editable: boolean,
    is_liked: boolean,
    likes: number,
    comments: number,
    private_comments: number,
  ): ContributionResponseDto {
    return {
      _id: contribution._id,
      title: contribution.title,
      description: contribution.description,
      banner_image_url: contribution.banner_image_url,
      submitted_at: contribution.submitted_at,
      is_publication: contribution.is_publication,
      author: contribution.author,
      faculty: contribution.faculty,
      event: contribution.event,
      documents,
      images,
      is_editable,
      is_liked,
      likes,
      comments,
      private_comments,
    };
  }
}
