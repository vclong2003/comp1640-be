import { Global, Module } from '@nestjs/common';
import { ConfigModule as BaseConfigModule } from '@nestjs/config';
import apiConfig from 'src/config/api.config';
import clientConfig from 'src/config/client.config';
import jwtConfig from 'src/config/jwt.config';
import mailConfig from 'src/config/mail.config';
import passwordConfig from 'src/config/password.config';

const configModule = BaseConfigModule.forRoot({
  envFilePath: ['.env', '.env.production'],
  load: [apiConfig, jwtConfig, passwordConfig, mailConfig, clientConfig],
  cache: true,
});

@Global()
@Module({
  imports: [configModule],
  exports: [configModule],
})
export class ConfigModule {}

// VCL'S NOTES: KEYS MUST BE UNIQUE
