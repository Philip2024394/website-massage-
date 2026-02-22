# Audit Report: Price Containers – Massage Home Service & Places vs Beauty/Facial

**Date:** 2026  
**Scope:** Price/treatment containers on home page cards: massage home service (therapist), massage places, beauty/facial (skin clinic).  
**Requirement:** 3 containers, 1 under each other, full card width, same layout as beauty/facial.

---

## Reference: Beauty / Facial Containers

**Component:** `FacialPlaceHomeCard.tsx` (skin clinic home card)

- **Layout:** `space-y-2` (vertical stack). Each item: `w-full` full-width block.
- **Count:** 3 containers (60 min, 90 min, 120 min).
- **Style:** "Treatments Trending" heading, "Fixed prices • View profile to book", orange containers (`beautician-card-container-highlight`, `rounded-xl border-2 border-orange-400`, `bg-orange-50/80`), "Professional rates • Verified profile" footer.
- **Result:** ✅ 3 containers stacked one under each other, full width.

**Component:** `TherapistHomeCard.tsx` (beautician branch – `isBeauticianWithTreatments`)

- **Layout:** `space-y-2` (vertical stack). Each item: `w-full`.
- **Count:** 3 treatment containers (from `beauticianTreatments.slice(0, 3)`).
- **Style:** Same as above (Treatments Trending, fixed prices, orange highlight, Professional rates).
- **Result:** ✅ 3 containers stacked one under each other, full width.

---

## Massage Places (MassagePlaceHomeCard)

**Component:** `MassagePlaceHomeCard.tsx`

- **Layout:** `space-y-2` (vertical stack). Each item: `w-full` (`beautician-card-container-highlight w-full ...`).
- **Count:** 3 containers (60 min, 90 min, 120 min).
- **Style:** Same as beauty/facial (Treatments Trending, Fixed prices • View profile to book, orange containers, Professional rates • Verified profile).
- **Result:** ✅ **CONFIRMED** – 3 containers, 1 under each other, full screen/card width, same as beauty/facial.

---

## Massage Home Service – Therapist Card (60/90/120 pricing)

**Component:** `TherapistHomeCard.tsx` (branch: `pricing["60"] > 0 && pricing["90"] > 0 && pricing["120"] > 0`)

- **Layout (before fix):** `grid grid-cols-3 gap-2` → 3 **columns** side by side.
- **Count:** 3 containers (60 min, 90 min, 120 min).
- **Style:** Orange theme (bg-orange-100, border-orange-300/400) but different structure (no "Treatments Trending" list layout).
- **Result (before fix):** ❌ Was 3 columns side by side.

**Corrective action applied:** This branch was updated to use the same list layout as beauty/facial: "Treatments Trending" heading, `space-y-2`, and 3 full-width rows with `beautician-card-container-highlight` (same container style and copy as MassagePlaceHomeCard/FacialPlaceHomeCard). **Result (after fix):** ✅ 3 containers stacked one under each other, full width.

---

## Summary

| Card type                 | Layout               | 3 stacked, full width? | Status    |
|---------------------------|----------------------|-------------------------|-----------|
| Beauty/Facial (FacialPlaceHomeCard) | `space-y-2`, `w-full` | Yes                     | ✅ Reference |
| Beautician (TherapistHomeCard treatments) | `space-y-2`, `w-full` | Yes                     | ✅ Match  |
| Massage places (MassagePlaceHomeCard)     | `space-y-2`, `w-full` | Yes                     | ✅ Confirmed |
| Massage home service (TherapistHomeCard 60/90/120) | `space-y-2`, `w-full` (after fix) | Yes | ✅ Confirmed |

**Conclusion:** All four card types now use the same price-container pattern: **3 containers, 1 under each other, full card width**, with "Treatments Trending", "Fixed prices • View profile to book", orange full-width rows, and "Professional rates • Verified profile". Massage home service (therapist 60/90/120) was updated from a 3-column grid to this stacked layout to match beauty/facial and massage places.
