import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { StorageModule } from 'src/shared-modules/storage/storage.module';
import { EventHelper } from './event.helper';

@Module({
  imports: [StorageModule],
  controllers: [EventController],
  providers: [EventService, EventHelper],
  exports: [EventService],
})
export class EventModule {}
