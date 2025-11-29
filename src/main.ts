import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import type { Request, Response } from 'express';

const rawBodySaver = (req: any, _res: any, buf: Buffer) => {
  if (buf?.length) {
    req.rawBody = buf;
  }
};

let cachedServer: any;

export async function bootstrap(isServerless = false) {
  const app = await NestFactory.create(AppModule);

  // Needed for Vercel
  app.use(json({ verify: rawBodySaver }));
  app.use(urlencoded({ verify: rawBodySaver, extended: true }));

  // Required for API consistency
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('StoMaTrade API')
    .setDescription(
      'API documentation for StoMaTrade - Agricultural Supply Chain Management Platform with Blockchain Integration',
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
    .addTag('users', 'User management endpoints')
    .addTag('collectors', 'Collector management endpoints')
    .addTag('farmers', 'Farmer management endpoints')
    .addTag('lands', 'Land management endpoints')
    .addTag('files', 'File management endpoints')
    .addTag('buyers', 'Buyer management endpoints')
    .addTag('projects', 'Project management endpoints')
    .addTag('notifications', 'Notification management endpoints')
    .addTag('Farmer Submissions', 'Farmer NFT minting workflow')
    .addTag('Project Submissions', 'Project NFT minting workflow')
    .addTag('Investments', 'Investment management with blockchain')
    .addTag('Portfolios', 'Investment portfolio management')
    .addTag('Profits', 'Profit distribution management')
    .addTag('Refunds', 'Refund management for failed projects')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // CORS
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  // Serverless Mode (Vercel)
  if (isServerless) {
    await app.init();
    console.log('StoMaTrade running in SERVERLESS mode');
    return app;
  }

  // Normal Mode (Local dev)
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Running on http://localhost:${port}`);
  console.log(`Swagger on http://localhost:${port}/api/docs`);
  return app;
}

if (!process.env.SERVERLESS) {
  bootstrap(false).catch((err) => {
    console.error('Failed to bootstrap Nest application', err);
    process.exit(1);
  });
}

// Vercel entry
export default async function handler(req: Request, res: Response) {
  if (!cachedServer) {
    const app = await bootstrap(true);
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer(req, res);
}
