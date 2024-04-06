import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { EEventSort } from './event.enums';

export class CreateEventDTO {
  @ApiProperty()
  @IsString()
  @Matches(/^(?!\s+$).+/, { message: 'Name cannot be empty' })
  name: string;

  @ApiProperty()
  @IsString()
  @Matches(/^(?!\s+$).+/, { message: 'Description cannot be empty' })
  description: string;

  @ApiProperty()
  @IsString()
  @Matches(/^(?!\s+$).+/, { message: 'Start date cannot be empty' })
  start_date: Date;

  @ApiProperty()
  @IsString()
  @Matches(/^(?!\s+$).+/, { message: 'First closure date cannot be empty' })
  first_closure_date: Date;

  @ApiProperty()
  @IsString()
  @Matches(/^(?!\s+$).+/, { message: 'Final closure date cannot be empty' })
  final_closure_date: Date;

  @ApiProperty()
  @IsString()
  @Matches(/^(?!\s+$).+/, { message: 'Faculty ID cannot be empty' })
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
  description?: string;

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

  @ApiProperty({ required: false, enum: EEventSort })
  @IsOptional()
  @IsEnum(EEventSort)
  sort?: EEventSort;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  skip?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  limit?: number;
}

export class EventResponseDto {
  _id: string;
  name: string;
  description: string;
  banner_image_url: string;
  start_date: Date;
  first_closure_date: Date;
  final_closure_date: Date;
  is_accepting_new_contribution: boolean;
  is_contributions_editable: boolean;
  number_of_contributions: number;
  faculty: {
    _id: string;
    name: string;
    mc: {
      _id: string;
      name: string;
      email: string;
    };
  };
}
