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
import { ERole } from 'src/user/user.enums';
import { UtilService } from 'src/shared-modules/util/util.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Faculty') private facultyModel: Model<Faculty>,
    private passwordService: PasswordService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private configService: ConfigService,
    private utilService: UtilService,
  ) {}

  // Register ------------------------------------------------------
  async sendRegisterEmail(dto: SendRegisterEmailDto): Promise<void> {
    const { email, role, facultyId } = dto;

    const user = await this.userModel.findOne({ email });
    if (user) throw new ConflictException('User already exists!');

    if (facultyId) {
      const faculty = await this.facultyModel.findById(facultyId).exec();
      if (!faculty) throw new BadRequestException('Faculty not found!');
    }

    if (role === ERole.Student && !facultyId) {
      throw new BadRequestException('Faculty is required for student!');
    }

    if (role === ERole.Guest && !facultyId) {
      throw new BadRequestException('Faculty is required for guest!');
    }

    const token = await this.jwtService.genRegisterToken({
      email,
      role,
      facultyId,
    });

    const clientUrl = await this.configService.get(EClientConfigKeys.Url);
    const url = `${clientUrl}/setup-account?token=${token}`;
    await this.mailerService.sendRegisterEmail({ email, url });
    return;
  }

  // Verify Register Token ------------------------------------------------------
  async verifyRegisterToken(
    token: string,
  ): Promise<VerifyRegisterTokenResponseDto> {
    const payload = await this.jwtService.verifyRegisterToken(token);
    if (!payload) {
      throw new BadRequestException('This URL might have been expired!');
    }
    return { email: payload.email };
  }

  // Setup Account ------------------------------------------------------
  async setupAccount(dto: SetupAccountDto): Promise<void> {
    const { token, name, password, dob, phone, gender } = dto;
    const { email, role, facultyId } =
      await this.jwtService.verifyRegisterToken(token);

    // Check if user already exists
    const user = await this.userModel.findOne({ email });
    if (user) throw new BadRequestException('User already exists!');

    // Find faculty if role is student
    let faculty;
    if (role === ERole.Student || role === ERole.Guest) {
      if (!facultyId) throw new BadRequestException('Faculty is required!');
      faculty = await this.facultyModel.findById(facultyId);
      if (!faculty) throw new BadRequestException('Faculty not found!');
    }

    const newUser = new this.userModel({
      email,
      role,
      name,
      password: await this.passwordService.hashPassword(password),
    });
    if (dob) newUser.dob = dob;
    if (phone) newUser.phone = phone;
    if (gender) newUser.gender = gender;
    if (role === ERole.Student && faculty) {
      newUser.faculty = {
        _id: faculty._id,
        name: faculty.name,
      };
    }

    await newUser.save();
    return;
  }

  // Validate user (local strategy) ----------------------------------------------
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email });
    if (!user) return null;
    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password,
    );
    if (isPasswordValid) return user;
    return null;
  }

  // Login ---------------------------------------------------------------------
  async login(user: User, ua: string): Promise<LoginResponseDto> {
    const { _id, role, faculty, disabled } = user;
    if (disabled) {
      throw new UnauthorizedException('User is disabled!');
    }
    const accessToken = await this.jwtService.genAccessToken({
      _id,
      role,
      facultyId: faculty?._id,
    });
    const refreshToken = await this.jwtService.genRefreshToken({ _id });
    const userAgent: IUserAgent = UAParser(ua);
    const browser = userAgent.browser.name + ' on ' + userAgent.os.name;
    await this.userModel.findByIdAndUpdate(_id, {
      $push: {
        sessions: {
          browser,
          token: refreshToken,
          date: new Date(),
        },
      },
    });
    return {
      accessToken,
      refreshToken,
      user: this.utilService.sanitizeUser(user),
    };
  }

  // Get new Access Token --------------------------------------------------------
  async refreshAccessToken(refreshToken: string): Promise<string> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required!');
    }
    const { _id } = await this.jwtService.verifyRefreshToken(refreshToken);
    const user = await this.userModel.findById(_id);
    if (!user) throw new UnauthorizedException('User not found!');

    if (!user.sessions.find((session) => session.token === refreshToken)) {
      throw new UnauthorizedException('Refresh token not stored!');
    }
    const accessToken = await this.jwtService.genAccessToken({
      _id,
      role: user.role,
      facultyId: user.faculty?._id,
    });
    return accessToken;
  }

  // Google login callback ------------------------------------------------------
  async googleLoginCallback(email: string, ua: string): Promise<TokensDto> {
    const userAgent: IUserAgent = UAParser(ua);
    const browser = userAgent.browser.name + ' on ' + userAgent.os.name;

    const user = await this.userModel.findOne({ email });
    if (!user) return null;

    const accessToken = await this.jwtService.genAccessToken({
      _id: user._id,
      role: user.role,
      facultyId: user.faculty?._id,
    });
    const refreshToken = await this.jwtService.genRefreshToken({
      _id: user._id,
    });

    user.sessions.push({
      browser,
      token: refreshToken,
      date: new Date(),
    });
    await user.save();
    return { accessToken, refreshToken };
  }

  // Reset password ------------------------------------------------------
  async sendResetPasswordEmail(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('User not found!');
    const token = await this.jwtService.genResetPasswordToken({
      userId: user._id,
    });
    const clientUrl = await this.configService.get(EClientConfigKeys.Url);
    const url = `${clientUrl}/reset-password?token=${token}`;
    const { name } = user;
    await this.mailerService.sendResetPasswordEmail({ email, name, url });
    return;
  }

  // Reset Password -----------------------------------------------------------
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const { token, password } = dto;
    const { userId } = await this.jwtService.verifyResetPasswordToken(token);

    await this.userModel.findByIdAndUpdate(userId, {
      password: await this.passwordService.hashPassword(password),
    });
    return;
  }

  // Change password ------------------------------------------------------
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found!');
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
    return;
  }

  // Find Login Sessions ------------------------------------------------------
  async findLoginSessions(
    userId: string,
    currentRefreshToken: string,
    dto: FindLoginSessionsDto,
  ): Promise<LoginSessionResponseDto[]> {
    const { limit, skip } = dto;
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found!');
    const sessions = user.sessions
      .map((session) => ({
        _id: session._id,
        browser: session.browser,
        date: session.date,
        isCurrentDevice: session.token === currentRefreshToken,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    if (skip || limit) return sessions.slice(skip || 0, limit || 100);
    return sessions;
  }

  // Remove Login Session ------------------------------------------------------
  async removeLoginSession(
    userId: string,
    dto: RemoveLoginSessionDto,
  ): Promise<void> {
    const { sessionId } = dto;
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { sessions: { _id: sessionId } },
    });
    return;
  }

  // Remove All Login Sessions --------------------------------------------------
  async removeAllLoginSessions(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { sessions: [] });
    return;
  }

  // Logout ----------------------------------------------------------------
  async logout(userId: string, refreshToken: string): Promise<void> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required!');
    }
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { sessions: { token: refreshToken } },
    });
    return;
  }
}
