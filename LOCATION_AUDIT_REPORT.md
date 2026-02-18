# Location & City Matching — Full Audit Report

**Date:** 2025-02-19  
**Scope:** Dashboard location behavior, app–location connection, Yogyakarta not showing all profiles, Bali showing in Yogyakarta.

---

## 1. Confirmation: App is NOT set by location from dashboard

**Finding: CONFIRMED — Dashboard does not filter the app by location.**

- **Therapist dashboard** (`TherapistDashboard.tsx` / `TherapistDashboardPage.tsx`) only lets the therapist **set** their own service city via the city dropdown (same list as the app: `indonesianCities`).
- The dashboard does **not**:
  - Filter which therapists the consumer app can show.
  - Apply any location filter when loading the therapist list.
- **Data flow:** Therapist chooses city in dashboard → profile is saved with `city` and `locationId` (e.g. `yogyakarta`) → consumer app loads **all** therapists from the API and filters by **user-selected city** on the client.

**Relevant code:**  
`TherapistDashboard.tsx` (e.g. ~line 1193): “Service city” dropdown; save uses `city: derivedLocationId`, `locationId: derivedLocationId`. No API or list filtering by location in the dashboard.

---

## 2. Confirmation: App is fully connected for location matching to displayed profiles

**Finding: CONFIRMED — App is wired for location matching; display had bugs (see below).**

- **Filtering:** `filterTherapistsByCity()` in `cityFilterUtils.ts` is the single place that decides which therapists appear for a selected city. It uses, in order:
  - `therapist.city`
  - `(therapist as any).locationId`
  - `(therapist as any).location_id`
  - `therapist.location`
- **Matching:** `cityMatches()` uses `indonesianCities` and `convertLocationStringToId` so that:
  - Official name, `locationId`, and aliases all match (e.g. Yogyakarta ↔ yogyakarta, Jogja, Yogya).
  - “City, Country” format is handled (city part before comma is used).
- **HomePage flow:** `cityFilteredTherapists` is populated in a `useEffect` from `therapists` and `effectiveCity` (selected city from dropdown / `localStorage`). Only therapists that match the selected city are shown.
- **Data source:** `useDataFetching` calls `therapistService.getTherapists()` **with no city argument**, so the app receives the full therapist list and does **client-side** city filtering. So the app is fully connected: dashboard saves city → app filters by that city for display.

**Conclusion:** Logic for “which profiles have location” and “match to displayed city” is correct. The issues found are in **display** and **location area derivation**, not in the filter itself.

---

## 3. Why Yogyakarta might not display all profiles — Root causes

### 3.1 Profile data (most likely)

- A therapist appears in Yogyakarta **only if** at least one of `city`, `locationId`, `location_id`, or `location` matches the selected city (via `cityFilterUtils`).
- If a therapist actually serves Yogyakarta but:
  - Has **no** `city` / `locationId` / `location` set → they will **not** appear in any city filter.
  - Has a typo or different spelling (e.g. “Jogjakarta”, “Jogja”) → they should still match (aliases in `indonesianCities` and `convertLocationStringToId`).
- **Recommendation:** In Appwrite (or your DB), run a report of therapists with:
  - Empty or null `city`, `locationId`, and `location`.
  - Values that are not in the app’s city list (e.g. not in `indonesianCities`).  
  Fix or backfill these so every live therapist has a correct `city` or `locationId` (e.g. `yogyakarta`).

### 3.2 `_locationArea` not using `locationId` (fixed in code)

- In `HomePage.tsx`, the pipeline that builds the list for cards sets:
  - `locationArea = t.city || t.location || 'Unknown'`
  - It did **not** use `t.locationId` (or `location_id`).
- So if a therapist had `locationId: "yogyakarta"` but empty `city` and `location`, they would get `_locationArea = 'Unknown'`. They would still be **in** the Yogyakarta list (because `filterTherapistsByCity` uses `locationId`), but their card could show “Unknown” or trigger fallback display.
- **Fix applied:** `locationArea` is now derived from `t.city || (t as any).locationId || (t as any).location_id || t.location` so that Yogyakarta (and all cities) display consistently when only `locationId` is set.

### 3.3 Showcase logic and “Yogyakarta” identification

- `getYogyakartaShowcaseProfiles()` finds “Yogyakarta” therapists only by **`t.location`** (string includes “yogyakarta” / “yogya” / “jogja”). It does **not** use `city` or `locationId`.
- So:
  - Therapists with `city: "yogyakarta"` but empty or different `location` are **not** considered Yogyakarta for **showcase** (so other cities might get fewer than 5 showcase profiles). This does **not** reduce the number of real profiles shown **in** Yogyakarta.
  - For **Yogyakarta itself**, showcase is disabled (no showcase profiles are added when `targetCity` is Yogyakarta/Jogja/Yogya).
- So showcase is **not** the reason “Yogyakarta doesn’t show all profiles.” The main reason is almost certainly **missing or incorrect city/locationId/location** on some profiles.

### 3.4 Optional filters

- Other filters (e.g. female-only, area, price, massage type) are applied **after** city filtering. If a therapist is in `cityFilteredTherapists` but then excluded by one of these, they will not appear. That is by design; no bug identified there.

---

## 4. Why a “Bali” profile appears in Yogyakarta — Root cause and fix

**Finding: Display bug — wrong fallback city label (“Bali”) and missing use of `city`/`locationId`.**

- **Filtering:** A therapist can appear in the Yogyakarta list **only** if they pass `filterTherapistsByCity(therapists, "Yogyakarta")`, which uses `city` / `locationId` / `location_id` / `location`. So if they are in the list, their **stored** city/locationId is considered a match for Yogyakarta.
- **Display bug:** In `TherapistCard.tsx` and `TherapistHomeCard.tsx`, the **location display** logic had:
  - Fallback: `cityName = (therapist.location || 'Bali').split(',')[0].trim();`
  - So whenever the card did not have a valid `therapistLocationArea` (or equivalent) and `therapist.location` was empty, the card showed **“Bali”** even when the therapist was actually in the Yogyakarta list (e.g. `city` or `locationId` = Yogyakarta).
- So the issue was **not** that a Bali therapist was incorrectly included in the Yogyakarta filter; it was that a **Yogyakarta** therapist (or one with missing/empty location fields) was **displayed** as “Bali” due to the hardcoded “Bali” fallback and not using `city`/`locationId` for display.

**Fix applied:**

- In **TherapistCard** and **TherapistHomeCard**, the fallback for the location display is now based on **therapist’s actual city**, not a fixed “Bali”:
  - Use `therapist.city || (therapist as any).locationId || therapist.location` and only then a neutral fallback (e.g. “—”) instead of “Bali”.
- This removes the incorrect “Bali” label for therapists that belong to Yogyakarta (or any other city) but had empty `location` and no `_locationArea` in the previous pipeline.

---

## 5. Error report summary

| Issue | Cause | Status |
|-------|--------|--------|
| App “set by location” from dashboard | N/A — dashboard does not filter app by location | Confirmed: not the case |
| App not connected for location | N/A — filtering and matching are correct | Confirmed: connected |
| Yogyakarta not showing all profiles | 1) Profiles missing `city`/`locationId`/`location`<br>2) `_locationArea` ignored `locationId` (card/area display) | 1) Data audit recommended<br>2) Fixed in code |
| Bali showing in Yogyakarta | Card display used `therapist.location \|\| 'Bali'` and did not use `city`/`locationId` | Fixed in code |

---

## 6. Recommendations

1. **Data audit (Appwrite/DB)**  
   For all live/approved therapists, list:
   - `city`, `locationId`, `location_id`, `location`.
   - Ensure every therapist has at least one of these set and that the value matches a known city (e.g. `yogyakarta`, `Yogyakarta`, `Jogja` in `indonesianCities`). Fix or backfill missing/wrong values.

2. **Optional: align showcase with filter**  
   In `getYogyakartaShowcaseProfiles`, consider also treating as “Yogyakarta” therapists whose `city` or `locationId` is yogyakarta/jogja/yogya (not only `location`), so showcase counts match the same logic as `filterTherapistsByCity`.

3. **Monitoring**  
   - Keep the existing `[IndaStreet] Listed therapists in Yogyakarta: X (of Y total from database)` (or equivalent) log to monitor how many therapists match Yogyakarta over time.
   - If “Y” is correct but “X” is low, the cause is profile data (city/locationId/location). If “X” is correct but cards still show wrong city names, the display logic is the place to check (now fixed for the “Bali” fallback and `_locationArea`).

---

## 7. Files changed in this audit (code fixes)

- **`src/pages/HomePage.tsx`** — `_locationArea` now uses `t.city || locationId || location_id || t.location`.
- **`src/components/TherapistCard.tsx`** — Location display fallback uses `therapist.city || locationId || therapist.location` and a neutral fallback instead of “Bali”.
- **`src/components/TherapistHomeCard.tsx`** — Same fallback change as TherapistCard.

No changes were made to:
- Dashboard (it correctly does not filter the app by location).
- `filterTherapistsByCity` or `cityMatches` (already correct).
- API call to `getTherapists()` (correctly called without city so app gets full list and filters client-side).
