import { IsString } from 'class-validator';

export class CreateFacultyDto {
  @IsString()
  name: string;

  @IsString()
  mcId: string;
}
