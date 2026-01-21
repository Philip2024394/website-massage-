import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// 🔒 APPWRITE COLLECTION PROTECTION - Validates collection IDs at startup
import '../../../lib/appwrite-startup-validator';

// 🔔 SERVICE WORKER MESSAGE LISTENER - Play notification sounds
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'play-notification-sound') {
      try {
        const audio = new Audio(event.data.soundUrl || '/sounds/booking-notification.mp3');
        audio.volume = 1.0;
        audio.play().catch(err => console.log('Sound play failed:', err));
        console.log('🔊 Playing notification sound from service worker');
      } catch (error) {
        console.error('Failed to play notification sound:', error);
      }
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
