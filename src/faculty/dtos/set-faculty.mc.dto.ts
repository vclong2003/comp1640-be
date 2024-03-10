import { IsString } from 'class-validator';

export class SetFacultyMcDto {
  @IsString()
  facultyId: string;

  @IsString()
  mcId: string;
}
