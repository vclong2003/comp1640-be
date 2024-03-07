import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ERole } from '../eums/role.enum';
import { Session, SessionSchema } from './session.schema';
import mongoose from 'mongoose';

@Schema()
export class User {
  @Prop()
  _id: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop()
  avatar_url: string;

  @Prop()
  name: string;

  @Prop({ required: true })
  roles: ERole;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Event' })
  participated_event_ids: string[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Contribution' })
  submitted_contribution_ids: string[];

  @Prop({ type: [SessionSchema] })
  sessions: Session[];
}

export const UserSchema = SchemaFactory.createForClass(User);
