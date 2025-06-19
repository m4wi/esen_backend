import { IsInt, IsString, IsISO8601 } from 'class-validator';

export class UpdateObservationDocumentDto {
  @IsInt()
  id_documento: number;

  @IsString()
  estado: string;
}
