# Country Code Backfill Script

This script fills missing `countryCode` fields on therapist and massage place documents in Appwrite.

## Requirements
- Node.js 16+
- Environment variables set (see below)
- Server API key with Databases read/write permissions

## Env Variables
Set these before running:

- `APPWRITE_ENDPOINT` (e.g., https://syd.cloud.appwrite.io/v1)
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`
- `DATABASE_ID`
- `THERAPISTS_COLLECTION_ID` (optional if only running for places)
- `PLACES_COLLECTION_ID` (optional if only running for therapists)
- `DRY_RUN` (default `true`; set to `false` to perform updates)

Windows PowerShell example:

```pwsh
$env:APPWRITE_ENDPOINT="https://syd.cloud.appwrite.io/v1"
$env:APPWRITE_PROJECT_ID="xxxx"
$env:APPWRITE_API_KEY="xxxx"
$env:DATABASE_ID="xxxx"
$env:THERAPISTS_COLLECTION_ID="xxxx"
$env:PLACES_COLLECTION_ID="xxxx"
$env:DRY_RUN="true"   # change to false to write
pnpm run backfill:countryCodes
```

## Behavior
- If `countryCode` is already a 2-letter ISO code, document is skipped.
- Otherwise attempts to derive from:
  - `country` | `addressCountry` | `locationCountry` fields
  - the trailing part of `address` (after the last comma)
- Uses a curated country-name to ISO-code mapping with safe heuristics.
- Logs actions; in dry-run mode, does not write any changes.

## Notes
- Collections config file (`lib/appwrite.collections.json`) is not used; provide collection IDs via env.
- Extend the `COUNTRY_MAP` in `scripts/backfill-country-codes.mjs` if you use uncommon country naming.
