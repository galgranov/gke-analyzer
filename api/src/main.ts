/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AppConfigService } from './app/config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfigService);
  
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  const port = configService.port;
  const nodeEnv = configService.nodeEnv;
  
  await app.listen(port);
  
  Logger.log(
    `🚀 Application is running in ${nodeEnv} mode on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
