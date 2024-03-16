import { Module } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { ContributionController } from './contribution.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ContributionSchema } from './schemas/contribution.schema';
import { StorageModule } from 'src/shared-modules/storage/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Contribution', schema: ContributionSchema },
    ]),
    StorageModule,
  ],
  providers: [ContributionService],
  controllers: [ContributionController],
})
export class ContributionModule {}
