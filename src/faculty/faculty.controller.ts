import { Controller } from '@nestjs/common';

@Controller('faculty')
export class FacultyController {
  getFaculty(): string {
    return 'Faculty';
  }
}
