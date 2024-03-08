import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { GuestRegisterDto } from './dtos/guest-register.dto';
import { User } from 'src/user/schemas/user.schema';
import { EPasswordConfigKey } from 'src/config/password.config';

import * as bcrypt from 'bcrypt';
import { ERole } from 'src/user/eums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async guestRegister(dto: GuestRegisterDto): Promise<User> {
    const user = await this.userService.createUser({
      ...dto,
      password: await this.hashPassword(dto.password),
      role: ERole.Guest,
    });
    return user;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) return null;
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) return user;
    return null;
  }

  async hashPassword(password: string): Promise<string> {
    const passwordRound = await this.configService.get(
      EPasswordConfigKey.Rounds,
    );
    return bcrypt.hash(password, passwordRound);
  }
}
