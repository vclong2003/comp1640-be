import { Module } from '@nestjs/common';
import { JwtModule as BaseJwtModule } from '@nestjs/jwt';
import { ConfigModule } from '../config/config.module';
import { JwtService } from './jwt.service';

const jwtModule = BaseJwtModule.register({});

@Module({
  imports: [jwtModule, ConfigModule],
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
