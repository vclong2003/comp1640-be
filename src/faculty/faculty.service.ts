import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Faculty } from './schemas/faculty.schema';
import { CreateFacultyDto } from './dtos/create-faculty.dto';
import { UserService } from 'src/user/user.service';
import { ERole } from 'src/user/enums/role.enum';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class FacultyService {
  constructor(
    @InjectModel('Faculty') private facultyModel: Model<Faculty>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async findOneById(id: string): Promise<Faculty> {
    return this.facultyModel.findById(id).exec();
  }

  async findAll(): Promise<Faculty[]> {
    return this.facultyModel.find().select('_id name mc').exec();
  }

  async createFaculty(dto: CreateFacultyDto): Promise<Faculty> {
    const { name, mcId } = dto;
    let mcUser: User | null = null;
    if (mcId) {
      mcUser = await this.userService.findOneById(mcId);
      if (!mcUser || mcUser.role != ERole.MarketingCoordinator) {
        throw new BadRequestException('Invalid mc');
      }
    }
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
    const newFaculty = new this.facultyModel({
      name,
      mc: mcUser && { _id: mcUser._id, name: mcUser.name, email: mcUser.email },
    });
    await newFaculty.save();
    return newFaculty;
  }

  async setFacultyMc(facultyId: string, mcId: string): Promise<Faculty> {
    const faculty = await this.facultyModel.findById(facultyId).exec();
    if (!faculty) {
      throw new BadRequestException('Faculty not found');
    }
    const mcUser = await this.userService.findOneById(mcId);
    if (!mcUser || mcUser.role != ERole.MarketingCoordinator) {
      throw new BadRequestException('Invalid mc');
    }
    faculty.mc = { _id: mcUser._id, name: mcUser.name, email: mcUser.email };
    await faculty.save();
    return faculty;
  }

  async addStudent(facultyId: string, studentId: string) {
    const faculty = await this.facultyModel.findById(facultyId).exec();
    if (!faculty) {
      throw new BadRequestException('Faculty not found');
    }
    if (faculty.student_ids.includes(studentId)) {
      throw new BadRequestException('Student already exists in faculty');
    }
    const student = await this.userService.findOneById(studentId);
    if (!student || student.role != ERole.Student) {
      throw new BadRequestException('Invalid student');
    }
    if (student.faculty) {
      throw new BadRequestException('Student already belongs to a faculty');
    }
    faculty.student_ids.push(studentId);
    await faculty.save();
    await this.userService.updateUserFaculty(studentId, {
      _id: faculty._id,
      name: faculty.name,
    });
    return faculty;
  }

  async removeStudent(facultyId: string, studentId: string) {
    const faculty = await this.facultyModel.findById(facultyId).exec();
    if (!faculty) {
      throw new BadRequestException('Faculty not found');
    }
    const studentIndex = faculty.student_ids.indexOf(studentId);
    if (studentIndex == -1) {
      throw new BadRequestException('Student not found in faculty');
    }
    faculty.student_ids.splice(studentIndex, 1);
    await faculty.save();
    await this.userService.updateUserFaculty(studentId, null);
    return faculty;
  }

  async findAllStudent(facultyId: string) {
    const faculty = await this.facultyModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(facultyId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'student_ids',
          foreignField: '_id',
          as: 'students',
        },
      },
      {
        $project: {
          name: 1,
          mc: 1,
          students: {
            _id: 1,
            name: 1,
            email: 1,
            avatar_url: 1,
          },
        },
      },
    ]);
    if (!faculty || faculty.length == 0) {
      throw new BadRequestException('Faculty not found');
    }
    return faculty[0];
  }
}
