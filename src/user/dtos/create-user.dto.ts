import { ERole } from '../enums/role.enum';
import { UserFaculty } from '../schemas/user-faculty.schema';

export class CreateUserDto {
  email: string;
  name: string;
  password: string;
  role: ERole;
  phone?: string;
  faculty?: UserFaculty;
  dob?: Date;
}
