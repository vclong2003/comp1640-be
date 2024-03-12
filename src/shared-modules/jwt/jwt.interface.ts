import { ERole } from 'src/user/enums/role.enum';

export interface IRefreshTokenPayload {
  _id: string;
}

export interface IAccessTokenPayload {
  _id: string;
  role: ERole;
}

export interface IResetPasswordTokenPayload {
  userId: string;
}

export interface IRegisterTokenPayload {
  email: string;
  facultyId?: string;
  role: ERole;
}
