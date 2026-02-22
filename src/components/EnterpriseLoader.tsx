import React, { useEffect, useState } from 'react';
import { logger } from '../utils/logger';
import { useLoading } from '../context/LoadingContext';
import { SkeletonLoader, PageSkeleton } from './ui/SkeletonLoader';

interface EnterpriseLoaderProps {
  variant?: 'global' | 'page' | 'component' | 'inline';
  fallback?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  componentId?: string;
  showProgress?: boolean;
  pageVariant?: 'therapist-dashboard' | 'home' | 'generic';
}

/**
 * Enterprise-grade loader component following Amazon/Meta UX standards
 * 
 * Key Features:
 * - No layout shifts (reserves space)
 * - Progressive loading states
 * - Accessibility compliant
 * - Performance optimized
 * - Graceful degradation
 */
export const EnterpriseLoader: React.FC<EnterpriseLoaderProps> = ({
  variant = 'component',
  fallback,
  className = '',
  children,
  componentId,
  showProgress = false,
  pageVariant = 'generic'
}) => {
  const { loading, progress, canShowContent, isCriticalLoading, getComponentLoading } = useLoading();
  const [hasTimeout, setHasTimeout] = useState(false);
  const [showErrorUI, setShowErrorUI] = useState(false);
  
  // 🔥 P0 FIX: Fail-safe timeout - loader must NEVER be infinite
  useEffect(() => {
    if (variant === 'global' && loading.global) {
      logger.debug('⏱️ [FAIL-SAFE] Starting 8-second timeout for global loader');
      
      const timeoutId = setTimeout(() => {
        logger.error('🚨 [FAIL-SAFE] Global loader timeout after 8 seconds!');
        logger.error('🚨 [FAIL-SAFE] Loading state:', { loading, progress });
        logger.error('🚨 [FAIL-SAFE] This indicates a blocking error during app bootstrap');
        logger.error('🚨 [FAIL-SAFE] Check console for errors above');
        setHasTimeout(true);
        setShowErrorUI(true);
      }, 8000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [variant, loading.global, loading, progress]);

  const shouldShowLoading = () => {
    switch (variant) {
      case 'global':
        return loading.global;
      case 'page':
        return loading.page || isCriticalLoading();
      case 'component':
        return componentId ? getComponentLoading(componentId) : false;
      case 'inline':
        return loading.data;
      default:
        return false;
    }
  };

  const isLoading = shouldShowLoading();
  
  // 🔥 P0 FIX: Show error UI if timeout occurred
  if (showErrorUI && variant === 'global') {
    return (
      <div 
        className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-red-500 px-4"
        role="alert"
        aria-live="assertive"
      >
        <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
          <div className="text-center mb-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">App Loading Failed</h2>
            <p className="text-gray-600 mb-4">
              The app is taking too long to start. This usually means:
            </p>
            <ul className="text-left text-gray-600 space-y-2 mb-6">
              <li>• Network connection issue</li>
              <li>• Server is temporarily unavailable</li>
              <li>• Old cached version conflict</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-amber-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-600 transition"
            >
              🔄 Reload Page
            </button>
            
            <button
              onClick={() => {
                // Clear all storage and reload
                sessionStorage.clear();
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              🧹 Clear Cache & Reload
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            Version: {(window as any).APP_VERSION || 'unknown'}
          </p>
        </div>
      </div>
    );
  }

  // For global loading - show full screen loading with brand
  if (variant === 'global' && isLoading) {
    return (
      <div 
        className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-amber-500"
        role="status"
        aria-live="polite"
        aria-label={progress.message || "Application is loading"}
      >
        {/* Brand Header - Enhanced visibility */}
        <div className="mb-8 text-center" style={{ zIndex: 10, position: "relative" }}>
          <h1 className="text-4xl font-bold mb-2" style={{ color: "#ffffff", textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            IndaStreet
          </h1>
          <p className="text-lg font-medium" style={{ color: "#ffffff", opacity: 1, textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
            Professional Massage Services
          </p>
        </div>
        
        {/* Progress Indicator */}
        {showProgress && (
          <div className="relative w-20 h-20 mb-6">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 36}`}
                strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress.current / 100)}`}
                className="transition-all duration-300 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
        
        {/* Loading Message */}
        <p className="text-white/90 text-base font-medium mb-4">
          {progress.message || 'Loading...'}
        </p>
        
        {/* Loading Dots */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        {/* Stage Indicator */}
        {showProgress && (
          <div className="mt-8 w-64 max-w-full">
            <div className="flex justify-between text-white/70 text-xs mb-2">
              <span className={progress.stage === 'initializing' ? 'text-white' : ''}>
                Initializing
              </span>
              <span className={progress.stage === 'loading' ? 'text-white' : ''}>
                Loading
              </span>
              <span className={progress.stage === 'authenticating' ? 'text-white' : ''}>
                Authenticating
              </span>
              <span className={progress.stage === 'finalizing' ? 'text-white' : ''}>
                Ready
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1">
              <div 
                className="h-1 rounded-full bg-white transition-all duration-500"
                style={{ width: `${Math.min(progress.current, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // For page loading - show page skeleton
  if (variant === 'page' && isLoading) {
    return (
      <div 
        className={`${className}`}
        role="status"
        aria-live="polite"
        aria-label="Page content is loading"
      >
        {fallback || <PageSkeleton variant={pageVariant} />}
      </div>
    );
  }

  // For component loading - show skeleton in place
  if (variant === 'component' && isLoading) {
    return (
      <div 
        className={`${className}`}
        role="status"
        aria-live="polite"
        aria-label="Content is loading"
      >
        {fallback || <SkeletonLoader variant="card" />}
      </div>
    );
  }

  // For inline loading - show minimal spinner
  if (variant === 'inline' && isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-500 border-t-transparent"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Show children when not loading
  return <>{children}</>;
};

/**
 * Higher-order component for wrapping components with loading states
 */
export const withEnterpriseLoader = <P extends object>(
  Component: React.ComponentType<P>,
  componentId: string,
  fallback?: React.ReactNode
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <EnterpriseLoader 
      variant="component" 
      componentId={componentId}
      fallback={fallback}
    >
      <Component {...(props as P)} ref={ref} />
    </EnterpriseLoader>
  ));
  
  WrappedComponent.displayName = `withEnterpriseLoader(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
};

/**
 * Loading boundary component for sections of the app
 */
export const LoadingBoundary: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}> = ({ children, fallback, className }) => {
  const { isCriticalLoading } = useLoading();
  
  if (isCriticalLoading()) {
    return (
      <div className={className}>
        {fallback || <SkeletonLoader variant="list" count={3} />}
      </div>
    );
  }
  
  return <>{children}</>;
};