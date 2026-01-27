import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// 🔒 APPWRITE STARTUP CHECK - Simple inline validation
if (!import.meta.env.VITE_APPWRITE_ENDPOINT) {
  console.warn("Appwrite environment not configured for therapist dashboard");
}

// 🔔 SERVICE WORKER MESSAGE LISTENER - Play notification sounds
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'play-notification-sound') {
      try {
        const audio = new Audio(event.data.soundUrl || '/sounds/booking-notification.mp3');
        audio.volume = 1.0;
        audio.loop = true; // Loop continuously until manually stopped
        
        // 2-MINUTE CONTINUOUS VIBRATION
        const vibratePattern = [500, 100, 500, 100, 500, 100, 500, 100, 500, 100, 
                                500, 100, 500, 100, 500, 100, 500, 100, 500];
        
        let vibrationCount = 0;
        const maxVibrations = 12; // 12 x 10 seconds = 2 minutes
        
        const vibrateInterval = setInterval(() => {
          if (vibrationCount >= maxVibrations) {
            clearInterval(vibrateInterval);
            return;
          }
          if (navigator.vibrate) {
            navigator.vibrate(vibratePattern);
            vibrationCount++;
          }
        }, 10000);
        
        // Initial vibration
        if (navigator.vibrate) {
          navigator.vibrate(vibratePattern);
          vibrationCount++;
        }
        
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
            if (navigator.vibrate) {
              navigator.vibrate(0); // Stop vibration
            }
            clearInterval(vibrateInterval);
          });
          
          navigator.mediaSession.setActionHandler('stop', () => {
            audio.pause();
            audio.currentTime = 0;
            if (navigator.vibrate) {
              navigator.vibrate(0); // Stop vibration
            }
            clearInterval(vibrateInterval);
          });
        }
        
        audio.play().catch(err => console.log('Sound play failed:', err));
        console.log('🔊 Playing LOOPING notification sound with 2-MINUTE vibration from service worker');
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
