import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleDriveStorage } from './storage/google-drive.storage';
import { DatabaseService } from 'src/database/database.service';
import { drive } from 'googleapis/build/src/apis/drive';

@Injectable()
export class FilesService {
  constructor(
    private googleDriveStorage: GoogleDriveStorage,
    private databaseService: DatabaseService
  ) { }

  async uploadSingleFile(
    file: Express.Multer.File,
    userId: number,
    documentId: number
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
    
    // consultar si ya existe el documento y llamar a la funcion actuaizar
    let updateableFileState = false;
    let fileId = "";

    try {
      const result = await this.databaseService.query(
          `
          SELECT
            drive_link,
            regexp_replace(drive_link, '^.*?/d/([^/]+)/.*$', '\\1') AS file_id
          FROM "UsuarioDocumento"
          WHERE fk_usuario = $1
            AND fk_documento = $2
          LIMIT 1;
          `,
          [userId, documentId]
        );
        
        if (result.rows.length > 0) {
          fileId = result.rows[0].file_id;
          updateableFileState = true;
        }
    } catch (error) {
      throw new InternalServerErrorException('Failed to get UsuarioDocumento data');
    }


    if ( !updateableFileState ) {
      fileId = await this.googleDriveStorage.upload(file, userFolderId);
    } else {
      fileId = await this.googleDriveStorage.update(fileId, file);
    }

    if (!fileId) {
      throw new InternalServerErrorException('Failed to upload file to Google Drive');
    }

    try {
      const formatedlink : string = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
      const result = await this.databaseService.query(
        `
        INSERT INTO "UsuarioDocumento" (fk_usuario, fk_documento, drive_link, estado, created_at, updated_at)
        VALUES ($2, $3, $1, 'subido', NOW(), NOW())
        ON CONFLICT (fk_usuario, fk_documento)
        DO UPDATE SET drive_link = EXCLUDED.drive_link, updated_at = NOW();
        `,
        [formatedlink, userId, documentId]
      )
      if (result.rowCount === 0) {
        throw new InternalServerErrorException('No document link updated in the database');
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to update document link in database');
    }
    return {
      driveLink: `https://drive.google.com/drive/folders/${userFolderId}?usp=sharing`,
      status: 'success',
      fileId: fileId
    };
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