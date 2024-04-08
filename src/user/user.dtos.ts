import { IsString, IsEnum, IsOptional } from 'class-validator';
import { EGender, ERole } from './user.enums';
import { ApiProperty } from '@nestjs/swagger';

// User res ------------------------
export class UserResponseDto {
  _id: string;
  email: string;
  name: string;
  avatar_url?: string;
  phone?: string;
  dob?: Date;
  faculty?: {
    _id: string;
    name: string;
  };
  gender: EGender;
  role: ERole;
  disabled: boolean;
}

// Update user dto ------------------------------------------
export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dob?: Date;

  @ApiProperty({ type: 'enum', required: false })
  @IsOptional()
  @IsString()
  gender?: EGender;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  facultyId?: string;
}

// Find user dto ------------------------------------------
export class FindUsersDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ type: 'enum', enum: ERole })
  @IsEnum(ERole)
  role: ERole;

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
