import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('StoMaTrade API')
    .setDescription(
      'API documentation for StoMaTrade - Agricultural Supply Chain Management Platform with Blockchain Integration\n\n' +
      'All responses follow standard format:\n' +
      '{\n' +
      '  "header": {\n' +
      '    "statusCode": 200,\n' +
      '    "message": "Success",\n' +
      '    "timestamp": "2025-11-30T10:30:00.000Z"\n' +
      '  },\n' +
      '  "data": { ... }\n' +
      '}'
    )
    .setVersion('2.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Wallet-based authentication endpoints')
    .addTag('Farmer Submissions', 'Farmer NFT minting workflow')
    .addTag('Project Submissions', 'Project NFT minting workflow')
    .addTag('Investments', 'Investment management with blockchain')
    .addTag('Portfolios', 'Investment portfolio management')
    .addTag('Profits', 'Profit distribution management')
    .addTag('Refunds', 'Refund management for failed projects')
    .build();


  app.enableCors({
      origin: ['http://localhost:3000'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type, Authorization',
    });
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api`);
}

bootstrap();
