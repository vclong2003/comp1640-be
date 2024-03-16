import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { NoAccessToken } from 'src/auth/decorators/no-access-token.decorator';
import { AddContributionDto } from './dtos/add-contribution.dto';

@Controller('contribution')
export class ContributionController {
  constructor() {}

  @Post('')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'documents', maxCount: 5 },
      { name: 'images', maxCount: 5 },
    ]),
  )
  @NoAccessToken()
  async createNewContribution(
    @Body() dto: AddContributionDto,
    @UploadedFiles()
    files: { documents: Express.Multer.File[]; images: Express.Multer.File[] },
  ) {
    console.log(dto);
    console.log(files);
  }
}
