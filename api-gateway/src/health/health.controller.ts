import { Controller, Get, Param } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheckService } from '@/common/health/health-check.service';
import { HealthStatus } from '@/common/health/health-check.interface';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly healthCheckService: HealthCheckService,
  ) {}

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

  @Get('services')
  @ApiOperation({ summary: 'Health check de todos os serviços' })
  @ApiResponse({ status: 200, description: 'Status de todos os serviços' })
  @ApiResponse({ status: 500, description: 'Services are not healthy' })
  async getServicesHealth() {
    const services = await this.healthCheckService.checkAllServices();

    const overallStatus = services.every(
      (service) => service.status === HealthStatus.HEALTHY,
    )
      ? 'healthy'
      : services.some((service) => service.status === HealthStatus.UNHEALTHY)
        ? 'unhealthy'
        : 'degraded';

    return {
      overallStatus,
      timestamp: new Date().toISOString(),
      services,
      summary: {
        total: services.length,
        healthy: services.filter(
          (service) => service.status === HealthStatus.HEALTHY,
        ).length,
        unhealthy: services.filter(
          (service) => service.status === HealthStatus.UNHEALTHY,
        ).length,
        degraded: services.filter(
          (service) => service.status === HealthStatus.DEGRADED,
        ).length,
      },
    };
  }

  @Get('services/:serviceName')
  @ApiOperation({ summary: 'Health check de um serviço específico' })
  @ApiResponse({ status: 200, description: 'Status do serviço' })
  getServiceHealth(@Param('serviceName') serviceName: string) {
    const cached = this.healthCheckService.getCachedHealth(serviceName);

    if (!cached) {
      return {
        status: 'unknown',
        timestamp: new Date().toISOString(),
        message: 'Service not found or never checked',
      };
    }

    return cached;
  }

  @Get('ready')
  @ApiOperation({ summary: 'Get readiness status' })
  @ApiResponse({
    status: 200,
    description: 'Readiness status retrieved successfully',
  })
  getReady() {
    return this.healthService.getReadyStatus();
  }

  @Get('live')
  @ApiOperation({ summary: 'Get liveness status' })
  @ApiResponse({
    status: 200,
    description: 'Liveness status retrieved successfully',
  })
  getLive() {
    return this.healthService.getLiveStatus();
  }
}
