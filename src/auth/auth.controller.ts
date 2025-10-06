import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}
  @Post('signup')
  async signup(@Body() signInput: SignUpDto) {
    const uniqueUser = await this.userService.findOne({
      email: signInput.email,
    });
    if (uniqueUser) throw new BadRequestException();
    const newUser = await this.userService.create(signInput);
    const authTokens = await this.authService.tokenSignIn(newUser);
    await this.userService.updateRtHash(newUser.id, authTokens.refreshToken);
    return authTokens;
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginInput: LoginDto) {
    try {
      const authTokens = await this.authService.authenticateUser(loginInput);
      return authTokens;
    } catch (error) {
      if (error instanceof Error)
        throw new ForbiddenException(error.message, {
          cause: error.cause,
        });
      else throw error;
    }
  }
}
