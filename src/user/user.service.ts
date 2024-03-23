import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { FindUsersDto, UpdateUserDto, UserResponseDto } from './user.dtos';
import { StorageService } from 'src/shared-modules/storage/storage.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private storageService: StorageService,
  ) {}

  async findUserById(userId: string): Promise<UserResponseDto> {
    return await this.userModel
      .findOne({ _id: userId, disabled: false })
      .select([
        '_id',
        'email',
        'name',
        'avatar_url',
        'phone',
        'dob',
        'faculty',
        'gender',
        'role',
      ]);
  }

  async findUsers(dto: FindUsersDto): Promise<UserResponseDto[]> {
    const { name, email, role, facultyId, skip, limit } = dto;
    const query = {
      role,
      name: { $regex: name || '', $options: 'i' },
      email: { $regex: email || '', $options: 'i' },
      disabled: false,
    };
    if (facultyId) query['faculty._id'] = facultyId;
    return this.userModel
      .find(query)
      .select([
        '_id',
        'email',
        'name',
        'avatar_url',
        'phone',
        'dob',
        'faculty',
        'gender',
        'role',
      ])
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async updateUserById(
    userId: string,
    dto: UpdateUserDto,
    avatar?: Express.Multer.File,
  ): Promise<UserResponseDto> {
    const { name, phone, dob, gender } = dto;
    const user = await this.userModel.findOne({ _id: userId });
    if (avatar) {
      await this.storageService.deletePublicFile(user.avatar_url);
      const avatarUrl = await this.storageService.uploadPublicFile(avatar);
      user.avatar_url = avatarUrl;
    }
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;
    await user.save();

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      phone: user.phone,
      dob: user.dob,
      gender: user.gender,
      role: user.role,
      faculty: user.faculty,
    };
  }

  async disableUser(_id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(_id, { disabled: true });
    return;
  }

  async enableUser(_id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(_id, { disabled: false });
    return;
  }
}
