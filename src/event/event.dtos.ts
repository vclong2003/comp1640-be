import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
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

export class EventsResponseDto {
  _id: string;
  name: string;
  is_accepting_new_contribution: boolean;
  is_contributions_editable: boolean;
  number_of_contributions: number;
  faculty: {
    _id: string;
    name: string;
  };
}
