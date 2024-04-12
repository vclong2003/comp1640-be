import { BadRequestException, Injectable } from '@nestjs/common';
import { Contribution } from './schemas/contribution.schema';
import { FileDto } from 'src/shared-modules/storage/storage.dtos';
import {
  ContributionResponseDto,
  GetContributionsDto,
} from './contribution.dtos';
import mongoose, { PipelineStage } from 'mongoose';
import { IAccessTokenPayload } from 'src/shared-modules/jwt/jwt.interfaces';
import { Event } from 'src/event/schemas/event.schema';
import { Comment } from './schemas/contribution-comment/comment.schema';

@Injectable()
export class ContributionHelper {
  // Get mongo id --------------------------------------------------------------
  mongoId(id: string): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(id);
  }

  // Sanitize contribution -----------------------------------------------------
  santinizeContribution(
    contribution: Contribution,
    images: FileDto[],
    documents: FileDto[],
    is_editable: boolean,
    is_liked: boolean,
    likes: number,
    comments: number,
    private_comments: number,
  ): ContributionResponseDto {
    return {
      _id: contribution._id,
      title: contribution.title,
      description: contribution.description,
      banner_image_url: contribution.banner_image_url,
      submitted_at: contribution.submitted_at,
      is_publication: contribution.is_publication,
      author: contribution.author,
      faculty: contribution.faculty,
      event: contribution.event,
      documents,
      images,
      is_editable,
      is_liked,
      likes,
      comments,
      private_comments,
    };
  }

  // Ensure contribution is public ---------------------------------------------
  ensureContributionIsPublic(contribution: Contribution): void {
    if (!contribution.is_publication) {
      throw new BadRequestException('Contribution is not public');
    }
  }

  // Ensure files array is not empty -------------------------------------------
  ensureFilesNotEmpty(files: Express.Multer.File[]): void {
    if (!files || files.length <= 0) {
      throw new BadRequestException(
        'Contribution must have atleast 1 image and document',
      );
    }
  }

  // Ensure user have faculty ---------------------------------------------------
  ensureUserHaveFaculty(user: IAccessTokenPayload): void {
    if (!user.facultyId) {
      throw new BadRequestException('You dont belong to any faculty');
    }
  }

  // Ensure event ownership ----------------------------------------------------
  ensureEventBelongsToUserFaculty(
    event: Event,
    user: IAccessTokenPayload,
  ): void {
    if (event.faculty._id.toString() !== user.facultyId) {
      throw new BadRequestException('Event not in your faculty');
    }
  }

  // Ensure contribution ownership ---------------------------------------------
  ensureContributionOwnership(
    contribution: Contribution,
    user: IAccessTokenPayload,
  ): void {
    if (contribution.author._id.toString() !== user._id) {
      throw new BadRequestException(
        'You are not the owner of this contribution',
      );
    }
  }

  // Ensure contribution MC ownership ------------------------------------------
  ensureContributionMcOwnership(
    contribution: Contribution,
    user: IAccessTokenPayload,
  ): void {
    if (contribution.faculty._id.toString() !== user.facultyId) {
      throw new BadRequestException('You are not the MC of this faculty');
    }
  }

  // Ensure contribution editability -------------------------------------------
  ensureContributionEditability(contribution: Contribution): void {
    if (
      !this.checkContributionEditable(contribution.event.final_closure_date)
    ) {
      throw new BadRequestException('Contribution is not editable');
    }
  }

  // Ensure comment ownership --------------------------------------------------
  ensureCommentOwnership(comment: Comment, user: IAccessTokenPayload) {
    if (comment.author._id.toString() !== user._id) {
      throw new BadRequestException('You are not the owner of this comment');
    }
  }

  // Check contribution editability -------------------------------------------
  checkContributionEditable(finalClosureDate: Date): boolean {
    return finalClosureDate > new Date();
  }

  // Generate get contributions pipeline -----------------------------------------
  generateGetContributionsPipeline(
    dto: GetContributionsDto,
    user?: IAccessTokenPayload,
  ): PipelineStage[] {
    const {
      title,
      authorId,
      authorName,
      facultyId,
      is_publication,
      limit,
      skip,
      has_private_comments,
      eventId,
      popular,
    } = dto;
    const pipeline: PipelineStage[] = [];

    // Match conditions
    const match = {};
    if (title) match['title'] = { $regex: title, $options: 'i' };
    if (authorId) match['author._id'] = this.mongoId(authorId);
    if (authorName) {
      match['author.name'] = { $regex: authorName, $options: 'i' };
    }
    if (has_private_comments) {
      match['private_comments'] = { $exists: true, $ne: [] };
    }
    if (eventId) match['event._id'] = this.mongoId(eventId);
    if (facultyId) match['faculty._id'] = this.mongoId(facultyId);
    if (is_publication) {
      if (/true/.test(is_publication) === true) match['is_publication'] = true;
      if (/false/.test(is_publication) === true)
        match['is_publication'] = false;
    }
    if (popular) match['is_publication'] = true;

    const projection = {
      _id: 1,
      title: 1,
      author: 1,
      submitted_at: 1,
      description: { $substrCP: ['$description', 0, 100] },
      banner_image_url: 1,
      faculty: 1,
      event: 1,
      is_publication: 1,
      likes: { $size: '$liked_user_ids' },
      comments: { $size: '$comments' },
      private_comments: { $size: '$private_comments' },
      images: 1,
      documents: 1,
    };

    if (user) {
      projection['is_liked'] = {
        $in: [this.mongoId(user._id), '$liked_user_ids'],
      };
    }

    pipeline.push({ $match: match });
    pipeline.push({ $project: projection });

    if (popular)
      pipeline.push({
        $sort: popular ? { likes: -1, submitted_at: -1 } : { submitted_at: -1 },
      });

    if (limit) pipeline.push({ $limit: Number(limit) });
    if (skip) pipeline.push({ $skip: Number(skip) });

    return pipeline;
  }
}
