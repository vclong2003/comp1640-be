import { Module } from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { FacultyController } from './faculty.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FacultySchema } from './schemas/faculty.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Faculty', schema: FacultySchema }]),
  ],
  providers: [FacultyService],
  controllers: [FacultyController],
  exports: [FacultyService],
})
export class FacultyModule {}
