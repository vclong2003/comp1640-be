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
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { NoAccessToken } from 'src/auth/decorators/no-access-token.decorator';

@Controller('faculty')
export class FacultyController {
  constructor(private facultyService: FacultyService) {}

  // Create a new faculty ----------------------------------------------
  @Post('')
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
  @UseInterceptors(FileInterceptor('bannerImage'))
  @Roles([ERole.Admin])
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

  // Move student -----------------------------------------------------
  @Put(':facultyId/student/:studentId')
  @Roles([ERole.Admin])
  async moveStudent(
    @Param('facultyId') facultyId: string,
    @Param('studentId') studentId: string,
  ): Promise<void> {
    return await this.facultyService.moveStudent(facultyId, studentId);
  }

  // Remove student ---------------------------------------------------
  @Delete(':facultyId/student/:studentId')
  @Roles([ERole.Admin])
  async removeStudent(
    @Param('facultyId') facultyId: string,
    @Param('studentId') studentId: string,
  ): Promise<void> {
    return await this.facultyService.removeStudent(facultyId, studentId);
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
  @Roles([ERole.Admin, ERole.MarketingManager])
  async findFacultyById(@Param('facultyId') facultyId: string) {
    return await this.facultyService.findFacultyById(facultyId);
  }
}
