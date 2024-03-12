import { ERole } from 'src/user/user.enums';

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
