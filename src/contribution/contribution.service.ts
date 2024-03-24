import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageService } from 'src/shared-modules/storage/storage.service';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PipelineStage } from 'mongoose';
import { Contribution } from 'src/contribution/schemas/contribution.schema';
import { User } from 'src/user/schemas/user.schema';
import { Event } from 'src/event/schemas/event.schema';
import { Faculty } from 'src/faculty/schemas/faculty.schema';
import { AddContributionDto } from './dtos/add-contribution.dto';
import { FindContributionsDto } from './dtos/find-contributions.dto';
import {
  AddContributionResponseDto,
  ContributionResponseDto,
  ContributionsResponseDto,
} from './dtos/contribution-res.dtos';

@Injectable()
export class ContributionService {
  constructor(
    @InjectModel('Contribution') private contributionModel: Model<Contribution>,
    @InjectModel('Event') private eventModel: Model<Event>,
    @InjectModel('Faculty') private facultyModel: Model<Faculty>,
    @InjectModel('User') private userModel: Model<User>,
    private strorageSerive: StorageService,
  ) {}

  async addContribution(
    studentId: string,
    dto: AddContributionDto,
    files: { documents: Express.Multer.File[]; images: Express.Multer.File[] },
  ): Promise<AddContributionResponseDto> {
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
        final_closure_date: event.final_closure_date,
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
    return {
      _id: contribution._id,
    };
  }

  async findContributionById(
    contributionId: string,
  ): Promise<ContributionResponseDto> {
    const contribution = await this.contributionModel.findById(contributionId);
    const images = await this.strorageSerive.getPrivateFilesUrls(
      contribution.images,
    );
    const documents = await this.strorageSerive.getPrivateFilesUrls(
      contribution.documents,
    );
    return {
      _id: contribution._id,
      title: contribution.title,
      description: contribution.description,
      banner_image_url: contribution.banner_image_url,
      submitted_at: contribution.submitted_at,
      is_publication: contribution.is_publication,
      is_editable: this.checkContributionEditable(
        contribution.event.final_closure_date,
      ),
      author: contribution.author,
      faculty: contribution.faculty,
      event: contribution.event,
      documents,
      images,
    };
  }

  async findContributions(
    dto: FindContributionsDto,
  ): Promise<ContributionsResponseDto[]> {
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
    if (eventId && !facultyId) {
      const event = await this.eventModel.findById(eventId);
      if (!event) throw new BadRequestException(1);
      match['_id'] = {
        $in: event.contribution_ids.map(
          (id) => new mongoose.Types.ObjectId(id),
        ),
      };
    }
    if (facultyId) {
      const faculty = await this.facultyModel.findById(facultyId);
      if (!faculty) throw new BadRequestException(2);
      match['_id'] = {
        $in: faculty.contribution_ids.map(
          (id) => new mongoose.Types.ObjectId(id),
        ),
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

    const contributions = await this.contributionModel.aggregate(pipeLine);
    return contributions;
  }

  // async addComment(userId, dto: AddCommentDto): Promise<CommentResponseDto> {
  //   const { contributionId, content } = dto;
  //   const contribution = await this.contributionModel.findById(contributionId);
  //   if (!contribution) throw new BadRequestException('Contribution not found');

  //   const user = await this.userModel.findById(userId);
  //   if (!user) throw new BadRequestException('User not found');

  //   const comment = {
  //     content,
  //     posted_at: new Date(),
  //     author: {
  //       _id: user._id,
  //       avatar_url: user.avatar_url,
  //       name: user.name,
  //     },
  //   };

  //   contribution.comments.push();
  // }

  checkContributionEditable(finalClosureDate: Date) {
    return finalClosureDate > new Date();
  }
}
