# Audit Report: Therapists Not Displaying for Location Yogyakarta

**Date:** 2025-02-17  
**Scope:** Home page therapist list when user selects or lands on **Yogyakarta**.

---

## Summary

When the user selected **Yogyakarta** (from the landing page or the location dropdown), the home page sometimes showed **no therapists** (or only placeholders) even when therapists for that city existed in Appwrite. The root cause was that the home page preferred **match outcome** (distance-based, limited to 12, strict `locationId` match) over **city-only filtering** whenever the user had a "confirmed" location. That led to empty or placeholder results when no therapists were within 8 km or when `locationId` normalization didn’t align.

**Fix applied:** When the user has selected a city (e.g. Yogyakarta), the home page **always** uses **city-based filtering** so that all therapists whose profile city matches that city are shown. Match outcome is no longer used when a city is selected.

---

## Root Cause

### 1. Two sources of “filtered” therapists

The home page had two ways to decide which therapists to show:

| Source | When used (before fix) | Behavior |
|--------|------------------------|----------|
| **Match outcome** (`therapistMatchOutcome.matches`) | When `hasConfirmedCity` was true | From `matchTherapistsForUser()`: requires `userLocation.cityId`, limits to 12, prioritizes therapists within 8 km, then same-city by `locationId`; can return **placeholders** if few/no matches. |
| **City filter** (`filterTherapistsByCity(therapists, effectiveCity)`) | When no match outcome or no confirmed city | Filters therapists whose profile city matches `effectiveCity` (selected city or context/localStorage). No limit; shows all therapists in that city. |

For **Yogyakarta**, `effectiveCity` was set (e.g. from dropdown or landing), but when the user also had a **confirmed location** (e.g. from landing flow), the code **preferred match outcome**. So:

- If no therapists were within 8 km **or**
- Therapist `locationId` / city didn’t normalize to the same value as `userLocation.cityId`  
→ `matchTherapistsForUser()` returned **empty** or **placeholder** list.  
→ The UI showed no (or wrong) therapists even though `filterTherapistsByCity(therapists, 'Yogyakarta')` would have returned the correct list.

### 2. Match outcome constraints

In `src/utils/therapistMatching.ts`, `matchTherapistsForUser()`:

- Returns **empty** if `!userLocation?.cityId`.
- Requires each therapist to have a parseable `locationId` and to be active/online.
- Compares `convertLocationStringToId(therapistCity) === userLocation.cityId`.
- Caps results at **12** (distance matches first, then city matches).
- If there aren’t enough real matches, it fills with **placeholders** (other cities or fake entries).

So for Yogyakarta:

- Slight mismatch in stored city vs `user_city_id` (e.g. "Jogja" vs "yogyakarta") could lead to no city matches.
- No coordinates or all outside 8 km meant no distance matches.
- Result: empty or placeholder list, and city filter was never used because match outcome was preferred.

### 3. Why “no therapists” appeared

- **Confirmed location + Yogyakarta selected:**  
  Code used `therapistMatchOutcome.matches`. If that was empty or only placeholders → **no real Yogyakarta therapists**.
- **City filter** (which would show all Yogyakarta therapists) was only used when there was **no** match outcome or **no** confirmed city, so it was skipped in the problematic case.

---

## Fix Applied

**File:** `src/pages/HomePage.tsx`  
**Effect:** “Populate cityFilteredTherapists” (around lines 487–512).

**Change:**

- **Before:** If `hasConfirmedCity && therapistMatchOutcome?.matches?.length`, set `cityFilteredTherapists = therapistMatchOutcome.matches` and return; only otherwise use `filterTherapistsByCity(therapists, effectiveCity)` when `hasCity`.
- **After:** When the user has selected a city (`hasCity` is true, e.g. Yogyakarta), **always** set `cityFilteredTherapists = filterTherapistsByCity(therapists, effectiveCity)`. Do **not** use match outcome when a city is selected.

So:

- **Yogyakarta (or any city) selected:** All therapists whose profile city matches that city are shown, regardless of confirmed location or match outcome.
- **“All” or no city:** Behavior unchanged (show all therapists or use match outcome only when it’s the only path).

`therapistMatchOutcome` was removed from the effect dependency array since it is no longer used when a city is selected.

---

## Verification

1. **Select Yogyakarta** (landing or dropdown) and ensure `user_city_id` / `user_city_name` are set (e.g. to `yogyakarta` / `Yogyakarta`).
2. **Open home page:** List should show all therapists whose profile city matches Yogyakarta (via `filterTherapistsByCity`).
3. **Check:** No “Feature Temporarily Unavailable” and no empty list when therapists for Yogyakarta exist in Appwrite.
4. **Data:** Ensure therapist documents have `city`, `locationId`, or `location` set to a value that normalizes to Yogyakarta (e.g. "Yogyakarta", "Jogja", "yogyakarta") so `cityFilterUtils` and `findCityByLocationIdOrName` match correctly.

---

## Related Code

- **City filtering:** `src/utils/cityFilterUtils.ts` (`filterTherapistsByCity`, `getMatchableCityValues`), `src/data/indonesianCities.ts` (`findCityByLocationIdOrName`).
- **Match outcome:** `src/utils/therapistMatching.ts` (`matchTherapistsForUser`), `src/utils/locationNormalizationV2.ts` (`convertLocationStringToId`, `LOCATION_IDS.YOGYAKARTA`).
- **Home page state:** `src/pages/HomePage.tsx` (effect above), `effectiveCity` from `selectedCity` / `contextCity` / `user_city_name`.

---

## Recommendation

- Keep **city-first** behavior: when a city is selected, always show therapists by city; use match outcome only for “no city” / distance-only flows.
- Ensure dashboard and API save therapist `city` / `locationId` in a normalized form (e.g. `locationId: 'yogyakarta'`) so filtering and matching stay consistent.
