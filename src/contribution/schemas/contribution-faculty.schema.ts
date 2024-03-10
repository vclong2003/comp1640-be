import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Faculty } from 'src/faculty/schemas/faculty.schema';

@Schema()
export class ContributionFaculty {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Faculty.name })
  _id: string;

  @Prop()
  name: string;
}

export const ContributionFacultySchema =
  SchemaFactory.createForClass(ContributionFaculty);
