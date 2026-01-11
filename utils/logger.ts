/**
 * Production-Safe Logger Utility
 * 
 * Replaces console.* statements with environment-aware logging
 * In production, logs are suppressed to improve performance and security
 * In development, logs are preserved for debugging
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDev: boolean;

  constructor() {
    this.isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    // Always log errors
    if (level === 'error') return true;
    // Log everything in development
    return this.isDev;
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(...args);
    }
  }

  log(...args: any[]): void {
    if (this.shouldLog('log')) {
      console.log(...args);
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(...args);
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(...args);
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(...args);
    }
  }

  group(label: string): void {
    if (this.isDev) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.isDev) {
      console.groupEnd();
    }
  }

  table(data: any): void {
    if (this.isDev) {
      console.table(data);
    }
  }

  time(label: string): void {
    if (this.isDev) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDev) {
      console.timeEnd(label);
    }
  }
}

export const logger = new Logger();

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).logger = logger;
}
