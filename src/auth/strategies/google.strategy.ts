import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { EApiConfigKey } from 'src/config/api.config';

export const STRATEGY_NAME = 'google-oauth2';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, STRATEGY_NAME) {
  constructor(configService: ConfigService) {
    const apiUrl = configService.get(EApiConfigKey.Url);
    console.log(apiUrl);
    super({
      clientID:
        '1053026754081-ra71nnaem7dd66joj3shbpr1qmb07p3g.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: apiUrl + '/auth/google',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { emails } = profile;
    return {
      email: emails[0].value,
    };
  }
}
