# Share Links Setup Guide (#12345 Format)

## 📋 Appwrite Collection Setup

### 1. Create Collection in Appwrite Console

**Collection Name:** `share_links`  
**Collection ID:** `share_links` (or auto-generate)

---

### 2. Create Attributes

Run these in order (wait for each to complete):

| Attribute | Type | Size | Required | Array | Default |
|-----------|------|------|----------|-------|---------|
| `shortId` | String | 36 | ✅ Yes | ❌ No | - |
| `slug` | String | 255 | ✅ Yes | ❌ No | - |
| `entityType` | String | 20 | ✅ Yes | ❌ No | `therapist` |
| `entityId` | String | 36 | ✅ Yes | ❌ No | - |
| `entityName` | String | 255 | ❌ No | ❌ No | - |
| `isActive` | Boolean | - | ✅ Yes | ❌ No | `true` |
| `clickCount` | Integer | - | ❌ No | ❌ No | `0` |
| `createdAt` | DateTime | - | ✅ Yes | ❌ No | - |
| `updatedAt` | DateTime | - | ❌ No | ❌ No | - |

---

### 3. Create Indexes

**Index 1: Short ID Lookup (REQUIRED)**
- Type: `Unique`
- Key: `shortId_unique`
- Attributes: `shortId` (ASC)

**Index 2: Slug Lookup (REQUIRED)**
- Type: `Unique`  
- Key: `slug_unique`
- Attributes: `slug` (ASC)

**Index 3: Entity Lookup**
- Type: `Key`
- Key: `entity_lookup`
- Attributes: `entityType` (ASC), `entityId` (ASC)

**Index 4: Active Links**
- Type: `Key`
- Key: `active_links`
- Attributes: `isActive` (ASC), `createdAt` (DESC)

---

### 4. Set Permissions

**Collection Permissions:**
- Read: `any` (public can access)
- Create: `users` (authenticated users)
- Update: `users` (document owner)
- Delete: `users` (document owner)

---

## 🎯 Usage Examples

### Generate Share Link on Signup

```typescript
import { generateTherapistShareLink } from './utils/shareLinkGenerator';

// After creating therapist account
const therapistId = '692467a3001f6f05aaa1';
const name = 'Budi';
const city = 'Ubud';

const shortId = await generateTherapistShareLink(therapistId, name, city);

console.log('Share link created:', {
  displayId: `#${shortId}`,  // Show to user as #12345
  url: `https://www.indastreetmassage.com/share/${shortId}`
});
```

### Get Existing Share Link

```typescript
import { getOrCreateShareLink } from './utils/shareLinkGenerator';

const link = await getOrCreateShareLink(
  'therapist',
  therapistId,
  'Budi',
  'Ubud'
);

console.log(link);
// {
//   shortId: '12345',
//   slug: 'budi-massage-ubud',
//   url: 'https://www.indastreetmassage.com/share/12345'
// }
```

---

## 🔗 URL Formats Supported

All these URLs work for the same therapist:

1. **Short ID:** `https://www.indastreetmassage.com/share/12345`
2. **With Hash:** `https://www.indastreetmassage.com/share/#12345`
3. **Friendly Slug:** `https://www.indastreetmassage.com/share/budi-massage-ubud`
4. **Legacy Long ID:** `https://www.indastreetmassage.com/share/therapist/692467a3001f6f05aaa1`

---

## 📊 Example Data

```json
{
  "$id": "unique_doc_id",
  "shortId": "12345",
  "slug": "budi-massage-ubud",
  "entityType": "therapist",
  "entityId": "692467a3001f6f05aaa1",
  "entityName": "Budi",
  "isActive": true,
  "clickCount": 0,
  "createdAt": "2025-12-21T12:00:00.000Z"
}
```

---

## 🚀 Integration Points

### 1. Therapist Registration
Add to `TherapistRegistrationPage.tsx`:

```typescript
// After successful Appwrite account creation
const shortId = await generateTherapistShareLink(
  newTherapist.$id,
  formData.name,
  formData.city
);

// Show success message with share link
alert(`Account created! Your share link: #${shortId}`);
```

### 2. Place Registration
Add to `PlaceRegistrationPage.tsx`:

```typescript
const shortId = await generatePlaceShareLink(
  newPlace.$id,
  formData.businessName,
  formData.city
);
```

### 3. Display Share Link in Dashboard
Show in `TherapistStatusPage.tsx`:

```typescript
const { shortId, url } = await getOrCreateShareLink(
  'therapist',
  loggedInProvider.id,
  loggedInProvider.name,
  loggedInProvider.city
);

// Display:
// Your Share Link: #12345
// https://www.indastreetmassage.com/share/12345
```

---

## ✅ Testing

1. Create the collection in Appwrite
2. Open: http://localhost:3000/test-share-links.html
3. Click "Generate Test Links" button (you'll need to add this)
4. Test the generated URLs

---

## 🔧 Manual Link Generation

You can manually create links via Appwrite console or use this script:

```typescript
import { shareLinkService } from './lib/services/shareLinkService';

// Generate for existing Budi therapist
await shareLinkService.createShareLink(
  'therapist',
  '692467a3001f6f05aaa1',
  'Budi',
  'Ubud'
);

// Generate for Surtiningsih
await shareLinkService.createShareLink(
  'therapist',
  '693cfadf003d16b9896a',
  'Surtiningsih',
  'Canggu'
);
```

---

## 📈 Analytics

The system automatically tracks:
- `clickCount` - increments each time link is visited
- `updatedAt` - last access timestamp

Query popular links:

```typescript
// Most clicked links
const response = await databases.listDocuments(
  APPWRITE_CONFIG.databaseId,
  'share_links',
  [
    Query.equal('isActive', true),
    Query.orderDesc('clickCount'),
    Query.limit(10)
  ]
);
```

---

## 🎨 Display Format

**Show to users:** `#12345` (with hash)  
**Use in URLs:** `12345` (without hash)

```typescript
import { formatShortId } from './features/shared-profiles/utils/shortUrlResolver';

const displayId = formatShortId('12345'); // Returns: "#12345"
```

---

## 🐛 Troubleshooting

**Link not working:**
1. Check collection exists in Appwrite
2. Verify indexes are created
3. Check permissions allow public read
4. Ensure `share_links` is in `appwrite.config.ts`

**Duplicate shortId error:**
- The service auto-retries with new random ID
- If persists, increase the ID range in `shareLinkService.ts`

**Entity not found:**
- Short link exists but therapist/place doesn't
- Check `entityId` matches actual Appwrite document ID
