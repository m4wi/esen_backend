import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { readFile, writeFile } from 'fs/promises';
import { StorageStrategy } from './storage.interface';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import * as path from 'path';
import { Readable } from 'stream';
import { DatabaseService } from 'src/database/database.service';
import { log } from 'console';

@Injectable()
export class GoogleDriveStorage implements StorageStrategy, OnModuleInit {

  private readonly logger : Logger = new Logger(GoogleDriveStorage.name)
  private token: any;
  private cedentials: any;
  private drive: any;
  private authClient: any;
  private rootFolderId: string;
  private CREDENTIALS_PATH = path.resolve(__dirname, '../../../secrets/credentials.json');
  private TOKEN_PATH = path.resolve(__dirname, '../../../secrets/token.json');
  private SCOPES = ['https://www.googleapis.com/auth/drive'];

  constructor(
    private databaseService: DatabaseService
  ) {

  }

  async onModuleInit() {

    const remoteConfigStatus = await this.loadRemoteAppConfig();
    
    if (!remoteConfigStatus) {
      console.warn('No se pudo cargar la configuración de la aplicación desde la base de datos, cargando la configuracion local');
      try {
        await this.loadCredentialsFromFile();
      } catch (error) {
        console.error('Error loading credentials from file:', error);
      }
    }

    this.logger.log('Loaded remote config');
    this.initGoogleAuthClient();
    this.drive = this.refreshDriveApiClient();
  }

  // carga todos las credenciales que necesita la aplicacion para trabajar con la API de google drive
  async loadRemoteAppConfig() {
    let appConfig: any;
    try {
      const result = await this.databaseService.query(
        `
          SELECT 
            "rootDriveId",
            "token",
            "credentials"
          FROM "AppConfig"
          WHERE "id_appconfig" = 1
          LIMIT 1

        `
      );

      appConfig = result.rows[0];

      if (!appConfig) {
        throw new Error('No se encontró la configuración de la aplicación');
      }

      // Agregar logica a las validaciones
      if (!appConfig.rootDriveId) console.warn('No se encontró el root folder de la aplicación');

      this.rootFolderId = appConfig.rootDriveId ?? '';

      if (!appConfig.token) console.warn('No se encontró el token de la aplicación');

      this.token = appConfig.token;

      if (!appConfig.credentials) console.warn('No se encontró las credenciales de la aplicación'); 

      this.cedentials = appConfig.credentials;
      return true;
    } catch (error) {
      return false
    }
  }

  private initGoogleAuthClient() {
    this.authClient = google.auth.fromJSON(this.token);
  }

  private refreshDriveApiClient() {
    return google.drive({version: 'v3', auth: this.authClient});
  }

  // folderName: string , tiene que ser el nombre del usuario. Sin responsabilidad aqui
  async createUserFolder( folderName: string ): Promise<any> {

    const rootFolderId = this.rootFolderId;

    const fileMetadata = {
      'name': `${folderName}`,
      'mimeType': 'application/vnd.google-apps.folder',
      parents: [rootFolderId]
    };
    try {
      const folder = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id'
      });
      return folder.data.id;
    } catch (error) {
      throw error;
    }
  }


// ## No necesaria aun. Solo en caso de no tener root folder !!INECESARIO , tenemos la carga de la app por la base de datos
/*
  async loadRootFolderIdIfExists(): Promise<string | null> {
    try {
      const appConfig = await this.prisma.appConfig.findFirstOrThrow({
        where: {
          id_appconfig: 1
        },
        select: {
          rootDriveId: true
        }
      });
      if (!appConfig.rootDriveId) {
        return null;
      } 
      return appConfig.rootDriveId;
    } catch (error) {
      throw new Error('Error loading root folder ID: ' + error.message);
    }
  }
*/
// ## No necesaria aun. Solo en caso de no tener root folder
  async createUserRootFolder(folderName: string): Promise<any> {
    const drive = google.drive({version: 'v3', auth: this.authClient});
    const fileMetadata = {
      'name': `${folderName}`,
      'mimeType': 'application/vnd.google-apps.folder'
    };
    try {
      const folder = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id'
      });
      return folder.data.id;
    } catch (error) {
      throw error;
    }
  }


  deleteAppFolder(userId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  uploadMany(files: { filePath: string; fileName: string; mimeType: string; }[]): Promise<any[]> {
    throw new Error('Method not implemented.');
  }
  download(fileId: string): Promise<Buffer | import("stream") | any> {
    throw new Error('Method not implemented.');
  }
  downloadMany(fileIds: string[]): Promise<(Buffer | import("stream") | any)[]> {
    throw new Error('Method not implemented.');
  }
  list(userId: string): Promise<any[]> {
    throw new Error('Method not implemented.');
  }
  delete(fileId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  deleteMany(fileIds: string[]): Promise<any[]> {
    throw new Error('Method not implemented.');
  }


  deleteUserRootFolder(userId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }





  async upload(
    file: Express.Multer.File,
    folderId: string
  ): Promise<any> {

    const response = await this.drive.files.create({
      requestBody: {
        name: file.originalname,
        mimeType: file.mimetype,
        parents: [folderId], // opcional
      },
      media: {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer),
      },
      fields: 'id, name',
    });
    return response.data.id
  }


  /* --------------------------------------------------------------- */



  async getToken(): Promise<any> {
    return this.token;
  }


  private async loadCredentialsFromFile(): Promise<void> {
    try {
      const data = await readFile(this.TOKEN_PATH, 'utf8');
      this.token = JSON.parse(data);
      console.log('Token loaded from file:', this.token);
    } catch (error) {
      console.error('No se pudo cargar el archivo de credenciales');
    }
  }

  async saveCredentialsFromFile(client: any): Promise<void> {
    const content = await readFile(this.CREDENTIALS_PATH, 'utf8');
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;

    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });

    await writeFile(this.TOKEN_PATH, payload);
  }

  private async loadSavedCredentialsIfExist(): Promise<any> {
    try {
      if (!this.token) {
        throw new Error('No existe un token cargado');
      }
      const content = this.token;
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch ( error ) {
      console.error('Error loading saved credentials:', error);
      return null;
    }
  }
  private async authorize() {
    let client = await this.loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    client = await authenticate({
      scopes: this.SCOPES,
      keyfilePath: this.CREDENTIALS_PATH,
    });
    if (client.credentials) {
      await this.saveCredentialsFromFile(client);
    }
    return client;
  }

  /* --------------------------------------------------------------- */



  async getFileRoute(fileId: string): Promise<any> {
    try {
      const file = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, webViewLink, webContentLink', // Queremos el enlace de vista previa y contenido
      });
  
      console.log('File ID:', file.data.id);
      console.log('Web View Link:', file.data.webViewLink); // Enlace para ver el archivo en el navegador
      console.log('Web Content Link:', file.data.webContentLink); // Enlace para descargar el archivo
  
      return file.data.webViewLink; // Puedes devolver este enlace
    } catch (error) {
      console.error('Error al obtener archivo:', error);
      throw new Error('Error al obtener el archivo');
    }
  }
  /*
  async getFolderRoute(folderId: string): Promise<any> {
    try {
      const folder = await this.prisma.usuario.findFirstOrThrow({
        where: {
          usuario_id: 1
        },
        select: {
          drive_folder: true,
        }
      });

      if (!folder.drive_folder) {
        throw new Error('No se encontró la carpeta de usuario');
      }

      return `https://drive.google.com/drive/folders/${folder.drive_folder}`;
      // https://drive.google.com/drive/folders/1yZd2ZetTWJzrEhNDgBee5G-7xdCTsfCN
    } catch (error) {
      console.error('Error al obtener la carpeta:', error);
      throw new Error('Error al obtener la carpeta');
    }
  }
    */
}