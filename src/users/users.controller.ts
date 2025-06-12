import { 
  Controller, 
  Get, 
  Param, 
  Body,
  Post,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../files/files.service';
import { UsersService } from './users.service';


@Controller('users')
export class UserController {
  constructor(
    private usersService: UsersService,
    private filesService: FilesService
  ) { }

  @HttpCode(HttpStatus.OK)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadSingleFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { userId: number, documentId: number }
  ) {
    return this.filesService.uploadSingleFile(file, body.userId, body.documentId);
  }

  @Post('upload/multiple')
  @UseInterceptors(FilesInterceptor('files'))
  uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { userId: number }
  ) {
    return this.filesService.uploadFiles(files, body.userId);
  }




  @HttpCode(HttpStatus.OK)
  @Post('init')
  createAppFolder( 
    @Body() folderName: string,
  ) {
    return this.filesService.createAppFolder(folderName);
  }

  @HttpCode(HttpStatus.OK)
  @Post('create/folder')
  createUserFolder(
    @Body() body : {
      folderName: string,
      userId: number
    },
  ) {
    return this.filesService.createUserFolder(body.folderName, body.userId);
  }
  /*
  @HttpCode(HttpStatus.OK)
  @Get('files/list/:userId') 
  getFile(
    @Param('userId') userId: string,
  ) {
    return this.filesService.listDocuments(userId);
  }
  */
  @HttpCode(HttpStatus.OK)
  @Get(':userCode') 
  getUserInfo(
    @Param('userCode') userCode: string,
  ) {
    return this.usersService.buscarUsuario(userCode)
  }

  @HttpCode(HttpStatus.OK)
  @Get('documents/:userCode') 
  getUserDocumentsInfo(
    @Param('userCode') userCode: string,
    @Query('usertype') userType: string
  ) {
    return this.usersService.listarDocumentosUsuario(userCode, userType);
  }
}