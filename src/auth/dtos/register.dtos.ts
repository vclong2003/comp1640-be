import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ERole } from 'src/user/user.enums';

// Register ---------------------------------------------------------------
export class SendRegisterEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: ERole })
  @IsEnum(ERole)
  role: ERole;

  @ApiProperty()
  @IsOptional()
  @IsString()
  facultyId?: string;
}

export class SendGuestRegisterEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class SendRegisterEmailVerifycationDto {
  @ApiProperty()
  @IsString()
  token: string;
}

export class SetupAccountDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  dob?: Date;
}

// Guest Register ---------------------------------------------------------
export class SetupGuestAccountDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  facultyId: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  dob?: Date;
}
