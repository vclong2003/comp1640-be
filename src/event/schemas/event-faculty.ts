import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import {
  FacultyMc,
  FacultyMcSchema,
} from 'src/faculty/schemas/faculty-mc.schema';

@Schema()
export class EventFaculty {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' })
  _id: string;

  @Prop()
  name: string;

  @Prop({ type: FacultyMcSchema })
  mc: FacultyMc;
}

export const EventFacultySchema = SchemaFactory.createForClass(EventFaculty);
