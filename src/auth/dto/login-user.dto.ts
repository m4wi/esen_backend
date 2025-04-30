import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {

  @IsString()
  credencial: string;

  @IsString()
  contrasenia: string;

};