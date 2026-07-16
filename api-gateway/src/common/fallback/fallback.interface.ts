export interface FallbackStrategy<T> {
  execute: () => Promise<T>;
}

export interface FallbackOptions {
  useCache?: boolean;
  cacheTimeout?: number;
  defaultResponse?: any;
  retryCount?: number;
  retryDelay?: number;
}

export interface FallbackService {
  createDefaultFallback<T>(
    defaultData: T,
    serviceName: string,
  ): () => Promise<T>;
  createErrorFallback<T>(
    serviceName: string,
    errorMessage: string,
  ): () => Promise<T>;
  createEmptyArrayFallback<T>(serviceName: string): () => Promise<T[]>;
  createEmptyObjectFallback<T>(serviceName: string): () => Promise<T>;
}
