import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FindUsersDto, UpdateUserDto, UserResponseDto } from './user.dtos';
import { StorageService } from 'src/shared-modules/storage/storage.service';
import { User } from './schemas/user.schema';
import { ERole } from './user.enums';
import { Faculty } from 'src/faculty/schemas/faculty.schema';
import { UserHelper } from './user.helper';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Faculty') private facultyModel: Model<Faculty>,
    private storageService: StorageService,
    private helper: UserHelper,
  ) {}

  // Find user by id ----------------------------------------------------
  async findUserById(userId: string): Promise<UserResponseDto> {
    return await this.userModel
      .findOne({ _id: userId, disabled: false })
      .select('_id email name avatar_url phone dob faculty gender role');
  }

  // Find users ---------------------------------------------------------
  async findUsers(dto: FindUsersDto): Promise<UserResponseDto[]> {
    const users = await this.userModel.aggregate(
      this.helper.generateFindUsersPipeline(dto),
    );

    return users.map((user) => this.helper.sanitizeUser(user));
  }

  // Update user by id --------------------------------------------------
  async updateUserById(
    userId: string,
    dto: UpdateUserDto,
    avatar?: Express.Multer.File,
  ): Promise<UserResponseDto> {
    const { name, phone, dob, gender, facultyId } = dto;
    const user = await this.userModel.findOne({
      _id: userId,
    });

    if (avatar) {
      // Delete old avatar
      if (user.avatar_url) {
        await this.storageService.deletePublicFile(user.avatar_url);
      }
      // Upload new avatar
      const avatarUrl = await this.storageService.uploadPublicFile(avatar);
      user.avatar_url = avatarUrl;
    }

    let faculty;
    if (facultyId) {
      if (user.role !== ERole.Student) {
        throw new BadRequestException('Only student can update faculty!');
      }
      faculty = await this.facultyModel.findById(facultyId);
      if (!faculty) throw new BadRequestException('Faculty not found');
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;
    if (faculty) user.faculty = { _id: faculty._id, name: faculty.name };
    await user.save();

    return this.helper.sanitizeUser(user);
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
