import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Faculty {
  @Prop()
  _id: string;

  @Prop()
  name: string;
}
