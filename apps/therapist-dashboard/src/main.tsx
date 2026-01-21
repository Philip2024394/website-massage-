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
        
        // Set up Media Session API for lock screen controls
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: 'New Booking Notification',
            artist: 'Indastreet Massage',
            album: 'Therapist Notifications',
            artwork: [
              { src: '/icon-96.png', sizes: '96x96', type: 'image/png' },
              { src: '/icon-128.png', sizes: '128x128', type: 'image/png' },
              { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
              { src: '/icon-384.png', sizes: '384x384', type: 'image/png' },
              { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
            ]
          });

          // Set up action handlers for media controls
          navigator.mediaSession.setActionHandler('play', () => {
            audio.play().catch(err => console.log('Play failed:', err));
          });
          
          navigator.mediaSession.setActionHandler('pause', () => {
            audio.pause();
          });
          
          navigator.mediaSession.setActionHandler('stop', () => {
            audio.pause();
            audio.currentTime = 0;
          });
        }
        
        audio.play().catch(err => console.log('Sound play failed:', err));
        console.log('🔊 Playing notification sound from service worker with media controls');
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
