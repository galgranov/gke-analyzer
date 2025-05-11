# Kubernetes Health Checks Implementation

This document describes the implementation of Kubernetes health checks (liveness and readiness probes) in the GKE Analyzer application using the [@godaddy/terminus](https://github.com/godaddy/terminus) library.

## Overview

Kubernetes uses health checks to determine if a container is running properly and if it's ready to receive traffic. We've implemented two types of health checks:

1. **Liveness Probe**: Indicates if the application is running. If this check fails, Kubernetes will restart the container.
2. **Readiness Probe**: Indicates if the application is ready to receive traffic. If this check fails, Kubernetes will stop sending traffic to the pod.

## Why @godaddy/terminus?

Terminus is a specialized library designed for implementing Kubernetes health checks and graceful shutdowns. Its key advantages are:

- Simple API for health check endpoints
- Built-in graceful shutdown handling
- Clear separation of liveness and readiness
- Works seamlessly with NestJS and other Node.js frameworks
- Integrates directly with your existing HTTP server

## Implementation Details

### Health Module Structure

```
api/src/app/health/
├── health.module.ts    - NestJS module declaration
├── health.controller.ts - Controller with HTTP endpoints
└── health.service.ts   - Service with health check logic
```

### How Terminus Works

Terminus integrates with your existing HTTP server to expose health check endpoints:

- **Liveness**: `/health/liveness` - Returns information about the application's running state
- **Readiness**: `/health/readiness` - Verifies that the application is ready to accept traffic

The service performs health checks on critical dependencies (such as database connectivity) to determine the application's readiness.

### Health Service Implementation

The `HealthService` class tracks application health through:

1. Initial health check on module initialization
2. Database connection monitoring
3. On-demand health checks via the API endpoints

```typescript
// Monitoring database health
private async checkHealth(): Promise<boolean> {
  try {
    // Check MongoDB connection
    const isDbConnected = this.mongoConnection?.readyState === 1;
    
    // Could add more health checks here in the future
    
    this.isAppHealthy = isDbConnected;
    return this.isAppHealthy;
  } catch (error) {
    this.logger.error(`Health check failed: ${error.message}`);
    this.isAppHealthy = false;
    return false;
  }
}
```

## Kubernetes Configuration

The health checks are configured in the Kubernetes deployment file (`k8s-deployment.yaml`):

```yaml
livenessProbe:
  httpGet:
    path: /health/liveness
    port: 3333
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health/readiness
    port: 3333
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

### Parameters Explained

- **initialDelaySeconds**: How long to wait after the container starts before checking
- **periodSeconds**: How often to perform the check
- **timeoutSeconds**: How long to wait for a response before timing out
- **failureThreshold**: How many times the check can fail before the container is considered unhealthy

## Main Application Integration

In `main.ts`, Terminus is initialized and integrated with the NestJS application:

```typescript
// Set up Terminus health checks for Kubernetes probes
const httpServer = app.getHttpServer();
createTerminus(httpServer, {
  logger: (msg: string, err: Error) => {
    if (err) {
      Logger.error(`${msg}: ${err.message}`, err.stack);
    } else {
      Logger.log(msg);
    }
  },
  healthChecks: {
    '/health/liveness': async () => {
      return healthService.liveness();
    },
    '/health/readiness': async () => {
      const result = await healthService.readiness();
      // If status is not 'ok', throw an error to trigger a non-200 response
      if (result.status !== 'ok') {
        throw new Error('Service not ready');
      }
      return result;
    },
  },
});
```

## Testing Health Checks

You can test the health check endpoints locally with:

```bash
# Test liveness
curl http://localhost:3333/health/liveness

# Test readiness
curl http://localhost:3333/health/readiness
```

## Extending Health Checks

To add new health checks, update the `checkHealth()` method in `health.service.ts` to include additional checks:

```typescript
private async checkHealth(): Promise<boolean> {
  try {
    // Check MongoDB connection
    const isDbConnected = this.mongoConnection?.readyState === 1;
    
    // Add new checks here
    const isRedisConnected = await this.checkRedisConnection();
    
    // Combine all checks
    this.isAppHealthy = isDbConnected && isRedisConnected;
    return this.isAppHealthy;
  } catch (error) {
    this.logger.error(`Health check failed: ${error.message}`);
    this.isAppHealthy = false;
    return false;
  }
}
```

Then update the readiness method to include the new check in its response:

```typescript
async readiness() {
  // ... existing code ...
  
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
      redis: {
        status: isRedisConnected ? 'up' : 'down',
        details: isRedisConnected ? 'Connected to Redis' : 'Failed to connect to Redis',
      },
    },
  };
}
```

## Benefits

- **Improved Reliability**: Kubernetes can automatically restart failing containers
- **Better Load Balancing**: Traffic is only sent to healthy containers
- **Graceful Deployment**: New deployments will only receive traffic when ready
- **Smoother Updates**: During rolling updates, traffic is managed intelligently
- **Graceful Shutdown**: Handles termination signals properly to avoid dropped connections
