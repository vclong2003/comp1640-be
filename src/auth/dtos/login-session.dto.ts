import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindLoginSessionsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  skip?: number;
}

export class LoginSessionResponseDto {
  _id: string;
  browser: string;
  date: Date;
  isCurrentDevice: boolean;
}

export class RemoveLoginSessionDto {
  @ApiProperty()
  @IsString()
  sessionId: string;
}
