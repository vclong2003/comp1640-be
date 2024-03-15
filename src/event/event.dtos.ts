import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EEventSort } from './event.enums';

export class CreateEventDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsDate()
  start_date: Date;

  @ApiProperty()
  @IsDate()
  first_closure_date: Date;

  @ApiProperty()
  @IsDate()
  final_closure_date: Date;

  @ApiProperty()
  @IsString()
  facultyId: string;
}

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

export class FindEventDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  facultyId?: string;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  start_date?: Date;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  final_closure_date?: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  mcName?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(EEventSort)
  sort?: EEventSort;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  skip?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  limit?: number;
}
