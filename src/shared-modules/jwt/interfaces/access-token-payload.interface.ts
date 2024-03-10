import { ERole } from 'src/user/eums/role.enum';

export interface IAccessTokenPayload {
  _id: string;
  role: ERole;
}
