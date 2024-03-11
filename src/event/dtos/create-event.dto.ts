import { IsDate, IsString } from 'class-validator';

export class CreateEventDTO {
  @IsString()
  name: string;

  @IsDate()
  start_date: Date;

  @IsDate()
  first_closure_date: Date;

  @IsDate()
  final_closure_date: Date;

  @IsString()
  facultyId: string;
}
