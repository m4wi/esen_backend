import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {

  @IsEmail()
  correo: string;

  @IsString()
  contrasenia: string;

};