# 📱 WhatsApp Notification & Badge Strategy

## ✅ Smart Decision: WhatsApp Over In-App Chat

**Why WhatsApp is Better:**
- ✅ Everyone in Indonesia already uses it
- ✅ Push notifications work perfectly
- ✅ No need to keep app open
- ✅ Providers can respond instantly
- ✅ Voice messages, photos, location sharing
- ✅ Read receipts and delivery confirmation
- ✅ Works on any device, any network

**What to Remove:**
- ❌ messagingService (not needed - use WhatsApp)
- ❌ In-app chat components (unnecessary complexity)

---

## 🎯 Three-Layer Notification System

### **Layer 1: Home Screen Badge (PWA)**
Red notification badge on app icon when installed to home screen

### **Layer 2: Sound Alerts (In-Dashboard)**
Custom notification sounds for therapists/places in their dashboards

### **Layer 3: WhatsApp Integration**
All critical notifications sent via WhatsApp API

---

## 📱 Layer 1: PWA Badge API Implementation

### **How It Works:**
When users add IndaStreet to home screen, the app icon shows a red badge with unread count.

### **Browser Support:**
- ✅ Chrome/Edge (Android)
- ✅ Safari (iOS 16.4+)
- ⚠️ Firefox (limited)

### **Implementation Code:**

```typescript
// utils/badgeService.ts
export const badgeService = {
    /**
     * Set badge count on home screen app icon
     * Shows red circle with number on PWA icon
     */
    async setBadge(count: number): Promise<void> {
        if ('setAppBadge' in navigator) {
            try {
                if (count > 0) {
                    await (navigator as any).setAppBadge(count);
                    console.log(`✅ Badge set to ${count}`);
                } else {
                    await (navigator as any).clearAppBadge();
                    console.log('✅ Badge cleared');
                }
            } catch (error) {
                console.error('❌ Error setting badge:', error);
            }
        } else {
            console.log('⚠️ Badge API not supported on this browser');
        }
    },

    /**
     * Clear badge from home screen icon
     */
    async clearBadge(): Promise<void> {
        if ('clearAppBadge' in navigator) {
            try {
                await (navigator as any).clearAppBadge();
                console.log('✅ Badge cleared');
            } catch (error) {
                console.error('❌ Error clearing badge:', error);
            }
        }
    },

    /**
     * Increment badge count (for new notification)
     */
    async incrementBadge(): Promise<void> {
        // Get current unread count from Appwrite
        const unreadCount = await this.getUnreadCount();
        await this.setBadge(unreadCount);
    },

    /**
     * Get unread notification count from Appwrite
     */
    async getUnreadCount(): Promise<number> {
        try {
            const providerId = localStorage.getItem('providerId');
            if (!providerId) return 0;

            const unread = await notificationService.getUnread(parseInt(providerId));
            return unread.length;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }
};
```

### **Update manifest.json:**
```json
{
  "name": "IndaStreet",
  "short_name": "IndaStreet",
  "display": "standalone",
  "start_url": "/",
  "scope": "/",
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
  ],
  "theme_color": "#FF6B35",
  "background_color": "#FFFFFF",
  "orientation": "portrait",
  "display_override": ["window-controls-overlay"],
  "prefer_related_applications": false
}
```

### **Integration Points:**
```typescript
// When notification is created
await notificationService.create({...});
await badgeService.incrementBadge(); // Update badge

// When user reads notification
await notificationService.markAsRead(notificationId);
await badgeService.incrementBadge(); // Recalculate badge

// When user opens app
useEffect(() => {
    // Update badge count on app open
    badgeService.incrementBadge();
}, []);
```

---

## 🔊 Layer 2: Sound Notification System

### **Dashboard Sound Alerts for Providers**

**Features:**
- ✅ Custom notification sound for bookings
- ✅ Different sound for messages
- ✅ User preference toggle (on/off)
- ✅ Volume control
- ✅ Desktop notification permission

### **Implementation:**

```typescript
// utils/soundNotificationService.ts
export const soundNotificationService = {
    /**
     * Sound preference stored in localStorage
     */
    getSoundPreference(): boolean {
        const pref = localStorage.getItem('notification_sound_enabled');
        return pref === null ? true : pref === 'true'; // Default ON
    },

    setSoundPreference(enabled: boolean): void {
        localStorage.setItem('notification_sound_enabled', enabled.toString());
    },

    getVolume(): number {
        const vol = localStorage.getItem('notification_volume');
        return vol ? parseFloat(vol) : 0.7; // Default 70%
    },

    setVolume(volume: number): void {
        localStorage.setItem('notification_volume', volume.toString());
    },

    /**
     * Play notification sound
     */
    async playSound(type: 'booking' | 'message' | 'alert'): Promise<void> {
        if (!this.getSoundPreference()) {
            console.log('🔇 Sound notifications disabled by user');
            return;
        }

        try {
            const soundUrls = {
                booking: '/sounds/booking-notification.mp3',
                message: '/sounds/message-notification.mp3',
                alert: '/sounds/alert-notification.mp3'
            };

            const audio = new Audio(soundUrls[type]);
            audio.volume = this.getVolume();
            await audio.play();
            console.log(`🔊 Played ${type} notification sound`);
        } catch (error) {
            console.error('❌ Error playing notification sound:', error);
        }
    },

    /**
     * Show browser notification + sound
     */
    async showNotification(title: string, options: NotificationOptions, soundType: 'booking' | 'message' | 'alert'): Promise<void> {
        // Request permission if not granted
        if (Notification.permission === 'default') {
            await Notification.requestPermission();
        }

        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                vibrate: [200, 100, 200], // Vibration pattern
                requireInteraction: true, // Stays until clicked
                ...options
            });

            // Play sound
            await this.playSound(soundType);

            // Click handler
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        } else {
            console.log('⚠️ Notification permission denied');
        }
    }
};
```

### **Dashboard Settings Component:**

```tsx
// components/dashboard/NotificationSettings.tsx
import React, { useState, useEffect } from 'react';
import { soundNotificationService } from '../../utils/soundNotificationService';

export const NotificationSettings: React.FC = () => {
    const [soundEnabled, setSoundEnabled] = useState(
        soundNotificationService.getSoundPreference()
    );
    const [volume, setVolume] = useState(
        soundNotificationService.getVolume() * 100
    );

    const handleSoundToggle = () => {
        const newState = !soundEnabled;
        setSoundEnabled(newState);
        soundNotificationService.setSoundPreference(newState);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        soundNotificationService.setVolume(newVolume / 100);
    };

    const testSound = () => {
        soundNotificationService.playSound('booking');
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
                🔔 Notification Settings
            </h3>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="font-semibold text-gray-900">
                        Sound Notifications
                    </p>
                    <p className="text-sm text-gray-600">
                        Play sound for new bookings and messages
                    </p>
                </div>
                <button
                    onClick={handleSoundToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        soundEnabled ? 'bg-brand-orange' : 'bg-gray-300'
                    }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>
            </div>

            {/* Volume Control */}
            {soundEnabled && (
                <div className="mb-4">
                    <label className="block font-semibold text-gray-900 mb-2">
                        Volume: {volume}%
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                </div>
            )}

            {/* Test Sound Button */}
            <button
                onClick={testSound}
                disabled={!soundEnabled}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                    soundEnabled
                        ? 'bg-brand-orange text-white hover:bg-orange-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
                Test Sound
            </button>

            {/* WhatsApp Notifications Info */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">
                    📱 WhatsApp Notifications
                </h4>
                <p className="text-sm text-green-800">
                    Critical booking requests and messages are also sent to your WhatsApp number{' '}
                    <span className="font-mono font-semibold">+62{soundNotificationService.getWhatsAppNumber()}</span>.
                    Make sure WhatsApp notifications are enabled on your phone.
                </p>
            </div>
        </div>
    );
};
```

---

## 📲 Layer 3: WhatsApp API Integration

### **Option A: WhatsApp Business API (Official)**

**Requirements:**
- Business verification
- Dedicated phone number
- Monthly cost: ~$40-100 USD
- Setup time: 2-4 weeks

**Providers:**
- Twilio
- MessageBird
- Vonage
- Meta (Facebook)

**Example with Twilio:**
```typescript
// services/whatsappService.ts
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export const whatsappService = {
    async sendNotification(
        to: string, // Provider's WhatsApp number (e.g., "+6281234567890")
        message: string
    ): Promise<void> {
        try {
            await client.messages.create({
                from: 'whatsapp:+14155238886', // Twilio sandbox number
                to: `whatsapp:${to}`,
                body: message
            });
            console.log(`✅ WhatsApp notification sent to ${to}`);
        } catch (error) {
            console.error('❌ Error sending WhatsApp notification:', error);
        }
    },

    async sendBookingNotification(
        providerWhatsApp: string,
        bookingDetails: {
            userName: string;
            service: string;
            startTime: string;
            bookingId: string;
        }
    ): Promise<void> {
        const message = `
🔔 *New Booking Request!*

👤 Client: ${bookingDetails.userName}
⏰ Service: ${bookingDetails.service} minutes
📅 Time: ${new Date(bookingDetails.startTime).toLocaleString('id-ID')}

Open IndaStreet app to confirm: https://indastreet.com/booking/${bookingDetails.bookingId}

Reply *ACCEPT* to confirm or *DECLINE* to reject.
        `.trim();

        await this.sendNotification(providerWhatsApp, message);
    },

    async sendMessageNotification(
        providerWhatsApp: string,
        senderName: string,
        messagePreview: string
    ): Promise<void> {
        const message = `
💬 *New Message from ${senderName}*

"${messagePreview}"

Open IndaStreet app to reply: https://indastreet.com/messages
        `.trim();

        await this.sendNotification(providerWhatsApp, message);
    }
};
```

### **Option B: WhatsApp Web Link (Free & Immediate)**

**Current Implementation:**
Your app already uses `wa.me` links - this is perfect!

**Enhanced Integration:**
```typescript
// Enhanced booking notification with WhatsApp link
export const bookingService = {
    async create(booking: any): Promise<any> {
        // ... existing booking creation code ...

        // Get provider's WhatsApp number from Appwrite
        const provider = booking.providerType === 'therapist'
            ? await therapistService.getById(booking.providerId)
            : await placeService.getById(booking.providerId);

        const whatsappNumber = provider.whatsappNumber;

        if (whatsappNumber) {
            // Send WhatsApp notification via web link
            const message = `🔔 *New Booking Request!*\n\n` +
                `👤 Client: ${booking.userName || booking.hotelGuestName}\n` +
                `⏰ Service: ${booking.service} minutes\n` +
                `📅 Time: ${new Date(booking.startTime).toLocaleString('id-ID')}\n\n` +
                `Booking ID: ${response.$id}`;

            // Open WhatsApp with pre-filled message
            // This works on mobile and desktop
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
            
            // Store notification in Appwrite
            await notificationService.create({
                providerId: parseInt(booking.providerId),
                message: `New booking from ${booking.userName || booking.hotelGuestName}`,
                type: 'booking_request',
                bookingId: response.$id,
                whatsappUrl // Store URL for later use
            });
        }

        return response;
    }
};
```

---

## 🎯 Implementation Checklist

### **Phase 1: PWA Badge (Week 1)**
- [ ] Create `utils/badgeService.ts`
- [ ] Update `manifest.json` with proper icons
- [ ] Add badge update calls to notification creation
- [ ] Add badge clear on notification read
- [ ] Test on Chrome Android
- [ ] Test on Safari iOS

### **Phase 2: Sound Notifications (Week 1)**
- [ ] Create `utils/soundNotificationService.ts`
- [ ] Add notification sound files to `/public/sounds/`
  - `booking-notification.mp3`
  - `message-notification.mp3`
  - `alert-notification.mp3`
- [ ] Create `NotificationSettings` component
- [ ] Add settings to TherapistDashboardPage
- [ ] Add settings to PlaceDashboardPage
- [ ] Test desktop notifications
- [ ] Test mobile vibrations

### **Phase 3: WhatsApp Integration (Week 2)**
- [ ] **Option A:** Set up Twilio WhatsApp Business API
  - [ ] Create Twilio account
  - [ ] Get phone number
  - [ ] Submit business verification
  - [ ] Implement `whatsappService.ts`
  
  **OR**
  
- [ ] **Option B:** Enhance current `wa.me` link system
  - [ ] Add WhatsApp URL to notifications
  - [ ] Auto-open WhatsApp on mobile for urgent bookings
  - [ ] Add "Send WhatsApp" button in notifications page

### **Phase 4: Integration Testing (Week 2)**
- [ ] Test badge updates on PWA
- [ ] Test sound notifications in dashboard
- [ ] Test WhatsApp message delivery
- [ ] Test notification flow: Badge → Sound → WhatsApp
- [ ] Test on multiple devices (Android, iOS, Desktop)

---

## 💰 Cost Analysis

### **Option A: WhatsApp Business API**
- **Setup:** $0-500 (one-time)
- **Monthly:** $40-100
- **Per Message:** $0.005-0.01
- **Pros:** Official, reliable, automated, scalable
- **Cons:** Expensive, complex setup

### **Option B: WhatsApp Web Links (Current)**
- **Setup:** $0
- **Monthly:** $0
- **Per Message:** $0
- **Pros:** Free, instant, already working
- **Cons:** Requires manual click, less automated

### **Recommendation:**
Start with **Option B** (free wa.me links) + PWA badges + sound notifications.
Upgrade to **Option A** (Business API) when you hit 1000+ active providers.

---

## 📊 User Experience Flow

### **For Therapist/Place:**
1. **New booking created** → Badge appears on home screen icon (red dot with number)
2. **Dashboard open** → Sound notification plays (booking sound)
3. **Desktop notification** → Browser notification pops up
4. **WhatsApp** → Message appears in WhatsApp with booking details
5. **Action** → Therapist clicks notification → Opens IndaStreet app → Accepts/Declines

### **For Customer:**
1. **Creates booking** → Confirmation in app
2. **Waiting** → Badge shows "Waiting for confirmation"
3. **Accepted** → Sound + notification + WhatsApp confirmation

---

## 🚀 Quick Start (This Week)

### **1. Remove Messaging Service**
Delete these files (not needed with WhatsApp):
- `lib/appwriteService.ts` - Remove `messagingService` (lines 1052-1150)
- `types-enhanced.ts` - Remove Message and Conversation interfaces

### **2. Add Badge Service**
```bash
# Create new file
New-Item -Path "utils/badgeService.ts" -ItemType File
```

### **3. Add Sound Files**
```bash
# Create sounds directory
New-Item -Path "public/sounds" -ItemType Directory

# Download free notification sounds from:
# https://mixkit.co/free-sound-effects/notification/
```

### **4. Test in Production**
- Deploy to https://indastreet.com
- Install PWA on mobile device
- Create test booking
- Check if badge appears

---

## 📝 Summary

✅ **Remove:** In-app chat (use WhatsApp instead)
✅ **Add:** PWA badge notifications
✅ **Add:** Sound alerts in dashboards
✅ **Enhance:** WhatsApp integration for critical notifications

**Result:** Providers never miss a booking, customers get instant confirmations, zero extra monthly costs!

---

**Next Steps:** Want me to implement the badge service and sound notification system now?
