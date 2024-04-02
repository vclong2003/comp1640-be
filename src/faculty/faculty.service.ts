import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { Faculty } from './schemas/faculty.schema';
import { User } from 'src/user/schemas/user.schema';
import {
  CreateFacultyDto,
  FindFacultiesDto,
  FacultyResponseDto,
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

  async findFacultyById(id: string): Promise<FacultyResponseDto> {
    return this.facultyModel
      .findById(id)
      .select('_id name description banner_image_url mc')
      .exec();
  }

  async findFaculties(
    dto: FindFacultiesDto,
  ): Promise<Omit<FacultyResponseDto, 'description' | 'banner_image_url'>[]> {
    const { name, skip, limit } = dto;
    const query = {
      name: { $regex: name || '', $options: 'i' },
    };
    return this.facultyModel
      .find(query)
      .select('_id name mc')
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async createFaculty(
    dto: CreateFacultyDto,
    bannerImage?: Express.Multer.File,
  ): Promise<FacultyResponseDto> {
    const { name, description, mcId } = dto;

    // Find MC if id is provided
    let mc: HydratedDocument<User>;
    if (mcId) {
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
      if (mc.faculty) {
        await this.facultyModel.findByIdAndUpdate(mc.faculty._id, {
          mc: null,
        });
      }

      newFaculty.mc = {
        _id: mc._id,
        name: mc.name,
        email: mc.email,
        avatar_url: mc.avatar_url,
      };
      mc.faculty = { _id: newFaculty._id, name: newFaculty.name };
      await mc.save();
    }

    await newFaculty.save();
    return {
      _id: newFaculty._id,
      name: newFaculty.name,
      description: newFaculty.description,
      banner_image_url: newFaculty.banner_image_url,
      mc: newFaculty.mc,
    };
  }

  async updateFaculty(
    facultyId: string,
    dto: UpdateFacultyDto,
    bannerImage?: Express.Multer.File,
  ): Promise<FacultyResponseDto> {
    const { name, description, mcId } = dto;

    let mc: HydratedDocument<User>;
    if (mcId) {
      mc = await this.userModel.findById(mcId);
      if (mc.role != ERole.MarketingCoordinator) {
        throw new BadRequestException('Invalid mc');
      }
    }

    const faculty = await this.facultyModel.findById(facultyId);

    if (name) faculty.name = name;
    if (description) faculty.description = description;
    if (mc) {
      if (mc.faculty) {
        await this.facultyModel.findByIdAndUpdate(mc.faculty._id, {
          mc: null,
        });
      }

      faculty.mc = {
        _id: mc._id,
        name: mc.name,
        email: mc.email,
        avatar_url: mc.avatar_url,
      };
      mc.faculty = { _id: faculty._id, name: faculty.name };
      await mc.save();
    }
    // upload, remove and update banner image
    if (bannerImage) {
      if (faculty.banner_image_url) {
        await this.storageService.deletePublicFile(faculty.banner_image_url);
      }
      faculty.banner_image_url =
        await this.storageService.uploadPublicFile(bannerImage);
    }
    // update leated events
    await this.eventModel.updateMany(
      { _id: { $in: faculty.event_ids } },
      { faculty: { _id: faculty._id, name: faculty.name } },
    );
    // update related contributions
    await this.contributionModel.updateMany(
      { _id: { $in: faculty.contribution_ids } },
      { faculty: { _id: faculty._id, name: faculty.name } },
    );
    // update related students
    await this.userModel.updateMany(
      { _id: { $in: faculty.student_ids } },
      { faculty: { _id: faculty._id, name: faculty.name } },
    );

    await faculty.save();
    return {
      _id: faculty._id,
      name: faculty.name,
      description: faculty.description,
      banner_image_url: faculty.banner_image_url,
      mc: faculty.mc,
    };
  }

  async moveStudent(facultyId: string, studentId: string): Promise<void> {
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
    return;
  }

  async removeStudent(facultyId: string, studentId: string): Promise<void> {
    await this.facultyModel.findByIdAndUpdate(facultyId, {
      $pull: { student_ids: studentId },
    });
    await this.userModel.findByIdAndUpdate(studentId, {
      faculty: null,
    });
    return;
  }
}
