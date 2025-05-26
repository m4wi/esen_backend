import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

// TODO: add interface representing a user entity 
export type User = any;


@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService
  ){}

  async buscarUsuario ( userCode: string ) {
    if ( !userCode ) {
      throw new Error("usercode is null");
    }
    try {
      const user = await this.prismaService.usuario.findUniqueOrThrow({
        where: {
          codigo_usuario: userCode
        },
        select: {
          nombre: true,
          apellido: true,
          drive_folder: true,
          usuario_id: true,
          observacionesRecibidas: {
            select: {
              id_observacion: true,
              fk_emisor: true,
              fk_receptor: true,
              contenido: true,
              fecha: true,
              descripcion: true
            }
          },
          documentos: {
            select: {
              id_udoc: true,
              drive_link: true
            }
          }
        },
      });

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async listarDocumentosUsuario (userCode: string) {
    if ( !userCode ) {
      throw new Error("usercode is null");
    }
    try {
      const userDocuments = await this.prismaService.usuario.findFirstOrThrow({
        where:{
          codigo_usuario: userCode
        },
        select: {
          documentos: {
            select: {
              estado: true,
              drive_link: true,
              id_udoc: true,
              documento: {
                select: {
                  id_documento: true,
                  descripcion_requisito: true,
                  subdescripciones: {
                    select: {
                      order: true,
                      nombre_subdescripcion : true
                    }
                  }
                }
              }
            }
          }
        }
      });
      return userDocuments;
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
