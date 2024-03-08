import {
  Body,
  Controller,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GuestRegisterDto } from './dtos/guest-register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('guest-register')
  async guestRegister(@Body() dto: GuestRegisterDto) {
    return await this.authService.guestRegister(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Response() res) {
    const cookieOptions = {
      sameSite: 'strict',
      httpOnly: true,
    };
    const { refreshToken, accessToken } = await this.authService.login(
      req.user,
    );
    res.cookie('refresh_token', refreshToken, cookieOptions);
    res.cookie('access_token', accessToken, cookieOptions);
    return res.status(200).send();
  }
}
