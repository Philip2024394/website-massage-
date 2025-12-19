# Appwrite Places Collection - Complete Schema

**Collection ID:** `places_collection_id`  
**Database ID:** `68f76ee1000e64ca8d05`  
**Purpose:** Massage place/spa business profiles

---

## 🔧 Schema Update Required

This document lists **ALL 30+ attributes** required for the Places collection to support 100% data persistence from PlaceDashboardPage.

### Current Issue:
- Dashboard collects 34 fields
- Only 15 fields currently in schema
- **19 fields missing** → causing data loss

---

## Complete Attribute List (30 Required Fields)

### 1. Core System Fields (6)

| Attribute | Type | Size | Required | Default | Index | Description |
|-----------|------|------|----------|---------|-------|-------------|
| `id` | String | 255 | ✅ | auto | Key | Document ID |
| `placeId` | String | 255 | ✅ | - | Key | Business identifier |
| `category` | String | 50 | ✅ | 'wellness' | - | Business category |
| `status` | String | 20 | ✅ | 'Open' | Key | Open/Closed status |
| `isLive` | Boolean | - | ✅ | false | Key | Admin approval status |
| `hotelId` | String | 255 | ❌ | '' | - | Associated hotel (if any) |

### 2. Basic Information (3)

| Attribute | Type | Size | Required | Default | Index | Description |
|-----------|------|------|----------|---------|-------|-------------|
| `name` | String | 255 | ✅ | - | Key | Business name |
| `description` | String (Text) | 5000 | ✅ | - | - | Business description |
| `email` | String | 255 | ✅ | - | Unique | Email address |

### 3. Contact Information (2)

| Attribute | Type | Size | Required | Default | Index | Description |
|-----------|------|------|----------|---------|-------|-------------|
| `whatsappNumber` | String | 50 | ✅ | - | - | Contact WhatsApp |
| `password` | String | 255 | ✅ | - | - | Hashed password |

### 4. Images (4)

| Attribute | Type | Size | Required | Default | Index | Description |
|-----------|------|------|----------|---------|-------|-------------|
| `mainImage` | String (URL) | 1000 | ✅ | - | - | Main business photo |
| `profilePicture` | String (URL) | 1000 | ✅ | - | - | Profile picture |
| `galleryImages` | String (JSON) | 5000 | ❌ | '[]' | - | Array of gallery images with captions |

> **galleryImages JSON structure:**
> ```json
> [
>   {"imageUrl": "https://...", "caption": "Spa Room", "description": "..."},
>   {"imageUrl": "https://...", "caption": "Treatment", "description": "..."}
> ]
> ```

### 5. Pricing (2)

| Attribute | Type | Size | Required | Default | Index | Description |
|-----------|------|------|----------|---------|-------|-------------|
| `pricing` | String (JSON) | 500 | ✅ | - | - | Service pricing by duration |
| `hotelVillaPricing` | String (JSON) | 500 | ❌ | '{}' | - | Special hotel/villa pricing |

> **pricing JSON structure:**
> ```json
> {"60": 300000, "90": 400000, "120": 500000}
> ```

### 6. Location (4)

| Attribute | Type | Size | Required | Default | Index | Description |
|-----------|------|------|----------|---------|-------|-------------|
| `location` | String | 500 | ✅ | - | - | Full address |
| `coordinates` | String (JSON) or Point | 100 | ✅ | - | Geo | Lat/lng coordinates |
| `openingTime` | String | 10 | ✅ | '09:00' | - | Opening time (HH:mm) |
| `closingTime` | String | 10 | ✅ | '21:00' | - | Closing time (HH:mm) |

> **coordinates format:** `[longitude, latitude]` or `{"lat": -6.2088, "lng": 106.8456}`

### 7. Services (3)

| Attribute | Type | Size | Required | Default | Index | Description |
|-----------|------|------|----------|---------|-------|-------------|
| `massageTypes` | String (JSON) | 1000 | ✅ | '[]' | - | Array of massage types offered |
| `languages` | String (JSON) | 500 | ❌ | '[]' | - | Languages spoken by staff |
| `additionalServices` | String (JSON) | 1000 | ❌ | '[]' | - | Extra services offered |

> **massageTypes JSON structure:**
> ```json
> ["Balinese Massage", "Deep Tissue", "Swedish Massage", "Hot Stone"]
> ```

### 8. Website Information (3)

| Attribute | Type | Size | Required | Default | Index | Description |
|-----------|------|------|----------|---------|-------|-------------|
| `websiteUrl` | String (URL) | 500 | ❌ | '' | - | Business website |
| `websiteTitle` | String | 255 | ❌ | '' | - | SEO title |
| `websiteDescription` | String | 500 | ❌ | '' | - | SEO description |

### 9. Discounts (4)

| Attribute | Type | Size | Required | Default | Index | Description |
|-----------|------|------|----------|---------|-------|-------------|
| `discountPercentage` | Integer | - | ❌ | 0 | - | Discount % (0-100) |
| `discountDuration` | Integer | - | ❌ | 0 | - | Duration in hours |
| `isDiscountActive` | Boolean | - | ✅ | false | Key | Discount currently active |
| `discountEndTime` | DateTime | - | ❌ | null | Key | Discount expiry timestamp |

### 10. Analytics & Ratings (4)

| Attribute | Type | Size | Required | Default | Index | Description |
|-----------|------|------|----------|---------|-------|-------------|
| `rating` | Float | - | ❌ | 0 | - | Average rating (0-5) |
| `reviewCount` | Integer | - | ❌ | 0 | - | Number of reviews |
| `analytics` | String (JSON) | 2000 | ❌ | '{}' | - | Analytics data |
| `activeMembershipDate` | DateTime | - | ❌ | null | Key | Membership expiry |

> **analytics JSON structure:**
> ```json
> {
>   "impressions": 1200,
>   "profileViews": 450,
>   "whatsappClicks": 89,
>   "directions_clicks": 67,
>   "bookings": 45
> }
> ```

### 11. System Timestamps (1)

| Attribute | Type | Size | Required | Default | Index | Description |
|-----------|------|------|----------|---------|-------|-------------|
| `createdAt` | DateTime | - | ✅ | auto | - | Creation timestamp |

---

## Index Strategy

### Required Indexes:

1. **Primary Lookups:**
   - `id` (Key, auto-indexed)
   - `placeId` (Key)
   - `email` (Unique)

2. **Status & Visibility:**
   - `isLive` (Key)
   - `status` (Key)
   - `isDiscountActive` (Key)

3. **Geolocation:**
   - `coordinates` (Geo index for radius queries)

4. **Time-Based:**
   - `discountEndTime` (Key, for cleanup)
   - `activeMembershipDate` (Key, for expiry)

---

## Migration Steps

### Step 1: Add Missing Attributes via Appwrite Console

Run these attribute additions in Appwrite Console:

```typescript
// Images
await databases.createStringAttribute(DB_ID, 'places_collection_id', 'mainImage', 1000, false);
await databases.createStringAttribute(DB_ID, 'places_collection_id', 'profilePicture', 1000, false);
await databases.createStringAttribute(DB_ID, 'places_collection_id', 'galleryImages', 5000, false, '[]');

// Contact
await databases.createStringAttribute(DB_ID, 'places_collection_id', 'whatsappNumber', 50, false);

// Pricing
await databases.createStringAttribute(DB_ID, 'places_collection_id', 'hotelVillaPricing', 500, false, '{}');

// Services
await databases.createStringAttribute(DB_ID, 'places_collection_id', 'massageTypes', 1000, false, '[]');
await databases.createStringAttribute(DB_ID, 'places_collection_id', 'languages', 500, false, '[]');
await databases.createStringAttribute(DB_ID, 'places_collection_id', 'additionalServices', 1000, false, '[]');

// Hours
await databases.createStringAttribute(DB_ID, 'places_collection_id', 'openingTime', 10, false, '09:00');
await databases.createStringAttribute(DB_ID, 'places_collection_id', 'closingTime', 10, false, '21:00');

// Website
await databases.createStringAttribute(DB_ID, 'places_collection_id', 'websiteUrl', 500, false, '');
await databases.createStringAttribute(DB_ID, 'places_collection_id', 'websiteTitle', 255, false, '');
await databases.createStringAttribute(DB_ID, 'places_collection_id', 'websiteDescription', 500, false, '');

// Discounts
await databases.createIntegerAttribute(DB_ID, 'places_collection_id', 'discountPercentage', false, 0);
await databases.createIntegerAttribute(DB_ID, 'places_collection_id', 'discountDuration', false, 0);
await databases.createBooleanAttribute(DB_ID, 'places_collection_id', 'isDiscountActive', false, false);
await databases.createDatetimeAttribute(DB_ID, 'places_collection_id', 'discountEndTime', false);
```

### Step 2: Create Indexes

```typescript
await databases.createIndex(DB_ID, 'places_collection_id', 'idx_isDiscountActive', 'key', ['isDiscountActive']);
await databases.createIndex(DB_ID, 'places_collection_id', 'idx_discountEndTime', 'key', ['discountEndTime']);
```

### Step 3: Backfill Existing Documents

```typescript
// Backfill default values for existing places
const places = await databases.listDocuments(DB_ID, 'places_collection_id', [Query.limit(100)]);

for (const place of places.documents) {
  await databases.updateDocument(DB_ID, 'places_collection_id', place.$id, {
    galleryImages: place.galleryImages || '[]',
    massageTypes: place.massageTypes || '[]',
    languages: place.languages || '[]',
    additionalServices: place.additionalServices || '[]',
    hotelVillaPricing: place.hotelVillaPricing || '{}',
    websiteUrl: place.websiteUrl || '',
    discountPercentage: place.discountPercentage || 0,
    isDiscountActive: place.isDiscountActive || false,
  });
}
```

---

## Validation Rules

### Required Field Validation (Dashboard enforces):
- ✅ name
- ✅ description
- ✅ mainImage
- ✅ profilePicture
- ✅ whatsappNumber
- ✅ location
- ✅ pricing (at least one duration > 0)
- ✅ massageTypes (at least one selected)
- ✅ openingTime
- ✅ closingTime

### Data Type Validation:
- `pricing`, `hotelVillaPricing`: Valid JSON objects with numeric values
- `massageTypes`, `languages`, `additionalServices`: Valid JSON arrays
- `galleryImages`: Valid JSON array of objects with `imageUrl`, `caption`, `description` keys
- `coordinates`: Valid Point or JSON with `lat`, `lng` numbers
- `whatsappNumber`: Starts with '+' or '0', 10-15 digits
- `discountPercentage`: Integer 0-100
- `openingTime`, `closingTime`: HH:mm format (00:00 - 23:59)

---

## Sample Complete Document

```json
{
  "$id": "place_673abd2200f3",
  
  "id": "place_673abd2200f3",
  "placeId": "PL000123",
  "category": "wellness",
  "status": "Open",
  "isLive": true,
  "hotelId": "",
  
  "name": "Bali Spa Harmony",
  "description": "Traditional Balinese massage spa with certified therapists. Experience authentic healing...",
  "email": "info@balispaharmony.com",
  
  "whatsappNumber": "+62 812 3456 7890",
  "password": "hashed_password_here",
  
  "mainImage": "https://ik.imagekit.io/7grri5v7d/spa-main.jpg",
  "profilePicture": "https://ik.imagekit.io/7grri5v7d/spa-logo.jpg",
  "galleryImages": "[{\"imageUrl\":\"https://...\",\"caption\":\"Spa Room\",\"description\":\"Relaxing treatment room\"}]",
  
  "pricing": "{\"60\":300000,\"90\":400000,\"120\":500000}",
  "hotelVillaPricing": "{\"60\":250000,\"90\":350000,\"120\":450000}",
  
  "location": "Jl. Raya Ubud No. 123, Ubud, Gianyar, Bali 80571",
  "coordinates": [115.2624, -8.5069],
  "openingTime": "09:00",
  "closingTime": "21:00",
  
  "massageTypes": "[\"Balinese Massage\",\"Deep Tissue\",\"Swedish Massage\",\"Hot Stone\"]",
  "languages": "[\"English\",\"Indonesian\",\"Japanese\"]",
  "additionalServices": "[\"Aromatherapy\",\"Body Scrub\",\"Facial Treatment\"]",
  
  "websiteUrl": "https://balispaharmony.com",
  "websiteTitle": "Bali Spa Harmony - Traditional Massage in Ubud",
  "websiteDescription": "Experience authentic Balinese massage in the heart of Ubud...",
  
  "discountPercentage": 20,
  "discountDuration": 48,
  "isDiscountActive": true,
  "discountEndTime": "2025-11-26T21:00:00.000Z",
  
  "rating": 4.8,
  "reviewCount": 127,
  "analytics": "{\"impressions\":1200,\"profileViews\":450,\"whatsappClicks\":89}",
  "activeMembershipDate": "2026-11-24T00:00:00.000Z",
  
  "createdAt": "2025-01-15T08:30:00.000Z"
}
```

---

## Code Changes Made

### 1. PlaceDashboardPage.tsx (handleSave function)
**Status:** ✅ FIXED  
**Change:** Updated rawData to include all 30 fields instead of only 14

### 2. schemas/placeSchema.ts
**Status:** ✅ FIXED  
**Changes:**
- Extended PlacePayload interface with 19 new fields
- Updated PLACE_ALLOWED array to 30 fields (was 15)
- Added comments to group fields logically

---

## Testing Checklist

After Appwrite schema update, test:

- [ ] Dashboard form saves all fields without errors
- [ ] massageTypes displays on MassagePlaceCard (not empty)
- [ ] languages displays on MassagePlaceCard (not empty)
- [ ] mainImage displays on card (not default fallback)
- [ ] profilePicture displays correctly
- [ ] galleryImages populates profile page gallery (6 images)
- [ ] whatsappNumber enables contact buttons on profile
- [ ] discounts display in pricing when isDiscountActive=true
- [ ] websiteUrl creates clickable link on profile
- [ ] openingTime/closingTime display correctly
- [ ] hotelVillaPricing saved (even if not displayed yet)
- [ ] additionalServices saved (for future features)

---

## Next Steps

1. **Immediate:** Add missing attributes to Appwrite Places collection via Console
2. **Verify:** Test save operation with all fields
3. **Validate:** Check MassagePlaceCard displays complete data
4. **Monitor:** Check Appwrite console for any "unknown attribute" errors
5. **Document:** Update main APPWRITE_COLLECTIONS_SCHEMA.md with complete Places schema

---

**Document Status:** Complete schema specification - ready for Appwrite implementation  
**Code Status:** Frontend code FIXED - awaiting backend schema update  
**Priority:** URGENT - Critical data loss bug until schema updated
