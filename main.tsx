import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import AppErrorBoundary from './components/AppErrorBoundary';
import { ProductionErrorBoundary } from './components/ProductionErrorBoundary';
import { logger } from './utils/logger';
import './index.css';

// Initialize DOM error handler to prevent removeChild errors
import './utils/domErrorHandler';

// Suppress non-critical Appwrite collection errors in console
import './utils/suppressNonCriticalErrors';

// Initialize version checking for cache busting
import { initVersionCheck } from './lib/versionCheck';

// 🔒 PRODUCTION STARTUP GUARD - Detects mount failures
// TEMPORARILY DISABLED: import { initializeStartupGuard } from './utils/startupGuard';

// 🔒 APPWRITE COLLECTION PROTECTION - Validates collection IDs at startup
import './lib/appwrite-startup-validator';

// Check if running in admin mode
const isAdminMode = import.meta.env.MODE === 'admin';

logger.log(`🚀 main.tsx: Starting ${isAdminMode ? 'Admin' : 'Main'} app...`);

// 🔒 Initialize startup guard IMMEDIATELY
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
  
  // 🚀 PWA MODE: Register Service Worker in both preview and production for PWA features
  if ('serviceWorker' in navigator && (import.meta.env.PROD || import.meta.env.MODE === 'production')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          logger.log('✅ Service Worker registered:', registration.scope);
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

  // Mount React app
  const root = document.getElementById('root');
  if (!root) {
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
    
    // Temporarily disable concurrent features to debug removeChild error
    const root = ReactDOM.createRoot(rootElement, {
      onRecoverableError: (error, errorInfo) => {
        console.warn('React Recoverable Error:', error);
        // Don't throw on recoverable errors to prevent AsyncMode crashes
      },
    });
    
    root.render(
      <ProductionErrorBoundary>
        <ErrorBoundary>
          <AppErrorBoundary>
            <App />
          </AppErrorBoundary>
        </ErrorBoundary>
      </ProductionErrorBoundary>
    );
    logger.log('✅ React app mounted successfully');
    
    // Signal successful mount to startup guard
    if ((window as any).__APP_MOUNTED__) {
      (window as any).__APP_MOUNTED__();
    }
  }
}