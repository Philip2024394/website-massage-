# Therapist main image audit – home vs profile

**Date:** 2026-02-13  
**Goal:** Same main image on therapist home card and therapist profile page; single source of truth; no repeated fixes.

---

## Root cause

1. **Profile page** uses `getTherapistMainImage(therapist)` (via `TherapistCard` → `TherapistCardHeader`). Image comes from Appwrite: `mainImage` → `profileImageUrl` → `heroImageUrl` → fallback.
2. **Home page** used a different path:
   - **TherapistHomeCard** used `(therapist as any).mainImage || (therapist as any).profilePicture` (different order, no `profileImageUrl`/`heroImageUrl`, no shared fallback).
   - **MainHomePage** (and HomePage) overwrote `mainImage` with `assignedImage` (shuffled ImageKit images for “variety”), so the home card often showed a different image than the profile.

So the same therapist could show:
- **Home:** shuffled ImageKit or `mainImage`/`profilePicture` only.
- **Profile:** Appwrite URL from `getTherapistMainImage` (mainImage → profileImageUrl → heroImageUrl → fallback).

---

## Single source of truth

**`src/utils/therapistImageUtils.ts`** – `getTherapistMainImage(therapist)`:

- Priority: `mainImage` → `profileImageUrl` → `heroImageUrl` → `getRandomTherapistImage(therapistId)`.
- Valid URL = non-empty string, `http(s)://`, not `data:` (no SVG placeholders).
- Used by: TherapistCard (home + profile), TherapistProfileBase (shared hero + RotatingReviews).

---

## Changes made

| Location | Before | After |
|----------|--------|--------|
| **TherapistHomeCard** (main banner) | `mainImage \|\| profilePicture` | `getTherapistMainImage(therapist)` |
| **TherapistHomeCard** (avatar circle) | `profilePicture \|\| mainImage` | `profilePicture \|\| getTherapistMainImage(therapist)` (avatar can stay face-first) |
| **MainHomePage / HomePage** | `mainImage: assignedImage \|\| therapist.mainImage` | No override; pass therapist as-is so card uses DB image via util |
| **TherapistHeader** | `therapist.mainImage \|\| getRandomTherapistImage(...)` | `getTherapistMainImage(therapist)` |

---

## Safe, long-term approach

1. **One function for “main” image:** Any UI that shows the therapist’s main/hero image (home card, profile card, shared profile hero, headers) must use **only** `getTherapistMainImage(therapist)`. No ad-hoc `mainImage || profilePicture` or `assignedImage` for that purpose.
2. **No overwriting for variety:** Do not replace `therapist.mainImage` with shuffled/random URLs for display. If you want variety, do it only when the therapist has no valid main image (e.g. inside `getTherapistMainImage` fallback), not by overwriting on the list.
3. **Avatar vs banner:** For the small circular “profile picture” you can still prefer `profilePicture` (face) and fall back to `getTherapistMainImage` so avatar and banner stay consistent when there is no separate avatar.
4. **New UIs:** Any new component that shows the therapist’s main image should import and use `getTherapistMainImage` only.

---

## Files touched

- `src/components/TherapistHomeCard.tsx` – main banner and avatar use `getTherapistMainImage`.
- `src/pages/MainHomePage.tsx` – removed `mainImage: assignedImage || therapist.mainImage`; therapist passed as-is.
- `src/pages/HomePage.tsx` – same removal if the same pattern existed.
- `src/components/therapist/TherapistHeader.tsx` – use `getTherapistMainImage(therapist)`.

---

## Verification

- Home: therapist card main image = Appwrite main image (or profileImageUrl/heroImageUrl/fallback).
- Profile: TherapistCard main image = same util → same URL.
- No `assignedImage` or shuffled image replacing DB main image on the card.
