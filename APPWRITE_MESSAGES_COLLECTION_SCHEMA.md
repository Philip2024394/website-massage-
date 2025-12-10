# 💬 Appwrite Messages Collection Schema

## Collection: `messages`

**Purpose:** Store real-time chat messages between customers, therapists, and admins

**Collection ID:** `messages`

---

## 📋 Attributes

| Attribute | Type | Size | Required | Default | Description |
|-----------|------|------|----------|---------|-------------|
| `conversationId` | String | 255 | ✅ Yes | - | Unique ID for conversation (e.g., `customer_123_therapist_456`) |
| `senderId` | String | 255 | ✅ Yes | - | Appwrite User ID of sender |
| `senderRole` | String | 50 | ✅ Yes | - | `customer`, `therapist`, `admin` |
| `senderName` | String | 255 | ✅ Yes | - | Display name of sender |
| `receiverId` | String | 255 | ✅ Yes | - | Appwrite User ID of receiver |
| `receiverRole` | String | 50 | ✅ Yes | - | `customer`, `therapist`, `admin` |
| `receiverName` | String | 255 | ✅ Yes | - | Display name of receiver |
| `message` | String | 10000 | ✅ Yes | - | Message content (text) |
| `messageType` | String | 50 | ✅ Yes | `text` | `text`, `image`, `file`, `booking`, `system` |
| `bookingId` | String | 255 | ❌ No | - | Link to booking if message is booking-related |
| `imageUrl` | String | 500 | ❌ No | - | Image URL if messageType is `image` |
| `fileUrl` | String | 500 | ❌ No | - | File URL if messageType is `file` |
| `isRead` | Boolean | - | ✅ Yes | `false` | Whether receiver has read the message |
| `readAt` | DateTime | - | ❌ No | - | When message was read |
| `isDelivered` | Boolean | - | ✅ Yes | `false` | Whether message was delivered |
| `deliveredAt` | DateTime | - | ❌ No | - | When message was delivered |
| `metadata` | String (JSON) | 5000 | ❌ No | `{}` | Additional data (flexible JSON) |

---

## 🔐 Permissions

### Read Access:
```javascript
// Users can read messages where they are sender OR receiver
[
  Permission.read(Role.user('[senderId]')),
  Permission.read(Role.user('[receiverId]')),
  Permission.read(Role.label('admin'))
]
```

### Write Access:
```javascript
// Users can create messages where they are the sender
[
  Permission.create(Role.user('[senderId]')),
  Permission.update(Role.user('[senderId]')),
  Permission.update(Role.user('[receiverId]')), // Allow receiver to mark as read
  Permission.delete(Role.label('admin')) // Only admin can delete
]
```

---

## 📊 Indexes

**For optimal query performance:**

| Index Name | Type | Attributes | Order |
|------------|------|------------|-------|
| `idx_conversation` | Key | `conversationId`, `$createdAt` | DESC |
| `idx_sender` | Key | `senderId`, `$createdAt` | DESC |
| `idx_receiver` | Key | `receiverId`, `isRead`, `$createdAt` | DESC |
| `idx_booking` | Key | `bookingId`, `$createdAt` | DESC |

---

## 🔍 Common Queries

### Get all messages in a conversation:
```javascript
databases.listDocuments(
  DATABASE_ID,
  'messages',
  [
    Query.equal('conversationId', conversationId),
    Query.orderDesc('$createdAt'),
    Query.limit(100)
  ]
);
```

### Get unread messages for user:
```javascript
databases.listDocuments(
  DATABASE_ID,
  'messages',
  [
    Query.equal('receiverId', userId),
    Query.equal('isRead', false),
    Query.orderDesc('$createdAt')
  ]
);
```

### Get all conversations for user:
```javascript
// Get unique conversations (requires aggregation in code)
databases.listDocuments(
  DATABASE_ID,
  'messages',
  [
    Query.or([
      Query.equal('senderId', userId),
      Query.equal('receiverId', userId)
    ]),
    Query.orderDesc('$createdAt'),
    Query.limit(100)
  ]
);
```

---

## 🔄 Real-time Subscriptions

### Subscribe to new messages in conversation:
```javascript
client.subscribe(
  `databases.${DATABASE_ID}.collections.messages.documents`,
  (response) => {
    const message = response.payload;
    if (message.conversationId === currentConversationId) {
      // Add message to chat
      addMessageToChat(message);
    }
  }
);
```

### Subscribe to unread count:
```javascript
client.subscribe(
  `databases.${DATABASE_ID}.collections.messages.documents`,
  (response) => {
    const message = response.payload;
    if (message.receiverId === currentUserId && !message.isRead) {
      // Update unread count
      incrementUnreadCount();
    }
  }
);
```

---

## 📱 Message Types

### `text` - Regular text message
```json
{
  "messageType": "text",
  "message": "Hello! When are you available?"
}
```

### `booking` - Booking-related notification
```json
{
  "messageType": "booking",
  "message": "Your booking has been confirmed!",
  "bookingId": "booking_123",
  "metadata": {
    "bookingDate": "2025-12-15",
    "duration": "60",
    "price": "350000"
  }
}
```

### `image` - Image message
```json
{
  "messageType": "image",
  "message": "Check out this location!",
  "imageUrl": "https://cloud.appwrite.io/v1/storage/buckets/.../preview"
}
```

### `system` - System-generated message
```json
{
  "messageType": "system",
  "message": "Therapist accepted your booking request",
  "metadata": {
    "action": "booking_accepted",
    "bookingId": "booking_123"
  }
}
```

---

## 🎯 Conversation ID Format

**Format:** `{role1}_{userId1}_{role2}_{userId2}`

**Important:** Always sort alphabetically to ensure consistent conversation IDs

**Example:**
```javascript
function generateConversationId(user1, user2) {
  const participants = [
    { role: user1.role, id: user1.id },
    { role: user2.role, id: user2.id }
  ].sort((a, b) => a.id.localeCompare(b.id));
  
  return `${participants[0].role}_${participants[0].id}_${participants[1].role}_${participants[1].id}`;
}

// Example output: "customer_abc123_therapist_def456"
```

---

## 🚀 Auto-Messages Integration

**Trigger automatic messages when:**

### Booking Created:
```javascript
await messagingService.sendSystemMessage({
  senderId: 'system',
  senderRole: 'admin',
  senderName: 'IndaStreet',
  receiverId: therapistId,
  receiverRole: 'therapist',
  receiverName: therapistName,
  message: `New booking request from ${customerName} for ${duration} minutes on ${date}`,
  messageType: 'booking',
  bookingId: booking.$id
});
```

### Booking Accepted:
```javascript
await messagingService.sendSystemMessage({
  senderId: therapistId,
  senderRole: 'therapist',
  senderName: therapistName,
  receiverId: customerId,
  receiverRole: 'customer',
  receiverName: customerName,
  message: `Your booking has been accepted! ${therapistName} will contact you shortly.`,
  messageType: 'booking',
  bookingId: booking.$id
});
```

### Booking Declined:
```javascript
await messagingService.sendSystemMessage({
  senderId: therapistId,
  senderRole: 'therapist',
  senderName: therapistName,
  receiverId: customerId,
  receiverRole: 'customer',
  receiverName: customerName,
  message: `Unfortunately, this booking request cannot be fulfilled. We're finding an alternative provider for you.`,
  messageType: 'booking',
  bookingId: booking.$id
});
```

---

## ✅ SETUP CHECKLIST

- [ ] Create `messages` collection in Appwrite
- [ ] Add all attributes with correct types
- [ ] Set up permissions (read/write/delete)
- [ ] Create indexes for performance
- [ ] Test real-time subscriptions
- [ ] Integrate with booking system
- [ ] Add push notification triggers
- [ ] Test message delivery
- [ ] Test unread counts
- [ ] Test conversation grouping

---

## 📦 Related Collections

This messaging system integrates with:
- `users` - User profiles and authentication
- `bookings` - Link messages to specific bookings
- `therapists` - Therapist profiles
- `places` - Place profiles

---

**Ready to implement!** 🚀
