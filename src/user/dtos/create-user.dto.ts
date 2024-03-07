import { Faculty } from '../schemas/faculty.schema';

export class CreateUserDto {
  email: string;
  name: string;
  password: string;
  phone?: string;
  faculty?: Faculty;
  dob?: Date;
}
