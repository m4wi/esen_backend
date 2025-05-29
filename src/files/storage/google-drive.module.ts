import { Module } from '@nestjs/common';
import { GoogleDriveStorage } from './google-drive.storage'; // Adjust the path as needed
import { PrismaModule } from 'src/prisma/prisma.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    PrismaModule,
    DatabaseModule
  ],
  providers: [GoogleDriveStorage],
  exports: [GoogleDriveStorage],
})
export class GoogleDriveModule {}