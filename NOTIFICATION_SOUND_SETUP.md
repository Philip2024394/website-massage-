# Notification Sound Setup

## MP3 Notification Sound

The booking system requires a notification sound file at:
```
public/notification-sound.mp3
```

### How to Add the Notification Sound:

1. **Option 1: Use Free Notification Sound**
   - Download from: https://mixkit.co/free-sound-effects/notification/
   - Recommended: "Notification tone with a fade" or "Alert tone"
   - Save as `notification-sound.mp3` in the `public` folder

2. **Option 2: Use Custom Sound**
   - Create or find your preferred notification MP3 (2-3 seconds duration)
   - Place it in `public/notification-sound.mp3`

3. **Option 3: Generate Using AI**
   - Use elevenlabs.io or similar to generate custom notification
   - Keep duration under 3 seconds
   - Export as MP3 format

### Sound Requirements:
- **Format**: MP3
- **Duration**: 1-3 seconds
- **Volume**: Clear and audible but not jarring
- **File size**: Under 100KB

### Testing the Sound:
Once the MP3 file is in place, test it by:
```javascript
// In browser console
window.playBookingNotification();
```

### Current Fallback:
If the MP3 file is not found, the system will use a synthesized beep sound as fallback.
