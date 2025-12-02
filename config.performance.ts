/**
 * Performance Monitoring Configuration
 * 
 * This file sets up bundle analysis and performance monitoring
 * to track improvements from architecture refactoring.
 */

export const PERFORMANCE_BUDGETS = {
  // Bundle size targets (industry standard)
  maxInitialBundle: 500, // KB
  maxPageChunk: 75, // KB
  maxVendorChunk: 200, // KB
  maxServiceChunk: 30, // KB
  
  // Loading performance targets
  maxTTI: 2500, // ms (Time to Interactive)
  maxFCP: 1800, // ms (First Contentful Paint)
  maxLCP: 2500, // ms (Largest Contentful Paint)
  
  // Build performance targets
  maxBuildTime: 45000, // ms
  maxHMRTime: 500, // ms
};

export const CODE_SPLIT_STRATEGY = {
  // Vendor libraries (cached separately)
  vendors: [
    'react', 
    'react-dom',
    'react-router-dom',
    'appwrite',
    'framer-motion',
    'lucide-react',
  ],
  
  // Feature-based splits
  features: {
    auth: ['Login', 'Register', 'Auth'],
    dashboard: ['Dashboard'],
    jobs: ['Job', 'Employment'],
    public: ['Home', 'Landing', 'About'],
  },
  
  // Heavy pages to split
  heavyPages: [
    'PlaceDashboardPage', // 120KB
    'EmployerJobPostingPage', // 86KB
    'ConfirmTherapistsPage', // 74KB
    'LiveAdminDashboardEnhanced', // 59KB
  ],
};

export const MONITORING_CONFIG = {
  // Enable in production
  enabled: process.env.NODE_ENV === 'production',
  
  // Bundle analysis
  analyze: process.env.ANALYZE === 'true',
  
  // Performance tracking
  trackWebVitals: true,
  
  // Error monitoring (integrate with Sentry, etc.)
  errorTracking: true,
};

/**
 * Example usage in vite.config.ts:
 * 
 * import { CODE_SPLIT_STRATEGY } from './config.performance'
 * 
 * manualChunks: (id) => {
 *   for (const vendor of CODE_SPLIT_STRATEGY.vendors) {
 *     if (id.includes(vendor)) return `vendor-${vendor}`
 *   }
 * }
 */

export default {
  PERFORMANCE_BUDGETS,
  CODE_SPLIT_STRATEGY,
  MONITORING_CONFIG,
};
