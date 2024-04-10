import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FileDto } from 'src/shared-modules/storage/storage.dtos';

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

// Contribution Files dto ---------------------------
export class ContributionFilesDto {
  documents: Express.Multer.File[];
  images: Express.Multer.File[];
  bannerImage: Express.Multer.File[];
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
  documents: FileDto[];
  images: FileDto[];
}

// Find contribution dto ------------------------
export class GetContributionsDto {
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
  is_publication?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  has_private_comments?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
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
/*
[
  {
    "name": "Information Technology ",
    "data": [
      {
        "month": 1,
        "contributions": 0
      },
      {
        "month": 2,
        "contributions": 0
      },
      {
        "month": 3,
        "contributions": 0
      },
      {
        "month": 4,
        "contributions": 12
      },
      {
        "month": 5,
        "contributions": 0
      },
      {
        "month": 6,
        "contributions": 0
      },
      {
        "month": 7,
        "contributions": 0
      },
      {
        "month": 8,
        "contributions": 0
      },
      {
        "month": 9,
        "contributions": 0
      },
      {
        "month": 10,
        "contributions": 0
      },
      {
        "month": 11,
        "contributions": 0
      },
      {
        "month": 12,
        "contributions": 0
      }
    ]
  },
  {
    "name": "Marketing ",
    "data": [
      {
        "month": 1,
        "contributions": 0
      },
      {
        "month": 2,
        "contributions": 0
      },
      {
        "month": 3,
        "contributions": 0
      },
      {
        "month": 4,
        "contributions": 8
      },
      {
        "month": 5,
        "contributions": 0
      },
      {
        "month": 6,
        "contributions": 0
      },
      {
        "month": 7,
        "contributions": 0
      },
      {
        "month": 8,
        "contributions": 0
      },
      {
        "month": 9,
        "contributions": 0
      },
      {
        "month": 10,
        "contributions": 0
      },
      {
        "month": 11,
        "contributions": 0
      },
      {
        "month": 12,
        "contributions": 0
      }
    ]
  }
]
*/
export class NumberOfContributionsByFacultyPerYearDto {
  name: string;
  data: { month: number; contributions: number }[];
}

export class TotalNumberOfContributionByFacultyDto {
  faculty: string;
  count: number;
}
