import { Controller, Post, Body } from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { CreateFacultyDto } from './dtos/create-faculty.dto';

@Controller('faculty')
export class FacultyController {
  constructor(private facultyService: FacultyService) {}

  @Post('')
  async createFaculty(@Body() dto: CreateFacultyDto) {
    return this.facultyService.createFaculty(dto);
  }
}
