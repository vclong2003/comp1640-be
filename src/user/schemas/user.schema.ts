import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ERole } from '../eums/role.enum';
import { Session, SessionSchema } from './session.schema';
import mongoose from 'mongoose';
import { Faculty, FacultySchema } from './faculty.schema';
import { EGender } from '../eums/gender.enum';

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
  roles: ERole;

  @Prop({ required: true })
  password: string;

  @Prop({ type: FacultySchema })
  faculty?: Faculty;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Event' })
  participated_event_ids: string[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Contribution' })
  submitted_contribution_ids: string[];

  @Prop({ type: [SessionSchema] })
  sessions: Session[];
}

export const UserSchema = SchemaFactory.createForClass(User);
