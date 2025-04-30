import { Module, Global, Logger } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { DATABASE_CONNECTION } from './database.providers';
import { AppConfigService } from '../config/config.service';
import { ConfigModule } from '../config/config.module';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [AppConfigService],
      useFactory: async (configService: AppConfigService) => {
        const logger = new Logger('DatabaseModule');
        const uri = configService.mongodbUri;
        const dbName = configService.mongodbName;
        
        if (!uri || !dbName) {
          throw new Error('MongoDB connection details not found in environment variables');
        }
        
        // Get MongoDB options from config service
        const options = configService.mongodbOptions;
        
        const client = new MongoClient(uri, options);
        
        try {
          // Mask password in logs for security
          const maskedUri = uri.replace(/:([^@]+)@/, ':******@');
          logger.log(`Connecting to MongoDB at ${maskedUri}...`);
          
          await client.connect();
          
          // Test the connection with a simple command
          await client.db(dbName).command({ ping: 1 });
          
          logger.log(`Successfully connected to MongoDB database: ${dbName}`);
          return client.db(dbName);
        } catch (error) {
          logger.error(`Failed to connect to MongoDB: ${error.message}`);
          
          if (configService.isDevelopment) {
            logger.warn('Running in development mode with mock database');
            // Return a mock DB for development if MongoDB is not available
            return {
              collection: (name) => ({
                find: () => ({ toArray: async () => [] }),
                findOne: async () => null,
                insertOne: async (doc) => ({ insertedId: 'mock-id', ...doc }),
                findOneAndUpdate: async () => null,
                findOneAndDelete: async () => null,
              }),
            };
          }
          
          throw error;
        }
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
