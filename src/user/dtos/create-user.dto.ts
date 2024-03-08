import { ERole } from '../eums/role.enum';
import { Faculty } from '../schemas/faculty.schema';

export class CreateUserDto {
  email: string;
  name: string;
  password: string;
  role: ERole;
  phone?: string;
  faculty?: Faculty;
  dob?: Date;
}
