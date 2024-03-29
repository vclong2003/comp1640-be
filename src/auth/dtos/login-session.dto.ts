import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class findLoginSessionsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  skip?: number;
}
