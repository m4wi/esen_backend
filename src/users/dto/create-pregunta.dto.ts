import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreatePreguntaDto {
  @ApiProperty({
    description: 'Texto de la pregunta',
    example: '¿Cómo puedo cambiar mi contraseña?',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  pregunta: string;

  @ApiPropertyOptional({
    description: 'Texto de la respuesta (opcional)',
    example: 'Puedes cambiar tu contraseña desde el menú de configuración',
  })
  @IsOptional()
  @IsString()
  respuesta?: string;

  @ApiProperty({
    description: 'ID del usuario que hace la pregunta',
    example: 1,
  })
  @IsInt()
  fk_usuario: number;
}

export class UpdatePreguntaDto {
  @ApiPropertyOptional({
    description: 'Texto de la pregunta',
    example: '¿Cómo puedo cambiar mi contraseña?',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  pregunta?: string;

  @ApiPropertyOptional({
    description: 'Texto de la respuesta',
    example: 'Puedes cambiar tu contraseña desde el menú de configuración',
  })
  @IsOptional()
  @IsString()
  respuesta?: string;
}

export class PreguntaResponseDto {
  @ApiProperty({
    description: 'ID único de la pregunta',
    example: 1,
  })
  id_pregunta: number;

  @ApiProperty({
    description: 'Texto de la pregunta',
    example: '¿Cómo puedo cambiar mi contraseña?',
  })
  pregunta: string;

  @ApiPropertyOptional({
    description: 'Texto de la respuesta',
    example: 'Puedes cambiar tu contraseña desde el menú de configuración',
  })
  respuesta?: string;

  @ApiProperty({
    description: 'Fecha de creación de la pregunta',
    example: '2024-01-15T10:30:00Z',
  })
  fecha_creacion: Date;

  @ApiPropertyOptional({
    description: 'Fecha cuando se respondió la pregunta',
    example: '2024-01-15T14:45:00Z',
  })
  fecha_respuesta?: Date;

  @ApiProperty({
    description: 'ID del usuario que hizo la pregunta',
    example: 1,
  })
  fk_usuario: number;

  @ApiPropertyOptional({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  apellido?: string;

  @ApiPropertyOptional({
    description: 'Código del usuario',
    example: '2021001',
  })
  codigo_usuario?: string;
} 