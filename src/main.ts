import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(express.static('public'));
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(3008);
}
bootstrap();
