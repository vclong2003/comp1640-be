import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageService } from 'src/shared-modules/storage/storage.service';
import { AddContributionDto, FindContributionsDto } from './contribution.dtos';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PipelineStage } from 'mongoose';
import { Contribution } from 'src/contribution/schemas/contribution.schema';
import { User } from 'src/user/schemas/user.schema';
import { Event } from 'src/event/schemas/event.schema';
import { Faculty } from 'src/faculty/schemas/faculty.schema';

@Injectable()
export class ContributionService {
  constructor(
    @InjectModel('Contribution') private contributionModel: Model<Contribution>,
    @InjectModel('Event') private eventModel: Model<Event>,
    @InjectModel('Faculty') private facultyModel: Model<Faculty>,
    @InjectModel('User') private userModel: Model<User>,
    private strorageSerive: StorageService,
  ) {}

  async createContribution(
    studentId: string,
    dto: AddContributionDto,
    files: { documents: Express.Multer.File[]; images: Express.Multer.File[] },
  ) {
    if (!files.documents || files.documents.length <= 0) {
      throw new BadRequestException(1);
    }

    const { eventId, title, description } = dto;

    const student = await this.userModel.findById(studentId);
    if (!student.faculty) throw new BadRequestException(2);

    const faculty = await this.facultyModel.findById(student.faculty._id);

    const event = await this.eventModel.findById(eventId);
    if (event.faculty._id.toString() !== faculty._id.toString()) {
      throw new BadRequestException(3);
    }

    const contribution = new this.contributionModel({
      title,
      description,
      author: {
        _id: student._id,
        name: student.name,
        avatar_url: student.avatar_url,
        email: student.email,
      },
      event: {
        _id: event._id,
        name: event.name,
      },
      faculty: {
        _id: faculty._id,
        name: faculty.name,
      },
    });

    event.contribution_ids.push(contribution._id);
    await event.save();

    faculty.contribution_ids.push(contribution._id);
    await faculty.save();

    contribution.documents = await this.strorageSerive.uploadPrivateFiles(
      files.documents,
    );
    if (files.images.length > 0) {
      contribution.images = await this.strorageSerive.uploadPrivateFiles(
        files.images,
      );
    }

    await contribution.save();
    return { _id: contribution._id };
  }

  async getContributionById(contributionId: string) {
    const contribution = await this.contributionModel.findById(contributionId);
    const images = await this.strorageSerive.getPrivateFilesUrls(
      contribution.images,
    );
    const documents = await this.strorageSerive.getPrivateFilesUrls(
      contribution.documents,
    );
    return {
      contribution,
      images,
      documents,
    };
  }

  async getContributionsByUserFaculty(
    userId: string,
    dto: FindContributionsDto,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user.faculty) throw new BadRequestException(1);

    const pipeLine = await this.genFindContributionsPipeline({
      ...dto,
      facultyId: user.faculty._id,
    });

    const contributions = await this.contributionModel.aggregate(pipeLine);
    return contributions;
  }

  async getContributions(dto: FindContributionsDto) {
    const pipeLine = await this.genFindContributionsPipeline(dto);
    const contributions = await this.contributionModel.aggregate(pipeLine);
    return contributions;
  }

  async genFindContributionsPipeline(
    dto: FindContributionsDto,
  ): Promise<PipelineStage[]> {
    const {
      title,
      eventId,
      authorId,
      authorName,
      facultyId,
      is_publication,
      limit,
      skip,
    } = dto;

    const pipeLine: PipelineStage[] = [];

    const match = {};
    if (title) match['title'] = { $regex: title, $options: 'i' };
    if (authorId) match['author._id'] = authorId;
    if (authorName) {
      match['author.name'] = { $regex: authorName, $options: 'i' };
    }
    if (is_publication) match['is_publication'] = is_publication;

    const event_contribution_ids = [];
    const faculty_contribution_ids = [];
    if (eventId) {
      const event = await this.eventModel.findById(eventId);
      if (!event) throw new BadRequestException(1);
      event_contribution_ids.push(event.contribution_ids);
    }
    if (facultyId) {
      const faculty = await this.facultyModel.findById(facultyId);
      if (!faculty) throw new BadRequestException(2);
      faculty_contribution_ids.push(faculty.contribution_ids);
    }
    const join_ids = new Set<string>();
    event_contribution_ids.forEach((id) => join_ids.add(id.toString()));
    faculty_contribution_ids.forEach((id) => join_ids.add(id.toString()));

    if (join_ids.size > 0) {
      match['_id'] = {
        $in: Array.from(join_ids).map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    const projection = {
      _id: 1,
      title: 1,
      author: 1,
      submitted_at: 1,
      faculty: 1,
      event: 1,
    };

    pipeLine.push({ $match: match });
    pipeLine.push({ $project: projection });
    if (limit) pipeLine.push({ $limit: limit });
    if (skip) pipeLine.push({ $skip: skip });
    console.log(pipeLine);
    return pipeLine;
  }
}
