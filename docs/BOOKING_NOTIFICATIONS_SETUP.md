# Booking Notification System - MP3 Setup Guide

## Overview
The booking notification system requires two MP3 audio files for alerts:
- **Therapist notification**: Loops until therapist accepts booking
- **Customer notification**: Plays once as reminder

## Required Audio Files

### 1. Therapist Notification Sound
**File:** `notification-sound.mp3`  
**Location:** `public/notification-sound.mp3`  
**Requirements:**
- Duration: 5-10 seconds
- Format: MP3
- Volume: Moderate to loud (attention-grabbing)
- Loop: Yes (handled by code)
- Recommended: Alarm/bell sound with increasing urgency

### 2. Customer Notification Sound
**File:** `customer-notification.mp3`  
**Location:** `public/customer-notification.mp3`  
**Requirements:**
- Duration: 3-5 seconds
- Format: MP3
- Volume: Pleasant, not jarring
- Loop: No (single play)
- Recommended: Gentle chime or melodic notification tone

## Installation Steps

1. **Create/obtain MP3 files** matching the requirements above
2. **Place files in the public directory:**
   ```
   website-massage-/
   ├── public/
   │   ├── notification-sound.mp3          ← Therapist alert (loops)
   │   ├── customer-notification.mp3       ← Customer reminder (plays once)
   │   └── logo.png                        ← Used for browser notifications
   ```

3. **Verify file permissions** - Ensure files are accessible via HTTP

## Testing Notifications

### Browser Notification Permissions
The system will request notification permissions automatically. Users must:
1. Allow browser notifications when prompted
2. Keep app open or installed as PWA

### PWA Installation Required
For reliable notifications, customers **must** install the PWA:
- iOS: Add to Home Screen via Safari
- Android: Install via Chrome/Edge prompt
- Desktop: Install via browser prompt

### Testing Audio Playback
1. Open browser console
2. Test therapist notification:
   ```javascript
   const audio = new Audio('/notification-sound.mp3');
   audio.loop = true;
   audio.play();
   ```
3. Test customer notification:
   ```javascript
   const audio = new Audio('/customer-notification.mp3');
   audio.play();
   ```

## Notification Behavior

### Therapist Notification (BookingNotification.tsx)
- **Trigger:** 3 hours before booking start time
- **Sound:** Loops continuously until accepted
- **Visual:** Fullscreen modal with animated bell icon
- **Actions:** 
  - "Accept & Stop Alert" - Stops sound and closes modal
  - "Dismiss for Now" - Stops temporarily (will remind again)
- **Browser notification:** Yes, with vibration

### Customer Notification (CustomerNotification.tsx)
- **Trigger:** 3 hours before booking start time
- **Sound:** Plays once
- **Visual:** Fullscreen modal with massage emoji animation
- **Actions:**
  - "Got It, Thanks!" - Closes notification
- **Includes:** Preparation tips and booking details
- **Browser notification:** Yes, with vibration

## Troubleshooting

### Sound Not Playing
1. **Check browser autoplay policy:**
   - Chrome/Edge: Settings → Privacy → Site Settings → Sound
   - Safari: Settings → Safari → Experimental Features → WebAudio
2. **Verify file path:** Open `https://your-domain.com/notification-sound.mp3` directly
3. **Check console for errors:** Look for audio loading failures

### Notifications Not Showing
1. **Verify PWA installation:** Must be installed for reliable notifications
2. **Check browser permissions:** Settings → Notifications
3. **Test notification permission:**
   ```javascript
   console.log(Notification.permission); // Should be "granted"
   ```

### Timing Issues
- Notifications check every 60 seconds for the 3-hour window
- Use browser dev tools to test by modifying booking.startTime
- Check that booking.notificationSent is false

## Production Checklist

- [ ] MP3 files uploaded to public/ directory
- [ ] Files are compressed and optimized (<500KB each)
- [ ] PWA installation flow tested on iOS and Android
- [ ] Browser notification permissions tested
- [ ] Sound loops correctly for therapist alert
- [ ] Sound plays once for customer reminder
- [ ] Notification dismissal properly updates database
- [ ] 3-hour timing verified with real bookings

## Recommended Sound Sources

### Free Sound Libraries
- **Pixabay Sounds:** https://pixabay.com/sound-effects/
- **Freesound:** https://freesound.org/
- **Zapsplat:** https://www.zapsplat.com/

### Suggested Search Terms
- Therapist: "alarm bell", "urgent notification", "alert sound"
- Customer: "notification chime", "pleasant bell", "reminder tone"

## Component Integration

The notification components are standalone and can be integrated into:
- Chat window (overlay mode)
- Dashboard (modal mode)
- Background service worker (PWA)

### Example Usage in Chat Window
```tsx
import BookingNotification from './components/BookingNotification';
import CustomerNotification from './components/CustomerNotification';

// For therapist
<BookingNotification
  booking={activeBooking}
  onAccept={(bookingId) => {
    // Update database: therapistAccepted = true
    handleAcceptBooking(bookingId);
  }}
  autoShow={true}
/>

// For customer
<CustomerNotification
  booking={upcomingBooking}
  onClose={() => {
    // Mark notification as shown
    markNotificationSent(booking.id);
  }}
  autoShow={true}
/>
```

## Notes
- Notification timing is checked every 60 seconds (can be adjusted)
- Audio files should be optimized for web (128-192 kbps MP3)
- Browser limitations may prevent background audio on mobile without PWA
- iOS has stricter autoplay policies - PWA installation strongly recommended
