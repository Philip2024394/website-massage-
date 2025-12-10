# Notification Sound Files

This directory contains MP3 files for all dashboard notifications.

## Required Files

### 🔴 PRIORITY #1: Main Notification Sound

**booking-notification.mp3** ⭐ **MOST IMPORTANT**
   - Purpose: **Any new lead or booking request received**
   - Duration: 2-4 seconds
   - Tone: **Prominent, clear, attention-grabbing** (like a phone ringtone)
   - Volume: Loud enough to hear from another room
   - Examples: "Pleasant ringtone", "Success fanfare", "Upbeat alert"
   - Used in: **ALL provider dashboards when ANY lead/booking arrives**
   - This is the PRIMARY notification - providers MUST hear this!

### Other Sounds (Subtle clicks/beeps)

1. **message-notification.mp3**
   - Purpose: New chat message received
   - Duration: 0.2-0.5 seconds
   - Tone: **Soft click or beep** (subtle, not intrusive)
   - Examples: "Pop", "Click", "Soft ping"
   - Used in: Chat windows when customer sends message

2. **payment-notification.mp3**
   - Purpose: Payment reminder/due
   - Duration: 0.5-0.8 seconds
   - Tone: **Gentle beep** (professional, not urgent)
   - Examples: "Soft bell", "Notification beep"
   - Used in: Billing pages when payment is due

3. **alert-notification.mp3**
   - Purpose: System alerts, warnings
   - Duration: 0.8-1 second
   - Tone: **Attention beep** (noticeable but not alarming)
   - Examples: "Alert tone", "Warning beep"
   - Used in: Error messages, important system notifications

## How to Add Sound Files

### Option 1: Download Free Notification Sounds

**For booking-notification.mp3 (MAIN SOUND):**
- Visit: https://notificationsounds.com/category/ringtones
- Or: https://freesound.org/ - search "success fanfare", "ringtone", "notification ring"
- Or: https://mixkit.co/free-sound-effects/notification/ - look for prominent sounds
- Choose: **Clear, pleasant, 2-4 second sound** (like a phone ringtone)
- Must be loud and attention-grabbing!

**For other sounds (clicks/beeps):**
- Visit: https://notificationsounds.com/
- Or: https://freesound.org/ - search "click", "beep", "pop"
- Choose: **Short (0.2-0.8s), subtle sounds**
- Download as MP3 format
- Rename to match required filenames above

### Option 2: Use Text-to-Speech (Temporary)
- For testing, you can use generated sounds
- Website: https://www.text2speech.org/
- Generate short audio, download as MP3

### Option 3: Create with Audacity (Free)
1. Download Audacity: https://www.audacityteam.org/
2. Generate > Tone
3. Frequency: 800-1200 Hz
4. Amplitude: 0.3-0.5
5. Duration: 0.5-2 seconds
6. File > Export as MP3

## Current Status
🔴 **Missing all 4 MP3 files - Add files for notifications to work**

Once files are added, restart the app to load sounds.

## Technical Notes
- File format: MP3 (best browser compatibility)
- Sample rate: 44.1kHz recommended
- Bitrate: 128-192kbps sufficient
- Stereo or mono both work
- Keep file sizes small (<100KB each) for fast loading
- Files are preloaded on first user interaction (browser security)

## Testing
After adding files, test in browser console:
```javascript
import { playMessageSound, playBookingSound, playPaymentSound, playAlertSound } from './lib/notificationSound';

// Test MAIN booking notification first (most important!)
playBookingSound(true); // With vibration

// Should be LOUD and clear - this alerts providers to new leads
// If you can't hear it clearly from another room, choose a louder sound!

// Test other sounds (should be subtle)
playMessageSound(); // Should be soft click/beep
playPaymentSound(); // Should be gentle beep
playAlertSound();   // Should be noticeable but not loud
```
