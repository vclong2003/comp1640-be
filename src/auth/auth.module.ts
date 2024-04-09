import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PasswordModule } from 'src/shared-modules/password/password.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from 'src/shared-modules/jwt/jwt.module';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { MailerModule } from 'src/shared-modules/mailer/mailer.module';
import { FacultyModule } from 'src/faculty/faculty.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { UserHelper } from 'src/user/user.helper';

@Module({
  imports: [UserModule, PasswordModule, JwtModule, MailerModule, FacultyModule],
  providers: [
    AuthService,
    LocalStrategy,
    AccessTokenStrategy,
    GoogleStrategy,
    UserHelper,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
