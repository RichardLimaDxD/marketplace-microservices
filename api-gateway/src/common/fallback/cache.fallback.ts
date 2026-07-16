import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CacheFallbackService {
  private readonly logger = new Logger(CacheFallbackService.name);
  private readonly cache = new Map<string, { data: any; timestamp: number }>();

  async getCachedData<T>(
    key: string,
    timeout: number = 300000,
  ): Promise<T | null> {
    const cached = this.cache.get(key);

    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > timeout;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    this.logger.log(`Cache HIT for key: ${key}`);
    return Promise.resolve(cached.data as T);
  }

  setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    this.logger.log(`Cache SET for key: ${key}`);
  }

  createCacheFallback<T>(
    key: string,
    defaultData: T,
    timeout: number,
  ): () => Promise<T | null> {
    return async (): Promise<T> => {
      const cached = await this.getCachedData<T>(key, timeout);

      if (cached) {
        this.logger.log(`Using cached data for ${key}`);
        return cached;
      }

      this.logger.log(`NO cached data available for ${key}, using fallback`);
      return defaultData;
    };
  }
}
