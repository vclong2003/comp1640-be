import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class LoginSession {
  _id: string;

  @Prop()
  browser: string;

  @Prop()
  date: Date;

  @Prop()
  token: string;
}

export const LoginSessionSchema = SchemaFactory.createForClass(LoginSession);
