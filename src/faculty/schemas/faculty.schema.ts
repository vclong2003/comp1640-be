import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { FacultyMc, FacultyMcSchema } from './faculty-mc.schema';
import { Contribution } from 'src/contribution/schemas/contribution.schema';
import { Event } from 'src/event/schemas/event.schema';

@Schema()
export class Faculty {
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: FacultyMcSchema })
  mc: FacultyMc;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Event.name })
  event_ids: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Contribution.name })
  contribution_ids: string[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: User.name })
  student_ids: string[];
}

export const FacultySchema = SchemaFactory.createForClass(Faculty);
