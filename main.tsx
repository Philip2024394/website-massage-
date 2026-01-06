import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import AppErrorBoundary from './components/AppErrorBoundary';
import './index.css';

// Initialize DOM error handler to prevent removeChild errors
import './utils/domErrorHandler';

// Suppress non-critical Appwrite collection errors in console
import './utils/suppressNonCriticalErrors';

// Initialize version checking for cache busting
import { initVersionCheck } from './lib/versionCheck';

// Check if running in admin mode
const isAdminMode = import.meta.env.MODE === 'admin';

console.log(`🚀 main.tsx: Starting ${isAdminMode ? 'Admin' : 'Main'} app...`);

// Admin mode: Redirect to separate admin dashboard app
if (isAdminMode) {
  console.log('🔐 Redirecting to Admin Dashboard App...');
  window.location.href = 'http://localhost:3004';
} else {
  // Main customer app
  console.log('🏠 Loading Main App...');
  
  // Register Service Worker only in production (avoid dev cache issues)
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
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
    console.error('Root element not found!');
  } else {
    const reactRoot = ReactDOM.createRoot(root);
    reactRoot.render(
      <React.StrictMode>
        <ErrorBoundary>
          <AppErrorBoundary>
            <App />
          </AppErrorBoundary>
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('✅ React app mounted successfully');
  }
}