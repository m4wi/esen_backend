import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

// TODO: add interface representing a user entity 
export type User = any;


@Injectable()
export class UsersService {
  constructor(
    private databaseService: DatabaseService
  ){}

  async buscarUsuario ( userCode: string ) {
    if ( !userCode ) {
      throw new Error("usercode is null");
    }
    let userdata: any;
    try {
      const result = await this.databaseService.query(
        `
        SELECT 
          u.usuario_id,
          u.nombre,
          u.apellido,
          u.drive_folder,
          (
            SELECT
              json_agg(row_to_json(o))
            FROM 
              "Observacion" o
            WHERE 
              o.fk_receptor = u.usuario_id
          ) AS observaciones,
          (
            SELECT
              count(*)
            FROM 
              "UsuarioDocumento" 
            WHERE 
              fk_usuario = u.usuario_id 
              AND 
              estado = 'aceptado'
          ) AS documentos_aceptados
          FROM 
            "Usuario" u
          WHERE 
            u.codigo_usuario = $1
        `,
        [userCode]
      );

      userdata = result.rows[0];
      console.log(result)
    } catch (error) {
      throw new Error(error.message);
    }

    return JSON.stringify(userdata);
  }

  async listarDocumentosUsuario (userCode: string, userType: string) {
    if ( !userCode ) {
      throw new Error("usercode is null");
    }
    let userDocuments: any;
    try {
      const result = await this.databaseService.query(
        `
        SELECT
          dc.descripcion_requisito,
          (
            SELECT
              json_agg(sd.nombre_subdescripcion)
            FROM
            "SubDescripcion" sd
            WHERE
              sd.fk_documento = dc.id_documento
          ) sb_name,
          ud.drive_link,
          ud.estado,
          u.codigo_usuario
        FROM
          "Documento" dc
        LEFT JOIN
          "UsuarioDocumento" ud
          ON dc.id_documento = ud.fk_documento
        LEFT JOIN
          "Usuario" u ON u.usuario_id = ud.fk_usuario AND u.codigo_usuario = $1
        WHERE
          dc.tipo_procedimiento = $2;
        `,
        [userCode, userType = 'egresado']
      )
      userDocuments = result.rows;
    } catch (error) {
      throw new Error(error.message)
    }
    return JSON.stringify(userDocuments);
  }
}
