import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  redirect?: string;
}
