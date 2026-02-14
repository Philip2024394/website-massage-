# View Profile (Job Listings) → Landing Redirect – Audit

## Summary
**Issue:** Clicking "View Profile" on a therapist listing in Job Positions (Find Professionals) sometimes sent the user to the main landing page instead of the therapist profile.

**Root cause:** `useURLRouting`’s initial/sync effect treated **pathname === '/'** as “root” and called `setPage('landing')` when the hash was `#/therapist-profile/...`. In this SPA, pathname is always `/`; the real route is in the hash. So after navigating to the profile (hash set correctly), the effect ran again and overwrote the page with `landing`.

---

## 1. Does the View Profile page exist?

**Yes.**

- **Route:** `shared-therapist-profile`
- **Component:** `SharedTherapistProfile` in `src/features/shared-profiles/SharedTherapistProfile.tsx`
- **AppRouter:** `case 'shared-therapist-profile':` renders `SharedTherapistProfileDirect` (same component)
- **URL pattern:** `/#/therapist-profile/:therapistId-:slug` (hash-based)

The page exists and is wired in the router.

---

## 2. Is the mock design OK for testing?

**Yes.**

- **MassageJobsPage** builds mock listings from the **therapists** collection (up to 5) with `therapistId: t.$id`, so IDs are real.
- **View Profile** uses `listing.therapistId || listing.$id` and builds:
  - URL: `/#/therapist-profile/${therapistId}-${slug}`
  - Then calls `onNavigate('shared-therapist-profile')`.
- **SharedTherapistProfile** gets the therapist ID from the URL via `extractTherapistIdFromUrl()` (supports hash `#/therapist-profile/...`) and loads the therapist from Appwrite `COLLECTIONS.THERAPISTS`.

So the mock design is fine for testing; the bug was in routing/sync, not in the profile page or mock data.

---

## 3. Flow (before fix)

1. User is on **Job Positions** → **Find Professionals** (page: `massage-jobs`).
2. User clicks **View Profile** on a listing.
3. **MassageJobsPage** runs:
   - `window.history.pushState({}, '', \`/#/therapist-profile/${therapistId}-${slug}\`)`  
     → hash becomes `#/therapist-profile/xxx-slug`.
   - `onNavigate('shared-therapist-profile')`  
     → `setPage('shared-therapist-profile')` (from `useAppState` in `useAllHooks`).
4. Page state becomes `shared-therapist-profile`; URL hash is correct.
5. **useURLRouting** (in `useAllHooks`) runs with `[setPage]` dependency. The **second** effect (initial/sync) runs again when `setPage` reference is used after the navigation.
6. In that effect:
   - `initialPath = window.location.pathname` → `'/'` (always in this SPA).
   - `initialHash = '#/therapist-profile/...'` was **not** handled for therapist profile in the hash block (only employer-job-posting, therapist-job-registration, massage-jobs, and a few dashboard routes were).
   - So the code fell through to `if (initialPath !== '/')` → false → **else** branch.
   - In the else: `if (page !== 'landing' && page !== 'home')` → true → **setPage('landing')**.
7. User is sent to the landing page even though the URL hash still pointed to the profile.

---

## 4. Fixes applied

### A. useURLRouting – handle therapist profile in hash (primary fix)

**File:** `src/hooks/useURLRouting.ts`

- In the **initialHash** block, added handling for:
  - `#/therapist-profile/...` → `setPage('shared-therapist-profile')` and return.
  - `#/share/therapist/...` → same.
- So when the hash is a therapist profile URL, we never reach the “root → landing” logic.

### B. useURLRouting – root path and profile hash (safety net)

**File:** `src/hooks/useURLRouting.ts`

- In the **else** branch for `initialPath === '/'`:
  - If the **hash** is a therapist profile or share-therapist URL, call `setPage('shared-therapist-profile')` and **do not** call `setPage('landing')`.
- Ensures that even if the hash wasn’t handled earlier, we don’t force landing when the URL clearly indicates a profile.

---

## 5. Other relevant code (no change needed)

- **AppStateContext**  
  - `setPage` already treats `shared-therapist-profile` as a path-based page and does **not** overwrite the hash (preserves `#/therapist-profile/...`).  
  - Hashchange handler already maps `hash.startsWith('/therapist-profile/')` → `shared-therapist-profile`.  
  So context was not the cause of the redirect.

- **App.tsx**  
  - The block that cleared “stale” profile hash when pathname was `/` was removed earlier; it had been clearing therapist profile URLs and sending users to landing. No further change needed for this bug.

- **SharedTherapistProfile**  
  - On invalid/missing therapist ID it sets an error state; it does **not** navigate to landing.  
  - `extractTherapistIdFromUrl()` correctly supports hash URLs (`#/therapist-profile/...`).

- **AppRouter**  
  - `shared-therapist-profile` is correctly mapped to `SharedTherapistProfile`.  
  - No default/fallback that sends this route to landing.

---

## 6. Verification

1. Open **Job Positions** → **Find Professionals**.
2. Click **View Profile** on any therapist listing.
3. Expected: URL is `...#/therapist-profile/<id>-<slug>`, page shows **SharedTherapistProfile** (therapist profile).
4. Not expected: redirect to main landing page.

If the therapist ID from the listing does not exist in `COLLECTIONS.THERAPISTS`, the profile page will show an error state (“Invalid profile URL” or “Therapist not found”), but it should **not** redirect to landing.

---

## 7. Files touched in this fix

| File | Change |
|------|--------|
| `src/hooks/useURLRouting.ts` | Handle `#/therapist-profile/` and `#/share/therapist/` in the initialHash block; in the root-path else branch, do not set landing when hash is a therapist profile URL. |

---

*Audit date: 2026-02-14*
