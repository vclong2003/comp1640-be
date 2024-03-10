import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faculty } from './schemas/faculty.schema';
import { CreateFacultyDto } from './dtos/create-faculty.dto';
import { UserService } from 'src/user/user.service';
import { ERole } from 'src/user/eums/role.enum';
import { SetFacultyMcDto } from './dtos/set-faculty.mc.dto';

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
    // find mc user
    const mcUser = await this.userService.findOneById(mcId);
    if (!mcUser || mcUser.role != ERole.MarketingCoordinator) {
      throw new BadRequestException('Invalid mc');
    }
    // check if faculty already exists
    const currentFaculty = await this.facultyModel
      .findOne({
        name: {
          $regex: new RegExp(`^${name}$`, 'i'),
        },
      })
      .exec();
    if (currentFaculty) {
      throw new BadRequestException('Faculty already exists');
    }
    // create new faculty
    const newFaculty = new this.facultyModel({
      name,
      mc: { _id: mcUser._id, name: mcUser.name, email: mcUser.email },
    });
    await newFaculty.save();
    return newFaculty;
  }

  async setFacultyMc(dto: SetFacultyMcDto): Promise<Faculty> {
    const { facultyId, mcId } = dto;
    // find faculty
    const faculty = await this.facultyModel.findById(facultyId).exec();
    if (!faculty) {
      throw new BadRequestException('Faculty not found');
    }
    // find mc
    const mcUser = await this.userService.findOneById(mcId);
    if (!mcUser || mcUser.role != ERole.MarketingCoordinator) {
      throw new BadRequestException('Invalid mc');
    }
    // update mc
    faculty.mc = { _id: mcUser._id, name: mcUser.name, email: mcUser.email };
    await faculty.save();
    return faculty;
  }
}
