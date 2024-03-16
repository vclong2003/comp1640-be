import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { EEventSort } from './event.enums';

export class CreateEventDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  start_date: Date;

  @ApiProperty()
  @IsString()
  first_closure_date: Date;

  @ApiProperty()
  @IsString()
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
  @IsString()
  start_date?: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  first_closure_date?: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  final_closure_date?: Date;
}

export class FindEventsDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  facultyId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  start_date?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  final_closure_date?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mcName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(EEventSort)
  sort?: EEventSort;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  skip?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
