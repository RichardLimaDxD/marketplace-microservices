import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { HealthCheckModule } from '@/common/health/health-check.module';

@Module({
  imports: [HealthCheckModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
