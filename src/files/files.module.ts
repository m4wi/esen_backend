import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { GoogleDriveModule } from './storage/google-drive.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    GoogleDriveModule,
    PrismaModule,
    DatabaseModule
  ],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
