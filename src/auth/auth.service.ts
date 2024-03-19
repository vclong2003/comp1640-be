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
  SetupGuestAccountDto,
} from './dtos/register.dtos';
import { MailerService } from 'src/shared-modules/mailer/mailer.service';
import { Faculty } from 'src/faculty/schemas/faculty.schema';
import { ERole } from 'src/user/user.enums';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { IRegisterTokenPayload } from 'src/shared-modules/jwt/jwt.interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Faculty') private facultyModel: Model<Faculty>,
    private passwordService: PasswordService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  // Register ------------------------------------------------------
  async sendRegisterEmail(dto: SendRegisterEmailDto) {
    const { email, role, facultyId } = dto;

    const user = await this.userModel.findOne({ email });
    if (user) throw new ConflictException('User already exists!');

    const tokenPayload = facultyId
      ? { email, role, facultyId }
      : { email, role };
    const token = await this.jwtService.genRegisterToken(tokenPayload);

    await this.mailerService.sendRegisterEmail(email, token);
  }

  async verifyRegisterToken(token: string): Promise<IRegisterTokenPayload> {
    return this.jwtService.verifyRegisterToken(token);
  }

  async setupAccount(dto: SetupAccountDto) {
    const { token, name, password, dob, phone } = dto;
    const { email, role, facultyId } =
      await this.jwtService.verifyRegisterToken(token);

    const user = await this.userModel.findOne({ email });
    if (user) throw new BadRequestException('User already exists!');

    let faculty: Faculty;
    if (facultyId) {
      faculty = await this.facultyModel.findById(facultyId).exec();
      if (!faculty) throw new BadRequestException('Faculty not found!');
    }

    const newUser = new this.userModel({
      email,
      role,
      name,
      dob,
      phone,
      password: await this.passwordService.hashPassword(password),
      faculty: faculty && { _id: faculty._id, name: faculty.name },
    });
    await newUser.save();
  }

  // Guest Register ------------------------------------------------------
  async sendGuestRegisterEmail(email: string): Promise<string> {
    const user = await this.userModel.findOne({ email });
    if (user) throw new BadRequestException('User already exist!');

    const tokenPayload = { email, role: ERole.Guest };
    const token = await this.jwtService.genRegisterToken(tokenPayload);

    return token;
  }

  async verifyGuestRegisterToken(
    token: string,
  ): Promise<IRegisterTokenPayload> {
    return this.jwtService.verifyRegisterToken(token);
  }

  async setupGuestAccount(dto: SetupGuestAccountDto) {
    const { token, facultyId, name, password, dob, phone } = dto;

    const { email, role } = await this.jwtService.verifyRegisterToken(token);

    const user = this.userModel.findOne({ email });
    if (user) throw new BadRequestException('User already exist!');

    const faculty = await this.facultyModel.findById(facultyId).exec();
    if (!faculty) throw new BadRequestException('Faculty not found!');

    const newUser = new this.userModel({
      email,
      role,
      name,
      dob,
      phone,
      password: await this.passwordService.hashPassword(password),
      faculty: { _id: faculty._id, name: faculty.name },
    });
    await newUser.save();
  }

  // Get current user ------------------------------------------------------
  async getCurrentUser(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      faculty: user.faculty,
      avatar_url: user.avatar_url,
    };
  }

  // Login ------------------------------------------------------
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email });
    if (!user) return null;
    if (user.disabled) {
      throw new UnauthorizedException('This user account is revoked!');
    }
    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password,
    );
    if (isPasswordValid) return user;
    return null;
  }

  async login(user: User, ua: string): Promise<LoginResponseDto> {
    const { _id, role } = user;
    const accessToken = await this.jwtService.genAccessToken({ _id, role });
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

    return { accessToken, refreshToken };
  }

  // Handle tokens ------------------------------------------------------
  async refreshAccessToken(refreshToken: string): Promise<string> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required!');
    }
    const { _id } = await this.jwtService.verifyRefreshToken(refreshToken);
    // const session = await this.userService.findSession(_id, refreshToken);
    const user = await this.userModel.findById(_id);
    if (!user) {
      throw new UnauthorizedException('User not found!');
    }
    if (!user.sessions.find((session) => session.token === refreshToken)) {
      throw new UnauthorizedException('Refresh token not stored!');
    }
    const accessToken = await this.jwtService.genAccessToken({
      _id,
      role: user.role,
    });
    return accessToken;
  }
  // Google login callback ------------------------------------------------------
  async googleLoginCallback(email: string, ua: string) {
    const userAgent: IUserAgent = UAParser(ua);
    const browser = userAgent.browser.name + ' on ' + userAgent.os.name;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('User not found!');
    }

    const accessToken = await this.jwtService.genAccessToken({
      _id: user._id,
      role: user.role,
    });
    const refreshToken = await this.jwtService.genRefreshToken({
      _id: user._id,
    });

    user.sessions.push({
      browser,
      token: refreshToken,
      date: new Date(),
    });

    return { accessToken, refreshToken };
  }

  // Reset password ------------------------------------------------------
  async sendResetPasswordEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('User not found!');
    const token = await this.jwtService.genResetPasswordToken({
      userId: user._id,
    });
    await this.mailerService.sendResetPasswordEmail(email, user.name, token);
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { token, password } = dto;
    const { userId } = await this.jwtService.verifyResetPasswordToken(token);

    await this.userModel.findByIdAndUpdate(userId, {
      password: await this.passwordService.hashPassword(password),
    });
  }
}
