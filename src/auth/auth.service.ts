import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { GuestRegisterDto } from './dtos/guest-register.dto';
import { User } from 'src/user/schemas/user.schema';

import { ERole } from 'src/user/eums/role.enum';
import { PasswordService } from '../shared-modules/password/password.service';
import { LoginResponseDto } from './dtos/login-response.dto';
import { JwtService } from 'src/shared-modules/jwt/jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private passwordService: PasswordService,
    private jwtService: JwtService,
  ) {}

  async guestRegister(dto: GuestRegisterDto): Promise<User> {
    const user = await this.userService.createUser({
      ...dto,
      password: await this.passwordService.hashPassword(dto.password),
      role: ERole.Guest,
    });
    return user;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) return null;
    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password,
    );
    if (isPasswordValid) return user;
    return null;
  }

  async login(user: User): Promise<LoginResponseDto> {
    const { _id, role } = user;
    const accessToken = await this.jwtService.genAccessToken({ id: _id, role });
    const refreshToken = await this.jwtService.genRefreshToken({ id: _id });
    return { accessToken, refreshToken };
  }
}
