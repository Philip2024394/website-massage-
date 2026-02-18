# Elite Location System – Full Audit Report

**Scope:** Main landing page city locations, therapist/place IDs from Appwrite, dropdown location, filter location, and end-to-end flow to elite standards.

**Audit date:** 2026-02-18

---

## 1. Executive Summary

| Area | Status | Notes |
|------|--------|--------|
| Landing page city data | ⚠️ Partial | Static `CITIES_BY_COUNTRY` (multi-country); Indonesia cities not from Appwrite |
| Home page city list (dropdown) | ✅ Working | Static `INDONESIAN_CITIES_CATEGORIZED` + optional Appwrite (cities collection disabled) |
| Therapist fetch from Appwrite | ✅ Working | `therapistService.getTherapists()` → client-side city filter |
| Places / Hotels from Appwrite | ❌ Disabled | Collections `places` and `hotels` are `null` in config → always `[]` |
| Dropdown → filter flow | ⚠️ Partial | Dropdown not rendered on MainHomePage; city from localStorage + context |
| City ↔ Context sync | ⚠️ Gap | App does not pass `selectedCity` / `setSelectedCity` to AppRouter |
| Location ID consistency | ✅ Strong | `locationId` + `city` + aliases used in filtering and matching |

**Overall:** Core therapist-by-location flow works. Places/hotels are off by config. City dropdown is not visible on the main home hero; city comes from landing confirmation and localStorage. A few wiring gaps prevent “elite” consistency (dropdown on home, context sync from App).

---

## 2. Data Flow (End-to-End)

### 2.1 Landing Page → City Selection

- **MainLandingPage** uses:
  - **Multi-country:** `CITIES_BY_COUNTRY` (static) for country/city selection.
  - **Context:** `useCityContext()` → `setCity`, `confirmLocation`, `hasConfirmedCity`, `confirmedLocation`.
- On confirm:
  - `localStorage`: `user_city_id`, `user_city_name` (and optional `user_location_preference`).
  - **CityContext** stores display name (e.g. "Yogyakarta"); `confirmLocation` uses `convertLocationStringToId(cityName)` for stored `cityId`.
- **Gap:** Landing uses its own static list; it does not use the same source as the home dropdown (`INDONESIAN_CITIES_CATEGORIZED` / Appwrite cities). So landing city options can diverge from dropdown options.

### 2.2 Home Page – City Source and Filtering

- **MainHomePage**:
  - **selectedCity** from `useHomePageState()` → initialized from `localStorage` (`user_city_id` or `user_city_name`) or `'all'`.
  - **contextCity** from `useCityContext()`; effect syncs: if `contextCity` is set and ≠ `selectedCity`, then `setSelectedCity(contextCity)`.
  - **Therapist/place lists:** Data comes from **App state** (therapists, places, hotels) set by `useAllHooks` → `fetchPublicData()` (no city passed). All filtering is **client-side** in MainHomePage using:
    - `cityFilteredTherapists` (from `useHomePageLocation` + city filter logic),
    - `cityFilteredPlaces` (local state),
    - and equivalent for hotels.
  - **Filter rule:** `therapist.city || locationId || location_id || location` matched against `selectedCity` via `cityMatches()` (locationId, name, aliases).

### 2.3 City Dropdown Component

- **CityLocationDropdown**:
  - **Data source:** `citiesService.getCitiesByCategory()` → internally `getAllCities()`.
    - If **Appwrite cities collection** is set: fetches from Appwrite and maps to `CityLocation` (name, province, coordinates, isMainCity, isTouristDestination, aliases).
    - **Bug / risk:** Appwrite mapping does **not** set `locationId`. `CityLocation` in `data/indonesianCities.ts` requires `locationId`. So if cities collection is ever enabled, dropdown selection can break (handleCitySelect requires `city.locationId`).
  - **Config:** `APPWRITE_CONFIG.collections.cities` is **null** (disabled), so the app always uses **static fallback** `INDONESIAN_CITIES_CATEGORIZED` (which has `locationId`).
  - **Popular custom locations:** `getPopularCustomLocations(5)` uses `therapistService.getAll()` (Appwrite) and groups by `customCity`; returns `locationId: custom-${slug}`.
  - On select: writes `user_city_id` and `user_city_name` to localStorage and calls `onCityChange(cityId)` (or `city.locationId`).

### 2.4 Where the Dropdown Is Rendered

- **CityLocationDropdown** is **imported** in MainHomePage but **not rendered** in the main home layout. It is used in:
  - TherapistDashboardPage / ControlCenter
  - TherapistProfilePage, MassagePlaceProfilePage
  - AdvancedSearchPage, FacialProvidersPage
- **MainHomePage** does **not** render the dropdown in the hero or sticky bar; it only shows location display text (e.g. `contextCity` or userLocation address). So on the main landing → home flow, **users cannot change city from the home page** unless another entry point (e.g. drawer or another page) exposes it. **App.tsx** does **not** pass `selectedCity` or `setSelectedCity` to AppRouter, so even if a parent passed `onCityChange`, it would be undefined unless the page uses its own state.

### 2.5 Appwrite – Therapists

- **therapistService** (Appwrite):
  - **getTherapists()** → `getAll(undefined, undefined, { liveOnly: true })`.
  - **getAll()** uses `Query.limit(200)` and optionally (via `VITE_THERAPIST_FILTER_STEP` 1/2/3): `approved=true`, `status=online`, `availability=available`. Optional `Query.search('location', city)` when `city` is passed.
  - **useDataFetching** calls `therapistService.getTherapists()` **without** city; then **filterTherapistsByCity(therapists, activeCity)** when `activeCity` is passed. But **fetchPublicData()** is always called **without** `activeCity** from useAllHooks**, so the home page gets **all** therapists and filters only on the client.
  - Documents normalized with `city`, `locationId`, `location` (and SafePass, images, etc.). Filtering uses `therapist.city || locationId || location_id || location`.

### 2.6 Appwrite – Places and Hotels

- **placesService.getPlaces()** / **getAllPlaces()**:
  - **APPWRITE_CONFIG.collections.places** is **null** (disabled). Code returns `[]` without calling Appwrite.
  - So **places** on the home page are always empty (no 404; intentional skip).
- **hotelService**:
  - **APPWRITE_CONFIG.collections.hotels** is **null** (disabled). Same effect: **hotels** always empty.
- **facialPlaceService.getAll()** uses `facial_places` collection (configured); facial places can load.

### 2.7 City Filter Utilities

- **cityFilterUtils.ts**: `filterTherapistsByCity`, `filterPlacesByCity`, `cityMatches`, `validateTherapistCity`, `validatePlaceCity`.
  - Matching uses `findCityByLocationIdOrName(activeCity)` and builds a set of normalized values (locationId, name, aliases); supports "City, Country" by taking the city part. **Correct and consistent** with `data/indonesianCities.ts`.

### 2.8 Custom Locations (Therapist-Defined)

- **customLocationsService**:
  - **getPopularCustomLocations(minTherapists)** uses `therapistService.getAll()` (Appwrite), filters by `isCustomLocation`, `customCity`, lat/lng, groups by `customCity`, returns list with `locationId: custom-${slug}`.
  - **getCustomLocationCenter(customCity)** and **getLocationCoordinates(locationId)** support custom + predefined cities. Uses same therapist service (Appwrite).

### 2.9 Therapist Location Audit (Back-Office)

- **therapistService.getTherapistLocationAudit()**:
  - Fetches all therapists, compares `city` / `locationId` / `location` against `ALL_INDONESIAN_CITIES` (locationId, name, aliases).
  - Returns total, liveCount, withCorrectLocation, incorrectOrMissingLocation, incorrectDetails. **Suitable for data quality checks.**

---

## 3. Broken or Sub-Optimal Parts (Elite Standards)

### 3.1 Critical / Broken

| # | Issue | Location | Impact |
|---|--------|----------|--------|
| 1 | **Places and hotels never load** | `appwrite.config.ts`: `places: null`, `hotels: null` | Home “Massage Places” and hotel sections are always empty. |
| 2 | **City dropdown not on main home** | MainHomePage.tsx | User cannot change city from the main home screen; only from other pages or after re-confirming on landing. |
| 3 | **App does not pass selectedCity/setSelectedCity to AppRouter** | App.tsx → AppRouter | `onCityChange` is undefined for home; any global city change from header/drawer would be no-op unless the page supplies its own handler. |

### 3.2 High (Risky / Inconsistent)

| # | Issue | Location | Recommendation |
|---|--------|----------|----------------|
| 4 | **Appwrite cities mapping missing `locationId`** | `citiesService.ts` → `getAllCities()` map | If cities collection is enabled, add `locationId` (e.g. from doc field or derive from name). |
| 5 | **Landing city list ≠ home dropdown list** | MainLandingPage (CITIES_BY_COUNTRY) vs CityLocationDropdown (INDONESIAN_CITIES_CATEGORIZED) | Unify source for Indonesia (e.g. same static list or same Appwrite collection) so landing and home options match. |
| 6 | **fetchPublicData never receives activeCity** | useAllHooks.ts, useDataFetching.ts | Optional: pass `selectedCity` into `fetchPublicData(activeCity)` so server-side `Query.search('location', city)` can reduce payload for large datasets. |

### 3.3 Medium (Elite Polish)

| # | Issue | Location | Recommendation |
|---|--------|----------|----------------|
| 7 | **CityContext stores display name; filter uses locationId/name/aliases** | CityContext.tsx, cityFilterUtils | Already handled by `getMatchableCityValues` and `convertLocationStringToId`; ensure landing always saves a value that resolves (e.g. prefer locationId when available). |
| 8 | **Real-time subscription refetches all data** | useAllHooks.ts (therapist collection subscribe) | Refetch is full `fetchPublicData()`; no city scoping. Acceptable; optional: debounce or only update therapists. |

---

## 4. What Works Well

- **Therapist list from Appwrite:** Fetched with correct DB/collection; filters (approved/status/availability) configurable via env; IDs and location fields normalized.
- **Client-side city filter:** Strict rule (activeCity must match therapist city/locationId/aliases); `cityMatches` and `findCityByLocationIdOrName` keep dropdown and filter in sync with `data/indonesianCities.ts`.
- **Dropdown data when using static list:** All cities have `locationId` and coordinates; selection persists to localStorage and triggers `onCityChange`.
- **Custom locations:** Popular custom locations and coordinates resolved from therapist data; `custom-*` locationIds supported in filtering.
- **Location audit:** `getTherapistLocationAudit()` gives a clear report for data quality and fixing wrong/missing therapist cities.
- **Geo derivation:** `deriveLocationIdFromGeopoint` used for therapist profile and home fallback; consistent with same city list.

---

## 5. Recommendations (Priority Order)

1. **Enable or explicitly document places/hotels:** Either set `APPWRITE_CONFIG.collections.places` and `hotels` to real collection IDs (and ensure Read permission for users) or document that these are disabled and hide/disable UI that depends on them.
2. **Add city dropdown to main home:** Render `CityLocationDropdown` on MainHomePage (e.g. in sticky hero or under the location display), with `selectedCity` and `onCityChange` that:
   - Call `setSelectedCity(city)` (from useHomePageState), and
   - Call `setContextCity(city)` (from useCityContext) so context and localStorage stay in sync.
3. **Pass city state from App to AppRouter (optional but elite):** If you want a single source of truth for “current city” at app level, add `selectedCity` and `setSelectedCity` to App state (or derive from CityContext) and pass them into AppRouter so all pages receive the same `selectedCity` and `onCityChange`.
4. **Fix Appwrite cities mapping:** In `citiesService.getAllCities()`, when mapping Appwrite documents to `CityLocation`, set `locationId` (e.g. from doc or `convertLocationStringToId(name)`) so that enabling the cities collection does not break the dropdown.
5. **Align landing city list with home:** Use the same Indonesian city source (e.g. `INDONESIAN_CITIES_CATEGORIZED` or shared helper) for the landing page when country is Indonesia, so selected city is always one of the dropdown options.
6. **Optional:** Use server-side city filter in `fetchPublicData(activeCity)` when `activeCity` is set, to reduce payload and align with “elite” single-source filtering.

---

## 6. Verification Checklist

- [ ] **Landing:** Select Indonesia → choose city → confirm → navigate to home. Home shows therapists for that city.
- [ ] **Home:** selectedCity from localStorage/context; changing city (if dropdown added) updates list and context.
- [ ] **Dropdown:** All options have `locationId`; selection writes `user_city_id` / `user_city_name` and calls `onCityChange`.
- [ ] **Therapists:** Only therapists whose city/locationId/aliases match selected city appear when city ≠ "all".
- [ ] **Places/Hotels:** Either show data (collections enabled) or hide/disable sections (collections disabled).
- [ ] **Audit:** Run `getTherapistLocationAudit()` periodically; fix therapists with incorrect or missing city.

---

## 7. File Reference

| Purpose | File(s) |
|--------|---------|
| Landing cities | `MainLandingPage.tsx`, `CityContext.tsx` |
| Home city state | `MainHomePage.tsx`, `useHomePageState.ts` |
| Dropdown | `CityLocationDropdown.tsx`, `citiesService.ts`, `customLocationsService.ts` |
| City filter | `cityFilterUtils.ts`, `data/indonesianCities.ts`, `locationNormalizationV2.ts` |
| Therapist fetch | `lib/appwrite/services/therapist.service.ts`, `useDataFetching.ts`, `useAllHooks.ts` |
| Places/Hotels | `lib/appwrite/services/places.service.ts`, `appwrite.config.ts` |
| Geo → city | `utils/geoDistance.ts` (deriveLocationIdFromGeopoint) |
| App → Router | `App.tsx`, `AppRouter.tsx` |

This audit is the single reference for the elite location system flow and any part of the flow that is broken or not working to standard.

---

## 8. Update: No Limits, GPS-Only Per-City Listing (2026-02-18)

- **No profile-per-location caps:** Removed the 100-therapist/100-place cap. Constants set to 99999; all profiles in a city are listed.
- **Per-city view = GPS city only:** When a city is selected, `useHomePageLocation` and MainHomePage filter by saved `city`/`locationId` (from therapist/place upload GPS). No 10km radius; all profiles whose saved GPS-derived city matches the selected city are shown.
- **No km distance in city view:** When `selectedCity !== 'all'`, TherapistHomeCard does not show “X km away”. Distance sort is skipped in per-city mode.
- **Upload page ↔ main app sync:** Therapist (and place) upload page saves GPS → `deriveLocationIdFromGeopoint` → `city`/`locationId`/`location` in Appwrite. Main app uses the same `city`/`locationId` for filtering. Single source of truth: saved GPS → city on upload; listing uses that city only.
- **filterHotelsByCity** added in `cityFilterUtils.ts` so per-city view includes hotels by the same rule.
