import { IsJWT } from 'class-validator';

export class AuthTokensDto {
  @IsJWT()
  accessToken: string;

  @IsJWT()
  refreshToken: string;

  constructor(partial: Partial<AuthTokensDto>) {
    Object.assign(this, partial);
  }
}
