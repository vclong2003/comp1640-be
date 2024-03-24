import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { EGender, ERole } from 'src/user/user.enums';

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

  @ApiProperty({ type: 'enum', enum: Object.values(EGender) })
  @IsEnum(EGender)
  gender: EGender;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dob?: Date;
}
