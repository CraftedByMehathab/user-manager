import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

@UseInterceptors(ClassSerializerInterceptor)
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
    return this.authService.signIn(newUser);
  }
}
