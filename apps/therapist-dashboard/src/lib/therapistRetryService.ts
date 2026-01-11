/**
 * 🔄 Therapist Dashboard Retry Service
 * 
 * Dashboard-specific retry logic with monitoring and circuit breaker pattern
 * Implements Facebook standards for resilient API calls
 */

import { retryWithBackoff } from '../../../../lib/rateLimitService';

// Configuration for therapist dashboard retry behavior
export const therapistRetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 8000,
  context: 'therapist-dashboard'
};

// Metrics tracking for monitoring
interface RetryMetrics {
  operationName: string;
  attempts: number;
  success: boolean;
  duration: number;
  timestamp: number;
  error?: string;
}

class TherapistRetryMonitor {
  private metrics: RetryMetrics[] = [];
  private maxMetricsSize = 1000;
  
  recordAttempt(metrics: RetryMetrics) {
    this.metrics.push(metrics);
    
    // Keep metrics size under control
    if (this.metrics.length > this.maxMetricsSize) {
      this.metrics = this.metrics.slice(-this.maxMetricsSize);
    }
    
    // Log failures for monitoring
    if (!metrics.success) {
      console.warn('⚠️ Retry failed:', {
        operation: metrics.operationName,
        attempts: metrics.attempts,
        error: metrics.error
      });
    }
    
    // Send to admin dashboard every 5 minutes
    this.scheduleBatchSend();
  }
  
  private sendTimeout: NodeJS.Timeout | null = null;
  
  private scheduleBatchSend() {
    if (this.sendTimeout) return;
    
    this.sendTimeout = setTimeout(() => {
      this.sendMetricsToAdmin();
      this.sendTimeout = null;
    }, 5 * 60 * 1000); // 5 minutes
  }
  
  private async sendMetricsToAdmin() {
    if (this.metrics.length === 0) return;
    
    try {
      // TODO: Send to admin analytics dashboard
      console.log('📊 Sending retry metrics to admin:', {
        count: this.metrics.length,
        failures: this.metrics.filter(m => !m.success).length
      });
      
      // Clear sent metrics
      this.metrics = [];
    } catch (error) {
      console.error('Failed to send retry metrics:', error);
    }
  }
  
  getMetrics() {
    return [...this.metrics];
  }
  
  getFailureRate() {
    if (this.metrics.length === 0) return 0;
    const failures = this.metrics.filter(m => !m.success).length;
    return failures / this.metrics.length;
  }
}

// Global monitor instance
const retryMonitor = new TherapistRetryMonitor();

/**
 * Wrapper for retry logic with dashboard-specific monitoring
 */
export async function therapistRetryWrapper<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const startTime = Date.now();
  let attempts = 0;
  
  try {
    const result = await retryWithBackoff(
      async () => {
        attempts++;
        return await operation();
      },
      `therapist-${operationName}`,
      therapistRetryConfig.maxRetries,
      therapistRetryConfig.baseDelay
    );
    
    // Record success
    retryMonitor.recordAttempt({
      operationName,
      attempts,
      success: true,
      duration: Date.now() - startTime,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    // Record failure
    retryMonitor.recordAttempt({
      operationName,
      attempts,
      success: false,
      duration: Date.now() - startTime,
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : String(error)
    });
    
    throw error;
  }
}

/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by temporarily blocking requests to failing services
 */
export class TherapistCircuitBreaker {
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  // Configuration
  private failureThreshold = 5; // Open circuit after 5 consecutive failures
  private successThreshold = 2; // Close circuit after 2 consecutive successes in half-open
  private timeout = 60000; // 60 seconds cooldown
  
  constructor(private serviceName: string) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check circuit state
    if (this.state === 'open') {
      // Check if cooldown period has passed
      if (Date.now() - this.lastFailureTime > this.timeout) {
        console.log(`🔄 Circuit breaker ${this.serviceName}: OPEN → HALF-OPEN (cooldown expired)`);
        this.state = 'half-open';
        this.successCount = 0;
      } else {
        throw new Error(`Circuit breaker is OPEN for ${this.serviceName}. Service temporarily unavailable.`);
      }
    }
    
    try {
      // Execute operation
      const result = await operation();
      
      // Record success
      this.onSuccess();
      
      return result;
    } catch (error) {
      // Record failure
      this.onFailure();
      
      throw error;
    }
  }
  
  private onSuccess() {
    this.failureCount = 0;
    
    if (this.state === 'half-open') {
      this.successCount++;
      
      if (this.successCount >= this.successThreshold) {
        console.log(`✅ Circuit breaker ${this.serviceName}: HALF-OPEN → CLOSED (success threshold reached)`);
        this.state = 'closed';
        this.successCount = 0;
      }
    }
  }
  
  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.successCount = 0;
    
    if (this.failureCount >= this.failureThreshold) {
      if (this.state !== 'open') {
        console.error(`❌ Circuit breaker ${this.serviceName}: ${this.state} → OPEN (failure threshold reached)`);
        this.state = 'open';
      }
    }
  }
  
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime
    };
  }
  
  reset() {
    console.log(`🔄 Circuit breaker ${this.serviceName}: Manual reset`);
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }
}

// Pre-configured circuit breakers for common services
export const circuitBreakers = {
  bookingService: new TherapistCircuitBreaker('booking-service'),
  chatService: new TherapistCircuitBreaker('chat-service'),
  paymentService: new TherapistCircuitBreaker('payment-service'),
  notificationService: new TherapistCircuitBreaker('notification-service')
};

// Export monitor for testing/debugging
export { retryMonitor };
