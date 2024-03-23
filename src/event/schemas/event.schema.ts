import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EventFaculty, EventFacultySchema } from './event-faculty';
import mongoose from 'mongoose';

@Schema()
export class Event {
  _id: string;

  @Prop()
  name: string;

  @Prop()
  start_date: Date;

  @Prop()
  description: string;

  @Prop()
  banner_image_url: string;

  @Prop()
  first_closure_date: Date;

  @Prop()
  final_closure_date: Date;

  @Prop({ type: EventFacultySchema })
  faculty: EventFaculty;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Contribution' })
  contribution_ids: string[];

  @Prop()
  deleted_at: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
