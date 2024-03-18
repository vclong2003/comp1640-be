import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CommentAuthor, CommentAuthorSchema } from './comment-author';

@Schema()
export class Comment {
  _id?: string;

  @Prop()
  content: string;

  @Prop()
  posted_at: Date;

  @Prop({ type: CommentAuthorSchema })
  author: CommentAuthor;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
