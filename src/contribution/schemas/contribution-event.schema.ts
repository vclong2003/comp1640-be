import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Event } from 'src/event/schemas/event.schema';

@Schema()
export class ContributionEvent {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Event.name })
  _id: string;

  @Prop()
  name: string;

  @Prop()
  final_closure_date: Date;
}

export const ContributionEventSchema =
  SchemaFactory.createForClass(ContributionEvent);
