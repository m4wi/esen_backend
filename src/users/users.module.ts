import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    FilesModule, // Assuming FilesModule is imported here
  ],
  providers: [],
  exports: [],
  controllers: [UserController],
})
export class UsersModule {}
