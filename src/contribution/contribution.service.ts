import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageService } from 'src/shared-modules/storage/storage.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contribution } from 'src/contribution/schemas/contribution.schema';
import { User } from 'src/user/schemas/user.schema';
import { Event } from 'src/event/schemas/event.schema';
import { AddCommentDto, CommentResponseDto } from './comment.dtos';
import { IAccessTokenPayload } from 'src/shared-modules/jwt/jwt.interfaces';
import { ERole } from 'src/user/user.enums';
import {
  AddContributionDto,
  AddContributionResponseDto,
  AvgContributionPerStudentDto,
  AvgContributionsPerEventDto,
  ContributionResponseDto,
  GetContributionsDto,
  NumberOfContributionsByFacultyPerYearDto,
  TotalNumberOfContributionByFacultyDto,
  UpdateContributionDto,
} from './contribution.dtos';
import { ContributionHelper } from './contribution.helper';
import { ConfigService } from '@nestjs/config';
import { MailerService } from 'src/shared-modules/mailer/mailer.service';
import { EClientConfigKeys } from 'src/config/client.config';

// student mail when publish contribution
// mm when published

@Injectable()
export class ContributionService {
  constructor(
    @InjectModel('Contribution') private contributionModel: Model<Contribution>,
    @InjectModel('Event') private eventModel: Model<Event>,
    @InjectModel('User') private userModel: Model<User>,
    private strorageSerive: StorageService,
    private helper: ContributionHelper,
    private configService: ConfigService,
    private mailerService: MailerService,
  ) {}

  // Add contribution ----------------------------------------------------------
  async addContribution(
    user: IAccessTokenPayload,
    dto: AddContributionDto,
    files: {
      documents: Express.Multer.File[];
      images: Express.Multer.File[];
      bannerImage: Express.Multer.File[];
    },
  ): Promise<AddContributionResponseDto> {
    this.helper.ensureUserHaveFaculty(user);
    this.helper.ensureFilesNotEmpty(files.documents);
    this.helper.ensureFilesNotEmpty(files.images);

    const { eventId, title, description } = dto;
    const student = await this.userModel.findById(user._id);
    const event = await this.eventModel.findOne({
      _id: eventId,
      deleted_at: null,
    });

    this.helper.ensureEventBelongsToUserFaculty(event, user);

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
    contribution.images = await this.strorageSerive.uploadPrivateFiles(
      files.images,
    );
    if (files?.bannerImage && files.bannerImage.length > 0) {
      const resizedBannerImage = await this.strorageSerive.resizeImage(
        files.bannerImage[0],
        1400,
      );
      contribution.banner_image_url =
        await this.strorageSerive.uploadPublicFile(resizedBannerImage);
    }
    await contribution.save();

    const clientUrl = await this.configService.get(EClientConfigKeys.Url);
    const contributionUrl = `${clientUrl}/contribution/${contribution._id}`;
    if (event?.faculty?.mc) {
      this.mailerService.sendNewContributionEmail({
        mcEmail: event.faculty.mc.email,
        mcName: event.faculty.mc.name,
        studentName: student.name,
        contributionUrl,
      });
    }

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
    this.helper.ensureUserHaveFaculty(user);

    const contribution = await this.contributionModel.findById(contributionId);
    if (user.role === ERole.Student) {
      this.helper.ensureContributionOwnership(contribution, user);
    }
    if (user.role === ERole.MarketingCoordinator) {
      this.helper.ensureContributionMcOwnership(contribution, user);
    }
    this.helper.ensureContributionEditability(contribution);

    const { title, description } = dto;
    if (title) contribution.title = title;
    if (description) contribution.description = description;

    if (files.bannerImage && files.bannerImage.length > 0) {
      // delete old banner image
      if (contribution.banner_image_url) {
        await this.strorageSerive.deletePublicFile(
          contribution.banner_image_url,
        );
      }
      // upload new banner image
      const resizedBannerImage = await this.strorageSerive.resizeImage(
        files.bannerImage[0],
        1400,
      );
      contribution.banner_image_url =
        await this.strorageSerive.uploadPublicFile(resizedBannerImage);
    }

    if (files.documents && files.documents.length > 0) {
      const newDocuments = await this.strorageSerive.uploadPrivateFiles(
        files.documents,
      );
      contribution.documents = contribution.documents.concat(newDocuments);
    }

    if (files.images && files.images.length > 0) {
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

    if (user.role === ERole.Student) {
      this.helper.ensureContributionOwnership(contribution, user);
    }

    if (user.role === ERole.MarketingCoordinator) {
      this.helper.ensureContributionMcOwnership(contribution, user);
    }

    this.helper.ensureContributionEditability(contribution);

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
    user: IAccessTokenPayload,
    contributionId: string,
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

    if (contributions.length <= 0) {
      throw new BadRequestException('Contribution not found!');
    }
    const contribution = contributions[0];

    if (
      contribution.is_publication &&
      (user.role === ERole.Student || user.role === ERole.Guest)
    ) {
      this.helper.ensureEventBelongsToUserFaculty(contribution, user);
    } else {
      if (user.role === ERole.Guest) {
        throw new BadRequestException('Contribution is not public!');
      }
      if (user.role === ERole.Student) {
        this.helper.ensureContributionMcOwnership(contribution, user);
      }
    }

    if (user.role === ERole.MarketingCoordinator) {
      this.helper.ensureContributionMcOwnership(contribution, user);
    }

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
    let pipeline;

    if (user.role === ERole.Admin || user.role === ERole.MarketingManager) {
      pipeline = this.helper.generateGetContributionsPipeline(dto, user);
    } else {
      // If user is student, mc or guest, show only  contributions of their faculty
      this.helper.ensureUserHaveFaculty(user);
      pipeline = this.helper.generateGetContributionsPipeline(
        { ...dto, facultyId: user.facultyId },
        user,
      );
    }

    const contributions = await this.contributionModel.aggregate(pipeline);
    return contributions;
  }

  // Find Contributions and download zip ---------------------------------------
  async zipContributions(
    dto: GetContributionsDto,
  ): Promise<NodeJS.ReadableStream> {
    const { facultyId, eventId } = dto;
    if (!facultyId && !eventId) {
      throw new BadRequestException('Filter is too broad!');
    }

    const pipeline = this.helper.generateGetContributionsPipeline(dto);
    const contributions = await this.contributionModel.aggregate(pipeline);

    // Map each contribution to its folder
    const foldersAndFiles = contributions.map((contribution) => ({
      folder_name: `${contribution.title}_${contribution._id}`,
      files_url: [
        ...contribution.documents.map((file) => file.file_url),
        ...contribution.images.map((image) => image.file_url),
      ],
    }));

    return await this.strorageSerive.organizeAndZipFiles(foldersAndFiles);
  }

  // Publish contribution -------------------------------------------------------
  async publishContribution(
    user: IAccessTokenPayload,
    contributionId: string,
  ): Promise<void> {
    this.helper.ensureUserHaveFaculty(user);

    const contribution = await this.contributionModel.findById(contributionId);
    this.helper.ensureContributionMcOwnership(contribution, user);

    contribution.is_publication = true;
    await contribution.save();
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
    user: IAccessTokenPayload,
    contributionId: string,
    dto: AddCommentDto,
  ): Promise<CommentResponseDto> {
    const { content } = dto;

    const userInfo = await this.userModel.findById(user._id);

    const comment = {
      content,
      posted_at: new Date(),
      author: {
        _id: userInfo._id,
        avatar_url: userInfo.avatar_url,
        name: userInfo.name,
      },
    };
    await this.contributionModel.findByIdAndUpdate(contributionId, {
      $push: { comments: comment },
    });

    return comment as CommentResponseDto;
  }

  // Remove comment -----------------------------------------------------------
  async removeComment(
    user: IAccessTokenPayload,
    contributionId: string,
    commentId: string,
  ): Promise<void> {
    const contribution = await this.contributionModel.findById(contributionId);

    const commentIndex = contribution.comments.findIndex(
      (comment) => comment._id.toString() === commentId,
    );
    if (commentIndex < 0) throw new BadRequestException('Comment not found!');

    this.helper.ensureCommentOwnership(
      contribution.comments[commentIndex],
      user,
    );

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
    });

    if (user.role === ERole.Student) {
      this.helper.ensureContributionOwnership(contribution, user);
    }

    if (user.role === ERole.MarketingCoordinator) {
      this.helper.ensureContributionMcOwnership;
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
    const contribution = await this.contributionModel.findById(contributionId);

    if (user.role === ERole.Student) {
      this.helper.ensureContributionOwnership(contribution, user);
    }
    if (user.role === ERole.MarketingCoordinator) {
      this.helper.ensureContributionMcOwnership(contribution, user);
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

    if (user.role === ERole.Student) {
      this.helper.ensureContributionOwnership(contribution, user);
    }

    if (user.role === ERole.MarketingCoordinator) {
      this.helper.ensureContributionMcOwnership(contribution, user);
    }

    const commentIndex = contribution.private_comments.findIndex(
      (comment) => comment._id.toString() === commentId,
    );
    if (commentIndex < 0) throw new BadRequestException('Comment not found!');
    this.helper.ensureCommentOwnership(
      contribution.private_comments[commentIndex],
      user,
    );
    contribution.private_comments.splice(commentIndex, 1);
    await contribution.save();
    return;
  }

  // Like contribution ----------------------------------------------------------
  async likeContribution(
    user: IAccessTokenPayload,
    contributionId: string,
  ): Promise<void> {
    const contribution = await this.contributionModel.findById(contributionId);
    if (contribution.liked_user_ids.includes(user._id)) return;
    contribution.liked_user_ids.push(user._id);
    await contribution.save();
    return;
  }

  // Remove contribution -------------------------------------------------------
  async removeContribution(
    user: IAccessTokenPayload,
    contributionId: string,
  ): Promise<void> {
    const contribution = await this.contributionModel.findById(contributionId);

    if (user.role === ERole.Student) {
      this.helper.ensureContributionMcOwnership(contribution, user);
    }
    if (user.role === ERole.MarketingCoordinator) {
      this.helper.ensureContributionMcOwnership(contribution, user);
    }

    contribution.deleted_at = new Date();
    await contribution.save();
    return;
  }

  // Get analytics -------------------------------------------------------------
  async yearlyAnalysis(
    year: number,
  ): Promise<NumberOfContributionsByFacultyPerYearDto[]> {
    const result = await this.contributionModel.aggregate([
      {
        $match: {
          deleted_at: null,
          submitted_at: {
            $gte: new Date(Number(year), 0, 1),
            $lt: new Date(Number(year) + 1, 0, 1),
          },
        },
      },
      {
        $group: {
          _id: '$faculty._id',
          faculty: { $first: '$faculty.name' },
          data: {
            $push: {
              month: { $month: '$submitted_at' },
              contributions: 1,
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          faculty: 1,
          data: {
            $map: {
              input: { $range: [1, 13] },
              as: 'month',
              in: {
                month: '$$month',
                contributions: {
                  $size: {
                    $filter: {
                      input: '$data',
                      as: 'item',
                      cond: { $eq: ['$$item.month', '$$month'] },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ]);

    return result;
  }
  async lifetimeAnalysis(): Promise<TotalNumberOfContributionByFacultyDto[]> {
    const result = await this.contributionModel.aggregate([
      {
        $group: {
          _id: '$faculty._id',
          faculty: { $first: '$faculty.name' },
          published: {
            $sum: {
              $cond: [{ $eq: ['$is_publication', true] }, 1, 0],
            },
          },
          not_published: {
            $sum: {
              $cond: [{ $ne: ['$is_publication', true] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          faculty: 1,
          published: 1,
          not_published: 1,
        },
      },
    ]);

    return result;
  }
  async avgContributionsPerStudent(): Promise<AvgContributionPerStudentDto[]> {
    const result = await this.contributionModel.aggregate([
      {
        // lookup embed students of faculty in each contribution
        $lookup: {
          from: 'users',
          localField: 'faculty._id',
          foreignField: 'faculty._id',
          as: 'studentsPerFaculty',
          pipeline: [
            {
              $match: {
                role: 'student',
              },
            },
          ],
        },
      },
      {
        // group contribution by faculty
        $group: {
          _id: '$faculty._id',
          faculty: { $first: '$faculty.name' },
          totalContributions: { $sum: 1 },
          // count students in the first contribution in group (since they are same)
          totalStudents: { $first: { $size: '$studentsPerFaculty' } },
        },
      },
      {
        $project: {
          faculty: 1,
          avg: {
            $divide: ['$totalContributions', '$totalStudents'],
          },
        },
      },
    ]);

    return result;
  }
  async avgContributionsPerEvent(): Promise<AvgContributionsPerEventDto[]> {
    const result = await this.contributionModel.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'faculty._id',
          foreignField: 'faculty._id',
          as: 'eventsPerFaculty',
          pipeline: [
            {
              $match: {
                deleted_at: null,
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: '$faculty._id',
          faculty: { $first: '$faculty.name' },
          totalContributions: { $sum: 1 },
          totalEvents: { $first: { $size: '$eventsPerFaculty' } },
        },
      },
      {
        $project: {
          _id: 0,
          faculty: 1,
          avg: {
            $divide: ['$totalContributions', '$totalEvents'],
          },
        },
      },
    ]);

    return result;
  }
}
