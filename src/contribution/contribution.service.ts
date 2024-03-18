import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageService } from 'src/shared-modules/storage/storage.service';
import { AddContributionDto } from './add-contribution.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
    if (files.documents.length <= 0) throw new BadRequestException(1);

    const { eventId, title, description } = dto;

    const student = await this.userModel.findById(studentId);
    if (!student.faculty) throw new BadRequestException(2);

    const faculty = await this.facultyModel.findById(student.faculty._id);

    const event = await this.eventModel.findById(eventId);
    console.log(event.faculty._id, faculty._id);
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

    await this.strorageSerive.uploadContributionDocuments(
      contribution._id,
      files.documents,
    );
    if (files.images.length > 0) {
      await this.strorageSerive.uploadContributionImages(
        contribution._id,
        files.images,
      );
    }
    await contribution.save();

    return { _id: contribution._id };
  }

  async getContributionById(contributionId: string) {
    const contribution = await this.contributionModel.findById(contributionId);
    const images =
      await this.strorageSerive.getContributionImages(contributionId);
    const documents =
      await this.strorageSerive.getContributionDocuments(contributionId);
    return {
      contribution,
      images,
      documents,
    };
  }
}
