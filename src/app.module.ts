import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    AuthModule, 
    UsersModule,
    FilesModule,
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
