import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { EGender, ERole } from 'src/user/user.enums';

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dob?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(EGender)
  gender?: EGender;
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
  @IsString()
  dob?: Date;
}
