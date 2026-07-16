/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable, Logger } from '@nestjs/common';
import { HealthStatus, ServiceHealth } from './health-check.interface';
import { HttpService } from '@nestjs/axios';
import { CircuitBreakerService } from '../circuit-breaker/circuit-breaker.service';
import { firstValueFrom, timeout } from 'rxjs';
import { gatewayConfigs } from '@/config/gateway.config';

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);
  private readonly healthCache = new Map<string, ServiceHealth>();

  constructor(
    private readonly httpService: HttpService,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {}

  async checkServiceHealth(
    serviceName: keyof typeof gatewayConfigs,
  ): Promise<ServiceHealth> {
    const service = gatewayConfigs[serviceName];
    const startTime = Date.now();

    try {
      await this.circuitBreakerService.executeWithCircuitBreaker(
        async () => {
          const response = await firstValueFrom(
            this.httpService
              .get(`${service.url}/health`, {
                timeout: service.timeout,
              })
              .pipe(timeout(service.timeout)),
          );
          return response.data;
        },
        async () => {
          throw new Error('Circuit breaker fallback');
        },
        `health-${serviceName}`,
      );

      const responseTime = Date.now() - startTime;

      const serviceHealth: ServiceHealth = {
        name: serviceName,
        url: service.url,
        status: HealthStatus.HEALTHY,
        responseTime,
        lastChecked: new Date(),
      };

      this.healthCache.set(serviceName, serviceHealth);
      return serviceHealth;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      const serviceHealth: ServiceHealth = {
        name: serviceName,
        url: service.url,
        status: HealthStatus.UNHEALTHY,
        responseTime,
        lastChecked: new Date(),
        error: error.message as Error,
      };

      this.healthCache.set(serviceName, serviceHealth);

      this.logger.error(
        `Health check failed for ${serviceName}: ${error.message}`,
      );

      return serviceHealth;
    }
  }

  async checkAllServices(): Promise<ServiceHealth[]> {
    const services: (keyof typeof gatewayConfigs)[] = [
      'users',
      'products',
      'checkouts',
      'payments',
    ];

    const healthChecks = await Promise.allSettled(
      services.map((serviceName) => this.checkServiceHealth(serviceName)),
    );

    return healthChecks.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: services[index],
          url: gatewayConfigs[services[index]].url,
          status: HealthStatus.UNHEALTHY,
          responseTime: 0,
          lastChecked: new Date(),
          error: result.reason.message as Error,
        };
      }
    });
  }
}
