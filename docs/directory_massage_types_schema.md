# Appwrite collection: directory_massage_types_

This document describes the Appwrite collection used to store **Massage Types Directory** entries (Traditional, Sports, Therapeutic, Wellness). The app uses collection ID: **directory_massage_types_**.

## Attribute checklist (confirm in Appwrite Console)

Ensure these attributes exist on the collection **directory_massage_types_**:

| # | Attribute ID           | Type    | Required | Used by |
|---|------------------------|---------|----------|---------|
| 1 | `name`                 | string  | Yes      | Directory list, popover title |
| 2 | `category`             | string  | Yes      | Filter (traditional \| sports \| therapeutic \| wellness \| couples \| body_scrub \| prenatal \| **head_scalp**) |
| 3 | `short_description`    | string  | No       | Directory card description |
| 4 | `recommended_duration` | string  | No       | "Suggested times" on directory, popover |
| 5 | `pressure_level`       | string  | No       | Popover "What to Expect" block |
| 6 | `focus_areas`          | string  | No       | Popover |
| 7 | `ideal_for`            | string  | No       | Popover |
| 8 | `suggested_frequency`  | string  | No       | Popover |
| 9 | `technique_style`      | string  | No       | Popover |
|10 | `post_treatment_notes` | string  | No       | Popover |
|11 | `recommended_add_ons`  | string  | No       | Popover |
|12 | `what_to_expect`       | string  | No       | Main popover paragraph, directory context |
|13 | `image_thumbnail`      | string  | No       | Directory card and popover thumbnail (**URL**; can be Appwrite Storage view URL) |
|14 | `place_only`           | boolean | No       | If true: show only on Massage Places directory, not Home Service |

**Permissions:** Collection must allow **read** for **Any** (or the roles used by the app) so the Massage Types Directory dashboard and price-card popovers work without login.

---

## Thumbnail image: URL stored in directory, file saved in Appwrite Storage

- **In the collection:** `image_thumbnail` is a **string URL**. The directory and popover use this URL to show the image.
- **Where the image file lives:** The image can be stored in **Appwrite Storage** (recommended). Upload the file to a bucket, then save the **file view URL** in the `image_thumbnail` attribute of the directory document.

**Option A – Use main app bucket**

1. In Appwrite Console → **Storage** → open your main bucket (e.g. the one in `APPWRITE_CONFIG.bucketId`).
2. Upload the thumbnail image (e.g. JPG/PNG).
3. Copy the **view URL** of the file (e.g. `https://syd.cloud.appwrite.io/v1/storage/buckets/<bucketId>/files/<fileId>/view?project=<projectId>`).
4. In **Databases** → collection **directory_massage_types_** → edit the document → set **image_thumbnail** to that URL.

**Option B – Dedicated bucket for directory thumbnails**

1. Create a bucket (e.g. `directory_thumbnails`) in Storage.
2. Set **read** permission to **Any** (or to roles that need to see the directory).
3. Upload images and use each file’s view URL as `image_thumbnail` in the directory document.

The app only needs the final **URL** in `image_thumbnail`; it does not care whether the URL points to Appwrite Storage or an external host. Using Appwrite Storage keeps assets in one place and under your project.

**Building the URL from a Storage file ID (e.g. after upload):** Use `getDirectoryThumbnailViewUrl(fileId)` from `directoryMassageTypes.service.ts`. Bucket is set in `APPWRITE_CONFIG.directoryThumbnailsBucketId` (defaults to main bucket). Set `VITE_APPWRITE_DIRECTORY_THUMBNAILS_BUCKET_ID` to use a dedicated bucket.

---

## Create in Appwrite Console

1. Open your Appwrite project → **Databases** → select the main app database.
2. Create a new collection with **Collection ID**: `directory_massage_types_`.
3. Add the attributes below (all **string** unless noted).

## Attributes

| Attribute ID           | Type    | Size  | Required | Description |
|------------------------|---------|-------|----------|-------------|
| `name`                 | string  | 255   | Yes      | Display name (e.g. "Office Relief Massage") |
| `category`             | string  | 32    | Yes      | One of: `traditional`, `sports`, `therapeutic`, `wellness`, `couples` (place-only), `body_scrub` (place-only), `prenatal` (Places + Home Service), **`head_scalp`** (Places + Home Service) |
| `short_description`    | string  | 2000  | No       | Brief one-line description |
| `recommended_duration` | string  | 64    | No       | e.g. "60 minutes" |
| `pressure_level`       | string  | 64    | No       | e.g. "Medium ★★☆" |
| `focus_areas`          | string  | 500   | No       | e.g. "Neck, shoulders, upper back" |
| `ideal_for`            | string  | 500   | No       | e.g. "Office workers, students" |
| `suggested_frequency`   | string  | 128   | No       | e.g. "1–2 times weekly" |
| `technique_style`      | string  | 500   | No       | e.g. "Oil-based, targeted pressure" |
| `post_treatment_notes` | string  | 1000  | No       | Post-session notes |
| `recommended_add_ons`  | string  | 500   | No       | e.g. "Head massage, hot towel" |
| `what_to_expect`       | string  | 5000  | No       | Main "What to Expect" paragraph |
| `image_thumbnail`      | string  | 2000  | No       | **Thumbnail image URL.** Can be an Appwrite Storage view URL (upload image to Storage, then paste the file’s view URL here) or any external image URL. The image file can be saved in Appwrite Storage for the directory. |
| `place_only`           | boolean | -     | No       | If true, only show for place (spa) variant, not home service |

**Permissions:** Set **read** access to **Any** (or to roles that need to see the directory) so the Massage Types Directory page and popovers can load without auth.

## Usage in code

- **Config:** `APPWRITE_CONFIG.collections.directoryMassageTypes` → `'directory_massage_types_'`
- **Service:** `directoryMassageTypesService.listDirectoryMassageTypes()` and `getDirectoryMassageTypeByName(name)`
- **Location:** `src/lib/appwrite/services/directoryMassageTypes.service.ts`

When the collection is empty or the request fails, the app falls back to static data in:

- `src/constants/massageDirectoryTraditional.ts`
- `src/constants/massageDirectorySports.ts`
- `src/constants/massageDirectoryTherapeutic.ts`
- `src/constants/massageDirectoryWellness.ts`
- `src/constants/massageDirectoryCouples.ts` (place-only)
- `src/constants/massageDirectoryBodyScrub.ts` (place-only)
- `src/constants/massageDirectoryPrenatal.ts` (Places + Therapist Home Service)
- `src/constants/massageDirectoryHeadScalp.ts` (Places + Home Service)

## Indexing (optional)

For filtering by category or place-only, create indexes in Appwrite:

- **category** (key: `category`, type: key)
- **place_only** (key: `place_only`, type: key)

Then you can use `Query.equal('category', 'traditional')` and `Query.equal('place_only', true)` in the service.
