import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';

// ============================================================================
// 🏆 ELITE STABILITY PROVIDER
// ============================================================================
// Purpose: Centralized stability management for therapist dashboard
// Features: Layout shift prevention, error recovery, performance monitoring
// Standards: Facebook/Airbnb level stability requirements
// ============================================================================

interface StabilityMetrics {
  layoutShifts: number;
  errorCount: number;
  performanceScore: number;
  memoryUsage: number;
  lastError: Error | null;
}

interface StabilityContextType {
  metrics: StabilityMetrics;
  isStable: boolean;
  reportLayoutShift: (shift: number) => void;
  reportError: (error: Error) => void;
  recoverFromError: () => void;
  optimizePerformance: () => void;
}

const StabilityContext = createContext<StabilityContextType | null>(null);

interface EliteStabilityProviderProps {
  children: React.ReactNode;
  onCriticalError?: (error: Error) => void;
  maxErrors?: number;
  performanceThreshold?: number;
}

export const EliteStabilityProvider: React.FC<EliteStabilityProviderProps> = ({
  children,
  onCriticalError,
  maxErrors = 5,
  performanceThreshold = 0.8
}) => {
  const [metrics, setMetrics] = useState<StabilityMetrics>({
    layoutShifts: 0,
    errorCount: 0,
    performanceScore: 1,
    memoryUsage: 0,
    lastError: null
  });

  const [isStable, setIsStable] = useState(true);

  // ============================================================================
  // LAYOUT SHIFT MONITORING
  // ============================================================================
  const reportLayoutShift = useCallback((shift: number) => {
    setMetrics(prev => {
      const newShifts = prev.layoutShifts + shift;
      
      // Cumulative Layout Shift (CLS) threshold: 0.1 (Google Core Web Vitals)
      if (newShifts > 0.1) {
        console.warn('🚨 Elite Stability: High CLS detected:', newShifts);
        setIsStable(false);
      }
      
      return {
        ...prev,
        layoutShifts: newShifts
      };
    });
  }, []);

  // ============================================================================
  // ERROR MONITORING & RECOVERY - REFINED FOR NAVIGATION
  // ============================================================================
  const reportError = useCallback((error: Error) => {
    // Filter out navigation and normal operation errors
    const errorMessage = error.message.toLowerCase();
    const isNavigationError = errorMessage.includes('navigation') || 
                             errorMessage.includes('router') ||
                             errorMessage.includes('loading chunk') ||
                             errorMessage.includes('dynamically imported') ||
                             errorMessage.includes('fetch');
    
    if (isNavigationError) {
      console.log('🔄 Elite Stability: Navigation event (ignored):', error.message);
      return; // Don't count navigation errors
    }
    
    console.error('🛡️ Elite Stability: Error reported:', error);
    
    setMetrics(prev => {
      const newErrorCount = prev.errorCount + 1;
      
      // Critical error threshold reached
      if (newErrorCount >= maxErrors) {
        console.error('🚨 Elite Stability: Critical error threshold reached');
        setIsStable(false);
        onCriticalError?.(error);
      }
      
      return {
        ...prev,
        errorCount: newErrorCount,
        lastError: error
      };
    });
  }, [maxErrors, onCriticalError]);

  const recoverFromError = useCallback(() => {
    console.log('🔄 Elite Stability: Initiating error recovery');
    
    // Reset error state
    setMetrics(prev => ({
      ...prev,
      errorCount: 0,
      lastError: null
    }));
    
    // Reset stability flag after brief delay
    setTimeout(() => {
      setIsStable(true);
    }, 1000);
  }, []);

  // ============================================================================
  // PERFORMANCE MONITORING
  // ============================================================================
  const optimizePerformance = useCallback(() => {
    // Force garbage collection if available
    if ('gc' in window && typeof window.gc === 'function') {
      window.gc();
    }
    
    // Clear any stale timers - safe approach for browser environment
    try {
      const highestTimeoutId = window.setTimeout(() => {}, 0);
      for (let i = 1; i < (highestTimeoutId as any); i++) {
        window.clearTimeout(i);
      }
      window.clearTimeout(highestTimeoutId);
    } catch (e) {
      // Safe fallback if timer clearing fails
      console.warn('Elite Stability: Timer cleanup not available');
    }
    
    // Update performance metrics
    if ('performance' in window && 'memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize / memory.totalJSHeapSize,
        performanceScore: memory.usedJSHeapSize < memory.totalJSHeapSize * 0.7 ? 1 : 0.5
      }));
    }
  }, []);

  // ============================================================================
  // LAYOUT SHIFT OBSERVER
  // ============================================================================
  useEffect(() => {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          reportLayoutShift((entry as any).value);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('Elite Stability: PerformanceObserver not fully supported');
    }

    return () => observer.disconnect();
  }, [reportLayoutShift]);

  // ============================================================================
  // PERFORMANCE MONITORING
  // ============================================================================
  useEffect(() => {
    const interval = setInterval(() => {
      optimizePerformance();
      
      // Auto-recovery if performance is consistently good
      if (metrics.performanceScore >= performanceThreshold && 
          metrics.errorCount < maxErrors / 2) {
        setIsStable(true);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [metrics.performanceScore, metrics.errorCount, performanceThreshold, maxErrors, optimizePerformance]);

  const contextValue: StabilityContextType = {
    metrics,
    isStable,
    reportLayoutShift,
    reportError,
    recoverFromError,
    optimizePerformance
  };

  return (
    <StabilityContext.Provider value={contextValue}>
      {children}
    </StabilityContext.Provider>
  );
};

export const useStability = (): StabilityContextType => {
  const context = useContext(StabilityContext);
  if (!context) {
    throw new Error('useStability must be used within EliteStabilityProvider');
  }
  return context;
};

// ============================================================================
// ELITE STABILITY HOC
// ============================================================================
export function withEliteStability<T extends React.ComponentPropsWithRef<any>>(
  Component: React.ComponentType<T>
) {
  const WithEliteStabilityComponent = React.forwardRef<any, T>((props, ref) => {
    const { reportError, isStable } = useStability();
    const [hasLocalError, setHasLocalError] = useState(false);
    const [errorCount, setErrorCount] = useState(0);

    // Component-level error boundary - only for critical errors
    useEffect(() => {
      const handleError = (event: ErrorEvent) => {
        // Filter out navigation and routine errors
        if (event.error && event.error.message) {
          const errorMessage = event.error.message.toLowerCase();
          const isCriticalError = !errorMessage.includes('navigation') &&
                                 !errorMessage.includes('router') &&
                                 !errorMessage.includes('loading chunk') &&
                                 !errorMessage.includes('fetch');
          
          if (isCriticalError) {
            setErrorCount(prev => prev + 1);
            reportError(new Error(event.error.message));
            
            // Only show error UI after multiple critical errors
            if (errorCount >= 2) {
              setHasLocalError(true);
            }
          }
        }
      };

      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }, [reportError, errorCount]);

    // Only show fallback for critical stability issues, not navigation
    if (!isStable && hasLocalError) {
      return (
        <div className="elite-stability-fallback p-4 text-center">
          <div className="inline-block p-3 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-orange-800 font-medium">Component temporarily unavailable</p>
            <button
              onClick={() => {
                setHasLocalError(false);
                setErrorCount(0);
                // Try local recovery first
                setTimeout(() => {
                  if (hasLocalError) {
                    window.location.reload();
                  }
                }, 2000);
              }}
              className="mt-2 px-4 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props as any} ref={ref} />;
  });

  WithEliteStabilityComponent.displayName = `withEliteStability(${Component.displayName || Component.name || 'Component'})`;
  
  return WithEliteStabilityComponent as React.ComponentType<T>;
}