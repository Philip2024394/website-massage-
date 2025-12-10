# 📱 Chat System Integration Guide - Complete Implementation

## 🎯 Overview

This guide shows how to integrate the ChatWindow component into provider dashboards (Therapist, Massage Place, Facial Place) and MessageCenter into Admin dashboard.

---

## ✅ What's Already Created:

1. **Messaging Service** (`lib/appwriteService.ts`)
   - Send/receive messages
   - Real-time subscriptions  
   - Unread counts
   - Conversation management

2. **ChatWindow Component** (`components/ChatWindow.tsx`)
   - Lightweight floating chat
   - Opens on booking confirmation
   - Shows customer WhatsApp + name
   - Real-time messaging
   - Push notifications
   - Sound alerts
   - Unread badge

3. **MessageCenter Component** (`components/MessageCenter.tsx`)
   - Full conversation list
   - Multi-user chat management
   - For admin dashboard

---

## 🔧 Step 1: Create Appwrite Messages Collection

### In Appwrite Console:

1. Go to **Databases** → Your Database → **Create Collection**
2. Collection Name: `messages`
3. Collection ID: `messages_collection_id`

### Add These Attributes:

| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| `conversationId` | String | 255 | ✅ Yes | - |
| `senderId` | String | 255 | ✅ Yes | - |
| `senderRole` | String | 50 | ✅ Yes | - |
| `senderName` | String | 255 | ✅ Yes | - |
| `receiverId` | String | 255 | ✅ Yes | - |
| `receiverRole` | String | 50 | ✅ Yes | - |
| `receiverName` | String | 255 | ✅ Yes | - |
| `message` | String | 10000 | ✅ Yes | - |
| `messageType` | String | 50 | ✅ Yes | `text` |
| `bookingId` | String | 255 | ❌ No | - |
| `imageUrl` | String | 500 | ❌ No | - |
| `fileUrl` | String | 500 | ❌ No | - |
| `isRead` | Boolean | - | ✅ Yes | `false` |
| `readAt` | DateTime | - | ❌ No | - |
| `isDelivered` | Boolean | - | ✅ Yes | `false` |
| `deliveredAt` | DateTime | - | ❌ No | - |
| `metadata` | String (JSON) | 5000 | ❌ No | `{}` |

### Create Indexes:

1. **idx_conversation**: `conversationId` (ASC), `$createdAt` (DESC)
2. **idx_sender**: `senderId` (ASC), `$createdAt` (DESC)
3. **idx_receiver**: `receiverId` (ASC), `isRead` (ASC), `$createdAt` (DESC)
4. **idx_booking**: `bookingId` (ASC), `$createdAt` (DESC)

### Set Permissions:

**Document Security:**
```javascript
// Read: Users can read messages where they are sender OR receiver
Permission.read(Role.user('[senderId]'))
Permission.read(Role.user('[receiverId]'))
Permission.read(Role.label('admin'))

// Create: Users can create messages where they are sender
Permission.create(Role.user('[senderId]'))

// Update: Sender and receiver can update (for read status)
Permission.update(Role.user('[senderId]'))
Permission.update(Role.user('[receiverId]'))

// Delete: Only admin
Permission.delete(Role.label('admin'))
```

---

## 🔧 Step 2: Update Appwrite Config

File: `lib/appwrite.config.ts`

Already done! The config has:
```typescript
messages: 'messages_collection_id'
```

Just make sure the collection ID in Appwrite matches.

---

## 🔧 Step 3: Add Notification Sound

Create file: `public/notification.mp3`

Download a notification sound (e.g., from https://notificationsounds.com) and save it as `public/notification.mp3`.

Or use this simple beep sound URL:
```
https://actions.google.com/sounds/v1/alarms/beep_short.ogg
```

---

## 🔧 Step 4: Integrate into Therapist Dashboard

File: `pages/TherapistPortalPage.tsx`

### Add imports:
```typescript
import ChatWindow from '../components/ChatWindow';
import { messagingService } from '../lib/appwriteService';
```

### Add state (after existing useState declarations):
```typescript
// Chat state
const [chatOpen, setChatOpen] = useState(false);
const [activeBooking, setActiveBooking] = useState<any>(null);
const [unreadCount, setUnreadCount] = useState(0);
```

### Add effect to load unread count:
```typescript
useEffect(() => {
    if (therapist?.$id) {
        loadUnreadCount();
        
        // Subscribe to new messages
        const unsubscribe = messagingService.subscribeToUserMessages(
            therapist.$id,
            (message) => {
                if (message.receiverId === therapist.$id && !message.isRead) {
                    setUnreadCount(prev => prev + 1);
                    
                    // Play sound
                    const audio = new Audio('/notification.mp3');
                    audio.play().catch(err => console.log('Audio play failed:', err));
                    
                    // Show browser notification
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('New message', {
                            body: message.message,
                            icon: '/icon-192.png'
                        });
                    }
                }
            }
        );
        
        return () => unsubscribe && unsubscribe();
    }
}, [therapist]);

const loadUnreadCount = async () => {
    if (!therapist?.$id) return;
    const count = await messagingService.getUnreadCount(therapist.$id);
    setUnreadCount(count);
};
```

### Add floating chat button (add to JSX, near bottom of return statement):
```typescript
{/* Floating Chat Button */}
{unreadCount > 0 && !chatOpen && (
    <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition-all transform hover:scale-110 z-40"
    >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {unreadCount}
        </span>
    </button>
)}

{/* Chat Window - Opens when provider gets booking */}
{chatOpen && activeBooking && (
    <ChatWindow
        providerId={therapist?.$id || ''}
        providerRole="therapist"
        providerName={therapist?.name || ''}
        customerId={activeBooking.customerId}
        customerName={activeBooking.customerName}
        customerWhatsApp={activeBooking.customerWhatsApp}
        bookingId={activeBooking.$id}
        bookingDetails={{
            date: activeBooking.date,
            duration: activeBooking.duration,
            price: activeBooking.price
        }}
        isOpen={chatOpen}
        onClose={() => {
            setChatOpen(false);
            loadUnreadCount();
        }}
    />
)}
```

---

## 🔧 Step 5: Integrate into Place Dashboards

File: `pages/PlaceDashboardPage.tsx` (and create similar for Facial Places)

Same implementation as therapist, but change:
```typescript
providerRole="place"  // Instead of "therapist"
```

---

## 🔧 Step 6: Integrate into Admin Dashboard

File: `src/apps/admin/pages/AdminDashboardPage.tsx`

### Add imports:
```typescript
import MessageCenter from '../../../components/MessageCenter';
```

### Add to navigation tabs:
```typescript
const tabs = [
    'Overview',
    'Therapists',
    'Places',
    'Messages',  // ← ADD THIS
    'Settings'
];
```

### Add Messages tab content:
```typescript
{activeTab === 'Messages' && (
    <div className="bg-white rounded-lg shadow p-6">
        <MessageCenter
            currentUserId={user.$id}
            currentUserRole="admin"
            currentUserName={user.name || 'Admin'}
        />
    </div>
)}
```

---

## 🔧 Step 7: Add Automatic Booking Notifications

File: `lib/appwriteService.ts`

Find the booking service methods and add message triggers:

### When Booking is Created:
```typescript
// In createBooking method, after booking is created:
await messagingService.sendSystemMessage({
    receiverId: therapistId,
    receiverRole: 'therapist',
    receiverName: therapistName,
    message: `🎉 New booking from ${customerName}!\n\n📅 Date: ${bookingDate}\n⏱️ Duration: ${duration} min\n💰 Price: Rp ${price.toLocaleString()}\n📱 Contact: ${customerWhatsApp}`,
    bookingId: booking.$id,
    metadata: {
        action: 'booking_created',
        customerWhatsApp,
        date: bookingDate,
        duration,
        price
    }
});
```

### When Booking is Accepted:
```typescript
// In acceptBooking method, after booking status is updated:
await messagingService.sendSystemMessage({
    receiverId: customerId,
    receiverRole: 'customer',
    receiverName: customerName,
    message: `✅ Your booking has been confirmed!\n\n${therapistName} will contact you shortly.\n📱 WhatsApp: ${therapistWhatsApp}\n📅 Date: ${bookingDate}\n⏱️ Duration: ${duration} min`,
    bookingId: bookingId,
    metadata: {
        action: 'booking_accepted',
        therapistWhatsApp,
        date: bookingDate,
        duration
    }
});
```

### When Booking is Declined:
```typescript
// In declineBooking method:
await messagingService.sendSystemMessage({
    receiverId: customerId,
    receiverRole: 'customer',
    receiverName: customerName,
    message: `❌ Unfortunately, your booking request could not be fulfilled.\n\nWe're finding an alternative provider for you. You'll be notified within 5 minutes.`,
    bookingId: bookingId,
    metadata: {
        action: 'booking_declined'
    }
});
```

---

## 🔧 Step 8: Setup Push Notifications (Firebase)

### 1. Create Firebase Project:
- Go to https://console.firebase.google.com
- Create new project
- Add web app

### 2. Get Firebase Config:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Create Firebase service:

File: `lib/firebase.ts`
```typescript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
    // Your config here
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: 'YOUR_VAPID_KEY'
            });
            console.log('FCM Token:', token);
            return token;
        }
    } catch (error) {
        console.error('Notification permission error:', error);
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });
```

### 4. Create service worker:

File: `public/firebase-messaging-sw.js`
```javascript
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    // Your config here
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192.png',
        badge: '/badge-72.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
```

---

## 🔧 Step 9: Setup PWA Manifest

File: `public/manifest.json`
```json
{
    "name": "IndaStreet Provider",
    "short_name": "IndaStreet",
    "description": "Message your customers directly",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#4F46E5",
    "icons": [
        {
            "src": "/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
```

Add to `index.html`:
```html
<link rel="manifest" href="/manifest.json">
```

---

## ✅ Testing Checklist

- [ ] Appwrite messages collection created
- [ ] Indexes added for performance
- [ ] Permissions set correctly
- [ ] Notification sound file added (`/public/notification.mp3`)
- [ ] ChatWindow integrated into therapist dashboard
- [ ] ChatWindow integrated into place dashboards  
- [ ] MessageCenter integrated into admin dashboard
- [ ] Automatic messages trigger on booking create/accept/decline
- [ ] Browser notifications work
- [ ] Sound plays on new message
- [ ] Unread badge shows correct count
- [ ] Chat window opens/closes properly
- [ ] Messages send/receive in real-time
- [ ] Firebase push notifications configured
- [ ] PWA manifest created
- [ ] App installs on mobile devices

---

## 🎯 User Flow:

### For Providers (Therapist/Place):
1. Customer confirms booking → Automatic system message sent
2. Red badge appears on chat icon with unread count
3. Sound plays + browser notification shows
4. Provider clicks chat icon → ChatWindow opens
5. Provider sees customer WhatsApp number + name
6. Provider can message customer directly
7. When provider opens chat, messages marked as read
8. Badge count updates automatically

### For Customers:
1. Booking accepted → Automatic confirmation message
2. Can chat with provider directly
3. Get push notifications on mobile

### For Admin:
1. Full MessageCenter with all conversations
2. Can monitor and participate in any conversation
3. See system messages and booking notifications

---

## 📱 Mobile PWA Features:

- **Install prompt** - "Add to Home Screen"
- **Offline support** - Works without internet (cached)
- **Push notifications** - Even when app is closed
- **Badge counter** - Shows unread count on app icon
- **Sound alerts** - Notification sound plays
- **Full screen** - Opens like native app

---

## 🚀 Next Steps:

1. Create the Appwrite collection
2. Add notification sound file
3. Copy-paste the code snippets into each dashboard
4. Test messaging between provider and customer
5. Setup Firebase for production push notifications
6. Configure PWA for mobile installation

---

**Everything is ready to integrate!** Just follow the steps above and your chat system will be fully operational. 🎉
