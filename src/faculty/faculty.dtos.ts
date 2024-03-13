import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateFacultyDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  mcId?: string;
}

export class AddStudentDto {
  @ApiProperty()
  @IsString()
  studentId: string;
}

export class SetFacultyDto {
  @ApiProperty()
  @IsString()
  mcId: string;
}
