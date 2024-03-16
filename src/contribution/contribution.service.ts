import { Injectable } from '@nestjs/common';
import { StorageModule } from 'src/shared-modules/storage/storage.module';

@Injectable()
export class ContributionService {
  constructor(private storageModule: StorageModule) {}
}
