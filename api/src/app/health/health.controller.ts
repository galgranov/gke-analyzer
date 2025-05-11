import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service.js';
import { Public } from '../auth/decorators/public.decorator.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get('liveness')
  @ApiOperation({ summary: 'Kubernetes liveness probe endpoint' })
  liveness() {
    return this.healthService.liveness();
  }

  @Public()
  @Get('readiness')
  @ApiOperation({ summary: 'Kubernetes readiness probe endpoint' })
  readiness() {
    return this.healthService.readiness();
  }
}
