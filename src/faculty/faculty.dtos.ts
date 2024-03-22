import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateFacultyDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mcId?: string;
}

export class UpdateFacultyDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mcId?: string;
}

export class AddStudentDto {
  @ApiProperty()
  @IsString()
  studentId: string;
}

export class FindFacultiesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  skip?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  limit?: number;
}

export class GetFacultyResponseDto {
  _id: string;
  name: string;
  description: string;
  banner_image_url: string;
  mc: {
    _id: string;
    name: string;
    email: string;
  };
}

export class GetFacultiesResponseDto {
  _id: string;
  name: string;
  mc: {
    _id: string;
    name: string;
    email: string;
  };
}
