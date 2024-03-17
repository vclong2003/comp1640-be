import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AddContributionDto } from './add-contribution.dto';
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
    await this.contributionService.createNewContribution(user._id, dto, files);
  }

  @Get(':contributionId')
  async getContributionById(@Param('contributionId') contributionId: string) {
    return this.contributionService.getContributionById(contributionId);
  }
}
