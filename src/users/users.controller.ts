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
  Query,
  Patch
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FilesService } from '../files/files.service';
import { UsersService } from './users.service';
import { CreateUserObservationDto } from './dto/create-user-observation.dto';
import { CreatePreguntaDto, PreguntaResponseDto, PatchPreguntaDto } from './dto/create-pregunta.dto';
import { ParseIntPipe } from '@nestjs/common';


@ApiTags('users')
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

  @HttpCode(HttpStatus.OK)
  @Get('documents/review/:userCode')
  checkedUserDocumentState(
    @Query('state') state: string,
    @Param('userCode') userCode: string
  ) {
    return this.usersService.getUserDocumentPerState( state , userCode);
  }

  @HttpCode(HttpStatus.OK)
  @Get('tramite/checked')
  checkedUserDocumentsInfo() {
    return this.usersService.documentsToReview();
  }

  @HttpCode(HttpStatus.OK)
  @Post('observation')
  saveObservationToUser(
    @Body() createUserObservationDto: CreateUserObservationDto
  ) {
    return this.usersService.saveObservacion(createUserObservationDto);
  }

  @ApiOperation({ summary: 'Crear una nueva pregunta' })
  @ApiResponse({ 
    status: 201, 
    description: 'Pregunta creada exitosamente',
    type: PreguntaResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o usuario no encontrado' })
  @HttpCode(HttpStatus.CREATED)
  @Post('pregunta')
  saveQuestionToUser(
    @Body() createPreguntaDto: CreatePreguntaDto
  ): Promise<any> {
    return this.usersService.savePregunta(createPreguntaDto);
  }


  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('pregunta/:questionId')
  partialUpdateQuestion(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() patchPreguntaDto: PatchPreguntaDto
  ) {
    return this.usersService.partialUpdateQuestion(patchPreguntaDto, questionId);
  }
}