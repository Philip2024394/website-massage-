# Booking Notification Troubleshooting Guide

## ISSUE: No notification when booking created on live site

User "Surtiningsih" therapist dashboard open on phone - no sound or vibration when booking made.

---

## STEP 1: Check Console Logs on Phone

Open therapist dashboard → Open browser dev tools (Chrome: Menu > More Tools > Developer Tools)

Look for these logs:

### ✅ GOOD SIGNS:
```
✅ Subscribed to provider bookings: [therapistId]
🔔 New booking received for provider: [therapistId]
🔔 New booking notification: [booking object]
```

### ❌ BAD SIGNS (Problems):
```
❌ Error subscribing to provider bookings
Failed to setup real-time bookings
```

---

## STEP 2: Check If Dashboard Page is Open

**CRITICAL**: Notifications only work when **TherapistBookings page is OPEN**

The realtime subscription is set up in `TherapistBookings.tsx` useEffect.

### Test:
1. Open therapist dashboard on phone
2. Navigate to **"Bookings & Schedule"** tab
3. Keep that page open
4. Create booking on live site
5. Check if notification appears

**If dashboard is on different page** → Notifications won't work!

---

## STEP 3: Check Notification Permission

On phone browser:

### Android Chrome:
1. Site Settings → Notifications → Should be "Allowed"
2. If blocked → Clear and re-enable

### Test command in console:
```javascript
console.log('Notification permission:', Notification.permission);
// Should output: "granted"
```

---

## STEP 4: Check Appwrite Realtime Connection

In console, check for:

```
✅ Connected to Appwrite realtime
✅ Subscribed to bookings channel
```

If missing, check:
- Internet connection stable
- Appwrite project ID correct
- Database ID correct
- Collection ID for bookings correct

---

## STEP 5: Verify Booking Data

When booking is created, check console for:

```javascript
// Should see this object structure:
{
  $id: "...",
  therapistId: "[Surtiningsih's ID]",
  customerName: "...",
  serviceType: "...",
  status: "pending"
}
```

**Check if `therapistId` matches Surtiningsih's actual ID!**

---

## STEP 6: Test Audio Playback

In browser console, run:

```javascript
const audio = new Audio('/sounds/booking-notification.mp3');
audio.volume = 1.0;
audio.play();
```

If no sound:
- Check phone volume (not muted)
- Check browser settings (sound allowed)
- Check file exists: `/sounds/booking-notification.mp3`

---

## STEP 7: Manual Test Notification

In console, run:

```javascript
if ('Notification' in window && Notification.permission === 'granted') {
  new Notification('Test Booking', {
    body: 'Testing notification system',
    vibrate: [500, 100, 500, 100, 500, 100, 500],
    requireInteraction: true
  });
}
```

Should see notification + feel vibration.

---

## COMMON ISSUES & FIXES:

### Issue 1: Dashboard not on Bookings page
**Fix**: Must be on "Bookings & Schedule" tab for realtime to work

### Issue 2: Notification permission denied
**Fix**: Clear site data, revisit, accept permission prompt

### Issue 3: therapistId mismatch
**Fix**: Verify Surtiningsih's ID matches in booking

### Issue 4: Service worker not registered
**Fix**: Check `/sw.js` file exists and registered

### Issue 5: Appwrite realtime disconnected
**Fix**: Check network tab for websocket connection

---

## EXPECTED FLOW:

1. Therapist opens dashboard → Bookings page
2. Console shows: "✅ Subscribed to provider bookings: [ID]"
3. Customer creates booking on live site
4. Appwrite sends realtime event
5. Dashboard receives: "🔔 New booking received"
6. Sound plays: `/sounds/booking-notification.mp3`
7. Browser notification shows
8. Vibration triggers (2 minutes)
9. Booking appears in list

---

## Quick Diagnostic Command:

Run in console when on Bookings page:

```javascript
console.log({
  notificationPermission: Notification.permission,
  serviceWorkerReady: 'serviceWorker' in navigator,
  therapistId: '[Surtiningsih ID]',
  onBookingsPage: window.location.hash.includes('bookings'),
  appwriteEndpoint: 'https://cloud.appwrite.io/v1'
});
```

---

## If Still Not Working:

1. **Check server logs** - Is booking actually created in Appwrite?
2. **Check Appwrite console** - Go to Bookings collection, verify new booking exists
3. **Check therapistId field** - Does it exactly match Surtiningsih's ID?
4. **Check page is active** - Dashboard must be open and visible (not background tab)
5. **Check browser** - Some browsers block notifications in background

---

## Contact Developer:

If all above checks pass but still no notification:

Provide:
- Console logs (screenshot)
- Booking ID from Appwrite
- Therapist ID (Surtiningsih)
- Browser and OS version
- Current page when booking was made
