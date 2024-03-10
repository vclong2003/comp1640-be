import { Injectable } from '@nestjs/common';
import { MailerService as BaseMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private baseMailerService: BaseMailerService) {}

  async test() {
    try {
      await this.baseMailerService.sendMail({
        to: 'vclong2003@gmail.com',
        from: 'System <vclong2003@gmail.com>',
        subject: 'Testing Nest Mailermodule with template ✔',
        template: 'reset-password', // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
        context: {
          testLink: 'https://google.com',
          username: 'Vu Cong Long',
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error('Error when sending email');
    }
  }

  async sendRegisterEmail(email: string, token: string) {
    try {
      await this.baseMailerService.sendMail({
        to: email,
        from: 'System <vclong2003@gmail.com>',
        subject: 'Finish your registration',
        template: 'create-account', // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
        context: {
          email: email,
          registerUrl: token,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error('Error when sending email');
    }
  }
}
