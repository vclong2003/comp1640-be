import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { STRATEGY_NAME } from '../strategies/access-token.strategy';
import { Reflector } from '@nestjs/core';
import { NO_ACCESS_TOKEN_KEY } from '../decorators/no-access-token.decorator';
import { AuthService } from '../auth.service';

@Injectable()
export class AccessTokenGuard extends AuthGuard(STRATEGY_NAME) {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {
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

  handleRequest(err, user, info, context) {
    if (user) return user;
    const req = context.switchToHttp().getRequest();
    const refreshToken = req.cookies['refresh_token'];
    console.log('Refresh Token', refreshToken);
    if (refreshToken) {
      this.authService
        .refreshAccessToken(refreshToken)
        .then(({ accessToken, user }) => {
          req.res.cookie('access_token', accessToken, {
            sameSite: 'strict',
            httpOnly: true,
          });
          return user;
        })
        .catch(() => {
          throw new UnauthorizedException('Invalid tokens!');
        });
    }
  }
}
