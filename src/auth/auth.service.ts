import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { GuestRegisterDto } from './dtos/guest-register.dto';
import { User } from 'src/user/schemas/user.schema';
import { ERole } from 'src/user/eums/role.enum';
import { PasswordService } from '../shared-modules/password/password.service';
import { LoginResponseDto } from './dtos/login-response.dto';
import { JwtService } from 'src/shared-modules/jwt/jwt.service';
import { UAParser } from 'ua-parser-js';
import { IAccessTokenPayload } from 'src/shared-modules/jwt/interfaces/access-token-payload.interface';

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

  async login(user: User, ua: string): Promise<LoginResponseDto> {
    const { _id, role } = user;
    const accessToken = await this.jwtService.genAccessToken({ _id, role });
    const refreshToken = await this.jwtService.genRefreshToken({ _id });
    const uaResult = UAParser(ua);
    console.log('User Agent', uaResult);
    return { accessToken, refreshToken };
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; user: IAccessTokenPayload }> {
    const { _id } = await this.jwtService.verifyRefreshToken(refreshToken);
    const user = await this.userService.findOneById(_id);
    const accessTokenPayload = { _id: user._id, role: user.role };
    const accessToken =
      await this.jwtService.genAccessToken(accessTokenPayload);
    return { accessToken, user: accessTokenPayload };
  }
}
