import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { EJwtConfigKey } from 'src/config/jwt.config';
import { IAccessTokenPayload } from 'src/shared-modules/jwt/jwt.interfaces';

export const STRATEGY_NAME = 'access-token';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  STRATEGY_NAME,
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => req.cookies['access_token'],
      ignoreExpiration: false,
      secretOrKey: configService.get(EJwtConfigKey.AccessTokenSecret),
    });
  }

  async validate(payload: IAccessTokenPayload) {
    // Will embed to the req as "user"
    return payload;
  }
}
