# Appwrite Countries Collection – Side Drawer & Linked Websites

## Overview

The **countries** collection in Appwrite backs:

- **Side drawer** “IndaStreet Countries” in the main app (list of countries; optional linked website URL per country).
- **Admin dashboard** Country Management (CRUD, linked website URL, active flag, etc.).

When a country has **linkedWebsite** set, tapping it in the drawer opens that URL in a new tab. Otherwise, the app uses in-app navigation (e.g. Indonesia → Indonesia landing page).

## 1. Create the collection in Appwrite

From the project root, with an API key that has permission to create collections:

```bash
APPWRITE_API_KEY=your_api_key npx ts-node scripts/setup-countries-collection.ts
```

Get the API key from:  
**Appwrite Console → Your Project → Overview → API Keys** (create a key with “Databases” write access).

The script creates:

- **Collection ID:** `countries`
- **Name:** Countries
- **Permissions:** Read = Any (public read for drawer); Create/Update/Delete = admin team (or adjust as needed).

## 2. Attributes (created by the script)

| Attribute         | Type    | Size  | Required | Notes                                      |
|------------------|---------|-------|----------|--------------------------------------------|
| code             | string  | 10    | yes      | ISO country code (e.g. ID, US)             |
| name             | string  | 255   | yes      | Display name                               |
| flag             | string  | 20    | yes      | Emoji or flag code                         |
| description      | string  | 500   | no       | Short description                          |
| language         | string  | 20    | no       | Primary language code                      |
| languages        | string  | 2000  | no       | JSON array of language codes               |
| active           | boolean | —     | no       | Default true; only active shown in drawer  |
| dialCode         | string  | 10    | no       | e.g. +62                                   |
| currency         | string  | 10    | no       | e.g. IDR                                   |
| timezone         | string  | 100   | no       | e.g. Asia/Jakarta                          |
| cities           | string  | 10000 | no       | JSON array of city objects                 |
| totalTherapists  | integer | —     | no       | Stats                                      |
| totalBookings    | integer | —     | no       | Stats                                      |
| **linkedWebsite**| string  | 500   | no       | URL for country’s site (drawer link)       |

## 3. Config and code references

- **Schema:** `src/config/appwriteSchema.ts` → `COLLECTIONS.COUNTRIES`
- **Main app config:** `src/lib/appwrite.config.ts` → `collections.countries` (from `VALIDATED_COLLECTIONS.countries`)
- **Validator:** `src/lib/appwrite-collection-validator.ts` → `COUNTRIES: 'countries'`
- **Admin dashboard:** `apps/admin-dashboard/src/lib/appwrite.ts` → `COLLECTIONS.countries` and `APPWRITE_CONFIG.collections.countries`
- **Main app service:** `src/lib/appwrite/services/countries.service.ts` → `fetchDrawerCountries()`
- **Drawer hook:** `src/hooks/useDrawerCountries.ts` → used by `AppDrawerClean.tsx`

## 4. Admin: Linked website

In **Admin Dashboard → Country Management**:

- **Add/Edit country** → set **Linked Website URL** (e.g. `https://indonesia.indastreet.id`).
- If set, the side drawer opens this URL in a new tab when the user taps that country.
- If empty, the drawer uses in-app navigation only (e.g. Indonesia → Indonesia page).

## 5. Behaviour summary

- **Drawer:** Uses `useDrawerCountries()` which calls `fetchDrawerCountries()` (Appwrite). If the collection is missing or the request fails, it falls back to the static `DRAWER_COUNTRIES_LIST` from `src/constants/drawerCountries.ts`.
- **linkedWebsite:** Optional. When present, the country is rendered as an `<a href={linkedWebsite}>` in the drawer; when absent, as a `<button>` that triggers in-app navigation.
- **Admin:** Reads/writes `languages` and `cities` as JSON strings to match the collection attributes; the UI still uses arrays.

## 6. Optional: Create collection manually

If you prefer not to run the script:

1. In Appwrite Console → Databases → your database → Create collection → ID: `countries`, Name: Countries.
2. Add the attributes above with the same types and sizes.
3. Set permissions: Read for “Any”, write for your admin role/team.

After the collection and attributes exist, the app and admin dashboard will use them without further code changes.
