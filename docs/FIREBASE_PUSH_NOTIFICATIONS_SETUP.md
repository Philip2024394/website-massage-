# Firebase Cloud Messaging Setup Guide

## 🔥 Firebase Push Notifications for Lock Screen & Background

This enables notifications to work even when:
- ✅ Phone is locked
- ✅ App is closed
- ✅ User is in another app
- ✅ Phone is in Do Not Disturb mode (with sound)

---

## Setup Steps:

### 1. Create Firebase Project

1. Go to: https://console.firebase.google.com/
2. Click "Add project"
3. Enter project name: `indastreet-massage`
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Add Web App to Firebase

1. In Firebase Console, click ⚙️ (Settings) > Project settings
2. Scroll down to "Your apps" section
3. Click the Web icon `</>`
4. Register app name: `Indastreet Massage Web`
5. Check "Also set up Firebase Hosting"
6. Click "Register app"

### 3. Get Firebase Configuration

Copy the configuration object that looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 4. Enable Cloud Messaging

1. In Firebase Console, go to: Build > Cloud Messaging
2. Click on "Get started" if prompted
3. Go to "Cloud Messaging API (Legacy)" - ENABLE IT
4. Go to "Web configuration" tab
5. Click "Generate key pair" under "Web Push certificates"
6. Copy the VAPID key (starts with `B...`)

### 5. Update Your Code

Replace placeholders in these files:

#### **firebase-messaging-sw.js** (lines 8-14):
```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

#### **lib/firebaseNotifications.ts** (lines 7-13 and line 44):
```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  // ... same as above
};

// Line 44:
vapidKey: 'YOUR_ACTUAL_VAPID_KEY' // The key you generated in step 4
```

### 6. Update Appwrite Schema

Add `fcmToken` field to both collections:

**Therapists Collection:**
- Field: `fcmToken`
- Type: String
- Size: 500
- Required: No

**Places Collection:**
- Field: `fcmToken`
- Type: String
- Size: 500
- Required: No

### 7. Install Firebase in Your Project

Run this command in your terminal:

```bash
npm install firebase
```

### 8. Initialize in App.tsx

The initialization is already added. Just verify these lines exist:

```typescript
import { firebaseNotificationService } from './lib/firebaseNotifications';

// In useEffect:
firebaseNotificationService.requestPermissionAndGetToken();
firebaseNotificationService.setupForegroundListener();
```

### 9. Send Push Notifications from Backend

When a booking is created, send push notification using Firebase Admin SDK or REST API:

**REST API Example (from your backend):**

```javascript
const sendPushNotification = async (fcmToken, bookingData) => {
  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'key=YOUR_SERVER_KEY' // Get from Firebase Console
    },
    body: JSON.stringify({
      to: fcmToken,
      notification: {
        title: '🚨 NEW BOOKING REQUEST!',
        body: `${bookingData.customerName} wants a ${bookingData.duration}min massage`,
        icon: '/logo.png',
        click_action: `https://your-domain.com/accept-booking/${bookingData.bookingId}`
      },
      data: {
        bookingId: bookingData.bookingId,
        customerName: bookingData.customerName,
        duration: bookingData.duration,
        price: bookingData.price
      }
    })
  });
  
  return response.json();
};
```

### 10. Test Push Notifications

1. Open app in browser
2. Allow notification permission
3. Check console for FCM token
4. Use Firebase Console > Cloud Messaging > "Send test message"
5. Paste your FCM token
6. Send notification
7. Lock your phone - notification should still appear!

---

## How It Works:

1. **Service Worker** (`firebase-messaging-sw.js`) runs in background
2. When booking created → Backend sends push via FCM
3. FCM delivers to device even if app is closed
4. Service worker receives message
5. Shows notification with Accept/Reject buttons
6. Plays sound (persistent loop until acknowledged)
7. Clicking notification opens app to accept-booking page
8. Accept/Reject stops the sound

---

## Troubleshooting:

**Notifications not working?**
- Check browser console for errors
- Verify Firebase config is correct
- Ensure VAPID key is set
- Check notification permission is granted
- Verify service worker is registered
- Test with Firebase Console test message first

**Sound not playing?**
- Check browser allows autoplay
- Verify MP3 file path is correct
- Test with: `window.playBookingNotification()`

---

## Next Steps:

After setup, integrate with your booking system:
1. Save FCM token to Appwrite when user logs in
2. When booking created, get therapist's FCM token from database
3. Send push notification to that token
4. Therapist receives alert even with phone locked!

🎉 **You now have true push notifications!**
