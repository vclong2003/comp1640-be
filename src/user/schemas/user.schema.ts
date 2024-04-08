import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { UserFaculty, UserFacultySchema } from './user-faculty.schema';
import { UserSession, UserSessionSchema } from './user-session.schema';
import { EGender, ERole } from '../user.enums';

@Schema()
export class User {
  _id: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop()
  phone: string;

  @Prop()
  avatar_url: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  dob: Date;

  @Prop()
  gender: EGender;

  @Prop({ required: true })
  role: ERole;

  @Prop({ required: true })
  password: string;

  @Prop({ type: UserFacultySchema })
  faculty?: UserFaculty;

  @Prop({ type: [UserSessionSchema] })
  sessions: UserSession[];

  @Prop({ default: false })
  disabled: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  const modifiedFields = this.modifiedPaths();

  // Update related name, avatar_url
  if (
    modifiedFields.includes('name') ||
    modifiedFields.includes('avatar_url')
  ) {
    await this.model('Faculty').updateOne(
      { 'mc._id': this._id },
      {
        $set: {
          'mc.name': this.name,
          'mc.avatar_url': this.avatar_url,
        },
      },
    );
    await this.model('Contribution').updateMany(
      { 'author._id': this._id },
      {
        $set: {
          'author.name': this.name,
          'author.avatar_url': this.avatar_url,
        },
      },
    );
    await this.model('Contribution').updateMany(
      { 'comments.author._id': this._id },
      {
        $set: {
          'comments.$[elem].author.name': this.name,
          'comments.$[elem].author.avatar_url': this.avatar_url,
        },
      },
      { arrayFilters: [{ 'elem.author._id': this._id }] },
    );
    await this.model('Contribution').updateMany(
      { 'private_comments.author._id': this._id },
      {
        $set: {
          'private_comments.$[elem].author.name': this.name,
          'private_comments.$[elem].author.avatar_url': this.avatar_url,
        },
      },
      { arrayFilters: [{ 'elem.author._id': this._id }] },
    );
    next();
  }
});
