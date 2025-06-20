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
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginUserDto, UserResponseDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {

  constructor(
    private authService: AuthService
  ) { }

  @ApiOperation({ 
    summary: 'Iniciar sesión',
    description: 'Autentica al usuario y devuelve un token JWT en una cookie'
  })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario autenticado exitosamente',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciales inválidas' 
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { usuario, token } = await this.authService.signIn(
      loginUserDto.credencial, 
      loginUserDto.contrasenia
    );

    res.cookie('auth_cookie', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 3600000
    });

    return usuario;
  }

  @ApiOperation({ 
    summary: 'Registrar nuevo usuario',
    description: 'Crea una nueva cuenta de usuario y devuelve un token JWT en una cookie'
  })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario registrado exitosamente',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'El usuario ya existe' 
  })
  @HttpCode(HttpStatus.OK)
  @Post('register')
  async signUp(
    @Body() registerUserDto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { newuser, token } = await this.authService.signUp(registerUserDto);

    res.cookie('auth_cookie', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 3600000
    });

    return newuser

  }
}
