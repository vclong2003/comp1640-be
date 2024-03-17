import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class ContributionAuthor {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  _id: string;

  @Prop()
  avatar_url: string;

  @Prop()
  name: string;

  @Prop()
  email: string;
}

export const ContributionAuthorSchema =
  SchemaFactory.createForClass(ContributionAuthor);
