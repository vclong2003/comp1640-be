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
  FacultiesResponseDto,
  FacultyResponseDto,
  UpdateFacultyDto,
} from './faculty.dtos';
import { ERole } from 'src/user/user.enums';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('faculty')
export class FacultyController {
  constructor(private facultyService: FacultyService) {}

  // Create a new faculty
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

  // Update a faculty
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

  @Put(':facultyId/student/:studentId')
  @Roles([ERole.Admin])
  async moveStudent(
    @Param('facultyId') facultyId: string,
    @Param('studentId') studentId: string,
  ) {
    return await this.facultyService.moveStudent(facultyId, studentId);
  }

  @Delete(':facultyId/student/:studentId')
  @Roles([ERole.Admin])
  async removeStudent(
    @Param('facultyId') facultyId: string,
    @Param('studentId') studentId: string,
  ) {
    return await this.facultyService.removeStudent(facultyId, studentId);
  }

  @Get('')
  @Roles([ERole.Admin, ERole.MarketingManager])
  async findFaculties(
    @Query() dto: FindFacultiesDto,
  ): Promise<FacultiesResponseDto[]> {
    return await this.facultyService.findFaculties(dto);
  }

  @Get(':facultyId')
  @Roles([ERole.Admin, ERole.MarketingManager])
  async findFacultyById(@Param('facultyId') facultyId: string) {
    return await this.facultyService.findFacultyById(facultyId);
  }
}
