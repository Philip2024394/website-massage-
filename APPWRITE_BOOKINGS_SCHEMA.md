# Appwrite Bookings Collection - Required Attributes

## Collection Name: `bookings`

### Required Attributes

Add these attributes to your Appwrite bookings collection:

| Attribute Name | Type | Size | Required | Default | Description |
|---------------|------|------|----------|---------|-------------|
| `bookingId` | String | 255 | ✅ Yes | - | Unique booking identifier |
| `therapistId` | String | 255 | ✅ Yes | - | ID of therapist/place |
| `therapistName` | String | 255 | ✅ Yes | - | Name of therapist/place |
| `therapistType` | String | 50 | ✅ Yes | - | Either 'therapist' or 'place' |
| `duration` | Integer | - | ✅ Yes | - | Duration in minutes (60/90/120) |
| `price` | Integer | - | ✅ Yes | - | Price in dollars |
| `status` | String | 50 | ✅ Yes | - | 'pending', 'confirmed', 'expired', 'completed' |
| `createdAt` | DateTime | - | ✅ Yes | - | Booking creation timestamp |
| `responseDeadline` | DateTime | - | ✅ Yes | - | Therapist must respond before this |

### Optional Attributes (Recommended)

| Attribute Name | Type | Size | Required | Default | Description |
|---------------|------|------|----------|---------|-------------|
| `scheduledTime` | DateTime | - | ❌ No | - | For scheduled bookings (future time) |
| `customerName` | String | 255 | ❌ No | - | Customer's full name |
| `customerWhatsApp` | String | 50 | ❌ No | - | Customer's WhatsApp number |
| `bookingType` | String | 50 | ❌ No | - | 'immediate' or 'scheduled' |
| `providerId` | String | 255 | ❌ No | - | Alternative provider ID |
| `providerType` | String | 50 | ❌ No | - | Alternative provider type |
| `hotelVillaId` | String | 255 | ❌ No | - | Hotel/Villa ID if booked from venue |
| `roomNumber` | String | 50 | ❌ No | - | **Hotel/Villa room number** |

### Collection Permissions

**Create Documents:**
- Any (or authenticated users if you want login required)

**Read Documents:**
- Any (or specific roles: customer, therapist, admin)

**Update Documents:**
- Therapist (to accept/decline)
- Admin

**Delete Documents:**
- Admin only

---

## How to Add Attributes in Appwrite Console

1. **Login to Appwrite Console**: `https://cloud.appwrite.io/console`
2. **Navigate to Database**: Select your project → Database → `bookings` collection
3. **Click "Attributes"** tab
4. **Add each attribute** using the "+ Create Attribute" button

### Step-by-Step for Each Attribute:

#### 1. bookingId (String)
- Click "+ Create Attribute"
- Select "String"
- Attribute Key: `bookingId`
- Size: `255`
- Required: ✅ Checked
- Default: (leave empty)
- Array: ❌ Unchecked
- Click "Create"

#### 2. therapistId (String)
- Attribute Key: `therapistId`
- Size: `255`
- Required: ✅ Checked

#### 3. therapistName (String)
- Attribute Key: `therapistName`
- Size: `255`
- Required: ✅ Checked

#### 4. therapistType (String)
- Attribute Key: `therapistType`
- Size: `50`
- Required: ✅ Checked

#### 5. duration (Integer)
- Click "+ Create Attribute"
- Select "Integer"
- Attribute Key: `duration`
- Required: ✅ Checked
- Min: `60`
- Max: `120`

#### 6. price (Integer)
- Attribute Key: `price`
- Required: ✅ Checked
- Min: `0`
- Max: `1000`

#### 7. status (String)
- Attribute Key: `status`
- Size: `50`
- Required: ✅ Checked

#### 8. createdAt (DateTime)
- Click "+ Create Attribute"
- Select "DateTime"
- Attribute Key: `createdAt`
- Required: ✅ Checked

#### 9. responseDeadline (DateTime)
- Attribute Key: `responseDeadline`
- Required: ✅ Checked

#### 10. scheduledTime (DateTime) - OPTIONAL
- Attribute Key: `scheduledTime`
- Required: ❌ Unchecked

#### 11. customerName (String) - OPTIONAL
- Attribute Key: `customerName`
- Size: `255`
- Required: ❌ Unchecked

#### 12. customerWhatsApp (String) - OPTIONAL
- Attribute Key: `customerWhatsApp`
- Size: `50`
- Required: ❌ Unchecked

#### 13. bookingType (String) - OPTIONAL
- Attribute Key: `bookingType`
- Size: `50`
- Required: ❌ Unchecked

#### 14. providerId (String) - OPTIONAL
- Attribute Key: `providerId`
- Size: `255`
- Required: ❌ Unchecked

#### 15. providerType (String) - OPTIONAL
- Attribute Key: `providerType`
- Size: `50`
- Required: ❌ Unchecked

#### 16. hotelVillaId (String) - OPTIONAL
- Attribute Key: `hotelVillaId`
- Size: `255`
- Required: ❌ Unchecked

#### 17. roomNumber (String) - OPTIONAL ⭐ NEW
- Attribute Key: `roomNumber`
- Size: `50`
- Required: ❌ Unchecked
- **Purpose**: Store hotel/villa room number for live menu bookings

---

## Usage in Code

### Immediate Booking (BookingPopup.tsx)
```typescript
const bookingData = {
  bookingId: crypto.randomUUID(),
  therapistId,
  therapistName,
  therapistType: 'therapist', // or 'place'
  duration: 60, // 90 or 120
  price: 50,
  status: 'pending',
  createdAt: new Date().toISOString(),
  responseDeadline: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  bookingType: 'immediate',
  // Optional for hotel/villa bookings:
  hotelVillaId: '...',
  roomNumber: '101' // Customer's room number
};
```

### Scheduled Booking (ScheduleBookingPopup.tsx)
```typescript
const bookingData = {
  bookingId: crypto.randomUUID(),
  therapistId,
  therapistName,
  therapistType: 'therapist', // or 'place'
  duration: 60, // 90 or 120
  price: 50,
  status: 'pending',
  createdAt: new Date().toISOString(),
  responseDeadline: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  scheduledTime: new Date('2025-11-04T14:30:00').toISOString(),
  customerName: 'John Doe',
  customerWhatsApp: '+62812345678',
  bookingType: 'scheduled',
  // Optional for hotel/villa bookings:
  hotelVillaId: '...',
  roomNumber: '205' // Customer's room number
};
```

---

## Important Notes

⚠️ **After adding attributes:**
1. Wait 1-2 minutes for Appwrite to sync the schema
2. Refresh your app in the browser
3. Try creating a booking again

⚠️ **Room Number Usage:**
- Only collect room number when booking is made from hotel/villa context
- Show room number input field only if `hotelVillaId` is present
- Room number helps hotel staff locate the customer for service delivery

⚠️ **Document ID:**
- We use `bookingId` as both the document ID and an attribute
- This ensures consistency and satisfies Appwrite schema validation

---

## Quick Checklist

Before testing bookings, ensure:
- [ ] All 9 required attributes are added to Appwrite
- [ ] Collection permissions allow document creation
- [ ] `bookingId` is set as String (255) and Required
- [ ] `createdAt` and `responseDeadline` are DateTime type
- [ ] `duration` and `price` are Integer type
- [ ] Optional attributes added: `scheduledTime`, `customerName`, `customerWhatsApp`, `bookingType`, `roomNumber`
- [ ] Dev server restarted after schema changes
- [ ] Browser cache cleared (hard refresh: Ctrl+Shift+R)

---

**Created:** 2025-11-04  
**Status:** Ready for implementation
