import { Module } from '@nestjs/common';
import { ConfigModule } from './shared-modules/config/config.module';
import { PinoLoggerModule } from './shared-modules/pino-logger/pino-logger.module';
import { MongooseModule } from './shared-modules/mongoose/mongoose.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FacultyModule } from './faculty/faculty.module';
import { EventModule } from './event/event.module';
import { ContributionModule } from './contribution/contribution.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './auth/guards/access-token.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule,
    MongooseModule,
    PinoLoggerModule,
    UserModule,
    AuthModule,
    FacultyModule,
    EventModule,
    ContributionModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

//test pr dev
