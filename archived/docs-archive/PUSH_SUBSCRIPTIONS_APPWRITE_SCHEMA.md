# PUSH SUBSCRIPTIONS COLLECTION - APPWRITE SCHEMA

**Collection ID**: `push_subscriptions`  
**Database**: `main` (68f76ee1000e64ca8d05)  
**Purpose**: Store Web Push API subscriptions for real-time booking + chat notifications

---

## COLLECTION STRUCTURE

### Attributes

| Field Name    | Type     | Size  | Required | Description |
|---------------|----------|-------|----------|-------------|
| userId        | string   | 255   | Yes      | User ID (customer/therapist/admin) |
| role          | string   | 20    | Yes      | User role: customer, therapist, admin |
| endpoint      | string   | 500   | Yes      | Push subscription endpoint URL |
| keys_p256dh   | string   | 255   | Yes      | ECDH public key (base64) |
| keys_auth     | string   | 255   | Yes      | Auth secret (base64) |
| device        | string   | 200   | No       | User agent string (browser info) |
| createdAt     | datetime | -     | Yes      | Subscription creation timestamp |

### Indexes

| Index Name     | Type    | Attributes | Description |
|----------------|---------|------------|-------------|
| userId_idx     | key     | userId     | Query subscriptions by user |
| role_idx       | key     | role       | Query subscriptions by role |
| endpoint_idx   | unique  | endpoint   | Prevent duplicate subscriptions |

### Permissions

| Role      | Create | Read | Update | Delete |
|-----------|--------|------|--------|--------|
| Users     | ✅     | Own  | Own    | Own    |
| Admin     | ✅     | ✅   | ✅     | ✅     |

**Security**: Users can only read/update/delete their own subscriptions

---

## USAGE IN CODE

### Client-Side (pushNotificationService.ts)

```typescript
import { databases, ID } from './appwrite';

// Store subscription
await databases.createDocument(
  'main',
  'push_subscriptions',
  ID.unique(),
  {
    userId: '123',
    role: 'customer',
    endpoint: 'https://fcm.googleapis.com/fcm/send/...',
    keys_p256dh: 'BEl62iUYgUivxI...',
    keys_auth: 'c3dGJ8IKbx...',
    device: 'Mozilla/5.0 Chrome/120.0',
    createdAt: new Date().toISOString()
  }
);
```

### Server-Side (Appwrite Function - Future Enhancement)

```javascript
// Query subscriptions for a specific user/role
const subscriptions = await databases.listDocuments(
  'main',
  'push_subscriptions',
  [
    Query.equal('userId', ['user123']),
    Query.equal('role', ['customer'])
  ]
);

// Send push notification
for (const sub of subscriptions.documents) {
  await webpush.sendNotification(
    {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.keys_p256dh,
        auth: sub.keys_auth
      }
    },
    JSON.stringify({
      title: 'Booking Accepted',
      body: 'Your therapist has accepted the booking!',
      bookingId: 'booking123',
      priority: 'high'
    })
  );
}
```

---

## WEBHOOK INTEGRATION (SERVER-SIDE PUSH SENDER)

### Required Setup

1. **Create Appwrite Function**:
   - Runtime: Node.js 18+
   - Trigger: Database event (bookings collection)
   - Event: `databases.*.collections.bookings.documents.*.update`

2. **Install Dependencies**:
   ```bash
   npm install web-push node-appwrite
   ```

3. **Generate VAPID Keys**:
   ```bash
   npx web-push generate-vapid-keys
   ```

4. **Environment Variables**:
   ```
   VAPID_PUBLIC_KEY=BEl62iUYgUivxI...
   VAPID_PRIVATE_KEY=xxx
   VAPID_SUBJECT=mailto:admin@indastreet.com
   APPWRITE_ENDPOINT=https://syd.cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=68f23b11000d25eb3664
   APPWRITE_API_KEY=xxx
   ```

### Function Code (push-notification-sender.js)

```javascript
const sdk = require('node-appwrite');
const webpush = require('web-push');

// Configure VAPID
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

module.exports = async ({ req, res, log, error }) => {
  try {
    const event = JSON.parse(req.body);
    
    // Extract booking data
    const bookingId = event.$id;
    const newStatus = event.status;
    const userId = event.customer_id;
    
    log(`Booking ${bookingId} status changed to: ${newStatus}`);
    
    // Initialize Appwrite client
    const client = new sdk.Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);
    
    const databases = new sdk.Databases(client);
    
    // Get notification config from systemNotificationMapper
    const notificationConfigs = {
      'location_shared': {
        pushTitle: '📍 New Booking Request',
        pushBody: 'Customer location verified. Tap to view details.',
        targetRole: 'therapist',
        priority: 'high'
      },
      'therapist_accepted': {
        pushTitle: '✅ Booking Accepted',
        pushBody: 'Your therapist has accepted! They will contact you shortly.',
        targetRole: 'customer',
        priority: 'high'
      },
      // ... other statuses
    };
    
    const config = notificationConfigs[newStatus];
    if (!config) {
      log(`No push config for status: ${newStatus}`);
      return res.json({ success: false, reason: 'no_config' });
    }
    
    // Query subscriptions for target role
    const subscriptions = await databases.listDocuments(
      'main',
      'push_subscriptions',
      [
        sdk.Query.equal('userId', [userId]),
        sdk.Query.equal('role', [config.targetRole])
      ]
    );
    
    log(`Found ${subscriptions.total} subscriptions`);
    
    // Send push to each subscription
    const results = [];
    for (const sub of subscriptions.documents) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys_p256dh,
              auth: sub.keys_auth
            }
          },
          JSON.stringify({
            title: config.pushTitle,
            body: config.pushBody,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            bookingId,
            status: newStatus,
            priority: config.priority,
            targetUrl: `/chat?bookingId=${bookingId}`,
            role: config.targetRole
          })
        );
        
        results.push({ endpoint: sub.endpoint, success: true });
        log(`✅ Sent push to: ${sub.endpoint.substring(0, 50)}...`);
      } catch (err) {
        error(`❌ Failed to send push: ${err.message}`);
        results.push({ endpoint: sub.endpoint, success: false, error: err.message });
      }
    }
    
    return res.json({
      success: true,
      bookingId,
      status: newStatus,
      subscriptions: subscriptions.total,
      results
    });
    
  } catch (err) {
    error(`Function error: ${err.message}`);
    return res.json({ success: false, error: err.message }, 500);
  }
};
```

---

## TESTING CHECKLIST

### Local Testing (Client-Side)

1. **Test Permission Request**:
   ```javascript
   import { requestNotificationPermission } from './lib/pushNotificationService';
   const permission = await requestNotificationPermission();
   console.log('Permission:', permission); // Should be 'granted'
   ```

2. **Test Service Worker Registration**:
   ```javascript
   import { registerServiceWorker } from './lib/pushNotificationService';
   const registration = await registerServiceWorker();
   console.log('SW registered:', registration); // Should not be null
   ```

3. **Test Subscription**:
   ```javascript
   import { subscribeToPush } from './lib/pushNotificationService';
   const subscription = await subscribeToPush('user123', 'customer');
   console.log('Subscription:', subscription); // Should have endpoint
   ```

4. **Test Local Notification**:
   ```javascript
   import { triggerLocalNotification } from './lib/pushNotificationService';
   await triggerLocalNotification(
     'Test Notification',
     'This is a test!',
     'booking123',
     'normal'
   );
   // Should see notification popup
   ```

### Server-Side Testing (Appwrite Function)

1. **Manually Trigger Status Change**:
   - Go to Appwrite Console → Databases → bookings
   - Update a booking status to `therapist_accepted`
   - Check Appwrite Functions logs for execution

2. **Verify Push Sent**:
   - Check browser console for push event
   - Notification should appear even if tab is closed
   - Click notification should open correct page

3. **Test All Statuses**:
   - waiting_for_location → Push to customer
   - location_shared → Push to therapist
   - therapist_accepted → Push to customer
   - on_the_way → Push to customer
   - cancelled_* → Push to both

---

## DEPLOYMENT STEPS

### 1. Appwrite Console Setup

1. **Create Collection**:
   - Name: `push_subscriptions`
   - Permissions: User (create/read own), Admin (all)
   - Add attributes (see schema above)
   - Create indexes (userId, role, endpoint)

2. **Create Function**:
   - Name: `push-notification-sender`
   - Runtime: Node.js 18
   - Trigger: Database event (bookings.update)
   - Upload function code
   - Set environment variables (VAPID keys)

3. **Test Function**:
   - Update a booking status manually
   - Check logs for execution
   - Verify push notification received

### 2. Client Deployment

1. **Update VAPID Key**:
   - Edit `lib/pushNotificationService.ts`
   - Replace `VAPID_PUBLIC_KEY` with your generated key

2. **Deploy Service Worker**:
   - Ensure `public/sw.js` is deployed
   - Service worker must be at root path (`/sw.js`)

3. **Test in Production**:
   - Open app in mobile browser
   - Grant notification permission
   - Create test booking
   - Close app/tab
   - Status change should trigger push

---

## TROUBLESHOOTING

### Issue: Permission Denied

**Solution**: User must manually grant permission. Cannot bypass browser security.

```javascript
// Add UI button to request permission
<button onClick={async () => {
  const permission = await enablePushNotifications('user123', 'customer');
  alert(permission ? 'Enabled!' : 'Denied');
}}>
  Enable Notifications
</button>
```

### Issue: Service Worker Not Registering

**Solution**: Service worker must be served from HTTPS (or localhost).

```bash
# Check service worker status
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Registrations:', registrations);
});
```

### Issue: Push Not Received

**Solutions**:
1. Check subscription stored in Appwrite
2. Verify VAPID keys match (client vs server)
3. Check Appwrite function logs for errors
4. Ensure browser supports push (Safari limited)

### Issue: Notification Not Displaying

**Solution**: Browser must have focus permission. Test with:

```javascript
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    new Notification('Test', { body: 'Working!' });
  }
});
```

---

## SECURITY CONSIDERATIONS

1. **No GPS in Payload**: Push notification body NEVER contains exact coordinates
2. **Generic Messages**: Use generic text ("Location shared" not address)
3. **HTTPS Only**: Push API requires secure origin
4. **User Consent**: Always request permission before subscribing
5. **Subscription Expiry**: Re-subscribe on pushsubscriptionchange event

---

## FUTURE ENHANCEMENTS

- [ ] Admin dashboard push notifications
- [ ] Chat message push notifications (new message alerts)
- [ ] Notification preferences (mute certain types)
- [ ] Rich notifications (images, action buttons)
- [ ] PWA offline caching with service worker
- [ ] Background sync for missed notifications
- [ ] Notification click analytics tracking

---

**Last Updated**: January 6, 2026  
**Status**: ✅ Production Ready (Client-side complete, Server-side pending)  
**Dependencies**: Web Push API, Service Workers, Appwrite Functions
