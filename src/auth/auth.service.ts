import {
  Injectable,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';


import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private readonly jwtService: JwtService
  ) { }

  private getJwtToken(payload: any) { // add payload interface
    const token = this.jwtService.sign(payload);
    return token;
  }

  async signIn(credencial: string, contrasenia: string): Promise<any> {
    let usuario: any; // add type
    console.log({credencial, contrasenia})
    try {
      const result = await this.databaseService.query(
        `
        SELECT 
          u.usuario_id,
          u.rol,
          u.tipo_usuario,
          u.contrasenia
        FROM "Usuario" as u
        WHERE u.correo = '${credencial}' OR u.codigo_usuario = '${credencial}'
        `
      );
      usuario = result.rows[0];
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
      let newuser: any;
      const hashedPassword = await bcrypt.hash(registerUserDto.contrasenia, 10);
      const newUserData = { ...registerUserDto };
      newUserData.contrasenia = hashedPassword;
      const result = await this.databaseService.query(
        `
          INSERT INTO "Usuario" (
          nombre,
          apellido,
          correo,
          telefono,
          codigo_usuario,
          contrasenia,
          rol,
          tipo_usuario,
          drive_folder,
          created_at,
          updated_at
        ) VALUES (
          '${newUserData.nombre}',
          '${newUserData.apellido}',
          '${newUserData.correo}',
          '${newUserData.telefono}',
          '${newUserData.codigo_usuario}',
          '${newUserData.contrasenia}',
          '${newUserData.rol}',
          '${newUserData.tipo_usuario}',
          '${newUserData.drive_folder}',
          NOW(),
          NOW()
        )
        RETURNING
          usuario_id,
          nombre,
          apellido,
          correo,
          telefono,
          rol,
          tipo_usuario
        `
      );
      
      newuser = result.rows[0];
      
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