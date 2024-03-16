import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faculty } from '../shared-modules/database/schemas/faculty/faculty.schema';
import { User } from 'src/shared-modules/database/schemas/user/user.schema';
import {
  CreateFacultyDto,
  FindFacultiesDto,
  UpdateFacultyDto,
} from './faculty.dtos';
import { ERole } from 'src/user/user.enums';
import { Event } from 'src/shared-modules/database/schemas/event/event.schema';
import { Contribution } from 'src/shared-modules/database/schemas/contribution/contribution.schema';

@Injectable()
export class FacultyService {
  constructor(
    @InjectModel('Faculty') private facultyModel: Model<Faculty>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Event') private eventModel: Model<Event>,
    @InjectModel('Contribution') private contributionModel: Model<Contribution>,
  ) {}

  async findOneById(id: string): Promise<Faculty> {
    return this.facultyModel.findById(id).exec();
  }

  async findFaculties(dto: FindFacultiesDto): Promise<Faculty[]> {
    const { name, skip, limit } = dto;
    const query = {
      name: { $regex: name || '', $options: 'i' },
    };
    return this.facultyModel.find(query).skip(skip).limit(limit).exec();
  }

  async createFaculty(dto: CreateFacultyDto): Promise<Faculty> {
    const { name, mcId } = dto;
    let mcUser: User | null = null;
    if (mcId) {
      mcUser = await this.userModel.findById(mcId).exec();
      if (!mcUser || mcUser.role != ERole.MarketingCoordinator) {
        throw new BadRequestException('Invalid mc');
      }
    }
    const currentFaculty = await this.facultyModel
      .findOne({
        name: {
          $regex: name,
          $options: 'i',
        },
      })
      .exec();
    if (currentFaculty) {
      throw new BadRequestException('Faculty already exists');
    }
    const newFaculty = new this.facultyModel({
      name,
      mc: mcUser && { _id: mcUser._id, name: mcUser.name, email: mcUser.email },
    });
    await newFaculty.save();
    return newFaculty;
  }

  async updateFaculty(facultyId: string, dto: UpdateFacultyDto) {
    const { name, mcId } = dto;
    let mc: User | null = null;
    if (mcId) {
      mc = await this.userModel.findById(mcId).exec();
      if (mc.role != ERole.MarketingCoordinator) {
        throw new BadRequestException('Invalid mc');
      }
    }

    const updateData: Partial<Faculty> = {};
    if (name) updateData.name = name;
    if (mc)
      updateData.mc = {
        _id: mc._id,
        name: mc.name,
        email: mc.email,
        avatar_url: mc.avatar_url,
      };

    const faculty = await this.facultyModel.findByIdAndUpdate(
      facultyId,
      updateData,
      {
        new: true,
      },
    );

    await this.eventModel.updateMany(
      { _id: { $in: faculty.event_ids } },
      { faculty: { _id: faculty._id, name: faculty.name } },
    );

    await this.contributionModel.updateMany(
      { _id: { $in: faculty.contribution_ids } },
      { faculty: { _id: faculty._id, name: faculty.name } },
    );
  }

  async moveStudent(facultyId: string, studentId: string) {
    const student = await this.userModel.findById(studentId);
    if (student.role != ERole.Student) {
      throw new BadRequestException('Invalid student');
    }
    if (student.faculty) {
      await this.facultyModel.findByIdAndUpdate(student.faculty._id, {
        $pull: { student_ids: studentId },
      });
    }
    const faculty = await this.facultyModel.findByIdAndUpdate(
      facultyId,
      {
        $push: { student_ids: studentId },
      },
      { new: true },
    );
    student.faculty = { _id: faculty._id, name: faculty.name };
    await student.save();
  }

  async removeStudent(facultyId: string, studentId: string) {
    await this.facultyModel.findByIdAndUpdate(facultyId, {
      $pull: { student_ids: studentId },
    });
    await this.userModel.findByIdAndUpdate(studentId, {
      faculty: null,
    });
    return;
  }
}
