import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { UserSession } from './schemas/user-session.schema';
import { UserFaculty } from './schemas/user-faculty.schema';
import { CreateSessionDto, CreateUserDto, UpdateUserDto } from './user.dtos';
import { ERole } from './user.enums';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findOneById(_id: string): Promise<User | null> {
    return this.userModel.findOne({ _id }).exec();
  }

  async findUsersByName(name: string): Promise<User[] | null> {
    return this.userModel
      .find({ name: { $regex: name } })
      .select(['_id', 'name', 'avatar_url'])
      .exec();
  }

  async findStudentsByName(name: string): Promise<User[] | null> {
    return this.userModel
      .find({ name: { $regex: name }, role: ERole.Student })
      .select(['_id', 'name', 'avatar_url'])
      .exec();
  }

  async findMcsByName(name: string): Promise<User[] | null> {
    return this.userModel
      .find({ name: { $regex: name }, role: ERole.MarketingCoordinator })
      .select(['_id', 'name', 'avatar_url'])
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

  async findSession(
    userId: string,
    token: string,
  ): Promise<UserSession | null> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new ConflictException('User not found');
    }
    return user.sessions.find((session) => session.token === token) || null;
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
