import { Prop, Schema } from '@nestjs/mongoose';
import { EventFaculty, EventFacultySchema } from './event-faculty';
import mongoose from 'mongoose';
import { Contribution } from 'src/contribution/schemas/contribution.schema';

@Schema()
export class Event {
  _id: string;

  @Prop()
  name: string;

  @Prop()
  start_date: Date;

  @Prop()
  first_closure_date: Date;

  @Prop()
  final_closure_date: Date;

  @Prop({ type: EventFacultySchema })
  faculty: EventFaculty;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Contribution.name })
  contribution_ids: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Contribution.name })
  published_contribution_ids: string[];
}
