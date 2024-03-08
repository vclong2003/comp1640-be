import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { STRATEGY_NAME } from '../strategies/local.strategy';

@Injectable()
export class LocalAuthGuard extends AuthGuard(STRATEGY_NAME) {}
