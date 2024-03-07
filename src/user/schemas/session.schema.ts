import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Session {
  _id: string;

  @Prop()
  browser: string;

  @Prop()
  date: Date;

  @Prop()
  token: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
