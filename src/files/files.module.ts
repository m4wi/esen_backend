import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { GoogleDriveModule } from './storage/google-drive.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    GoogleDriveModule,
    PrismaModule
  ],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
