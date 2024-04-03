import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class FindContributionsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  facultyId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  authorName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  is_publication?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  has_private_comments?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  popular?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  skip?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  limit?: number;
}
