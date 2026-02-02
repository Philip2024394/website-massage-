/**
 * ============================================================================
 * 🔒 STEP 12 FROZEN - STABLE REFERENCE POINT - NO MODIFICATIONS
 * ============================================================================
 * 
 * ⚠️  CRITICAL: THIS FILE IS FROZEN AS OF STEP 12 COMPLETION
 * 
 * ALLOWED CHANGES:
 * ✅ Critical bug fixes only (with documentation)  
 * ❌ NO refactors, redesigns, or feature additions
 * 
 * WHY FROZEN:
 * This export interface is the proven contract for therapist dashboard.
 * Changes could break shell integration and rollback capability.
 * 
 * ============================================================================
 * 🎯 FEATURE BOUNDARY - THERAPIST DASHBOARD
 * ============================================================================
 * 
 * EXPORT RULES:
 * - Export ONLY components
 * - Never export routes, layouts, clients, or global styles
 * - Features are self-contained and isolated
 * 
 * ISOLATION GUARANTEE:
 * If this feature breaks → only therapist dashboard breaks
 * 
 * ============================================================================
 */

// STEP 24: Production Dashboard (Migrated from /src/pages/therapist/)
export { TherapistDashboard } from './Dashboard';

// Legacy exports (kept for reference)
export { TherapistDashboardView } from './View';
export { FeatureFlagDemo } from './FeatureFlagDemo';
export { CoreServicesDemo } from './CoreDemo';

// Error boundary for comprehensive error handling (STEP 11 STABILIZATION)
export { 
  TherapistDashboardErrorBoundary,
  withErrorBoundary 
} from './ErrorBoundary';

// STEP 11 End-to-end test suite
export { Step11EndToEndTest } from './Step11Test';

//
// Rollback capability validation
export { RollbackValidation } from './RollbackValidation';

// STEP 12 - Freeze protection system
export { 
  TherapistDashboardFreezeGuard,
  validateFreezeCompliance,
  FREEZE_STATUS 
} from './FreezeGuard';

// Action exports (optional - for complex features)
export * from './actions';

// Selector exports (optional - for complex features)  
export * from './selectors';

// Type exports
export type { TherapistDashboardProps } from './View';
export type { 
  TherapistProfile,
  DashboardStats,
  RecentActivity,
  QuickAction,
  FeatureFlags,
  TherapistDashboardFeature
} from './types';

// Feature metadata for shell routing
export const FEATURE_METADATA = {
  name: 'therapist-dashboard',
  version: '2.0.0',
  description: 'Enhanced therapist dashboard with comprehensive analytics and management tools',
  routes: [
    '/therapist',
    '/therapist-dashboard'
  ],
  featureFlags: [
    'USE_V2_THERAPIST_DASHBOARD',
    'ENABLE_REAL_TIME_UPDATES',
    'SHOW_BETA_FEATURES',
    'ADVANCED_ANALYTICS'
  ],
  requirements: {
    authentication: true,
    permissions: ['therapist'],
    layout: 'dashboard'
  }
} as const;

// Feature flag utilities
export const featureUtils = {
  isV2Enabled: (): boolean => {
    return process.env.NODE_ENV === 'development' || 
           localStorage?.getItem('enableV2Dashboard') === 'true';
  },
  
  enableV2Dashboard: (): void => {
    localStorage?.setItem('enableV2Dashboard', 'true');
  },
  
  disableV2Dashboard: (): void => {
    localStorage?.setItem('enableV2Dashboard', 'false');
  },
  
  getAllFlags: (): Record<string, boolean> => {
    return {
      USE_V2_THERAPIST_DASHBOARD: featureUtils.isV2Enabled(),
      ENABLE_REAL_TIME_UPDATES: localStorage?.getItem('enableRealTimeUpdates') === 'true',
      SHOW_BETA_FEATURES: localStorage?.getItem('enableBetaFeatures') === 'true',
      ADVANCED_ANALYTICS: localStorage?.getItem('enableAdvancedAnalytics') === 'true'
    };
  }
};

// Default export for shell convenience
export default {
  Component: TherapistDashboardView,
  metadata: FEATURE_METADATA,
  featureUtils
};