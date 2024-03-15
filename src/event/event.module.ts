import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventSchema } from './schemas/event.schema';
import { MongooseModule } from '@nestjs/mongoose';

import { FacultyModule } from 'src/faculty/faculty.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
    FacultyModule,
    UserModule,
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
