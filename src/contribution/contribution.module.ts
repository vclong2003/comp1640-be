import { Module } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { ContributionController } from './contribution.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ContributionSchema } from './schemas/contribution.schema';
import { StorageModule } from 'src/shared-modules/storage/storage.module';
import { UserModule } from 'src/user/user.module';
import { FacultyModule } from 'src/faculty/faculty.module';
import { EventModule } from 'src/event/event.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Contribution', schema: ContributionSchema },
    ]),
    StorageModule,
    UserModule,
    FacultyModule,
    EventModule,
  ],
  providers: [ContributionService],
  controllers: [ContributionController],
})
export class ContributionModule {}
