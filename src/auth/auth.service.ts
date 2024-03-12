import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { GuestRegisterDto } from './dtos/guest-register.dto';
import { User } from 'src/user/schemas/user.schema';
import { ERole } from 'src/user/enums/role.enum';
import { PasswordService } from '../shared-modules/password/password.service';
import { LoginResponseDto } from './dtos/login-response.dto';
import { JwtService } from 'src/shared-modules/jwt/jwt.service';
import { UAParser } from 'ua-parser-js';
import { IUserAgent } from './interfaces/user-agent.interface';
import { SendRegisterEmailDto } from './dtos/send-register-email.dto';
import { MailerService } from 'src/shared-modules/mailer/mailer.service';
import { FacultyService } from 'src/faculty/faculty.service';
import { SetupAccountDto } from './dtos/setup-account.dto';
import { Faculty } from 'src/faculty/schemas/faculty.schema';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private passwordService: PasswordService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private facultyService: FacultyService,
  ) {}

  async guestRegister(dto: GuestRegisterDto): Promise<User> {
    const user = await this.userService.createUser({
      ...dto,
      password: await this.passwordService.hashPassword(dto.password),
      role: ERole.Guest,
    });
    return user;
  }

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

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const { _id } = await this.jwtService.verifyRefreshToken(refreshToken);
    const isRefreshTokenValid = await this.userService.isSessionExist(
      _id,
      refreshToken,
    );
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Refresh token not found!');
    }
    const user = await this.userService.findOneById(_id);
    const accessToken = await this.jwtService.genAccessToken({
      _id,
      role: user.role,
    });
    return accessToken;
  }

  async sendRegisterEmail(dto: SendRegisterEmailDto) {
    const { email, role, facultyId } = dto;
    const user = await this.userService.findOneByEmail(email);
    if (user) {
      throw new ConflictException('User already exists!');
    }
    const token = await this.jwtService.genRegisterToken({
      email,
      role,
      facultyId,
    });
    await this.mailerService.sendRegisterEmail(email, token);
  }

  async setupAccount(dto: SetupAccountDto) {
    const { token, name, password, dob, phone } = dto;
    const { email, role, facultyId } =
      await this.jwtService.verifyRegisterToken(token);

    const user = await this.userService.findOneByEmail(email);
    if (user) {
      throw new BadRequestException('User already exists!');
    }

    // facultyId is required for student and marketing coordinator
    if (role !== ERole.Student && role !== ERole.MarketingCoordinator) {
      if (facultyId) throw new BadRequestException('Faculty is not required');
    }

    let faculty: Faculty;
    if (facultyId) {
      faculty = await this.facultyService.findById(facultyId);
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
}
