import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';

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
}
