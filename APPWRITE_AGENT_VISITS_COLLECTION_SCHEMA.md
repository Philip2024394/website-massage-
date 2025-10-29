# Appwrite Collection Schema: `agent_visits`

## Collection Details
- **Collection Name:** `agent_visits`
- **Collection ID:** `agent_visits_collection_id` (replace with actual ID after creation)
- **Database ID:** `68f76ee1000e64ca8d05`

---

## Attributes Configuration

| # | Attribute Key | Type | Size/Format | Required | Default | Array | Description |
|---|--------------|------|-------------|----------|---------|-------|-------------|
| 1 | `agentId` | String | 255 | ✅ Yes | - | ❌ No | Agent's unique ID ($id or numeric id) |
| 2 | `agentName` | String | 255 | ✅ Yes | - | ❌ No | Agent's full name |
| 3 | `agentCode` | String | 50 | ✅ Yes | - | ❌ No | Agent's unique code (e.g., "AG001") |
| 4 | `providerName` | String | 255 | ✅ Yes | - | ❌ No | Name of therapist or massage place |
| 5 | `providerType` | Enum | - | ✅ Yes | - | ❌ No | Type: `therapist` or `place` |
| 6 | `whatsappNumber` | String | 50 | ✅ Yes | - | ❌ No | Provider's WhatsApp contact number |
| 7 | `visitDate` | DateTime | ISO 8601 | ✅ Yes | - | ❌ No | When the visit occurred |
| 8 | `locationLat` | Float | - | ✅ Yes | - | ❌ No | GPS Latitude (6+ decimals) |
| 9 | `locationLng` | Float | - | ✅ Yes | - | ❌ No | GPS Longitude (6+ decimals) |
| 10 | `locationAddress` | String | 1000 | ✅ Yes | - | ❌ No | Reverse geocoded address |
| 11 | `locationTimestamp` | DateTime | ISO 8601 | ✅ Yes | - | ❌ No | When GPS was captured (proof) |
| 12 | `meetingNotes` | String | 5000 | ✅ Yes | - | ❌ No | Description of meeting and results |
| 13 | `callbackDate` | String | 100 | ❌ No | empty | ❌ No | Optional followup date (ISO string or empty) |
| 14 | `membershipAgreed` | Enum | - | ✅ Yes | - | ❌ No | Options: `none`, `1month`, `3month`, `6month`, `1year` |
| 15 | `status` | Enum | - | ✅ Yes | - | ❌ No | Options: `pending`, `completed`, `followup_required` |
| 16 | `createdAt` | DateTime | ISO 8601 | ✅ Yes | - | ❌ No | Record creation timestamp |
| 17 | `updatedAt` | String | 100 | ❌ No | empty | ❌ No | Last update timestamp (ISO string or empty) |

---

## Enum Values Details

### `providerType` (Required Enum)
```
Elements (2):
- therapist
- place
```

### `membershipAgreed` (Required Enum)
```
Elements (5):
- none
- 1month
- 3month
- 6month
- 1year
```

### `status` (Required Enum)
```
Elements (3):
- pending
- completed
- followup_required
```

---

## Indexes Configuration

Create the following indexes for optimal query performance:

| Index Key | Type | Attributes | Order | Description |
|-----------|------|------------|-------|-------------|
| `idx_agentId` | Key | `agentId` | ASC | Query visits by agent |
| `idx_createdAt` | Key | `createdAt` | DESC | Sort by creation date |
| `idx_status` | Key | `status` | ASC | Filter by status |
| `idx_membershipAgreed` | Key | `membershipAgreed` | ASC | Filter by membership term |
| `idx_providerType` | Key | `providerType` | ASC | Filter by provider type |
| `idx_visitDate` | Key | `visitDate` | DESC | Sort/filter by visit date |

---

## Permissions Configuration

### Read Access
- **Agents:** Can read their own visits only
  - Rule: `equal("agentId", [$userId])`
- **Admins:** Can read all visits
  - Role: `admins`

### Create Access
- **Agents:** Can create visits
  - Role: `agents`
- **Admins:** Can create visits
  - Role: `admins`

### Update Access
- **Agents:** Can update their own visits only
  - Rule: `equal("agentId", [$userId])`
- **Admins:** Can update all visits
  - Role: `admins`

### Delete Access
- **Admins Only:** Only admins can delete visits
  - Role: `admins`

---

## Step-by-Step Creation Guide

### 1. Create Collection
```
1. Login to Appwrite Console
2. Navigate to: Databases → Your Database (68f76ee1000e64ca8d05)
3. Click "Create Collection"
4. Name: agent_visits
5. Click "Create"
6. **COPY THE COLLECTION ID**
```

### 2. Add Attributes (in order)

#### String Attributes
```
1. agentId
   - Type: String
   - Size: 255
   - Required: Yes
   - Default: (none)
   - Array: No

2. agentName
   - Type: String
   - Size: 255
   - Required: Yes
   - Default: (none)
   - Array: No

3. agentCode
   - Type: String
   - Size: 50
   - Required: Yes
   - Default: (none)
   - Array: No

4. providerName
   - Type: String
   - Size: 255
   - Required: Yes
   - Default: (none)
   - Array: No

5. whatsappNumber
   - Type: String
   - Size: 50
   - Required: Yes
   - Default: (none)
   - Array: No

6. locationAddress
   - Type: String
   - Size: 1000
   - Required: Yes
   - Default: (none)
   - Array: No

7. meetingNotes
   - Type: String
   - Size: 5000
   - Required: Yes
   - Default: (none)
   - Array: No

8. callbackDate
   - Type: String
   - Size: 100
   - Required: No
   - Default: (empty string)
   - Array: No

9. updatedAt
   - Type: String
   - Size: 100
   - Required: No
   - Default: (empty string)
   - Array: No
```

#### Enum Attributes
```
10. providerType
    - Type: Enum
    - Elements: therapist, place
    - Required: Yes
    - Default: (none)
    - Array: No

11. membershipAgreed
    - Type: Enum
    - Elements: none, 1month, 3month, 6month, 1year
    - Required: Yes
    - Default: (none)
    - Array: No

12. status
    - Type: Enum
    - Elements: pending, completed, followup_required
    - Required: Yes
    - Default: (none)
    - Array: No
```

#### Float Attributes
```
13. locationLat
    - Type: Float
    - Required: Yes
    - Default: (none)
    - Array: No
    - Min: -90
    - Max: 90

14. locationLng
    - Type: Float
    - Required: Yes
    - Default: (none)
    - Array: No
    - Min: -180
    - Max: 180
```

#### DateTime Attributes
```
15. visitDate
    - Type: DateTime
    - Required: Yes
    - Default: (none)
    - Array: No

16. locationTimestamp
    - Type: DateTime
    - Required: Yes
    - Default: (none)
    - Array: No

17. createdAt
    - Type: DateTime
    - Required: Yes
    - Default: (none)
    - Array: No
```

### 3. Create Indexes

```
Index 1: idx_agentId
- Type: Key
- Attributes: agentId
- Order: ASC

Index 2: idx_createdAt
- Type: Key
- Attributes: createdAt
- Order: DESC

Index 3: idx_status
- Type: Key
- Attributes: status
- Order: ASC

Index 4: idx_membershipAgreed
- Type: Key
- Attributes: membershipAgreed
- Order: ASC

Index 5: idx_providerType
- Type: Key
- Attributes: providerType
- Order: ASC

Index 6: idx_visitDate
- Type: Key
- Attributes: visitDate
- Order: DESC
```

### 4. Set Permissions

#### For Development/Testing (Simple)
```
Read:
- Role: any

Create:
- Role: any

Update:
- Role: any

Delete:
- Role: any
```

#### For Production (Secure)
```
Read:
- Role: admins
- Label: "Owner can read"
  Condition: equal("agentId", [$userId])

Create:
- Role: agents
- Role: admins

Update:
- Role: admins
- Label: "Owner can update"
  Condition: equal("agentId", [$userId])

Delete:
- Role: admins
```

### 5. Update Config File

After creating the collection, copy the Collection ID and update:

**File:** `lib/appwrite.config.ts`

**Find line 15:**
```typescript
agentVisits: 'agent_visits_collection_id', // NEW: Agent visit tracking
```

**Replace with:**
```typescript
agentVisits: 'YOUR_ACTUAL_COLLECTION_ID_HERE', // NEW: Agent visit tracking
```

---

## Sample Data

Here's what a sample visit record looks like in the database:

```json
{
  "$id": "64a1b2c3d4e5f6g7h8i9",
  "agentId": "64a1b2c3d4e5f6g7h8i0",
  "agentName": "John Smith",
  "agentCode": "AG001",
  "providerName": "Sunset Spa & Massage",
  "providerType": "place",
  "whatsappNumber": "+66812345678",
  "visitDate": "2025-10-29T14:30:00.000Z",
  "locationLat": 7.894567,
  "locationLng": 98.398765,
  "locationAddress": "123 Beach Road, Patong, Kathu District, Phuket 83150, Thailand",
  "locationTimestamp": "2025-10-29T14:29:45.000Z",
  "meetingNotes": "Met with owner Mrs. Sarah. Discussed IndaStreet membership benefits. She showed interest in 3-month trial. Has 4 therapists currently. Good location near beach. Agreed to follow up next week with final decision.",
  "callbackDate": "2025-11-05",
  "membershipAgreed": "3month",
  "status": "completed",
  "createdAt": "2025-10-29T14:35:12.000Z",
  "updatedAt": ""
}
```

---

## Validation Rules

The application validates:

1. ✅ **Required Fields:** All required fields must have values
2. ✅ **GPS Accuracy:** Location must be captured from device GPS (no manual entry)
3. ✅ **Timestamp Proof:** locationTimestamp proves when GPS was captured
4. ✅ **Status Auto-Set:** 
   - If `membershipAgreed` != 'none' → `status` = 'completed'
   - If `membershipAgreed` == 'none' → `status` = 'followup_required'
5. ✅ **Immutable Location:** Location data cannot be edited after creation (security)

---

## Query Examples

### Get all visits by specific agent:
```javascript
const visits = await databases.listDocuments(
    databaseId,
    'agent_visits',
    [
        Query.equal('agentId', agentId),
        Query.orderDesc('createdAt'),
        Query.limit(100)
    ]
);
```

### Get all visits with membership agreements:
```javascript
const visits = await databases.listDocuments(
    databaseId,
    'agent_visits',
    [
        Query.notEqual('membershipAgreed', 'none'),
        Query.orderDesc('visitDate'),
        Query.limit(500)
    ]
);
```

### Get visits by date range (with client-side filtering):
```javascript
const visits = await databases.listDocuments(
    databaseId,
    'agent_visits',
    [
        Query.orderDesc('visitDate'),
        Query.limit(500)
    ]
);

// Client-side filtering
const filteredVisits = visits.documents.filter(visit => {
    const visitDate = new Date(visit.visitDate);
    return visitDate >= fromDate && visitDate <= toDate;
});
```

---

## Estimated Storage

### Per Record
- Strings: ~1-2 KB
- Numbers: ~16 bytes
- Timestamps: ~24 bytes
- **Average per record:** ~2-3 KB

### Example Calculations
- 1,000 visits = ~2-3 MB
- 10,000 visits = ~20-30 MB
- 100,000 visits = ~200-300 MB

Appwrite free tier supports up to 2GB storage, so you can store hundreds of thousands of visit records.

---

## Troubleshooting

### Common Issues

**Issue:** "Collection not found"
- **Solution:** Verify collection ID is correct in `appwrite.config.ts`

**Issue:** "Unauthorized" when creating visit
- **Solution:** Check permissions allow agents to create documents

**Issue:** "Required attribute missing"
- **Solution:** Ensure all required fields are provided in createDocument call

**Issue:** GPS not working
- **Solution:** Check browser permissions, ensure HTTPS, test on mobile device

**Issue:** Reverse geocoding fails
- **Solution:** Falls back to coordinates. Consider Google Maps API for production

---

## Next Steps After Creation

1. ✅ Create collection in Appwrite Console
2. ✅ Copy Collection ID
3. ✅ Update `lib/appwrite.config.ts` with actual ID
4. ✅ Test visit creation from agent dashboard
5. ✅ Verify data appears in Appwrite Console
6. ✅ Test GPS location capture on mobile device
7. ✅ Build admin dashboard view
8. ✅ Test filtering and searching
9. ✅ Add location map display
10. ✅ Deploy to production

---

## Support

If you encounter any issues during setup:

1. Check Appwrite Console logs for detailed error messages
2. Verify all attribute names match exactly (case-sensitive)
3. Ensure enum values are spelled correctly
4. Test with simple data first
5. Check browser console for JavaScript errors

**Appwrite Documentation:**
- Collections: https://appwrite.io/docs/databases
- Permissions: https://appwrite.io/docs/permissions
- Queries: https://appwrite.io/docs/databases#querying-documents
