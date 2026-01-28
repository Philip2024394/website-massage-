/**
 * 🏢 ENTERPRISE LOGGER SERVICE
 * 
 * Structured logging system replacing all console.* calls
 * - Log levels: DEBUG, INFO, WARN, ERROR, FATAL
 * - Centralized log aggregation
 * - PII/sensitive data filtering
 * - Production-safe logging
 * - Integration-ready (CloudWatch, Datadog, New Relic)
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  stack?: string;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
  environment?: string;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  sensitiveKeys: string[];
  maxBatchSize: number;
  flushInterval: number;
  environment: 'development' | 'staging' | 'production';
}

class EnterpriseLogger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;
  private sessionId: string;
  private buildVersion: string;

  constructor() {
    // Browser-safe environment detection using Vite's import.meta.env
    const isDev = import.meta.env.DEV;
    const isProd = import.meta.env.PROD;
    
    this.config = {
      minLevel: LogLevel.INFO,
      enableConsole: isDev,
      enableRemote: isProd,
      remoteEndpoint: import.meta.env.VITE_LOG_ENDPOINT || '/api/logs',
      sensitiveKeys: ['password', 'token', 'apiKey', 'secret', 'credit', 'ssn', 'phone'],
      maxBatchSize: 50,
      flushInterval: 10000, // 10 seconds
      environment: (import.meta.env.MODE || 'development') as any
    };

    this.sessionId = this.generateSessionId();
    this.buildVersion = import.meta.env.VITE_BUILD_VERSION || 'dev';

    // Start auto-flush timer
    this.startFlushTimer();

    // Flush logs on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  /**
   * Debug level logging (verbose)
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Info level logging (general information)
   */
  info(message: string, context?: Record<string, any> | string | number): void {
    // Handle legacy calls with string/number as second param
    const normalizedContext = (typeof context === 'object' && context !== null) 
      ? context 
      : context !== undefined ? { value: context } : undefined;
    this.log(LogLevel.INFO, message, normalizedContext);
  }

  /**
   * Warning level logging (recoverable issues)
   */
  warn(message: string, context?: Record<string, any> | string | number): void {
    // Handle legacy calls with string/number as second param
    const normalizedContext = (typeof context === 'object' && context !== null) 
      ? context 
      : context !== undefined ? { value: context } : undefined;
    this.log(LogLevel.WARN, message, normalizedContext);
  }

  /**
   * Error level logging (errors that need attention)
   */
  error(message: string, context?: Record<string, any> | string | number, error?: Error): void {
    // Handle legacy calls with string/number as second param
    const normalizedContext = (typeof context === 'object' && context !== null) 
      ? context 
      : context !== undefined ? { value: context } : {};
    
    const enhancedContext = {
      ...normalizedContext,
      stack: error?.stack,
      errorName: error?.name,
      errorMessage: error?.message
    };
    this.log(LogLevel.ERROR, message, enhancedContext);
  }

  /**
   * Fatal level logging (critical system failures)
   */
  fatal(message: string, context?: Record<string, any>, error?: Error): void {
    const enhancedContext = {
      ...context,
      stack: error?.stack,
      errorName: error?.name,
      errorMessage: error?.message
    };
    this.log(LogLevel.FATAL, message, enhancedContext);
    
    // Immediate flush for fatal errors
    this.flush();
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    // Check if log level meets threshold
    if (level < this.config.minLevel) {
      return;
    }

    // Create log entry
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context ? this.sanitizeContext(context) : undefined,
      sessionId: this.sessionId,
      buildVersion: this.buildVersion,
      environment: this.config.environment
    };

    // Add to buffer
    this.logBuffer.push(entry);

    // Console output (development only)
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Flush if buffer is full
    if (this.logBuffer.length >= this.config.maxBatchSize) {
      this.flush();
    }
  }

  /**
   * Sanitize sensitive data from context
   */
  private sanitizeContext(context: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(context)) {
      // Check if key contains sensitive information
      const isSensitive = this.config.sensitiveKeys.some(sensitiveKey =>
        key.toLowerCase().includes(sensitiveKey.toLowerCase())
      );

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeContext(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Output to console (development only)
   */
  private logToConsole(entry: LogEntry): void {
    const levelColors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.FATAL]: '\x1b[35m'  // Magenta
    };

    const reset = '\x1b[0m';
    const levelName = LogLevel[entry.level];
    const color = levelColors[entry.level];

    const prefix = `${color}[${entry.timestamp}] [${levelName}]${reset}`;
    const message = `${prefix} ${entry.message}`;

    // Use native console methods to avoid infinite recursion
    switch (entry.level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.info(message, entry.context || '');
        break;
      case LogLevel.WARN:
        console.warn(message, entry.context || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, entry.context || '');
        break;
    }
  }

  /**
   * Flush logs to remote endpoint
   */
  async flush(): Promise<void> {
    if (this.logBuffer.length === 0 || !this.config.enableRemote) {
      return;
    }

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await fetch(this.config.remoteEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          logs: logsToSend,
          sessionId: this.sessionId,
          buildVersion: this.buildVersion,
          environment: this.config.environment
        })
      });
    } catch (error) {
      // Fallback to console if remote logging fails
      if (this.config.enableConsole) {
        logger.error('Failed to send logs to remote endpoint:', error);
      }
      
      // Re-add logs to buffer for retry
      this.logBuffer.unshift(...logsToSend);
    }
  }

  /**
   * Start automatic flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Stop flush timer
   */
  stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update logger configuration
   */
  configure(updates: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current log buffer (for debugging)
   */
  getBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Clear log buffer
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }
}

// Singleton instance
export const logger = new EnterpriseLogger();

// Export default
export default logger;
