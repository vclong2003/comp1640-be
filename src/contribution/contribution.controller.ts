import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { NoAccessToken } from 'src/auth/decorators/no-access-token.decorator';

@Controller('contribution')
export class ContributionController {
  @Post('')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'file_1', maxCount: 1 },
    ]),
  )
  @NoAccessToken()
  async test(@UploadedFile() files: Express.Multer.File[], @Req() req) {
    console.log(files);
    console.log(req.body);
  }
}
