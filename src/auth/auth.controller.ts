import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GuestRegisterDto } from './dtos/guest-register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('guest-register')
  async guestRegister(@Body() dto: GuestRegisterDto) {
    return await this.authService.guestRegister(dto);
  }
}
