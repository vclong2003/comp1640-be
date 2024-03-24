import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ERole } from 'src/user/user.enums';
import { ContributionService } from './contribution.service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AddContributionDto } from './dtos/add-contribution.dto';
import { FindContributionsDto } from './dtos/find-contributions.dto';
import {
  AddContributionResponseDto,
  ContributionResponseDto,
  ContributionsResponseDto,
} from './dtos/contribution-res.dtos';

@Controller('contribution')
export class ContributionController {
  constructor(private contributionService: ContributionService) {}

  @Post('')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        eventId: { type: 'string' },
        documents: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'documents', maxCount: 5 },
      { name: 'images', maxCount: 5 },
    ]),
  )
  @Roles([ERole.Student])
  async addContribution(
    @Req() { user },
    @Body() dto: AddContributionDto,
    @UploadedFiles()
    files: { documents: Express.Multer.File[]; images: Express.Multer.File[] },
  ): Promise<AddContributionResponseDto> {
    return await this.contributionService.addContribution(user._id, dto, files);
  }

  @Get(':contributionId')
  async findContributionById(
    @Param('contributionId') contributionId: string,
  ): Promise<ContributionResponseDto> {
    return await this.contributionService.findContributionById(contributionId);
  }

  @Get('')
  async findContributions(
    @Req() req,
    @Query() dto: FindContributionsDto,
  ): Promise<ContributionsResponseDto[]> {
    return await this.contributionService.findContributions(dto);
  }
}
