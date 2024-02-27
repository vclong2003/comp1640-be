import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ERole } from '../eums/role.enum';
import { LoginSession, LoginSessionSchema } from './login-session.schema';

@Schema()
export class User {
  _id: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  roles: ERole[];

  @Prop({ type: [LoginSessionSchema] })
  sessions: LoginSession[];

  @Prop()
  name: string;

  @Prop()
  avatar_url: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
