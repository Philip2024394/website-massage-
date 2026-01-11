# PUSH NOTIFICATIONS - QUICK START GUIDE

**Status**: ✅ Client-Side Implementation Complete  
**Pending**: VAPID Key Setup + Appwrite Collection Creation

---

## 🚀 QUICK SETUP (5 Minutes)

### Step 1: Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

**Output**:
```
Public Key:  BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBroGxm7wkcKTHgrTjts
Private Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Save These Keys!** You'll need them for client and server.

---

### Step 2: Update Client VAPID Key

**File**: `lib/pushNotificationService.ts` (line 17)

```typescript
// BEFORE:
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBroGxm7wkcKTHgrTjts';

// AFTER:
const VAPID_PUBLIC_KEY = 'YOUR_ACTUAL_PUBLIC_KEY_HERE';
```

---

### Step 3: Create Appwrite Collection

**Console**: https://syd.cloud.appwrite.io/console/project-68f23b11000d25eb3664/databases/database-68f76ee1000e64ca8d05

**Click**: Create Collection

**Collection Name**: `push_subscriptions`

**Attributes** (Add these):
```
1. userId       | String | 255 chars | Required
2. role         | String | 20 chars  | Required
3. endpoint     | String | 500 chars | Required
4. keys_p256dh  | String | 255 chars | Required
5. keys_auth    | String | 255 chars | Required
6. device       | String | 200 chars | Optional
7. createdAt    | DateTime | Auto   | Required | Default: now()
```

**Indexes** (Add these):
```
1. userId_idx   | Type: Key    | Attribute: userId
2. role_idx     | Type: Key    | Attribute: role
3. endpoint_idx | Type: Unique | Attribute: endpoint
```

**Permissions**:
```
Role: Any
- ✅ Create
- ✅ Read
- ✅ Update
- ✅ Delete

(Or set to Users: create/read/update/delete own)
```

---

### Step 4: Test Push Notifications

**Open Browser Console**:

```javascript
// 1. Check if push is supported
console.log('Push supported:', 'serviceWorker' in navigator && 'PushManager' in window);

// 2. Request permission
await Notification.requestPermission();
// Should show browser permission dialog

// 3. Test notification (after permission granted)
const registration = await navigator.serviceWorker.register('/sw.js');
await registration.showNotification('Test', {
  body: 'Push notifications working!',
  icon: '/icon-192.png',
  vibrate: [200]
});
```

**Expected Result**: Notification appears with "Test" title

---

### Step 5: Test with Real Booking

**Steps**:
1. Open app, grant notification permission
2. Create a test booking
3. Share location
4. **Switch to another tab** (minimize app)
5. Change booking status in Appwrite Console:
   ```
   Databases → main → bookings → [your booking] → status = "therapist_accepted"
   ```
6. **Wait 3 seconds**
7. **Notification should appear!**

**Click Notification**: Should open app and navigate to chat

---

## 🧪 TESTING CHECKLIST

### ✅ Client-Side Tests (No Server Required)

- [ ] Browser console shows: "✅ Push notifications integrated"
- [ ] Permission request dialog appears
- [ ] Service worker registers successfully (DevTools → Application)
- [ ] Test notification displays when triggered manually
- [ ] Tab visibility detection works (no push when tab active)
- [ ] Notification click opens correct page
- [ ] Sound plays on status change (if tab active)
- [ ] Push notification appears on status change (if tab inactive)

### 🔄 Server-Side Tests (Optional - Requires Appwrite Function)

- [ ] Appwrite function triggers on booking.status change
- [ ] Function queries push_subscriptions collection
- [ ] Function sends Web Push notification
- [ ] Notification received even when app completely closed
- [ ] Multiple devices receive notification (if user subscribed on multiple)

---

## 📱 BROWSER COMPATIBILITY

### ✅ Full Support
- Chrome 90+ (Desktop + Android)
- Firefox 88+ (Desktop + Android)
- Edge 90+ (Desktop)
- Opera 76+
- Samsung Internet 14+

### ⚠️ Limited Support
- Safari 16+ (macOS + iOS 16.4+)
  - Web Push only in iOS 16.4+
  - Must add to home screen first (PWA mode)
  - Limited notification actions

### ❌ Not Supported
- Safari < 16 (macOS)
- iOS Safari < 16.4
- Internet Explorer (all versions)

**Fallback**: App uses in-app banners + sounds for unsupported browsers

---

## 🔑 VAPID Keys - What Are They?

**VAPID** = Voluntary Application Server Identification

**Purpose**: Identifies your app to push notification servers (Google FCM, Mozilla Push Service, etc.)

**How It Works**:
1. You generate a **public/private key pair**
2. Client uses **public key** to subscribe to push
3. Server uses **private key** to send authenticated push messages
4. Push service verifies signature using public key

**Security**: Private key NEVER leaves your server!

---

## 🚨 COMMON ISSUES

### "Service Worker registration failed"

**Cause**: SW file not at root path  
**Fix**: Ensure `sw.js` is in `public/` folder (not `public/js/`)

### "Permission denied"

**Cause**: User clicked "Block" on permission dialog  
**Fix**: User must manually enable in browser settings:
- Chrome: Settings → Privacy → Site Settings → Notifications
- Firefox: Settings → Privacy → Permissions → Notifications

### "Push event received but no notification"

**Cause**: Missing `showNotification()` in service worker  
**Fix**: Already implemented in `sw.js` - check for errors in console

### "Notification doesn't open app"

**Cause**: `notificationclick` handler not working  
**Fix**: Check `sw.js` line ~140 - should have `clients.openWindow()`

---

## 📊 MONITORING (Production)

### Console Logs to Track

**Success Indicators**:
```
✅ Push permission already granted, initializing...
✅ Push notifications initialized successfully
✅ Service Worker 6.0.0 loaded and ready
🔔 Push notification sent: ✅ Booking Accepted
📬 Push notification received
✅ Notification displayed: ✅ Booking Accepted
```

**Warning Indicators**:
```
⚠️ Push event has no data
🚫 Push permission denied by user
❌ Push notification failed: [error]
```

### Metrics to Track

1. **Permission Grant Rate**: % of users who grant permission
2. **Subscription Success Rate**: % of granted permissions that subscribe successfully
3. **Delivery Rate**: % of push notifications delivered
4. **Click Rate**: % of notifications clicked
5. **Conversion Rate**: % of clicks that result in booking action

---

## 🎯 NEXT STEPS (Optional)

### Implement Server-Side Push (Appwrite Function)

**When Needed**: If you want push notifications when app is **completely closed** (not just in background tab)

**Setup Time**: ~30 minutes

**Files Needed**:
1. Appwrite Function (Node.js + web-push library)
2. Webhook trigger (bookings collection updates)
3. Environment variables (VAPID private key)

**Guide**: See [PUSH_SUBSCRIPTIONS_APPWRITE_SCHEMA.md](PUSH_SUBSCRIPTIONS_APPWRITE_SCHEMA.md) (Webhook Integration section)

### Add Push Notification Settings UI

**Features**:
- Enable/Disable push notifications
- Mute specific notification types
- Show subscription status
- Test notification button

**Example UI**:
```tsx
<div className="settings-section">
  <h3>Push Notifications</h3>
  
  <button onClick={async () => {
    const success = await enablePushNotifications(userId, 'customer');
    alert(success ? 'Enabled!' : 'Permission denied');
  }}>
    {isPushEnabled ? 'Disable' : 'Enable'} Push Notifications
  </button>
  
  <button onClick={() => showTestNotification()}>
    Send Test Notification
  </button>
  
  <label>
    <input type="checkbox" checked={muteBookingAlerts} />
    Mute Booking Alerts
  </label>
</div>
```

---

## ✅ CHECKLIST SUMMARY

**Before Deployment**:
- [ ] Generate VAPID keys
- [ ] Update `pushNotificationService.ts` with public key
- [ ] Create `push_subscriptions` collection in Appwrite
- [ ] Test on localhost (Chrome)
- [ ] Test on mobile device (Chrome Android)
- [ ] Verify notification click opens app

**After Deployment**:
- [ ] Monitor permission grant rate
- [ ] Check service worker activation in production
- [ ] Test push delivery on real bookings
- [ ] Gather user feedback on notification frequency

**Optional**:
- [ ] Implement Appwrite function for server-side push
- [ ] Add push settings UI
- [ ] Track push notification analytics
- [ ] Optimize notification text based on user feedback

---

**Estimated Setup Time**: 5 minutes (VAPID keys + Appwrite collection)  
**Production Ready**: ✅ Yes (after key setup)  
**Server-Side Required**: ❌ No (optional enhancement)  

**Questions?** Check [PUSH_NOTIFICATIONS_IMPLEMENTATION_COMPLETE.md](PUSH_NOTIFICATIONS_IMPLEMENTATION_COMPLETE.md) for full documentation.
