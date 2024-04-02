import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/user/schemas/user.schema';
import { PasswordService } from '../shared-modules/password/password.service';
import { LoginResponseDto } from './dtos/login-response.dto';
import { JwtService } from 'src/shared-modules/jwt/jwt.service';
import { UAParser } from 'ua-parser-js';
import { IUserAgent } from './interfaces/user-agent.interface';
import {
  SendRegisterEmailDto,
  SetupAccountDto,
  VerifyRegisterTokenResponseDto,
} from './dtos/register.dto';
import { MailerService } from 'src/shared-modules/mailer/mailer.service';
import { Faculty } from 'src/faculty/schemas/faculty.schema';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TokensDto } from './dtos/tokens.dto';
import { ConfigService } from '@nestjs/config';
import { EClientConfigKeys } from 'src/config/client.config';
import { ChangePasswordDto } from './dtos/change-password.dto';
import {
  FindLoginSessionsDto,
  LoginSessionResponseDto,
  RemoveLoginSessionDto,
} from './dtos/login-session.dto';
import { UserResponseDto } from 'src/user/user.dtos';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Faculty') private facultyModel: Model<Faculty>,
    private passwordService: PasswordService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendRegisterEmail(dto: SendRegisterEmailDto): Promise<void> {
    const { email, role, facultyId } = dto;

    if (await this.userModel.exists({ email })) {
      throw new ConflictException('User already exists!');
    }

    if (facultyId && !(await this.facultyModel.exists({ _id: facultyId }))) {
      throw new BadRequestException('Faculty not found!');
    }

    const token = await this.jwtService.genRegisterToken({
      email,
      role,
      facultyId,
    });
    const clientUrl = await this.configService.get(EClientConfigKeys.Url);
    const url = `${clientUrl}/setup-account?token=${token}`;
    await this.mailerService.sendRegisterEmail({ email, url });
  }

  async verifyRegisterToken(
    token: string,
  ): Promise<VerifyRegisterTokenResponseDto> {
    const payload = await this.jwtService.verifyRegisterToken(token);
    if (!payload) {
      throw new BadRequestException('This URL might have been expired!');
    }
    return { email: payload.email };
  }

  async setupAccount(dto: SetupAccountDto): Promise<void> {
    const { token, name, password, dob, phone, gender } = dto;
    const { email, role, facultyId } =
      await this.jwtService.verifyRegisterToken(token);
    if (await this.userModel.exists({ email })) {
      throw new BadRequestException('User already exists!');
    }
    const newUser = new this.userModel({
      email,
      role,
      name,
      password: await this.passwordService.hashPassword(password),
      dob,
      phone,
      gender,
      faculty: facultyId ? { _id: facultyId } : null,
    });
    await newUser.save();
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email });
    if (!user || user.disabled) {
      return null;
    }
    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password,
    );
    return isPasswordValid ? user : null;
  }

  async login(user: User, ua: string): Promise<LoginResponseDto> {
    const { _id, role, faculty } = user;
    const accessToken = await this.jwtService.genAccessToken({
      _id,
      role,
      facultyId: faculty?._id,
    });
    const refreshToken = await this.jwtService.genRefreshToken({ _id });
    const userAgent: IUserAgent = UAParser(ua);
    const browser = `${userAgent.browser.name} on ${userAgent.os.name}`;
    await this.userModel.findByIdAndUpdate(_id, {
      $push: { sessions: { browser, token: refreshToken, date: new Date() } },
    });
    return { accessToken, refreshToken, user: this.sanitizeUser(user) };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required!');
    }
    const { _id } = await this.jwtService.verifyRefreshToken(refreshToken);
    const user = await this.userModel.findById(_id);
    if (
      !user ||
      !user.sessions.find((session) => session.token === refreshToken)
    ) {
      throw new UnauthorizedException('Invalid refresh token!');
    }
    return await this.jwtService.genAccessToken({
      _id,
      role: user.role,
      facultyId: user.faculty?._id,
    });
  }

  async googleLoginCallback(email: string, ua: string): Promise<TokensDto> {
    const userAgent: IUserAgent = UAParser(ua);
    const browser = `${userAgent.browser.name} on ${userAgent.os.name}`;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return null;
    }
    const accessToken = await this.jwtService.genAccessToken({
      _id: user._id,
      role: user.role,
      facultyId: user.faculty?._id,
    });
    const refreshToken = await this.jwtService.genRefreshToken({
      _id: user._id,
    });
    user.sessions.push({ browser, token: refreshToken, date: new Date() });
    await user.save();
    return { accessToken, refreshToken };
  }

  async sendResetPasswordEmail(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not found!');
    }
    const token = await this.jwtService.genResetPasswordToken({
      userId: user._id,
    });
    const clientUrl = await this.configService.get(EClientConfigKeys.Url);
    const url = `${clientUrl}/reset-password?token=${token}`;
    await this.mailerService.sendResetPasswordEmail({
      email,
      name: user.name,
      url,
    });
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const { token, password } = dto;
    const { userId } = await this.jwtService.verifyResetPasswordToken(token);
    await this.userModel.findByIdAndUpdate(userId, {
      password: await this.passwordService.hashPassword(password),
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found!');
    }
    const { oldPassword, newPassword } = dto;
    const isPasswordValid = await this.passwordService.comparePassword(
      oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Old password is incorrect!');
    }
    await this.userModel.findByIdAndUpdate(userId, {
      password: await this.passwordService.hashPassword(newPassword),
    });
  }

  async findLoginSessions(
    userId: string,
    currentRefreshToken: string,
    dto: FindLoginSessionsDto,
  ): Promise<LoginSessionResponseDto[]> {
    const { limit = 100, skip = 0 } = dto;
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found!');
    }
    const sessions = user.sessions
      .map((session) => ({
        _id: session._id,
        browser: session.browser,
        date: session.date,
        isCurrentDevice: session.token === currentRefreshToken,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(skip, skip + limit);
    return sessions;
  }

  async removeLoginSession(
    userId: string,
    dto: RemoveLoginSessionDto,
  ): Promise<void> {
    const { sessionId } = dto;
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { sessions: { _id: sessionId } },
    });
  }

  async removeAllLoginSessions(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { sessions: [] });
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required!');
    }
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { sessions: { token: refreshToken } },
    });
  }

  private sanitizeUser(user: User): UserResponseDto {
    const { _id, name, email, role, faculty, avatar_url, gender, dob, phone } =
      user;
    return { _id, name, email, role, faculty, avatar_url, gender, dob, phone };
  }
}
