import { Global, Module } from '@nestjs/common';
import { ConfigModule as BaseConfigModule } from '@nestjs/config';
import apiConfig from 'src/config/api.config';
import jwtConfig from 'src/config/jwt.config';
import mailConfig from 'src/config/mail.config';
import passwordConfig from 'src/config/password.config';

const configModule = BaseConfigModule.forRoot({
  load: [apiConfig, jwtConfig, passwordConfig, mailConfig],
  cache: true,
});

@Global()
@Module({
  imports: [configModule],
  exports: [configModule],
})
export class ConfigModule {}

// VCL'S NOTES: KEYS MUST BE UNIQUE
