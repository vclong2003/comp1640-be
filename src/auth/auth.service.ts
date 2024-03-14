import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
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
import { FacultyService } from 'src/faculty/faculty.service';
import { Faculty } from 'src/faculty/schemas/faculty.schema';
import { ERole } from 'src/user/user.enums';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { IRegisterTokenPayload } from 'src/shared-modules/jwt/jwt.interfaces';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private passwordService: PasswordService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private facultyService: FacultyService,
  ) {}

  // Register ------------------------------------------------------
  async sendRegisterEmail(dto: SendRegisterEmailDto) {
    const { email, role, facultyId } = dto;

    const user = await this.userService.findOneByEmail(email);
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

    const user = await this.userService.findOneByEmail(email);
    if (user) throw new BadRequestException('User already exists!');

    let faculty: Faculty;
    if (facultyId) {
      faculty = await this.facultyService.findOneById(facultyId);
      if (!faculty) throw new BadRequestException('Faculty not found!');
    }

    await this.userService.createUser({
      email,
      role,
      name,
      dob,
      phone,
      password: await this.passwordService.hashPassword(password),
      faculty: faculty && { _id: faculty._id, name: faculty.name },
    });
  }

  // Guest Register ------------------------------------------------------
  async sendGuestRegisterEmail(email: string): Promise<string> {
    const user = await this.userService.findOneByEmail(email);
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

    const user = this.userService.findOneByEmail(email);
    if (user) throw new BadRequestException('User already exist!');

    const faculty = await this.facultyService.findOneById(facultyId);
    if (!faculty) throw new BadRequestException('Faculty not found!');

    await this.userService.createUser({
      email,
      name,
      password,
      role,
      dob,
      phone,
      faculty: { _id: faculty._id, name: faculty.name },
    });
  }

  // Get current user ------------------------------------------------------
  async getCurrentUser(userId: string): Promise<User> {
    const user = this.userService.findOneById(userId);
    return {
      ...user,
      password: undefined,
      sessions: undefined,
      participated_event_ids: undefined,
      submitted_contribution_ids: undefined,
    };
  }

  // Login ------------------------------------------------------
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) return null;
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

    await this.userService.createSession({
      userId: _id,
      browser,
      token: refreshToken,
    });

    return { accessToken, refreshToken };
  }

  // Handle tokens ------------------------------------------------------
  async refreshAccessToken(refreshToken: string): Promise<string> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required!');
    }
    const { _id } = await this.jwtService.verifyRefreshToken(refreshToken);
    const session = await this.userService.findSession(_id, refreshToken);
    if (!session) {
      throw new UnauthorizedException('Refresh token not stored!');
    }
    const user = await this.userService.findOneById(_id);
    const accessToken = await this.jwtService.genAccessToken({
      _id,
      role: user.role,
    });
    return accessToken;
  }

  // Reset password ------------------------------------------------------
  async sendResetPasswordEmail(email: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found!');
    const token = await this.jwtService.genResetPasswordToken({
      userId: user._id,
    });
    await this.mailerService.sendResetPasswordEmail(email, user.name, token);
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { token, password } = dto;
    const { userId } = await this.jwtService.verifyResetPasswordToken(token);
    await this.userService.updatePassword(
      userId,
      await this.passwordService.hashPassword(password),
    );
  }
}
