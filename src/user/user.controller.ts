import { Controller, Get } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ERole } from './eums/role.enum';

@Controller('user')
export class UserController {
  @Get('test')
  @Roles([ERole.Guest, ERole.Admin])
  test() {
    return 'ok';
  }
}
