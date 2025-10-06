import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtPayload } from './strategies/at.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}
  @HttpCode(HttpStatus.CREATED)
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
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @Patch('logout')
  async logout(@Req() req: Request) {
    try {
      const user = req.user as JwtPayload;
      await this.authService.logout(user?.['sub']);
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      throw new ForbiddenException();
    }
  }
}
