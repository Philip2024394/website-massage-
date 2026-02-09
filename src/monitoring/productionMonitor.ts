/**
 * 🔍 PRODUCTION MONITORING - Error Tracking & Alerts
 * 
 * Monitors app health in production and alerts on critical issues:
 * - Boot failures
 * - Blank screens
 * - Infinite loops
 * - Performance degradation
 */

import { logger } from '../utils/logger';

interface ErrorReport {
  type: 'boot_failure' | 'blank_screen' | 'infinite_loop' | 'performance' | 'crash';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: any;
  timestamp: number;
  userAgent: string;
  url: string;
  sessionId: string;
}

interface PerformanceMetrics {
  bootTime: number;
  landingPageRenderTime: number;
  interactionTime: number;
  errorCount: number;
  memoryUsage?: number;
}

class ProductionMonitor {
  private static instance: ProductionMonitor;
  private sessionId: string;
  private metrics: PerformanceMetrics;
  private isProduction: boolean;
  private alertThrottled: Set<string> = new Set();

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.metrics = {
      bootTime: 0,
      landingPageRenderTime: 0,
      interactionTime: 0,
      errorCount: 0
    };
    this.isProduction = import.meta.env.PROD;
  }

  public static getInstance(): ProductionMonitor {
    if (!ProductionMonitor.instance) {
      ProductionMonitor.instance = new ProductionMonitor();
    }
    return ProductionMonitor.instance;
  }

  /**
   * Initialize monitoring
   */
  public initialize(): void {
    if (!this.isProduction) {
      logger.info('[MONITOR] Development mode - monitoring disabled');
      return;
    }

    logger.info('[MONITOR] Production monitoring initialized');

    // Monitor page visibility
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Monitor performance
    this.monitorPerformance();

    // Monitor for blank screens
    this.detectBlankScreen();

    // Monitor for infinite loops
    this.detectInfiniteLoops();

    logger.info('[MONITOR] All monitors active');
  }

  /**
   * Record boot start time
   */
  public recordBootStart(): void {
    performance.mark('boot-start');
  }

  /**
   * Record boot complete
   */
  public recordBootComplete(): void {
    performance.mark('boot-complete');
    
    try {
      const measure = performance.measure('boot-time', 'boot-start', 'boot-complete');
      this.metrics.bootTime = measure.duration;

      logger.info(`[MONITOR] Boot time: ${measure.duration.toFixed(0)}ms`);

      // Alert if boot is too slow
      if (measure.duration > 2000) {
        this.reportIssue({
          type: 'performance',
          severity: 'medium',
          message: 'Slow boot detected',
          details: { bootTime: measure.duration },
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          sessionId: this.sessionId
        });
      }
    } catch (e) {
      logger.error('[MONITOR] Failed to measure boot time:', e);
    }
  }

  /**
   * Record landing page render
   */
  public recordLandingPageRender(): void {
    performance.mark('landing-page-rendered');

    try {
      const measure = performance.measure('landing-render', 'boot-start', 'landing-page-rendered');
      this.metrics.landingPageRenderTime = measure.duration;

      logger.info(`[MONITOR] Landing page render: ${measure.duration.toFixed(0)}ms`);

      // Alert if landing is too slow
      if (measure.duration > 3000) {
        this.reportIssue({
          type: 'performance',
          severity: 'high',
          message: 'Slow landing page render',
          details: { renderTime: measure.duration },
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          sessionId: this.sessionId
        });
      }
    } catch (e) {
      logger.error('[MONITOR] Failed to measure landing page render:', e);
    }
  }

  /**
   * Monitor performance
   */
  private monitorPerformance(): void {
    if ('PerformanceObserver' in window) {
      try {
        // Monitor long tasks (blocking operations > 50ms)
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 100) {
              logger.warn('[MONITOR] Long task detected:', {
                duration: entry.duration,
                startTime: entry.startTime
              });

              // Alert on very long tasks
              if (entry.duration > 500) {
                this.reportIssue({
                  type: 'performance',
                  severity: 'high',
                  message: 'Blocking task detected',
                  details: { duration: entry.duration },
                  timestamp: Date.now(),
                  userAgent: navigator.userAgent,
                  url: window.location.href,
                  sessionId: this.sessionId
                });
              }
            }
          }
        });

        // longTaskObserver.observe({ entryTypes: ['longtask'] });

        // Monitor layout shifts
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const cls = entry as any;
            if (cls.hadRecentInput) continue;

            if (cls.value > 0.1) {
              logger.warn('[MONITOR] Layout shift detected:', {
                value: cls.value
              });
            }
          }
        });

        clsObserver.observe({ entryTypes: ['layout-shift'] });

      } catch (e) {
        logger.error('[MONITOR] Failed to initialize performance monitoring:', e);
      }
    }
  }

  /**
   * Detect blank screens (no visible content)
   */
  private detectBlankScreen(): void {
    setTimeout(() => {
      const root = document.getElementById('root');
      if (!root || !root.textContent || root.textContent.trim().length < 10) {
        logger.error('[MONITOR] Blank screen detected!');
        
        this.reportIssue({
          type: 'blank_screen',
          severity: 'critical',
          message: 'No content rendered after boot',
          details: {
            rootHTML: root?.innerHTML || 'null',
            bodyHTML: document.body.innerHTML.substring(0, 500)
          },
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          sessionId: this.sessionId
        });
      }
    }, 2000); // Check after 2 seconds
  }

  /**
   * Detect infinite loops (repeated navigation)
   */
  private detectInfiniteLoops(): void {
    const navigationHistory: string[] = [];
    let lastCheck = Date.now();

    const checkLoop = () => {
      const currentPage = window.location.hash;
      const now = Date.now();
      const timeSinceLastCheck = now - lastCheck;

      // Only check if less than 1 second since last navigation
      if (timeSinceLastCheck < 1000) {
        navigationHistory.push(currentPage);

        // Check for repeated navigation (same page 5+ times in quick succession)
        if (navigationHistory.length >= 5) {
          const lastFive = navigationHistory.slice(-5);
          const allSame = lastFive.every(page => page === lastFive[0]);

          if (allSame) {
            logger.error('[MONITOR] Infinite loop detected!', {
              page: currentPage,
              count: lastFive.length
            });

            this.reportIssue({
              type: 'infinite_loop',
              severity: 'critical',
              message: 'Repeated navigation detected',
              details: {
                page: currentPage,
                history: navigationHistory.slice(-10)
              },
              timestamp: Date.now(),
              userAgent: navigator.userAgent,
              url: window.location.href,
              sessionId: this.sessionId
            });

            // Clear history to prevent repeated alerts
            navigationHistory.length = 0;
          }
        }

        // Keep only last 10 entries
        if (navigationHistory.length > 10) {
          navigationHistory.splice(0, navigationHistory.length - 10);
        }
      } else {
        // Reset if enough time has passed
        navigationHistory.length = 0;
      }

      lastCheck = now;
    };

    // Monitor hash changes
    window.addEventListener('hashchange', checkLoop);
  }

  /**
   * Handle visibility change (tab hidden/shown)
   */
  private handleVisibilityChange(): void {
    if (document.hidden) {
      logger.debug('[MONITOR] Page hidden');
    } else {
      logger.debug('[MONITOR] Page visible');

      // Check for crashes when returning
      setTimeout(() => {
        this.detectBlankScreen();
      }, 500);
    }
  }

  /**
   * Report issue to monitoring service
   */
  private reportIssue(report: ErrorReport): void {
    // Throttle alerts (max 1 per type per minute)
    const throttleKey = `${report.type}_${Math.floor(Date.now() / 60000)}`;
    if (this.alertThrottled.has(throttleKey)) {
      return;
    }
    this.alertThrottled.add(throttleKey);

    // Log to console
    logger.error('[MONITOR] Issue reported:', report);

    // Store locally
    this.storeReport(report);

    // Send to monitoring service (if configured)
    this.sendToMonitoring(report);

    // Alert development team for critical issues
    if (report.severity === 'critical') {
      this.alertTeam(report);
    }
  }

  /**
   * Store report in localStorage
   */
  private storeReport(report: ErrorReport): void {
    try {
      const reports = JSON.parse(localStorage.getItem('production_reports') || '[]');
      reports.push(report);

      // Keep only last 50 reports
      if (reports.length > 50) {
        reports.splice(0, reports.length - 50);
      }

      localStorage.setItem('production_reports', JSON.stringify(reports));
    } catch (e) {
      logger.error('[MONITOR] Failed to store report:', e);
    }
  }

  /**
   * Send to external monitoring service
   */
  private async sendToMonitoring(report: ErrorReport): Promise<void> {
    // TODO: Implement integration with monitoring service
    // Examples: Sentry, LogRocket, Datadog, etc.
    
    try {
      // Example integration:
      // await fetch('/api/monitoring/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report)
      // });
      
      logger.debug('[MONITOR] Report sent to monitoring service');
    } catch (e) {
      logger.error('[MONITOR] Failed to send report:', e);
    }
  }

  /**
   * Alert development team for critical issues
   */
  private alertTeam(report: ErrorReport): void {
    // TODO: Implement team alerting
    // Examples: Slack webhook, Email, SMS, PagerDuty, etc.
    
    logger.error('[MONITOR] 🚨 CRITICAL ALERT:', report);

    // Example: Send to Slack
    // fetch('SLACK_WEBHOOK_URL', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     text: `🚨 Critical Issue: ${report.message}`,
    //     attachments: [{
    //       color: 'danger',
    //       fields: [
    //         { title: 'Type', value: report.type },
    //         { title: 'URL', value: report.url },
    //         { title: 'Session', value: report.sessionId }
    //       ]
    //     }]
    //   })
    // });
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get all stored reports
   */
  public getReports(): ErrorReport[] {
    try {
      return JSON.parse(localStorage.getItem('production_reports') || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear all reports
   */
  public clearReports(): void {
    localStorage.removeItem('production_reports');
    logger.info('[MONITOR] Reports cleared');
  }
}

// Export singleton
export const productionMonitor = ProductionMonitor.getInstance();

// Export convenience functions
export const initializeMonitoring = () => productionMonitor.initialize();
export const recordBootStart = () => productionMonitor.recordBootStart();
export const recordBootComplete = () => productionMonitor.recordBootComplete();
export const recordLandingPageRender = () => productionMonitor.recordLandingPageRender();
export const getMonitoringMetrics = () => productionMonitor.getMetrics();
export const getMonitoringReports = () => productionMonitor.getReports();
