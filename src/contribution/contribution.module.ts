import { Module } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { ContributionController } from './contribution.controller';
import { StorageModule } from 'src/shared-modules/storage/storage.module';
import { ContributionHelper } from './contribution.helper';

@Module({
  imports: [StorageModule],
  providers: [ContributionService, ContributionHelper],
  controllers: [ContributionController],
})
export class ContributionModule {}
