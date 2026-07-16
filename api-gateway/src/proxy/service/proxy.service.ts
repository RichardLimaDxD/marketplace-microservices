/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { gatewayConfigs } from '@/config/gateway.config';
import { firstValueFrom } from 'rxjs';
import { CircuitBreakerService } from '@/common/circuit-breaker/circuit-breaker.service';

interface UserInfo {
  userId: string;
  email: string;
  role: string;
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {}

  async proxyRequest(
    serviceName: keyof typeof gatewayConfigs,
    method: string,
    path: string,
    data?: unknown,
    headers?: Record<string, string>,
    userInfo?: UserInfo,
  ) {
    const service = gatewayConfigs[serviceName];
    const url = `${service.url}${path}`;

    this.logger.log(`Proxying ${method} request to ${serviceName}: ${url}`);

    return this.circuitBreakerService.executeWithCircuitBreaker(
      async () => {
        const enhancedHeaders = {
          ...headers,
          'x-user-id': userInfo?.userId,
          'x-user-email': userInfo?.email,
          'x-user-role': userInfo?.role,
        };

        const response = await firstValueFrom(
          this.httpService.request({
            method: method.toLowerCase(),
            url,
            data,
            headers: enhancedHeaders,
            timeout: service.timeout,
          }),
        );

        return response;
      },
      () => {
        throw new Error(`${serviceName} service is temporarily unavailable`);
      },
      `proxy-${serviceName}`,
      { failureThreshold: 3, timeout: 30000, resetTimeout: 30000 },
    );
  }

  async getServiceHealth(serviceName: keyof typeof gatewayConfigs) {
    try {
      const service = gatewayConfigs[serviceName];

      const response = await firstValueFrom(
        this.httpService.get<{ status: string }>(`${service.url}/health`, {
          timeout: 3000,
        }),
      );

      return { status: 'healthy', data: response.data as { status: string } };
    } catch (error) {
      return { status: 'unhealthy', error: (error as Error).message };
    }
  }
}
