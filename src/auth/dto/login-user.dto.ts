import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {

  @ApiProperty({
    description: 'Credencial del usuario (email o código de usuario)',
    example: '2022-113023',
    minLength: 3
  })
  @IsString()
  credencial: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: '4646ad6656',
    minLength: 6,
    maxLength: 60
  })
  @IsString()
  contrasenia: string;

}

export class UserResponseDto {  
  @ApiProperty({
    description: 'ID único del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: number;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan'
  })
  nombre: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez'
  })
  apellido: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@esen.edu.sv'
  })
  correo: string;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    example: 'ESTUDIANTE',
    enum: ['ADMIN', 'ESTUDIANTE', 'PROFESOR', 'COORDINADOR']
  })
  rol: string;

  @ApiProperty({
    description: 'Tipo de usuario',
    example: 'ACTIVO',
    enum: ['ACTIVO', 'INACTIVO', 'PENDIENTE']
  })
  tipo_usuario: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Mensaje de confirmación',
    example: 'Sesión cerrada exitosamente'
  })
  message: string;
}