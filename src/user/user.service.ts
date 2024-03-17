import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../shared-modules/database/schemas/user/user.schema';
import { Model } from 'mongoose';
import { FindUsersDto, UpdateUserDto } from './user.dtos';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findOneById(_id: string): Promise<User | null> {
    return await this.userModel.findOne({ _id }).exec();
  }

  async getUserDetails(_id: string): Promise<User> {
    return await this.userModel
      .findById(_id)
      .select([
        'name',
        'email',
        'phone',
        'avatar_url',
        'role',
        'faculty',
        'dob',
      ]);
  }

  async findUsers(dto: FindUsersDto): Promise<User[] | null> {
    const { name, email, role, facultyId, skip, limit } = dto;
    const query = {
      role,
      name: { $regex: name || '', $options: 'i' },
      email: { $regex: email || '', $options: 'i' },
    };
    if (facultyId) query['faculty._id'] = facultyId;
    return this.userModel
      .find(query)
      .select(['_id', 'email', 'name', 'avatar_url'])
      .skip(skip)
      .limit(limit)
      .exec();
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

  async disableUser(_id: string) {
    await this.userModel.findByIdAndUpdate(_id, { disabled: true });
    return;
  }

  async enableUser(_id: string) {
    await this.userModel.findByIdAndUpdate(_id, { disabled: false });
    return;
  }
}
