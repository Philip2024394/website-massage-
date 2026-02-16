# Facial View Profile → Facial Places Profile Routing Audit

**Date:** Feb 17, 2025  
**Scope:** What can cause the facial view profile to divert to the facial places (main) page or to the massage place profile; mapping and router behavior.

---

## 1. Router & URL mapping (in place)

| URL pattern | Page state | Handled in |
|------------|------------|------------|
| `#/profile/place/:id-slug` | `massage-place-profile` | AppStateContext (getInitialPage + hashchange), App.tsx, useURLRouting.ts, urlMapper.ts |
| `#/profile/facial/:id-slug` | `facial-place-profile` | AppStateContext (hashchange only*), App.tsx, useURLRouting.ts, urlMapper.ts |

\* **Issue found:** Initial load for `/profile/facial/` was not mapped in `getInitialPage()`.

---

## 2. Root causes of diversion (facial profile → wrong page)

### A. Initial load: `/profile/facial/` not mapped in `getInitialPage()`

- **File:** `src/context/AppStateContext.tsx`
- **Behavior:** `getInitialPage()` had branches for `/profile/place/` → `massage-place-profile` and for `/share/facial/`, but **no branch for `/profile/facial/`**.
- **Effect:** Opening a direct link like `#/profile/facial/xyz-slug` set `page` to the raw hash (e.g. `"/profile/facial/xyz-slug"`). The AppRouter `switch (page)` only has a `case 'facial-place-profile'`, so the route did not match and fell through to the default (e.g. home or wrong page).
- **Fix applied:** Added in `getInitialPage()`:
  - `hash.startsWith('/profile/facial/')` → return `'facial-place-profile'`.

### B. Click from home: facial place treated as massage place

- **File:** `src/hooks/useNavigation.ts` — `handleSetSelectedPlace(place)`
- **Behavior:** The handler decides “facial” vs “massage” by:
  - `placeType === 'facial' || placeType === 'beauty'`
  - or `(place as any).facialTypes !== undefined`
  - or `(place as any).facialServices !== undefined`
- **Problem:** Facial places come from `facialPlaceService.getAll()` → `docToPlaceLike(doc)`. `docToPlaceLike` did **not** set `type: 'facial'` on the returned object. If a document had no `facialTypes` / `facialServices` (or they were empty), `isFacial` was false and the code used the **massage** branch: `setPage('massage-place-profile')` and URL `#/profile/place/:id-slug`. That sent the user to the massage place profile (or a mismatched state) instead of the facial place profile.
- **Fix applied:** In `src/lib/services/facialPlaceService.ts`, `docToPlaceLike()` now sets `type: 'facial'` on the returned object so `handleSetSelectedPlace` always treats these as facial and keeps `facial-place-profile` + `#/profile/facial/`.

---

## 3. Flow summary

1. **Home → Facial place card**
   - Facials tab uses `FacialPlaceHomeCard` with `onClick={onSelectPlace}`.
   - `onSelectPlace` is `handleSetSelectedPlace(place)` (from AppRouter).
   - No separate `onNavigate('facial-place-profile')` from the card; the page and URL are set only inside `handleSetSelectedPlace` based on `place.type` / `facialTypes` / `facialServices`.

2. **URL → page state**
   - **Hash change:** `AppStateContext` `handleHashChange` maps `/profile/place/` → `massage-place-profile`, `/profile/facial/` → `facial-place-profile` (already correct).
   - **Initial load:** `getInitialPage()` now also maps `/profile/facial/` → `facial-place-profile` (fix applied).

3. **AppRouter**
   - `case 'facial-place-profile'`: resolves place from `selectedPlace` or from URL + `facialPlaces` and renders the facial place profile component.
   - `case 'massage-place-profile'`: same idea for massage places. If a facial place was wrongly sent here (due to B above), the user saw the wrong profile or main places experience.

---

## 4. Mapping and router checklist

| Item | Status |
|------|--------|
| Hash → page for `/profile/place/` | ✅ Mapped to `massage-place-profile` (getInitialPage + hashchange) |
| Hash → page for `/profile/facial/` | ✅ Now mapped to `facial-place-profile` (getInitialPage + hashchange) |
| Page → URL in useURLRouting / urlMapper | ✅ `facial-place-profile` ↔ `/profile/facial`, `massage-place-profile` ↔ `/profile/place` |
| App.tsx path handling | ✅ Handles `/profile/place/` and `/profile/facial/` and sets page + selectedPlace |
| handleSetSelectedPlace URL | ✅ Uses `#/profile/facial/` when `isFacial`, `#/profile/place/` otherwise |
| Facial place data shape | ✅ `docToPlaceLike` now sets `type: 'facial'` so navigation stays on facial profile |

---

## 5. Files touched in this audit / fix

- `src/context/AppStateContext.tsx` — Added `/profile/facial/` → `facial-place-profile` in `getInitialPage()`.
- `src/lib/services/facialPlaceService.ts` — Set `type: 'facial'` in `docToPlaceLike()` return value.

No other router or mapping logic needed to be changed; the diversion was caused by the two gaps above.
