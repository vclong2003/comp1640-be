import { ERole } from 'src/user/enums/role.enum';

export interface IAccessTokenPayload {
  _id: string;
  role: ERole;
}
