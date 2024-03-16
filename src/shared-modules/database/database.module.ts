import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/shared-modules/database/schemas/user/user.schema';
import { EventSchema } from './schemas/event/event.schema';
import { FacultySchema } from './schemas/faculty/faculty.schema';
import { ContributionSchema } from './schemas/contribution/contribution.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Event', schema: EventSchema },
      { name: 'Faculty', schema: FacultySchema },
      { name: 'Contribution', schema: ContributionSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
