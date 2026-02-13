# Confirmation: Where 60 / 90 / 120 min prices come from

**Summary:** The three price containers (60 min, 90 min, 120 min) on therapist and place cards use the following sources. Values are stored in **thousands** in the DB (e.g. `280` = Rp 280,000); the UI multiplies by 1000 for display.

---

## 1. Therapist cards (TherapistCard & TherapistHomeCard)

**Priority order (first valid wins):**

| Priority | Source | Where it lives | Notes |
|----------|--------|----------------|-------|
| 1 | **Menu (Appwrite)** | `therapistMenusService.getByTherapistId()` → document’s `menuData` (JSON array) | Menu items with `price60`, `price90`, `price120` (in thousands). Card uses the service with **lowest total (60+90+120)** among all slider items (Traditional Massage + any custom menu). Loaded per card. |
| 2 | **Therapist document – separate fields** | Appwrite therapist document: `price60`, `price90`, `price120` | Stored in thousands (e.g. `280` = Rp 280,000). Card multiplies by 1000. |
| 3 | **Therapist document – JSON field** | Appwrite therapist document: `pricing` (JSON string like `{"60":280,"90":320,"120":380}`) | Legacy format; values in thousands. Parsed via `parsePricing(therapist.pricing)` in `src/utils/appwriteHelpers.ts`. |
| 4 | **Sample (display-only)** | `getSamplePricing(therapistId)` in `src/utils/samplePriceUtils.ts` | Used **only when therapist has no real prices**. Deterministic per therapist ID; base ~130k/155k/190k IDR with variation. |

**Logic (same for TherapistCard and TherapistHomeCard):**

- If **menu data** exists and has at least one service with valid 60/90/120:
  - “Default” pricing is from therapist `price60`/`price90`/`price120` or `therapist.pricing` JSON.
  - From menu, the service with **lowest total (price60 + price90 + price120)** is taken (Traditional Massage + any custom menu).
  - That service’s 60/90/120 and its **massage type name** are shown in the three containers; if no menu, therapist doc or sample is used.
- Else if therapist has **all three** of `price60`, `price90`, `price120` (or equivalent in `pricing` JSON) → use them.
- Else if therapist has **no** actual pricing → use **sample pricing** (display-only).
- Otherwise → show 0 / “Contact” (containers may hide if not all three > 0).

**Files:**

- `src/components/TherapistCard.tsx` – `getPricing()` (menu → therapist fields → therapist.pricing → sample).
- `src/components/TherapistHomeCard.tsx` – same logic; menu from `therapistMenusService` or `prefetchedMenu`.

---

## 2. Place cards (MassagePlaceHomeCard, PlaceCard, FacialPlaceHomeCard)

### MassagePlaceHomeCard & FacialPlaceHomeCard

| Source | Where | Format |
|--------|--------|--------|
| **Place document – separate fields** | Appwrite place document: `price60`, `price90`, `price120` | Stored in thousands; card does `parseInt(place.price60) * 1000` etc. |

- No menu fallback; no sample pricing.
- If any of 60/90/120 is missing or 0, that container shows “Contact” or “Call”.

### PlaceCard (e.g. search results / list view)

| Source | Where | Format |
|--------|--------|--------|
| **Place document – JSON field** | Appwrite place document: `place.pricing` | JSON string, e.g. `{"60":280,"90":320,"120":380}` (values in thousands). Parsed with `JSON.parse(place.pricing)`. |

- No separate `price60`/`price90`/`price120` usage in this component; only `place.pricing` JSON.
- If `place.pricing` is missing, the three containers are not shown (wrapped in `place.pricing && (...)` ).

---

## 3. Quick reference

| Card | 60 min source | 90 min source | 120 min source |
|------|----------------|---------------|-----------------|
| **TherapistCard** | Menu (cheapest service) **or** therapist `price60` / `pricing["60"]` **or** sample | Same logic for 90 | Same for 120 |
| **TherapistHomeCard** | Same as TherapistCard | Same | Same |
| **MassagePlaceHomeCard** | `place.price60` (×1000) | `place.price90` (×1000) | `place.price120` (×1000) |
| **FacialPlaceHomeCard** | `place.price60` (×1000) | `place.price90` (×1000) | `place.price120` (×1000) |
| **PlaceCard** | `JSON.parse(place.pricing)["60"]` (shown as e.g. “280k”) | Same `pricing["90"]` | Same `pricing["120"]` |

---

## 4. Appwrite / backend

- **Therapists:**  
  - Therapist document: `price60`, `price90`, `price120` (numbers, in thousands) and/or `pricing` (JSON string).  
  - Menu: separate collection/document per therapist (`therapistMenusService`), field `menuData` = JSON array of services; each item can have `price60`, `price90`, `price120` (in thousands).
- **Places (massage/facial):**  
  - Place document: either `price60`, `price90`, `price120` (for home cards) or `pricing` JSON string (for PlaceCard).

So: **the 60/90/120 values are either from the therapist/place document in Appwrite or from the therapist’s menu document; therapist cards can additionally use display-only sample pricing when no real prices exist.**
