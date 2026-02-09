/**
 * 🛡️ BOOT GUARD - Runtime Protection System
 * 
 * This module ensures the app ALWAYS shows landing page even when errors occur.
 * 
 * Protection Levels:
 * 1. Error Boundaries (React level)
 * 2. Window Error Handler (JavaScript level)
 * 3. Promise Rejection Handler (Async level)
 * 4. Fallback HTML (Emergency level)
 * 
 * Golden Rule: Landing Page = Safe Mode
 */

import { logger } from './logger';

interface BootGuardOptions {
  enableAutoRecovery: boolean;
  enableErrorReporting: boolean;
  maxRetries: number;
}

class BootGuard {
  private static instance: BootGuard;
  private options: BootGuardOptions;
  private bootAttempts = 0;
  private hasBooted = false;
  private errorCount = 0;
  private readonly MAX_ERRORS = 5;

  private constructor(options: Partial<BootGuardOptions> = {}) {
    this.options = {
      enableAutoRecovery: true,
      enableErrorReporting: true,
      maxRetries: 3,
      ...options
    };
  }

  public static getInstance(options?: Partial<BootGuardOptions>): BootGuard {
    if (!BootGuard.instance) {
      BootGuard.instance = new BootGuard(options);
    }
    return BootGuard.instance;
  }

  /**
   * Initialize boot protection
   * Call this IMMEDIATELY in main.tsx
   */
  public initialize(): void {
    logger.info('🛡️ [BOOT GUARD] Initializing protection system');

    // Level 1: Window error handler
    window.addEventListener('error', this.handleWindowError.bind(this));

    // Level 2: Unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));

    // Level 3: Set boot flag
    this.markBootAttempt();

    logger.info('🛡️ [BOOT GUARD] Protection active');
  }

  /**
   * Mark successful boot
   */
  public markBootSuccess(): void {
    this.hasBooted = true;
    this.bootAttempts = 0;
    this.errorCount = 0;
    sessionStorage.setItem('boot_success', Date.now().toString());
    logger.info('✅ [BOOT GUARD] Boot successful');
  }

  /**
   * Handle window-level errors
   */
  private handleWindowError(event: ErrorEvent): void {
    this.errorCount++;

    logger.error('🚨 [BOOT GUARD] Window error detected:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });

    // Check if this is a boot-critical error
    if (!this.hasBooted && this.isCriticalError(event)) {
      logger.error('🚨 [BOOT GUARD] CRITICAL BOOT ERROR - Activating fallback');
      this.activateFallbackMode();
    }

    // Too many errors - force safe mode
    if (this.errorCount >= this.MAX_ERRORS) {
      logger.error('🚨 [BOOT GUARD] ERROR THRESHOLD EXCEEDED - Forcing safe mode');
      this.activateFallbackMode();
    }

    // Report error if enabled
    if (this.options.enableErrorReporting) {
      this.reportError({
        type: 'window_error',
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle unhandled promise rejections
   */
  private handlePromiseRejection(event: PromiseRejectionEvent): void {
    this.errorCount++;

    logger.error('🚨 [BOOT GUARD] Promise rejection detected:', {
      reason: event.reason,
      promise: event.promise
    });

    // Check if this is affecting boot
    if (!this.hasBooted) {
      logger.error('🚨 [BOOT GUARD] Promise rejection during boot - Monitoring');
      
      // If multiple rejections, activate fallback
      if (this.errorCount >= 3) {
        logger.error('🚨 [BOOT GUARD] Multiple rejections - Activating fallback');
        this.activateFallbackMode();
      }
    }

    // Report error if enabled
    if (this.options.enableErrorReporting) {
      this.reportError({
        type: 'promise_rejection',
        reason: event.reason?.toString(),
        timestamp: Date.now()
      });
    }
  }

  /**
   * Check if error is critical to boot
   */
  private isCriticalError(event: ErrorEvent): boolean {
    const criticalPatterns = [
      'Cannot read properties of undefined',
      'Cannot read property',
      'is not a function',
      'Failed to fetch',
      'Network Error',
      'Timeout',
      'Provider',
      'Context',
      'Router'
    ];

    return criticalPatterns.some(pattern => 
      event.message?.includes(pattern) ||
      event.error?.message?.includes(pattern)
    );
  }

  /**
   * Activate fallback/safe mode
   * Forces landing page render with minimal dependencies
   */
  private activateFallbackMode(): void {
    logger.error('🚨 [BOOT GUARD] ======================================');
    logger.error('🚨 [BOOT GUARD] ACTIVATING SAFE MODE');
    logger.error('🚨 [BOOT GUARD] ======================================');

    // Clear any loading locks
    sessionStorage.removeItem('LOADING_LOCKED');

    // Force navigation to landing
   window.location.hash = '#/landing';

    // If that doesn't work, render emergency HTML
    setTimeout(() => {
      if (!this.hasBooted) {
        logger.error('🚨 [BOOT GUARD] Navigation failed - Rendering emergency HTML');
        this.renderEmergencyHTML();
      }
    }, 2000);
  }

  /**
   * Render emergency HTML when React fails completely
   */
  private renderEmergencyHTML(): void {
    const emergencyHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IndaStreet - Loading</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #FF7A00 0%, #FF9500 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-center;
            min-height: 100vh;
            color: white;
          }
          .container {
            text-align: center;
            padding: 40px;
          }
          h1 {
            font-size: 48px;
            margin-bottom: 16px;
            font-weight: bold;
          }
          p {
            font-size: 18px;
            margin-bottom: 32px;
            opacity: 0.9;
          }
          .button {
            background: white;
            color: #FF7A00;
            border: none;
            padding: 16px 32px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: scale(1.05);
          }
          .loading-dots {
            display: flex;
            gap: 8px;
            justify-content: center;
            margin-top: 24px;
          }
          .dot {
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            animation: bounce 1s infinite;
          }
          .dot:nth-child(2) { animation-delay: 0.15s; }
          .dot:nth-child(3) { animation-delay: 0.3s; }
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>IndaStreet</h1>
          <p>Professional Massage Services</p>
          <p>Loading your experience...</p>
          <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <br><br>
          <button class="button" onclick="window.location.reload()">
            Refresh Page
          </button>
        </div>
      </body>
      </html>
    `;

    // Get root element
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = emergencyHTML;
    } else {
      // Last resort - replace entire document
      document.open();
      document.write(emergencyHTML);
      document.close();
    }
  }

  /**
   * Mark boot attempt
   */
  private markBootAttempt(): void {
    this.bootAttempts++;
    const maxAttempts = this.options.maxRetries;

    logger.info(`🛡️ [BOOT GUARD] Boot attempt ${this.bootAttempts}/${maxAttempts}`);

    if (this.bootAttempts > maxAttempts) {
      logger.error('🚨 [BOOT GUARD] Max boot attempts exceeded - Forcing safe mode');
      this.activateFallbackMode();
    }
  }

  /**
   * Report error to monitoring system
   */
  private reportError(error: any): void {
    try {
      // Store in localStorage for persistence
      const errors = JSON.parse(localStorage.getItem('boot_errors') || '[]');
      errors.push(error);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('boot_errors', JSON.stringify(errors));

      // TODO: Send to external monitoring service
      // fetch('/api/errors', { method: 'POST', body: JSON.stringify(error) });

    } catch (e) {
      logger.error('Failed to report error:', e);
    }
  }

  /**
   * Get boot guard status
   */
  public getStatus(): {
    hasBooted: boolean;
    bootAttempts: number;
    errorCount: number;
    isHealthy: boolean;
  } {
    return {
      hasBooted: this.hasBooted,
      bootAttempts: this.bootAttempts,
      errorCount: this.errorCount,
      isHealthy: this.hasBooted && this.errorCount < this.MAX_ERRORS
    };
  }

  /**
   * Reset boot guard (for testing)
   */
  public reset(): void {
    this.bootAttempts = 0;
    this.hasBooted = false;
    this.errorCount = 0;
    sessionStorage.removeItem('boot_success');
    logger.info('🛡️ [BOOT GUARD] Reset complete');
  }
}

// Export singleton instance
export const bootGuard = BootGuard.getInstance();

// Export class for testing
export { BootGuard };

// Export convenience functions
export const initializeBootGuard = () => bootGuard.initialize();
export const markBootSuccess = () => bootGuard.markBootSuccess();
export const getBootStatus = () => bootGuard.getStatus();
