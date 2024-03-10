import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dtos/create-user.dto';
import { CreateSessionDto } from './dtos/create-session.dto';
import { UserSession } from './schemas/user-session.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findOneById(_id: string): Promise<User | null> {
    return this.userModel.findOne({ _id }).exec();
  }

  async findUsersByUsername(username: string): Promise<User[] | null> {
    return this.userModel
      .find({ username: { $regex: username } }) // find all users with username that contains the given string
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
    return user.save();
  }

  async updateUser(_id: string, update: Partial<User>): Promise<User> {
    return await this.userModel
      .findByIdAndUpdate(_id, update, {
        $projection: {
          password: 0,
          sessions: 0,
        },
        new: true,
      })
      .exec();
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
