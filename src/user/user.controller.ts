import { Controller, Get } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ERole } from './user.enums';

@Controller('user')
export class UserController {
  @Get('test')
  @Roles([ERole.Guest, ERole.Admin])
  test() {
    return 'ok';
  }
}
