import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

@Schema()
export class CommentAuthor {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  _id: string;

  @Prop()
  avatar_url: string;

  @Prop()
  name: string;
}

export const CommentAuthorSchema = SchemaFactory.createForClass(CommentAuthor);
