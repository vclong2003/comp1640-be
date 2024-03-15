import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserFaculty } from './schemas/user-faculty.schema';
import { EGender, ERole } from './user.enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  email: string;
  name: string;
  password: string;
  role: ERole;
  phone?: string;
  faculty?: UserFaculty;
  dob?: Date;
}

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  avatar_url?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  dob?: Date;

  @ApiProperty()
  @IsOptional()
  @IsEnum(EGender)
  gender?: EGender;
}

export class CreateSessionDto {
  userId: string;
  browser: string;
  token: string;
}

export class FindUsersDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  facultyId?: string;

  @IsOptional()
  @IsNumber()
  skip?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
