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
  UseGuards,
} from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { JwtPayloadWithRt } from './strategies/rt.strategy';
import { RtGuard } from './guards/rt.guard';
import { GetCurrentUser } from 'src/commons/decorators/get-current-user.decorator';
import { Public } from 'src/commons/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Public()
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

  @Public()
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
  @HttpCode(HttpStatus.OK)
  @Patch('logout')
  async logout(@GetCurrentUser('sub') userId: number) {
    try {
      await this.authService.logout(userId);
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      throw new ForbiddenException();
    }
  }

  @Public()
  @UseGuards(RtGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('refresh')
  async refreshTokens(@GetCurrentUser() user: JwtPayloadWithRt) {
    try {
      const { sub: userId, refreshToken } = user ?? {};
      const tokens = await this.authService.refreshTokens(userId, refreshToken);
      return tokens;
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      throw new ForbiddenException();
    }
  }
}
