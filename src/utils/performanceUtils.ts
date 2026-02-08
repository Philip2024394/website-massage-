/**
 * 🚀 PERFORMANCE UTILITIES
 * ============================================================================
 * Indonesia-optimized performance utilities for 3G/weak 4G connections
 * 
 * Features:
 * - Network detection
 * - Resource prioritization
 * - Loading state management
 * - Performance monitoring
 */

/**
 * 🌐 NETWORK QUALITY DETECTION
 * Detects connection speed to adjust loading strategies
 */
export type ConnectionSpeed = 'slow-2g' | '2g' | '3g' | '4g' | 'fast' | 'unknown';

export const getConnectionSpeed = (): ConnectionSpeed => {
  // Check if Network Information API is available
  const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;

  if (!connection) {
    return 'unknown';
  }

  const effectiveType = connection.effectiveType;
  
  // Map effective types to our categories
  if (effectiveType === 'slow-2g') return 'slow-2g';
  if (effectiveType === '2g') return '2g';
  if (effectiveType === '3g') return '3g';
  if (effectiveType === '4g') {
    // Check if it's actually fast 4G
    const downlink = connection.downlink; // Mbps
    return downlink && downlink > 5 ? 'fast' : '4g';
  }

  return 'unknown';
};

/**
 * 🎯 RESOURCE PRIORITY
 * Determines loading priority based on network speed
 */
export interface LoadingStrategy {
  imageQuality: 'low' | 'medium' | 'high';
  preloadDistance: string; // CSS value like "50px", "200px"
  deferNonCritical: boolean;
  enableAnimations: boolean;
  maxConcurrentImages: number;
}

export const getLoadingStrategy = (speed?: ConnectionSpeed): LoadingStrategy => {
  const connectionSpeed = speed || getConnectionSpeed();

  switch (connectionSpeed) {
    case 'slow-2g':
    case '2g':
      return {
        imageQuality: 'low',
        preloadDistance: '10px',
        deferNonCritical: true,
        enableAnimations: false,
        maxConcurrentImages: 2,
      };

    case '3g':
      return {
        imageQuality: 'medium',
        preloadDistance: '50px',
        deferNonCritical: true,
        enableAnimations: false,
        maxConcurrentImages: 4,
      };

    case '4g':
      return {
        imageQuality: 'medium',
        preloadDistance: '100px',
        deferNonCritical: false,
        enableAnimations: true,
        maxConcurrentImages: 6,
      };

    case 'fast':
      return {
        imageQuality: 'high',
        preloadDistance: '200px',
        deferNonCritical: false,
        enableAnimations: true,
        maxConcurrentImages: 10,
      };

    default:
      // Conservative defaults for unknown connections
      return {
        imageQuality: 'medium',
        preloadDistance: '50px',
        deferNonCritical: true,
        enableAnimations: false,
        maxConcurrentImages: 4,
      };
  }
};

/**
 * 📊 PERFORMANCE MONITORING
 * Tracks key performance metrics
 */
export interface PerformanceMetrics {
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  tti: number; // Time to Interactive
}

export const measurePerformance = (): Partial<PerformanceMetrics> => {
  if (typeof window === 'undefined' || !window.performance) {
    return {};
  }

  const metrics: Partial<PerformanceMetrics> = {};

  // Time to First Byte
  const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigationTiming) {
    metrics.ttfb = navigationTiming.responseStart - navigationTiming.requestStart;
  }

  // First Contentful Paint
  const paintEntries = performance.getEntriesByType('paint');
  const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
  if (fcpEntry) {
    metrics.fcp = fcpEntry.startTime;
  }

  // Largest Contentful Paint (requires observer)
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as any;
    metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
  });
  
  try {
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // LCP not supported
  }

  return metrics;
};

/**
 * 🎨 CRITICAL CSS DETECTION
 * Identifies if critical CSS has loaded
 */
export const isCriticalCSSLoaded = (): boolean => {
  if (typeof document === 'undefined') return false;
  
  // Check if critical CSS stylesheet is loaded
  const criticalStyle = document.querySelector('style[data-critical]');
  return !!criticalStyle;
};

/**
 * ⏱️ DEFER EXECUTION
 * Defers execution until browser is idle
 */
export const deferExecution = (callback: () => void, timeout = 2000): void => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(callback, timeout);
  }
};

/**
 * 🔄 RETRY WITH BACKOFF
 * Retries failed operations with exponential backoff
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s, etc.
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
};

/**
 * 🖼️ IMAGE OPTIMIZATION HELPERS
 */

/**
 * Gets optimal image URL based on device and network
 */
export const getOptimalImageUrl = (
  baseUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): string => {
  // Check if using ImageKit or similar CDN
  if (baseUrl.includes('imagekit.io')) {
    const params: string[] = [];
    
    const strategy = getLoadingStrategy();
    
    // Adjust quality based on network
    let quality = options.quality;
    if (!quality) {
      switch (strategy.imageQuality) {
        case 'low': quality = 40; break;
        case 'medium': quality = 60; break;
        case 'high': quality = 80; break;
      }
    }
    
    if (options.width) params.push(`w-${options.width}`);
    if (options.height) params.push(`h-${options.height}`);
    if (quality) params.push(`q-${quality}`);
    if (options.format) params.push(`f-${options.format}`);
    
    // Add ImageKit transformations
    if (params.length > 0) {
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}tr=${params.join(',')}`;
    }
  }
  
  return baseUrl;
};

/**
 * Preloads critical images
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * 📱 DEVICE DETECTION
 */
export const isMobile = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isLowEndDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  // Check if device has limited resources
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) return true; // Less than 4GB RAM
  
  const cores = navigator.hardwareConcurrency;
  if (cores && cores < 4) return true; // Less than 4 cores
  
  // Check if running on low-end Android
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('android')) {
    // Check for low-end indicators
    if (userAgent.includes('android 4') || 
        userAgent.includes('android 5') || 
        userAgent.includes('android 6')) {
      return true;
    }
  }
  
  return false;
};

/**
 * 🎯 ADAPTIVE LOADING
 */
export interface AdaptiveLoadingConfig {
  shouldPreload: boolean;
  shouldDeferImages: boolean;
  shouldReduceAnimations: boolean;
  shouldUseWebP: boolean;
  imageQuality: number;
}

export const getAdaptiveLoadingConfig = (): AdaptiveLoadingConfig => {
  const speed = getConnectionSpeed();
  const isSlowConnection = speed === 'slow-2g' || speed === '2g' || speed === '3g';
  const isLowEnd = isLowEndDevice();

  return {
    shouldPreload: !isSlowConnection && !isLowEnd,
    shouldDeferImages: isSlowConnection || isLowEnd,
    shouldReduceAnimations: isSlowConnection || isLowEnd,
    shouldUseWebP: !isLowEnd, // WebP decoding can be slow on low-end devices
    imageQuality: isSlowConnection ? 40 : isLowEnd ? 60 : 80,
  };
};

/**
 * 📦 BUNDLE SIZE HELPER
 * Logs bundle sizes in development
 */
export const logBundleSize = (componentName: string): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  deferExecution(() => {
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src) {
        // This is approximate - actual size would need network timing
        console.log(`📦 [Bundle] ${src}`);
      }
    });
    
    console.log(`📦 [Bundle] Total scripts: ${scripts.length}`);
  });
};

/**
 * 🔍 PERFORMANCE OBSERVER
 * Monitors and logs performance issues
 */
export const initPerformanceMonitoring = (): void => {
  if (typeof window === 'undefined' || !window.PerformanceObserver) return;

  // Monitor long tasks (tasks > 50ms)
  try {
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn(`⚠️ [Performance] Long task detected: ${entry.duration}ms`);
        }
      }
    });
    longTaskObserver.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    // Long task monitoring not supported
  }

  // Monitor layout shifts
  try {
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as any;
        if (!layoutShift.hadRecentInput && layoutShift.value > 0.1) {
          console.warn(`⚠️ [Performance] Layout shift detected: ${layoutShift.value}`);
        }
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    // Layout shift monitoring not supported
  }
};

/**
 * 💾 SAVE DATA MODE
 * Checks if user has enabled data saver
 */
export const isDataSaverEnabled = (): boolean => {
  const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;
  
  return connection?.saveData === true;
};

export default {
  getConnectionSpeed,
  getLoadingStrategy,
  measurePerformance,
  isCriticalCSSLoaded,
  deferExecution,
  retryWithBackoff,
  getOptimalImageUrl,
  preloadImage,
  isMobile,
  isLowEndDevice,
  getAdaptiveLoadingConfig,
  logBundleSize,
  initPerformanceMonitoring,
  isDataSaverEnabled,
};
