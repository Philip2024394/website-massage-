// Firebase Cloud Messaging Service Worker
// This runs in the background and handles push notifications even when app is closed

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages (when app is closed/background)
messaging.onBackgroundMessage((payload) => {
  console.log('🔔 [firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || '🚨 New Booking Request!';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new massage booking. Click to respond!',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: 'booking-alert',
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    data: payload.data,
    actions: [
      {
        action: 'accept',
        title: '✅ Accept'
      },
      {
        action: 'reject',
        title: '❌ Reject'
      }
    ]
  };

  // Play custom notification sound
  self.registration.showNotification(notificationTitle, notificationOptions);
  
  // Play sound in background
  playNotificationSound();
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event.action);
  
  event.notification.close();

  const bookingId = event.notification.data?.bookingId;
  
  if (event.action === 'accept') {
    // Open app to accept booking
    event.waitUntil(
      clients.openWindow(`/accept-booking/${bookingId}?action=accept`)
    );
  } else if (event.action === 'reject') {
    // Open app to reject booking
    event.waitUntil(
      clients.openWindow(`/accept-booking/${bookingId}?action=reject`)
    );
  } else {
    // Just open the app
    event.waitUntil(
      clients.openWindow(`/accept-booking/${bookingId}`)
    );
  }
});

// Play notification sound in background
function playNotificationSound() {
  // Service workers can't directly play audio, but we can send message to clients
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'PLAY_NOTIFICATION_SOUND'
      });
    });
  });
}
