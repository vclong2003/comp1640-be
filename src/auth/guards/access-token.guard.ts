import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { STRATEGY_NAME } from '../strategies/access-token.strategy';
import { Reflector } from '@nestjs/core';
import { NO_ACCESS_TOKEN_KEY } from '../decorators/no-access-token.decorator';

@Injectable()
export class AccessTokenGuard extends AuthGuard(STRATEGY_NAME) {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isNoAccessTokenRequired = this.reflector.getAllAndOverride(
      NO_ACCESS_TOKEN_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isNoAccessTokenRequired) return true;
    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err || !user) throw new UnauthorizedException('Invalid access token!');
    return user;
  }
}
