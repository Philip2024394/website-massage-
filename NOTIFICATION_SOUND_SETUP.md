# Notification Sound Files Setup

## Required Sound Files
Create the following MP3 files in the `public/sounds/` directory:

### 1. booking-notification.mp3
- **Purpose**: New booking requests, booking confirmations
- **Characteristics**: Professional, welcoming tone
- **Duration**: 1-2 seconds
- **Volume**: Medium
- **Suggested tone**: Gentle chime or bell sound

### 2. chat-message.mp3
- **Purpose**: Incoming chat messages
- **Characteristics**: Subtle, non-intrusive
- **Duration**: 0.5-1 second
- **Volume**: Lower than other notifications
- **Suggested tone**: Soft pop or bubble sound

### 3. coin-earned.mp3
- **Purpose**: Coin rewards, earnings notifications
- **Characteristics**: Positive, rewarding
- **Duration**: 1-2 seconds
- **Volume**: Higher for celebration
- **Suggested tone**: Coin drop or cash register sound

### 4. general-notification.mp3
- **Purpose**: Default notifications
- **Characteristics**: Neutral, informative
- **Duration**: 1 second
- **Volume**: Medium
- **Suggested tone**: Standard notification beep

### 5. urgent-notification.mp3
- **Purpose**: Urgent alerts, cancellations, emergencies
- **Characteristics**: Attention-grabbing but not alarming
- **Duration**: 1-2 seconds
- **Volume**: Higher
- **Suggested tone**: Alert tone or ascending beep

### 6. success-notification.mp3
- **Purpose**: Successful actions, confirmations
- **Characteristics**: Positive, confirming
- **Duration**: 1 second
- **Volume**: Medium
- **Suggested tone**: Success chime or positive beep

### 7. achievement-unlock.mp3
- **Purpose**: Major achievements, level ups, big rewards
- **Characteristics**: Celebratory, exciting
- **Duration**: 2-3 seconds
- **Volume**: Higher
- **Suggested tone**: Fanfare or achievement jingle

## Icon Files Setup
Create the following icon files in the `public/icons/` directory:

### Required Icons (192x192 PNG recommended):
- app-icon-192.png - Main app icon
- badge-icon.png - Notification badge icon
- booking.png - General booking icon
- booking-confirmed.png - Confirmed booking icon
- booking-cancelled.png - Cancelled booking icon
- booking-completed.png - Completed booking icon
- new-booking.png - New booking request icon
- chat.png - Chat message icon
- group-chat.png - Group chat icon
- coins.png - Coin rewards icon
- commission.png - Commission icon
- general.png - General notification icon
- therapist-available.png - Therapist availability icon
- achievement.png - Achievement unlock icon
- payment.png - Payment received icon
- test.png - Test notification icon

## Browser Compatibility
- **Chrome/Edge**: Full support for Web Audio API and Service Workers
- **Firefox**: Full support with some Service Worker limitations
- **Safari**: Limited Web Audio API support, fallback to HTML5 Audio
- **Mobile Safari**: Requires user interaction for audio playback
- **Android Chrome**: Full support

## Implementation Notes
1. All notification sounds work regardless of app state (open/closed)
2. Service Worker handles background notifications
3. Audio preloading for better performance
4. Fallback to HTML5 Audio if Web Audio API fails
5. Volume control based on notification type and importance
6. Vibration support for mobile devices

## Testing
Use the test function to verify all notification types:
```javascript
// Test different notification sounds
notificationService.testNotificationSound('booking');
notificationService.testNotificationSound('chat');
notificationService.testNotificationSound('coin');
// ... etc
```