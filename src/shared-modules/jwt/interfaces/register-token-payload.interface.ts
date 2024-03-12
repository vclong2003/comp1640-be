import { ERole } from 'src/user/enums/role.enum';

export interface IRegisterTokenPayload {
  email: string;
  facultyId?: string;
  role: ERole;
}
