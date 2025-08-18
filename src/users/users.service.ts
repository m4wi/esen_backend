import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserObservationDto } from './dto/create-user-observation.dto';
import { CreatePreguntaDto, PatchPreguntaDto, PreguntaResponseDto } from './dto/create-pregunta.dto';

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
          ud.id_udoc,
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
          ON u.usuario_id = ud.fk_usuario AND u.codigo_usuario = $1
        WHERE
          dc.tipo_procedimiento = $2
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
            CONCAT(u.nombre, ' ', u.apellido) AS nombre_completo,
            u.tipo_usuario,
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'nombre_documento', dc.nombre_documento,
                'id_documento', dc.id_documento,
                'updated_at', ud.updated_at,
                'id_udoc', ud.id_udoc,
                'drive_link', ud.drive_link
              )
              ORDER BY ud.updated_at DESC
            ) AS documentos_observacion,
            COUNT(*) AS cantidad_documentos,
            (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'pregunta', pr.pregunta,
                  'fecha_respuesta', pr.fecha_respuesta
                )
                ORDER BY pr.fecha_respuesta DESC
              )
              FROM "Preguntas" pr
              WHERE pr.fk_usuario = ud.fk_usuario
                AND pr.fecha_respuesta IS NULL
              LIMIT 2
            ) AS preguntas_sin_responder
          FROM
            "UsuarioDocumento" ud
          JOIN
            "Documento" dc ON dc.id_documento = ud.fk_documento
          JOIN
            "Usuario" u ON u.usuario_id = ud.fk_usuario
          WHERE
            ud.estado = 'enviado' OR ud.estado = 'subido' OR ud.estado = 'corregido'
          GROUP BY
            ud.fk_usuario,
            CONCAT(u.nombre, ' ', u.apellido),
            u.tipo_usuario;
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

  async saveObservacion(createUserObservationDto: CreateUserObservationDto) {

    try {
      await this.databaseService.withTransaction(async (client) => {

        if (createUserObservationDto.documentos_observacion.length > 0) {
          // Validar constraints antes de insertar
          if (createUserObservationDto.fk_usuario_emisor === createUserObservationDto.fk_usuario_receptor) {
            throw new BadRequestException('El emisor no puede ser el mismo que el receptor');
          }

          // Insertar observaciones una por una para mejor manejo de errores
          for (const doc of createUserObservationDto.documentos_observacion) {
            // Validar contenido no vacío
            if (!doc.observacion || doc.observacion.trim().length === 0) {
              throw new BadRequestException('El contenido de la observación no puede estar vacío');
            }

            const insertQuery = `
              INSERT INTO "Observacion" (
                fk_emisor, 
                fk_receptor, 
                fk_usuario_documento, 
                contenido, 
                descripcion,
                fecha,
                created_at,
                updated_at
              ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())
            `;

            const params = [
              createUserObservationDto.fk_usuario_emisor,
              createUserObservationDto.fk_usuario_receptor,
              doc.id_documento,
              doc.observacion.trim(),
              'ninguna', // descripcion
            ];

            await client.query(insertQuery, params);
          }

          const documentIds = createUserObservationDto.documentos_observacion.map(doc => doc.id_documento);
          
          if (documentIds.length > 0) {
            // Construir query con parámetros para prevenir SQL injection
            const updateQuery = `
              UPDATE "UsuarioDocumento"
              SET estado = CASE id_udoc
                ${createUserObservationDto.documentos_observacion
                  .map((_, index) => `WHEN $${index + 1} THEN $${index + 1 + documentIds.length}::"EstadoDocumento"`)
                  .join('\n')}
              END
              WHERE id_udoc IN (${documentIds.map((_, index) => `$${index + 1}`).join(',')})
            `;

            // Preparar parámetros: primero los IDs, luego los estados
            const updateParams = [
              ...documentIds,
              ...createUserObservationDto.documentos_observacion.map(doc => doc.estado)
            ];

            await client.query(updateQuery, updateParams);
          }
        }
      });
      return { message: 'Observación guardada correctamente' };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // =============================================================================
  // MÉTODO PARA GUARDAR PREGUNTAS
  // =============================================================================

  async savePregunta(createPreguntaDto: CreatePreguntaDto): Promise<any> {
    try {
      // Validar que la pregunta no esté vacía
      if (!createPreguntaDto.pregunta || createPreguntaDto.pregunta.trim().length === 0) {
        throw new BadRequestException('El contenido de la pregunta no puede estar vacío');
      }

      // Validar que el usuario existe
      //const userQuery = `SELECT usuario_id FROM "Usuario" WHERE usuario_id = $1`;
      //const userResult = await this.databaseService.query(userQuery, [createPreguntaDto.fk_usuario]);
      
      //if (userResult.rows.length === 0) {
      //  throw new BadRequestException('Usuario no encontrado');
      //}

      const insertQuery = `
        INSERT INTO "Preguntas" (
          pregunta,
          respuesta,
          fk_usuario
        ) VALUES ($1, $2, $3)
        RETURNING *
      `;

      const params = [
        createPreguntaDto.pregunta.trim(),
        createPreguntaDto.respuesta?.trim() || null,
        createPreguntaDto.fk_usuario
      ];

      const result = await this.databaseService.query(insertQuery, params);
      return {
        message: 'Pregunta guardada correctamente',
      }
      // Obtener información del usuario para la respuesta
      // const userInfoQuery = `
      //  SELECT nombre, apellido, codigo_usuario 
      //  FROM "Usuario" 
      //  WHERE usuario_id = $1
      //`;
      
      //const userInfo = await this.databaseService.query(userInfoQuery, [createPreguntaDto.fk_usuario]);
      
      //const preguntaResponse: PreguntaResponseDto = {
      //  ...result.rows[0],
      //  nombre: userInfo.rows[0]?.nombre,
      //  apellido: userInfo.rows[0]?.apellido,
      //  codigo_usuario: userInfo.rows[0]?.codigo_usuario
      //};

      //return preguntaResponse;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al guardar pregunta: ${error.message}`);
    }
  }
  
  async partialUpdateQuestion(patchPreguntaDto: PatchPreguntaDto, questionId: number) {
    try {
      const updateFields : string[] = [];
      const updateValues : any[] = [];

      if (patchPreguntaDto.pregunta !== undefined) {
        updateFields.push(`pregunta = $${updateValues.length + 1}`);
        updateValues.push(patchPreguntaDto.pregunta.trim());
      }
      if (patchPreguntaDto.respuesta !== undefined) {
        updateFields.push(`respuesta = $${updateValues.length + 1}`);
        updateValues.push(patchPreguntaDto.respuesta.trim());
      }
      if (updateFields.length === 0) {
        throw new BadRequestException('Debe proporcionar al menos un campo para actualizar.');
      }

      const partialUpdateQuery = `
        UPDATE "Preguntas"
        SET ${ updateFields.join(', ') }
        WHERE id_pregunta = ${ questionId }
      `;

      const result = await this.databaseService.query(partialUpdateQuery, updateValues);

      if (result.rowCount === 0) {
        throw new NotFoundException(`No se encontró la pregunta con id ${questionId}`);
      }

    } catch (error) {
      console.error('Error al actualizar la pregunta:', error);
      throw new InternalServerErrorException('Ocurrió un error al actualizar la pregunta.');
    }
  }
}
