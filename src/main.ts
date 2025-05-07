import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectCache } from 'memcachelibrarybeta';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  await connectCache({ server: process.env.MEMCACHE_CONNECTION_STRING });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(express.json({ limit: '50mb' })); // Increase the limit if needed
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  await app.listen(process.env.PORT || 3002).then(() => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
}
bootstrap();
