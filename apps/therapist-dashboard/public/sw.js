// Service Worker for PWA functionality
const CACHE_NAME = 'indastreet-therapist-v1';
const NOTIFICATION_SOUND_URL = 'https://ik.imagekit.io/7grri5v7d/notification-sound.mp3';

// Background message checking state
let messageCheckInterval = null;
let currentTherapistId = null;

// Install event
self.addEventListener('install', (event) => {
  console.log('✅ Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✅ Service Worker: Caching assets');
      // Cache assets individually to avoid failing on any single error
      const urlsToCache = [
        '/',
        '/index.html',
        '/manifest.json',
        NOTIFICATION_SOUND_URL
      ];
      
      return Promise.allSettled(
        urlsToCache.map(url => 
          cache.add(url).catch(err => {
            console.warn(`⚠️ Failed to cache ${url}:`, err.message);
            return null;
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate event - Clear ALL caches to prevent old redirect loops
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log('🗑️ Clearing ALL caches to prevent old redirects');
      return Promise.all(
        cacheNames.map((cache) => {
          console.log('🗑️ Deleting cache:', cache);
          return caches.delete(cache);
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseClone = response.clone();
        
        // Cache the fetched response
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request);
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('📩 Push notification received:', event);
  
  let notificationData = {
    title: 'IndaStreet',
    body: 'You have a new notification',
    icon: '/pwa-icon-192.png',
    badge: '/pwa-icon-192.png',
    tag: 'indastreet-notification',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      type: 'notification',
      action: 'open-app',
      url: '/'
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        tag: data.tag || notificationData.tag,
        data: {
          type: data.type || 'notification',
          action: data.action || 'open-app',
          messageId: data.messageId,
          therapistId: data.therapistId,
          url: data.url || '/?action=open-chat'
        }
      };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    Promise.all([
      // Show notification
      self.registration.showNotification(notificationData.title, notificationData),
      
      // Play sound
      playNotificationSound()
    ])
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  event.notification.close();

  const notificationData = event.notification.data || {};
  const action = event.action || notificationData.action || 'open-app';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Handle booking notifications
      if (notificationData.type === 'booking-notification') {
        return handleBookingNotificationClick(clientList, notificationData, action);
      }
      
      // Handle chat message notifications
      if (notificationData.type === 'chat-message' || action === 'open-chat') {
        return handleChatNotificationClick(clientList, notificationData, action);
      }
      
      // Default behavior - open the app
      return handleDefaultNotificationClick(clientList, notificationData);
    })
  );
});

// Handle booking notification clicks
async function handleBookingNotificationClick(clientList, data, action) {
  console.log('📋 Handling booking notification click:', { data, action });
  
  const bookingId = data.bookingId;
  const therapistId = data.therapistId;
  
  try {
    switch (action) {
      case 'accept-booking':
        // Try to accept the booking directly
        if (clientList.length > 0) {
          const client = clientList[0];
          client.focus();
          client.postMessage({
            type: 'ACCEPT_BOOKING',
            payload: { bookingId, therapistId }
          });
          return Promise.resolve();
        } else {
          // Open app with accept action
          return clients.openWindow(`/?action=accept-booking&id=${bookingId}`);
        }
        
      case 'view-details':
      case 'open-booking-details':
        // Open booking details
        if (clientList.length > 0) {
          const client = clientList[0];
          client.focus();
          client.postMessage({
            type: 'OPEN_BOOKING_DETAILS',
            payload: { bookingId, therapistId }
          });
          return Promise.resolve();
        } else {
          return clients.openWindow(`/?action=open-booking&id=${bookingId}`);
        }
        
      case 'dismiss':
        // Just close the notification - no action needed
        console.log('🔕 Booking notification dismissed');
        return Promise.resolve();
        
      default:
        // Default: open booking details
        if (clientList.length > 0) {
          const client = clientList[0];
          client.focus();
          client.postMessage({
            type: 'OPEN_BOOKING_DETAILS',
            payload: { bookingId, therapistId }
          });
          return Promise.resolve();
        } else {
          return clients.openWindow(`/?page=bookings&highlight=${bookingId}`);
        }
    }
  } catch (error) {
    console.error('Error handling booking notification click:', error);
    // Fallback: just open the app
    return clients.openWindow('/');
  }
}

// Handle chat notification clicks
async function handleChatNotificationClick(clientList, data, action) {
  console.log('💬 Handling chat notification click:', { data, action });
  
  const messageId = data.messageId;
  const therapistId = data.therapistId;
  
  try {
    if (action === 'dismiss') {
      console.log('🔕 Chat notification dismissed');
      return Promise.resolve();
    }
    
    // Find existing window or open new one
    for (const client of clientList) {
      if (client.url.includes(self.location.origin) && 'focus' in client) {
        client.focus();
        // Send message to open chat
        client.postMessage({
          type: 'OPEN_CHAT',
          messageId: messageId,
          therapistId: therapistId
        });
        return Promise.resolve();
      }
    }
    
    // No existing window, open new one
    const urlToOpen = data.url || `/?action=open-chat&messageId=${messageId}`;
    return clients.openWindow(urlToOpen);
    
  } catch (error) {
    console.error('Error handling chat notification click:', error);
    return clients.openWindow('/');
  }
}

// Handle default notifications
async function handleDefaultNotificationClick(clientList, data) {
  // Check if there's already a window open
  for (const client of clientList) {
    const targetUrl = data.url || '/';
    if (client.url.includes(self.location.origin) && 'focus' in client) {
      client.focus();
      return Promise.resolve();
    }
  }
  
  // Open new window if none exist
  if (clients.openWindow) {
    const urlToOpen = data.url || '/';
    return clients.openWindow(urlToOpen);
  }
}

// Function to play notification sound - Enhanced with different sound types
async function playNotificationSound(soundType = 'message') {
  try {
    console.log(`🔊 Playing ${soundType} notification sound...`);
    
    // Try to get all clients
    const allClients = await clients.matchAll({ includeUncontrolled: true });
    
    if (allClients.length > 0) {
      // Send message to client to play sound
      allClients.forEach(client => {
        client.postMessage({
          type: 'PLAY_NOTIFICATION_SOUND',
          soundUrl: NOTIFICATION_SOUND_URL,
          soundType: soundType, // 'message', 'booking', 'alert'
          volume: 0.7
        });
      });
      
      console.log(`✅ ${soundType} notification sound message sent to ${allClients.length} client(s)`);
    } else {
      console.log('⚠️ No active clients found to play sound');
    }
  } catch (error) {
    console.error('❌ Error playing notification sound:', error);
  }
}

// Background sync event (for offline functionality)
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  // Implement message syncing logic here
  console.log('📨 Syncing messages in background...');
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('📨 Service worker received message:', event.data);
  
  const { type, therapistId, interval } = event.data;
  
  switch (type) {
    case 'START_MESSAGE_CHECK':
      startBackgroundMessageCheck(therapistId, interval);
      break;
      
    case 'STOP_MESSAGE_CHECK':
      stopBackgroundMessageCheck();
      break;
      
    case 'START_BOOKING_CHECK':
      startBackgroundBookingCheck(therapistId, interval || 15000); // Check every 15 seconds for bookings
      break;
      
    case 'STOP_BOOKING_CHECK':
      stopBackgroundBookingCheck();
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

// Background booking checking variables
let bookingCheckInterval = null;
let currentBookingTherapistId = null;

// Start background booking check
function startBackgroundBookingCheck(therapistId, checkInterval = 15000) {
  console.log(`🔄 Starting background booking check for therapist ${therapistId}`);
  
  currentBookingTherapistId = therapistId;
  
  // Clear existing interval if any
  if (bookingCheckInterval) {
    clearInterval(bookingCheckInterval);
  }
  
  // Start checking for bookings more frequently (every 15 seconds)
  bookingCheckInterval = setInterval(async () => {
    try {
      await checkForNewBookings(therapistId);
    } catch (error) {
      console.error('Error checking for bookings:', error);
    }
  }, checkInterval);
  
  // Also check immediately
  checkForNewBookings(therapistId);
}

function stopBackgroundBookingCheck() {
  console.log('⏹️ Stopping background booking check');
  
  if (bookingCheckInterval) {
    clearInterval(bookingCheckInterval);
    bookingCheckInterval = null;
  }
  currentBookingTherapistId = null;
}

async function checkForNewBookings(therapistId) {
  try {
    // Get last check timestamp for bookings
    const lastCheck = await getLastBookingCheck(therapistId);
    
    // Make API call to check for new bookings
    const response = await fetch(`/api/therapist/${therapistId}/bookings/check?since=${lastCheck}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.warn('Failed to check bookings:', response.status);
      return;
    }
    
    const data = await response.json();
    
    if (data.hasNewBookings && data.newBookings?.length > 0) {
      // Process each new booking
      for (const booking of data.newBookings) {
        console.log('🆕 New booking detected:', booking);
        
        // Show urgent notification for pending bookings
        if (booking.status === 'pending') {
          await self.registration.showNotification('🚨 New Booking Request!', {
            body: `${booking.customerName} requested ${booking.duration}min ${booking.serviceType}. Tap to respond immediately!`,
            icon: '/pwa-icon-192.png',
            badge: '/pwa-icon-192.png',
            tag: `booking-${booking.id}`,
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 400],
            renotify: true,
            data: {
              type: 'booking-notification',
              action: 'open-booking-details',
              bookingId: booking.id,
              therapistId: therapistId,
              status: booking.status,
              urgent: true,
              url: `/?action=open-booking&id=${booking.id}`
            },
            actions: [
              {
                action: 'accept-booking',
                title: '✅ Accept',
                icon: '/icons/accept.png'
              },
              {
                action: 'view-details',
                title: '👁️ View Details',
                icon: '/icons/view.png'
              }
            ]
          });
        } else {
          // Show regular notification for other booking updates
          await self.registration.showNotification('📋 Booking Update', {
            body: getBookingUpdateMessage(booking),
            icon: '/pwa-icon-192.png',
            badge: '/pwa-icon-192.png',
            tag: `booking-update-${booking.id}`,
            data: {
              type: 'booking-notification',
              action: 'open-booking-details',
              bookingId: booking.id,
              therapistId: therapistId,
              status: booking.status,
              url: `/?page=bookings&highlight=${booking.id}`
            }
          });
        }
        
        // Notify any open clients about the new booking
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'NEW_BOOKING',
            payload: booking
          });
        });
      }
      
      // Update last check timestamp
      await setLastBookingCheck(therapistId, Date.now());
    }
    
  } catch (error) {
    console.error('Error in checkForNewBookings:', error);
  }
}

function getBookingUpdateMessage(booking) {
  switch (booking.status) {
    case 'confirmed':
      return `Booking with ${booking.customerName} is confirmed for ${booking.date}.`;
    case 'cancelled':
      return `Booking with ${booking.customerName} has been cancelled.`;
    case 'completed':
      return `Booking with ${booking.customerName} is marked as completed.`;
    default:
      return `Booking update for ${booking.customerName}.`;
  }
}

// Booking check timestamp helpers (similar to message helpers)
async function getLastBookingCheck(therapistId) {
  try {
    // For simplicity, using a timestamp from 1 hour ago as default
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    // In a real implementation, you'd use IndexedDB to store/retrieve this
    // For now, return a reasonable default
    return oneHourAgo;
  } catch (error) {
    console.error('Error getting last booking check:', error);
    return Date.now() - (60 * 60 * 1000); // 1 hour ago
  }
}

async function setLastBookingCheck(therapistId, timestamp) {
  try {
    // In a real implementation, you'd store this in IndexedDB
    // For now, we'll just log it
    console.log(`📝 Last booking check updated for ${therapistId}: ${new Date(timestamp)}`);
  } catch (error) {
    console.error('Error setting last booking check:', error);
  }
}

// Background message checking functions
function startBackgroundMessageCheck(therapistId, checkInterval = 30000) {
  console.log(`🔄 Starting background message check for therapist ${therapistId}`);
  
  currentTherapistId = therapistId;
  
  // Clear existing interval if any
  if (messageCheckInterval) {
    clearInterval(messageCheckInterval);
  }
  
  // Start checking for messages
  messageCheckInterval = setInterval(async () => {
    try {
      await checkForNewMessages(therapistId);
    } catch (error) {
      console.error('Error checking for messages:', error);
    }
  }, checkInterval);
  
  // Also check immediately
  checkForNewMessages(therapistId);
}

function stopBackgroundMessageCheck() {
  console.log('⏹️ Stopping background message check');
  
  if (messageCheckInterval) {
    clearInterval(messageCheckInterval);
    messageCheckInterval = null;
  }
  currentTherapistId = null;
}

async function checkForNewMessages(therapistId) {
  try {
    // Get last check timestamp from IndexedDB or localStorage equivalent
    const lastCheck = await getLastMessageCheck(therapistId);
    
    // Make API call to check for new messages
    // Note: You'll need to implement this endpoint in your backend
    const response = await fetch(`/api/therapist/${therapistId}/messages/check?since=${lastCheck}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.warn('Failed to check messages:', response.status);
      return;
    }
    
    const data = await response.json();
    
    if (data.hasNewMessages && data.latestMessage) {
      // Show notification
      await self.registration.showNotification('New Support Message', {
        body: data.latestMessage.content || 'You have a new message from support',
        icon: '/pwa-icon-192.png',
        badge: '/pwa-icon-192.png',
        tag: 'chat-message',
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: {
          type: 'chat-message',
          action: 'open-chat',
          messageId: data.latestMessage.id,
          therapistId: therapistId,
          url: '/?action=open-chat'
        },
        actions: [
          {
            action: 'open-chat',
            title: 'Open Chat'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      });
      
      // Update last check timestamp
      await setLastMessageCheck(therapistId, Date.now());
      
      // Notify any open clients
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'NEW_CHAT_MESSAGE',
          payload: data.latestMessage
        });
      });
    }
    
  } catch (error) {
    console.error('Error in checkForNewMessages:', error);
  }
}

// IndexedDB helpers for storing last check timestamps
async function getLastMessageCheck(therapistId) {
  try {
    // For simplicity, using a timestamp from 1 hour ago as default
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    // In a real implementation, you'd use IndexedDB to store/retrieve this
    // For now, return a reasonable default
    return oneHourAgo;
  } catch (error) {
    console.error('Error getting last message check:', error);
    return Date.now() - (60 * 60 * 1000); // 1 hour ago
  }
}

async function setLastMessageCheck(therapistId, timestamp) {
  try {
    // In a real implementation, you'd store this in IndexedDB
    // For now, we'll just log it
    console.log(`📝 Last message check updated for ${therapistId}: ${new Date(timestamp)}`);
  } catch (error) {
    console.error('Error setting last message check:', error);
  }
}
