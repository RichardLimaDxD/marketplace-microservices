import { Module } from '@nestjs/common';
import { HealthCheckService } from '@/common/health/health-check.service';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';

@Module({
  imports: [HealthCheckService],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
