/**
 * ============================================================================
 * V2 ARCHITECTURE - DEMO ENTRY POINT
 * ============================================================================
 * 
 * This is the main entry point for testing the new /src_v2 architecture.
 * It demonstrates the complete STEP 8 implementation:
 * 
 * ✅ Therapist dashboard migrated to /features
 * ✅ Wired to shell routing system  
 * ✅ Feature-flagged (toggleable V2/legacy)
 * ✅ Isolated boundaries maintained
 * 
 * USAGE:
 * - Open this file in the browser to test the V2 system
 * - Use the feature flag controls to toggle V2 dashboard on/off
 * - Verify that the shell remains stable during feature changes
 * 
 * ============================================================================
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import V2AppRouter from './V2AppRouter';

// Global styles for V2 architecture
const globalStyles = `
  /* V2 Architecture Global Styles */
  .v2-app {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    line-height: 1.5;
  }
  
  .dev-feature-flags {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }
  
  /* Ensure proper mobile scrolling */
  body {
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }
  
  /* V2 component animations */
  .v2-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* Feature flag indicator styles */
  .feature-flag-indicator {
    transition: all 0.2s ease;
  }
  
  .feature-flag-indicator:hover {
    transform: scale(1.05);
  }
`;

// Inject global styles
const styleElement = document.createElement('style');
styleElement.textContent = globalStyles;
document.head.appendChild(styleElement);

// Initialize V2 App
const initV2App = () => {
  const container = document.getElementById('v2-root');
  
  if (!container) {
    console.error('❌ V2 Root container not found. Make sure you have <div id="v2-root"></div> in your HTML.');
    return;
  }

  const root = createRoot(container);
  
  console.log('🚀 Initializing V2 Architecture...');
  console.log('📍 Step 8 Complete: Real screen migrated with feature flags');
  
  root.render(
    <React.StrictMode>
      <V2AppRouter />
    </React.StrictMode>
  );
  
  console.log('✅ V2 Architecture Initialized Successfully');
};

// Development mode utilities
if (process.env.NODE_ENV === 'development') {
  // Expose V2 utilities to global scope for debugging
  (window as any).V2Utils = {
    enableV2Dashboard: () => {
      localStorage.setItem('enableV2Dashboard', 'true');
      window.location.reload();
    },
    disableV2Dashboard: () => {
      localStorage.setItem('enableV2Dashboard', 'false');
      window.location.reload();
    },
    showFeatureFlags: () => {
      console.log('Current Feature Flags:', {
        USE_V2_THERAPIST_DASHBOARD: localStorage.getItem('enableV2Dashboard') === 'true' || process.env.NODE_ENV === 'development',
        ENABLE_REAL_TIME_UPDATES: localStorage.getItem('enableRealTimeUpdates') === 'true',
        SHOW_BETA_FEATURES: localStorage.getItem('enableBetaFeatures') === 'true',
        ADVANCED_ANALYTICS: localStorage.getItem('enableAdvancedAnalytics') === 'true'
      });
    },
    clearAllFlags: () => {
      localStorage.removeItem('enableV2Dashboard');
      localStorage.removeItem('enableRealTimeUpdates');
      localStorage.removeItem('enableBetaFeatures');
      localStorage.removeItem('enableAdvancedAnalytics');
      window.location.reload();
    }
  };
  
  console.log('🛠️ Development mode active. V2Utils available in console:', (window as any).V2Utils);
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initV2App);
} else {
  initV2App();
}

export default V2AppRouter;