import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ERole } from 'src/user/user.enums';

export class SendRegisterEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  role: ERole;

  @ApiProperty()
  @IsOptional()
  @IsString()
  facultyId?: string;
}
