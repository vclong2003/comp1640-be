import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { CreateFacultyDto } from './dtos/create-faculty.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('faculty')
export class FacultyController {
  constructor(private facultyService: FacultyService) {}

  @Post('')
  async createFaculty(@Body() dto: CreateFacultyDto) {
    return this.facultyService.createFaculty(dto);
  }

  @Get('all')
  async getAllFaculty() {
    return this.facultyService.getAllFaculty();
  }

  @Roles(['admin'])
  @Post(':facultyId/student')
  async addStudent(@Param('facultyId') facultyId: string, @Body() data) {
    const { studentId } = data;
    console.log('facultyId', facultyId);
    console.log('studentId', studentId);
    return this.facultyService.addStudentToFaculty(facultyId, studentId);
  }

  @Get(':facultyId/students')
  async getStudents(@Param('facultyId') facultyId: string) {
    return this.facultyService.findAllStudentByFaculty(facultyId);
  }
}
