# Hotel Guest Booking System - Appwrite Implementation

## Overview
When a hotel guest books a massage, the booking is saved to Appwrite and the therapist receives a notification through the app. **No external services needed** - everything uses your existing Appwrite infrastructure.

## How It Works

### 1. Guest Books Massage
- Guest selects duration and clicks "Order Now"
- Enters name and room number
- Clicks "Proceed"
- Booking saved to Appwrite database
- Guest sees: **Booking ID** and **Booking Time**

### 2. Therapist Gets Notified
- Therapist app shows new booking in real-time
- Push notification: "New hotel booking - Room 305"
- Therapist sees all details in their dashboard
- Must confirm "On The Way" to accept

### 3. No WhatsApp/Twilio Needed
✅ All data stored in Appwrite
✅ Therapists use your app for notifications
✅ Real-time updates via Appwrite Realtime
✅ No monthly fees for external services

---

## Appwrite Database Schema

### Collection: `hotel_bookings`

```javascript
{
  bookingId: "BK12345678",           // Unique booking ID
  therapistId: "therapist_doc_id",   // Reference to therapist
  therapistName: "Ayu Prameswari",
  hotelId: "hotel_doc_id",           // Reference to hotel
  hotelName: "Grand Bali Resort",
  hotelLocation: "Jl. Sunset Road",
  guestName: "John Doe",
  roomNumber: "305",
  duration: "60",                     // minutes
  price: 250000,                      // Rupiah
  bookingTime: "Jan 15, 2025, 3:30 PM",
  status: "pending",                  // pending, confirmed, on_the_way, completed, cancelled
  createdAt: "2025-01-15T15:30:00Z",
  confirmedAt: null,
  completedAt: null
}
```

### Indexes to Create:
- `therapistId` (ASC) - for therapist's bookings list
- `hotelId` (ASC) - for hotel's bookings history  
- `status` (ASC) - for filtering active bookings
- `createdAt` (DESC) - for sorting by newest

---

## Implementation Steps

### Step 1: Create Appwrite Collection

```javascript
// In Appwrite Console or using SDK
import { databases, ID } from './lib/appwrite';

const DATABASE_ID = 'your-database-id';
const BOOKINGS_COLLECTION_ID = 'hotel_bookings';

// Create collection with attributes:
// - bookingId (string, required)
// - therapistId (string, required)
// - therapistName (string, required)
// - hotelId (string, required)
// - hotelName (string, required)
// - hotelLocation (string)
// - guestName (string, required)
// - roomNumber (string, required)
// - duration (string, required)
// - price (integer, required)
// - bookingTime (string, required)
// - status (string, required, default: "pending")
// - createdAt (datetime, required)
// - confirmedAt (datetime)
// - completedAt (datetime)
```

### Step 2: Update Frontend Code

In `HotelDashboardPage.tsx`, uncomment the Appwrite database call:

```typescript
import { databases, ID } from '../lib/appwrite';

const handleProceedBooking = async () => {
  // ... existing code ...

  // Create booking in Appwrite
  await databases.createDocument(
    'your-database-id',
    'hotel_bookings',
    ID.unique(),
    bookingData
  );
};
```

### Step 3: Therapist App Listens for Bookings

In therapist dashboard:

```typescript
import { databases } from '../lib/appwrite';
import { Query } from 'appwrite';

// Subscribe to real-time bookings
const unsubscribe = databases.listDocuments(
  'your-database-id',
  'hotel_bookings',
  [
    Query.equal('therapistId', currentTherapist.id),
    Query.equal('status', 'pending')
  ]
).then(result => {
  // Show new bookings
  setNewBookings(result.documents);
});

// Real-time updates
client.subscribe(
  `databases.your-database-id.collections.hotel_bookings.documents`,
  response => {
    if (response.events.includes('databases.*.collections.*.documents.*.create')) {
      const newBooking = response.payload;
      if (newBooking.therapistId === currentTherapist.id) {
        // Show notification
        showNotification(`New booking from ${newBooking.hotelName}!`);
        // Update UI
        addNewBooking(newBooking);
      }
    }
  }
);
```

### Step 4: Add Push Notifications (Optional)

Using Appwrite Messaging service (free):

```javascript
// In Appwrite Function or backend
import { Client, Messaging } from 'node-appwrite';

const messaging = new Messaging(client);

// Send push notification to therapist
await messaging.createPush(
  ID.unique(),
  'New Hotel Booking!',
  `${guestName} booked ${duration}min massage - Room ${roomNumber}`,
  null, // topics
  [therapistUserId], // specific user
  null, // data
  null, // action
  null, // icon
  null, // sound
  null, // color
  null, // tag
  null, // badge
);
```

---

## Notification Flow Comparison

### ❌ Old Way (Twilio/WhatsApp):
1. Guest books → Frontend calls Twilio API
2. Twilio sends WhatsApp → Costs $0.005/message
3. Therapist sees WhatsApp (external app)
4. Therapist opens your app to confirm
5. **Monthly cost: $5-50** depending on volume

### ✅ New Way (Appwrite Only):
1. Guest books → Save to Appwrite database
2. Therapist app gets real-time update (free)
3. Push notification sent via Appwrite (free)
4. Therapist sees booking in app immediately
5. One tap to confirm "On The Way"
6. **Monthly cost: $0** (included in Appwrite)

---

## Benefits

✅ **No External Dependencies**
- Everything in Appwrite ecosystem
- No third-party API keys needed
- No monthly fees

✅ **Better User Experience**
- Therapists manage everything in your app
- Real-time updates (instant notifications)
- Full booking history in one place

✅ **More Control**
- You own all the data
- Can customize notification logic
- Better analytics and reporting

✅ **Scalable**
- Appwrite handles millions of documents
- Real-time works at scale
- Built-in caching and optimization

---

## Security & Permissions

Set collection permissions:

```javascript
// In Appwrite Console → Database → hotel_bookings → Settings → Permissions

// Allow hotels to create bookings
Create: ["users"] // Any authenticated user (guest via hotel)

// Allow therapists to read their bookings
Read: ["users"] // With query filter on therapistId

// Allow therapists to update status
Update: ["users"] // Therapist can update only their bookings

// Prevent deletion
Delete: ["admin"] // Only admins can delete
```

---

## Testing

1. **Create test booking:**
   ```javascript
   // In browser console
   handleOrderNow(mockProviders[0], '60');
   // Fill form and click Proceed
   ```

2. **Check Appwrite:**
   - Go to Database → hotel_bookings
   - Verify document created
   - Check all fields populated

3. **Therapist app:**
   - Login as therapist
   - Should see new booking appear
   - Click "Confirm" → status updates to "on_the_way"

---

## Next Steps

1. ✅ Create `hotel_bookings` collection in Appwrite
2. ✅ Update frontend with actual database ID
3. ✅ Add real-time subscription to therapist dashboard
4. ✅ Implement status update flow (pending → confirmed → on_the_way → completed)
5. ✅ Add booking history view for hotels
6. ✅ (Optional) Add push notifications via Appwrite Messaging

**No Twilio, no WhatsApp API, no monthly fees - just Appwrite!** 🎉
