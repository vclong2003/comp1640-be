import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class CommentAuthor {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  _id: string;

  @Prop()
  avatar_url: string;

  @Prop()
  name: string;
}

export const CommentAuthorSchema = SchemaFactory.createForClass(CommentAuthor);
