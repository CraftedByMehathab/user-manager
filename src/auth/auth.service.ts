import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { SanatizeUserDto } from 'src/users/dto/sanatize-user.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}
  async authenticateUser(authInput: LoginDto) {
    try {
      const user = await this.validateUser(authInput);
      if (user) return this.signIn(user);
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
      const user = await this.userService.findOne(authInput);
      if (!user) throw new Error('Invalid user');
      const storedHash = user.password.split('.')[1];
      const currentHash = (
        await this.userService.hashPassword(authInput.password)
      ).split('.')[1];

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

  async signIn(user: SanatizeUserDto): Promise<AuthUserDto> {
    const tokenPayload = {
      sub: user.id,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    return { id: user.id, accessToken, email: user.email };
  }
}
