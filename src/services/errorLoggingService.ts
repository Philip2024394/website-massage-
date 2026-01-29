/**
 * 🔒 CENTRALIZED ERROR LOGGING SERVICE
 * Silently logs all errors to admin dashboard
 * Never shows raw errors to users
 */

import { databases } from '../lib/appwrite';
import { ID } from 'appwrite';

// Database IDs
const DATABASE_ID = '68f76ee1000e64ca8d05';
const ERROR_LOGS_COLLECTION_ID = 'ERROR_LOGS'; // Create this collection in Appwrite

export interface ErrorLogEntry {
  timestamp: string;
  errorType: 'runtime' | 'api' | 'network' | 'auth' | 'validation' | 'unknown';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  userRole?: 'customer' | 'therapist' | 'admin' | 'guest';
  page?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class ErrorLoggingService {
  private errorQueue: ErrorLogEntry[] = [];
  private isProcessing = false;
  private maxQueueSize = 100;
  private batchSize = 10;

  /**
   * Log error silently - never throws
   */
  async logError(error: Error | string, context?: Partial<ErrorLogEntry>): Promise<void> {
    try {
      const errorEntry = this.createErrorEntry(error, context);
      
      // Add to queue for batch processing
      this.errorQueue.push(errorEntry);
      
      // Console log in development only
      if (import.meta.env.DEV) {
        console.error('🔴 [Error Logged]:', errorEntry.message, errorEntry);
      }
      
      // Process queue if not already processing
      if (!this.isProcessing && this.errorQueue.length >= this.batchSize) {
        await this.processQueue();
      }
      
      // Prevent queue overflow
      if (this.errorQueue.length > this.maxQueueSize) {
        this.errorQueue = this.errorQueue.slice(-this.maxQueueSize);
      }
    } catch (loggingError) {
      // Fail silently - never throw from logging service
      console.error('Failed to queue error:', loggingError);
    }
  }

  /**
   * Create structured error entry
   */
  private createErrorEntry(error: Error | string, context?: Partial<ErrorLogEntry>): ErrorLogEntry {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return {
      timestamp: new Date().toISOString(),
      errorType: this.detectErrorType(errorMessage),
      message: errorMessage,
      stack: errorStack,
      context: context?.context || {},
      userId: context?.userId || this.getCurrentUserId(),
      userRole: context?.userRole || this.getCurrentUserRole(),
      page: context?.page || this.getCurrentPage(),
      userAgent: navigator.userAgent,
      severity: context?.severity || this.calculateSeverity(errorMessage),
    };
  }

  /**
   * Detect error type from message
   */
  private detectErrorType(message: string): ErrorLogEntry['errorType'] {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      return 'network';
    }
    if (lowerMessage.includes('auth') || lowerMessage.includes('permission') || lowerMessage.includes('unauthorized')) {
      return 'auth';
    }
    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid') || lowerMessage.includes('required')) {
      return 'validation';
    }
    if (lowerMessage.includes('api') || lowerMessage.includes('endpoint') || lowerMessage.includes('request')) {
      return 'api';
    }
    
    return 'runtime';
  }

  /**
   * Calculate error severity
   */
  private calculateSeverity(message: string): ErrorLogEntry['severity'] {
    const lowerMessage = message.toLowerCase();
    
    // Critical: Payment, booking, security
    if (lowerMessage.includes('payment') || 
        lowerMessage.includes('transaction') ||
        lowerMessage.includes('booking creation') ||
        lowerMessage.includes('security') ||
        lowerMessage.includes('unauthorized access')) {
      return 'critical';
    }
    
    // High: Data loss, authentication
    if (lowerMessage.includes('data loss') ||
        lowerMessage.includes('auth') ||
        lowerMessage.includes('login') ||
        lowerMessage.includes('session')) {
      return 'high';
    }
    
    // Medium: Features not working
    if (lowerMessage.includes('failed to load') ||
        lowerMessage.includes('network') ||
        lowerMessage.includes('timeout')) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Get current user ID from session
   */
  private getCurrentUserId(): string | undefined {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.$id || user.id;
      }
    } catch {
      return undefined;
    }
  }

  /**
   * Get current user role
   */
  private getCurrentUserRole(): ErrorLogEntry['userRole'] {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.role || 'guest';
      }
    } catch {
      return 'guest';
    }
  }

  /**
   * Get current page
   */
  private getCurrentPage(): string {
    return window.location.pathname;
  }

  /**
   * Process error queue (batch upload to database)
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.errorQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Take batch from queue
      const batch = this.errorQueue.splice(0, this.batchSize);
      
      // Upload each error (in production, consider bulk API)
      const uploadPromises = batch.map(errorEntry => 
        this.uploadToDatabase(errorEntry).catch(err => {
          console.error('Failed to upload error log:', err);
        })
      );
      
      await Promise.allSettled(uploadPromises);
    } catch (batchError) {
      console.error('Failed to process error queue:', batchError);
    } finally {
      this.isProcessing = false;
      
      // Continue processing if queue has more items
      if (this.errorQueue.length >= this.batchSize) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }

  /**
   * Upload error to Appwrite database
   */
  private async uploadToDatabase(errorEntry: ErrorLogEntry): Promise<void> {
    try {
      await databases.createDocument(
        DATABASE_ID,
        ERROR_LOGS_COLLECTION_ID,
        ID.unique(),
        {
          ...errorEntry,
          context: JSON.stringify(errorEntry.context || {}),
        }
      );
    } catch (uploadError) {
      // Store locally if upload fails
      this.storeLocally(errorEntry);
    }
  }

  /**
   * Store error locally if database unavailable
   */
  private storeLocally(errorEntry: ErrorLogEntry): void {
    try {
      const key = 'pendingErrorLogs';
      const stored = localStorage.getItem(key);
      const logs = stored ? JSON.parse(stored) : [];
      
      logs.push(errorEntry);
      
      // Keep only last 50 errors locally
      const trimmed = logs.slice(-50);
      
      localStorage.setItem(key, JSON.stringify(trimmed));
    } catch {
      // Fail silently
    }
  }

  /**
   * Flush remaining errors before page unload
   */
  async flushQueue(): Promise<void> {
    if (this.errorQueue.length > 0) {
      await this.processQueue();
    }
  }

  /**
   * Get pending local errors (for admin debugging)
   */
  getPendingLocalErrors(): ErrorLogEntry[] {
    try {
      const stored = localStorage.getItem('pendingErrorLogs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear local error cache
   */
  clearLocalErrors(): void {
    try {
      localStorage.removeItem('pendingErrorLogs');
    } catch {
      // Fail silently
    }
  }
}

// Singleton instance
export const errorLogger = new ErrorLoggingService();

// Flush queue before page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    errorLogger.flushQueue();
  });
}

/**
 * Convenience wrapper for try-catch with automatic logging
 */
export async function withErrorLogging<T>(
  operation: () => Promise<T>,
  context?: Partial<ErrorLogEntry>,
  fallbackValue?: T
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    await errorLogger.logError(error as Error, context);
    return fallbackValue;
  }
}

/**
 * Synchronous version of withErrorLogging
 */
export function withErrorLoggingSync<T>(
  operation: () => T,
  context?: Partial<ErrorLogEntry>,
  fallbackValue?: T
): T | undefined {
  try {
    return operation();
  } catch (error) {
    errorLogger.logError(error as Error, context);
    return fallbackValue;
  }
}
