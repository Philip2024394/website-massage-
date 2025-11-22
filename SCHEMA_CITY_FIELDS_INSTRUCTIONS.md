# Appwrite Schema Update: City + Country Fields

Add precise location filtering by storing `city`, `countryCode`, `country` directly on therapist and place documents.

## 1. Fields to Add (Both Collections)
| Field | Type | Size | Required | Notes |
|-------|------|------|----------|-------|
| city | String | 100 | No | Locality (e.g. "Yogyakarta") |
| countryCode | String | 2 | No | ISO Alpha-2 (e.g. "ID", "GB") |
| country | String | 100 | No | Full country name (e.g. "Indonesia") |

Order does not matter; adding them enables new radius + city logic already coded.

## 2. Console Steps
1. Open Appwrite Console → Database → Your database (`APPWRITE_CONFIG.databaseId`).
2. Open `therapists` collection (or `therapists_collection_id`).
3. Click **Add Attribute** three times:
   - `city` → String → size 100 → Not required → Create.
   - `countryCode` → String → size 2 → Not required → Create.
   - `country` → String → size 100 → Not required → Create.
4. Repeat for `places` collection.
5. Wait for migration to finish (status indicator should complete without errors).

## 3. Existing Code Expectations
- Creation/Update (`therapistService.create/update`, `placeService.create/update`) now send these fields if present.
- Reverse geocoding (`locationService`) attaches `city` to `UserLocation`; stored user location is used for filtering.
- Radius filter (50km) in `appwriteService` prefers explicit `city` field. Falls back to first part of `location` if `city` missing.

## 4. Backfill Existing Documents
After attributes exist run:
```bash
# PowerShell
$env:APPWRITE_API_KEY="YOUR_SUPER_API_KEY"
node scripts/backfill-city-fields.cjs
```
This script:
- Derives `city` from `location` (first comma segment).
- Copies any existing `countryCode`/`country` or leaves blank if missing.
- Skips docs that already have both `city` and `countryCode`.

## 5. Verifying Success
1. Open a few therapist/place documents → confirm new fields populated.
2. In browser localStorage check `app_user_location` includes `city` after entering app.
3. Ensure only providers within 50km AND same city appear on home page.
4. If providers not showing: verify they have valid `coordinates` and the `city` matches user city.

## 6. Troubleshooting
| Symptom | Fix |
|---------|-----|
| All therapists disappear | Confirm added attributes & backfill ran; check user `lat/lng` not null. |
| Providers outside city still show | Ensure their `city` differs; if missing, backfill again or manually edit. |
| Distance not visible | Check `coordinates` field format ("lat,lng"). |
| User city blank | Reverse geocoding may have failed; test on device with network; consider adding manual selection UI later. |

## 7. Optional Enhancements
- Add `serviceRadius` per therapist/place and filter dynamically instead of global 50km.
- Add `cityNormalized` attribute (lowercase) to optimize city equality queries server-side.
- Add composite index: `(countryCode, city)` if performing server filtering later.

## 8. Rollback Plan
If issues arise:
1. Remove radius filter block in `appwriteService.ts` (search for `Radius filter applied`).
2. Re-run without city logic; system falls back to country-only visibility.

---
After completing steps, run `pnpm dev` and confirm the flow.
