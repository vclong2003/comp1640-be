import { BadRequestException, Injectable } from '@nestjs/common';
import { Contribution } from './schemas/contribution.schema';
import { FileDto } from 'src/shared-modules/storage/storage.dtos';
import {
  ContributionResponseDto,
  GetContributionsDto,
} from './contribution.dtos';
import mongoose, { PipelineStage } from 'mongoose';
import { IAccessTokenPayload } from 'src/shared-modules/jwt/jwt.interfaces';
import { ERole } from 'src/user/user.enums';

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

  // Ensure user have faculty ---------------------------------------------------
  ensureUserHaveFaculty(user: IAccessTokenPayload) {
    if (!user.facultyId) {
      throw new BadRequestException('You dont belong to any faculty');
    }
  }

  // Ensure contribution ownership ---------------------------------------------
  ensureContributionOwnership(
    contribution: Contribution,
    user: IAccessTokenPayload,
  ): void {
    if (contribution.author.toString() !== user._id) {
      throw new BadRequestException(
        'You are not the owner of this contribution',
      );
    }
  }

  // Ensure contribution MC ownership ------------------------------------------
  ensureContributionMcOwnership(
    contribution: Contribution,
    user: IAccessTokenPayload,
  ) {
    if (user.role !== ERole.MarketingCoordinator) {
      throw new BadRequestException('You are not a Marketing Coordinator');
    }

    if (!user.facultyId) {
      throw new BadRequestException('You dont belong to any faculty');
    }

    if (contribution.faculty._id.toString() !== user.facultyId) {
      throw new BadRequestException('You are not the MC of this faculty');
    }
  }

  // Ensure contribution editability -------------------------------------------
  ensureContributionEditability(contribution: Contribution) {
    if (contribution.event.final_closure_date < new Date()) {
      throw new BadRequestException('Contribution is not editable');
    }
  }

  // Generate get contributions pipeline -----------------------------------------
  generateGetContributionsPipeline(dto: GetContributionsDto): PipelineStage[] {
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
    if (is_publication) match['is_publication'] = is_publication;
    if (has_private_comments) {
      match['private_comments'] = { $exists: true, $ne: [] };
    }
    if (eventId) match['event._id'] = this.mongoId(eventId);
    if (facultyId) match['faculty._id'] = this.mongoId(facultyId);

    const projection = {
      _id: 1,
      title: 1,
      author: 1,
      submitted_at: 1,
      faculty: 1,
      event: 1,
      is_publication: 1,
      likes: { $size: '$liked_user_ids' },
      comments: { $size: '$comments' },
      private_comments: { $size: '$private_comments' },
    };

    pipeline.push({ $match: match });
    pipeline.push({ $project: projection });
    if (popular) pipeline.push({ $sort: { likes: -1 } });
    if (limit) pipeline.push({ $limit: limit });
    if (skip) pipeline.push({ $skip: skip });

    return pipeline;
  }
}
