import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
import { FilesModule } from '../files/files.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    FilesModule, // Assuming FilesModule is imported here
    DatabaseModule
  ],
  providers: [
    UsersService
  ],
  exports: [],
  controllers: [UserController],
})
export class UsersModule {}
