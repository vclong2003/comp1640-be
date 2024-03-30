import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @Matches(/^(?!\s+$).+/, { message: 'Old password cannot be empty' })
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @Matches(/^(?!\s+$).+/, { message: 'New Password cannot be empty' })
  newPassword: string;
}
