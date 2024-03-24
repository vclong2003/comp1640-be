import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { FacultyMc, FacultyMcSchema } from './faculty-mc.schema';

@Schema()
export class Faculty {
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  banner_image_url: string;

  @Prop({ type: FacultyMcSchema })
  mc: FacultyMc;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Event' })
  event_ids: string[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Contribution' })
  contribution_ids: string[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  student_ids: string[];

  @Prop({ default: null })
  deleted_at: Date;
}

export const FacultySchema = SchemaFactory.createForClass(Faculty);
