import { ERole } from 'src/user/eums/role.enum';

export interface IAccessTokenPayload {
  id: string;
  role: ERole;
}
