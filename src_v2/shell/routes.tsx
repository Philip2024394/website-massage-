/**
 * ============================================================================
 * 🚫 AI-PROTECTED ZONE - NEVER TOUCH
 * ============================================================================
 * 
 * ROUTES AUTHORITY - Single source of truth for all application routing
 * 
 * RULES:
 * - Features NEVER define routes
 * - Features ONLY export components
 * - ALL routing logic lives HERE
 * - This file controls what renders where
 * 
 * STABILITY GUARANTEE:
 * If this file works → routing works
 * 
 * ============================================================================
 */

import React from 'react';

// Route definitions - AI should NEVER modify these
export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  protected?: boolean;
  layout?: 'default' | 'dashboard' | 'minimal';
  featureFlag?: string;
}

// Import feature components (these CAN be modified by AI)
// 🔒 STEP 12 FREEZE: TherapistDashboard components are FROZEN - only critical bug fixes allowed
import { 
  TherapistDashboardView, 
  FeatureFlagDemo, 
  CoreServicesDemo,
  TherapistDashboardErrorBoundary,
  Step11EndToEndTest,
  RollbackValidation,
  TherapistDashboardFreezeGuard
} from '../features/therapist-dashboard';

// Feature flags - controls which version to use
export const FEATURE_FLAGS = {
  USE_V2_THERAPIST_DASHBOARD: process.env.NODE_ENV === 'development' || 
                              localStorage?.getItem('enableV2Dashboard') === 'true',
} as const;

// PROTECTED: Route configuration
export const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => <div>Home Page</div>,
    exact: true,
    layout: 'default'
  },
  {
    path: '/dashboard',
    component: () => <div>Dashboard</div>,
    protected: true,
    layout: 'dashboard'
  },
  {
    path: '/therapist',
    component: (props: any) => (
      <TherapistDashboardErrorBoundary language={props.language || 'id'}>
        <TherapistDashboardView 
          {...props}
          useV2Dashboard={FEATURE_FLAGS.USE_V2_THERAPIST_DASHBOARD}
        />
      </TherapistDashboardErrorBoundary>
    ),
    protected: true,
    layout: 'dashboard',
    featureFlag: 'therapist-dashboard-v2'
  },
  {
    path: '/therapist-dashboard',
    component: (props: any) => (
      <TherapistDashboardErrorBoundary language={props.language || 'id'}>
        <TherapistDashboardView 
          {...props}
          useV2Dashboard={FEATURE_FLAGS.USE_V2_THERAPIST_DASHBOARD}
        />
      </TherapistDashboardErrorBoundary>
    ),
    protected: true,
    layout: 'dashboard',
    featureFlag: 'therapist-dashboard-v2'
  },
  {
    path: '/core-demo',
    component: () => <CoreServicesDemo />,
    layout: 'dashboard',
    featureFlag: 'core-integration-demo'
  },
  {
    path: '/step11-test',
    component: () => <Step11EndToEndTest />,
    layout: 'dashboard',
    featureFlag: 'step11-end-to-end-test'
  },
  {
    path: '/rollback-test',
    component: () => <RollbackValidation />,
    layout: 'dashboard',
    featureFlag: 'rollback-validation'
  },
  {
    path: '/booking',
    component: () => <div>Booking Flow (Legacy)</div>,
    layout: 'minimal'
  },
  {
    path: '/chat',
    component: () => <div>Chat Interface (Legacy)</div>,
    layout: 'minimal'
  }
];

// PROTECTED: Route matching logic
export const getRouteConfig = (pathname: string): RouteConfig | null => {
  // Exact matches first
  const exactMatch = routes.find(route => route.exact && route.path === pathname);
  if (exactMatch) return exactMatch;

  // Prefix matches
  const prefixMatch = routes.find(route => !route.exact && pathname.startsWith(route.path));
  return prefixMatch || null;
};

// PROTECTED: Validation functions
export const validateRoute = (route: RouteConfig): boolean => {
  if (!route.path || !route.component) return false;
  if (route.protected && !isAuthenticated()) return false;
  if (route.featureFlag && !isFeatureEnabled(route.featureFlag)) return false;
  return true;
};

// PROTECTED: Authentication check (placeholder)
const isAuthenticated = (): boolean => {
  // In real implementation, check auth state from core
  return true;
};

// PROTECTED: Feature flag check
const isFeatureEnabled = (flag: string): boolean => {
  switch (flag) {
    case 'therapist-dashboard-v2':
      return FEATURE_FLAGS.USE_V2_THERAPIST_DASHBOARD;
    default:
      return false;
  }
};

// PROTECTED: Route utilities
export const routeUtils = {
  getRouteConfig,
  validateRoute,
  isAuthenticated,
  isFeatureEnabled,
  
  // Enable/disable feature flags dynamically
  enableFeature: (flag: string) => {
    if (flag === 'therapist-dashboard-v2') {
      localStorage?.setItem('enableV2Dashboard', 'true');
    }
  },
  
  disableFeature: (flag: string) => {
    if (flag === 'therapist-dashboard-v2') {
      localStorage?.setItem('enableV2Dashboard', 'false');
    }
  }
};

export default routes;
  {
    path: '/therapist',
    component: () => <div>Therapist Portal</div>,
    protected: true,
    layout: 'dashboard'
  },
  {
    path: '/booking',
    component: () => <div>Booking Flow</div>,
    layout: 'minimal'
  },
  {
    path: '/chat',
    component: () => <div>Chat Interface</div>,
    layout: 'minimal'
  }
];

// PROTECTED: Route matching logic
export const getRouteConfig = (pathname: string): RouteConfig | null => {
  return routes.find(route => {
    if (route.exact) {
      return route.path === pathname;
    }
    return pathname.startsWith(route.path);
  }) || null;
};

// PROTECTED: Route validation
export const isValidRoute = (pathname: string): boolean => {
  return getRouteConfig(pathname) !== null;
};

// PROTECTED: Route protection check
export const isProtectedRoute = (pathname: string): boolean => {
  const config = getRouteConfig(pathname);
  return config?.protected === true;
};