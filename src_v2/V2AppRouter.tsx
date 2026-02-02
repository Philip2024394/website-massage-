/**
 * ============================================================================
 * V2 APP ROUTER - DEMONSTRATION ENTRY POINT
 * ============================================================================
 * 
 * This file demonstrates how the new /src_v2 architecture works with:
 * - Shell-controlled routing
 * - Feature-isolated components
 * - Feature flag system
 * - Legacy compatibility
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { AppShell, ShellErrorBoundary } from './shell/AppShell';
import { routes, getRouteConfig, routeUtils, FEATURE_FLAGS } from './shell/routes';
import { TherapistDashboardView, FeatureFlagDemo, featureUtils } from './features/therapist-dashboard';

interface RouterState {
  currentPath: string;
  featureFlags: Record<string, boolean>;
  loading: boolean;
}

export const V2AppRouter: React.FC = () => {
  const [state, setState] = useState<RouterState>({
    currentPath: window.location.pathname || '/therapist',
    featureFlags: {},
    loading: true
  });

  // Initialize feature flags and routing
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load feature flags
        const flags = featureUtils.getAllFlags();
        
        // Set initial route (default to therapist dashboard for demo)
        const initialPath = state.currentPath === '/' ? '/therapist' : state.currentPath;
        
        setState(prev => ({
          ...prev,
          currentPath: initialPath,
          featureFlags: flags,
          loading: false
        }));
        
        console.log('🚀 V2 App Initialized:', {
          path: initialPath,
          flags,
          environment: process.env.NODE_ENV
        });
        
      } catch (error) {
        console.error('❌ V2 App Initialization Failed:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeApp();
  }, []);

  const navigateTo = (path: string) => {
    setState(prev => ({ ...prev, currentPath: path }));
    window.history.pushState({}, '', path);
    console.log('🛤️ Navigation:', path);
  };

  const handleFeatureFlagChange = (flag: string, enabled: boolean) => {
    setState(prev => ({
      ...prev,
      featureFlags: {
        ...prev.featureFlags,
        [flag]: enabled
      }
    }));
    
    console.log('🎛️ Feature Flag Changed:', flag, enabled);
    
    // Force re-render to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const renderRoute = () => {
    const { currentPath, featureFlags } = state;
    const routeConfig = getRouteConfig(currentPath);
    
    if (!routeConfig) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              404 - Route Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The route "{currentPath}" doesn't exist in the V2 architecture.
            </p>
            <button
              onClick={() => navigateTo('/therapist')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Therapist Dashboard
            </button>
          </div>
        </div>
      );
    }

    // Validate route access
    if (!routeUtils.validateRoute(routeConfig)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this route.
            </p>
            <button
              onClick={() => navigateTo('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    // Render the route component
    const RouteComponent = routeConfig.component;
    return <RouteComponent />;
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading V2 Architecture...</p>
        </div>
      </div>
    );
  }

  return (
    <ShellErrorBoundary>
      <div className="v2-app">
        {/* Development Navigation */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-0 left-0 w-full bg-black text-white text-xs p-2 z-50 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="font-bold">V2 DEMO:</span>
              <button
                onClick={() => navigateTo('/therapist')}
                className={`px-2 py-1 rounded ${
                  state.currentPath.includes('therapist') 
                    ? 'bg-blue-600' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Therapist Dashboard
              </button>
              <button
                onClick={() => navigateTo('/feature-flags')}
                className={`px-2 py-1 rounded ${
                  state.currentPath.includes('feature-flags') 
                    ? 'bg-blue-600' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Feature Flags
              </button>
              <button
                onClick={() => navigateTo('/core-demo')}
                className={`px-2 py-1 rounded ${
                  state.currentPath.includes('core-demo') 
                    ? 'bg-blue-600' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Core Demo
              </button>
            </div>
            <div className="text-right">
              <span>Current: {state.currentPath}</span>
              <span className="ml-4">
                V2 Dashboard: {state.featureFlags.USE_V2_THERAPIST_DASHBOARD ? '✅' : '❌'}
              </span>
            </div>
          </div>
        )}

        {/* Main App Shell */}
        <div className={process.env.NODE_ENV === 'development' ? 'pt-8' : ''}>
          <AppShell 
            layout={getRouteConfig(state.currentPath)?.layout || 'default'}
          >
            {/* Special route for feature flag demo */}
            {state.currentPath === '/feature-flags' ? (
              <div className="max-w-4xl mx-auto p-6">
                <div className="mb-6">
                  <button
                    onClick={() => navigateTo('/therapist')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    ← Back to Therapist Dashboard
                  </button>
                </div>
                <FeatureFlagDemo
                  currentFeatureFlags={state.featureFlags}
                  onFlagChange={handleFeatureFlagChange}
                />
              </div>
            ) : (
              renderRoute()
            )}
          </AppShell>
        </div>
      </div>
    </ShellErrorBoundary>
  );
};

export default V2AppRouter;