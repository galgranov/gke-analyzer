import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.providers.js';
import { Db } from 'mongodb';

@Injectable()
export class HealthService implements OnModuleInit {
  private readonly logger = new Logger(HealthService.name);
  private isAppHealthy = true;

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly mongoDb: Db
  ) {}

  async onModuleInit() {
    // Initial health check
    this.logger.log('Initializing health monitoring');
    await this.checkHealth();
  }

  private async checkHealth(): Promise<boolean> {
    try {
      // Check database connection with MongoDB ping command
      const isDbConnected = await this.checkDbConnection();
      
      // Could add more health checks here in the future
      
      this.isAppHealthy = isDbConnected;
      return this.isAppHealthy;
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      this.isAppHealthy = false;
      return false;
    }
  }

  private async checkDbConnection(): Promise<boolean> {
    try {
      // Try to execute a ping command to verify the connection
      await this.mongoDb.command({ ping: 1 });
      return true;
    } catch (error) {
      this.logger.error(`Database connection check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Liveness probe - indicates if the application is running
   * Used by Kubernetes to know when to restart a container
   * 
   * With Lightship, this is served at the /live endpoint
   */
  liveness() {
    this.logger.log('Liveness probe called');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'gke-analyzer-api',
      uptime: process.uptime(),
    };
  }

  /**
   * Readiness probe - indicates if the application is ready to receive traffic
   * Used by Kubernetes to know when to send traffic to a pod
   * 
   * With Lightship, this is served at the /ready endpoint
   */
  async readiness() {
    this.logger.log('Readiness probe called');
    
    // Perform live health check
    await this.checkHealth();
    
    // Get MongoDB connection status - now using the checkDbConnection method
    const isDbConnected = await this.checkDbConnection();
    
    const status = this.isAppHealthy ? 'ok' : 'error';
    const statusCode = this.isAppHealthy ? 200 : 503;
    
    return {
      status,
      statusCode,
      timestamp: new Date().toISOString(),
      service: 'gke-analyzer-api',
      checks: {
        database: {
          status: isDbConnected ? 'up' : 'down',
          details: isDbConnected ? 'Connected to database' : 'Failed to connect to database',
        },
      },
    };
  }
}
