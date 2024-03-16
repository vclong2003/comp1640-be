import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Faculty } from 'src/shared-modules/database/schemas/faculty/faculty.schema';

@Schema()
export class UserFaculty {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Faculty.name })
  _id: string;

  @Prop()
  name: string;
}

export const UserFacultySchema = SchemaFactory.createForClass(UserFaculty);
