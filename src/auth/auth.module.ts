import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PasswordModule } from 'src/shared-modules/password/password.module';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [UserModule, PasswordModule],
  providers: [AuthService, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
