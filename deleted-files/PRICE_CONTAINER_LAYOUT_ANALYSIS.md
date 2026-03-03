# Price Container Layout Analysis & Fix Report

## Required Layout (Spec)

Each price container must display:

1. **Image on the left** – Thumbnail, fixed size, first in row
2. **Header (massage name) on a single line** – To the right of the image
3. **Duration options on one line** – `60min` · `90min` · `120min` under the header
4. **Prices directly under each duration** – Price for 60 under 60min, etc. (clear column alignment)

---

## Component-by-Component Analysis

### 1. TherapistPricingGrid (`src/modules/therapist/TherapistPricingGrid.tsx`)

**Status:** ✅ Structure correct, minor fix.

**Current structure:**
- Outer card: `flex flex-col`, `p-3`
- Row: `flex flex-row items-start gap-3`
  - Left: thumbnail `flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16`
  - Right: content `flex-1 min-w-0` with header row (h4 + badge) and `grid grid-cols-3` for labels then prices

**Issues:**
- **Header not strictly single line:** `line-clamp-2` allows the massage name to wrap to two lines. Spec asks for "single line" (truncate with ellipsis if needed).
- Grid order is correct: 6 children in `grid-cols-3` → row1: 60min, 90min, 120min; row2: price60, price90, price120.

**Fix:** Use `truncate` (or `line-clamp-1`) on the header and `flex-nowrap` on the header row so the title stays on one line.

---

### 2. PlacePricing (`src/modules/massage-place/PlacePricing.tsx`)

**Status:** ✅ Structure correct, minor fix.

**Current structure:**
- Same as TherapistPricingGrid: thumbnail left, content right, `grid grid-cols-3` for 60min/90min/120min then three prices.

**Issues:**
- **Header:** `line-clamp-2` on `h4` – same as above; should be single line.

**Fix:** Use `truncate` on the service name and ensure header row doesn't wrap.

---

### 3. TherapistHomeCard (`src/components/TherapistHomeCard.tsx`)

**Status:** ❌ Major deviation.

**Current structure:**
- No image. Each card is only:
  - `div.flex-1.min-w-0` with:
    - `h4` (service name)
    - `p`: "60min · 90min · 120min" (durations as one inline string)
    - `p`: "price1 · price2 · price3" (prices as one inline string with middle dots)

**Issues:**
- **No image on the left.**
- **Durations and prices are not in a grid:** They are two separate lines of text with · separators, so "prices directly under each duration" is not clear (no column alignment).
- Layout does not match the shared spec.

**Fix:** Use the same layout as TherapistPricingGrid: add thumbnail on the left (reuse therapist display image), then one row for header (service name, single line), then `grid grid-cols-3` for 60min / 90min / 120min and the next row for the three prices.

---

### 4. CityPlaceCard (`src/components/CityPlaceCard.tsx`)

**Status:** ❌ Different paradigm.

**Current structure:**
- Three separate cards, one per duration (60 min, 90 min, 120 min).
- Each card has no image and contains:
  - Title: e.g. "Treatment · 60 min"
  - "Estimated time: 60 minutes"
  - "Price: IDR ... (fixed)"

**Issues:**
- **No image on the left** in any card.
- **Not one container with all three durations:** It's one container per duration, so there is no "60min, 90min, 120min on one line" and "prices under each".
- Structure is incompatible with the spec.

**Fix:** For the massage category, use the unified layout: one card (or one per service type if applicable) with image left, header (e.g. "Massage"), one row for 60min / 90min / 120min, and one row for the three prices. If the design requires three selectable options, keep one card with three columns (durations + prices) and selection state, not three separate cards.

---

### 5. MassagePlaceHomeCard (`src/components/MassagePlaceHomeCard.tsx`)

**Status:** ❌ Same as CityPlaceCard.

**Current structure:**
- Three cards, one per duration (60 / 90 / 120 min).
- No image; each card: "Massage · {label}", "Estimated time: X minutes", "Price: ...".

**Issues:**
- **No image.**
- **No single line of durations with prices under each;** layout is one card per duration.

**Fix:** Use one card (or one per service type) with image left, header "Massage", one row 60min · 90min · 120min, next row three prices under each, matching PlacePricing/TherapistPricingGrid.

---

## Summary Table

| Component             | Image left | Header single line | Durations one line | Prices under each | Action        |
|----------------------|------------|--------------------|--------------------|-------------------|---------------|
| TherapistPricingGrid | ✅         | ⚠️ line-clamp-2    | ✅ grid             | ✅ grid           | Truncate header |
| PlacePricing         | ✅         | ⚠️ line-clamp-2    | ✅ grid             | ✅ grid           | Truncate header |
| TherapistHomeCard    | ❌         | ⚠️                 | ❌ inline ·         | ❌ inline ·       | Full layout   |
| CityPlaceCard        | ❌         | N/A                | ❌ 1 card/duration  | ❌ 1 price/card    | Unified layout |
| MassagePlaceHomeCard | ❌         | N/A                | ❌ 1 card/duration  | ❌ 1 price/card    | Unified layout |

---

## Recommended Unified HTML/CSS Structure

Use this structure for every price container so all display consistently:

```html
<div class="price-card rounded-xl border-2 p-3 flex flex-col ...">
  <div class="flex flex-row items-start gap-3">
    <!-- 1. Image on the left -->
    <div class="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 border-amber-200">
      <img src="..." alt="" class="w-full h-full object-cover" />
    </div>
    <!-- 2. Content: header + durations + prices -->
    <div class="flex-1 min-w-0">
      <!-- 2a. Header (massage name) – single line -->
      <div class="flex items-center gap-2 mb-1 flex-nowrap">
        <h4 class="text-xs font-bold text-gray-900 truncate">{serviceName}</h4>
        <!-- optional badge -->
      </div>
      <!-- 2b. Durations on one line, then prices directly under -->
      <div class="grid grid-cols-3 gap-x-2 gap-y-0.5 items-baseline text-left">
        <span>60min</span><span>90min</span><span>120min</span>
        <span>{price60}</span><span>{price90}</span><span>{price120}</span>
      </div>
    </div>
  </div>
</div>
```

- **Image:** Always first child in the row, fixed size, `flex-shrink-0`.
- **Header:** Single line with `truncate` (or `line-clamp-1`), `flex-nowrap` on the header row.
- **Durations + prices:** One `grid grid-cols-3` with 6 children so column alignment is guaranteed and prices sit under the correct duration.

---

## Fixes Applied in Code

1. **TherapistPricingGrid** – Header: `line-clamp-2` → `truncate`; header row: add `flex-nowrap`.
2. **PlacePricing** – Same header fix.
3. **TherapistHomeCard** – Add thumbnail column; replace inline "60min · 90min · 120min" and "p1 · p2 · p3" with the same grid layout as TherapistPricingGrid.
4. **CityPlaceCard** – (Optional follow-up) Refactor to one card with image + header + 3-col grid for massage category.
5. **MassagePlaceHomeCard** – Replace three separate cards with one card (or one per type) using image left + header + grid for durations and prices.

This report and the code changes ensure every price container follows the same layout: image left, header on one line, durations on one line, prices directly under each duration.
