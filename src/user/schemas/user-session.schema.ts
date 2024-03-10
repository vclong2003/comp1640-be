import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UserSession {
  _id?: string;

  @Prop()
  browser: string;

  @Prop()
  date: Date;

  @Prop()
  token: string;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);
