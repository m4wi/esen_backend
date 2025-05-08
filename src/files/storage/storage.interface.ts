// files/storage/storage.interface.ts

import Stream from "stream";

export interface StorageStrategy {
  // Subir un archivo
  upload(file: Express.Multer.File, folderId: string): Promise<any>;

  // Subir múltiples archivos
  uploadMany(files: { filePath: string; fileName: string; mimeType: string }[]): Promise<any[]>;

  // Descargar un archivo
  download(fileId: string): Promise<Buffer | Stream | any>;

  // Descargar múltiples archivos
  downloadMany(fileIds: string[]): Promise<(Buffer | Stream | any)[]>;

  // Listar archivos de una carpeta (por ejemplo la raíz del usuario)
  list(userId: string): Promise<any[]>;

  // Eliminar un archivo
  delete(fileId: string): Promise<any>;

  // Eliminar múltiples archivos
  deleteMany(fileIds: string[]): Promise<any[]>;

  // Crear carpeta raíz para el usuario
  createUserFolder(folderName: string, rootFolderId: string): Promise<string>; // puede devolver el ID o path

  // Eliminar carpeta raíz del usuario (y posiblemente todo su contenido)
  deleteAppFolder(userId: string): Promise<any>;


  getFileRoute(fileId: string): Promise<string>;

  getFolderRoute(folderId: string): Promise<string>;

}