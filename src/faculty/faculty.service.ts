import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { Faculty } from './schemas/faculty.schema';
import { User } from 'src/user/schemas/user.schema';
import {
  CreateFacultyDto,
  FindFacultiesDto,
  UpdateFacultyDto,
} from './faculty.dtos';
import { ERole } from 'src/user/user.enums';
import { Event } from 'src/event/schemas/event.schema';
import { Contribution } from 'src/contribution/schemas/contribution.schema';
import { StorageService } from 'src/shared-modules/storage/storage.service';

@Injectable()
export class FacultyService {
  constructor(
    @InjectModel('Faculty') private facultyModel: Model<Faculty>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Event') private eventModel: Model<Event>,
    @InjectModel('Contribution') private contributionModel: Model<Contribution>,
    private storageService: StorageService,
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

  async createFaculty(
    dto: CreateFacultyDto,
    bannerImage?: Express.Multer.File,
  ): Promise<Faculty> {
    const { name, description, mcId } = dto;

    // Find MC if id is provided
    let mc: HydratedDocument<User>;
    if (mc) {
      mc = await this.userModel.findById(mcId);
      if (!mc || mc.role != ERole.MarketingCoordinator) {
        throw new BadRequestException('Invalid mc!');
      }
    }

    const newFaculty = new this.facultyModel({ name, description });
    if (mc)
      newFaculty.mc = {
        _id: mc._id,
        name: mc.name,
        email: mc.email,
        avatar_url: mc.avatar_url,
      };

    if (bannerImage) {
      newFaculty.banner_image_url =
        await this.storageService.uploadPublicFile(bannerImage);
    }

    if (mc) {
      mc.faculty = { _id: newFaculty._id, name: newFaculty.name };
      await mc.save();
    }

    await newFaculty.save();
    return newFaculty;
  }

  async updateFaculty(facultyId: string, dto: UpdateFacultyDto) {
    const { name, mcId } = dto;

    let mc;
    if (mcId) {
      mc = await this.userModel.findById(mcId);
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

    if (mc) {
      mc.faculty = { _id: faculty._id, name: faculty.name };
      await mc.save();
    }

    await this.eventModel.updateMany(
      { _id: { $in: faculty.event_ids } },
      { faculty: { _id: faculty._id, name: faculty.name } },
    );

    await this.contributionModel.updateMany(
      { _id: { $in: faculty.contribution_ids } },
      { faculty: { _id: faculty._id, name: faculty.name } },
    );

    await this.userModel.updateMany(
      { _id: { $in: faculty.student_ids } },
      { faculty: { _id: faculty._id, name: faculty.name } },
    );

    return faculty;
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
