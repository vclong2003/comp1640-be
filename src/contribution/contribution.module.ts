import { Module } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { ContributionController } from './contribution.controller';
import { StorageModule } from 'src/shared-modules/storage/storage.module';
import { ContributionHelper } from './contribution.helper';
import { MailerModule } from 'src/shared-modules/mailer/mailer.module';

@Module({
  imports: [StorageModule, MailerModule],
  providers: [ContributionService, ContributionHelper],
  controllers: [ContributionController],
})
export class ContributionModule {}
