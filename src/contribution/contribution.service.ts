import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageService } from 'src/shared-modules/storage/storage.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contribution } from 'src/contribution/schemas/contribution.schema';
import { User } from 'src/user/schemas/user.schema';
import { Event } from 'src/event/schemas/event.schema';
import { Faculty } from 'src/faculty/schemas/faculty.schema';
import { AddCommentDto, CommentResponseDto } from './comment.dtos';
import { IAccessTokenPayload } from 'src/shared-modules/jwt/jwt.interfaces';
import { ERole } from 'src/user/user.enums';
import {
  AddContributionDto,
  AddContributionResponseDto,
  ContributionResponseDto,
  GetContributionsDto,
  NumberOfContributionsByFacultyPerYearDto,
  TotalNumberOfContributionByFacultyDto,
  UpdateContributionDto,
} from './contribution.dtos';
import { ContributionHelper } from './contribution.helper';

@Injectable()
export class ContributionService {
  constructor(
    @InjectModel('Contribution') private contributionModel: Model<Contribution>,
    @InjectModel('Event') private eventModel: Model<Event>,
    @InjectModel('Faculty') private facultyModel: Model<Faculty>,
    @InjectModel('User') private userModel: Model<User>,
    private strorageSerive: StorageService,
    private helper: ContributionHelper,
  ) {}

  // Add contribution ----------------------------------------------------------
  async addContribution(
    studentId: string,
    dto: AddContributionDto,
    files: {
      documents: Express.Multer.File[];
      images: Express.Multer.File[];
      bannerImage: Express.Multer.File[];
    },
  ): Promise<AddContributionResponseDto> {
    if (!files.documents || files.documents.length <= 0) {
      throw new BadRequestException("Document files can't be empty!");
    }

    const { eventId, title, description } = dto;

    const student = await this.userModel.findById(studentId);
    if (!student.faculty) {
      throw new BadRequestException("Student's faculty not found!");
    }
    const userFaculty = await this.facultyModel.findById(student.faculty._id);

    const event = await this.eventModel.findOne({
      _id: eventId,
      deleted_at: null,
    });
    if (!event) throw new BadRequestException('Event not found!');
    if (event.faculty._id.toString() !== userFaculty._id.toString()) {
      throw new BadRequestException(
        "Event's faculty doesn't match your faculty!",
      );
    }

    const contribution = new this.contributionModel({
      title,
      description,
      submitted_at: new Date(),
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
        _id: event.faculty._id,
        name: event.faculty.name,
      },
    });

    contribution.documents = await this.strorageSerive.uploadPrivateFiles(
      files.documents,
    );
    if (files.images.length > 0) {
      contribution.images = await this.strorageSerive.uploadPrivateFiles(
        files.images,
      );
    }
    if (files.bannerImage.length > 0) {
      contribution.banner_image_url =
        await this.strorageSerive.uploadPublicFile(files.bannerImage[0]);
    }

    await contribution.save();

    return {
      _id: contribution._id,
    };
  }

  // Update contribution -------------------------------------------------------
  async updateContribution(
    user: IAccessTokenPayload,
    contributionId: string,
    dto: UpdateContributionDto,
    files: {
      documents: Express.Multer.File[];
      images: Express.Multer.File[];
      bannerImage: Express.Multer.File[];
    },
  ): Promise<void> {
    const contribution = await this.contributionModel.findById(contributionId);
    if (!contribution) throw new BadRequestException('Contribution not found!');

    if (
      user.role === ERole.Student &&
      contribution.author._id.toString() !== user._id
    ) {
      throw new BadRequestException('Not your contribution!');
    }

    if (
      user.role === ERole.MarketingCoordinator &&
      user.facultyId.toString() !== contribution.faculty._id.toString()
    ) {
      throw new BadRequestException('Contribution not in your faculty!');
    }

    if (
      !this.checkContributionEditable(contribution.event.final_closure_date)
    ) {
      throw new BadRequestException('Contribution is not editable!');
    }

    const { title, description } = dto;

    if (title) contribution.title = title;
    if (description) contribution.description = description;

    if (files.bannerImage.length > 0) {
      // delete old banner image
      if (contribution.banner_image_url) {
        await this.strorageSerive.deletePublicFile(
          contribution.banner_image_url,
        );
      }
      // upload new banner image
      contribution.banner_image_url =
        await this.strorageSerive.uploadPublicFile(files.bannerImage[0]);
    }

    if (files.documents.length > 0) {
      const newDocuments = await this.strorageSerive.uploadPrivateFiles(
        files.documents,
      );
      contribution.documents = contribution.documents.concat(newDocuments);
    }

    if (files.images.length > 0) {
      const newImages = await this.strorageSerive.uploadPrivateFiles(
        files.images,
      );
      contribution.images = contribution.images.concat(newImages);
    }

    await contribution.save();
    return;
  }

  // Remove contribution file -------------------------------------------------
  async removeContributionFile(
    user: IAccessTokenPayload,
    contributionId: string,
    fileUrl: string,
  ): Promise<void> {
    const contribution = await this.contributionModel.findById(contributionId);
    if (!contribution) throw new BadRequestException('Contribution not found!');

    if (
      user.role === ERole.Student &&
      contribution.author._id.toString() !== user._id
    ) {
      throw new BadRequestException('Not your contribution!');
    }

    if (
      user.role === ERole.MarketingCoordinator &&
      user.facultyId.toString() !== contribution.faculty._id.toString()
    ) {
      throw new BadRequestException('Contribution not in your faculty!');
    }

    if (
      !this.checkContributionEditable(contribution.event.final_closure_date)
    ) {
      throw new BadRequestException('Contribution is not editable!');
    }

    await this.strorageSerive.deletePrivateFile(fileUrl);

    contribution.documents = contribution.documents.filter(
      (document) => document.file_url !== fileUrl,
    );
    contribution.images = contribution.images.filter(
      (image) => image.file_url !== fileUrl,
    );

    await contribution.save();
  }

  // Find contribution by id ---------------------------------------------------
  async findContributionById(
    contributionId: string,
    user: IAccessTokenPayload,
  ): Promise<ContributionResponseDto> {
    const contributions = await this.contributionModel.aggregate([
      {
        $match: {
          _id: this.helper.mongoId(contributionId),
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          banner_image_url: 1,
          submitted_at: 1,
          is_publication: 1,
          images: 1,
          documents: 1,
          author: 1,
          is_liked: {
            $in: [user._id, '$liked_user_ids'],
          },
          likes: { $size: '$liked_user_ids' },
          comments: { $size: '$comments' },
          private_comments: { $size: '$private_comments' },
          is_editable: {
            $cond: {
              if: {
                $gte: ['$event.final_closure_date', new Date()],
              },
              then: true,
              else: false,
            },
          },
        },
      },
    ]);

    if (contributions.length <= 0) return;
    const contribution = contributions[0];

    const images = await this.strorageSerive.getPrivateFilesUrls(
      contribution.images,
    );
    const documents = await this.strorageSerive.getPrivateFilesUrls(
      contribution.documents,
    );

    return this.helper.santinizeContribution(
      contribution,
      images,
      documents,
      contribution.is_editable,
      contribution.is_liked,
      contribution.likes,
      contribution.comments,
      contribution.private_comments,
    );
  }

  // Get contributions --------------------------------------------------------
  async getContributions(
    user: IAccessTokenPayload,
    dto: GetContributionsDto,
  ): Promise<Partial<ContributionResponseDto>[]> {
    const pipeline = this.helper.generateGetContributionsPipeline(dto);

    if (user) {
      pipeline.push({
        $project: {
          is_liked: {
            $in: [this.helper.mongoId(user._id), '$liked_user_ids'],
          },
        },
      });
    }

    const contributions = await this.contributionModel.aggregate(pipeline);
    return contributions;
  }

  // Find Contributions and download zip ---------------------------------------
  async zipContributions(
    dto: GetContributionsDto,
  ): Promise<NodeJS.ReadableStream> {
    const pipeline = this.helper.generateGetContributionsPipeline(dto);

    // Add images and documents to pipeline projection
    pipeline.push({
      $project: {
        images: 1,
        documents: 1,
      },
    });

    const contributions = await this.contributionModel.aggregate(pipeline);

    // Map each contribution to its folder
    const foldersAndFiles = contributions.map((contribution) => ({
      folder_name: contribution.title,
      files_url: [
        ...contribution.documents.map((file) => file.file_url),
        ...contribution.images.map((image) => image.file_url),
      ],
    }));

    return await this.strorageSerive.organizeAndZipFiles(foldersAndFiles);
  }

  // Find all comments --------------------------------------------------------
  async findAllComments(contributionId: string): Promise<CommentResponseDto[]> {
    const contribution = await this.contributionModel.findOne({
      _id: contributionId,
      deleted_at: null,
    });
    if (!contribution) throw new BadRequestException('Contribution not found!');

    return contribution.comments as CommentResponseDto[];
  }

  // Add comment --------------------------------------------------------------
  async addComment(
    userId,
    contributionId: string,
    dto: AddCommentDto,
  ): Promise<CommentResponseDto> {
    const { content } = dto;

    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    const comment = {
      content,
      posted_at: new Date(),
      author: {
        _id: user._id,
        avatar_url: user.avatar_url,
        name: user.name,
      },
    };

    const contribution = await this.contributionModel.findByIdAndUpdate(
      contributionId,
      { $push: { comments: comment } },
    );
    if (!contribution) throw new BadRequestException('Cotribution not found!');

    return comment as CommentResponseDto;
  }

  // Remove comment -----------------------------------------------------------
  async removeComment(
    userId,
    contributionId: string,
    commentId: string,
  ): Promise<void> {
    const contribution = await this.contributionModel.findById(contributionId);
    if (!contribution) throw new BadRequestException('Contribution not found!');

    const commentIndex = contribution.comments.findIndex(
      (comment) => comment._id.toString() === commentId,
    );
    if (commentIndex < 0) throw new BadRequestException('Comment not found!');

    if (contribution.comments[commentIndex].author._id.toString() !== userId) {
      throw new BadRequestException('Unauthorized!');
    }

    contribution.comments.splice(commentIndex, 1);
    await contribution.save();
    return;
  }

  // Find all private comments -------------------------------------------------
  async findAllPrivateComments(
    user: IAccessTokenPayload,
    contributionId: string,
  ): Promise<CommentResponseDto[]> {
    const contribution = await this.contributionModel.findOne({
      _id: contributionId,
      deleted_at: null,
    });
    if (!contribution) throw new BadRequestException('Contribution not found!');

    if (
      user.role === ERole.Student &&
      contribution.author._id.toString() !== user._id
    ) {
      throw new BadRequestException('Not your contribution!');
    }

    if (
      user.role === ERole.MarketingCoordinator &&
      user.facultyId.toString() !== contribution.faculty._id.toString()
    ) {
      throw new BadRequestException('Contribution not in your faculty!');
    }

    return contribution.private_comments as CommentResponseDto[];
  }

  // Add private comment -------------------------------------------------------
  async addPrivateComment(
    user: IAccessTokenPayload,
    contributionId: string,
    dto: AddCommentDto,
  ): Promise<CommentResponseDto> {
    const { content } = dto;
    const commentUser = await this.userModel.findById(user._id);
    if (!commentUser) throw new BadRequestException('User not found');

    const contribution = await this.contributionModel.findById(contributionId);
    if (!contribution) throw new BadRequestException('Cotribution not found!');

    if (
      user.role === ERole.Student &&
      contribution.author._id.toString() !== user._id
    ) {
      throw new BadRequestException('Not your contribution!');
    }

    if (
      user.role === ERole.MarketingCoordinator &&
      user.facultyId.toString() !== contribution.faculty._id.toString()
    ) {
      throw new BadRequestException('Contribution not in your faculty!');
    }

    const comment = {
      content,
      posted_at: new Date(),
      author: {
        _id: user._id,
        avatar_url: commentUser.avatar_url,
        name: commentUser.name,
      },
    };

    contribution.private_comments.push(comment);
    await contribution.save();

    return comment as CommentResponseDto;
  }

  // Remove private comment ----------------------------------------------------
  async removePrivateComment(
    user: IAccessTokenPayload,
    contributionId: string,
    commentId: string,
  ): Promise<void> {
    const contribution = await this.contributionModel.findById(contributionId);
    if (!contribution) throw new BadRequestException('Contribution not found!');

    if (
      user.role === ERole.Student &&
      contribution.author._id.toString() !== user._id
    ) {
      throw new BadRequestException('Not your contribution!');
    }

    if (
      user.role === ERole.MarketingCoordinator &&
      user.facultyId.toString() !== contribution.faculty._id.toString()
    ) {
      throw new BadRequestException('Contribution not in your faculty!');
    }

    const commentIndex = contribution.private_comments.findIndex(
      (comment) => comment._id.toString() === commentId,
    );
    if (commentIndex < 0) throw new BadRequestException('Comment not found!');
    if (
      contribution.private_comments[commentIndex].author._id.toString() !==
      user._id
    ) {
      throw new BadRequestException('Unauthorized!');
    }
    contribution.private_comments.splice(commentIndex, 1);
    await contribution.save();
    return;
  }

  // Like contribution ----------------------------------------------------------
  async likeContribution(
    userId: string,
    contributionId: string,
  ): Promise<void> {
    const contribution = await this.contributionModel.findById(contributionId);
    if (!contribution) throw new BadRequestException('Contribution not found!');

    if (contribution.liked_user_ids.includes(userId)) {
      throw new BadRequestException('Already liked!');
    }

    contribution.liked_user_ids.push(userId);
    await contribution.save();
    return;
  }

  // Remove contribution -------------------------------------------------------
  async removeContribution(
    user: IAccessTokenPayload,
    contributionId: string,
  ): Promise<void> {
    const contribution = await this.contributionModel.findById(contributionId);
    if (!contribution) throw new BadRequestException('Contribution not found!');

    if (user.role === ERole.Student && contribution.author._id !== user._id) {
      throw new BadRequestException('Not your contribution!');
    }
    if (
      user.role === ERole.MarketingCoordinator &&
      user.facultyId !== contribution.faculty._id
    ) {
      throw new BadRequestException('Contribution not in your faculty!');
    }

    contribution.deleted_at = new Date();
    await contribution.save();
    return;
  }

  // Get analytics -------------------------------------------------------------
  // number of contributions by faculty per selected month
  async yearlyAnalysis(
    year: number,
  ): Promise<NumberOfContributionsByFacultyPerYearDto[]> {
    const result = await this.contributionModel.aggregate([
      {
        $match: {
          deleted_at: null,
          submitted_at: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1),
          },
        },
      },
      {
        $group: {
          _id: {
            faculty: '$faculty._id',
            month: { $month: '$submitted_at' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          faculty: '$_id.faculty',
          month: '$_id.month',
          count: 1,
        },
      },
    ]);

    return result;
  }
  // total number of contributions by faculty
  async lifetimeAnalysis(): Promise<TotalNumberOfContributionByFacultyDto[]> {
    const result = await this.contributionModel.aggregate([
      {
        $match: {
          deleted_at: null,
        },
      },
      {
        $group: {
          _id: '$faculty._id',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          faculty: '$faculty.name',
          count: 1,
        },
      },
    ]);

    return result;
  }

  // Helper functions ---------------------------------------------------------
  checkContributionEditable(finalClosureDate: Date) {
    return finalClosureDate > new Date();
  }
}
