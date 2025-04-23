import {
  Request,
  Get,
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {

  constructor(
    private authService: AuthService
  ) { }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() loginUserDto: LoginUserDto) {
    return this.authService.signIn(loginUserDto.correo, loginUserDto.contrasenia);
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  signUp(@Body() registerUserDto: RegisterUserDto ) {
    return this.authService.signUp(registerUserDto);
  }
  // Example to guard a route
  /*
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  */


}
