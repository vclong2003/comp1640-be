import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Faculty {
  _id: string;

  @Prop()
  name: string;
}
