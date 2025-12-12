# Appwrite Database Schema for Chat Sessions

## Quick Reference Card

### Collection: `chat_sessions`

#### Attributes Configuration

| Attribute Name | Type | Required | Size/Options | Default | Description |
|---------------|------|----------|--------------|---------|-------------|
| `sessionId` | String | ✅ Yes | 255 | - | Unique session identifier |
| `customerId` | String | ✅ Yes | 255 | - | Customer/user ID |
| `customerName` | String | ❌ No | 255 | null | Customer display name |
| `customerWhatsApp` | String | ❌ No | 20 | null | Customer WhatsApp number |
| `providerId` | String | ✅ Yes | 255 | - | Therapist/provider ID |
| `providerName` | String | ✅ Yes | 255 | - | Provider display name |
| `providerType` | String | ✅ Yes | 50 | therapist | Enum: therapist, place, hotel, villa |
| `providerStatus` | String | ✅ Yes | 20 | available | Enum: available, busy, offline |
| `mode` | String | ✅ Yes | 20 | immediate | Enum: immediate, scheduled |
| `pricing60` | Float | ❌ No | - | null | 60-minute session price |
| `pricing90` | Float | ❌ No | - | null | 90-minute session price |
| `pricing120` | Float | ❌ No | - | null | 120-minute session price |
| `discountPercentage` | Float | ❌ No | - | null | Discount percentage (0-100) |
| `discountActive` | Boolean | ❌ No | - | false | Whether discount is active |
| `profilePicture` | String | ❌ No | 500 | null | Provider profile picture URL |
| `providerRating` | Float | ❌ No | - | null | Provider rating (0-5) |
| `bookingId` | String | ❌ No | 255 | null | Associated booking ID |
| `chatRoomId` | String | ❌ No | 255 | null | Associated chat room ID |
| `isActive` | Boolean | ✅ Yes | - | true | Whether session is active |
| `createdAt` | DateTime | ✅ Yes | - | - | Session creation timestamp |
| `updatedAt` | DateTime | ✅ Yes | - | - | Last update timestamp |
| `expiresAt` | DateTime | ✅ Yes | - | - | Session expiration timestamp (24 hours) |

#### Indexes

| Index Name | Type | Attributes | Order | Purpose |
|-----------|------|------------|-------|---------|
| `active_sessions` | Fulltext | `customerId`, `providerId`, `isActive` | - | Find active sessions for user/provider pair |
| `user_sessions` | Fulltext | `customerId`, `isActive` | - | Find all active sessions for a user |
| `provider_sessions` | Fulltext | `providerId`, `isActive` | - | Find all active sessions for a provider |
| `session_expiry` | Key | `expiresAt` | ASC | Cleanup expired sessions |
| `session_timeline` | Key | `createdAt` | DESC | Sort sessions by creation time |

#### Permissions

```javascript
// Create Permission - Users can create their own sessions
{
  "role": "users",
  "permission": "create"
}

// Read Permission - Users can read their own sessions
{
  "role": "users", 
  "permission": "read"
}

// Update Permission - Users can update their own sessions
{
  "role": "users",
  "permission": "update"
}

// Delete Permission - Users can delete their own sessions
{
  "role": "users",
  "permission": "delete"
}
```

## Collection Setup Instructions

### Step 1: Create Collection
1. Navigate to Appwrite Console → Database
2. Create new collection with ID: `chat_sessions`
3. Set collection name: "Chat Sessions"

### Step 2: Add Attributes
Execute these attribute creations in order:

```javascript
// Required String Attributes
sessionId: String, Required, Size: 255
customerId: String, Required, Size: 255  
providerId: String, Required, Size: 255
providerName: String, Required, Size: 255
providerType: String, Required, Size: 50, Default: "therapist"
providerStatus: String, Required, Size: 20, Default: "available"
mode: String, Required, Size: 20, Default: "immediate"

// Optional String Attributes  
customerName: String, Optional, Size: 255
customerWhatsApp: String, Optional, Size: 20
profilePicture: String, Optional, Size: 500
bookingId: String, Optional, Size: 255
chatRoomId: String, Optional, Size: 255

// Float Attributes
pricing60: Float, Optional
pricing90: Float, Optional  
pricing120: Float, Optional
discountPercentage: Float, Optional
providerRating: Float, Optional

// Boolean Attributes
discountActive: Boolean, Optional, Default: false
isActive: Boolean, Required, Default: true

// DateTime Attributes
createdAt: DateTime, Required
updatedAt: DateTime, Required  
expiresAt: DateTime, Required
```

### Step 3: Create Indexes
1. **active_sessions** (Fulltext): `customerId`, `providerId`, `isActive`
2. **user_sessions** (Fulltext): `customerId`, `isActive`  
3. **provider_sessions** (Fulltext): `providerId`, `isActive`
4. **session_expiry** (Key): `expiresAt` (ASC)
5. **session_timeline** (Key): `createdAt` (DESC)

### Step 4: Set Permissions
Configure permissions for role "users":
- ✅ Create
- ✅ Read  
- ✅ Update
- ✅ Delete

### Step 5: Verify Configuration
The collection should be accessible via:
```typescript
import { databases } from './lib/appwrite.config';
import { APPWRITE_CONFIG } from './lib/appwrite.config';

// Collection ID should be: 'chat_sessions'
const collectionId = APPWRITE_CONFIG.collections.chatSessions;
```

## Usage Example

```typescript
import { chatSessionService } from './services/chatSessionService';

// Create new session
const session = await chatSessionService.createSession({
  customerId: 'user123',
  customerName: 'John Doe',
  providerId: 'therapist456', 
  providerName: 'Jane Smith',
  mode: 'immediate',
  pricing: { '60': 100, '90': 140, '120': 180 }
});

// Check for active session
const activeSession = await chatSessionService.getActiveSession('therapist456');

// Update session
await chatSessionService.updateSession(session.sessionId, {
  providerStatus: 'busy',
  bookingId: 'booking789'
});

// Close session
await chatSessionService.closeSession(session.sessionId);
```

## Notes

- Sessions automatically expire after 24 hours
- Multiple active sessions per user are allowed (different providers)
- Only one active session per user-provider pair
- Cleanup of expired sessions happens automatically
- Graceful fallback to local state if Appwrite operations fail
- Session data includes all necessary info for chat window rendering