/**
 * PUSH NOTIFICATION SERVICE
 * Web Push Notifications for Booking + Chat System
 * 
 * Purpose: Enable real-time notifications even when app is closed or tab inactive
 * Backend: Appwrite (push_subscriptions collection)
 * Technology: Web Push API, Service Workers, VAPID
 * 
 * ZERO REGRESSIONS: Extends existing notification system only
 */

import { databases, ID, Query } from './appwrite';

// VAPID public key (must match server-side private key)
// Generated: 2026-01-06
const VAPID_PUBLIC_KEY = (import.meta as any)?.env?.VITE_VAPID_PUBLIC_KEY || '';

// Collection ID for push subscriptions (must exist in Appwrite)
const PUSH_SUBSCRIPTIONS_COLLECTION_ID = 'push_subscriptions';
const DATABASE_ID = 'main';

// Database ID from appwrite.config.ts
const APPWRITE_DATABASE_ID = '68f76ee1000e64ca8d05';

// Subscription status types
export type SubscriptionStatus = 'active' | 'revoked' | 'expired' | 'blocked';
export type DeviceType = 'mobile' | 'desktop' | 'tablet';
export type Platform = 'web' | 'android' | 'ios' | 'desktop';
export type SubscriptionType = 'customer' | 'therapist' | 'admin';

// Appwrite schema interface (matches actual collection)
interface PushSubscriptionDocument {
  subscriptionId: number;
  userId: number; // INTEGER in Appwrite
  subscriptionType: SubscriptionType;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string; // ISO datetime
  updatedAt?: string; // ISO datetime, nullable
  subscriptionDate: string; // ISO datetime
  providerId: number; // Push service provider (1=Web Push API)
  endpoint: string;
  p256dh: string;
  auth: string;
  devicetype: DeviceType;
  userAgent: string;
  platform: Platform;
}

// Cooldown map to prevent duplicate push subscriptions
const subscriptionCooldown = new Map<string, number>();
const COOLDOWN_DURATION = 5000; // 5 seconds

// Track if service worker is registered
let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

/**
 * Convert base64 VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  // Ensure we return a proper Uint8Array with ArrayBuffer
  return new Uint8Array(outputArray);
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Get current notification permission state
 */
export function getPermissionState(): NotificationPermission {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Request notification permission from user
 * Returns: 'granted' | 'denied' | 'default'
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    console.warn('🚫 Push notifications not supported in this browser');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log(`🔔 Notification permission: ${permission}`);
    return permission;
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * Register service worker for push notifications
 * ONLY IN PRODUCTION - Development mode skips registration to avoid cache issues
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  // 🔥 SKIP in development to prevent stale cache
  if (import.meta.env.DEV) {
    console.log('⚠️ DEV MODE: Skipping service worker registration');
    return null;
  }

  if (!isPushSupported()) {
    console.warn('🚫 Service workers not supported');
    return null;
  }

  try {
    // Check if already registered
    if (serviceWorkerRegistration) {
      console.log('✅ Service worker already registered');
      return serviceWorkerRegistration;
    }

    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none' // 🔥 Prevent service worker caching
    });

    console.log('✅ Service worker registered successfully:', registration.scope);
    serviceWorkerRegistration = registration;

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;
    console.log('✅ Service worker ready');

    return registration;
  } catch (error) {
    console.error('❌ Service worker registration failed:', error);
    return null;
  }
}

/**
 * Subscribe user to push notifications (VAPID)
 */
export async function subscribeToPush(
  userId: string,
  role: SubscriptionType
): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.warn('🚫 Push not supported');
    return null;
  }

  // Check permission
  const permission = getPermissionState();
  if (permission !== 'granted') {
    console.warn('🚫 Push permission not granted');
    return null;
  }

  // Check cooldown
  const cooldownKey = `${userId}_${role}`;
  const lastSubscription = subscriptionCooldown.get(cooldownKey);
  if (lastSubscription && Date.now() - lastSubscription < COOLDOWN_DURATION) {
    console.log('🔇 Subscription cooldown active, skipping');
    return null;
  }

  try {
    // Register service worker first
    const registration = await registerServiceWorker();
    if (!registration) {
      console.error('❌ Service worker registration failed');
      return null;
    }

    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('✅ Already subscribed to push notifications');
      
      // Store/update in Appwrite
      await storePushSubscription(userId, role, existingSubscription);
      
      subscriptionCooldown.set(cooldownKey, Date.now());
      return existingSubscription;
    }

    // Validate VAPID key before subscribing
    if (!VAPID_PUBLIC_KEY) {
      throw new Error('VAPID public key not configured. Check VITE_VAPID_PUBLIC_KEY in environment variables.');
    }
    
    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource
    });

    console.log('✅ Subscribed to push notifications:', subscription.endpoint);

    // Store in Appwrite
    await storePushSubscription(userId, role, subscription);

    subscriptionCooldown.set(cooldownKey, Date.now());
    return subscription;
  } catch (error) {
    console.error('❌ Push subscription failed:', error);
    return null;
  }
}

/**
 * Detect device type from user agent
 */
function getDeviceType(): DeviceType {
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Detect platform from user agent
 */
function getPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('android')) return 'android';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'ios';
  return 'web';
}

/**
 * Store push subscription in Appwrite
 * CRITICAL: Uses endpoint as unique identifier, not $id
 * 
 * Flow:
 * 1. Query by endpoint (unique check)
 * 2. If exists → update document (reactivate if revoked)
 * 3. If not → create new document
 */
async function storePushSubscription(
  userId: string, // Accept as string from auth system
  role: SubscriptionType,
  subscription: PushSubscription
): Promise<void> {
  try {
    const subscriptionObject = subscription.toJSON();
    
    if (!subscriptionObject.endpoint || !subscriptionObject.keys) {
      console.error('❌ Invalid subscription object');
      return;
    }

    const now = new Date().toISOString();
    
    // Prepare subscription data matching Appwrite schema
    const subscriptionData: any = {
      subscriptionId: Math.floor(Math.random() * 1000000) + 1, // Random number 1-1,000,000 (Appwrite limit)
      userId: userId || null, // String type in Appwrite (nullable)
      subscriptionType: role,
      subscriptionStatus: 'active' as SubscriptionStatus,
      createdAt: now,
      updatedAt: now,
      subscriptionDate: now,
      providerId: 1, // 1 = Web Push API (hardcoded for now)
      endpoint: subscriptionObject.endpoint,
      p256dh: subscriptionObject.keys.p256dh || '',
      auth: subscriptionObject.keys.auth || '',
      devicetype: getDeviceType(),
      userAgent: navigator.userAgent.substring(0, 512),
      platform: getPlatform()
    }

    // Query by endpoint (unique identifier)
    const existingSubscriptions = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      PUSH_SUBSCRIPTIONS_COLLECTION_ID,
      [
        Query.equal('endpoint', [subscriptionData.endpoint])
      ]
    );

    if (existingSubscriptions.total > 0) {
      // Update existing subscription
      const existingDoc = existingSubscriptions.documents[0];
      const docId = existingDoc.$id;
      
      // Reactivate if was revoked/expired
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        PUSH_SUBSCRIPTIONS_COLLECTION_ID,
        docId,
        {
          ...subscriptionData,
          subscriptionStatus: 'active' // Reactivate
        }
      );
      console.log(`✅ Push subscription updated (reactivated): ${docId}`);
    } else {
      // Create new subscription
      const newDoc = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        PUSH_SUBSCRIPTIONS_COLLECTION_ID,
        ID.unique(),
        subscriptionData
      );
      console.log(`✅ Push subscription created: ${newDoc.$id}`);
    }
  } catch (error) {
    console.error('❌ Failed to store push subscription:', error);
    // Fail silently - user can still use app
  }
}

/**
 * Revoke push subscription (mark as revoked, keep audit trail)
 * Called on logout or when user manually disables notifications
 */
export async function revokePushSubscription(): Promise<boolean> {
  if (!serviceWorkerRegistration) {
    console.warn('🚫 No service worker registration found');
    return false;
  }

  try {
    const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    if (!subscription) {
      console.log('ℹ️ No active push subscription');
      return true;
    }

    const subscriptionObject = subscription.toJSON();
    const endpoint = subscriptionObject.endpoint;

    if (!endpoint) {
      console.error('❌ No endpoint found in subscription');
      return false;
    }

    // Mark as revoked in Appwrite (keep for audit trail)
    try {
      const existingSubscriptions = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        PUSH_SUBSCRIPTIONS_COLLECTION_ID,
        [
          Query.equal('endpoint', [endpoint])
        ]
      );

      if (existingSubscriptions.total > 0) {
        const docId = existingSubscriptions.documents[0].$id;
        await databases.updateDocument(
          APPWRITE_DATABASE_ID,
          PUSH_SUBSCRIPTIONS_COLLECTION_ID,
          docId,
          {
            subscriptionStatus: 'revoked' as SubscriptionStatus,
            updatedAt: new Date().toISOString()
          }
        );
        console.log(`✅ Push subscription revoked in Appwrite: ${docId}`);
      }
    } catch (dbError) {
      console.error('❌ Failed to update subscription status:', dbError);
    }

    // Unsubscribe from browser
    const success = await subscription.unsubscribe();
    if (success) {
      console.log('✅ Unsubscribed from push notifications');
    }
    return success;
  } catch (error) {
    console.error('❌ Revoke subscription failed:', error);
    return false;
  }
}

/**
 * Mark subscription as expired (when push service returns 410 Gone)
 * Called automatically when push delivery fails with 410/404
 */
export async function markSubscriptionExpired(endpoint: string): Promise<void> {
  try {
    const existingSubscriptions = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      PUSH_SUBSCRIPTIONS_COLLECTION_ID,
      [
        Query.equal('endpoint', [endpoint])
      ]
    );

    if (existingSubscriptions.total > 0) {
      const docId = existingSubscriptions.documents[0].$id;
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        PUSH_SUBSCRIPTIONS_COLLECTION_ID,
        docId,
        {
          subscriptionStatus: 'expired' as SubscriptionStatus,
          updatedAt: new Date().toISOString()
        }
      );
      console.log(`✅ Push subscription marked as expired: ${docId}`);
    }
  } catch (error) {
    console.error('❌ Failed to mark subscription as expired:', error);
  }
}

/**
 * Block subscription (spam prevention or abuse)
 */
export async function blockSubscription(endpoint: string): Promise<void> {
  try {
    const existingSubscriptions = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      PUSH_SUBSCRIPTIONS_COLLECTION_ID,
      [
        Query.equal('endpoint', [endpoint])
      ]
    );

    if (existingSubscriptions.total > 0) {
      const docId = existingSubscriptions.documents[0].$id;
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        PUSH_SUBSCRIPTIONS_COLLECTION_ID,
        docId,
        {
          subscriptionStatus: 'blocked' as SubscriptionStatus,
          updatedAt: new Date().toISOString()
        }
      );
      console.log(`✅ Push subscription blocked: ${docId}`);
    }
  } catch (error) {
    console.error('❌ Failed to block subscription:', error);
  }
}

/**
 * Unsubscribe from push notifications (legacy function - use revokePushSubscription instead)
 * @deprecated Use revokePushSubscription() for proper audit trail
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  return revokePushSubscription();
}

/**
 * Check if user is currently subscribed to push
 */
export async function isSubscribedToPush(): Promise<boolean> {
  if (!isPushSupported()) return false;
  if (!serviceWorkerRegistration) return false;

  try {
    const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    console.error('❌ Failed to check subscription:', error);
    return false;
  }
}

/**
 * Send push notification (server-side trigger)
 * NOTE: This is a client-side placeholder for documentation.
 * Actual push sending MUST happen server-side via Appwrite functions or webhook.
 * 
 * Server implementation should:
 * 1. Listen for booking.status changes (Appwrite webhook)
 * 2. Query push_subscriptions by userId + role
 * 3. Send push via Web Push protocol (VAPID)
 * 4. Use systemNotificationMapper for consistent messaging
 */
export function getPushPayloadForStatus(
  status: string,
  bookingId: string,
  role: 'customer' | 'therapist' | 'admin'
): object {
  // This will be used by server-side push sender
  return {
    type: 'booking_status_change',
    status,
    bookingId,
    role,
    timestamp: Date.now()
  };
}

/**
 * Initialize push notifications on app load
 * Call this once per session (e.g., in App.tsx or ChatWindow.tsx)
 */
export async function initializePushNotifications(
  userId: string,
  role: SubscriptionType
): Promise<boolean> {
  if (!isPushSupported()) {
    console.warn('🚫 Push notifications not supported');
    return false;
  }

  try {
    // Check if permission already granted
    const currentPermission = getPermissionState();
    
    if (currentPermission === 'granted') {
      // Auto-subscribe
      console.log('✅ Push permission already granted, subscribing...');
      const subscription = await subscribeToPush(userId, role);
      return subscription !== null;
    } else if (currentPermission === 'default') {
      // Don't auto-request on load - wait for user action
      console.log('ℹ️ Push permission not yet requested');
      return false;
    } else {
      // Denied
      console.log('🚫 Push permission denied by user');
      return false;
    }
  } catch (error) {
    console.error('❌ Push initialization failed:', error);
    return false;
  }
}

/**
 * Request permission and subscribe (user-initiated)
 * Use this when user clicks "Enable Notifications" button
 */
export async function enablePushNotifications(
  userId: string,
  role: SubscriptionType
): Promise<boolean> {
  try {
    // Request permission
    const permission = await requestNotificationPermission();
    
    if (permission !== 'granted') {
      console.warn('🚫 User denied notification permission');
      return false;
    }

    // Subscribe
    const subscription = await subscribeToPush(userId, role);
    
    if (subscription) {
      console.log('✅ Push notifications enabled successfully');
      return true;
    } else {
      console.error('❌ Subscription failed despite permission granted');
      return false;
    }
  } catch (error) {
    console.error('❌ Enable push notifications failed:', error);
    return false;
  }
}

/**
 * Show test notification (debugging only)
 */
export async function showTestNotification(): Promise<void> {
  if (getPermissionState() !== 'granted') {
    console.warn('🚫 Cannot show test notification - permission not granted');
    return;
  }

  try {
    const registration = await registerServiceWorker();
    if (!registration) {
      console.error('❌ Service worker not registered');
      return;
    }

    await registration.showNotification('Test Notification', {
      body: 'Push notifications are working! 🎉',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: 'test-notification',
      requireInteraction: false
    });

    console.log('✅ Test notification shown');
  } catch (error) {
    console.error('❌ Test notification failed:', error);
  }
}

/**
 * Check if tab is currently visible
 * Used to decide whether to send push or just show in-app notification
 */
export function isTabVisible(): boolean {
  return document.visibilityState === 'visible';
}

/**
 * Trigger push notification for booking status change
 * NOTE: In production, this should be handled server-side via Appwrite webhook
 * This client-side version is for immediate local notifications only
 */
export async function triggerLocalNotification(
  title: string,
  body: string,
  bookingId: string,
  priority: 'low' | 'normal' | 'high' | 'critical'
): Promise<void> {
  // Only show if tab is NOT visible
  if (isTabVisible()) {
    console.log('🔕 Tab visible, skipping local notification');
    return;
  }

  if (getPermissionState() !== 'granted') {
    console.warn('🚫 Cannot show notification - permission not granted');
    return;
  }

  try {
    const registration = await registerServiceWorker();
    if (!registration) {
      console.error('❌ Service worker not registered');
      return;
    }

    // Vibration pattern based on priority
    const vibrationPatterns = {
      low: [100],
      normal: [200],
      high: [200, 100, 200],
      critical: [300, 100, 300, 100, 300]
    };

    await registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: `booking-${bookingId}`,
      requireInteraction: priority === 'critical',
      data: {
        bookingId,
        url: `/chat?bookingId=${bookingId}`
      }
    });

    console.log(`✅ Local notification shown: ${title}`);
  } catch (error) {
    console.error('❌ Local notification failed:', error);
  }
}
