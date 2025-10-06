import { IsEmail, IsJWT, IsPositive } from 'class-validator';

export class AuthUserDto {
  @IsPositive()
  id: number;

  @IsEmail()
  email: string;

  @IsJWT()
  accessToken: string;

  @IsJWT()
  refreshToken: string;

  constructor(partial: Partial<AuthUserDto>) {
    Object.assign(this, partial);
  }
}
