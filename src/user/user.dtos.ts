import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserFaculty } from './schemas/user-faculty.schema';
import { EGender, ERole } from './user.enums';

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
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDate()
  dob?: Date;

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
