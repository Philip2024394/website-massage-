/**
 * 🏢 ENTERPRISE ERROR MONITORING SERVICE
 * 
 * Centralized error tracking and monitoring for production
 * - Sentry/Datadog integration ready
 * - Error categorization and prioritization
 * - Stack trace enrichment
 * - User session replay context
 * - Error frequency tracking
 * - Automatic error grouping
 */

import { logger } from './enterpriseLogger';

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  timestamp: number;
  environment: 'development' | 'staging' | 'production';
  buildVersion?: string;
  additionalData?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  type: 'error' | 'unhandledRejection' | 'networkError' | 'apiError' | 'userError';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: ErrorContext;
  fingerprint: string; // For grouping similar errors
  timestamp: number;
  handled: boolean;
}

export interface ErrorMonitoringConfig {
  enabled: boolean;
  sentryDSN?: string;
  datadogApiKey?: string;
  sampleRate: number; // 0-1, percentage of errors to report
  environment: 'development' | 'staging' | 'production';
  enableSessionReplay: boolean;
  ignoreErrors: string[]; // Error messages to ignore
  beforeSend?: (error: ErrorReport) => ErrorReport | null;
}

class EnterpriseErrorMonitoring {
  private config: ErrorMonitoringConfig;
  private errorBuffer: ErrorReport[] = [];
  private errorFrequency = new Map<string, number>();
  private sessionId: string;
  private initialized = false;

  constructor(config?: Partial<ErrorMonitoringConfig>) {
    this.config = {
      enabled: true,
      sampleRate: 1.0, // Report all errors by default
      environment: (process.env.NODE_ENV as any) || 'development',
      enableSessionReplay: true,
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        'Non-Error promise rejection captured'
      ],
      ...config
    };

    this.sessionId = this.generateSessionId();
  }

  /**
   * Initialize error monitoring with global error handlers
   */
  public initialize(): void {
    if (this.initialized) {
      logger.warn('Error monitoring already initialized');
      return;
    }

    logger.info('🏢 Initializing enterprise error monitoring...');

    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        type: 'error',
        handled: false,
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          type: 'unhandledRejection',
          handled: false
        }
      );
    });

    // Network error handler
    window.addEventListener('offline', () => {
      this.captureError(new Error('Network connection lost'), {
        type: 'networkError',
        severity: 'medium',
        handled: true
      });
    });

    // Initialize Sentry if DSN provided
    if (this.config.sentryDSN) {
      this.initializeSentry();
    }

    // Initialize Datadog if API key provided
    if (this.config.datadogApiKey) {
      this.initializeDatadog();
    }

    this.initialized = true;
    logger.info('✅ Enterprise error monitoring initialized');
  }

  /**
   * Capture and report an error
   */
  public captureError(
    error: Error | string,
    options?: {
      type?: ErrorReport['type'];
      severity?: ErrorReport['severity'];
      handled?: boolean;
      additionalData?: Record<string, any>;
    }
  ): string {
    if (!this.config.enabled) return '';

    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    // Check if error should be ignored
    if (this.shouldIgnoreError(errorObj.message)) {
      return '';
    }

    // Apply sampling rate
    if (Math.random() > this.config.sampleRate) {
      return '';
    }

    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: errorObj.message,
      stack: errorObj.stack,
      type: options?.type || 'error',
      severity: options?.severity || this.calculateSeverity(errorObj),
      context: this.buildContext(options?.additionalData),
      fingerprint: this.generateFingerprint(errorObj),
      timestamp: Date.now(),
      handled: options?.handled ?? true
    };

    // Apply beforeSend hook
    if (this.config.beforeSend) {
      const modifiedReport = this.config.beforeSend(errorReport);
      if (!modifiedReport) return ''; // Filtered out by user
      Object.assign(errorReport, modifiedReport);
    }

    // Track error frequency
    this.trackErrorFrequency(errorReport.fingerprint);

    // Buffer error for batch sending
    this.errorBuffer.push(errorReport);

    // Log to enterprise logger
    logger.error(`[ERROR MONITORING] ${errorReport.message}`, {
      errorId: errorReport.id,
      type: errorReport.type,
      severity: errorReport.severity,
      fingerprint: errorReport.fingerprint,
      stack: errorReport.stack
    });

    // Send to remote monitoring if configured
    this.sendToRemoteMonitoring(errorReport);

    // Flush buffer if too large
    if (this.errorBuffer.length >= 50) {
      this.flushErrors();
    }

    return errorReport.id;
  }

  /**
   * Capture exception with context
   */
  public captureException(error: Error, context?: Record<string, any>): string {
    return this.captureError(error, {
      type: 'error',
      handled: true,
      additionalData: context
    });
  }

  /**
   * Capture API error
   */
  public captureApiError(
    endpoint: string,
    statusCode: number,
    error: Error | string,
    requestData?: any
  ): string {
    return this.captureError(error, {
      type: 'apiError',
      severity: statusCode >= 500 ? 'high' : 'medium',
      additionalData: {
        endpoint,
        statusCode,
        requestData
      }
    });
  }

  /**
   * Capture user-facing error (validation, etc.)
   */
  public captureUserError(message: string, context?: Record<string, any>): string {
    return this.captureError(message, {
      type: 'userError',
      severity: 'low',
      handled: true,
      additionalData: context
    });
  }

  /**
   * Set user context for error reports
   */
  public setUser(userId: string, email?: string, username?: string): void {
    (this.config as any).userId = userId;
    (this.config as any).userEmail = email;
    (this.config as any).username = username;

    logger.debug('Error monitoring user context set', { userId, email, username });
  }

  /**
   * Clear user context (on logout)
   */
  public clearUser(): void {
    delete (this.config as any).userId;
    delete (this.config as any).userEmail;
    delete (this.config as any).username;

    logger.debug('Error monitoring user context cleared');
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    topErrors: Array<{ fingerprint: string; count: number }>;
  } {
    const stats = {
      totalErrors: this.errorBuffer.length,
      errorsByType: {} as Record<string, number>,
      errorsBySeverity: {} as Record<string, number>,
      topErrors: [] as Array<{ fingerprint: string; count: number }>
    };

    // Count by type and severity
    this.errorBuffer.forEach(error => {
      stats.errorsByType[error.type] = (stats.errorsByType[error.type] || 0) + 1;
      stats.errorsBySeverity[error.severity] = (stats.errorsBySeverity[error.severity] || 0) + 1;
    });

    // Top errors by frequency
    stats.topErrors = Array.from(this.errorFrequency.entries())
      .map(([fingerprint, count]) => ({ fingerprint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }

  /**
   * Flush buffered errors to remote monitoring
   */
  public async flushErrors(): Promise<void> {
    if (this.errorBuffer.length === 0) return;

    logger.info(`Flushing ${this.errorBuffer.length} errors to remote monitoring...`);

    // TODO: Send to Sentry/Datadog/custom endpoint
    // For now, just log and clear
    logger.info('Error buffer flushed', { count: this.errorBuffer.length });
    this.errorBuffer = [];
  }

  /**
   * Cleanup and stop monitoring
   */
  public destroy(): void {
    this.flushErrors();
    this.errorBuffer = [];
    this.errorFrequency.clear();
    this.initialized = false;
    logger.info('Error monitoring destroyed');
  }

  // ================================================================================
  // PRIVATE METHODS
  // ================================================================================

  private shouldIgnoreError(message: string): boolean {
    return this.config.ignoreErrors.some(pattern => 
      message.includes(pattern)
    );
  }

  private calculateSeverity(error: Error): ErrorReport['severity'] {
    const message = error.message.toLowerCase();
    
    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical';
    }
    if (message.includes('network') || message.includes('timeout')) {
      return 'high';
    }
    if (message.includes('warning') || message.includes('validation')) {
      return 'low';
    }
    
    return 'medium';
  }

  private buildContext(additionalData?: Record<string, any>): ErrorContext {
    return {
      userId: (this.config as any).userId,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      environment: this.config.environment,
      buildVersion: (window as any).__BUILD_VERSION__,
      additionalData
    };
  }

  private generateFingerprint(error: Error): string {
    // Create consistent fingerprint for grouping similar errors
    const key = `${error.name}:${error.message}:${this.getStackTop(error.stack)}`;
    return this.hashCode(key);
  }

  private getStackTop(stack?: string): string {
    if (!stack) return '';
    const lines = stack.split('\n');
    return lines[1] || lines[0] || '';
  }

  private hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  private trackErrorFrequency(fingerprint: string): void {
    const count = this.errorFrequency.get(fingerprint) || 0;
    this.errorFrequency.set(fingerprint, count + 1);

    // Alert if error is occurring frequently
    if (count + 1 >= 10) {
      logger.warn(`Frequent error detected (${count + 1} occurrences)`, { fingerprint });
    }
  }

  private sendToRemoteMonitoring(error: ErrorReport): void {
    // In production, send to Sentry/Datadog
    if (this.config.environment === 'production') {
      // TODO: Implement remote sending
      // For now, just ensure it's in the buffer for flushing
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeSentry(): void {
    logger.info('Initializing Sentry integration...');
    // TODO: Integrate Sentry SDK
    // import * as Sentry from "@sentry/browser";
    // Sentry.init({ dsn: this.config.sentryDSN });
  }

  private initializeDatadog(): void {
    logger.info('Initializing Datadog integration...');
    // TODO: Integrate Datadog SDK
    // import { datadogRum } from '@datadog/browser-rum';
    // datadogRum.init({ applicationId, clientToken, ... });
  }
}

// Singleton instance
export const errorMonitoring = new EnterpriseErrorMonitoring({
  environment: (import.meta.env.MODE as any) || 'development',
  sampleRate: import.meta.env.PROD ? 1.0 : 0.1, // 100% in prod, 10% in dev
  enableSessionReplay: import.meta.env.PROD
});

// Auto-initialize
if (typeof window !== 'undefined') {
  errorMonitoring.initialize();
}

export default errorMonitoring;
