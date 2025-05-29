import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleDriveStorage } from './storage/google-drive.storage';
import { PrismaService } from 'src/prisma/prisma.service';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class FilesService {
  constructor(
    private googleDriveStorage: GoogleDriveStorage,
    private prismaService: PrismaService, // Replace with actual Prisma service
    private databaseService: DatabaseService
  ) { }




  async uploadSingleFile(
    file: Express.Multer.File,
    userId: number
  ) {
    let folderId: string | null = '';
    let userFolderId: any;
    userFolderId = await this.databaseService.query(`
      SELECT drive_folder, nombre, apellido
      FROM "Usuario"
      WHERE usuario_id = 8`
    );

    if (!userFolderId.drive_folder) {
      console.warn('No se encontró la carpeta de usuario. Creando una nueva');
      folderId = await this.googleDriveStorage.createUserFolder(userFolderId.nombre + ' ' + userFolderId.apellido);
    }

    folderId = userFolderId.drive_folder;
    
    if (!folderId) {
      throw new Error('Folder ID is null or undefined');
    }

    return this.googleDriveStorage.upload(file, folderId);
  }



  async uploadFiles(
    files: Express.Multer.File[],
    userId: number
  ) {

    let folderId: string | null = '';
    let userFolderId:any;
    userFolderId = await this.prismaService.usuario.findFirstOrThrow({
      where: {
        usuario_id: userId
      },
      select: {
        drive_folder: true,
        nombre: true,
        apellido: true,
      }
    });

    if (!userFolderId.drive_folder) {
      console.warn('No se encontró la carpeta de usuario. Creando una nueva');
      folderId = await this.createUserFolder(userFolderId.nombre + ' ' + userFolderId.apellido, userId);
    }

    folderId = userFolderId.drive_folder;
    
    if (!folderId) {
      throw new Error('Folder ID is null or undefined');
    }
    return await Promise.all(
      files.map(file => this.googleDriveStorage.upload(file, folderId))
    );
  }




  async getSingleFile(fileId: string) {

  }

  async getFiles(fileIds: string[]) {

  }

  async updateSingleFile(fileId: string, file: Express.Multer.File) {
  
  }

  async updateFiles(fileIds: string[], files: Express.Multer.File[]) {

  }

  async deleteSingleFile(fileId: string) {

  }

  async deleteFiles(fileIds: string[]) {

  }

  async createUserFolder(
    folderName: string,
    userId: number
  ) {
    const folderId = await this.googleDriveStorage.createUserFolder(folderName);

    // Guardamos el FolderId para sincronizar con la base de datos
    try {
      const newUserFolder = await this.prismaService.usuario.update({
        where: {
          usuario_id: userId
        },
        data: {
          drive_folder: folderId
        },
        select: {
          usuario_id: true,
          drive_folder: true,
        }
      });

      return newUserFolder.drive_folder;

    } catch (error) {
      throw new InternalServerErrorException('Failed to save folder in database');
    }
  }

  // Innecesario por el momento
  async createAppFolder( data: any ) {
    const folderId = await this.googleDriveStorage.createUserRootFolder(data.folderName);
    if (!folderId) {
      throw new Error('Failed to create folder');
    }
    try {
      const newAppFolder = await this.prismaService.appConfig.create({
        data: {
          rootDriveId: folderId
        },
        select: {
          rootDriveId: true,
        }
      });
      return {
        appId: newAppFolder.rootDriveId
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to save folder in database');
    }

  }

  listDocuments(userId: string) {
    try {
      
    } catch (error) {

    }
  }


}