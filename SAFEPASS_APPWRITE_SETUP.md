# SafePass Appwrite Collection Setup

## Quick Setup Guide

### Step 1: Create Collection

1. Go to Appwrite Console → Database
2. Select database: `68f76ee1000e64ca8d05`
3. Create new collection with ID: `safepass`

### Step 2: Configure Attributes

Create the following attributes in order:

#### 1. entityType (Required)
- **Type:** String (Enum)
- **Key:** `entityType`
- **Size:** 50
- **Required:** Yes
- **Array:** No
- **Elements:** `therapist`, `place`

#### 2. entityId (Required)
- **Type:** String
- **Key:** `entityId`
- **Size:** 200
- **Required:** Yes
- **Array:** No

#### 3. entityName (Required)
- **Type:** String
- **Key:** `entityName`
- **Size:** 255
- **Required:** Yes
- **Array:** No

#### 4. hotelVillaSafePassStatus (Required)
- **Type:** String (Enum)
- **Key:** `hotelVillaSafePassStatus`
- **Required:** Yes
- **Array:** No
- **Elements:** `pending`, `approved`, `active`, `rejected`

#### 5. hasSafePassVerification (Required)
- **Type:** Boolean
- **Key:** `hasSafePassVerification`
- **Required:** Yes
- **Default:** false

#### 6. hotelVillaLetters (Optional)
- **Type:** String
- **Key:** `hotelVillaLetters`
- **Size:** 200
- **Required:** No
- **Array:** No

#### 7. safePassSubmittedAt (Required)
- **Type:** DateTime
- **Key:** `safePassSubmittedAt`
- **Required:** Yes

#### 8. safePassApprovedAt (Optional)
- **Type:** DateTime
- **Key:** `safePassApprovedAt`
- **Required:** No

#### 9. safePassApprovedBy (Optional)
- **Type:** String
- **Key:** `safePassApprovedBy`
- **Size:** 200
- **Required:** No

#### 10. safePassRejectionReason (Optional)
- **Type:** String
- **Key:** `safePassRejectionReason`
- **Size:** 400
- **Required:** No

#### 11. safePassIssuedAt (Required)
- **Type:** DateTime
- **Key:** `safePassIssuedAt`
- **Required:** Yes

#### 12. safePassExpiry (Required)
- **Type:** DateTime
- **Key:** `safePassExpiry`
- **Required:** Yes

#### 13. safePassCardUrl (Optional)
- **Type:** String
- **Key:** `safePassCardUrl`
- **Size:** 250
- **Required:** No

#### 14. safePassPaymentId (Optional)
- **Type:** String
- **Key:** `safePassPaymentId`
- **Size:** 250
- **Required:** No

### Step 3: Configure Indexes

Create the following indexes for query performance:

1. **entityLookup**
   - Type: Key
   - Attributes: `entityType` (ASC), `entityId` (ASC)
   - Purpose: Fast lookup of applications by entity

2. **statusIndex**
   - Type: Key
   - Attributes: `hotelVillaSafePassStatus` (ASC)
   - Purpose: Filter applications by status

3. **submissionDate**
   - Type: Key
   - Attributes: `safePassSubmittedAt` (DESC)
   - Purpose: Sort applications by submission date

### Step 4: Configure Permissions

Set the following permissions:

#### Read Access
- **Role:** `users` (Any authenticated user can read their own applications)
- **Permissions:** `read("users")`

#### Create Access
- **Role:** `users` (Authenticated users can create applications)
- **Permissions:** `create("users")`

#### Update Access
- **Role:** `team:admins` (Only admins can update applications)
- **Permissions:** `update("team:admins")`

#### Delete Access
- **Role:** `team:admins` (Only admins can delete applications)
- **Permissions:** `delete("team:admins")`

### Step 5: Verify Collection

Run this test query in Appwrite Console:

```javascript
const databases = new Databases(client);

// Test create
const test = await databases.createDocument(
    '68f76ee1000e64ca8d05',
    'safepass',
    ID.unique(),
    {
        entityType: 'therapist',
        entityId: 'test-123',
        entityName: 'Test Therapist',
        hotelVillaSafePassStatus: 'pending',
        hasSafePassVerification: false,
        safePassSubmittedAt: new Date().toISOString(),
        safePassIssuedAt: new Date().toISOString(),
        safePassExpiry: new Date(Date.now() + 63072000000).toISOString() // +2 years
    }
);

console.log('Test successful:', test.$id);

// Clean up
await databases.deleteDocument(
    '68f76ee1000e64ca8d05',
    'safepass',
    test.$id
);
```

## Alternative: Import Collection via CLI

If you prefer using Appwrite CLI, save this configuration and import it:

```json
{
  "$id": "safepass",
  "name": "SafePass Applications",
  "enabled": true,
  "documentSecurity": true,
  "attributes": [
    {
      "key": "entityType",
      "type": "string",
      "size": 50,
      "required": true,
      "array": false,
      "elements": ["therapist", "place"]
    },
    {
      "key": "entityId",
      "type": "string",
      "size": 200,
      "required": true,
      "array": false
    },
    {
      "key": "entityName",
      "type": "string",
      "size": 255,
      "required": true,
      "array": false
    },
    {
      "key": "hotelVillaSafePassStatus",
      "type": "string",
      "required": true,
      "array": false,
      "elements": ["pending", "approved", "active", "rejected"]
    },
    {
      "key": "hasSafePassVerification",
      "type": "boolean",
      "required": true,
      "default": false
    },
    {
      "key": "hotelVillaLetters",
      "type": "string",
      "size": 200,
      "required": false,
      "array": false
    },
    {
      "key": "safePassSubmittedAt",
      "type": "datetime",
      "required": true
    },
    {
      "key": "safePassApprovedAt",
      "type": "datetime",
      "required": false
    },
    {
      "key": "safePassApprovedBy",
      "type": "string",
      "size": 200,
      "required": false
    },
    {
      "key": "safePassRejectionReason",
      "type": "string",
      "size": 400,
      "required": false
    },
    {
      "key": "safePassIssuedAt",
      "type": "datetime",
      "required": true
    },
    {
      "key": "safePassExpiry",
      "type": "datetime",
      "required": true
    },
    {
      "key": "safePassCardUrl",
      "type": "string",
      "size": 250,
      "required": false
    },
    {
      "key": "safePassPaymentId",
      "type": "string",
      "size": 250,
      "required": false
    }
  ],
  "indexes": [
    {
      "key": "entityLookup",
      "type": "key",
      "attributes": ["entityType", "entityId"],
      "orders": ["ASC", "ASC"]
    },
    {
      "key": "statusIndex",
      "type": "key",
      "attributes": ["hotelVillaSafePassStatus"],
      "orders": ["ASC"]
    },
    {
      "key": "submissionDate",
      "type": "key",
      "attributes": ["safePassSubmittedAt"],
      "orders": ["DESC"]
    }
  ]
}
```

Then import:

```bash
appwrite databases createCollection \
  --databaseId 68f76ee1000e64ca8d05 \
  --collectionId safepass \
  --name "SafePass Applications" \
  --permissions "read(\"users\")" "create(\"users\")" "update(\"team:admins\")" "delete(\"team:admins\")"
```

## Testing

After setup, test the system:

1. **Admin Panel:** Navigate to `/admin/safepass`
   - Should show empty state
   - Statistics should show all zeros

2. **Therapist Application:** Navigate to `/therapist/safepass-apply`
   - Should show application form
   - Should allow document upload

3. **Place Application:** Navigate to `/place/safepass-apply`
   - Should show application form
   - Should allow document upload

## Troubleshooting

### Collection Not Found Error
- Verify collection ID is exactly `safepass`
- Check database ID matches environment variable

### Permission Denied Error
- Ensure user is authenticated
- Verify permissions are set correctly
- Check admin role for admin operations

### Upload Failed Error
- Check storage bucket exists
- Verify bucket permissions allow uploads
- Ensure file size is under 10MB

## Support

If you encounter issues during setup, check:
1. Appwrite console logs
2. Browser console for errors
3. Network tab for API requests
4. Environment variables are correctly set
