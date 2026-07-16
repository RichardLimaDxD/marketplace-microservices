import { Injectable, Logger } from '@nestjs/common';
import { FallbackService } from './fallback.interface';

@Injectable()
export class DefaultFallbackService implements FallbackService {
  private readonly logger = new Logger(DefaultFallbackService.name);

  createDefaultFallback<T>(
    defaultData: T,
    serviceName: string,
  ): () => Promise<T> {
    return (): Promise<T> => {
      this.logger.warn(`Using default fallback for ${serviceName}`);
      return Promise.resolve(defaultData);
    };
  }

  createErrorFallback<T>(
    serviceName: string,
    errorMessage: string,
  ): () => Promise<T> {
    return (): Promise<never> => {
      this.logger.error(
        `${serviceName} service returned error: ${errorMessage}`,
      );
      throw new Error(errorMessage);
    };
  }

  createEmptyArrayFallback<T>(serviceName: string): () => Promise<T[]> {
    return async (): Promise<T[]> => {
      this.logger.warn(`Using empty array fallback for ${serviceName}`);
      return Promise.resolve([] as T[]);
    };
  }

  createEmptyObjectFallback<T>(serviceName: string): () => Promise<T> {
    return async (): Promise<T> => {
      this.logger.warn(`Using empty object fallback for ${serviceName}`);
      return Promise.resolve({} as T);
    };
  }
}
