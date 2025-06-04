import { Module } from '@nestjs/common';
import { GoogleDriveStorage } from './google-drive.storage'; // Adjust the path as needed
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    DatabaseModule
  ],
  providers: [GoogleDriveStorage],
  exports: [GoogleDriveStorage],
})
export class GoogleDriveModule {}