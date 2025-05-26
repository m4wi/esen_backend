import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
import { FilesModule } from '../files/files.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    FilesModule, // Assuming FilesModule is imported here
    PrismaModule
  ],
  providers: [
    UsersService
  ],
  exports: [],
  controllers: [UserController],
})
export class UsersModule {}
