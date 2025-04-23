import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
  NotContains
} from "class-validator";
import { Rol } from "generated/prisma";


export class RegisterUserDto {

  @IsString()
  @MinLength(3)
  nombre: string;

  @IsString()
  @MinLength(3)
  apellido: string;

  // TODO: Validate that the userCode follows a specific format, e.g., 'UNI-12345'
  @IsEmail()
  @MinLength(3)
  correo: string;


  @IsString() // TODO: add some regex to check phone
  telefono: string;

  @IsString()
  @MinLength(6)
  @MaxLength(60)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, { // TODO: once number or optional case
    message: 'Password must contain at least one uppercase, one lowercase and one number',
  })
  @NotContains(' ', { message: 'El password no debe contener espacios' })
  contrasenia: string;

  @IsString()
  rol: Rol
}