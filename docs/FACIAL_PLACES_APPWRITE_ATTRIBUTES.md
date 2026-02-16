# Facial Places – Appwrite Data Feed Attributes

This document describes the **facial_places** collection attributes used by the **facial profile page** and **facial dashboard**, so both stay in sync with the same Appwrite data feed.

## Collection

- **Database:** `VITE_APPWRITE_DATABASE_ID`
- **Collection ID:** `VITE_FACIAL_PLACES_COLLECTION_ID` (e.g. `facial_places_collection` or your actual ID)

## Attributes (data feed)

| Attribute (Appwrite)   | Type   | Used by        | Notes |
|------------------------|--------|----------------|-------|
| `$id`                  | string | Both           | Document ID; used as `placeId` in URLs and dashboard. |
| `name`                 | string | Both           | Clinic name. |
| `description`          | string | Both           | Full description (profile page body). |
| `mainimage` / `mainImage` | string | Both        | Main/hero image URL. |
| `profilePicture`       | string | Both           | Profile image (fallback: mainimage). |
| `galleryImages`       | string | Both           | **JSON string** of gallery array (see below). |
| `pricing`              | string | Both           | **JSON string** e.g. `{"60":150,"90":200,"120":250}`. |
| `location` / `address` | string | Both           | Address text. |
| `city`                 | string | Both           | City for filters. |
| `coordinates`          | array/string | Both       | `[lng, lat]` or Geo point. |
| `whatsappnumber` / `ownerWhatsApp` | string | Both | Contact for WhatsApp. |
| `openingtime` / `openingTime` | string | Dashboard | Opening time. |
| `closingtime` / `closingTime` | string | Dashboard | Closing time. |
| `status` / `availability` | string | Both     | e.g. Available, Busy, Offline. |
| `isLive` / `islive`   | boolean | Both          | Profile visible in listing. |
| `massagetypes` / `facialTypes` | string | Both   | **JSON string** of facial types array. |
| `languages` / `languagesspoken` | string | Dashboard | **JSON string** of languages array. |
| `additionalServices` / `additionalservices` | string | Dashboard | **JSON string** of services array. |
| `websiteUrl` / `websiteurl` | string | Both   | Website URL. |
| `websiteTitle` / `websitetitle` | string | Dashboard | Optional. |
| `websiteDescription` / `websitedescription` | string | Dashboard | Optional. |
| `discountpercentage` / `discountPercentage` | number | Both | 0–100. |
| `discountduration` / `discountDuration` | number | Dashboard | Hours. |
| `isdiscountactive` / `isDiscountActive` | boolean | Dashboard | Discount active flag. |
| `discountendtime` / `discountEndTime` | string | Dashboard | ISO date string. |
| `instagramurl`, `facebookpageurl`, `instagramposts`, `facebookposts` | string | Dashboard | Optional. |
| `therapistGender`       | string | Dashboard      | Optional. |
| `yearsEstablished`      | number | Dashboard      | Optional. |
| `category`              | string | Dashboard      | e.g. `wellness`. |
| `lastUpdate`            | string | Service        | ISO timestamp (set on update). |

## Gallery JSON format (`galleryImages`)

Stored as a **single JSON string** in `galleryImages`. Array of objects, **up to 5 items**:

```json
[
  {
    "imageUrl": "https://...",
    "caption": "Room 1",
    "header": "Room 1",
    "description": "Short description for profile."
  }
]
```

- **imageUrl** (required): Image URL.
- **caption**: Title in dashboard; same as header for profile.
- **header**: Shown as title on profile; if missing, `caption` is used.
- **description**: Shown under the title on profile.

Dashboard saves **caption** and **description**; **header** is set from caption so the profile page can use either. Profile page uses `header || caption` for the title and `description` for the body.

## Data flow

1. **Dashboard load:** `facialPlaceService.getByProviderId(placeId)` → Appwrite document → `docToPlaceLike` / `mapDocToPlace` normalizes gallery to `{ imageUrl, caption, header, description }`.
2. **Dashboard save:** User edits gallery (imageUrl, caption, description). Save builds array with `header: caption`, then `galleryImages: JSON.stringify(filteredGallery)` and sends to `facialPlaceService.update(placeId, payload)`.
3. **Profile load:** `FacialPlaceProfilePageNew` gets place via `facialPlaces` list or `facialPlaceService.getById(id)`. Gallery is normalized the same way; profile renders `block.header` and `block.description`.

## Services

- **Main app (profile, list):** `src/lib/appwrite/services/facial.service.ts` and `src/lib/services/facialPlaceService.ts` both normalize gallery and map snake_case/camelCase from Appwrite.
- **Dashboard:** Uses `facialPlaceService` from `src/lib/appwriteService` (re-exported from `lib/appwrite/services/facial.service.ts`) for `getByProviderId` and `update`. Save payload is sanitized by `sanitizePlacePayload` in `src/schemas/placeSchema.ts`; `PLACE_ALLOWED` must include all attributes the dashboard sends so they persist.
