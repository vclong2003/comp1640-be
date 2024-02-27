import { Module } from '@nestjs/common';
import { ConfigModule } from './shared-modules/config/config.module';
import { PinoLoggerModule } from './shared-modules/pino-logger/pino-logger.module';
import { MongooseModule } from './shared-modules/mongoose/mongoose.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ConfigModule, MongooseModule, PinoLoggerModule, UserModule],
  providers: [],
})
export class AppModule {}
