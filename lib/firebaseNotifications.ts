// Firebase Cloud Messaging Integration
// Handles push notifications for booking alerts

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

class FirebaseNotificationService {
  private app: any;
  private messaging: any;
  private currentToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeFirebase();
    }
  }

  private initializeFirebase() {
    try {
      this.app = initializeApp(firebaseConfig);
      this.messaging = getMessaging(this.app);
      console.log('🔥 Firebase initialized for push notifications');
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
    }
  }

  /**
   * Request notification permission and get FCM token
   */
  async requestPermissionAndGetToken(): Promise<string | null> {
    if (!this.messaging) {
      console.error('❌ Firebase messaging not initialized');
      return null;
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');

        // Get FCM token
        const token = await getToken(this.messaging, {
          vapidKey: 'YOUR_VAPID_KEY' // Get from Firebase Console > Project Settings > Cloud Messaging
        });

        if (token) {
          console.log('🔑 FCM Token:', token);
          this.currentToken = token;
          
          // Save token to user's profile in Appwrite
          await this.saveTokenToProfile(token);
          
          return token;
        } else {
          console.warn('⚠️ No FCM token available');
          return null;
        }
      } else {
        console.warn('⚠️ Notification permission denied');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Save FCM token to user's profile in Appwrite
   */
  private async saveTokenToProfile(token: string): Promise<void> {
    try {
      // Import dynamically to avoid circular dependency
      const { databases, account } = await import('./appwrite');
      const { APPWRITE_CONFIG } = await import('./appwrite.config');

      // Get current user
      const user = await account.get();
      
      // Find user's therapist or place document
      const therapistsCollection = APPWRITE_CONFIG.collections.therapists;
      const placesCollection = APPWRITE_CONFIG.collections.places;

      // Try to update therapist document
      try {
        const therapists = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          therapistsCollection,
          [`email=${user.email}`]
        );

        if (therapists.documents.length > 0) {
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            therapistsCollection,
            therapists.documents[0].$id,
            { fcmToken: token }
          );
          console.log('✅ FCM token saved to therapist profile');
          return;
        }
      } catch (e) {
        console.log('Not a therapist account');
      }

      // Try to update place document
      try {
        const places = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          placesCollection,
          [`email=${user.email}`]
        );

        if (places.documents.length > 0) {
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            placesCollection,
            places.documents[0].$id,
            { fcmToken: token }
          );
          console.log('✅ FCM token saved to place profile');
        }
      } catch (e) {
        console.log('Not a place account');
      }
    } catch (error) {
      console.error('❌ Failed to save FCM token:', error);
    }
  }

  /**
   * Listen for foreground messages (when app is open)
   */
  setupForegroundListener() {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      console.log('🔔 Foreground message received:', payload);

      // Play notification sound
      const { notificationSound } = require('./notificationSound');
      notificationSound.playBookingAlert();

      // Show notification
      if (Notification.permission === 'granted') {
        new Notification(payload.notification?.title || 'New Booking!', {
          body: payload.notification?.body || 'You have a new booking request',
          icon: '/logo.png',
          badge: '/logo.png',
          tag: 'booking-alert',
          requireInteraction: true,
          data: payload.data
        });
      }

      // Open booking response popup if app is open
      const bookingId = payload.data?.bookingId;
      if (bookingId && (window as any).openBookingResponsePopup) {
        (window as any).openBookingResponsePopup(bookingId);
      }
    });
  }

  /**
   * Get current FCM token
   */
  getCurrentToken(): string | null {
    return this.currentToken;
  }
}

// Create singleton instance
export const firebaseNotificationService = new FirebaseNotificationService();

// Setup service worker listener for background sound
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'PLAY_NOTIFICATION_SOUND') {
      const { notificationSound } = require('./notificationSound');
      notificationSound.playBookingAlert();
    }
  });
}
