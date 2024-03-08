import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Faculty {
  _id?: string;

  @Prop()
  name: string;
}

export const FacultySchema = SchemaFactory.createForClass(Faculty);
