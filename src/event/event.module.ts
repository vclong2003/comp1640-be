import { Module, forwardRef } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { FacultyModule } from 'src/faculty/faculty.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [forwardRef(() => FacultyModule), UserModule],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
