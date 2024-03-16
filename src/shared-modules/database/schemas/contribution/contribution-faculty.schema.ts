import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class ContributionFaculty {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' })
  _id: string;

  @Prop()
  name: string;
}

export const ContributionFacultySchema =
  SchemaFactory.createForClass(ContributionFaculty);
