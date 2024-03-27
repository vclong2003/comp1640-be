import { Injectable } from '@nestjs/common';
import { MailerService as BaseMailerService } from '@nestjs-modules/mailer';
import {
  SendGuestRegisterEmailDto,
  SendResetPasswordEmailDto,
} from './mailer.dtos';

@Injectable()
export class MailerService {
  constructor(private baseMailerService: BaseMailerService) {}

  async sendRegisterEmail(dto: SendGuestRegisterEmailDto) {
    const { email, url } = dto;
    try {
      await this.baseMailerService.sendMail({
        to: email,
        from: 'System <vclong2003@gmail.com>',
        subject: 'Finish your registration',
        template: 'create-account', // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
        context: {
          email: email,
          registerUrl: url,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error('Error when sending email!');
    }
  }

  async sendResetPasswordEmail(dto: SendResetPasswordEmailDto) {
    const { email, name, url } = dto;
    try {
      await this.baseMailerService.sendMail({
        to: email,
        from: 'System <vclong2003@gmail.com>',
        subject: 'Reset your password',
        template: 'reset-password', // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
        context: {
          name: name,
          resetPasswordUrl: url,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error('Error when sending email!');
    }
  }
}
