import { Module } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { ContributionController } from './contribution.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ContributionSchema } from './schemas/contribution.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Contribution', schema: ContributionSchema },
    ]),
  ],
  providers: [ContributionService],
  controllers: [ContributionController],
})
export class ContributionModule {}
