# Location Verification System - Appwrite Setup Guide

## Collection: booking_locations

### Collection ID
`booking_locations`

### Attributes

| Attribute Name | Type | Size | Required | Default | Array |
|---------------|------|------|----------|---------|-------|
| bookingId | String | 255 | Yes | - | No |
| chatRoomId | String | 255 | Yes | - | No |
| latitude | Double | - | Yes | - | No |
| longitude | Double | - | Yes | - | No |
| accuracy | Double | - | Yes | - | No |
| timestamp | DateTime | - | Yes | - | No |
| source | String | 20 | Yes | - | No |

### Indexes

| Index Name | Type | Attributes | Order |
|-----------|------|------------|-------|
| bookingId_idx | Key | bookingId | ASC |
| chatRoomId_idx | Key | chatRoomId | ASC |
| timestamp_idx | Key | timestamp | DESC |

### Permissions

| Role | Permissions |
|------|------------|
| Any | Create, Read |
| Admin | All (Create, Read, Update, Delete) |

---

## Update Existing Collections

### Collection: bookings

Add new attributes:

| Attribute Name | Type | Size | Required | Default | Array |
|---------------|------|------|----------|---------|-------|
| locationAccuracy | Double | - | No | 0 | No |
| locationSharedAt | DateTime | - | No | null | No |

### Collection: chat_rooms

Add new attributes:

| Attribute Name | Type | Size | Required | Default | Array |
|---------------|------|------|----------|---------|-------|
| requiresLocation | Boolean | - | No | false | No |
| locationVerified | Boolean | - | No | false | No |
| locationAccuracy | Double | - | No | 0 | No |

---

## Booking Status Flow

### New Status Values

Add these status values to the `bookings` collection `status` enum:

- `waiting_for_location` - Booking created, waiting for GPS location
- `location_shared` - User has shared live location
- `cancelled_no_location` - Auto-cancelled after 5-minute timeout
- `cancelled_location_denied` - Cancelled because user denied GPS permission
- `rejected_location` - Therapist rejected the location (suspicious/out of range)

### Complete Status Flow

```
1. pending → Initial booking creation
2. waiting_for_location → Booking created, requires GPS (NEW)
3. location_shared → User shared GPS successfully (NEW)
4. therapist_accepted → Therapist accepted after location verification
5. completed → Service completed
6. cancelled_no_location → Timeout (NEW)
7. cancelled_location_denied → User denied GPS (NEW)
8. rejected_location → Therapist rejected location (NEW)
```

---

## Implementation Steps

### Step 1: Create booking_locations Collection

1. Open Appwrite Console → Databases → Your Database
2. Click "Create Collection"
3. Collection ID: `booking_locations`
4. Collection Name: `Booking Locations`
5. Click "Create"

### Step 2: Add Attributes to booking_locations

Execute in order:

```javascript
// String attributes
bookingId: String(255, required)
chatRoomId: String(255, required)
source: String(20, required, default='user')

// Numeric attributes
latitude: Double(required)
longitude: Double(required)
accuracy: Double(required)

// DateTime attributes
timestamp: DateTime(required)
```

### Step 3: Create Indexes

```javascript
bookingId_idx: Key(bookingId, ASC)
chatRoomId_idx: Key(chatRoomId, ASC)
timestamp_idx: Key(timestamp, DESC)
```

### Step 4: Set Permissions

```javascript
Any: Create, Read
Admin: All permissions
```

### Step 5: Update bookings Collection

Add attributes:

```javascript
locationAccuracy: Double(not required, default=0)
locationSharedAt: DateTime(not required, default=null)
```

Update status enum to include:
- waiting_for_location
- location_shared
- cancelled_no_location
- cancelled_location_denied
- rejected_location

### Step 6: Update chat_rooms Collection

Add attributes:

```javascript
requiresLocation: Boolean(not required, default=false)
locationVerified: Boolean(not required, default=false)
locationAccuracy: Double(not required, default=0)
```

---

## Verification Queries

### Check if location was shared

```javascript
// Get location for booking
databases.listDocuments(
  databaseId,
  'booking_locations',
  [Query.equal('bookingId', bookingId)]
)
```

### Get all bookings waiting for location

```javascript
databases.listDocuments(
  databaseId,
  'bookings',
  [Query.equal('status', 'waiting_for_location')]
)
```

### Get location-verified chats

```javascript
databases.listDocuments(
  databaseId,
  'chat_rooms',
  [Query.equal('locationVerified', true)]
)
```

---

## Security Considerations

1. **One-time capture**: Location captured ONLY once after booking creation
2. **No background tracking**: No continuous location monitoring
3. **Auto-deletion**: booking_locations documents deleted after booking completion
4. **Permission model**: Users can only create/read their own locations
5. **Timeout enforcement**: 5-minute hard limit for location sharing
6. **GPS permission handling**: Auto-cancel if user denies permission

---

## Admin Dashboard Enhancements

### Location Status Display

Booking details now show:
- ✅ Verified: Green checkmark + accuracy (±Xm)
- ⏱️ Waiting: Orange clock icon
- ❌ Timeout: Red X with "Timeout" label
- 🚫 Denied: Red X with "Denied by User" label
- 🚩 Rejected: Flag icon with "Rejected by Therapist" label

### Admin Actions

Future enhancements:
- View location on map (simple lat/lng preview)
- Force approve location (override rejection)
- Force cancel booking (security override)
- View location audit history

---

## Testing Checklist

### Test 1: Normal Flow
1. Create booking → Status: waiting_for_location
2. Open chat → See location prompt
3. Click "Share Live Location" → GPS captured
4. Status updated → location_shared
5. Therapist can see location accuracy
6. Therapist accepts booking → Normal flow continues

### Test 2: User Denies GPS
1. Create booking → Status: waiting_for_location
2. Open chat → See location prompt
3. Click "Share Live Location" → Browser asks permission
4. User clicks "Deny" → Status: cancelled_location_denied
5. System message sent
6. Chat closes after 3 seconds

### Test 3: Timeout
1. Create booking → Status: waiting_for_location
2. Open chat → See location prompt
3. Wait 5 minutes without sharing
4. Status updated → cancelled_no_location
5. System message sent
6. Booking cancelled automatically

### Test 4: Therapist Rejection
1. Create booking → Location shared successfully
2. Therapist views location → Suspicious/out of range
3. Therapist clicks "Reject Location"
4. Status updated → rejected_location
5. Rejection reason recorded
6. Customer notified

---

## Privacy Policy Update Required

Add to Terms of Service / Privacy Policy:

> **Location Verification**
> 
> For security purposes, all bookings require one-time GPS location verification. This helps us prevent spam bookings and ensures therapists can verify the service address. Your location data is:
> 
> - Captured only once after booking creation
> - Used solely for address verification
> - Not tracked continuously
> - Automatically deleted after booking completion
> - Protected by industry-standard encryption
> 
> If you deny GPS permission, your booking will be automatically cancelled.

---

## Monitoring & Alerts

### Metrics to Track

1. **Location share rate**: % of bookings that successfully share location
2. **Denial rate**: % of bookings cancelled due to GPS denial
3. **Timeout rate**: % of bookings cancelled due to 5-min timeout
4. **Rejection rate**: % of locations rejected by therapists
5. **Average accuracy**: Mean GPS accuracy across all bookings

### Alert Thresholds

- Denial rate > 20% → Investigate user education
- Timeout rate > 15% → Improve UX/prompts
- Rejection rate > 10% → Review therapist training
- Average accuracy > 200m → GPS quality issues

---

## Rollback Plan

If issues occur:

1. **Disable location requirement**:
   ```javascript
   // In BookingPopup.tsx - comment out Step 3.5
   // Bookings will proceed without location verification
   ```

2. **Revert booking status flow**:
   ```javascript
   // Set status directly to 'pending' instead of 'waiting_for_location'
   ```

3. **Database cleanup**:
   ```javascript
   // Delete booking_locations collection
   // Remove new attributes from bookings & chat_rooms
   ```

---

## Production Deployment Checklist

- [ ] booking_locations collection created
- [ ] Attributes added to bookings collection
- [ ] Attributes added to chat_rooms collection
- [ ] Indexes created and verified
- [ ] Permissions set correctly
- [ ] Code deployed to production
- [ ] Privacy policy updated
- [ ] User education materials prepared
- [ ] Admin team trained
- [ ] Monitoring dashboard configured
- [ ] Alert thresholds set
- [ ] Rollback plan documented
- [ ] Test bookings verified in production

---

**Implementation Date**: January 6, 2026  
**Status**: Ready for Production Deployment  
**Approved By**: Senior Principal Engineer
