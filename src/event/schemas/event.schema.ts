import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EventFaculty, EventFacultySchema } from './event-faculty';

@Schema()
export class Event {
  _id: string;

  @Prop()
  name: string;

  @Prop()
  start_date: Date;

  @Prop()
  description: string;

  @Prop()
  banner_image_url: string;

  @Prop()
  first_closure_date: Date;

  @Prop()
  final_closure_date: Date;

  @Prop({ type: EventFacultySchema })
  faculty: EventFaculty;

  @Prop({ default: null })
  deleted_at: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { deleted_at: null } });
});

EventSchema.pre('save', async function (next) {
  const modifiedFields = this.modifiedPaths();

  // Update related contribution
  if (
    modifiedFields.includes('name') ||
    modifiedFields.includes('final_closure_date')
  ) {
    await this.model('Contribution').updateMany(
      { 'event._id': this._id },
      {
        'event.name': this.name,
        'event.final_closure_date': this.final_closure_date,
      },
    );
  }

  // Cascade delete
  if (modifiedFields.includes('deleted_at')) {
    if (this.deleted_at) {
      await this.model('Contribution').updateMany(
        { 'event._id': this._id },
        { $set: { deleted_at: this.deleted_at } },
      );
    }
  }

  next();
});
