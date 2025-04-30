import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PodsModule } from './pods/pods.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    PodsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
