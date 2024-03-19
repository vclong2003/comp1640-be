import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { NoAccessToken } from './decorators/no-access-token.decorator';
import {
  SendGuestRegisterEmailDto,
  SendRegisterEmailDto,
  SendRegisterEmailVerifycationDto,
  SetupAccountDto,
  SetupGuestAccountDto,
} from './dtos/register.dtos';
import { ApiBody } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local-auth.guard';
import {
  ResetPasswordDto,
  SendResetPasswordEmailDto,
} from './dtos/reset-password.dto';
import { Roles } from './decorators/roles.decorator';
import { ERole } from 'src/user/user.enums';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ConfigService } from '@nestjs/config';
import { EClientConfigKeys } from 'src/config/client.config';

@Controller('auth')
export class AuthController {
  readonly cookieOptions = {
    sameSite: 'strict',
    httpOnly: true,
  };
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  // Register ---------------------------------------------------------------
  @Post('send-register-email')
  @Roles([ERole.Admin])
  async sendRegisterEmail(@Body() dto: SendRegisterEmailDto, @Response() res) {
    await this.authService.sendRegisterEmail(dto);
    return res.status(200).send();
  }

  @Post('verify-register-token')
  @NoAccessToken()
  async verifyRegisterToken(@Body() dto: SendRegisterEmailVerifycationDto) {
    const { token } = dto;
    this.authService.verifyRegisterToken(token);
  }

  @Post('setup-account')
  @NoAccessToken()
  async setupAccount(@Body() dto: SetupAccountDto) {
    return await this.authService.setupAccount(dto);
  }

  // Guest Register ---------------------------------------------------------
  @Post('send-guest-register-email')
  @NoAccessToken()
  async sendGuestRegisterEmail(@Body() dto: SendGuestRegisterEmailDto) {
    const { email } = dto;
    return await this.authService.sendGuestRegisterEmail(email);
  }

  @Post('setup-guest-account')
  @NoAccessToken()
  async setupGuestAccount(@Body() dto: SetupGuestAccountDto) {
    return await this.authService.setupGuestAccount(dto);
  }

  // Login ------------------------------------------------------------------
  @Post('login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', default: 'vclong2003@gmail.com' },
        password: { type: 'string', default: '12345678' },
      },
    },
  })
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

  // Forgot password ---------------------------------------------------------
  @Post('send-reset-password-email')
  async sendResetPasswordEmail(
    @Body() dto: SendResetPasswordEmailDto,
    @Response() res,
  ) {
    const { email } = dto;
    await this.authService.sendResetPasswordEmail(email);
    return res.status(200).send();
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
  }

  // Handle tokens -----------------------------------------------------------
  @Get('access-token')
  @NoAccessToken()
  async getAccessToken(@Request() req, @Response() res) {
    const refreshToken = req.cookies['refresh_token'];
    const accessToken = await this.authService.refreshAccessToken(refreshToken);
    res.cookie('access_token', accessToken, this.cookieOptions);
    return res.status(200).send();
  }

  // Get current user --------------------------------------------------------
  @Get('')
  async getCurrentUser(@Request() req) {
    return await this.authService.getCurrentUser(req.user);
  }

  // Google login ------------------------------------------------------------
  @Get('google')
  @NoAccessToken()
  @UseGuards(GoogleAuthGuard)
  async googleLoginCallback(@Request() req, @Response() res) {
    const clientUrl = await this.configService.get(EClientConfigKeys.Url);
    const ua = req.headers['user-agent'];
    const tokens = await this.authService.googleLoginCallback(
      req.user.email,
      ua,
    );
    if (!tokens) return res.redirect(clientUrl + '/login?err=google');

    const { refreshToken, accessToken } = tokens;
    res.cookie('refresh_token', refreshToken, this.cookieOptions);
    res.cookie('access_token', accessToken, this.cookieOptions);

    return res.redirect(clientUrl);
  }
}
