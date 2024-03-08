import { Global, Module } from '@nestjs/common';
import { MailerModule as BaseMailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { MailerService } from './mailer.service';
import { ConfigService } from '@nestjs/config';
import { EMailConfigKey } from 'src/config/mail.config';

const mailerModule = BaseMailerModule.forRootAsync({
  useFactory: async (configService: ConfigService) => ({
    transport: {
      host: await configService.get(EMailConfigKey.Host),
      port: await configService.get(EMailConfigKey.Port),
      secure: false,
      auth: {
        user: await configService.get(EMailConfigKey.User),
        pass: await configService.get(EMailConfigKey.Pass),
      },
    },
    template: {
      dir: 'dist/assets/mail-templates',
      adapter: new PugAdapter(),
      options: {
        strict: true,
      },
    },
  }),
  inject: [ConfigService],
});

@Global()
@Module({
  imports: [mailerModule],
  providers: [MailerService],
  exports: [mailerModule, MailerService],
})
export class MailerModule {}
