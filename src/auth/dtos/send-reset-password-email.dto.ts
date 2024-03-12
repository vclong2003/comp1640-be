import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendResetPasswordEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
