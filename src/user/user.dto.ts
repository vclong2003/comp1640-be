import { IsDate, IsOptional, IsString } from 'class-validator';
import { EGender } from './enums/gender.enum';
import { ERole } from './enums/role.enum';
import { UserFaculty } from './schemas/user-faculty.schema';

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
  @IsString()
  gender?: EGender;
}

export class CreateSessionDto {
  userId: string;
  browser: string;
  token: string;
}
