# Appwrite: Facial Places Collection

Use this for **home page facial clinic cards**, **facial place profile page**, and **facial clinic dashboard**. If the collection is missing or empty, the app shows one **mock facial clinic** (Glow Skin Clinic) so the Facial flow always works.

## Collection

- **Collection ID:** `facial_places_collection`
- **Database:** same as main app (see `APPWRITE_CONFIG.databaseId` in `src/lib/appwrite.config.ts`)

## Create in Appwrite Console

1. Open your Appwrite project → Database → select the app database.
2. Create a collection with ID: **`facial_places_collection`**.
3. Set permissions: **Read** and **Create** for role **Any** (so the app can list places and clinics can create/update their doc).
4. Add the following attributes (all optional except where noted):

| Attribute        | Type    | Required | Notes |
|-----------------|--------|----------|--------|
| name            | string | yes      | Display name |
| description     | string | no       | |
| mainimage       | string | no       | Main image URL (or mainImage) |
| profilePicture  | string | no       | |
| address         | string | no       | Shown as location |
| location        | string | no       | Alias for address |
| city            | string | no       | For city filter (e.g. Bali) |
| coordinates     | string | no       | e.g. "-8.6705,115.2126" |
| whatsappnumber  | string | no       | Or ownerWhatsApp |
| ownerWhatsApp   | string | no       | |
| pricing         | string | no       | JSON: `{"60":350000,"90":500000,"120":650000}` (IDR) |
| prices          | string | no       | Same as pricing (legacy) |
| facialTypes     | string | no       | JSON array: `["Deep Cleansing","Hydrating"]` |
| facialtypes     | string | no       | Same (legacy) |
| galleryImages   | string | no       | JSON array of **up to 5** items: `{imageUrl, header, description}`. Profile page shows these as thumbnails with title + description. Dashboard can edit these. |
| galleryimages   | string | no       | Same (legacy) |
| status          | string | no       | e.g. "Open" |
| starrate        | string | no       | e.g. "4.9" |
| rating          | double | no       | Numeric rating |
| reviewCount     | integer| no       | |
| reviewcount     | integer| no       | Legacy |
| openclosetime   | string | no       | e.g. "09:00 - 21:00" |
| operatingHours  | string | no       | |
| placeId         | string | no       | Provider/user ID for dashboard lookup |
| category        | string | no       | e.g. "wellness" |
| facialservices  | string | no       | JSON array |
| amenities       | string | no       | JSON array |
| discounted      | boolean| no       | |
| lastUpdate      | string | no       | ISO date |

After creating the collection, you can add documents via the Console or let the **facial clinic dashboard** create/update them when a clinic signs up and saves their profile. The app will show the **mock facial clinic** until at least one document exists.

---

## Data flow: View profile → facial place profile page

1. **Home page** lists facial places from `facialPlaces` (loaded via `useDataFetching` → `facialPlaceService.getAll()`). Each item is mapped with `type: 'facial'` so navigation goes to the facial profile.
2. **Facial card "View profile"** calls `onSelectPlace(place)` → `handleSetSelectedPlace(place)`:
   - Sets `selectedPlace` to that place.
   - If place has `type === 'facial'` or `facialTypes`/`facialServices`, sets page to `facial-place-profile` and updates the URL to `#/profile/facial/{$id}-{slug}`.
3. **AppRouter** (case `facial-place-profile`):
   - Resolves place from `props.selectedPlace` or from URL (pathname or hash `profile/facial/ID-slug`) by finding the place in `props.facialPlaces` by ID.
   - Passes `place`, `placeId`, and `facialPlaces` to the profile component.
4. **FacialPlaceProfilePageNew**:
   - If `place` is null but `placeId` or ID in URL is present, fetches the place from Appwrite via `facialPlaceService.getById(id)`.
   - Renders hero, up to 5 gallery blocks (from `place.galleryImages`: `imageUrl`, `header`/`caption`, `description`), pricing, and booking actions.
5. **Dashboard** (facial place dashboard) saves profile with `galleryImages` as a JSON string of up to 5 items `{ imageUrl, caption, description }`; the profile page uses `caption` as `header` when `header` is missing.

## Storage (images)

- **Bucket:** `APPWRITE_CONFIG.facialPlacesBucketId` (e.g. for facial place uploads). Dashboard and services use this for main image and gallery uploads; URLs are stored in the document attributes above.
