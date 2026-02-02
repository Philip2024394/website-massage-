/**
 * ============================================================================
 * 🔍 CORE OBSERVABILITY - STEP 19 MINIMAL LOGGING
 * ============================================================================
 * 
 * Minimal logging at core boundaries to answer: "Did core succeed or fail?"
 * 
 * LOGGING STRATEGY:
 * - Success/Failure only at core boundaries
 * - No verbose details, just outcome
 * - Timestamp and operation identifier
 * - Prevents blind debugging
 * 
 * ============================================================================
 */

export interface CoreOperation {
  operation: string;
  timestamp: Date;
  success: boolean;
  error?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export class CoreLogger {
  private static operations: CoreOperation[] = [];
  private static maxOperations = 1000; // Keep last 1000 operations

  /**
   * Log a core operation result
   */
  static logOperation(
    operation: string, 
    success: boolean, 
    error?: string, 
    duration?: number,
    metadata?: Record<string, any>
  ): void {
    const logEntry: CoreOperation = {
      operation,
      timestamp: new Date(),
      success,
      error,
      duration,
      metadata
    };

    // Add to operations log
    this.operations.push(logEntry);
    
    // Keep only last maxOperations entries
    if (this.operations.length > this.maxOperations) {
      this.operations = this.operations.slice(-this.maxOperations);
    }

    // Console log for immediate visibility
    const status = success ? '✅' : '❌';
    const errorInfo = error ? ` | Error: ${error}` : '';
    const durationInfo = duration ? ` | ${duration}ms` : '';
    
    console.log(`[CORE] ${status} ${operation}${durationInfo}${errorInfo}`);
  }

  /**
   * Log successful operation with timing
   */
  static success(operation: string, duration?: number, metadata?: Record<string, any>): void {
    this.logOperation(operation, true, undefined, duration, metadata);
  }

  /**
   * Log failed operation with error
   */
  static failure(operation: string, error: string, duration?: number, metadata?: Record<string, any>): void {
    this.logOperation(operation, false, error, duration, metadata);
  }

  /**
   * Get recent operations for debugging
   */
  static getRecentOperations(count: number = 50): CoreOperation[] {
    return this.operations.slice(-count);
  }

  /**
   * Get operations by type
   */
  static getOperationsByType(operationType: string): CoreOperation[] {
    return this.operations.filter(op => op.operation.includes(operationType));
  }

  /**
   * Get failure summary
   */
  static getFailureSummary(): { 
    totalFailures: number; 
    recentFailures: CoreOperation[]; 
    failureRate: number;
  } {
    const failures = this.operations.filter(op => !op.success);
    const recentFailures = failures.slice(-10); // Last 10 failures
    const failureRate = this.operations.length > 0 ? 
      (failures.length / this.operations.length) * 100 : 0;

    return {
      totalFailures: failures.length,
      recentFailures,
      failureRate: Math.round(failureRate * 100) / 100
    };
  }

  /**
   * Get system health summary
   */
  static getHealthSummary(): {
    totalOperations: number;
    successRate: number;
    avgDuration: number;
    lastOperation?: CoreOperation;
  } {
    const totalOps = this.operations.length;
    const successfulOps = this.operations.filter(op => op.success).length;
    const successRate = totalOps > 0 ? (successfulOps / totalOps) * 100 : 0;
    
    const durationsWithTiming = this.operations
      .filter(op => op.duration !== undefined)
      .map(op => op.duration!);
    
    const avgDuration = durationsWithTiming.length > 0 ? 
      durationsWithTiming.reduce((sum, duration) => sum + duration, 0) / durationsWithTiming.length : 0;

    return {
      totalOperations: totalOps,
      successRate: Math.round(successRate * 100) / 100,
      avgDuration: Math.round(avgDuration * 100) / 100,
      lastOperation: this.operations[this.operations.length - 1]
    };
  }

  /**
   * Clear logs (for testing or maintenance)
   */
  static clearLogs(): void {
    this.operations = [];
    console.log('[CORE] Observability logs cleared');
  }
}

/**
 * Utility function to wrap core operations with logging
 */
export function loggedOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  extractMetadata?: (result: T) => Record<string, any>
): Promise<T> {
  const startTime = Date.now();
  
  return operation()
    .then(result => {
      const duration = Date.now() - startTime;
      const metadata = extractMetadata ? extractMetadata(result) : undefined;
      CoreLogger.success(operationName, duration, metadata);
      return result;
    })
    .catch(error => {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      CoreLogger.failure(operationName, errorMessage, duration);
      throw error;
    });
}

export default CoreLogger;