import { IsDate, IsOptional, IsString } from 'class-validator';
import { EGender } from '../enums/gender.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  email?: string;

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
