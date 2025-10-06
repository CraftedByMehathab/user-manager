import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { SanatizeUserDto } from 'src/users/dto/sanatize-user.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async authenticateUser(authInput: LoginDto) {
    try {
      const user = await this.validateUser(authInput);
      if (user) return this.tokenSignIn(user);
    } catch (error) {
      if (error instanceof Error)
        throw new Error('Authentication failed', {
          cause: error.message,
        });
      else throw error;
    }
  }
  async validateUser(authInput: LoginDto): Promise<SanatizeUserDto> {
    try {
      const user = await this.userService.findOne({ email: authInput.email });
      if (!user) throw new Error('Invalid user');
      const [salt, storedHash] = user.hash.split('.');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, currentHash] = (
        await this.userService.hashPassword(authInput.password, salt)
      ).split('.');

      if (storedHash !== currentHash)
        throw new Error('Email or Password is incorrect');
      return new SanatizeUserDto(user);
    } catch (error) {
      if (error instanceof Error)
        throw new Error('User validation failed', {
          cause: error.message,
        });
      else throw error;
    }
  }

  async tokenSignIn(user: SanatizeUserDto): Promise<AuthUserDto> {
    const tokenPayload = {
      sub: user.id,
      email: user.email,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(tokenPayload, {
        expiresIn: 60 * 15,
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      }),
      this.jwtService.signAsync(tokenPayload, {
        expiresIn: 60 * 60 * 24 * 7,
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      }),
    ]);
    return { id: user.id, accessToken, email: user.email, refreshToken };
  }
}
