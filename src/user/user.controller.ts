import { Controller, Get } from '@nestjs/common';

@Controller('user')
export class UserController {
  @Get('test')
  test() {
    return 'ok';
  }
}
