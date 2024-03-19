import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

export const STRATEGY_NAME = 'google-oauth2';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, STRATEGY_NAME) {
  constructor() {
    super({
      clientID:
        '1053026754081-ra71nnaem7dd66joj3shbpr1qmb07p3g.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:4000/auth/google-login',
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
