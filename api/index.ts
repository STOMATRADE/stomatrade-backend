import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { HttpExceptionFilter, AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import express from 'express';

const server = express();
let app;

export default async (req, res) => {
  // Cache app instance to avoid recreating on every request
  if (!app) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    app.enableCors();
    app.setGlobalPrefix('api');

    // Add global pipes, interceptors, and filters
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  }

  return server(req, res);
};
