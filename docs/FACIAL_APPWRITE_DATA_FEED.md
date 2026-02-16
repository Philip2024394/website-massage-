# Facial profile & dashboard – Appwrite data feed

This doc describes how the **facial profile page**, **facial dashboard**, and **Appwrite** `facial_places` collection stay in sync (upload, save, load, display).

## Can the profile be opened from “View profile” on the facial card?

**Yes.** The flow is:

1. **Home** shows facial cards via `FacialPlaceHomeCard` (data from `facialPlaceService.getAll()` → `state.facialPlaces`).
2. Each card has a **“View profile”** button that calls `onClick(place)` → `onSelectPlace(place)`.
3. `onSelectPlace` is `handleSetSelectedPlace` (from `useNavigation`): it sets `selectedPlace`, sets page to `facial-place-profile`, and updates the URL to `#/profile/facial/{id}-{slug}`.
4. **AppRouter** for `facial-place-profile` resolves the place from `selectedPlace` or from the URL id + `facialPlaces`, and renders `FacialPlaceProfilePageNew` with that place (or `placeId` so the profile can fetch by id from Appwrite if needed).

So **View profile on a facial card does open the facial profile page** with the correct place.

## Data flow

| Step | Component | Action |
|------|-----------|--------|
| Load list | Main app (home) | `facialPlaceService.getAll()` → home cards |
| Load one | Profile page | `facialPlaceService.getById(id)` or from list; gallery = up to 5 items with header + description |
| Load for edit | Dashboard | `facialPlaceService.getByProviderId(placeId)` → form state |
| Save | Dashboard | `onSave(saveData)` → `facialPlaceService.update(placeId, saveData)` |

- **Profile** uses `src/lib/services/facialPlaceService.ts` (getById, docToPlaceLike).
- **Dashboard** and **main app** use `src/lib/appwrite/services/facial.service.ts` (getByProviderId, getAll, update, mapDocToPlace). AppRouter wires dashboard save to `facialPlaceService.update` (same appwrite service).

## Appwrite collection: `facial_places`

Ensure the collection has these attributes (name and type). Use camelCase or snake_case to match what you send.

| Attribute | Type | Notes |
|-----------|------|--------|
| `name` | string | Clinic name |
| `description` | string | About / description |
| `mainimage` | string | Main image URL (dashboard sends this) |
| `profilePicture` | string | Profile image URL |
| `galleryImages` | string | **JSON string** (see below) |
| `pricing` | string | JSON string, e.g. `{"60":120000,"90":180000,"120":240000}` |
| `massagetypes` | string | JSON string array of facial types (dashboard sends this) |
| `location` / `address` | string | Address |
| `city` | string | City |
| `coordinates` | string / array | e.g. `[lng, lat]` or Geo point |
| `whatsappnumber` / `ownerWhatsApp` | string | Contact |
| `openingtime` / `closingtime` | string | Hours |
| `status` / `availability` | string | e.g. Available, Busy, Offline |
| `isLive` / `islive` | boolean | Profile live flag |
| `languages` / `additionalServices` | string | JSON strings if used |
| `discountpercentage`, `discountduration`, `isdiscountactive`, `discountendtime` | number/boolean/string | Optional discount fields |

## Gallery format (`galleryImages`)

- **Stored in Appwrite:** one string attribute `galleryImages` containing a **JSON string** of an array.
- **Array shape:** each item should have:
  - `imageUrl` (string) – required
  - `caption` (string) – used as **header** on profile
  - `description` (string) – shown under header on profile

Dashboard saves:

```json
[
  { "imageUrl": "https://...", "caption": "Room 1", "description": "Clean treatment room." },
  ...
]
```

Profile and services normalize so that **header** = `item.header || item.caption || item.title`, so dashboard’s `caption` is shown as the profile header.

- **Max items:** 5 (dashboard and profile both cap at 5).

## Where it’s implemented

| Item | Location |
|------|----------|
| Appwrite service (getAll, getByProviderId, update) | `src/lib/appwrite/services/facial.service.ts` |
| Place-like service (getById, used by profile) | `src/lib/services/facialPlaceService.ts` |
| Profile page (display gallery) | `src/pages/FacialPlaceProfilePageNew.tsx` |
| Dashboard (load/save form, gallery UI) | `apps/facial-dashboard/src/pages/FacialDashboard.tsx` |
| Dashboard gallery section | `apps/facial-dashboard/src/components/sections/GallerySection.tsx` |
| Save payload sanitizer | `src/schemas/placeSchema.ts` (PLACE_ALLOWED, sanitizePlacePayload) |
| Dashboard save wiring | `src/AppRouter.tsx` (facial-place-dashboard → onSave → facialPlaceService.update) |

## Upload (images)

- **Dashboard:** ImageUpload component uploads via `imageUploadService`; the returned URL is stored in `mainImage`, `profilePicture`, or in a gallery item’s `imageUrl`.
- **Appwrite storage:** Use the facial places bucket (e.g. `APPWRITE_CONFIG.facialPlacesBucketId` in `src/lib/services/facialPlaceService.ts`). Ensure the bucket exists and permissions allow the client to create/read files.

## Appwrite collection setup checklist (facial_places)

In the Appwrite Console → your Database → collection whose ID is `VITE_FACIAL_PLACES_COLLECTION_ID` (or fallback `facial_places_collection`), ensure these attributes exist. Create any that are missing (type as below).

| Attribute | Type (in Console) | Required for |
|-----------|-------------------|--------------|
| `name` | string | Profile, dashboard, home card |
| `description` | string | Profile, dashboard |
| `mainimage` | string | Dashboard save, profile hero |
| `profilePicture` | string | Dashboard save, profile |
| `galleryImages` | string | Dashboard save (JSON string), profile gallery |
| `pricing` | string | Dashboard save (JSON), profile prices |
| `massagetypes` | string | Dashboard save (JSON array), profile facial types |
| `location` | string | Dashboard, profile address |
| `city` | string | Filtering, profile |
| `coordinates` | string or array | Map, distance |
| `whatsappnumber` or `ownerWhatsApp` | string | Contact, Book button |
| `openingtime`, `closingtime` | string | Dashboard, profile hours |
| `status`, `availability` | string | Available / Busy / Offline |
| `isLive` or `islive` | boolean | Home card “live” badge |
| `discountpercentage`, `discountduration`, `isdiscountactive`, `discountendtime` | number/boolean/string | Dashboard discount UI |

The **facial dashboard** sends the payload from `FacialDashboard.tsx` (after `sanitizePlacePayload`); only keys in `PLACE_ALLOWED` in `src/schemas/placeSchema.ts` are sent. The list above matches what the app reads and writes.

## Troubleshooting

- **Gallery not showing on profile:** Ensure `galleryImages` in Appwrite is a **string** (JSON), and each element has `imageUrl` and preferably `caption` and `description`.
- **Dashboard load empty:** Dashboard reads `galleryImages` and `galleryimages`; services return normalized gallery (array). If you use a different service, ensure it returns `facialTypes` or `massageTypes`/`massagetypes` and `contactNumber`/`whatsappNumber`/`ownerWhatsApp` so the dashboard load handles them (see `initializeWithPlaceData`).
- **Save not persisting:** Check that attribute names in the payload match the collection (e.g. `mainimage`, `galleryImages`, `massagetypes`). Sanitizer allows only `PLACE_ALLOWED` keys; both camelCase and snake_case used by the dashboard are listed.
