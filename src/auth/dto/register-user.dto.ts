import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  NotContains
} from "class-validator";
import { Rol , TipoUsuario} from "generated/prisma";
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    minLength: 3
  })
  @IsString()
  @MinLength(3)
  nombre: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    minLength: 3
  })
  @IsString()
  @MinLength(3)
  apellido: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@esen.edu.sv',
    minLength: 3
  })
  @IsEmail()
  @MinLength(3)
  correo: string;

  @ApiProperty({
    description: 'Número de teléfono del usuario',
    example: '+503 1234-5678'
  })
  @IsString() // TODO: add some regex to check phone
  telefono: string;

  @ApiProperty({
    description: 'Código de usuario (opcional)',
    example: 'UNI-12345',
    required: false
  })
  @IsOptional()
  @IsString()
  codigo_usuario: string;

  @ApiProperty({
    description: 'Contraseña del usuario (debe contener mayúscula, minúscula y número)',
    example: 'Password123',
    minLength: 6,
    maxLength: 60
  })
  @IsString()
  @MinLength(6)
  @MaxLength(60)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, { // TODO: once number or optional case
    message: 'Password must contain at least one uppercase, one lowercase and one number',
  })
  @NotContains(' ', { message: 'El password no debe contener espacios' })
  contrasenia: string;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    example: 'ESTUDIANTE',
    enum: ['ADMIN', 'ESTUDIANTE', 'PROFESOR', 'COORDINADOR']
  })
  @IsString()
  rol: Rol

  @ApiProperty({
    description: 'Tipo de usuario',
    example: 'ACTIVO',
    enum: ['ACTIVO', 'INACTIVO', 'PENDIENTE']
  })
  @IsString()
  tipo_usuario: TipoUsuario;

  @ApiProperty({
    description: 'ID de la carpeta en Google Drive (opcional)',
    example: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    required: false
  })
  @IsOptional()
  @IsString()
  drive_folder: string;

}