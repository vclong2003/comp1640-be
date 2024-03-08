import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as BaseJwtService } from '@nestjs/jwt';
import { EJwtConfigKey } from 'src/config/jwt.config';
import { IRefreshTokenPayload } from './interfaces/refresh-token-payload.interface';
import { IAccessTokenPayload } from './interfaces/access-token-payload.interface';

@Injectable()
export class JwtService {
  constructor(
    private configService: ConfigService,
    private baseJwtService: BaseJwtService,
  ) {}

  async genRefreshToken(payload: IRefreshTokenPayload): Promise<string> {
    const secret = this.configService.get(EJwtConfigKey.RefreshTokenSecret);
    const token = await this.baseJwtService.signAsync(payload, { secret });
    return token;
  }

  async genAccessToken(payload: IAccessTokenPayload): Promise<string> {
    const secret = this.configService.get(EJwtConfigKey.AccessTokenSecret);
    const expiresIn = this.configService.get(EJwtConfigKey.AccessTokenExpire);
    const tokenOptions = { secret, expiresIn };
    const token = await this.baseJwtService.signAsync(payload, tokenOptions);
    return token;
  }

  async verifyRefreshToken(token: string): Promise<IRefreshTokenPayload> {
    const secret = this.configService.get(EJwtConfigKey.RefreshTokenSecret);
    const payload = await this.baseJwtService.verifyAsync(token, { secret });
    return payload;
  }
}
