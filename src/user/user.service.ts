import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dtos/create-user.dto';
import { CreateSessionDto } from './dtos/create-session.dto';
import { UserSession } from './schemas/user-session.schema';
import { UpdateUserDto } from './dtos/update-user.dto';
import { FacultyService } from 'src/faculty/faculty.service';
import { UserFaculty } from './schemas/user-faculty.schema';
import { ERole } from './enums/role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @Inject(forwardRef(() => FacultyService))
    private facultyService: FacultyService,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findOneById(_id: string): Promise<User | null> {
    return this.userModel.findOne({ _id }).exec();
  }

  async findUsersByName(name: string): Promise<User[] | null> {
    return this.userModel
      .find({ name: { $regex: name } })
      .select(['_id', 'username', 'info.avatar_url'])
      .exec();
  }

  async findStudentsByName(name: string): Promise<User[] | null> {
    return this.userModel
      .find({ name: { $regex: name }, role: ERole.Student })
      .select(['_id', 'username', 'info.avatar_url'])
      .exec();
  }

  async findMcByName(name: string): Promise<User[] | null> {
    return this.userModel
      .find({ name: { $regex: name }, role: ERole.MarketingCoordinator })
      .select(['_id', 'username', 'info.avatar_url'])
      .exec();
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const { email } = dto;
    const currentUser = await this.findOneByEmail(email);
    if (currentUser) {
      throw new ConflictException('User with this email already exists');
    }
    const user = new this.userModel({ ...dto });
    await user.save();
    return user;
  }

  async updateUser(_id: string, dto: UpdateUserDto): Promise<User> {
    return await this.userModel
      .findByIdAndUpdate(_id, dto, {
        $projection: {
          password: 0,
          sessions: 0,
          participated_event_ids: 0,
          submitted_contribution_ids: 0,
        },
        new: true,
      })
      .exec();
  }

  async updateUserFaculty(
    _id: string,
    faculty?: UserFaculty | null,
  ): Promise<User | null> {
    const user = await this.userModel.findById(_id).exec();
    if (!user) {
      throw new BadRequestException('User not valid');
    }
    if (!faculty) {
      user.faculty = null;
      await user.save();
      return user;
    }
    user.faculty = { _id: faculty._id, name: faculty.name };
    await user.save();
    return user;
  }

  async createSession(dto: CreateSessionDto): Promise<UserSession[]> {
    const { userId, browser, token } = dto;
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new ConflictException('User not found');
    }
    user.sessions.push({ browser, token, date: new Date() });
    await user.save();
    return user.sessions;
  }

  async isSessionExist(userId: string, token: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new ConflictException('User not found');
    }
    return user.sessions.some((session) => session.token === token);
  }

  async removeSession(
    userId: string,
    sessionId: string,
  ): Promise<UserSession[]> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new ConflictException('User not found');
    }
    user.sessions = user.sessions.filter(
      (session) => session._id.toString() !== sessionId,
    );
    await user.save();
    return user.sessions;
  }
}
