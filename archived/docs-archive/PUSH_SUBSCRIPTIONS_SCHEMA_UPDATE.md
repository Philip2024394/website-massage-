# Push Subscriptions Schema Update

**Date**: January 6, 2026  
**Status**: ✅ Code Updated to Match Appwrite Schema

## Schema Changes

Updated `pushNotificationService.ts` to match the actual Appwrite collection schema you created.

---

## Actual Appwrite Schema (from your collection)

| Attribute | Type | Required | Size/Notes |
|-----------|------|----------|------------|
| `$id` | string | auto | Appwrite document ID |
| `subscriptionId` | integer | ✅ | Unique subscription identifier |
| `userId` | integer | ✅ | User ID (INTEGER, not string) |
| `subscriptionType` | string | ✅ | Size: 50 (customer/therapist/admin) |
| `subscriptionStatus` | string | ✅ | Size: 20 (active/revoked/expired/blocked) |
| `createdAt` | datetime | ✅ | ISO datetime |
| `updatedAt` | datetime | ❌ | ISO datetime, nullable |
| `subscriptionDate` | datetime | ✅ | ISO datetime |
| `providerId` | integer | ✅ | Push service provider (1=Web Push API) |
| `endpoint` | string | ✅ | Size: 512 (unique identifier) |
| `p256dh` | string | ✅ | Size: 256 (ECDH public key) |
| `auth` | string | ✅ | Size: 256 (Auth secret) |
| `devicetype` | enum | ✅ | mobile, desktop, tablet, unknown |
| `userAgent` | string | ✅ | Size: 512 |
| `platform` | string | ✅ | Size: 128 |
| `$createdAt` | datetime | auto | Appwrite auto timestamp |
| `$updatedAt` | datetime | auto | Appwrite auto timestamp |

---

## Code Changes Made

### 1. Added TypeScript Interface

```typescript
interface PushSubscriptionDocument {
  subscriptionId: number;
  userId: number; // INTEGER in Appwrite
  subscriptionType: SubscriptionType;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string; // ISO datetime
  updatedAt?: string; // ISO datetime, nullable
  subscriptionDate: string; // ISO datetime
  providerId: number; // Push service provider (1=Web Push API)
  endpoint: string;
  p256dh: string;
  auth: string;
  devicetype: DeviceType;
  userAgent: string;
  platform: Platform;
}
```

### 2. Updated `storePushSubscription()`

**OLD** (incorrect schema):
```typescript
const subscriptionData = {
  userId, // String
  subscriptionStatus: 'active',
  endpoint,
  p256dh,
  auth,
  devicetype,
  platform,
  userAgent,
  subscriptionType
};
```

**NEW** (matches Appwrite):
```typescript
const now = new Date().toISOString();

const subscriptionData = {
  subscriptionId: Date.now(), // Unique subscription ID
  userId: parseInt(userId, 10) || 0, // Convert string to integer
  subscriptionType: role,
  subscriptionStatus: 'active' as SubscriptionStatus,
  createdAt: now,
  updatedAt: now,
  subscriptionDate: now,
  providerId: 1, // 1 = Web Push API (hardcoded for now)
  endpoint: subscriptionObject.endpoint,
  p256dh: subscriptionObject.keys.p256dh || '',
  auth: subscriptionObject.keys.auth || '',
  devicetype: getDeviceType(),
  userAgent: navigator.userAgent.substring(0, 512),
  platform: getPlatform()
};
```

### 3. Updated Status Management Functions

All status update functions now include `updatedAt` timestamp:

- `revokePushSubscription()`: Sets `updatedAt: new Date().toISOString()`
- `markSubscriptionExpired()`: Sets `updatedAt: new Date().toISOString()`
- `blockSubscription()`: Sets `updatedAt: new Date().toISOString()`

---

## Key Implementation Details

### userId Conversion

```typescript
userId: parseInt(userId, 10) || 0
```

- Accepts string `userId` from auth system
- Converts to integer for Appwrite
- Defaults to `0` if conversion fails (should never happen)

### subscriptionId Generation

```typescript
subscriptionId: Date.now()
```

- Uses current timestamp as unique ID
- Simple and collision-resistant for single-user devices
- Alternative: Could use crypto.randomUUID() if needed

### providerId

```typescript
providerId: 1
```

- Hardcoded to `1` (Web Push API)
- Future-proofing for multiple push providers:
  - `1` = Web Push API
  - `2` = FCM (Firebase Cloud Messaging)
  - `3` = APNs (Apple Push Notification service)
  - etc.

### DateTime Fields

All datetime fields use ISO 8601 format:

```typescript
const now = new Date().toISOString();
// Example: "2026-01-06T10:30:45.123Z"
```

- `createdAt`: Set on first subscription
- `subscriptionDate`: Same as createdAt (subscription start date)
- `updatedAt`: Updated on every status change (nullable)

---

## Required Appwrite Indexes

Based on your schema, you should create these indexes in the Appwrite Console:

### 1. Endpoint Unique Index
- **Name**: `endpoint_unique_idx`
- **Type**: Unique
- **Attributes**: `endpoint`
- **Purpose**: Prevent duplicate subscriptions

### 2. User + Type Composite Index
- **Name**: `user_role_idx`
- **Type**: Key
- **Attributes**: `userId`, `subscriptionType`
- **Purpose**: Fast role-based queries (e.g., "all therapist subscriptions")

### 3. Status Index
- **Name**: `subscription_status_idx`
- **Type**: Key
- **Attributes**: `subscriptionStatus`
- **Purpose**: Filter by status (active/revoked/expired/blocked)

### 4. User ID Index (recommended)
- **Name**: `userId_idx`
- **Type**: Key
- **Attributes**: `userId`
- **Purpose**: Fast user-specific queries

---

## Testing Checklist

- [ ] **Subscription Creation**: Create new subscription with all fields
- [ ] **Duplicate Prevention**: Same endpoint updates existing record
- [ ] **Status Lifecycle**: 
  - [ ] Active → Revoked (logout)
  - [ ] Revoked → Active (re-subscribe)
  - [ ] Active → Expired (push failure)
  - [ ] Active → Blocked (admin action)
- [ ] **Role-Based Queries**: Query by `subscriptionType` (customer/therapist/admin)
- [ ] **userId Integer**: Verify userId is stored as integer
- [ ] **DateTime Fields**: Verify all datetime fields are ISO format
- [ ] **updatedAt Tracking**: Verify updatedAt changes on status updates

---

## Sample Appwrite Document

```json
{
  "$id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "subscriptionId": 1704528645123,
  "userId": 12345,
  "subscriptionType": "customer",
  "subscriptionStatus": "active",
  "createdAt": "2026-01-06T10:30:45.123Z",
  "updatedAt": "2026-01-06T10:30:45.123Z",
  "subscriptionDate": "2026-01-06T10:30:45.123Z",
  "providerId": 1,
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "p256dh": "BEL62iUYgUivxIkv69yViEuiBIa...",
  "auth": "tBHItJI5svbpez7KI4CCXg==",
  "devicetype": "mobile",
  "userAgent": "Mozilla/5.0 (Linux; Android 10; SM-G973F)...",
  "platform": "android",
  "$createdAt": "2026-01-06T10:30:45.123Z",
  "$updatedAt": "2026-01-06T10:30:45.123Z"
}
```

---

## Differences from Previous Implementation

| Field | Previous (Session 6) | Current (Your Schema) | Change |
|-------|---------------------|---------------------|--------|
| `userId` | String (255) | Integer | **Type change** |
| `subscriptionId` | ❌ Not included | Integer, required | **NEW field** |
| `providerId` | ❌ Not included | Integer, required | **NEW field** |
| `createdAt` | ❌ Not included | Datetime, required | **NEW field** |
| `updatedAt` | ❌ Not included | Datetime, nullable | **NEW field** |
| `subscriptionDate` | ❌ Not included | Datetime, required | **NEW field** |
| `devicetype` | String (20) | Enum | **Type refinement** |

---

## Security Notes

1. **userId Privacy**: 
   - User IDs are integers, not sensitive
   - No user names or emails stored
   
2. **No GPS Coordinates**: ✅ Schema doesn't include location data

3. **Endpoint as Unique ID**: ✅ Still using endpoint for uniqueness check

4. **Audit Trail**: ✅ All datetime fields support audit tracking

5. **Role-Based Access**: ✅ subscriptionType enables role-based targeting

---

## Next Steps

1. ✅ **Code Updated** - pushNotificationService.ts matches your schema
2. ⏳ **Create Indexes** - Add 4 indexes in Appwrite Console (see above)
3. ⏳ **Test Subscription** - Create a test subscription and verify all fields
4. ⏳ **Test Lifecycle** - Test active → revoked → active flow
5. ⏳ **Test Queries** - Verify role-based queries work with indexes

---

## Questions for You

1. **providerId**: Should this always be `1` (Web Push API), or do you plan to support multiple push providers?

2. **subscriptionId**: Is `Date.now()` acceptable, or should we use `crypto.randomUUID()` for better uniqueness?

3. **userId Source**: How do you get user IDs? Are they from Appwrite's `$id` (string) or a separate integer ID field?

4. **Indexes**: Should I add the 4th index (`userId_idx`), or are the 3 documented indexes sufficient?

Let me know if you need any adjustments to the implementation!
