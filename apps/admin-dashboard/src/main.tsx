import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Use local styles (no tailwind directives needed - they inherit from CSS classes)
import './styles.css';

// Register service worker for PWA (with error handling)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Admin Dashboard SW registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.log('Admin Dashboard SW registration failed (non-critical):', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
