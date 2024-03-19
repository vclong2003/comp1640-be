import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { STRATEGY_NAME } from '../strategies/google.strategy';

@Injectable()
export class GoogleAuthGuard extends AuthGuard(STRATEGY_NAME) {
  constructor() {
    super({ accessType: 'offline' });
    //offline so that Google can return a refresh token after successful authentication.
  }
}
