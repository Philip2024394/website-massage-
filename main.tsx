import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

console.log('🚀 main.tsx: Starting React app...');

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