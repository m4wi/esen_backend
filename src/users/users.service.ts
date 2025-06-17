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
          u.codigo_usuario,
          dc.id_documento,
          dc.doc_ejemplo,
          dc.doc_modelo
        FROM
          "Documento" dc
        LEFT JOIN
          "UsuarioDocumento" ud
          ON dc.id_documento = ud.fk_documento
        LEFT JOIN
          "Usuario" u 
          ON u.usuario_id = ud.fk_usuario
        WHERE
          dc.tipo_procedimiento = $2
          AND (u.codigo_usuario = $1 OR u.codigo_usuario IS NULL);
        `,
        [userCode, userType = 'egresado']
      )
      userDocuments = result.rows;
    } catch (error) {
      throw new Error(error.message)
    }
    return JSON.stringify(userDocuments);
  }
  async documentsToReview() {
    let documentsToReview: any;
    try {
      const result = await this.databaseService.query(
        `
        SELECT
          ud.fk_usuario,
          json_agg(
            json_build_object(
              'nombre_documento', dc.nombre_documento,
              'id_documento', dc.id_documento,
              'updated_at', ud.updated_at,
              'id_udoc', ud.id_udoc,
              'drive_link', ud.drive_link
            )
            ORDER BY ud.updated_at DESC
          ) AS documentos_observacion
        FROM
          "UsuarioDocumento" ud
        JOIN
          "Documento" dc ON dc.id_documento = ud.fk_documento
        WHERE
          ud.estado = 'vacio'
        GROUP BY
          ud.fk_usuario
        HAVING
          COUNT(*) >= 2;
        `
      );
      documentsToReview = result.rows;
    } catch (error) {
      throw new Error(error.message);
    }
    return JSON.stringify(documentsToReview);
  }

  async getUserDocumentPerState(state: string, userCode: string) {
    if (!state) {
      throw new Error("State is null");
    }
    if (!userCode) {
      throw new Error("User code is null");
    }
    let userDocumentsPerState: any;
    try {
      const result = await this.databaseService.query(
        `
          SELECT
            dc.nombre_documento,
            ud.fk_documento,
            ud.fk_usuario
          FROM
            "UsuarioDocumento" ud
          JOIN
            "Documento" dc ON dc.id_documento = ud.fk_documento
          JOIN
            "Usuario" u ON u.usuario_id = ud.fk_usuario
          WHERE
            ud.estado = $1
            AND u.codigo_usuario = $2
        `,
        [state, userCode]
      );
      userDocumentsPerState = result.rows;
    } catch (error) {
      throw new Error(error.message);
    }
    return JSON.stringify(userDocumentsPerState);
  }
}
