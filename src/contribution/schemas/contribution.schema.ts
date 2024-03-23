import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  ContributionAuthor,
  ContributionAuthorSchema,
} from './contribution.author.schema';
import {
  ContributionFaculty,
  ContributionFacultySchema,
} from './contribution-faculty.schema';
import {
  ContributionEvent,
  ContributionEventSchema,
} from './contribution-event.schema';

import mongoose from 'mongoose';
import { CommentSchema } from './contribution-comment/comment.schema';
import {
  ContributionFile,
  ContributionFileSchema,
} from './contribution-file.schemas';

@Schema()
export class Contribution {
  _id: string;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  submitted_at: Date;

  @Prop()
  is_publication: boolean;

  @Prop({ type: ContributionAuthorSchema })
  author: ContributionAuthor;

  @Prop({ type: ContributionFacultySchema })
  faculty: ContributionFaculty;

  @Prop({ type: ContributionEventSchema })
  event: ContributionEvent;

  @Prop({ type: [CommentSchema] })
  private_comments: Comment[];

  @Prop({ type: [CommentSchema] })
  comments: Comment[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  liked_user_ids: string[];

  @Prop({ type: [ContributionFileSchema] })
  documents: ContributionFile[];

  @Prop({ type: [ContributionFileSchema] })
  images: ContributionFile[];

  @Prop()
  edited_at: Date;

  @Prop()
  versions: Partial<Contribution>[];

  @Prop({ required: true, default: null })
  deleted_at: Date;
}

export const ContributionSchema = SchemaFactory.createForClass(Contribution);
