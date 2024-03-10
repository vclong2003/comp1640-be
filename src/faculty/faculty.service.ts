import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faculty } from './schemas/faculty.schema';
import { CreateFacultyDto } from './dtos/create-faculty.dto';
import { UserService } from 'src/user/user.service';
import { ERole } from 'src/user/eums/role.enum';

@Injectable()
export class FacultyService {
  constructor(
    @InjectModel('Faculty') private facultyModel: Model<Faculty>,
    private userService: UserService,
  ) {}

  async getAllFaculty(): Promise<Faculty[]> {
    return this.facultyModel.find().select('_id name mc').exec();
  }

  async createFaculty(dto: CreateFacultyDto): Promise<Faculty> {
    const { name, mcId } = dto;
    const mcUser = await this.userService.findOneById(mcId);
    if (!mcUser || mcUser.role != ERole.MarketingCoordinator) {
      throw new BadRequestException('Invalid mc');
    }
    const faculty = new this.facultyModel({
      name,
      mc: { _id: mcUser._id, name: mcUser.name, email: mcUser.email },
    });
    await faculty.save();
    return faculty;
  }
}
