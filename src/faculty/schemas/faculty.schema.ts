import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FacultyMc, FacultyMcSchema } from './faculty-mc.schema';

@Schema()
export class Faculty {
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  banner_image_url: string;

  @Prop({ type: FacultyMcSchema })
  mc: FacultyMc;

  @Prop({ default: null })
  deleted_at: Date;
}

export const FacultySchema = SchemaFactory.createForClass(Faculty);

FacultySchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { deleted_at: null } });
});

FacultySchema.pre('save', async function (next) {
  const modifiedFields = this.modifiedPaths();

  // Update related MC
  if (modifiedFields.includes('mc') && this?.mc) {
    await this.model('User').updateOne(
      { _id: this.mc._id },
      {
        $set: {
          'faculty._id': this._id,
          'faculty.name': this.name,
        },
      },
    );

    await this.model('Event').updateMany(
      { 'faculty._id': this._id },
      {
        $set: {
          'faculty.mc._id': this.mc._id,
          'faculty.mc.name': this.mc.name,
          'faculty.mc.avatar_url': this.mc.avatar_url,
          'faculty.mc.email': this.mc.email,
        },
      },
    );
  }

  // Updat related name
  if (modifiedFields.includes('name')) {
    await this.model('User').updateMany(
      { 'faculty._id': this._id },
      {
        $set: {
          'faculty.name': this.name,
        },
      },
    );
    await this.model('Event').updateMany(
      { 'faculty._id': this._id },
      {
        $set: {
          'faculty.name': this.name,
        },
      },
    );
    await this.model('Contribution').updateMany(
      { 'faculty._id': this._id },
      {
        $set: {
          'faculty.name': this.name,
        },
      },
    );
  }

  // Cascade delete
  if (modifiedFields.includes('deleted_at')) {
    if (this.deleted_at) {
      await this.model('User').updateMany(
        { 'faculty._id': this._id },
        {
          $set: {
            faculty: null,
          },
        },
      );
      await this.model('Event').updateMany(
        { 'faculty._id': this._id },
        {
          $set: {
            deleted_at: this.deleted_at,
          },
        },
      );
      await this.model('Contribution').updateMany(
        { 'faculty._id': this._id },
        {
          $set: {
            deleted_at: this.deleted_at,
          },
        },
      );
    }
  }

  next();
});
