import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { EApiConfigKey } from './config/api.config';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { EClientConfigKeys } from './config/client.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  const configService = app.get<ConfigService>(ConfigService);

  const clientUrl = configService.get(EClientConfigKeys.Url);

  console.log('Client URL: ', clientUrl, `\n`);

  app.enableCors({
    origin: clientUrl,
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  const port = configService.get(EApiConfigKey.Port);

  // Swagger
  const config = new DocumentBuilder().setTitle('ALHKQ API').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  console.log('Server is running on port: ', port, `\n`);
}
bootstrap();
