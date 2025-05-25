import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';


import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService
  ) { }

  private getJwtToken(payload: any) { // add payload interface
    const token = this.jwtService.sign(payload);
    return token;
  }

  async signIn(credencial: string, contrasenia: string): Promise<any> {
    let usuario: any; // add type
    try {
      usuario = await this.prisma.usuario.findFirstOrThrow({
        where: {
          OR: [
            { correo: credencial || ""},
            { codigo_usuario: credencial || ""}
          ]
        },
        select: {
          usuario_id: true,
          rol: true,
          tipo_usuario: true,
          contrasenia: true,
        }
      })
    } catch (error) {
      throw new BadRequestException('Wrong credentials');
    }
    const passwordMatch: Boolean = await bcrypt.compare(contrasenia, usuario.contrasenia);

    if (!passwordMatch) {
      throw new BadRequestException('Wrong credentials');
    }

    const token = this.getJwtToken({
      id: usuario.usuario_id,
      rol: usuario.rol,
      tipo_usuario: usuario.tipo_usuario
    });

    delete usuario.contrasenia; // fix before
    
    return { usuario, token };
  }

  /*
  
  */

  async signUp(registerUserDto: RegisterUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(registerUserDto.contrasenia, 10);
      const newUserData = { ...registerUserDto };
      newUserData.contrasenia = hashedPassword;
      console.log(newUserData);
      const newuser = await this.prisma.usuario.create({
        data: newUserData,
        select: {
          usuario_id: true,
          nombre: true,
          apellido: true,
          correo: true,
          telefono: true,
          rol: true,
          tipo_usuario: true,
          createdAt: true
        }
      });
      
      const token = this.getJwtToken({
        id: newuser.usuario_id,
        rol: newuser.rol,
      });

      return { newuser, token };

    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('User already exists');
      }
      throw new InternalServerErrorException('Server error');
    }
  }
  /*
  async refreshToken(user: User){
    return {
      user: user,
      token: this.getJwtToken({id: user.id})
    };
  }
  */
}