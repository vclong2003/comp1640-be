import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddContributionDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  eventId: string;
}
