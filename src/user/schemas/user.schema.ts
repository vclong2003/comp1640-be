import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { UserFaculty, UserFacultySchema } from './user-faculty.schema';
import { UserSession, UserSessionSchema } from './user-session.schema';
import { Event } from 'src/event/schemas/event.schema';
import { Contribution } from 'src/contribution/schemas/contribution.schema';
import { EGender, ERole } from '../user.enums';

@Schema()
export class User {
  _id: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop()
  phone: string;

  @Prop()
  avatar_url: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  dob: Date;

  @Prop()
  gender: EGender;

  @Prop({ required: true })
  role: ERole;

  @Prop({ required: true })
  password: string;

  @Prop({ type: UserFacultySchema })
  faculty?: UserFaculty;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: Event.name })
  participated_event_ids: string[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: Contribution.name })
  submitted_contribution_ids: string[];

  @Prop({ type: [UserSessionSchema] })
  sessions: UserSession[];

  @Prop({ default: false })
  disabled: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
