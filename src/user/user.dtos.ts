import { IsString, IsEnum, IsOptional } from 'class-validator';
import { EGender, ERole } from './user.enums';
import { ApiProperty } from '@nestjs/swagger';

export class GetUserResponseDto {
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
}

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  dob?: Date;

  @ApiProperty()
  @IsOptional()
  @IsEnum(EGender)
  gender?: EGender;
}

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
