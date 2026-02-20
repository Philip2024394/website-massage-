# Therapist collection – city filtering (Appwrite)

Strict, SEO-safe city filtering for IndaStreetMassage. Each therapist belongs to **one city** and appears only on that city’s pages.

## Attributes used for city filtering (current schema)

| Attribute      | Type    | In your schema | Usage |
|----------------|---------|----------------|--------|
| **locationId** | string (100) | ✅ Yes, NULL allowed | **Primary.** Canonical city slug (e.g. `"yogyakarta"`, `"bandung"`, `"denpasar"`). Query uses `Query.equal('locationId', primaryCity)`. Must be set for each therapist to appear on a city page. |
| **isLive**     | boolean | ✅ Yes, default true | Only therapists with `isLive = true` are shown on city pages. |
| **primary_city** | boolean | ⚠️ In schema as boolean | Not used for query (would need to be **string** for city slug). Client-side fallback uses **locationId** first. |
| **country**    | string  | ❌ Not in collection | Optional; add later if you want `country = "Indonesia"` in the query. |

## Collection ID

- Env: **`VITE_THERAPISTS_COLLECTION_ID`** = your Appwrite Therapists collection ID (the ID from the Appwrite console, not the literal `"therapists_collection_id"` unless that is your actual collection ID).

## Query rules (city pages)

When loading therapists for a city (e.g. `/indonesia/yogyakarta/home-massage`):

- **Strict filters (query level):**
  - `locationId = "<canonical_city_id>"` (e.g. `"yogyakarta"`)
  - `isLive = true`
- **No:** `contains()`, partial match, GPS, radius.
- **Fallback:** If the API throws (e.g. unknown attribute), the app retries without city filters and filters by **locationId** client-side.

## Routes

- City service pages: `/indonesia/:city/:service`  
  Example: `/indonesia/yogyakarta/home-massage`
- Route sets `selectedCity` from URL and shows home with therapists for that city only.
- No “all therapists” fallback on city pages; empty state: *“No therapists available in this city yet.”*

## SEO

- City pages get dynamic `<title>` and `<meta name="description">`, e.g.  
  **Title:** `Home Massage in Yogyakarta | IndaStreetMassage`  
  **Description:** `Book trusted home massage therapists in Yogyakarta. Safe, verified, and easy to book.`

## Therapist dashboard (recommended)

- Therapist must select **one** primary city (required, single select).
- Empty or multiple primary cities should be invalid.
