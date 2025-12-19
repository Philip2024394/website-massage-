# Appwrite Collection Setup: user_registrations

## Collection Information
**Collection ID**: `user_registrations`  
**Purpose**: Track user registrations with device fingerprint and IP for welcome bonus fraud prevention

## Attributes

### Required Attributes

| Attribute Name | Type | Size | Required | Default | Description |
|----------------|------|------|----------|---------|-------------|
| `userId` | String | 128 | ✅ | - | Appwrite user ID ($id from auth) |
| `userType` | Enum | - | ✅ | - | Type of user: `customer`, `therapist`, `place` |
| `deviceId` | String | 256 | ✅ | - | Unique device fingerprint hash |
| `ipAddress` | String | 45 | ✅ | - | User's IP address (IPv4 or IPv6) |
| `hasReceivedWelcomeBonus` | Boolean | - | ✅ | `false` | Whether user claimed welcome bonus |
| `registrationDate` | DateTime | - | ✅ | - | When user registered (ISO 8601) |

### Optional Attributes

| Attribute Name | Type | Size | Required | Default | Description |
|----------------|------|------|----------|---------|-------------|
| `welcomeBonusAmount` | Integer | - | ❌ | - | Number of coins awarded (100) |
| `firstLoginDate` | DateTime | - | ❌ | - | First time user logged in after registration |

## Indexes

Create these indexes for optimal query performance:

### Index 1: Device Lookup
- **Type**: Key
- **Attribute**: `deviceId`
- **Order**: ASC
- **Purpose**: Check if device already registered

### Index 2: IP Lookup
- **Type**: Key  
- **Attribute**: `ipAddress`
- **Order**: ASC
- **Purpose**: Check if IP already used for registration

### Index 3: User Lookup
- **Type**: Key
- **Attribute**: `userId`
- **Order**: ASC
- **Purpose**: Find all registrations for specific user

### Index 4: Registration Date
- **Type**: Key
- **Attribute**: `registrationDate`
- **Order**: DESC
- **Purpose**: Sort by most recent registrations

## Permissions

### Read Access
```
Role: Any
Permission: Read
```
✅ Users can view their own registration records  
❌ Users cannot view other users' records (implement user filter in queries)

### Write Access
```
Role: Any
Permission: Create
```
✅ Users can create registration records  
❌ Users cannot update/delete records (server-side only)

### Recommended Settings
```json
{
  "permissions": {
    "read": ["role:all"],
    "create": ["role:all"],
    "update": ["role:admins"],
    "delete": ["role:admins"]
  }
}
```

## Sample Data

```json
{
  "userId": "67e3a1b2000f45678901",
  "userType": "customer",
  "deviceId": "a7f3d2e8c4b1",
  "ipAddress": "103.255.4.22",
  "hasReceivedWelcomeBonus": true,
  "welcomeBonusAmount": 100,
  "registrationDate": "2025-10-29T08:30:00.000Z",
  "firstLoginDate": "2025-10-29T08:30:15.000Z"
}
```

## Queries Used

### Check for Duplicate Registration
```typescript
const response = await databases.listDocuments(
    DATABASE_ID,
    'user_registrations',
    [
        Query.or([
            Query.equal('deviceId', deviceId),
            Query.equal('ipAddress', ipAddress)
        ]),
        Query.orderDesc('registrationDate'),
        Query.limit(1)
    ]
);
```

### Create Registration Record
```typescript
await databases.createDocument(
    DATABASE_ID,
    'user_registrations',
    'unique()',
    {
        userId: 'user_123',
        userType: 'customer',
        deviceId: 'abc123',
        ipAddress: '192.168.1.1',
        hasReceivedWelcomeBonus: false,
        registrationDate: new Date().toISOString()
    }
);
```

### Update After Bonus Award
```typescript
await databases.updateDocument(
    DATABASE_ID,
    'user_registrations',
    documentId,
    {
        hasReceivedWelcomeBonus: true,
        welcomeBonusAmount: 100,
        firstLoginDate: new Date().toISOString()
    }
);
```

## Privacy & Security

### Data Retention
- **Keep**: 1 year minimum (fraud detection)
- **Archive**: After 2 years (compliance)
- **Delete**: After 3 years (GDPR right to be forgotten)

### Encryption
- ✅ IP addresses should be hashed/encrypted at rest
- ✅ Device fingerprints are already hashed
- ✅ Use HTTPS for all API calls

### GDPR Compliance
- ✅ Minimal data collection (purpose-limited)
- ✅ User can request deletion
- ✅ Clear purpose in privacy policy
- ✅ No third-party sharing

## Testing

### Create Test Collection (Development)
1. Go to Appwrite Console
2. Navigate to your database
3. Click "Add Collection"
4. Name: `user_registrations_test`
5. Add all attributes above
6. Create indexes
7. Set permissions

### Test Queries
```typescript
// Test duplicate detection
const device = 'test_device_123';
const ip = '127.0.0.1';

// First registration (should succeed)
await recordUserRegistration('user_1', 'customer', device, ip);

// Second registration (should be detected)
const existing = await checkExistingRegistration(device, ip);
console.log(existing); // Should return first registration
```

## Migration Script

If you have existing users, run this migration to create registration records:

```typescript
import { databases } from './lib/appwrite';
import { Query } from 'appwrite';

async function migrateExistingUsers() {
    // Get all users
    const users = await databases.listDocuments(
        DATABASE_ID,
        'users_collection_id',
        [Query.limit(100)]
    );
    
    for (const user of users.documents) {
        // Create registration record for existing users
        await databases.createDocument(
            DATABASE_ID,
            'user_registrations',
            'unique()',
            {
                userId: user.$id,
                userType: 'customer',
                deviceId: 'migrated_user',
                ipAddress: '0.0.0.0',
                hasReceivedWelcomeBonus: false, // Existing users don't get retroactive bonus
                registrationDate: user.createdAt || new Date().toISOString()
            }
        );
    }
    
    console.log(`✅ Migrated ${users.documents.length} users`);
}
```

## Monitoring

### Key Metrics
- Total registrations
- Welcome bonus claim rate
- Duplicate detection rate
- Average registrations per IP
- Average registrations per device

### Alert Triggers
- ⚠️ Same IP > 5 registrations/day
- ⚠️ Same device > 3 registrations/day
- 🚨 Same IP > 20 registrations/day (potential attack)

### Analytics Query
```typescript
// Count registrations by date
const today = new Date().toISOString().split('T')[0];
const registrations = await databases.listDocuments(
    DATABASE_ID,
    'user_registrations',
    [
        Query.greaterThan('registrationDate', today),
        Query.limit(1000)
    ]
);

console.log(`Registrations today: ${registrations.total}`);
```

## Troubleshooting

### "Collection not found"
1. Verify collection ID in `appwrite.config.ts`
2. Check Appwrite console for collection existence
3. Ensure database ID is correct

### "Insufficient permissions"
1. Check collection permissions
2. Verify user authentication
3. Enable "Any" role for read/create

### "Duplicate document"
1. Use `'unique()'` for document ID
2. Don't manually set $id
3. Let Appwrite generate IDs

### "Attribute validation failed"
1. Check string lengths (userId: 128, deviceId: 256, ipAddress: 45)
2. Verify enum values: customer, therapist, place
3. Ensure required fields are present

## Cost Estimation

### Storage
- Average document size: ~500 bytes
- 10,000 users: 5 MB
- 100,000 users: 50 MB
- **Cost**: Negligible (within free tier)

### Bandwidth
- 1 read on registration check
- 1 write on registration
- **Cost**: ~2KB per registration

### Queries
- ~3 queries per new registration
- **Cost**: Within free tier limits

## Next Steps

1. ✅ Create collection in Appwrite Console
2. ✅ Add all attributes
3. ✅ Create indexes
4. ✅ Set permissions
5. ✅ Test with sample data
6. ✅ Update `appwrite.config.ts` with collection ID
7. ✅ Deploy to production
8. ✅ Monitor for issues

---

**Status**: Ready for production ✨
