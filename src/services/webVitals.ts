/**
 * 📊 WEB VITALS MONITORING
 * 
 * Tracks Core Web Vitals for performance monitoring:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 * 
 * Sends metrics to analytics for monitoring and alerting
 */

import { onCLS, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';
import { logger } from './enterpriseLogger';

interface WebVitalsReport {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

/**
 * Rate Web Vitals metrics based on thresholds
 * https://web.dev/vitals/
 */
function rateMetric(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, { good: number; poor: number }> = {
    LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint
    FID: { good: 100, poor: 300 },        // First Input Delay
    CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
    FCP: { good: 1800, poor: 3000 },      // First Contentful Paint
    TTFB: { good: 800, poor: 1800 },      // Time to First Byte
  };

  const threshold = thresholds[name];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Send metric to analytics endpoint
 */
function sendToAnalytics(metric: WebVitalsReport): void {
  try {
    // Log to enterprise logger
    logger.info(`Web Vital: ${metric.name}`, {
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      navigationType: metric.navigationType
    });

    // Send to analytics endpoint if configured
    const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
    if (analyticsEndpoint && import.meta.env.PROD) {
      fetch(analyticsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'web-vital',
          ...metric,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        }),
        keepalive: true
      }).catch(err => {
        logger.warn('Failed to send Web Vital to analytics', { error: err.message });
      });
    }

    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.value),
        metric_rating: metric.rating,
        non_interaction: true
      });
    }
  } catch (error) {
    logger.warn('Error sending Web Vital to analytics', { error });
  }
}

/**
 * Handle Web Vitals metric
 */
function handleMetric(metric: Metric): void {
  const report: WebVitalsReport = {
    name: metric.name,
    value: metric.value,
    rating: rateMetric(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType
  };

  sendToAnalytics(report);

  // Alert on poor metrics
  if (report.rating === 'poor') {
    logger.warn(`Poor Web Vital detected: ${report.name}`, {
      value: report.value,
      threshold: 'poor',
      url: window.location.href
    });
  }
}

/**
 * Initialize Web Vitals monitoring
 * Call this once on app startup
 */
export function initWebVitals(): void {
  try {
    // Track all Core Web Vitals
    onCLS(handleMetric);
    // Note: FID (First Input Delay) has been deprecated in web-vitals library
    // Use INP (Interaction to Next Paint) instead if needed
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);

    logger.info('Web Vitals monitoring initialized');
  } catch (error) {
    logger.error('Failed to initialize Web Vitals', { error });
  }
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(): {
  navigation: PerformanceNavigationTiming | null;
  memory: any;
  resources: PerformanceResourceTiming[];
} {
  if (typeof window === 'undefined' || !window.performance) {
    return { navigation: null, memory: null, resources: [] };
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const memory = (performance as any).memory;

  return { navigation, memory, resources };
}

/**
 * Log performance marks for custom timing
 */
export function mark(name: string): void {
  try {
    performance.mark(name);
    logger.debug(`Performance mark: ${name}`);
  } catch (error) {
    logger.warn('Failed to create performance mark', { name, error });
  }
}

/**
 * Measure time between two marks
 */
export function measure(name: string, startMark: string, endMark?: string): number | null {
  try {
    if (!endMark) {
      performance.mark(`${startMark}-end`);
      endMark = `${startMark}-end`;
    }

    performance.measure(name, startMark, endMark);
    
    const measures = performance.getEntriesByName(name, 'measure');
    const lastMeasure = measures[measures.length - 1];
    
    if (lastMeasure) {
      logger.info(`Performance measure: ${name}`, { duration: lastMeasure.duration });
      return lastMeasure.duration;
    }
    
    return null;
  } catch (error) {
    logger.warn('Failed to measure performance', { name, error });
    return null;
  }
}

/**
 * Clear all performance marks and measures
 */
export function clearPerformance(): void {
  try {
    performance.clearMarks();
    performance.clearMeasures();
  } catch (error) {
    logger.warn('Failed to clear performance data', { error });
  }
}

// Export for use in components
// Web vitals functions - getFID removed as deprecated
// export { getCLS, getFID, getFCP, getLCP, getTTFB };
