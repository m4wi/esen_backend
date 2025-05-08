import { Module } from '@nestjs/common';
import { GoogleDriveStorage } from './google-drive.storage'; // Adjust the path as needed
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule
  ],
  providers: [GoogleDriveStorage],
  exports: [GoogleDriveStorage],
})
export class GoogleDriveModule {}