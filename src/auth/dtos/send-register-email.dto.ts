import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ERole } from 'src/user/eums/role.enum';

export class SendRegisterEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  role: ERole;

  @IsOptional()
  @IsString()
  facultyId: string;
}
