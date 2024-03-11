import { IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateEventDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDate()
  start_date?: Date;

  @IsOptional()
  @IsDate()
  first_closure_date?: Date;

  @IsOptional()
  @IsDate()
  final_closure_date?: Date;
}
