import { Module } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { ContributionController } from './contribution.controller';
import { StorageModule } from 'src/shared-modules/storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [ContributionService],
  controllers: [ContributionController],
})
export class ContributionModule {}
