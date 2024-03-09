import { ERole } from 'src/user/eums/role.enum';

export interface IRegisterTokenPayload {
  email: string;
  facultyId: string;
  role: ERole;
}
