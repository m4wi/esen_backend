import {
  IsInt,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateObservationDocumentDto } from './observation-document.dto';

export class CreateUserObservationDto {
  @IsInt()
  fk_usuario_emisor: number;

  @IsInt()
  fk_usuario_receptor: number;

  @IsString()
  observacion: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateObservationDocumentDto)
  documentos_observacion: UpdateObservationDocumentDto[];
}