import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

@Schema()
export class FacultyMc {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  _id: string;

  @Prop()
  name: string;

  @Prop()
  email: string;
}

export const FacultyMcSchema = SchemaFactory.createForClass(FacultyMc);
