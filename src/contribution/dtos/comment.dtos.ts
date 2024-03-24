import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddCommentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdateCommentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CommentResponseDto {
  _id: string;
  content: string;
  posted_at: Date;
  author: {
    _id: string;
    avatar_url: string;
    name: string;
  };
}
