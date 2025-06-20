import {
  IsInt,
  IsString,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateObservationDocumentDto } from './observation-document.dto';
import { ApiProperty } from '@nestjs/swagger';

export class DocumentoObservacionDto {
  @ApiProperty({
    description: 'ID del documento',
    example: 1
  })
  @IsNumber()
  id_documento: number;

  @ApiProperty({
    description: 'Observación sobre el documento',
    example: 'Este documento necesita correcciones en la sección 3',
    minLength: 1,
    maxLength: 1000
  })
  @IsString()
  @IsNotEmpty()
  observacion: string;

  @ApiProperty({
    description: 'Estado del documento',
    example: 'PENDIENTE',
    enum: ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'EN_REVISION']
  })
  @IsString()
  @IsEnum(['observacion','aceptado','rechazado','vacio'])
  estado: string;
}

export class CreateUserObservationDto {
  @ApiProperty({
    description: 'ID del usuario emisor de la observación',
    example: 1
  })
  @IsNumber()
  fk_usuario_emisor: number;

  @ApiProperty({
    description: 'ID del usuario receptor de la observación',
    example: 2
  })
  @IsNumber()
  fk_usuario_receptor: number;

  @ApiProperty({
    description: 'Array de documentos con sus observaciones',
    type: [DocumentoObservacionDto],
    minItems: 1
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un documento con observación' })
  @ValidateNested({ each: true })
  @Type(() => DocumentoObservacionDto)
  documentos_observacion: DocumentoObservacionDto[];
}