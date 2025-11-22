# Countries Collection Schema (Appwrite)

## Why Create a Dedicated Collection?
Having a `countries` (or `market_countries`) collection centralizes all market-specific configuration so you avoid hardcoding logic across multiple files. It enables:

1. Dynamic activation / deactivation of markets without redeploying code.
2. Consistent reference for `countryCode` across therapists, places, pricing, currencies, and future tax / compliance rules.
3. Versionable additions (add attributes safely later without rewriting static arrays).
4. Easy admin UI building (list + toggle + edit vs editing source code and redeploying).
5. Strict filtering reliability (only show documents for countries whose `active` flag is true).

You can KEEP `countries.ts` for static dial codes and fallback values but the runtime should prefer the Appwrite collection when available.

## Recommended Collection Name
- Primary: `countries`
- Alternative (if you want a clearer business prefix): `market_countries`
- Avoid verbose names; keep plural, all lowercase.

## Indexing & Queries
Create indexes on:
- `code` (unique) -> required for quick equality filtering (`countryCode` elsewhere should match this `code`).
- `active` (boolean + code composite index if supported) for filtering markets.
- Consider `displayOrder` numeric index if you sort consistently.

## Attribute Chart
Each attribute lists: Name | Type | Required | Example | Purpose

1. `code` | string (ISO 2) | YES (unique) | `GB` | Canonical key used by other collections (therapists/places).
2. `name` | string | YES | `United Kingdom` | Human readable display name.
3. `dialCode` | string | NO | `+44` | For phone formatting / international calling.
4. `iso3` | string | NO | `GBR` | ISO3 if needed by external integrations.
5. `currencyCode` | string | YES | `GBP` | Used when displaying prices / converting.
6. `currencySymbol` | string | NO | `£` | UI formatting helper.
7. `defaultLat` | float | NO | `51.507351` | Map centering fallback.
8. `defaultLng` | float | NO | `-0.127758` | Map centering fallback.
9. `defaultCity` | string | NO | `London` | Fallback city label.
10. `timeZonePrimary` | string | NO | `Europe/London` | Scheduling anchor timezone.
11. `timeZones` | string[] / JSON | NO | `["Europe/London"]` | Multiple zones if country spans several.
12. `active` | boolean | YES | `true` | Enables/disables marketplace presence.
13. `supportsTherapists` | boolean | YES | `true` | Toggle therapist feature per market.
14. `supportsPlaces` | boolean | YES | `true` | Toggle places feature per market.
15. `showMarketplace` | boolean | NO | `true` | Controls marketplace tab visibility.
16. `manualOnly` | boolean | NO | `false` | If true: never auto-select via GPS (requires explicit user choice).
17. `regionGroup` | string | NO | `EU` | Logical grouping (EU, APAC, etc.).
18. `flagEmoji` | string | NO | `🇬🇧` | Simple inline flag usage.
19. `flagAsset` | string | NO | `/flags/gb.svg` | Path to custom asset if needed.
20. `defaultSearchRadiusKm` | int | NO | `50` | Override generic radius per market.
21. `minBookingAdvanceMinutes` | int | NO | `120` | Enforce lead time for bookings.
22. `taxRatePercent` | float | NO | `20.0` | Apply VAT / GST calculations later.
23. `phoneFormatHint` | string | NO | `UK numbers start with 0` | UI guidance.
24. `bookingCurrencyLock` | boolean | NO | `true` | Prevent cross-currency quoting.
25. `translations` | JSON object | NO | `{ "en": { "welcome": "Welcome" } }` | Future localization container.
26. `notes` | string | NO | `Pilot market Q1` | Internal admin annotation.
27. `createdAt` | datetime | AUTO | (system) | Audit.
28. `updatedAt` | datetime | AUTO | (system) | Audit.

Minimal core subset if you want absolute lean start:
- `code`, `name`, `currencyCode`, `active`.

## Relationships to Other Collections
- Therapists / Places documents must store `countryCode` matching `countries.code`.
- When loading UI: if manual selection present, fetch country record to derive currency/timezone/map defaults.
- Pricing expansions: reference `currencyCode` + `taxRatePercent`.

## Migration Plan
1. Create `countries` collection with the minimal core attributes first.
2. Insert initial active markets (e.g., ID, GB) copying coordinates from `COUNTRY_DEFAULT_COORDS`.
3. Add `countryCode` to all therapist/place documents (already planned) ensuring values match `code` in new collection.
4. Update fetch logic: after determining `viewingCountryCode`, do a read on `countries` collection to hydrate market config cache.
5. Gradually add optional attributes as product features mature (e.g., taxes, booking constraints).

## Example JSON Document
```json
{
  "code": "GB",
  "name": "United Kingdom",
  "dialCode": "+44",
  "currencyCode": "GBP",
  "currencySymbol": "£",
  "defaultLat": 51.507351,
  "defaultLng": -0.127758,
  "defaultCity": "London",
  "timeZonePrimary": "Europe/London",
  "active": true,
  "supportsTherapists": true,
  "supportsPlaces": true,
  "showMarketplace": true,
  "manualOnly": false,
  "regionGroup": "EU",
  "flagEmoji": "🇬🇧",
  "defaultSearchRadiusKm": 50,
  "minBookingAdvanceMinutes": 120,
  "taxRatePercent": 20.0,
  "bookingCurrencyLock": true
}
```

## Admin UI Suggestions
- Toggle active/inactive.
- Inline validation that `code` not duplicated.
- Derived preview: combining `currencySymbol + currencyCode`.

## Implementation Notes
- Keep `code` uppercase; normalize user input (`toUpperCase()`).
- If `manualOnly` true, skip auto GPS assignment and require explicit user selection.
- Consider caching the countries list in memory with a TTL (e.g., 30 min) for performance.

## Next Steps
1. Create collection in Appwrite: `countries`.
2. Add attributes (start with minimal core, then optional).
3. Seed initial documents.
4. Adjust runtime fetch to prefer collection record over static `countries.ts` when present.
5. Remove or reduce reliance on hardcoded arrays as coverage improves.

---
Feel free to request a reduced schema if this is too broad; this version is forward-looking for multi-market expansion.
