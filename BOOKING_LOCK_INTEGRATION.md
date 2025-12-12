# Booking Lock System Integration Guide

## Overview
The booking lock system prevents users from booking with multiple therapists simultaneously. When a user makes a booking (immediate or scheduled), they are locked for 15 minutes and must wait for a response before booking with another therapist.

## How It Works

### 1. Lock Creation
When a user submits a booking:
```typescript
// In TherapistCard.tsx or ScheduleBookingPopup.tsx
import { setPendingBooking } from '../utils/bookingLock';

// After successful booking creation
setPendingBooking(
    bookingResponse.$id,  // Booking ID from database
    therapistId,          // Therapist/place ID
    therapistName,        // Therapist/place name
    'immediate',          // or 'scheduled'
    15                    // Minutes until timeout
);
```

### 2. Lock Checking
Before showing booking forms:
```typescript
import { hasPendingBooking, getPendingBookingMessage } from '../utils/bookingLock';

const pending = hasPendingBooking();
if (pending) {
    alert(getPendingBookingMessage(pending));
    return; // Don't show booking form
}
```

### 3. Lock Clearing

The lock should be cleared in these scenarios:

#### A. Therapist Responds (CHAT SYSTEM INTEGRATION REQUIRED)
When the therapist sends a message accepting or declining the booking:

```typescript
// In ChatWindow.tsx or chat message handler
import { clearPendingBooking, hasPendingBooking } from '../utils/bookingLock';

// When therapist sends a message
function onTherapistMessage(message: string, therapistId: string) {
    const pending = hasPendingBooking();
    
    if (pending && pending.therapistId === therapistId) {
        // Check if message indicates acceptance/decline
        const isResponse = message.toLowerCase().includes('confirm') ||
                          message.toLowerCase().includes('accept') ||
                          message.toLowerCase().includes('decline') ||
                          message.toLowerCase().includes('sorry') ||
                          message.toLowerCase().includes('tidak bisa'); // "can't" in Indonesian
        
        if (isResponse) {
            clearPendingBooking();
            console.log('🔓 Booking lock cleared - therapist responded');
        }
    }
}
```

#### B. Automatic Timeout (ALREADY IMPLEMENTED)
The lock automatically expires after 15 minutes. The `hasPendingBooking()` function checks expiry automatically.

#### C. Booking Status Update (DATABASE TRIGGER RECOMMENDED)
When booking status changes in Appwrite:

```typescript
// Listen to booking status changes
databases.subscribe([`databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.bookings}.documents`], (response) => {
    if (response.events.includes('databases.*.collections.*.documents.*.update')) {
        const booking = response.payload;
        const pending = hasPendingBooking();
        
        if (pending && pending.bookingId === booking.$id) {
            // Status changed - clear lock
            if (booking.status === 'confirmed' || booking.status === 'declined' || booking.status === 'expired') {
                clearPendingBooking();
                console.log('🔓 Booking lock cleared - status updated to:', booking.status);
            }
        }
    }
});
```

## Files Modified

### ✅ Already Implemented
- `components/TherapistCard.tsx` - Added lock check before opening booking form, lock creation after booking
- `components/ScheduleBookingPopup.tsx` - Added lock check at start, lock creation after booking
- `hooks/useAppState.ts` - Added pending booking state variables
- `utils/bookingLock.ts` - Created utility functions for lock management

### ⏳ Needs Integration
- `components/ChatWindow.tsx` - Add lock clearing when therapist responds
- `App.tsx` or relevant component - Add Appwrite realtime subscription for booking status changes

## Testing

1. **Test Lock Creation:**
   - Book with therapist A
   - Try to book with therapist B immediately
   - Should see alert: "You have a pending booking with [Therapist A]"

2. **Test Lock Expiry:**
   - Book with therapist A
   - Wait 15 minutes
   - Try to book with therapist B
   - Should work without alert

3. **Test Lock Clearing:**
   - Book with therapist A
   - Therapist A responds in chat with "I confirm"
   - Lock should clear automatically
   - Should be able to book with therapist B

## User Experience

**Before Response (Locked):**
```
User clicks "Book Now" on Therapist B
↓
Alert: "⚠️ You have a pending immediate booking with Budi.
Please wait for their response (12 min remaining) before 
booking with another therapist."
↓
Booking form NOT shown
```

**After Response (Unlocked):**
```
Therapist A sends: "Sorry, I'm not available"
↓
Lock automatically cleared
↓
User can now book with Therapist B
```

## Implementation Priority

1. ✅ **HIGH (DONE)** - Lock creation and checking in booking flows
2. 🔶 **MEDIUM (TODO)** - Lock clearing on therapist response in chat
3. 🔷 **LOW (OPTIONAL)** - Lock clearing on chat window close

## Notes

- Uses `sessionStorage` to persist across page refreshes but clears on browser close
- 15-minute timeout is configurable via `setPendingBooking()` parameter
- Lock applies per user session, not globally
- Multiple browser tabs will share the same lock (sessionStorage is tab-scoped in most browsers)
