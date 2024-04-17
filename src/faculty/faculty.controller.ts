import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Put,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import {
  CreateFacultyDto,
  FindFacultiesDto,
  FacultyResponseDto,
  UpdateFacultyDto,
} from './faculty.dtos';
import { ERole } from 'src/user/user.enums';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { NoAccessToken } from 'src/auth/decorators/no-access-token.decorator';

@ApiTags('Faculty')
@Controller('faculty')
export class FacultyController {
  constructor(private facultyService: FacultyService) {}

  // Create a new faculty ----------------------------------------------
  @Post('')
  @Roles([ERole.Admin])
  @UseInterceptors(FileInterceptor('bannerImage'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        mcId: { type: 'string' },
        bannerImage: { type: 'string', format: 'binary' },
      },
    },
  })
  async createFaculty(
    @Body() dto: CreateFacultyDto,
    @UploadedFile() bannerImage?: Express.Multer.File,
  ): Promise<FacultyResponseDto> {
    return await this.facultyService.createFaculty(dto, bannerImage);
  }

  // Update a faculty --------------------------------------------------
  @Put(':facultyId')
  @UseInterceptors(FileInterceptor('bannerImage'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        mcId: { type: 'string' },
        bannerImage: { type: 'string', format: 'binary' },
      },
    },
  })
  @Roles([ERole.Admin])
  async updateFaculty(
    @Param('facultyId') facultyId: string,
    @Body() dto: UpdateFacultyDto,
    @UploadedFile() bannerImage?: Express.Multer.File,
  ): Promise<FacultyResponseDto> {
    return await this.facultyService.updateFaculty(facultyId, dto, bannerImage);
  }

  // Delete a faculty --------------------------------------------------
  @Delete(':facultyId')
  @Roles([ERole.Admin])
  async deleteFaculty(@Param('facultyId') facultyId: string): Promise<void> {
    return await this.facultyService.removeFaculty(facultyId);
  }

  // Find faculties ---------------------------------------------------
  @Get('')
  @NoAccessToken()
  async findFaculties(
    @Query() dto: FindFacultiesDto,
  ): Promise<Omit<FacultyResponseDto, 'description' | 'banner_image_url'>[]> {
    return await this.facultyService.findFaculties(dto);
  }

  // Find faculty by id ------------------------------------------------
  @Get(':facultyId')
  async findFacultyById(@Param('facultyId') facultyId: string) {
    return await this.facultyService.findFacultyById(facultyId);
  }
}
