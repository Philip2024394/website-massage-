# Appwrite Database Schema for Chat System

## Quick Reference Card

### Collection: `chat_messages`

#### Attributes Configuration

| Attribute Name | Type | Required | Size/Options | Default | Description |
|---------------|------|----------|--------------|---------|-------------|
| `senderId` | String | ✅ Yes | 255 | - | ID of message sender |
| `senderName` | String | ✅ Yes | 255 | - | Name of sender |
| `senderType` | String | ✅ Yes | 50 | - | Type: admin, therapist, place, hotel, villa, user, agent |
| `recipientId` | String | ✅ Yes | 255 | - | ID of message recipient |
| `recipientName` | String | ✅ Yes | 255 | - | Name of recipient |
| `recipientType` | String | ✅ Yes | 50 | - | Type: admin, therapist, place, hotel, villa, user, agent |
| `message` | String | ✅ Yes | 5000 | - | Message content |
| `timestamp` | DateTime | ✅ Yes | - | - | Message timestamp |
| `read` | Boolean | ✅ Yes | - | false | Read status |
| `messageType` | String | ✅ Yes | 20 | text | Enum: text, file, location, system |
| `fileUrl` | String | ❌ No | 500 | null | URL to uploaded file |
| `fileName` | String | ❌ No | 255 | null | Name of uploaded file |
| `location` | String | ❌ No | 500 | null | JSON string: {"latitude": 0, "longitude": 0} |
| `keepForever` | Boolean | ❌ No | - | false | Prevent auto-deletion |

#### Indexes

| Index Name | Type | Attributes | Order | Purpose |
|-----------|------|------------|-------|---------|
| `chat_participants` | Fulltext | `senderId`, `recipientId` | - | Find all messages between two users |
| `unread_messages` | Fulltext | `recipientId`, `read` | - | Find unread messages for a user |
| `message_timeline` | Key | `timestamp` | ASC | Sort messages by time |

#### Permissions

```javascript
// Create Permission
{
  "role": "users",
  "permission": "create"
}

// Read Permission
{
  "role": "users",
  "permission": "read"
}

// Update Permission (for marking as read)
{
  "role": "users",
  "permission": "update"
}

// Delete Permission (admin only)
{
  "role": "team:admins", // Or your admin role
  "permission": "delete"
}
```

---

### Storage Bucket: `chat_attachments`

#### Configuration

| Setting | Value |
|---------|-------|
| **Bucket ID** | `chat_attachments` |
| **Bucket Name** | Chat Attachments |
| **Maximum File Size** | 10485760 (10 MB) |
| **Allowed Extensions** | `jpg`, `jpeg`, `png`, `pdf`, `doc`, `docx` |
| **Compression** | Enabled (for images) |
| **Encryption** | Enabled |
| **Antivirus** | Enabled (if available) |

#### Permissions

```javascript
// Create Permission
{
  "role": "users",
  "permission": "create"
}

// Read Permission
{
  "role": "users",
  "permission": "read"
}

// Delete Permission (admin only)
{
  "role": "team:admins",
  "permission": "delete"
}
```

---

### Additional Collection Updates

Add `chatBlocked` attribute to existing collections:

#### Collections to Update

1. **therapists**
2. **places**
3. **hotels**
4. **villas**
5. **users**
6. **agents**

#### New Attribute

| Attribute Name | Type | Required | Default | Description |
|---------------|------|----------|---------|-------------|
| `chatBlocked` | Boolean | ❌ No | false | Whether chat is blocked by admin |

---

## Sample Appwrite Queries

### 1. Get All Messages Between User and Admin

```javascript
const messages = await databases.listDocuments(
  DATABASE_ID,
  'chat_messages',
  [
    Query.or([
      Query.and([
        Query.equal('senderId', userId),
        Query.equal('recipientId', 'admin')
      ]),
      Query.and([
        Query.equal('senderId', 'admin'),
        Query.equal('recipientId', userId)
      ])
    ]),
    Query.orderAsc('timestamp'),
    Query.limit(100)
  ]
);
```

### 2. Get Unread Messages for User

```javascript
const unreadMessages = await databases.listDocuments(
  DATABASE_ID,
  'chat_messages',
  [
    Query.equal('recipientId', userId),
    Query.equal('read', false),
    Query.orderDesc('timestamp')
  ]
);
```

### 3. Mark Message as Read

```javascript
await databases.updateDocument(
  DATABASE_ID,
  'chat_messages',
  messageId,
  { read: true }
);
```

### 4. Get Last Message for Each User (Admin View)

```javascript
// Get all unique users
const therapists = await databases.listDocuments(DATABASE_ID, 'therapists');
const places = await databases.listDocuments(DATABASE_ID, 'places');
// etc...

// For each user, get last message
for (const user of allUsers) {
  const lastMessage = await databases.listDocuments(
    DATABASE_ID,
    'chat_messages',
    [
      Query.or([
        Query.and([
          Query.equal('senderId', user.$id),
          Query.equal('recipientId', 'admin')
        ]),
        Query.and([
          Query.equal('senderId', 'admin'),
          Query.equal('recipientId', user.$id)
        ])
      ]),
      Query.orderDesc('timestamp'),
      Query.limit(1)
    ]
  );
}
```

### 5. Count Unread Messages

```javascript
const unreadCount = await databases.listDocuments(
  DATABASE_ID,
  'chat_messages',
  [
    Query.equal('recipientId', userId),
    Query.equal('senderId', 'admin'),
    Query.equal('read', false)
  ]
);

const count = unreadCount.total;
```

### 6. Upload File to Storage

```javascript
const file = event.target.files[0];

const uploadResponse = await storage.createFile(
  'chat_attachments',
  ID.unique(),
  file
);

const fileUrl = storage.getFileView('chat_attachments', uploadResponse.$id);
```

### 7. Create Message with File

```javascript
await databases.createDocument(
  DATABASE_ID,
  'chat_messages',
  ID.unique(),
  {
    senderId: userId,
    senderName: userName,
    senderType: userType,
    recipientId: 'admin',
    recipientName: 'IndaStreet Team',
    recipientType: 'admin',
    message: `📎 Sent a file: ${fileName}`,
    timestamp: new Date().toISOString(),
    read: false,
    messageType: 'file',
    fileUrl: fileUrl,
    fileName: fileName
  }
);
```

### 8. Create System Message (Block Notification)

```javascript
await databases.createDocument(
  DATABASE_ID,
  'chat_messages',
  ID.unique(),
  {
    senderId: 'system',
    senderName: 'System',
    senderType: 'system',
    recipientId: userId,
    recipientName: userName,
    recipientType: userType,
    message: '⚠️ This chat has been suspended until further notice. Please contact support.\n\n- IndaStreet Team',
    timestamp: new Date().toISOString(),
    read: false,
    messageType: 'system',
    keepForever: true
  }
);
```

### 9. Share Location

```javascript
navigator.geolocation.getCurrentPosition(async (position) => {
  const { latitude, longitude } = position.coords;
  
  await databases.createDocument(
    DATABASE_ID,
    'chat_messages',
    ID.unique(),
    {
      senderId: userId,
      senderName: userName,
      senderType: userType,
      recipientId: 'admin',
      recipientName: 'IndaStreet Team',
      recipientType: 'admin',
      message: `📍 Shared location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      timestamp: new Date().toISOString(),
      read: false,
      messageType: 'location',
      location: JSON.stringify({ latitude, longitude })
    }
  );
});
```

---

## Database Schema SQL Export (For Reference)

```sql
-- chat_messages collection schema

CREATE TABLE chat_messages (
  id VARCHAR(255) PRIMARY KEY,
  senderId VARCHAR(255) NOT NULL,
  senderName VARCHAR(255) NOT NULL,
  senderType VARCHAR(50) NOT NULL,
  recipientId VARCHAR(255) NOT NULL,
  recipientName VARCHAR(255) NOT NULL,
  recipientType VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  messageType VARCHAR(20) NOT NULL DEFAULT 'text',
  fileUrl VARCHAR(500),
  fileName VARCHAR(255),
  location VARCHAR(500),
  keepForever BOOLEAN DEFAULT FALSE,
  
  INDEX idx_chat_participants (senderId, recipientId),
  INDEX idx_unread_messages (recipientId, read),
  INDEX idx_message_timeline (timestamp ASC)
);

-- chatBlocked field for user collections

ALTER TABLE therapists ADD COLUMN chatBlocked BOOLEAN DEFAULT FALSE;
ALTER TABLE places ADD COLUMN chatBlocked BOOLEAN DEFAULT FALSE;
ALTER TABLE hotels ADD COLUMN chatBlocked BOOLEAN DEFAULT FALSE;
ALTER TABLE villas ADD COLUMN chatBlocked BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN chatBlocked BOOLEAN DEFAULT FALSE;
ALTER TABLE agents ADD COLUMN chatBlocked BOOLEAN DEFAULT FALSE;
```

---

## Quick Setup Checklist

### ✅ Step 1: Create Collection
- [ ] Go to Appwrite Console → Databases → Your Database
- [ ] Click "Add Collection"
- [ ] Name: `chat_messages`
- [ ] Click "Create Collection"

### ✅ Step 2: Add Attributes
- [ ] Add all 14 attributes from table above
- [ ] Set required/optional correctly
- [ ] Set default values
- [ ] Set appropriate sizes

### ✅ Step 3: Add Indexes
- [ ] Add `chat_participants` index
- [ ] Add `unread_messages` index
- [ ] Add `message_timeline` index

### ✅ Step 4: Set Permissions
- [ ] Add "users" create permission
- [ ] Add "users" read permission
- [ ] Add "users" update permission
- [ ] Add "admins" delete permission

### ✅ Step 5: Create Storage Bucket
- [ ] Go to Storage → Add Bucket
- [ ] Name: `chat_attachments`
- [ ] Set max size: 10MB
- [ ] Set allowed extensions: jpg, jpeg, png, pdf, doc, docx
- [ ] Enable encryption and antivirus

### ✅ Step 6: Set Storage Permissions
- [ ] Add "users" create permission
- [ ] Add "users" read permission
- [ ] Add "admins" delete permission

### ✅ Step 7: Update User Collections
- [ ] Add `chatBlocked` boolean to `therapists`
- [ ] Add `chatBlocked` boolean to `places`
- [ ] Add `chatBlocked` boolean to `hotels`
- [ ] Add `chatBlocked` boolean to `villas`
- [ ] Add `chatBlocked` boolean to `users`
- [ ] Add `chatBlocked` boolean to `agents`

---

## Testing Queries

Test these queries in Appwrite Console to verify setup:

1. **Test Create Message**
   ```javascript
   {
     "senderId": "test-user-1",
     "senderName": "Test User",
     "senderType": "user",
     "recipientId": "admin",
     "recipientName": "Admin",
     "recipientType": "admin",
     "message": "Hello admin!",
     "timestamp": "2025-01-15T10:00:00Z",
     "read": false,
     "messageType": "text"
   }
   ```

2. **Test Query Messages**
   - Filter by `recipientId` = "admin"
   - Order by `timestamp` DESC
   - Should return test message

3. **Test Update Read Status**
   - Update message `read` = true
   - Should succeed

4. **Test File Upload**
   - Upload a test image to `chat_attachments`
   - Should succeed and return file ID
   - Get file view URL
   - Should return valid URL

---

**Last Updated:** January 2025  
**Schema Version:** 1.0
