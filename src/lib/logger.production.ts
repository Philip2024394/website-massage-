/**
 * 🏭 PRODUCTION-GRADE LOGGER
 * 
 * Uber/Gojek Standard: Structured logging with log levels
 * - Development: Logs to console
 * - Production: Sends to external service (Sentry/Datadog)
 * - Zero console.log in production builds
 * 
 * Usage:
 * ```ts
 * import { logger } from '@/lib/logger';
 * 
 * logger.debug('User action', { userId, action });
 * logger.info('Booking created', { bookingId, therapistId });
 * logger.warn('Payment retry', { attempt, orderId });
 * logger.error('Payment failed', error, { orderId, userId });
 * ```
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  stack?: string;
  environment: 'development' | 'production' | 'staging';
}

class ProductionLogger {
  private minLevel: LogLevel;
  private isDevelopment: boolean;
  private isProduction: boolean;
  private logQueue: LogEntry[] = [];
  private maxQueueSize = 100;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.isProduction = import.meta.env.PROD;
    this.minLevel = this.isProduction ? LogLevel.INFO : LogLevel.DEBUG;

    // Flush logs periodically in production
    if (this.isProduction) {
      setInterval(() => this.flushLogs(), 5000);
    }

    // Flush logs before page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flushLogs());
    }
  }

  /**
   * Debug log - Development only
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Info log - General information
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Warning log - Potential issues
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Error log - Errors that need attention
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.log(LogLevel.ERROR, message, context, errorObj);
  }

  /**
   * Critical log - System-breaking errors
   */
  critical(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.log(LogLevel.CRITICAL, message, context, errorObj);
    
    // In production, critical errors should trigger immediate flush
    if (this.isProduction) {
      this.flushLogs();
    }
  }

  /**
   * Core logging function
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    // Skip if below minimum log level
    if (level < this.minLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.sanitizeContext(context),
      error,
      stack: error?.stack,
      environment: this.isProduction ? 'production' : 'development',
    };

    // Development: Log to console
    if (this.isDevelopment) {
      this.logToConsole(entry);
    }

    // Production: Queue for batch sending
    if (this.isProduction) {
      this.queueLog(entry);
    }
  }

  /**
   * Log to console in development
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${LogLevel[entry.level]}]`;
    const contextStr = entry.context ? JSON.stringify(entry.context) : '';

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, contextStr);
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, contextStr);
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, contextStr);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(prefix, entry.message, entry.error || '', contextStr);
        if (entry.stack) {
          console.error(entry.stack);
        }
        break;
    }
  }

  /**
   * Queue log for production sending
   */
  private queueLog(entry: LogEntry): void {
    this.logQueue.push(entry);

    // Prevent memory leak
    if (this.logQueue.length > this.maxQueueSize) {
      this.logQueue.shift();
    }

    // Auto-flush on errors
    if (entry.level >= LogLevel.ERROR) {
      this.flushLogs();
    }
  }

  /**
   * Send logs to external service (Sentry/Datadog)
   */
  private async flushLogs(): Promise<void> {
    if (this.logQueue.length === 0) {
      return;
    }

    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    try {
      // TODO: Integrate with Sentry or Datadog
      // For now, send to your backend error logging endpoint
      if (import.meta.env.VITE_LOGGING_ENDPOINT) {
        await fetch(import.meta.env.VITE_LOGGING_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logs: logsToSend }),
        });
      }
    } catch (error) {
      // Silently fail - don't break app due to logging failure
      // In dev, we can still see the error
      if (this.isDevelopment) {
        console.error('Failed to send logs:', error);
      }
    }
  }

  /**
   * Remove sensitive data from context
   */
  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    const sensitiveKeys = [
      'password',
      'token',
      'apiKey',
      'secret',
      'creditCard',
      'ssn',
      'privateKey',
    ];

    const sanitized: LogContext = {};

    for (const [key, value] of Object.entries(context)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Set minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }
}

// Export singleton instance
export const logger = new ProductionLogger();

// Export for testing
export { ProductionLogger };
