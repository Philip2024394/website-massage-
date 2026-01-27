/**
 * ⚡ ERROR MONITORING SERVICE - FACEBOOK STANDARDS
 * 
 * Centralized error tracking, logging, and alerting system
 * - Tracks all booking/chat errors
 * - Provides real-time error dashboards
 * - Sends alerts for critical failures
 * - Maintains error history for debugging
 * 
 * Based on Facebook's Scuba and ODS monitoring systems
 */

export interface ErrorEvent {
  id: string;
  timestamp: Date;
  severity: 'critical' | 'error' | 'warning' | 'info';
  category: 'booking' | 'chat' | 'payment' | 'auth' | 'appwrite' | 'network';
  operation: string; // e.g., 'createBooking', 'sendMessage', 'uploadFile'
  errorMessage: string;
  errorCode?: string | number;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  retryAttempts?: number;
  resolved: boolean;
}

export interface ErrorStats {
  totalErrors: number;
  criticalErrors: number;
  errorsByCategory: Record<string, number>;
  errorsByOperation: Record<string, number>;
  recentErrors: ErrorEvent[];
  errorRate: number; // Errors per minute
}

class ErrorMonitoringService {
  private errors: ErrorEvent[] = [];
  private maxHistorySize = 1000; // Keep last 1000 errors
  private errorRateWindow = 60000; // 1 minute window for rate calculation
  private alertThreshold = 10; // Alert if more than 10 errors per minute
  
  /**
   * Log an error event
   */
  logError(params: {
    severity: ErrorEvent['severity'];
    category: ErrorEvent['category'];
    operation: string;
    errorMessage: string;
    errorCode?: string | number;
    error?: Error;
    context?: Record<string, any>;
    userId?: string;
    sessionId?: string;
    retryAttempts?: number;
  }): string {
    const errorEvent: ErrorEvent = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      severity: params.severity,
      category: params.category,
      operation: params.operation,
      errorMessage: params.errorMessage,
      errorCode: params.errorCode,
      stack: params.error?.stack,
      context: params.context,
      userId: params.userId,
      sessionId: params.sessionId,
      retryAttempts: params.retryAttempts,
      resolved: false
    };
    
    this.errors.push(errorEvent);
    
    // Trim history if needed
    if (this.errors.length > this.maxHistorySize) {
      this.errors = this.errors.slice(-this.maxHistorySize);
    }
    
    // Log to console with appropriate level
    this.logToConsole(errorEvent);
    
    // Check if we need to alert
    this.checkAlertThreshold();
    
    return errorEvent.id;
  }
  
  /**
   * Log to console with severity-based formatting
   */
  private logToConsole(event: ErrorEvent) {
    const prefix = this.getSeverityEmoji(event.severity);
    const message = `${prefix} [${event.category}] ${event.operation}: ${event.errorMessage}`;
    
    const details = {
      errorId: event.id,
      timestamp: event.timestamp.toISOString(),
      code: event.errorCode,
      context: event.context,
      userId: event.userId,
      retryAttempts: event.retryAttempts
    };
    
    switch (event.severity) {
      case 'critical':
        console.error(message, details);
        if (event.stack) console.error('Stack:', event.stack);
        break;
      case 'error':
        console.error(message, details);
        break;
      case 'warning':
        console.warn(message, details);
        break;
      case 'info':
        console.info(message, details);
        break;
    }
  }
  
  /**
   * Get severity emoji
   */
  private getSeverityEmoji(severity: ErrorEvent['severity']): string {
    const emojis = {
      critical: '🚨',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return emojis[severity];
  }
  
  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Check if error rate exceeds threshold and alert
   */
  private checkAlertThreshold() {
    const errorRate = this.getErrorRate();
    
    if (errorRate > this.alertThreshold) {
      console.error(`🚨🚨🚨 CRITICAL ALERT: Error rate is ${errorRate}/min (threshold: ${this.alertThreshold}/min)`);
      console.error('Recent errors:', this.getRecentErrors(10));
    }
  }
  
  /**
   * Get current error rate (errors per minute)
   */
  getErrorRate(): number {
    const now = Date.now();
    const windowStart = now - this.errorRateWindow;
    
    const recentErrors = this.errors.filter(
      e => e.timestamp.getTime() > windowStart
    );
    
    return recentErrors.length;
  }
  
  /**
   * Get error statistics
   */
  getStats(): ErrorStats {
    const now = Date.now();
    const windowStart = now - this.errorRateWindow;
    const recentErrors = this.errors.filter(e => e.timestamp.getTime() > windowStart);
    
    const errorsByCategory: Record<string, number> = {};
    const errorsByOperation: Record<string, number> = {};
    let criticalCount = 0;
    
    for (const error of this.errors) {
      // Category stats
      errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
      
      // Operation stats
      errorsByOperation[error.operation] = (errorsByOperation[error.operation] || 0) + 1;
      
      // Critical count
      if (error.severity === 'critical') {
        criticalCount++;
      }
    }
    
    return {
      totalErrors: this.errors.length,
      criticalErrors: criticalCount,
      errorsByCategory,
      errorsByOperation,
      recentErrors: this.getRecentErrors(20),
      errorRate: recentErrors.length
    };
  }
  
  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 50): ErrorEvent[] {
    return this.errors
      .slice(-limit)
      .reverse(); // Most recent first
  }
  
  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorEvent['category'], limit: number = 50): ErrorEvent[] {
    return this.errors
      .filter(e => e.category === category)
      .slice(-limit)
      .reverse();
  }
  
  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorEvent['severity'], limit: number = 50): ErrorEvent[] {
    return this.errors
      .filter(e => e.severity === severity)
      .slice(-limit)
      .reverse();
  }
  
  /**
   * Get unresolved errors
   */
  getUnresolvedErrors(): ErrorEvent[] {
    return this.errors.filter(e => !e.resolved);
  }
  
  /**
   * Mark error as resolved
   */
  resolveError(errorId: string) {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      console.log(`✅ Error ${errorId} marked as resolved`);
    }
  }
  
  /**
   * Clear error history
   */
  clearHistory() {
    this.errors = [];
    console.log('🗑️ Error history cleared');
  }
  
  /**
   * Export errors for analysis
   */
  exportErrors(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['ID', 'Timestamp', 'Severity', 'Category', 'Operation', 'Message', 'Code', 'Resolved'];
      const rows = this.errors.map(e => [
        e.id,
        e.timestamp.toISOString(),
        e.severity,
        e.category,
        e.operation,
        e.errorMessage.replace(/,/g, ';'), // Escape commas
        e.errorCode || '',
        e.resolved
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(this.errors, null, 2);
  }
}

// Export singleton instance
export const errorMonitor = new ErrorMonitoringService();

/**
 * Quick helper functions for common operations
 */
export const logBookingError = (operation: string, error: Error, context?: Record<string, any>) => {
  return errorMonitor.logError({
    severity: 'error',
    category: 'booking',
    operation,
    errorMessage: error.message,
    error,
    context
  });
};

export const logChatError = (operation: string, error: Error, context?: Record<string, any>) => {
  return errorMonitor.logError({
    severity: 'error',
    category: 'chat',
    operation,
    errorMessage: error.message,
    error,
    context
  });
};

export const logAppwriteError = (operation: string, error: Error, context?: Record<string, any>) => {
  return errorMonitor.logError({
    severity: 'error',
    category: 'appwrite',
    operation,
    errorMessage: error.message,
    error,
    context
  });
};

export const logCriticalError = (category: ErrorEvent['category'], operation: string, error: Error, context?: Record<string, any>) => {
  return errorMonitor.logError({
    severity: 'critical',
    category,
    operation,
    errorMessage: error.message,
    error,
    context
  });
};

/**
 * React hook for error monitoring dashboard
 */
export const useErrorMonitoring = () => {
  return {
    stats: errorMonitor.getStats(),
    recentErrors: errorMonitor.getRecentErrors(),
    unresolvedErrors: errorMonitor.getUnresolvedErrors(),
    errorRate: errorMonitor.getErrorRate(),
    resolveError: (id: string) => errorMonitor.resolveError(id),
    clearHistory: () => errorMonitor.clearHistory(),
    exportErrors: (format: 'json' | 'csv') => errorMonitor.exportErrors(format)
  };
};
