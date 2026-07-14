import { Injectable, Logger } from '@nestjs/common';
import {
  CircuitBreakerOptions,
  CircuitBreakerState,
} from './circuit-breaker.interface';

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger('CircuitBreaker');
  private readonly circuits = new Map<string, CircuitBreakerState>();
  private readonly defaultOptions: CircuitBreakerOptions = {
    failureThreshold: 3,
    timeout: 60000,
    resetTimeout: 30000,
  };

  async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
    key: string,
    options: CircuitBreakerOptions = this.defaultOptions,
  ): Promise<T> {
    const config = { ...this.defaultOptions, ...options };
    const circuit = this.getOrCreateCircuit(key, config);

    if (circuit?.state == 'OPEN') {
      if (Date.now() < circuit.nextAttemptTime) {
        this.logger.warn(`Circuit breaker OPEN for ${key}, using fallback`);

        if (fallback) return await fallback();

        throw new Error('Circuit breaker OPEN');
      }

      circuit.state = 'HALF_OPEN';
      this.logger.warn(`Circuit breaker HALF_OPEN for ${key}, using fallback`);
    }
    try {
      const result = await operation();
      this.onSuccess(circuit, key);
      return result;
    } catch (error) {
      this.onFailure(circuit, key);
      this.logger.error(`Circuit breaker failure for ${key}:`, error.message);

      if (fallback) {
        this.logger.log(`Using fallback for ${key}`);
        return await fallback();
      }

      throw error;
    }
  }

  getOrCreateCircuit(key: string, config) {}
}
