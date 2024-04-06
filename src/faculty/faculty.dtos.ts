import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Create faculty dto ------------------------
export class CreateFacultyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mcId?: string;
}

// Update faculty dto ------------------------
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

// Add student -----------------------------
export class AddStudentDto {
  @ApiProperty()
  @IsString()
  studentId: string;
}

// Find faculty dto ------------------------
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

// Faculty response dto ---------------------
export class FacultyResponseDto {
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
