import {
  Request,
  Get,
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  } from '@nestjs/common';
import { Response } from 'express';

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
  async signIn(
    @Body() loginUserDto: LoginUserDto,
  ) {
    return await this.authService.signIn(
      loginUserDto.credencial, 
      loginUserDto.contrasenia
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async signUp(
    @Body() registerUserDto: RegisterUserDto,
  ) {
    return await this.authService.signUp(registerUserDto);
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
