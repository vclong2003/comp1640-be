import { IsDate, IsEmail, IsOptional, IsString } from 'class-validator';

export class GuestRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  password: string;

  @IsOptional() // for testing only
  @IsString()
  facultyId: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsDate()
  dob: Date;
}
