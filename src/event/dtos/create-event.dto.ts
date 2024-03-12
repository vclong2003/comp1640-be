import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString } from 'class-validator';

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
