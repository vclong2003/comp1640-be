import { Prop, Schema } from '@nestjs/mongoose';
import { EventFaculty, EventFacultySchema } from './event-faculty';

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

  @Prop()
  contribution_ids: string[];

  @Prop()
  published_contribution_ids: string[];
}
