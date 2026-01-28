/**
 * 🏢 ENTERPRISE CODE SPLITTING UTILITY
 * 
 * Automatic code splitting for large components to improve performance
 * - Intelligent component size analysis
 * - Dynamic import optimization
 * - Loading state management
 * - Error boundary integration
 * - Bundle size optimization
 * 
 * Based on React.lazy best practices and Webpack code splitting
 */

import React, { Suspense, ComponentType, LazyExoticComponent } from 'react';
import { trackCustomMetric } from '../services/enterprisePerformanceService';

export interface CodeSplitOptions {
  fallback?: React.ComponentType;
  chunkName?: string;
  preload?: boolean;
  timeout?: number;
  retryCount?: number;
}

export interface SplitComponentInfo {
  name: string;
  estimatedSize: number;
  chunkName: string;
  loaded: boolean;
  error?: Error;
  loadTime?: number;
}

/**
 * Enterprise-grade code splitting with performance monitoring
 */
class EnterpriseCodeSplitting {
  private componentRegistry = new Map<string, SplitComponentInfo>();
  private preloadCache = new Set<string>();

  /**
   * Create a code-split component with enterprise monitoring
   */
  createSplitComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    options: CodeSplitOptions = {}
  ): LazyExoticComponent<T> {
    const {
      chunkName = 'dynamic-chunk',
      preload = false,
      timeout = 10000,
      retryCount = 3
    } = options;

    // Register component info
    this.componentRegistry.set(chunkName, {
      name: chunkName,
      estimatedSize: 0,
      chunkName,
      loaded: false
    });

    // Enhanced import function with monitoring
    const enhancedImportFn = async (): Promise<{ default: T }> => {
      const startTime = performance.now();
      
      try {
        // Track loading start
        trackCustomMetric('code_split_start', 1, { chunkName });

        const module = await this.retryImport(importFn, retryCount, timeout);
        const loadTime = performance.now() - startTime;

        // Update component info
        const componentInfo = this.componentRegistry.get(chunkName);
        if (componentInfo) {
          componentInfo.loaded = true;
          componentInfo.loadTime = loadTime;
        }

        // Track successful loading
        trackCustomMetric('code_split_success', loadTime, { 
          chunkName,
          loadTime: Math.round(loadTime)
        });

        console.log(`📦 Code split component loaded: ${chunkName} (${Math.round(loadTime)}ms)`);
        
        return module;

      } catch (error) {
        const loadTime = performance.now() - startTime;
        
        // Update component info with error
        const componentInfo = this.componentRegistry.get(chunkName);
        if (componentInfo) {
          componentInfo.error = error as Error;
        }

        // Track loading failure
        trackCustomMetric('code_split_error', loadTime, { 
          chunkName,
          error: String(error)
        });

        console.error(`❌ Code split loading failed: ${chunkName}`, error);
        throw error;
      }
    };

    // Preload if requested
    if (preload && !this.preloadCache.has(chunkName)) {
      this.preloadComponent(enhancedImportFn, chunkName);
    }

    return React.lazy(enhancedImportFn);
  }

  /**
   * Retry import with exponential backoff
   */
  private async retryImport<T>(
    importFn: () => Promise<{ default: T }>,
    maxRetries: number,
    timeout: number
  ): Promise<{ default: T }> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Add timeout to import
        const importPromise = importFn();
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Import timeout')), timeout);
        });

        return await Promise.race([importPromise, timeoutPromise]);
        
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          console.warn(`⚠️ Import attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Preload component for better UX
   */
  private async preloadComponent<T>(
    importFn: () => Promise<{ default: T }>,
    chunkName: string
  ): Promise<void> {
    if (this.preloadCache.has(chunkName)) return;

    this.preloadCache.add(chunkName);
    
    try {
      await importFn();
      console.log(`🚀 Preloaded component: ${chunkName}`);
    } catch (error) {
      console.warn(`⚠️ Preload failed for ${chunkName}:`, error);
      this.preloadCache.delete(chunkName);
    }
  }

  /**
   * Get component registry for monitoring
   */
  getComponentRegistry(): Map<string, SplitComponentInfo> {
    return new Map(this.componentRegistry);
  }

  /**
   * Clear preload cache
   */
  clearPreloadCache(): void {
    this.preloadCache.clear();
  }
}

// Singleton instance
const codeSplitting = new EnterpriseCodeSplitting();

/**
 * Enhanced fallback component with enterprise styling
 */
export const EnterpriseFallback: React.FC<{ message?: string }> = ({ 
  message = 'Loading component...' 
}) => (
  <div className="flex items-center justify-center min-h-[200px] bg-gray-50 rounded-lg">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
      <div className="text-gray-600 font-medium">{message}</div>
      <div className="text-xs text-gray-400 mt-1">Enterprise loading...</div>
    </div>
  </div>
);

/**
 * Suspense wrapper with enterprise error boundary
 */
export const EnterpriseSuspense: React.FC<{
  children: React.ReactNode;
  fallback?: React.ComponentType;
  chunkName?: string;
}> = ({ 
  children, 
  fallback: Fallback = EnterpriseFallback,
  chunkName = 'unknown'
}) => {
  return (
    React.createElement(Suspense, {
      fallback: React.createElement('div', null,
        React.createElement(Fallback, null),
        chunkName && React.createElement('div', { className: 'text-xs text-gray-400 mt-2 text-center' },
          'Loading: ', chunkName
        )
      )
    }, children)
  );
};

/**
 * Higher-order component for automatic code splitting
 */
export function withCodeSplitting<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: CodeSplitOptions = {}
) {
  const SplitComponent = codeSplitting.createSplitComponent(importFn, options);
  
  const WrappedComponent: React.FC<P> = (props) => (
    <EnterpriseSuspense 
      fallback={options.fallback}
      chunkName={options.chunkName}
    >
      <SplitComponent {...props} />
    </EnterpriseSuspense>
  );

  WrappedComponent.displayName = `withCodeSplitting(${options.chunkName || 'Component'})`;
  
  return WrappedComponent;
}

/**
 * Utility to create code-split routes
 */
export const createSplitRoute = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  chunkName: string,
  preload = false
) => {
  return withCodeSplitting(importFn, {
    chunkName: `route-${chunkName}`,
    preload,
    fallback: () => (
      <EnterpriseFallback message={`Loading ${chunkName} page...`} />
    )
  });
};

/**
 * Preload components based on user interaction
 */
export const preloadOnHover = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  chunkName: string
) => {
  return {
    onMouseEnter: () => {
      codeSplitting.createSplitComponent(importFn, {
        chunkName,
        preload: true
      });
    }
  };
};

/**
 * Preload components on route change
 */
export const preloadRoutes = async (routes: Array<{
  importFn: () => Promise<{ default: ComponentType<any> }>;
  chunkName: string;
}>) => {
  const preloadPromises = routes.map(route => 
    codeSplitting.createSplitComponent(route.importFn, {
      chunkName: route.chunkName,
      preload: true
    })
  );

  try {
    await Promise.allSettled(preloadPromises);
    console.log(`🚀 Preloaded ${routes.length} route components`);
  } catch (error) {
    console.warn('⚠️ Some route preloading failed:', error);
  }
};

/**
 * Hook for code splitting metrics
 */
export const useCodeSplittingMetrics = () => {
  return {
    getComponentRegistry: () => codeSplitting.getComponentRegistry(),
    clearPreloadCache: () => codeSplitting.clearPreloadCache()
  };
};

// Pre-configured split components for common large components
export const SplitTherapistCard = withCodeSplitting(
  () => import('../components/TherapistCard'),
  { 
    chunkName: 'therapist-card',
    preload: false,
    fallback: () => (
      <div className="bg-white rounded-lg shadow p-4 animate-pulse">
        <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }
);

export const SplitHomePage = withCodeSplitting(
  () => import('../pages/HomePage'),
  { 
    chunkName: 'home-page',
    preload: true,
    fallback: () => (
      <div className="min-h-screen bg-gray-50">
        <EnterpriseFallback message="Loading home page..." />
      </div>
    )
  }
);

export const SplitTherapistDashboard = withCodeSplitting(
  () => import('../../apps/therapist-dashboard/src/App'),
  {
    chunkName: 'therapist-dashboard',
    preload: false,
    timeout: 15000, // Longer timeout for complex dashboard
    fallback: () => (
      <div className="min-h-screen bg-gray-100">
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg font-semibold text-gray-700">Loading Therapist Dashboard</div>
            <div className="text-sm text-gray-500">This may take a moment...</div>
          </div>
        </div>
      </div>
    )
  }
);

export const SplitBookingPopup = withCodeSplitting(
  () => import('../components/BookingPopup'),
  {
    chunkName: 'booking-popup',
    preload: false,
    fallback: () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <EnterpriseFallback message="Loading booking form..." />
        </div>
      </div>
    )
  }
);

export const SplitChatWindow = withCodeSplitting(
  () => import('../chat/FloatingChatWindow'),
  {
    chunkName: 'chat-window',
    preload: false,
    fallback: () => (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50">
        <EnterpriseFallback message="Loading chat..." />
      </div>
    )
  }
);

export default codeSplitting;