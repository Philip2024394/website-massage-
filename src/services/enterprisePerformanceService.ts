import { logger } from './enterpriseLogger';
/**
 * 🏢 ENTERPRISE PERFORMANCE SERVICE
 * 
 * Comprehensive performance monitoring and optimization system
 * - Core Web Vitals tracking
 * - Bundle analysis and optimization alerts
 * - Database query performance monitoring
 * - Real-time performance metrics collection
 * - Automatic performance bottleneck detection
 * 
 * Based on Google's Web Performance standards and Meta's performance monitoring
 */

export interface PerformanceMetric {
  id: string;
  timestamp: Date;
  metricType: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'TTI' | 'CUSTOM';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  context?: Record<string, any>;
  userId?: string;
  sessionId: string;
  url: string;
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: 'script' | 'stylesheet' | 'image' | 'fetch' | 'other';
  cached: boolean;
}

export interface DatabaseQueryMetric {
  queryId: string;
  collection: string;
  operation: 'list' | 'get' | 'create' | 'update' | 'delete';
  duration: number;
  resultCount?: number;
  filters?: string[];
  isSlowQuery: boolean;
  timestamp: Date;
}

export interface PerformanceBudget {
  metricType: string;
  budget: number;
  current: number;
  exceeded: boolean;
  severity: 'warning' | 'critical';
}

class EnterprisePerformanceService {
  private metrics: PerformanceMetric[] = [];
  private resourceTimings: ResourceTiming[] = [];
  private queryMetrics: DatabaseQueryMetric[] = [];
  private sessionId: string;
  private performanceObserver?: PerformanceObserver;
  private vitalsObserver?: PerformanceObserver;
  private _isMonitoring = false;

  // Performance budgets (enterprise thresholds)
  private budgets = {
    FCP: 1800, // First Contentful Paint - 1.8s
    LCP: 2500, // Largest Contentful Paint - 2.5s  
    FID: 100,  // First Input Delay - 100ms
    CLS: 0.1,  // Cumulative Layout Shift - 0.1
    TTI: 3500, // Time to Interactive - 3.5s
    TTFB: 600, // Time to First Byte - 600ms
    bundleSize: 512000, // 512KB initial bundle
    chunkSize: 128000,  // 128KB per chunk
    dbQuery: 1000,      // 1s max DB query time
    apiResponse: 2000   // 2s max API response
  };

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializePerformanceMonitoring();
    this.startResourceMonitoring();
    this.monitorWebVitals();
  }

  /**
   * Initialize comprehensive performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    logger.info('🏢 Initializing enterprise performance monitoring...');

    // Monitor long tasks that block the main thread
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'longtask') {
              this.recordCustomMetric({
                name: 'long_task',
                value: entry.duration,
                context: {
                  startTime: entry.startTime,
                  attribution: (entry as any).attribution
                }
              });
            }
          }
        });

        this.performanceObserver.observe({ 
          entryTypes: ['longtask', 'measure', 'navigation'] 
        });

        this._isMonitoring = true;
      } catch (error) {
        logger.warn('⚠️ Performance Observer not supported:', error);
      }
    }

    // Monitor memory usage (if available)
    this.startMemoryMonitoring();

    // Setup automatic reporting
    this.startPerformanceReporting();
  }

  /**
   * Monitor Core Web Vitals
   */
  private monitorWebVitals(): void {
    // First Contentful Paint - use 'paint' entry type
    this.observeVital('paint', 'FCP');
    
    // Largest Contentful Paint
    this.observeVital('largest-contentful-paint', 'LCP');
    
    // First Input Delay
    this.observeInputDelay();
    
    // Cumulative Layout Shift
    this.observeLayoutShift();

    // Time to First Byte
    this.measureTTFB();

    logger.info('✅ Web Vitals monitoring active');
  }

  /**
   * Observe specific vital metric
   */
  private observeVital(entryType: string, metricType: PerformanceMetric['metricType']): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordVitalMetric(metricType, entry.startTime, {
            renderTime: (entry as any).renderTime,
            loadTime: (entry as any).loadTime,
            element: (entry as any).element
          });
        }
      });

      observer.observe({ entryTypes: [entryType] });
    } catch (error) {
      logger.warn(`⚠️ Could not observe ${entryType}:`, error);
    }
  }

  /**
   * Monitor First Input Delay
   */
  private observeInputDelay(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordVitalMetric('FID', (entry as any).processingStart - entry.startTime, {
            inputType: (entry as any).name,
            target: (entry as any).target
          });
        }
      });

      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      logger.warn('⚠️ Could not observe first-input:', error);
    }
  }

  /**
   * Monitor Cumulative Layout Shift
   */
  private observeLayoutShift(): void {
    if (!('PerformanceObserver' in window)) return;

    let cumulativeScore = 0;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cumulativeScore += (entry as any).value;
          }
        }
        
        this.recordVitalMetric('CLS', cumulativeScore, {
          currentScore: cumulativeScore
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      logger.warn('⚠️ Could not observe layout-shift:', error);
    }
  }

  /**
   * Measure Time to First Byte
   */
  private measureTTFB(): void {
    if (typeof window === 'undefined') return;

    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      this.recordVitalMetric('TTFB', ttfb, {
        domainLookup: navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
        connection: navigationEntry.connectEnd - navigationEntry.connectStart,
        request: navigationEntry.responseStart - navigationEntry.requestStart
      });
    }
  }

  /**
   * Record Core Web Vital metric
   */
  private recordVitalMetric(
    metricType: PerformanceMetric['metricType'], 
    value: number, 
    context?: Record<string, any>
  ): void {
    const rating = this.getRating(metricType, value);
    
    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      timestamp: new Date(),
      metricType,
      value,
      rating,
      context,
      sessionId: this.sessionId,
      url: window.location.href
    };

    this.metrics.push(metric);

    // Alert if performance budget exceeded
    if (rating === 'poor') {
      this.alertPerformanceIssue(metric);
    }

    logger.info(`📊 ${metricType}: ${value}ms (${rating})`);
  }

  /**
   * Record custom performance metric
   */
  recordCustomMetric(params: {
    name: string;
    value: number;
    context?: Record<string, any>;
    userId?: string;
  }): void {
    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      timestamp: new Date(),
      metricType: 'CUSTOM',
      value: params.value,
      rating: 'good', // Custom metrics don't have standard ratings
      context: { name: params.name, ...params.context },
      userId: params.userId,
      sessionId: this.sessionId,
      url: window.location.href
    };

    this.metrics.push(metric);

    logger.info(`📈 Custom metric [${params.name}]: ${params.value}`);
  }

  /**
   * Monitor database query performance
   */
  recordDatabaseQuery(params: {
    collection: string;
    operation: DatabaseQueryMetric['operation'];
    duration: number;
    resultCount?: number;
    filters?: string[];
  }): void {
    const isSlowQuery = params.duration > this.budgets.dbQuery;
    
    const queryMetric: DatabaseQueryMetric = {
      queryId: this.generateQueryId(),
      collection: params.collection,
      operation: params.operation,
      duration: params.duration,
      resultCount: params.resultCount,
      filters: params.filters,
      isSlowQuery,
      timestamp: new Date()
    };

    this.queryMetrics.push(queryMetric);

    if (isSlowQuery) {
      logger.warn(`🐌 Slow query detected: ${params.collection}.${params.operation} took ${params.duration}ms`);
      this.alertSlowQuery(queryMetric);
    }
  }

  /**
   * Monitor resource loading performance
   */
  private startResourceMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor resource loading
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      resources.forEach(resource => {
        const resourceTiming: ResourceTiming = {
          name: resource.name,
          duration: resource.responseEnd - resource.requestStart,
          size: resource.transferSize || 0,
          type: this.getResourceType(resource.name),
          cached: resource.transferSize === 0 && resource.decodedBodySize > 0
        };

        this.resourceTimings.push(resourceTiming);
      });

      this.analyzeResourcePerformance();
    });
  }

  /**
   * Monitor memory usage
   */
  private startMemoryMonitoring(): void {
    if (typeof window === 'undefined' || !(performance as any).memory) return;

    setInterval(() => {
      const memory = (performance as any).memory;
      
      this.recordCustomMetric({
        name: 'memory_usage',
        value: memory.usedJSHeapSize,
        context: {
          totalHeapSize: memory.totalJSHeapSize,
          heapLimit: memory.jsHeapSizeLimit,
          usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        }
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Analyze resource loading performance
   */
  private analyzeResourcePerformance(): void {
    const largeResources = this.resourceTimings.filter(r => r.size > 500000); // > 500KB
    const slowResources = this.resourceTimings.filter(r => r.duration > 3000); // > 3s
    const uncachedResources = this.resourceTimings.filter(r => !r.cached);

    if (largeResources.length > 0) {
      logger.warn('🚨 Large resources detected:', largeResources.map(r => ({
        name: r.name.split('/').pop(),
        size: `${(r.size / 1024).toFixed(1)}KB`
      })));
    }

    if (slowResources.length > 0) {
      logger.warn('🐌 Slow resources detected:', slowResources.map(r => ({
        name: r.name.split('/').pop(),
        duration: `${r.duration.toFixed(0)}ms`
      })));
    }

    logger.info(`📊 Resource analysis: ${this.resourceTimings.length} resources, ${uncachedResources.length} uncached`);
  }

  /**
   * Get performance rating based on thresholds
   */
  private getRating(metricType: PerformanceMetric['metricType'], value: number): PerformanceMetric['rating'] {
    const thresholds = {
      'FCP': { good: 1800, poor: 3000 },
      'LCP': { good: 2500, poor: 4000 },
      'FID': { good: 100, poor: 300 },
      'CLS': { good: 0.1, poor: 0.25 },
      'TTFB': { good: 800, poor: 1800 },
      'TTI': { good: 3800, poor: 7300 }
    };

    const threshold = thresholds[metricType];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Alert on performance issues
   */
  private alertPerformanceIssue(metric: PerformanceMetric): void {
    logger.warn(`🚨 Performance issue: ${metric.metricType} = ${metric.value} (${metric.rating})`);
    
    // In production, this would send to monitoring service
    if (typeof window !== 'undefined' && (window as any).performanceAlert) {
      (window as any).performanceAlert(metric);
    }
  }

  /**
   * Alert on slow database queries
   */
  private alertSlowQuery(query: DatabaseQueryMetric): void {
    logger.warn('🗄️ Slow database query:', {
      collection: query.collection,
      operation: query.operation,
      duration: `${query.duration}ms`,
      filters: query.filters
    });

    // In production, this would send to monitoring service
    if (typeof window !== 'undefined' && (window as any).slowQueryAlert) {
      (window as any).slowQueryAlert(query);
    }
  }

  /**
   * Start automatic performance reporting
   */
  private startPerformanceReporting(): void {
    // Report metrics every 60 seconds
    setInterval(() => {
      this.generatePerformanceReport();
    }, 60000);

    // Report on page visibility change
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.generatePerformanceReport();
        }
      });
    }
  }

  /**
   * Generate comprehensive performance report
   */
  generatePerformanceReport(): {
    metrics: PerformanceMetric[];
    resourceTimings: ResourceTiming[];
    queryMetrics: DatabaseQueryMetric[];
    budgets: PerformanceBudget[];
    summary: {
      totalMetrics: number;
      poorMetrics: number;
      slowQueries: number;
      avgResourceSize: number;
      avgQueryTime: number;
    };
  } {
    const budgets = this.calculateBudgetStatus();
    const summary = this.generateSummary();

    const report = {
      metrics: this.metrics,
      resourceTimings: this.resourceTimings,
      queryMetrics: this.queryMetrics,
      budgets,
      summary
    };

    logger.info('📊 Performance Report Generated:', summary);
    
    return report;
  }

  /**
   * Calculate performance budget status
   */
  private calculateBudgetStatus(): PerformanceBudget[] {
    const budgets: PerformanceBudget[] = [];

    // Check Core Web Vitals against budgets
    const vitals = ['FCP', 'LCP', 'FID', 'CLS', 'TTFB', 'TTI'] as const;
    
    vitals.forEach(vital => {
      const metrics = this.metrics.filter(m => m.metricType === vital);
      if (metrics.length === 0) return;

      const avgValue = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
      const budget = this.budgets[vital];
      const exceeded = avgValue > budget;

      budgets.push({
        metricType: vital,
        budget,
        current: avgValue,
        exceeded,
        severity: exceeded ? (avgValue > budget * 1.5 ? 'critical' : 'warning') : 'warning'
      });
    });

    return budgets;
  }

  /**
   * Generate performance summary
   */
  private generateSummary() {
    const totalMetrics = this.metrics.length;
    const poorMetrics = this.metrics.filter(m => m.rating === 'poor').length;
    const slowQueries = this.queryMetrics.filter(q => q.isSlowQuery).length;
    
    const avgResourceSize = this.resourceTimings.length > 0 
      ? this.resourceTimings.reduce((sum, r) => sum + r.size, 0) / this.resourceTimings.length
      : 0;
      
    const avgQueryTime = this.queryMetrics.length > 0
      ? this.queryMetrics.reduce((sum, q) => sum + q.duration, 0) / this.queryMetrics.length
      : 0;

    return {
      totalMetrics,
      poorMetrics,
      slowQueries,
      avgResourceSize,
      avgQueryTime
    };
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): ResourceTiming['type'] {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) return 'image';
    if (url.includes('/v1/') || url.includes('api')) return 'fetch';
    return 'other';
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique metric ID
   */
  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique query ID
   */
  private generateQueryId(): string {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get database query metrics
   */
  getQueryMetrics(): DatabaseQueryMetric[] {
    return [...this.queryMetrics];
  }

  /**
   * Clear metrics (for memory management)
   */
  clearMetrics(): void {
    this.metrics = [];
    this.resourceTimings = [];
    this.queryMetrics = [];
    logger.info('🧹 Performance metrics cleared');
  }

  /**
   * Cleanup monitoring
   */
  destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    if (this.vitalsObserver) {
      this.vitalsObserver.disconnect();
    }
    this._isMonitoring = false;
    logger.info('🧹 Performance monitoring stopped');
  }
}

// Export singleton instance
export const enterprisePerformanceService = new EnterprisePerformanceService();

// Export React hook for components
export const usePerformanceMetrics = () => {
  return {
    recordCustomMetric: enterprisePerformanceService.recordCustomMetric.bind(enterprisePerformanceService),
    recordDatabaseQuery: enterprisePerformanceService.recordDatabaseQuery.bind(enterprisePerformanceService),
    generateReport: enterprisePerformanceService.generatePerformanceReport.bind(enterprisePerformanceService),
    getMetrics: enterprisePerformanceService.getMetrics.bind(enterprisePerformanceService),
    getQueryMetrics: enterprisePerformanceService.getQueryMetrics.bind(enterprisePerformanceService)
  };
};

// Global performance tracking helpers
export const trackCustomMetric = (name: string, value: number, context?: Record<string, any>) => {
  enterprisePerformanceService.recordCustomMetric({ name, value, context });
};

export const trackDatabaseQuery = (
  collection: string, 
  operation: DatabaseQueryMetric['operation'], 
  duration: number,
  resultCount?: number,
  filters?: string[]
) => {
  enterprisePerformanceService.recordDatabaseQuery({
    collection,
    operation,
    duration,
    resultCount,
    filters
  });
};

export default enterprisePerformanceService;