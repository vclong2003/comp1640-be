import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FindUsersDto, UpdateUserDto, UserResponseDto } from './user.dtos';
import { StorageService } from 'src/shared-modules/storage/storage.service';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private storageService: StorageService,
  ) {}

  // Find user by id ----------------------------------------------------
  async findUserById(userId: string): Promise<UserResponseDto> {
    return await this.userModel
      .findOne({ _id: userId, disabled: false })
      .select('_id email name avatar_url phone dob faculty gender role');
  }

  // Find users ---------------------------------------------------------
  async findUsers(dto: FindUsersDto): Promise<UserResponseDto[]> {
    const { name, email, role, facultyId, skip, limit } = dto;
    const query: any = {
      role,
      name: { $regex: name || '', $options: 'i' },
      email: { $regex: email || '', $options: 'i' },
      disabled: false,
    };
    if (facultyId) query['faculty._id'] = facultyId;
    return this.userModel
      .find(query)
      .select('_id email name avatar_url phone dob faculty gender role')
      .skip(skip)
      .limit(limit)
      .exec();
  }

  // Update user by id --------------------------------------------------
  async updateUserById(
    userId: string,
    dto: UpdateUserDto,
    avatar?: Express.Multer.File,
  ): Promise<UserResponseDto> {
    const { name, phone, dob, gender } = dto;
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    if (avatar) {
      if (user.avatar_url) {
        await this.storageService.deletePublicFile(user.avatar_url);
      }
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

  // Disable user -------------------------------------------------------
  async disableUser(userId: string): Promise<void> {
    const result = await this.userModel.findByIdAndUpdate(userId, {
      disabled: true,
    });
    if (!result) throw new BadRequestException('User not found');
  }

  // Enable user --------------------------------------------------------
  async enableUser(userId: string): Promise<void> {
    const result = await this.userModel.findByIdAndUpdate(userId, {
      disabled: false,
    });
    if (!result) throw new BadRequestException('User not found');
  }
}
