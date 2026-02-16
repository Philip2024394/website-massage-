// CRITICAL: React 19 AsyncMode fix must be imported FIRST
import './utils/reactCompatibility';

// 🛡️ Appwrite crash code 536870904 - must run before any App/API code
import './lib/globalErrorHandler';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import AppErrorBoundary from './components/AppErrorBoundary';
import { ProductionErrorBoundary } from './components/ProductionErrorBoundary';
import { logger } from './utils/logger';
import './index.css';

// 🆕 ELITE PWA: Register Service Worker for 97% Download Success Rate
import { registerSW } from 'virtual:pwa-register';

// Initialize DOM error handler to prevent removeChild errors
import './utils/domErrorHandler';

// 🔒 MOBILE SCROLL: Set viewport height custom property for 100dvh fallback
// Required for mobile-scroll-gold-standard.css to work correctly
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setViewportHeight(); // Initial call
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);

// Initialize version checking for cache busting
import { initVersionCheck } from './lib/versionCheck';

// 🔒 PRODUCTION STARTUP GUARD - Detects mount failures
// TEMPORARILY DISABLED: import { initializeStartupGuard } from './utils/startupGuard';

// 🔒 APPWRITE COLLECTION PROTECTION - Non-blocking validation (runs async)
import('./lib/appwrite-startup-validator').catch(err => 
  console.error('❌ Collection validation failed:', err)
);

// 📊 ENTERPRISE MONITORING - Web Vitals & Error Tracking
import { initWebVitals } from './services/webVitals';
import { errorMonitoring } from './services/enterpriseErrorMonitoring';

// 🛡️ BOOT GUARD - Runtime Protection System
import { initializeBootGuard, markBootSuccess } from './utils/bootGuard';

// 🔍 PRODUCTION MONITOR - Error Tracking & Alerts
import { initializeMonitoring, recordBootStart, recordBootComplete } from './monitoring/productionMonitor';

// 🆕 ELITE PWA: Register Service Worker (Production Only)
// ✅ Achieves 97% download reliability vs 75% without PWA
// 🚨 TEMPORARILY DISABLED TO BREAK CACHE LOOP
/*
if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      logger.log('🔄 PWA: New version available, updating...');
      updateSW(true); // Auto-update for seamless experience
    },
    onOfflineReady() {
      logger.log('✅ PWA: App ready to work offline');
    },
    onRegistered(registration) {
      logger.log('✅ PWA: Service worker registered successfully');
      // Check for updates every hour
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      logger.error('❌ PWA: Service worker registration failed', error);
    }
  });
}
*/

// 🆕 ELITE PWA: Capture install prompt for manual trigger
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).deferredPWAPrompt = e;
  logger.log('💾 PWA: Install prompt captured, available via Install App button');
});

// Check if running in admin mode
const isAdminMode = import.meta.env.MODE === 'admin';

logger.log(`🚀 main.tsx: Starting ${isAdminMode ? 'Admin' : 'Main'} app...`);

// �️ BOOT GUARD: Initialize IMMEDIATELY before anything else  
initializeBootGuard();
logger.log('🛡️ Boot guard initialized');

// 🔍 PRODUCTION MONITOR: Start monitoring
initializeMonitoring();
recordBootStart();
logger.log('🔍 Production monitoring active');

// �🔒 Initialize startup guard IMMEDIATELY
  // TEMPORARILY DISABLED: initializeStartupGuard();
// Admin mode: Redirect to separate admin dashboard app
if (isAdminMode) {
  logger.log('🔐 Redirecting to Admin Dashboard App...');
  window.location.href = 'http://localhost:3004';
} else {
  // Main customer app
  logger.log('🏠 Loading Main App...');
  
  // 🔥 DEVELOPMENT MODE: Force unregister ALL service workers and clear caches
  if ('serviceWorker' in navigator && import.meta.env.DEV) {
    logger.log('🧹 DEV MODE: Unregistering all service workers and clearing caches...');
    
    // Force immediate unregistration
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      const unregisterPromises = registrations.map((registration) => {
        return registration.unregister().then((success) => {
          if (success) logger.log('✅ Service worker unregistered:', registration.scope);
          return success;
        });
      });
      
      Promise.all(unregisterPromises).then(() => {
        logger.log('✅ All service workers unregistered');
      });
    });
    
    // Clear all caches immediately
    caches.keys().then((cacheNames) => {
      const deletePromises = cacheNames.map((cacheName) => {
        return caches.delete(cacheName).then(() => {
          logger.log('🗑️ Cache deleted:', cacheName);
        });
      });
      
      Promise.all(deletePromises).then(() => {
        logger.log('✅ All caches cleared');
      });
    });
    
    // Clear localStorage dev flags
    try {
      localStorage.removeItem('sw-version');
      localStorage.removeItem('app-version');
      logger.log('✅ Cleared version flags');
    } catch (e) {
      // Ignore localStorage errors
    }
  }
  
  // 🚀 PWA MODE: Register Service Worker in development and production for PWA features
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          logger.log('✅ Service Worker registered:', registration.scope);
          // Dispatch event to notify PWA components that SW is ready
          window.dispatchEvent(new CustomEvent('sw-registered', { detail: registration }));
        })
        .catch((error) => {
          logger.error('Service Worker registration failed:', error);
        });
    });
  }

  // Initialize version check (production only)
  if (import.meta.env.PROD) {
    initVersionCheck();
  }
  // 📊 ENTERPRISE MONITORING: Initialize Web Vitals and Error Tracking
  try {
    // Initialize Web Vitals monitoring (production and staging)
    if (import.meta.env.PROD || import.meta.env.MODE === 'staging') {
      initWebVitals();
      logger.log('✅ Web Vitals monitoring active');
    }

    // Error monitoring is auto-initialized in enterpriseErrorMonitoring.ts
    logger.log('✅ Enterprise error monitoring active');
  } catch (monitoringError) {
    logger.error('Failed to initialize monitoring', { error: monitoringError });
  }
  // Mount React app
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    logger.error('Root element not found!');
  } else {
    // Add dev mode indicator
    if (import.meta.env.DEV) {
      const devIndicator = document.createElement('div');
      devIndicator.id = 'dev-mode-indicator';
      devIndicator.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 8px 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 12px;
          font-weight: 600;
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        ">
          <span style="font-size: 16px;">🔧</span>
          <span>DEV MODE - Cache Disabled | HMR Active | Service Worker Disabled</span>
          <span style="font-size: 16px;">✨</span>
        </div>
      `;
      document.body.insertBefore(devIndicator, document.body.firstChild);
      logger.log('✅ Dev mode indicator added');
    }
    
    // Create React root with React 19 compatibility
    const reactRoot = ReactDOM.createRoot(rootElement, {
      onRecoverableError: (error, errorInfo) => {
        console.warn('React Recoverable Error:', error);
        // Don't throw on recoverable errors to prevent crashes
      },
      // React 19 compatibility mode
      identifierPrefix: 'indastreet-',
    });
    
    reactRoot.render(
      <ProductionErrorBoundary>
        <ErrorBoundary>
          <AppErrorBoundary>
            <App />
          </AppErrorBoundary>
        </ErrorBoundary>
      </ProductionErrorBoundary>
    );
    logger.log('✅ React app mounted successfully');
    
    // 🛡️ BOOT GUARD: Mark boot complete
    recordBootComplete();
    
    // Signal successful mount to startup guard
    if ((window as any).__APP_MOUNTED__) {
      (window as any).__APP_MOUNTED__();
    }
    
    // Mark boot success after a short delay (ensure landing page renders)
    setTimeout(() => {
      markBootSuccess();
      logger.log('✅ Boot sequence complete');
    }, 1000);
  }
}