import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Initialize DOM error handler to prevent removeChild errors
import './utils/domErrorHandler';

// Check if running in admin mode
const isAdminMode = import.meta.env.MODE === 'admin';

console.log(`🚀 main.tsx: Starting ${isAdminMode ? 'Admin' : 'Main'} app...`);

// Admin mode: Load admin app
if (isAdminMode) {
  console.log('🔐 Loading Admin App...');
  import('./src/apps/admin/AdminApp').then((module) => {
    const AdminApp = module.default;
    const root = document.getElementById('root');
    if (root) {
      ReactDOM.createRoot(root).render(
        <React.StrictMode>
          <AdminApp />
        </React.StrictMode>
      );
    }
  });
} else {
  // Main customer app
  console.log('🏠 Loading Main App...');
  
  // Register Service Worker for notifications
  if ('serviceWorker' in navigator) {
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

  // Mount React app
  const root = document.getElementById('root');
  if (!root) {
    console.error('Root element not found!');
  } else {
    const reactRoot = ReactDOM.createRoot(root);
    reactRoot.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('✅ React app mounted successfully');
  }
}