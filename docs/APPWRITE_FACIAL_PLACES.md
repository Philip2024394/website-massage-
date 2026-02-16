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
| galleryImages   | string | no       | JSON array of `{imageUrl, header, description}` |
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
