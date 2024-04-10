import { BadRequestException, Injectable } from '@nestjs/common';
import mongoose, { PipelineStage } from 'mongoose';
import { EventResponseDto, FindEventsDTO } from './event.dtos';
import { Event } from './schemas/event.schema';

@Injectable()
export class EventHelper {
  // Convert to mongo id ----------------------------------------------
  mongoId(id: string): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(id);
  }

  // Sanitize event --------------------------------------------------
  santinizeEvent(
    event: Event,
    is_accepting_new_contribution: boolean,
    is_contributions_editable: boolean,
    number_of_contributions: number,
  ): EventResponseDto {
    return {
      _id: event._id,
      name: event.name,
      description: event.description,
      banner_image_url: event.banner_image_url,
      start_date: event.start_date,
      first_closure_date: event.first_closure_date,
      final_closure_date: event.final_closure_date,
      is_accepting_new_contribution,
      is_contributions_editable,
      number_of_contributions,
      faculty: event.faculty,
    };
  }

  // Generate find events pipeline -----------------------------------
  generateFindEventsPipeline(dto: FindEventsDTO): PipelineStage[] {
    const {
      facultyId,
      name,
      start_date,
      final_closure_date,
      mcName,
      limit,
      skip,
      sort,
    } = dto;

    const match = {};
    if (name) match['name'] = { $regex: name, $options: 'i' };
    if (start_date) match['start_date'] = { $gte: start_date };
    if (final_closure_date) {
      match['final_closure_date'] = { $lte: final_closure_date };
    }
    if (mcName) {
      match['faculty.mc.name'] = { $regex: mcName, $options: 'i' };
    }
    if (facultyId) match['faculty._id'] = this.mongoId(facultyId);

    const pipeline = [];
    pipeline.push({ $match: match });
    pipeline.push(this.generateFindEventsPipelineLookup());
    pipeline.push(this.generateFindEventsPipelineProjection());

    if (sort) pipeline.push({ $sort: { [sort]: -1 } });
    if (skip) pipeline.push({ $skip: Number(skip) });
    if (limit) pipeline.push({ $limit: Number(limit) });

    return pipeline;
  }

  // Generate contribution pipeline lookup -----------------------------------------
  generateFindEventsPipelineLookup(): PipelineStage {
    return {
      $lookup: {
        from: 'contributions',
        localField: '_id',
        foreignField: 'event._id',
        as: 'contributions',
      },
    };
  }

  // Generate contribution pipeline projection -------------------------------------
  generateFindEventsPipelineProjection(detailed?: boolean): PipelineStage {
    const project = {
      name: 1,
      start_date: 1,
      first_closure_date: 1,
      final_closure_date: 1,
      faculty: 1,
      number_of_contributions: { $size: '$contributions' },
      is_accepting_new_contribution: {
        $cond: {
          if: {
            $gte: ['$first_closure_date', new Date()],
          },
          then: true,
          else: false,
        },
      },
      is_contributions_editable: {
        $cond: {
          if: {
            $gte: ['$final_closure_date', new Date()],
          },
          then: true,
          else: false,
        },
      },
    };

    if (detailed) {
      project['description'] = 1;
      project['banner_image_url'] = 1;
    }

    return {
      $project: project,
    };
  }

  // Ensure date valid -------------------------------------------------------------
  ensureDateValid(
    startDate: Date,
    firstClosureDate: Date,
    finalClosureDate: Date,
  ): void {
    if (firstClosureDate < startDate) {
      throw new BadRequestException(
        'First closure date must be after start date',
      );
    }
    if (finalClosureDate < firstClosureDate) {
      throw new BadRequestException(
        'Final closure date must be after first closure date',
      );
    }
  }
}
