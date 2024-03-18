import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageService } from 'src/shared-modules/storage/storage.service';
import { AddContributionDto, FindContributionsDto } from './contribution.dtos';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
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

  async createNewContribution(
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

    contribution.documents =
      await this.strorageSerive.uploadContributionDocuments(files.documents);

    if (files.images.length > 0) {
      contribution.images = await this.strorageSerive.uploadContributionImages(
        files.images,
      );
    }

    await contribution.save();

    event.contribution_ids.push(contribution._id);
    await event.save();

    faculty.contribution_ids.push(contribution._id);
    await faculty.save();

    return { _id: contribution._id };
  }

  async getContributionById(contributionId: string) {
    const contribution = await this.contributionModel.findById(contributionId);
    const images = await this.strorageSerive.getContributionImages(
      contribution.images,
    );
    const documents = await this.strorageSerive.getContributionDocuments(
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

    const pipeLine = this.genFindContributionsPipeline({
      ...dto,
      facultyId: user.faculty._id,
    });

    const contributions = await this.contributionModel.aggregate(pipeLine);
    return contributions;
  }

  async getContributions(dto: FindContributionsDto) {
    const pipeLine = this.genFindContributionsPipeline(dto);
    const contributions = await this.contributionModel.aggregate(pipeLine);
    return contributions;
  }

  genFindContributionsPipeline(dto: FindContributionsDto): PipelineStage[] {
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
    if (eventId) match['event._id'] = eventId;
    if (authorId) match['author._id'] = authorId;
    if (authorName) {
      match['author.name'] = { $regex: authorName, $options: 'i' };
    }
    if (facultyId) match['faculty._id'] = facultyId;
    if (is_publication) match['is_publication'] = is_publication;

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

    return pipeLine;
  }
}
