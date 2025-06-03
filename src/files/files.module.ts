import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { GoogleDriveModule } from './storage/google-drive.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    GoogleDriveModule,
    DatabaseModule
  ],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
