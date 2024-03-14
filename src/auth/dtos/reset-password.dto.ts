import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class SendResetPasswordEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
