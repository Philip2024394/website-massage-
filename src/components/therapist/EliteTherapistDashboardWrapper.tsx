// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { EliteStabilityProvider } from './EliteStabilityProvider';
import { useStability } from './EliteStabilityProvider';
import { Shield, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

// ============================================================================
// 🏆 ELITE THERAPIST DASHBOARD WRAPPER
// ============================================================================
// Purpose: Enhanced wrapper with stability monitoring and error recovery
// Features: Real-time stability metrics, automatic error recovery, performance optimization
// Standards: Facebook/Airbnb-level reliability and user experience
// ============================================================================

interface EliteTherapistDashboardWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showMetrics?: boolean;
}

const StabilityMetricsDisplay: React.FC<{ show: boolean }> = ({ show }) => {
  const { metrics, isStable, optimizePerformance } = useStability();
  const [isVisible, setIsVisible] = useState(false);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`p-2 rounded-full shadow-lg transition-all duration-200 ${
          isStable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}
        title={`Dashboard Status: ${isStable ? 'Stable' : 'Issues Detected'}`}
      >
        {isStable ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[280px] elite-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Elite Stability Metrics</h4>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3 text-sm">
            {/* Stability Status */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${isStable ? 'text-green-600' : 'text-red-600'}`}>
                {isStable ? 'Stable' : 'Issues'}
              </span>
            </div>

            {/* Layout Shifts (CLS) */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Layout Shifts:</span>
              <span className={`font-medium ${metrics.layoutShifts > 0.1 ? 'text-red-600' : 'text-green-600'}`}>
                {metrics.layoutShifts.toFixed(3)}
              </span>
            </div>

            {/* Error Count */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Errors:</span>
              <span className={`font-medium ${metrics.errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {metrics.errorCount}
              </span>
            </div>

            {/* Performance Score */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Performance:</span>
              <span className={`font-medium ${metrics.performanceScore < 0.8 ? 'text-yellow-600' : 'text-green-600'}`}>
                {(metrics.performanceScore * 100).toFixed(0)}%
              </span>
            </div>

            {/* Memory Usage */}
            {metrics.memoryUsage > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Memory:</span>
                <span className={`font-medium ${metrics.memoryUsage > 0.8 ? 'text-red-600' : 'text-green-600'}`}>
                  {(metrics.memoryUsage * 100).toFixed(0)}%
                </span>
              </div>
            )}

            {/* Optimize Button */}
            <button
              onClick={optimizePerformance}
              className="w-full mt-3 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Optimize Performance
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const EliteLoadingFallback: React.FC = () => (
  <div className="elite-loading-container">
    <div className="text-center">
      <div className="elite-skeleton w-16 h-16 rounded-full mx-auto mb-4"></div>
      <div className="elite-skeleton w-32 h-4 mx-auto mb-2"></div>
      <div className="elite-skeleton w-24 h-3 mx-auto"></div>
    </div>
  </div>
);

const EliteErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [errorCount, setErrorCount] = useState(0);

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
          setError(new Error(event.error.message));
          setErrorCount(prev => prev + 1);
          
          // Only show error boundary after multiple critical errors
          if (errorCount >= 1) {
            setHasError(true);
          }
        }
      }
    };

    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      // Filter promise rejections for navigation/fetch issues
      if (event.reason && typeof event.reason === 'object' && event.reason.message) {
        const errorMessage = event.reason.message.toLowerCase();
        const isCriticalError = !errorMessage.includes('navigation') &&
                               !errorMessage.includes('fetch') &&
                               !errorMessage.includes('loading chunk');
        
        if (isCriticalError) {
          setError(new Error(event.reason.message));
          setErrorCount(prev => prev + 1);
          
          if (errorCount >= 1) {
            setHasError(true);
          }
        }
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, [errorCount]);

  const handleRecover = useCallback(() => {
    setHasError(false);
    setError(null);
    setErrorCount(0);
    // Try gentle recovery first
    setTimeout(() => {
      // Only force refresh if error persists
      if (hasError) {
        window.location.reload();
      }
    }, 3000);
  }, [hasError]);

  if (hasError) {
    return (
      <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Elite Dashboard Error
          </h2>
          
          <p className="text-gray-600 mb-4">
            An unexpected error occurred in the dashboard. Our elite error recovery system will restore functionality.
          </p>
          
          {error && (
            <details className="mb-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 mb-2">Error Details</summary>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {error.message}
              </pre>
            </details>
          )}
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRecover}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Recover Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const EliteTherapistDashboardWrapper: React.FC<EliteTherapistDashboardWrapperProps> = ({
  children,
  title = 'Therapist Dashboard',
  subtitle = 'Elite Professional Interface',
  showMetrics = process.env.NODE_ENV === 'development'
}) => {
  const handleCriticalError = useCallback((error: Error) => {
    console.error('🚨 Elite Dashboard Critical Error:', error);
    
    // Could integrate with error reporting service here
    if (typeof window !== 'undefined' && 'gtag' in window && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }, []);

  return (
    <EliteStabilityProvider
      onCriticalError={handleCriticalError}
      maxErrors={3}
      performanceThreshold={0.75}
    >
      <EliteErrorBoundary>
        {/* SEO and Accessibility Headers */}
        <div className="sr-only">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        
        {/* Main Content with Suspense */}
        <Suspense fallback={<EliteLoadingFallback />}>
          {children}
        </Suspense>
        
        {/* Stability Metrics (Development Only) */}
        <StabilityMetricsDisplay show={showMetrics} />
      </EliteErrorBoundary>
    </EliteStabilityProvider>
  );
};

export default EliteTherapistDashboardWrapper;