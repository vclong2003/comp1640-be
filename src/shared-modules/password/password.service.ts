import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EPasswordConfigKey } from 'src/config/password.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PasswordService {
  constructor(private configService: ConfigService) {}

  async hashPassword(password: string): Promise<string> {
    const passwordRound = await this.configService.get(
      EPasswordConfigKey.Rounds,
    );
    return bcrypt.hash(password, passwordRound);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
