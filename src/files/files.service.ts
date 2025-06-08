import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleDriveStorage } from './storage/google-drive.storage';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class FilesService {
  constructor(
    private googleDriveStorage: GoogleDriveStorage,
    private databaseService: DatabaseService
  ) { }

  async uploadSingleFile(
    file: Express.Multer.File,
    userId: number
  ) {
    let userFolderId: string | null = '';
    let userFolderData: any;
    try {
      const result = await this.databaseService.query(
        `
        SELECT drive_folder, nombre, apellido
        FROM "Usuario"
        WHERE usuario_id = $1`,
        [userId]
      );
      userFolderData = result.rows[0];

    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user folder from database');
    }

    userFolderId = userFolderData.drive_folder;

    if (!userFolderData.drive_folder) {
      console.warn('No se encontró la carpeta de usuario. Creando una nueva');
      userFolderId = await this.googleDriveStorage.createUserFolder(userFolderData.nombre + ' ' + userFolderData.apellido);
      try {
        const result = await this.databaseService.query(
          `
          UPDATE "Usuario"
          SET 
            drive_folder = $1
          WHERE 
            usuario_id = $2;
          `,
          [userFolderId, userId]
        );
        if (result.rowCount === 0) {
          throw new InternalServerErrorException('No user found with the provided ID');
        }
      } catch (error) {
        throw new InternalServerErrorException('Failed to update user folder');
      }
    }

    if (!userFolderId) {
      throw new Error('Folder ID is null or undefined');
    }

    return this.googleDriveStorage.upload(file, userFolderId);
  }


  async uploadFiles(
    files: Express.Multer.File[],
    userId: number
  ) {

    let userFolderId: string | null = '';
    let userFolderData : any;

    try {
      const result = await this.databaseService.query(`
        SELECT drive_folder, nombre, apellido
        FROM "Usuario"
        WHERE usuario_id = $1`,
        [userId]
      );

      userFolderData = result.rows[0];
    
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user folder from database');
    }

    if (!userFolderData.drive_folder) {
      console.warn('No se encontró la carpeta de usuario. Creando una nueva');
      userFolderId = await this.googleDriveStorage.createUserFolder(userFolderData.nombre + ' ' + userFolderData.apellido);
    }

    userFolderId = userFolderData.drive_folder;
    
    if (!userFolderId) {
      throw new Error('Folder ID is null or undefined');
    }
    return await Promise.all(
      files.map(file => this.googleDriveStorage.upload(file, userFolderId))
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
    let newUserFolder : any;
    // Guardamos el FolderId para sincronizar con la base de datos
    try {
      newUserFolder = await this.databaseService.query(
            `
            UPDATE "Usuario"
            SET 
              drive_folder = $1,
            WHERE 
              usuario_id = $2;
            `,
            [folderId, userId]
      );
      return {
        status: 'success',
      }
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
    let newAppFolder: any;
    try {
      newAppFolder = await this.databaseService.query(
        `
        INSERT INTO "AppConfig" (root_drive_id)
        VALUES ($1)
        `,
        [folderId]
      )
      return {
        appId: newAppFolder.rootDriveId
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to save folder in database');
    }

  }
}