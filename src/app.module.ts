import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { FilesModule } from './files/files.module';
import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    AuthModule, 
    UsersModule,
    PrismaModule,
    FilesModule,
    DatabaseModule
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
