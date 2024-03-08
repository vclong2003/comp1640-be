import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { EApiConfigKey } from './config/api.config';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.enableCors();
  app.useLogger(app.get(Logger));
  app.use(cookieParser());

  const configService = app.get<ConfigService>(ConfigService);

  const port = configService.get(EApiConfigKey.Port);

  await app.listen(port);
  console.log('Server is running on port: ', port, `\n`);
}
bootstrap();

//test dev
