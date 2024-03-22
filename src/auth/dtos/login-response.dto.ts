import { GetUserResponseDto } from 'src/user/user.dtos';

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: GetUserResponseDto;
}
