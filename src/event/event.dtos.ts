import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { EEventSort } from './event.enums';

// Create event dto ------------------------
export class CreateEventDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  start_date: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  first_closure_date: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  final_closure_date: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  facultyId: string;
}

// Update event dto ------------------------
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

// Find event dto ------------------------
export class FindEventsDTO {
  _id?: string;

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

// Event response dto ------------------------
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
