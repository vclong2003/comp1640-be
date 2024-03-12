import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GuestRegisterDto } from './dtos/guest-register.dto';
import { NoAccessToken } from './decorators/no-access-token.decorator';
import { SendRegisterEmailDto } from './dtos/send-register-email.dto';
import { ApiBody } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { SetupAccountDto } from './dtos/setup-account.dto';

@Controller('auth')
export class AuthController {
  readonly cookieOptions = {
    sameSite: 'strict',
    httpOnly: true,
  };
  constructor(private authService: AuthService) {}

  @NoAccessToken()
  @Post('guest-register')
  async guestRegister(@Body() dto: GuestRegisterDto) {
    return await this.authService.guestRegister(dto);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', default: 'vclong2003@gmail.com' },
        password: { type: 'string', default: '12345678' },
      },
    },
  })
  @Post('login')
  @NoAccessToken()
  @UseGuards(LocalAuthGuard)
  async login(@Request() req, @Response() res) {
    const ua = req.headers['user-agent'];
    const { refreshToken, accessToken } = await this.authService.login(
      req.user,
      ua,
    );
    res.cookie('refresh_token', refreshToken, this.cookieOptions);
    res.cookie('access_token', accessToken, this.cookieOptions);
    return res.status(200).send();
  }

  @NoAccessToken()
  @Get('access-token')
  async getAccessToken(@Request() req, @Response() res) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) throw new BadRequestException('No refresh token');
    const accessToken = await this.authService.refreshAccessToken(refreshToken);
    res.cookie('access_token', accessToken, this.cookieOptions);
    return res.status(200).send();
  }

  @Get('')
  async test(@Request() req) {
    return req.user;
  }

  @Post('send-register-email')
  async sendRegisterEmail(@Body() dto: SendRegisterEmailDto, @Response() res) {
    await this.authService.sendRegisterEmail(dto);
    return res.status(200).send();
  }

  @NoAccessToken()
  @Post('setup-account')
  async setupAccount(@Body() dto: SetupAccountDto) {
    return await this.authService.setupAccount(dto);
  }
}
