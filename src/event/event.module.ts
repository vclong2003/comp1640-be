import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.conroller';
import { EventSchema } from './schemas/event.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
