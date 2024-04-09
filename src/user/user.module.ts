import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { StorageModule } from 'src/shared-modules/storage/storage.module';
import { UserHelper } from './user.helper';

@Module({
  imports: [StorageModule],
  providers: [UserService, UserHelper],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
