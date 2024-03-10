import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { FacultyMc, FacultyMcSchema } from './faculty-mc.schema';

@Schema()
export class Faculty {
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: FacultyMcSchema, required: false })
  mc?: FacultyMc;

  @Prop()
  event_ids: string[];

  @Prop()
  contribution_ids: string[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: User.name })
  student_ids: string[];
}

export const FacultySchema = SchemaFactory.createForClass(Faculty);
