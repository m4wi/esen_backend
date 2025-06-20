import { ValidationPipe } from '@nestjs/common';

export const testAppConfig = {
  globalPipes: [
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  ],
}; 