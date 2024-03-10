import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class ContributionFile {
  _id?: string;

  @Prop()
  file_name: string;

  @Prop()
  file_url: string;
}

export const ContributionFileSchema =
  SchemaFactory.createForClass(ContributionFile);
