import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(request: Record<string, any>): Promise<string> {
    return `${request.ip}-${request.headers['user-agent']}`;
  }
}
