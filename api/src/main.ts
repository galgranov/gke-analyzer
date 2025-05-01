/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { AppConfigService } from './app/config/config.service';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfigService);
  
  // Enable CORS
  app.enableCors({
    origin: '*', // Allow requests from any origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  // Serve static files from the Angular app
  app.use(express.static(join(process.cwd(), 'dist/client/browser')));
  
  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('GKE Analyzer API')
    .setDescription('The GKE Analyzer API documentation')
    .setVersion('1.0')
    .addTag('pods')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for reference in the controller
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = process.env.PORT || configService.port;
  const nodeEnv = configService.nodeEnv;
  
  // All other requests not handled by the API will return the Angular app
  app.use('*', (req, res, next) => {
    // Skip if the request is for the API
    if (req.originalUrl.startsWith(`/${globalPrefix}`)) {
      return next();
    }
    res.sendFile(join(process.cwd(), 'dist/client/browser/index.html'));
  });

  await app.listen(port, '0.0.0.0');
  
  Logger.log(
    `🚀 Application is running in ${nodeEnv} mode on: http://localhost:${port}`
  );
  Logger.log(
    `📝 Swagger documentation is available at: http://localhost:${port}/api/docs`
  );
  Logger.log(
    `🌐 Angular client is available at: http://localhost:${port}`
  );
}

bootstrap();
