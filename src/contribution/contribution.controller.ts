import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { NoAccessToken } from 'src/auth/decorators/no-access-token.decorator';
import { StorageService } from 'src/shared-modules/storage/storage.service';

@Controller('contribution')
export class ContributionController {
  constructor(private storageService: StorageService) {}

  @Post('')
  @UseInterceptors(FilesInterceptor('files'))
  @NoAccessToken()
  async test(@UploadedFiles() files: Express.Multer.File[], @Body() body) {
    console.log(files);
    console.log(body);

    const contributionId = '123456789';
    await this.storageService.uploadContributionImages(contributionId, files);
  }

  @Get('')
  @NoAccessToken()
  async test1() {
    const contributionId = '123456789';
    return await this.storageService.getContributionImages(contributionId);
  }
}
