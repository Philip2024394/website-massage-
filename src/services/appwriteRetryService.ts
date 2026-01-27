import { logger } from './enterpriseLogger';
/**
 * ⚡ APPWRITE RETRY SERVICE - FACEBOOK STANDARDS
 * 
 * Implements exponential backoff with jitter for all Appwrite operations
 * - Handles network failures gracefully
 * - Prevents cascading failures
 * - Provides observability into retry patterns
 * 
 * Based on AWS SDK retry strategy and Facebook's resilience patterns
 */

export interface RetryConfig {
  maxAttempts?: number; // Default: 3
  baseDelayMs?: number; // Default: 200ms
  maxDelayMs?: number; // Default: 5000ms
  jitterFactor?: number; // Default: 0.2 (20% jitter)
  retryableErrors?: string[]; // Errors that trigger retry
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalDelayMs: number;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  baseDelayMs: 200,
  maxDelayMs: 5000,
  jitterFactor: 0.2,
  retryableErrors: [
    'Network request failed',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'socket hang up',
    '429', // Rate limit
    '500', // Server error
    '502', // Bad gateway
    '503', // Service unavailable
    '504', // Gateway timeout
  ]
};

/**
 * Calculate exponential backoff with jitter
 * Formula: min(maxDelay, baseDelay * 2^attempt * (1 ± jitter))
 */
function calculateDelay(attempt: number, config: Required<RetryConfig>): number {
  const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt);
  const jitter = exponentialDelay * config.jitterFactor * (Math.random() * 2 - 1);
  const delayWithJitter = exponentialDelay + jitter;
  return Math.min(config.maxDelayMs, Math.max(0, delayWithJitter));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any, config: Required<RetryConfig>): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString();
  const errorCode = error.code || error.status || error.statusCode;
  
  // Check error message
  for (const retryableError of config.retryableErrors) {
    if (errorMessage.includes(retryableError) || String(errorCode).includes(retryableError)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Execute operation with retry logic
 * 
 * @param operation - Async function to execute
 * @param config - Retry configuration
 * @returns Result with data or error
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<RetryResult<T>> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error | undefined;
  let totalDelayMs = 0;
  
  for (let attempt = 0; attempt < fullConfig.maxAttempts; attempt++) {
    try {
      const startTime = Date.now();
      const data = await operation();
      const duration = Date.now() - startTime;
      
      // Success!
      if (attempt > 0) {
        logger.info(`✅ Retry successful after ${attempt} attempts (${totalDelayMs}ms total delay)`);
      }
      
      return {
        success: true,
        data,
        attempts: attempt + 1,
        totalDelayMs
      };
      
    } catch (error: any) {
      lastError = error;
      
      // Check if we should retry
      const shouldRetry = attempt < fullConfig.maxAttempts - 1 && isRetryableError(error, fullConfig);
      
      if (shouldRetry) {
        const delayMs = calculateDelay(attempt, fullConfig);
        totalDelayMs += delayMs;
        
        logger.warn(`⚠️ Operation failed (attempt ${attempt + 1}/${fullConfig.maxAttempts}), retrying in ${Math.round(delayMs)}ms...`, {
          error: error.message,
          code: error.code || error.status
        });
        
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        // Not retryable or max attempts reached
        if (!shouldRetry && attempt < fullConfig.maxAttempts - 1) {
          logger.error(`❌ Non-retryable error encountered:`, error);
        }
        break;
      }
    }
  }
  
  // All attempts failed
  logger.error(`❌ Operation failed after ${fullConfig.maxAttempts} attempts (${totalDelayMs}ms total delay)`, lastError);
  
  return {
    success: false,
    error: lastError,
    attempts: fullConfig.maxAttempts,
    totalDelayMs
  };
}

/**
 * Appwrite-specific retry wrapper
 * Pre-configured for Appwrite API patterns
 */
export async function withAppwriteRetry<T>(
  operation: () => Promise<T>,
  operationName: string = 'Appwrite operation'
): Promise<T> {
  const result = await withRetry(operation, {
    maxAttempts: 3,
    baseDelayMs: 300,
    maxDelayMs: 3000,
    jitterFactor: 0.15
  });
  
  if (result.success) {
    return result.data!;
  }
  
  // Log detailed error for monitoring
  logger.error(`🚨 ${operationName} failed after ${result.attempts} attempts:`, {
    error: result.error,
    totalDelay: result.totalDelayMs,
    timestamp: new Date().toISOString()
  });
  
  throw result.error;
}

/**
 * Batch operation with individual retries
 * Fails the whole batch only if all items fail
 */
export async function withBatchRetry<T>(
  items: any[],
  operation: (item: any) => Promise<T>,
  config: RetryConfig = {}
): Promise<{ 
  successes: T[], 
  failures: Array<{ item: any, error: Error }>,
  totalAttempts: number 
}> {
  const successes: T[] = [];
  const failures: Array<{ item: any, error: Error }> = [];
  let totalAttempts = 0;
  
  for (const item of items) {
    const result = await withRetry(() => operation(item), config);
    totalAttempts += result.attempts;
    
    if (result.success) {
      successes.push(result.data!);
    } else {
      failures.push({ item, error: result.error! });
    }
  }
  
  return { successes, failures, totalAttempts };
}

/**
 * Circuit breaker pattern for preventing cascading failures
 * Opens circuit after threshold failures, closes after cooldown
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold: number = 5,
    private cooldownMs: number = 30000
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      
      if (timeSinceLastFailure < this.cooldownMs) {
        throw new Error(`Circuit breaker is OPEN. Cooldown: ${Math.round((this.cooldownMs - timeSinceLastFailure) / 1000)}s remaining`);
      }
      
      // Try half-open state
      this.state = 'half-open';
      logger.info('🔄 Circuit breaker entering HALF-OPEN state');
    }
    
    try {
      const result = await operation();
      
      // Success! Reset circuit
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failureCount = 0;
        logger.info('✅ Circuit breaker CLOSED (recovered)');
      }
      
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      
      if (this.failureCount >= this.threshold) {
        this.state = 'open';
        logger.error(`🚨 Circuit breaker OPENED after ${this.failureCount} failures`);
      }
      
      throw error;
    }
  }
  
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      timeSinceLastFailure: Date.now() - this.lastFailureTime
    };
  }
}

// Export singleton circuit breaker for Appwrite operations
export const appwriteCircuitBreaker = new CircuitBreaker(5, 30000);
