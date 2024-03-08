import { Module } from '@nestjs/common';
import { JwtModule as BaseJwtModule } from '@nestjs/jwt';
import { ConfigModule } from '../config/config.module';

const jwtModule = BaseJwtModule.register({});

@Module({
  imports: [jwtModule, ConfigModule],
  providers: [],
  exports: [jwtModule],
})
export class JwtModule {}
