import { Module, forwardRef } from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { FacultyController } from './faculty.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FacultySchema } from './schemas/faculty.schema';
import { UserModule } from 'src/user/user.module';
import { EventModule } from 'src/event/event.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Faculty', schema: FacultySchema }]),
    forwardRef(() => EventModule),
    UserModule,
  ],
  providers: [FacultyService],
  controllers: [FacultyController],
  exports: [FacultyService],
})
export class FacultyModule {}
