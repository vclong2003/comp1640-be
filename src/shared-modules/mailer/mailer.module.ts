import { Module } from '@nestjs/common';
import { MailerModule as BaseMailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { MailerService } from './mailer.service';
import { ConfigService } from '@nestjs/config';
import { EMailConfigKey } from 'src/config/mail.config';

const mailerModule = BaseMailerModule.forRoot({
  transport: {
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: 'vclong2003@gmail.com',
      pass: 'sORUZh69gDxLkI8Q',
    },
  },
  template: {
    dir: 'dist/assets/mail-templates',
    adapter: new PugAdapter(),
    options: {
      strict: true,
    },
  },
});

@Module({
  imports: [mailerModule],
  providers: [MailerService],
  exports: [MailerService, mailerModule],
})
export class MailerModule {}
