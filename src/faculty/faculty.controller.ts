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
    return this.facultyService.getAllFaculty();
  }

  @Get(':facultyId/students')
  async getStudents(@Param('facultyId') facultyId: string) {
    return this.facultyService.findAllStudentByFaculty(facultyId);
  }

  @Roles([ERole.Admin])
  @Post('')
  async createFaculty(@Body() dto: CreateFacultyDto) {
    return this.facultyService.createFaculty(dto);
  }

  @Roles([ERole.Admin])
  @Post(':facultyId/student')
  async addStudent(@Param('facultyId') facultyId: string, @Body() data) {
    const { studentId } = data;
    console.log('facultyId', facultyId);
    console.log('studentId', studentId);
    return this.facultyService.addStudentToFaculty(facultyId, studentId);
  }

  @Roles([ERole.Admin])
  @Post(':facultyId/mc')
  async setFacultyMc(@Param('facultyId') facultyId: string, @Body() data) {
    const { mcId } = data;
    return this.facultyService.setFacultyMc(facultyId, mcId);
  }
}
