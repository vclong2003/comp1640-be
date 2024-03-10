import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { STRATEGY_NAME } from '../strategies/local.strategy';

@Injectable()
export class LocalAuthGuard extends AuthGuard(STRATEGY_NAME) {
  handleRequest(err, user) {
    if (err || !user)
      throw new UnauthorizedException('Please check your email and password!');
    return user;
  }
}
