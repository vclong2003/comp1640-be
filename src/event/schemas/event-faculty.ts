import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class EventFaculty {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' })
  _id: string;

  @Prop()
  name: string;
}

export const EventFacultySchema = SchemaFactory.createForClass(EventFaculty);
