import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateEventDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  start_date?: Date;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  first_closure_date?: Date;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  final_closure_date?: Date;
}
