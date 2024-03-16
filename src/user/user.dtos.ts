import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserFaculty } from '../shared-modules/database/schemas/user/user-faculty.schema';
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
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  facultyId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  skip?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  limit?: number;
}
