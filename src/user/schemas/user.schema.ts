import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ERole } from '../eums/role.enum';
import mongoose from 'mongoose';
import { EGender } from '../eums/gender.enum';
import { UserFaculty, UserFacultySchema } from './user-faculty.schema';
import { UserSession, UserSessionSchema } from './user-session.schema';

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

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Event' })
  participated_event_ids: string[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Contribution' })
  submitted_contribution_ids: string[];

  @Prop({ type: [UserSessionSchema] })
  sessions: UserSession[];
}

export const UserSchema = SchemaFactory.createForClass(User);
