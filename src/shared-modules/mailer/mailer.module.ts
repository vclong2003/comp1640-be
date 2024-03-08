import { Module } from '@nestjs/common';
import { MailerModule as BaseMailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { MailerService } from './mailer.service';
import { ConfigService } from '@nestjs/config';
import { EMailConfigKey } from 'src/config/mail.config';

const mailerModule = BaseMailerModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    transport: {
      host: configService.get(EMailConfigKey.SmtpHost),
      port: configService.get(EMailConfigKey.SmtpPort),
      secure: false,
      auth: {
        user: configService.get(EMailConfigKey.SmtpUser),
        pass: configService.get(EMailConfigKey.SmtpPass),
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

@Module({
  imports: [mailerModule],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
