import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/user/schemas/user.schema';
import { EventSchema } from '../../event/schemas/event.schema';
import { FacultySchema } from '../../faculty/schemas/faculty.schema';
import { ContributionSchema } from '../../contribution/schemas/contribution.schema';

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
