#  5-Minute Booking System - Quick Start Guide

##  System is Ready!

All components have been created successfully. Here is how to test the complete booking flow.

---

##  Prerequisites Setup

### 1. Appwrite Collections

Make sure you have these attributes in your **Bookings** collection:

```javascript
// Required attributes
therapistId: string
therapistName: string
duration: number
price: number
status: string          // pending | confirmed | expired | completed
createdAt: datetime
responseDeadline: datetime

// Optional attributes (for enhanced features)
confirmedAt: datetime
expiredAt: datetime
broadcast: boolean
broadcastAt: datetime
broadcastCount: number
customerName: string
location: string
providerId: string
providerType: string
hotelVillaId: string
```

### 2. Therapists Collection

Update your **Therapists** collection with:

```javascript
status: string          // Available | Busy | Offline
currentBookingId: string (optional)
phone: string (optional) // For WhatsApp integration
```

---

##  How to Test

### Test 1: Basic Booking Flow

1. **Open the app** and navigate to therapist list
2. **Click "Book Now"** on any therapist
3. **Read the warning** about 5-minute policy
4. **Click "I Understand"** to proceed
5. **Select duration** (60, 90, or 120 minutes)
6. **Click "Confirm Booking"**
7. **WhatsApp will open** with the booking message
8. **Countdown timer appears** showing 5:00 remaining

### Test 2: Therapist Accepts Booking

1. **Copy the deep link** from WhatsApp message
2. **Paste it in browser** or click if on mobile
3. **Accept popup appears** showing booking details
4. **Click "Accept Booking"**
5. **Success screen appears**
6. **Customer countdown** should update to "Confirmed!"

### Test 3: Booking Expiration

1. **Create a booking** following Test 1
2. **Wait 5 minutes** (or modify code to 30 seconds for testing)
3. **Watch countdown** reach 0:00
4. **Status changes to "Expired"**
5. **Message shows**: "Your booking has been sent to all available therapists"
6. **Background service** broadcasts to all therapists

---

##  Quick Modifications for Testing

### Change Response Time

In `components/BookingPopup.tsx`, line ~56:
```typescript
// Change from 5 minutes to 30 seconds for quick testing
const responseDeadline = new Date(now.getTime() + 30 * 1000);
// Original: const responseDeadline = new Date(now.getTime() + 5 * 60 * 1000);
```

### Change Background Service Interval

In `services/bookingExpirationService.ts`, line ~8:
```typescript
// Change from 60 seconds to 10 seconds
private checkIntervalMs = 10000;
// Original: private checkIntervalMs = 60000;
```

---

##  Key Files Reference

| File | Purpose | Location |
|------|---------|----------|
| **BookingPopup.tsx** | Customer booking interface | components/ |
| **BookingStatusTracker.tsx** | Countdown timer | components/ |
| **TherapistBookingAcceptPopup.tsx** | Therapist accept screen | components/ |
| **AcceptBookingPage.tsx** | Deep link handler | pages/ |
| **bookingExpirationService.ts** | Background job | services/ |

---

##  Troubleshooting

### Countdown Timer Not Starting
- Check if responseDeadline is a valid Date object
- Verify BookingStatusTracker is receiving correct props
- Check browser console for errors

### Deep Link Not Working
- Ensure URL routing is set up: /accept-booking/:bookingId
- Check that accept-booking is added to Page type
- Verify AcceptBookingPage is imported in AppRouter

### Therapist Cannot Accept Booking
- Check booking status is pending (not expired or confirmed)
- Verify Appwrite permissions allow updating bookings
- Check therapist ID exists in database

### Background Service Not Running
- Verify service is started in App.tsx useEffect
- Check browser console for "Starting booking expiration service..." message
- Ensure Appwrite Query syntax is correct

### WhatsApp Link Not Opening
- Verify window.open() is not blocked by popup blocker
- Check WhatsApp URL format is correct
- Test with different browsers

---

##  System Status

 All 9 files created successfully
 No critical compilation errors
 All routes configured
 All type definitions added
 Ready for testing!

---

##  More Documentation

Check BOOKING_SYSTEM_COMPLETE.md for:
- Complete flow diagrams
- Appwrite schema details
- Edge case handling
- Enhancement suggestions

---

**Happy Testing! **
