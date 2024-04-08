import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
import { UtilService } from 'src/shared-modules/util/util.service';

@Injectable()
export class FacultyService {
  constructor(
    @InjectModel('Faculty') private facultyModel: Model<Faculty>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Event') private eventModel: Model<Event>,
    @InjectModel('Contribution') private contributionModel: Model<Contribution>,
    private utilService: UtilService,
    private storageService: StorageService,
  ) {}

  // Find faculty by id ----------------------------------------------------
  async findFacultyById(id: string): Promise<FacultyResponseDto> {
    const faculties = await this.facultyModel.aggregate([
      {
        $match: {
          _id: this.utilService.mongoId(id),
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          banner_image_url: 1,
          mc: 1,
        },
      },
    ]);
    if (faculties.length === 0) return;
    return this.utilService.sanitizeFaculty(faculties[0]);
  }

  // Find faculties ---------------------------------------------------------
  async findFaculties(dto: FindFacultiesDto): Promise<FacultyResponseDto[]> {
    const { name, skip, limit } = dto;

    const faculties = await this.facultyModel.aggregate([
      {
        $match: {
          name: { $regex: name || '', $options: 'i' },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          banner_image_url: 1,
          mc: 1,
        },
      },
      { $skip: skip || 0 },
      { $limit: limit || 100 },
    ]);

    return faculties.map((faculty) =>
      this.utilService.sanitizeFaculty(faculty),
    );
  }

  // Create faculty ---------------------------------------------------------
  async createFaculty(
    dto: CreateFacultyDto,
    bannerImage?: Express.Multer.File,
  ): Promise<FacultyResponseDto> {
    const { name, description } = dto;
    const newFaculty = new this.facultyModel({ name, description });

    // Upload banner image
    if (bannerImage) {
      newFaculty.banner_image_url =
        await this.storageService.uploadPublicFile(bannerImage);
    }

    await newFaculty.save();
    return this.utilService.sanitizeFaculty(newFaculty);
  }

  // Update faculty ---------------------------------------------------------
  async updateFaculty(
    facultyId: string,
    dto: UpdateFacultyDto,
    bannerImage?: Express.Multer.File,
  ): Promise<FacultyResponseDto> {
    const { name, description, mcId } = dto;

    // Check MC
    let mc;
    if (mcId) {
      mc = await this.userModel.findById(mcId);
      if (mc.role !== ERole.MarketingCoordinator) {
        throw new BadRequestException('Invalid mc');
      }
    }

    const faculty = await this.facultyModel.findOne({
      _id: facultyId,
    });

    if (name) faculty.name = name;
    if (description) faculty.description = description;
    if (mc) {
      // If mc already exists in another faculty, remove it
      const otherFaculties = await this.facultyModel.find({
        _id: { $ne: facultyId },
        'mc._id': mc._id,
      });
      await Promise.all(
        otherFaculties.map(async (f) => {
          f.mc = null;
          await f.save();
        }),
      );

      faculty.mc = {
        _id: mc._id,
        name: mc.name,
        email: mc.email,
        avatar_url: mc.avatar_url,
      };
    }

    if (bannerImage) {
      // Delete old banner image
      if (faculty.banner_image_url) {
        await this.storageService.deletePublicFile(faculty.banner_image_url);
      }
      // Upload new banner image
      faculty.banner_image_url =
        await this.storageService.uploadPublicFile(bannerImage);
    }

    await faculty.save();
    return this.utilService.sanitizeFaculty(faculty);
  }

  // Remove faculty --------------------------------------------------------
  async removeFaculty(facultyId: string): Promise<void> {
    const faculty = await this.facultyModel.findById(facultyId);
    faculty.deleted_at = new Date();
    await faculty.save();
  }
}
