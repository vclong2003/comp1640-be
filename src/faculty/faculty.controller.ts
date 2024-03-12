import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { CreateFacultyDto } from './dtos/create-faculty.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ERole } from 'src/user/enums/role.enum';

@Controller('faculty')
export class FacultyController {
  constructor(private facultyService: FacultyService) {}

  @Get('all')
  async getAllFaculty() {
    return this.facultyService.findAll();
  }

  @Get(':facultyId/students')
  async getStudents(@Param('facultyId') facultyId: string) {
    return this.facultyService.findAllStudent(facultyId);
  }

  @Post('')
  @Roles([ERole.Admin])
  async createFaculty(@Body() dto: CreateFacultyDto) {
    return this.facultyService.createFaculty(dto);
  }

  @Post(':facultyId/student')
  @Roles([ERole.Admin])
  async addStudent(@Param('facultyId') facultyId: string, @Body() data) {
    const { studentId } = data;
    console.log('facultyId', facultyId);
    console.log('studentId', studentId);
    return this.facultyService.addStudent(facultyId, studentId);
  }

  @Post(':facultyId/mc')
  @Roles([ERole.Admin])
  async setFacultyMc(@Param('facultyId') facultyId: string, @Body() data) {
    const { mcId } = data;
    return this.facultyService.setFacultyMc(facultyId, mcId);
  }
}
