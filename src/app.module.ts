import { Module } from '@nestjs/common';
import { ConfigModule } from './shared-modules/config/config.module';
import { MongooseModule } from './shared-modules/mongoose/mongoose.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FacultyModule } from './faculty/faculty.module';
import { EventModule } from './event/event.module';
import { ContributionModule } from './contribution/contribution.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './auth/guards/access-token.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { DatabaseModule } from './shared-modules/database/database.module';
import { LoggerModule } from 'nestjs-pino';
import { UtilModule } from './shared-modules/util/util.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            levelFirst: true,
            colorize: true,
            ignore: 'pid,req,res',
          },
        },
      },
    }),
    UtilModule,
    ConfigModule,
    MongooseModule,
    DatabaseModule,
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
