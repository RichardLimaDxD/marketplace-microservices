import { Injectable } from '@nestjs/common';
import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerRequest,
} from '@nestjs/throttler';
import { Request, Response } from 'express';

interface ThrottlerNamedConfig {
  limit: number;
  ttl: number;
}

interface RequestResponse {
  req: Request;
  res: Response;
}

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(request: Request): Promise<string> {
    return Promise.resolve(`${request.ip}-${request.headers['user-agent']}`);
  }

  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const { context, limit, ttl } = requestProps;

    const { req, res } = this.getRequestResponse(context) as RequestResponse;

    const throttles = this.reflector.get<Record<string, ThrottlerNamedConfig>>(
      'throttles',
      context.getHandler(),
    );

    const throttleName = throttles ? Object.keys(throttles)[0] : 'default';
    const tracker = await this.getTracker(req);

    const key = this.generateKey(context, tracker, throttleName);

    const totalHits = await this.storageService.increment(
      key,
      ttl,
      limit,
      1,
      throttleName,
    );

    if (Number(totalHits) > limit) {
      res.setHeader('Retry-After', Math.ceil(ttl / 1000));
      throw new ThrottlerException();
    }

    res.setHeader(`${this.headerPrefix}-Limit`, limit);
    res.setHeader(`${this.headerPrefix}-Remaining`, limit - Number(totalHits));
    res.setHeader(`${this.headerPrefix}-Reset`, Math.round(ttl / 1000));
    return true;
  }
}
