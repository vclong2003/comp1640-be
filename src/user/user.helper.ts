import { Injectable } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { FindUsersDto, UserResponseDto } from './user.dtos';
import mongoose, { PipelineStage } from 'mongoose';

@Injectable()
export class UserHelper {
  // Mongo Id -----------------------------------------------------------
  mongoId(id: string): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(id);
  }

  // Sanitize user ------------------------------------------------------
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

  // Generate find users pipeline ----------------------------------------
  generateFindUsersPipeline(dto: FindUsersDto): PipelineStage[] {
    const { name, role, email, facultyId, skip, limit } = dto;

    const match = {};
    if (name) match['name'] = { $regex: name, $options: 'i' };
    if (role) match['role'] = role;
    if (email) match['email'] = { $regex: email, $options: 'i' };
    if (facultyId) match['faculty._id'] = this.mongoId(facultyId);

    const project = {
      _id: 1,
      email: 1,
      name: 1,
      avatar_url: 1,
      phone: 1,
      dob: 1,
      faculty: 1,
      gender: 1,
      role: 1,
      disabled: 1,
    };

    const pipeline = [];
    pipeline.push({ $match: match });
    pipeline.push({ $project: project });
    if (skip) pipeline.push({ $skip: skip });
    if (limit) pipeline.push({ $limit: limit });

    return pipeline;
  }
}
