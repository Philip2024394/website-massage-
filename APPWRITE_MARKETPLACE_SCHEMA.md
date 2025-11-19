# Marketplace & Memberships Collections (Appwrite)

Create three collections with the attributes below. **IMPORTANT:** Collection IDs must match the strings used in `appwrite.config.ts`.

## Collection: marketplaceSellers
**Collection ID:** `marketplace_sellers`

### Attributes:
| Field | Type | Size | Required | Array | Default |
|-------|------|------|----------|-------|---------|
| tradingName | string | 255 | ✓ | ✗ | - |
| whatsapp | string | 50 | ✗ | ✗ | - |
| profileImage | string | 2048 | ✗ | ✗ | - |
| countryCode | string | 5 | ✓ | ✗ | - |
| lat | double | - | ✗ | ✗ | - |
| lng | double | - | ✗ | ✗ | - |
| salesMode | string | 10 | ✗ | ✗ | local |
| shippingRates | string | 10000 | ✗ | ✗ | {} |
| acceptedPayments | string | 1000 | ✗ | ✗ | [] |
| websiteUrl | string | 2048 | ✗ | ✗ | - |
| ownerUserId | string | 50 | ✓ | ✗ | - |
| ownerEmail | string | 255 | ✗ | ✗ | - |
| planTier | string | 20 | ✗ | ✗ | local |
| subscriptionStatus | string | 20 | ✗ | ✗ | trial |
| trialEndsAt | datetime | - | ✗ | ✗ | - |

### Indexes:
- ownerUserId (key, asc)
- ownerEmail (key, asc)
- countryCode (key, asc)

### Permissions:
- Read: `any` (public)
- Create: `users` (authenticated)
- Update: Document owner via ownerUserId
- Delete: Document owner via ownerUserId

---

## Collection: marketplaceProducts
**Collection ID:** `marketplace_products`

### Attributes:
| Field | Type | Size | Required | Array | Default |
|-------|------|------|----------|-------|---------|
| name | string | 255 | ✓ | ✗ | - |
| description | string | 5000 | ✗ | ✗ | - |
| image | string | 2048 | ✗ | ✗ | - |
| images | string | 2048 | ✗ | ✓ | - |
| whatYouWillReceive | string | 50000 | ✗ | ✗ | - |
| isActive | boolean | - | ✗ | ✗ | true |
| price | double | - | ✓ | ✗ | - |
| currency | string | 5 | ✗ | ✗ | - |
| stockLevel | integer | - | ✗ | ✗ | 0 |
| sellerId | string | 50 | ✓ | ✗ | - |
| countryCode | string | 5 | ✗ | ✗ | - |
| lat | double | - | ✗ | ✗ | - |
| lng | double | - | ✗ | ✗ | - |

### Indexes:
- sellerId (key, asc)
- countryCode (key, asc)

### Permissions:
- Read: `any` (public)
- Create: `users` (authenticated)
- Update: Seller owner only (check sellerId matches caller)
- Delete: Seller owner only

---

## Collection: memberships
**Collection ID:** `memberships`
---

## Collection: adminNotifications
**Collection ID:** `admin_notifications`

### Attributes:
| Field | Type | Size | Required | Array | Default |
|-------|------|------|----------|-------|---------|
| type | string | 50 | ✓ | ✗ | - |
| productId | string | 50 | ✗ | ✗ | - |
| sellerId | string | 50 | ✗ | ✗ | - |
| message | string | 2000 | ✓ | ✗ | - |
| createdAt | datetime | - | ✓ | ✗ | - |
| isRead | boolean | - | ✗ | ✗ | false |

### Indexes:
- type (key, asc)
- createdAt (key, desc)

### Permissions:
- Read: `admins` only (or restrict via role)
- Create: `users` (sellers) to publish events
- Update: `admins` (mark as read)


### Attributes:
| Field | Type | Size | Required | Array | Default |
|-------|------|------|----------|-------|---------|
| ownerUserId | string | 50 | ✓ | ✗ | - |
| ownerEmail | string | 255 | ✗ | ✗ | - |
| tier | string | 20 | ✓ | ✗ | - |
| status | string | 20 | ✓ | ✗ | - |
| currentPeriodEnd | datetime | - | ✗ | ✗ | - |

### Indexes:
- ownerUserId (key, asc)
- ownerEmail (key, asc)

### Permissions:
- Read: Document owner via ownerUserId
- Create: `users` (authenticated)
- Update: Document owner via ownerUserId
- Delete: `admin` only

---

## Setup Instructions

1. **Log into Appwrite Console:**
   ```
   https://cloud.appwrite.io/console/project-68f23b11000d25eb3664/databases/database-68f76ee1000e64ca8d05
   ```

2. **Create Collections:**
   - Click "Add Collection" for each: `marketplace_sellers`, `marketplace_products`, `memberships`
   - Add attributes as per tables above
   - For `shippingRates` field, use type `string` (stores JSON)
   - For datetime fields, use `datetime` attribute type

3. **Add Indexes:**
   - Create indexes for faster queries (ownerUserId, countryCode, etc.)

4. **Configure Permissions:**
   - Set collection-level permissions in Appwrite dashboard
   - For marketplace: public read, authenticated write
   - For memberships: owner-only read/write

5. **Update Config (if needed):**
   If Appwrite generated different collection IDs, update `lib/appwrite.config.ts`:
   ```ts
   marketplaceSellers: 'your_actual_collection_id',
   marketplaceProducts: 'your_actual_collection_id',
   memberships: 'your_actual_collection_id'

## Notes
- Payments: We display seller-accepted methods (Stripe, PayPal, Escrow, Bank Transfer) on product cards; no buyer payment processing in-app.
- Country filtering: The app filters products by viewer `userLocation.countryCode`.
- Price labels: Use viewer’s country formatting (no currency conversion).
- Distance: Optional; if `lat/lng` present on both product and viewer, it can be computed client-side.
 - Add the new attributes (`acceptedPayments`, `images`, `whatYouWillReceive`) in Appwrite before using these features. Unknown fields will cause writes to be rejected.
