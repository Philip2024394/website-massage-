/**
 * 🏢 ENTERPRISE RATE LIMITING SERVICE
 * 
 * Client-side rate limiting and request throttling
 * - Token bucket algorithm
 * - Request queue management
 * - Automatic backpressure handling
 * - Per-endpoint rate limits
 * - Burst request handling
 * - Request prioritization
 */

import { logger } from './enterpriseLogger';

export interface RateLimitConfig {
  maxRequests: number; // Maximum requests
  windowMs: number; // Time window in milliseconds
  burstSize?: number; // Maximum burst requests (default: maxRequests)
  queueSize?: number; // Maximum queued requests (default: maxRequests * 2)
  priority?: number; // 0-10, higher = more important
}

export interface RateLimitRule {
  endpoint: string;
  config: RateLimitConfig;
  tokens: number;
  lastRefill: number;
  queue: Array<QueuedRequest>;
}

interface QueuedRequest {
  id: string;
  endpoint: string;
  priority: number;
  timestamp: number;
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

export interface RateLimitStats {
  totalRequests: number;
  totalThrottled: number;
  totalQueued: number;
  averageWaitTime: number;
  endpointStats: Record<string, {
    requests: number;
    throttled: number;
    queued: number;
    availableTokens: number;
  }>;
}

class EnterpriseRateLimiter {
  private rules = new Map<string, RateLimitRule>();
  private globalConfig: RateLimitConfig = {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
    burstSize: 120,
    queueSize: 200
  };
  private stats: RateLimitStats = {
    totalRequests: 0,
    totalThrottled: 0,
    totalQueued: 0,
    averageWaitTime: 0,
    endpointStats: {}
  };
  private refillTimer?: NodeJS.Timeout;
  private queueProcessor?: NodeJS.Timeout;

  constructor() {
    this.startRefillTimer();
    this.startQueueProcessor();
  }

  /**
   * Configure rate limit for a specific endpoint
   */
  public configureEndpoint(endpoint: string, config: RateLimitConfig): void {
    const rule: RateLimitRule = {
      endpoint,
      config: {
        burstSize: config.maxRequests,
        queueSize: config.maxRequests * 2,
        ...config
      },
      tokens: config.maxRequests,
      lastRefill: Date.now(),
      queue: []
    };

    this.rules.set(endpoint, rule);
    logger.debug(`Rate limit configured for endpoint: ${endpoint}`, config);
  }

  /**
   * Execute a request with rate limiting
   */
  public async execute<T>(
    endpoint: string,
    requestFn: () => Promise<T>,
    priority: number = 5
  ): Promise<T> {
    const rule = this.getOrCreateRule(endpoint);
    this.stats.totalRequests++;

    // Update endpoint stats
    if (!this.stats.endpointStats[endpoint]) {
      this.stats.endpointStats[endpoint] = {
        requests: 0,
        throttled: 0,
        queued: 0,
        availableTokens: rule.tokens
      };
    }
    this.stats.endpointStats[endpoint].requests++;

    // Check if we have tokens available
    if (rule.tokens > 0) {
      rule.tokens--;
      this.stats.endpointStats[endpoint].availableTokens = rule.tokens;
      
      try {
        return await requestFn();
      } catch (error) {
        // Return token on error
        rule.tokens = Math.min(rule.tokens + 1, rule.config.maxRequests);
        throw error;
      }
    }

    // No tokens available - queue or throttle
    if (rule.queue.length < rule.config.queueSize!) {
      return this.queueRequest(endpoint, requestFn, priority);
    }

    // Queue full - throttle
    this.stats.totalThrottled++;
    this.stats.endpointStats[endpoint].throttled++;
    
    const error = new Error(`Rate limit exceeded for ${endpoint}. Queue full.`);
    (error as any).code = 'RATE_LIMIT_EXCEEDED';
    
    logger.warn(`Rate limit exceeded: ${endpoint}`, {
      tokens: rule.tokens,
      queueSize: rule.queue.length,
      maxQueue: rule.config.queueSize
    });

    throw error;
  }

  /**
   * Execute with automatic retry on rate limit
   */
  public async executeWithRetry<T>(
    endpoint: string,
    requestFn: () => Promise<T>,
    options?: {
      maxRetries?: number;
      retryDelay?: number;
      priority?: number;
    }
  ): Promise<T> {
    const maxRetries = options?.maxRetries ?? 3;
    const retryDelay = options?.retryDelay ?? 1000;
    const priority = options?.priority ?? 5;
    
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.execute(endpoint, requestFn, priority);
      } catch (error: any) {
        lastError = error;
        
        if (error.code === 'RATE_LIMIT_EXCEEDED' && attempt < maxRetries) {
          logger.debug(`Rate limit retry ${attempt + 1}/${maxRetries} for ${endpoint}`);
          await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
          continue;
        }
        
        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Check if endpoint has available capacity
   */
  public hasCapacity(endpoint: string): boolean {
    const rule = this.rules.get(endpoint);
    if (!rule) return true; // No limit configured
    
    return rule.tokens > 0 || rule.queue.length < rule.config.queueSize!;
  }

  /**
   * Get current token count for endpoint
   */
  public getAvailableTokens(endpoint: string): number {
    const rule = this.rules.get(endpoint);
    return rule?.tokens ?? this.globalConfig.maxRequests;
  }

  /**
   * Get rate limit statistics
   */
  public getStats(): RateLimitStats {
    return { ...this.stats };
  }

  /**
   * Reset rate limits for an endpoint
   */
  public resetEndpoint(endpoint: string): void {
    const rule = this.rules.get(endpoint);
    if (rule) {
      rule.tokens = rule.config.maxRequests;
      rule.lastRefill = Date.now();
      rule.queue = [];
      logger.debug(`Rate limit reset for endpoint: ${endpoint}`);
    }
  }

  /**
   * Clear all rate limits
   */
  public clearAll(): void {
    this.rules.forEach((_rule, endpoint) => {
      this.resetEndpoint(endpoint);
    });
    this.stats = {
      totalRequests: 0,
      totalThrottled: 0,
      totalQueued: 0,
      averageWaitTime: 0,
      endpointStats: {}
    };
    logger.debug('All rate limits cleared');
  }

  /**
   * Cleanup and stop rate limiter
   */
  public destroy(): void {
    if (this.refillTimer) {
      clearInterval(this.refillTimer);
    }
    if (this.queueProcessor) {
      clearInterval(this.queueProcessor);
    }
    this.rules.clear();
    logger.info('Rate limiter destroyed');
  }

  // ================================================================================
  // PRIVATE METHODS
  // ================================================================================

  private getOrCreateRule(endpoint: string): RateLimitRule {
    let rule = this.rules.get(endpoint);
    
    if (!rule) {
      // Create default rule from global config
      rule = {
        endpoint,
        config: { ...this.globalConfig },
        tokens: this.globalConfig.maxRequests,
        lastRefill: Date.now(),
        queue: []
      };
      this.rules.set(endpoint, rule);
    }

    return rule;
  }

  private async queueRequest<T>(
    endpoint: string,
    requestFn: () => Promise<T>,
    priority: number
  ): Promise<T> {
    const rule = this.rules.get(endpoint)!;
    
    this.stats.totalQueued++;
    this.stats.endpointStats[endpoint].queued++;

    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        id: this.generateRequestId(),
        endpoint,
        priority,
        timestamp: Date.now(),
        execute: requestFn,
        resolve,
        reject
      };

      // Insert in priority order
      const insertIndex = rule.queue.findIndex(req => req.priority < priority);
      if (insertIndex === -1) {
        rule.queue.push(queuedRequest);
      } else {
        rule.queue.splice(insertIndex, 0, queuedRequest);
      }

      logger.debug(`Request queued for ${endpoint}`, {
        queuePosition: insertIndex === -1 ? rule.queue.length : insertIndex,
        queueSize: rule.queue.length,
        priority
      });
    });
  }

  private startRefillTimer(): void {
    // Refill tokens every 100ms
    this.refillTimer = setInterval(() => {
      const now = Date.now();
      
      this.rules.forEach((rule, endpoint) => {
        const elapsedMs = now - rule.lastRefill;
        const tokensToAdd = Math.floor(
          (elapsedMs / rule.config.windowMs) * rule.config.maxRequests
        );

        if (tokensToAdd > 0) {
          const oldTokens = rule.tokens;
          rule.tokens = Math.min(
            rule.tokens + tokensToAdd,
            rule.config.burstSize || rule.config.maxRequests
          );
          rule.lastRefill = now;

          if (rule.tokens > oldTokens) {
            logger.debug(`Refilled tokens for ${endpoint}`, {
              added: tokensToAdd,
              current: rule.tokens,
              max: rule.config.maxRequests
            });
          }
        }
      });
    }, 100);
  }

  private startQueueProcessor(): void {
    // Process queued requests every 50ms
    this.queueProcessor = setInterval(() => {
      this.rules.forEach((rule, endpoint) => {
        while (rule.queue.length > 0 && rule.tokens > 0) {
          const request = rule.queue.shift()!;
          rule.tokens--;

          const waitTime = Date.now() - request.timestamp;
          this.updateAverageWaitTime(waitTime);

          // Execute queued request
          request.execute()
            .then(result => request.resolve(result))
            .catch(error => {
              // Return token on error
              rule.tokens = Math.min(rule.tokens + 1, rule.config.maxRequests);
              request.reject(error);
            });

          logger.debug(`Processed queued request for ${endpoint}`, {
            waited: waitTime,
            remainingQueue: rule.queue.length,
            tokensLeft: rule.tokens
          });
        }
      });
    }, 50);
  }

  private updateAverageWaitTime(waitTime: number): void {
    const totalRequests = this.stats.totalRequests;
    this.stats.averageWaitTime = 
      (this.stats.averageWaitTime * (totalRequests - 1) + waitTime) / totalRequests;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const rateLimiter = new EnterpriseRateLimiter();

// Configure common endpoints
rateLimiter.configureEndpoint('/api/bookings', {
  maxRequests: 50,
  windowMs: 60000, // 50 requests per minute
  priority: 8
});

rateLimiter.configureEndpoint('/api/chat', {
  maxRequests: 100,
  windowMs: 60000, // 100 messages per minute
  priority: 7
});

rateLimiter.configureEndpoint('/api/therapists', {
  maxRequests: 200,
  windowMs: 60000, // 200 requests per minute
  priority: 5
});

rateLimiter.configureEndpoint('/api/locations', {
  maxRequests: 50,
  windowMs: 60000,
  priority: 4
});

logger.info('Enterprise rate limiter initialized with default endpoint configs');

export default rateLimiter;
