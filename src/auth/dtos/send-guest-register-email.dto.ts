import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendGuestRegisterEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
