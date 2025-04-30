import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  // MongoDB Configuration
  get mongodbUri(): string {
    return this.configService.get<string>('MONGODB_URI');
  }

  get mongodbName(): string {
    return this.configService.get<string>('MONGODB_DB_NAME');
  }

  get mongodbOptions() {
    return {
      // Default connection options for MongoDB cloud
      serverSelectionTimeoutMS: this.configService.get<number>('MONGODB_SERVER_SELECTION_TIMEOUT_MS', 10000),
      connectTimeoutMS: this.configService.get<number>('MONGODB_CONNECT_TIMEOUT_MS', 15000),
      socketTimeoutMS: this.configService.get<number>('MONGODB_SOCKET_TIMEOUT_MS', 45000),
      maxPoolSize: this.configService.get<number>('MONGODB_MAX_POOL_SIZE', 50),
      minPoolSize: this.configService.get<number>('MONGODB_MIN_POOL_SIZE', 5),
      retryWrites: this.configService.get<boolean>('MONGODB_RETRY_WRITES', true),
      retryReads: this.configService.get<boolean>('MONGODB_RETRY_READS', true),
    };
  }

  // API Configuration
  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  // Helper method to get any config value with a default
  get<T>(key: string, defaultValue?: T): T {
    return this.configService.get<T>(key, defaultValue);
  }
}
