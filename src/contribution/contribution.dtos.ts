import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Add contribution dto ------------------------
export class AddContributionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  eventId: string;
}
export class AddContributionResponseDto {
  _id: string;
}

// Update contribution dto ------------------------
export class UpdateContributionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

// Contribution response dto ------------------------
export class ContributionResponseDto {
  _id: string;
  title: string;
  description: string;
  banner_image_url: string;
  submitted_at: Date;
  is_publication: boolean;
  is_editable: boolean;
  is_liked: boolean;
  likes: number;
  comments: number;
  private_comments: number;
  author: {
    _id: string;
    avatar_url: string;
    email: string;
    name: string;
  };
  faculty: {
    _id: string;
    name: string;
  };
  event: {
    _id: string;
    name: string;
  };
  documents: {
    file_name: string;
    file_url: string;
  }[];
  images: {
    file_name: string;
    file_url: string;
  }[];
}

// Find contribution dto ------------------------
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

// Analysis DTOs ----------------------------------------
export class NumberOfContributionsByFacultyPerYearDto {
  faculty: string;
  month: number;
  count: number;
}

export class TotalNumberOfContributionByFacultyDto {
  faculty: string;
  count: number;
}
