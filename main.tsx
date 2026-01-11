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
import { initializeStartupGuard } from './utils/startupGuard';

// 🔒 APPWRITE COLLECTION PROTECTION - Validates collection IDs at startup
import './lib/appwrite-startup-validator';

// Check if running in admin mode
const isAdminMode = import.meta.env.MODE === 'admin';

logger.log(`🚀 main.tsx: Starting ${isAdminMode ? 'Admin' : 'Main'} app...`);

// 🔒 Initialize startup guard IMMEDIATELY
initializeStartupGuard();

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
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().then((success) => {
          if (success) logger.log('✅ Service worker unregistered:', registration.scope);
        });
      });
    });
    
    // Clear all caches
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName).then(() => {
          logger.log('🗑️ Cache deleted:', cacheName);
        });
      });
    });
  }
  
  // 🚀 PRODUCTION MODE: Register Service Worker only in production
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
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
    const reactRoot = ReactDOM.createRoot(root);
    reactRoot.render(
      <React.StrictMode>
        <ProductionErrorBoundary>
          <ErrorBoundary>
            <AppErrorBoundary>
              <App />
            </AppErrorBoundary>
          </ErrorBoundary>
        </ProductionErrorBoundary>
      </React.StrictMode>
    );
    logger.log('✅ React app mounted successfully');
    
    // Signal successful mount to startup guard
    if ((window as any).__APP_MOUNTED__) {
      (window as any).__APP_MOUNTED__();
    }
  }
}