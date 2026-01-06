# PUSH_SUBSCRIPTIONS COLLECTION - APPWRITE SETUP

**Collection ID**: `push_subscriptions`  
**Database**: `main` (68f76ee1000e64ca8d05)  
**Status**: ✅ Ready for Production

---

## 🔧 REQUIRED APPWRITE CONFIGURATION

### Step 1: Create Collection

**Console**: https://syd.cloud.appwrite.io/console/project-68f23b11000d25eb3664/databases/database-68f76ee1000e64ca8d05

**Collection Name**: `push_subscriptions`

---

### Step 2: Add Attributes

**CRITICAL**: Add attributes in this exact order with exact names and types.

| # | Attribute Name | Type | Size | Required | Default | Notes |
|---|---------------|------|------|----------|---------|-------|
| 1 | userId | String | 255 | ✅ Yes | - | Appwrite user ID |
| 2 | subscriptionStatus | String | 20 | ✅ Yes | 'active' | Enum: active, revoked, expired, blocked |
| 3 | endpoint | String | 512 | ✅ Yes | - | Web Push endpoint (UNIQUE) |
| 4 | p256dh | String | 256 | ✅ Yes | - | ECDH public key |
| 5 | auth | String | 256 | ✅ Yes | - | Auth secret |
| 6 | devicetype | String | 20 | ✅ Yes | 'unknown' | Enum: mobile, desktop, tablet, unknown |
| 7 | platform | String | 128 | ✅ Yes | 'web' | Enum: web, android, ios, desktop |
| 8 | userAgent | String | 512 | ✅ Yes | - | Browser user agent |
| 9 | subscriptionType | String | 20 | ✅ Yes | 'customer' | Enum: customer, therapist, admin (ROLE) |

**DO NOT ADD**:
- ❌ subscriptionId (not used - Appwrite $id is automatic)
- ❌ providerId (not used)
- ❌ createdAt (use $createdAt)
- ❌ updatedAt (use $updatedAt)

---

### Step 3: Create Indexes

**CRITICAL**: These indexes are required for performance and uniqueness.

#### Index 1: Endpoint Uniqueness
- **Name**: `endpoint_unique_idx`
- **Type**: Unique
- **Attribute**: `endpoint`
- **Purpose**: Prevent duplicate subscriptions

**Console Command**:
```
Index Type: unique
Attributes: endpoint
```

#### Index 2: User + Role Query
- **Name**: `user_role_idx`
- **Type**: Key (Composite)
- **Attributes**: `userId`, `subscriptionType`
- **Purpose**: Fast query by user and role

**Console Command**:
```
Index Type: key
Attributes: userId, subscriptionType (in order)
```

#### Index 3: Subscription Status
- **Name**: `subscription_status_idx`
- **Type**: Key
- **Attribute**: `subscriptionStatus`
- **Purpose**: Filter active/revoked/expired subscriptions

**Console Command**:
```
Index Type: key
Attributes: subscriptionStatus
```

---

### Step 4: Set Permissions

**Permissions Configuration**:

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| **Users** | ✅ | Own documents | Own documents | Own documents |
| **Admin** | ✅ | ✅ All | ✅ All | ✅ All |

**Console Settings**:
```
Document Security: Enabled
Permissions:
- Role: Users
  - Create: Yes
  - Read: Document level (userId matches current user)
  - Update: Document level (userId matches current user)
  - Delete: Document level (userId matches current user)

- Role: Admin
  - Create: Yes
  - Read: Yes (all documents)
  - Update: Yes (all documents)
  - Delete: Yes (all documents)
```

---

## 📝 FIELD SPECIFICATIONS

### subscriptionStatus (String, Enum)

**Allowed Values**:
- `active` - Subscription is active and receiving push notifications
- `revoked` - User disabled notifications or logged out (audit trail)
- `expired` - Push service returned 410 Gone (subscription expired)
- `blocked` - Spam prevention or abuse (manual admin action)

**Transitions**:
```
active → revoked (user disables, logout)
active → expired (push service 410/404 error)
active → blocked (admin action, spam prevention)
revoked → active (user re-enables)
expired → active (user re-subscribes)
```

**Query Examples**:
```typescript
// Get active subscriptions only
Query.equal('subscriptionStatus', ['active'])

// Get all non-active
Query.notEqual('subscriptionStatus', ['active'])
```

---

### devicetype (String, Enum)

**Allowed Values**:
- `mobile` - Mobile phone (Android/iOS)
- `desktop` - Desktop computer (Windows/Mac/Linux)
- `tablet` - Tablet device (iPad, Android tablets)
- `unknown` - Cannot determine device type

**Auto-Detection**:
Automatically detected from `navigator.userAgent` via `getDeviceType()` function.

---

### platform (String, Enum)

**Allowed Values**:
- `web` - Web browser (Chrome, Firefox, Safari)
- `android` - Android app/browser
- `ios` - iOS app/browser (limited support)
- `desktop` - Desktop app (Electron, PWA)

**Auto-Detection**:
Automatically detected from `navigator.userAgent` via `getPlatform()` function.

---

### subscriptionType (String, Enum) - ROLE

**Allowed Values**:
- `customer` - Customer/user role
- `therapist` - Therapist/provider role
- `admin` - Administrator role

**Purpose**: Determines which notifications this subscription receives.

**Notification Targeting**:
```typescript
// Customer receives:
- waiting_for_location (location verification prompt)
- therapist_accepted (booking accepted)
- on_the_way (therapist en route)
- cancelled_* (cancellation alerts)

// Therapist receives:
- location_shared (new booking request)
- cancelled_by_user (customer cancelled)

// Both receive:
- cancelled_no_location
- cancelled_by_admin
- completed
```

---

## 🔐 SECURITY RULES

### ✅ Implemented

1. **Endpoint as Unique Identifier**:
   - `endpoint` field has unique index
   - Query by endpoint before create/update
   - Prevents duplicate subscriptions

2. **No GPS in Collection**:
   - NEVER store GPS coordinates here
   - NEVER store exact addresses
   - Only generic metadata (device type, platform)

3. **User Ownership**:
   - Users can only read/update/delete own subscriptions
   - `userId` must match authenticated user
   - Admin can access all for debugging

4. **Audit Trail**:
   - Never delete subscriptions (use status = 'revoked')
   - Keep expired subscriptions for analytics
   - Track subscription lifecycle via status changes

5. **Fail-Safe**:
   - Push failures never block booking/chat flows
   - Missing subscription → no error, just no push
   - Invalid subscription → mark as expired, continue

---

## 📊 USAGE PATTERNS

### Pattern 1: Subscribe New User

```typescript
import { subscribeToPush } from './lib/pushNotificationService';

// User grants permission
const subscription = await subscribeToPush('user123', 'customer');

// Result: New document created in push_subscriptions
// - endpoint: "https://fcm.googleapis.com/fcm/send/..."
// - subscriptionStatus: "active"
// - subscriptionType: "customer"
// - $id: Auto-generated by Appwrite
```

### Pattern 2: Existing User Re-Subscribes

```typescript
// User already has subscription, re-subscribes
const subscription = await subscribeToPush('user123', 'customer');

// Result: Existing document updated (queried by endpoint)
// - subscriptionStatus: "active" (reactivated if was revoked)
// - userAgent: Updated with current browser
// - devicetype: Updated if changed
```

### Pattern 3: User Logs Out

```typescript
import { revokePushSubscription } from './lib/pushNotificationService';

// User logs out
await revokePushSubscription();

// Result: Subscription marked as revoked (NOT deleted)
// - subscriptionStatus: "revoked"
// - Document kept for audit trail
// - Browser unsubscribed
```

### Pattern 4: Push Delivery Failure

```typescript
import { markSubscriptionExpired } from './lib/pushNotificationService';

// Server-side: Push service returns 410 Gone
await markSubscriptionExpired(endpoint);

// Result: Subscription marked as expired
// - subscriptionStatus: "expired"
// - User will need to re-subscribe
```

### Pattern 5: Spam Prevention

```typescript
import { blockSubscription } from './lib/pushNotificationService';

// Admin blocks abusive subscription
await blockSubscription(endpoint);

// Result: Subscription blocked
// - subscriptionStatus: "blocked"
// - No push notifications sent
```

---

## 🧪 TESTING CHECKLIST

### Collection Setup Verification

- [ ] Collection `push_subscriptions` exists
- [ ] All 9 attributes added with correct types/sizes
- [ ] Index `endpoint_unique_idx` created (unique)
- [ ] Index `user_role_idx` created (composite: userId + subscriptionType)
- [ ] Index `subscription_status_idx` created
- [ ] Permissions set correctly (Users: own, Admin: all)

### Subscription Flow Testing

- [ ] New subscription creates document successfully
- [ ] Endpoint uniqueness enforced (no duplicates)
- [ ] Re-subscription updates existing document
- [ ] Revoked status prevents push delivery
- [ ] Expired subscriptions can be reactivated
- [ ] Blocked subscriptions cannot receive push

### Query Performance Testing

```typescript
// Test 1: Query by endpoint (should be FAST - unique index)
const byEndpoint = await databases.listDocuments(
  'main',
  'push_subscriptions',
  [Query.equal('endpoint', ['https://fcm...'])]
);
console.log('Found by endpoint:', byEndpoint.total); // Should be 0 or 1

// Test 2: Query by user + role (should be FAST - composite index)
const byUserRole = await databases.listDocuments(
  'main',
  'push_subscriptions',
  [
    Query.equal('userId', ['user123']),
    Query.equal('subscriptionType', ['customer'])
  ]
);
console.log('Found by user+role:', byUserRole.total);

// Test 3: Query active subscriptions (should be FAST - status index)
const active = await databases.listDocuments(
  'main',
  'push_subscriptions',
  [Query.equal('subscriptionStatus', ['active'])]
);
console.log('Active subscriptions:', active.total);
```

---

## 🚨 COMMON ISSUES

### Issue: "Duplicate endpoint error"

**Cause**: Unique index `endpoint_unique_idx` prevents duplicates  
**Solution**: Code already handles this - queries by endpoint first, then updates

### Issue: "Attribute not found"

**Cause**: Attribute name mismatch  
**Solution**: Verify exact attribute names:
- ✅ `userId` (not `user_id`)
- ✅ `subscriptionStatus` (not `status`)
- ✅ `subscriptionType` (not `role`)
- ✅ `devicetype` (not `deviceType`)
- ✅ `p256dh` (not `keys_p256dh`)
- ✅ `auth` (not `keys_auth`)

### Issue: "Permission denied"

**Cause**: User trying to access other user's subscription  
**Solution**: Ensure permissions set to "Document level" with userId check

### Issue: "Index not used (slow query)"

**Cause**: Missing index or incorrect query  
**Solution**: Verify all 3 indexes created, use exact attribute names in queries

---

## 📈 ANALYTICS QUERIES

### Active Subscriptions by Role

```typescript
// Customer subscriptions
const customers = await databases.listDocuments(
  'main', 'push_subscriptions',
  [
    Query.equal('subscriptionType', ['customer']),
    Query.equal('subscriptionStatus', ['active'])
  ]
);

// Therapist subscriptions
const therapists = await databases.listDocuments(
  'main', 'push_subscriptions',
  [
    Query.equal('subscriptionType', ['therapist']),
    Query.equal('subscriptionStatus', ['active'])
  ]
);

console.log(`Active: ${customers.total} customers, ${therapists.total} therapists`);
```

### Subscription Status Breakdown

```typescript
const active = await databases.listDocuments('main', 'push_subscriptions', [Query.equal('subscriptionStatus', ['active'])]);
const revoked = await databases.listDocuments('main', 'push_subscriptions', [Query.equal('subscriptionStatus', ['revoked'])]);
const expired = await databases.listDocuments('main', 'push_subscriptions', [Query.equal('subscriptionStatus', ['expired'])]);
const blocked = await databases.listDocuments('main', 'push_subscriptions', [Query.equal('subscriptionStatus', ['blocked'])]);

console.log(`Status: ${active.total} active, ${revoked.total} revoked, ${expired.total} expired, ${blocked.total} blocked`);
```

### Device Distribution

```typescript
const mobile = await databases.listDocuments('main', 'push_subscriptions', [Query.equal('devicetype', ['mobile'])]);
const desktop = await databases.listDocuments('main', 'push_subscriptions', [Query.equal('devicetype', ['desktop'])]);
const tablet = await databases.listDocuments('main', 'push_subscriptions', [Query.equal('devicetype', ['tablet'])]);

console.log(`Devices: ${mobile.total} mobile, ${desktop.total} desktop, ${tablet.total} tablet`);
```

---

## ✅ FINAL CHECKLIST

Before going live, verify:

- [ ] Collection created with exact name `push_subscriptions`
- [ ] All 9 attributes added (userId, subscriptionStatus, endpoint, p256dh, auth, devicetype, platform, userAgent, subscriptionType)
- [ ] Unique index on `endpoint` (endpoint_unique_idx)
- [ ] Composite index on `userId` + `subscriptionType` (user_role_idx)
- [ ] Index on `subscriptionStatus` (subscription_status_idx)
- [ ] Permissions configured (Users: own, Admin: all)
- [ ] Test subscription creation works
- [ ] Test duplicate prevention works (unique endpoint)
- [ ] Test status transitions (active → revoked → active)
- [ ] Test query performance with indexes
- [ ] No TypeScript errors in pushNotificationService.ts

---

**Last Updated**: January 6, 2026  
**Status**: ✅ Production Ready  
**Required Manual Steps**: Create collection + attributes + indexes in Appwrite Console
