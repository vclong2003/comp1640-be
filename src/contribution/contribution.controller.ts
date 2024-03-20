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
import { AddContributionDto, FindContributionsDto } from './contribution.dtos';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ERole } from 'src/user/user.enums';
import { ContributionService } from './contribution.service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

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
  async createNewContribution(
    @Req() { user },
    @Body() dto: AddContributionDto,
    @UploadedFiles()
    files: { documents: Express.Multer.File[]; images: Express.Multer.File[] },
  ) {
    return await this.contributionService.createContribution(
      user._id,
      dto,
      files,
    );
  }

  @Get(':contributionId')
  async getContributionById(@Param('contributionId') contributionId: string) {
    return await this.contributionService.getContributionById(contributionId);
  }

  @Get('')
  async getAllContributions(@Req() req, @Query() dto: FindContributionsDto) {
    if (
      req.user.role === ERole.MarketingManager ||
      req.user.role === ERole.Admin
    ) {
      return await this.contributionService.getContributions(dto);
    }

    return await this.contributionService.getContributionsByUserFaculty(
      req.user._id,
      dto,
    );
  }
}
