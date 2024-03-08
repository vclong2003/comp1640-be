import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PasswordModule } from 'src/shared-modules/password/password.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from 'src/shared-modules/jwt/jwt.module';
import { AccessTokenStrategy } from './strategies/access-token.strategy';

@Module({
  imports: [UserModule, PasswordModule, JwtModule],
  providers: [AuthService, LocalStrategy, AccessTokenStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
