/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { AppConfigService } from './app/config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfigService);
  
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('GKE Analyzer API')
    .setDescription('The GKE Analyzer API documentation')
    .setVersion('1.0')
    .addTag('pods')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = configService.port;
  const nodeEnv = configService.nodeEnv;
  
  await app.listen(port);
  
  Logger.log(
    `🚀 Application is running in ${nodeEnv} mode on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📝 Swagger documentation is available at: http://localhost:${port}/api/docs`
  );
}

bootstrap();
