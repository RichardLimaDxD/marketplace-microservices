import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check gateway' })
  @ApiResponse({ status: 200, description: 'Gateway service is healthy' })
  @ApiResponse({ status: 500, description: 'Gateway service is not healthy' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version,
    };
  }
}
