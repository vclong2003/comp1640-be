import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

@Schema()
export class Faculty {
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  mc: string;

  @Prop()
  event_ids: string[];

  @Prop()
  contribution_ids: string[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: User.name })
  student_ids: string[];
}
