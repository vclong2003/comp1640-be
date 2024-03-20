import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import {
  CreateFacultyDto,
  FindFacultiesDto,
  UpdateFacultyDto,
} from './faculty.dtos';
import { ERole } from 'src/user/user.enums';

@Controller('faculty')
export class FacultyController {
  constructor(private facultyService: FacultyService) {}

  @Post('')
  @Roles([ERole.Admin])
  async createFaculty(@Body() dto: CreateFacultyDto) {
    return await this.facultyService.createFaculty(dto);
  }

  @Put(':facultyId')
  @Roles([ERole.Admin])
  async updateFaculty(
    @Param('facultyId') facultyId: string,
    @Body() dto: UpdateFacultyDto,
  ) {
    return await this.facultyService.updateFaculty(facultyId, dto);
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
  async findFaculties(@Query() dto: FindFacultiesDto) {
    return await this.facultyService.findFaculties(dto);
  }

  @Get(':facultyId')
  @Roles([ERole.Admin, ERole.MarketingManager])
  async findFaculty(@Param('facultyId') facultyId: string) {
    return await this.facultyService.findOneById(facultyId);
  }
}
