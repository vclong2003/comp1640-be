import { IsOptional, IsString } from 'class-validator';

export class CreateFacultyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  mcId?: string;
}
