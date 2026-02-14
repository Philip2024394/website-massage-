# Main Landing Page — File Structure & User Experience Audit

**Date:** February 2026  
**Scope:** Main landing page (first screen after app load): file structure, data flow, and user experience.

---

## 1. File structure

### 1.1 Entry and routing

| Layer | File | Role |
|-------|------|------|
| **Route config** | `src/router/routes/publicRoutes.tsx` | Defines `landing`: path `/`, **direct import** of `MainLandingPage` (no lazy load). |
| **Router** | `src/AppRouter.tsx` | When `page === 'landing'` returns early (~496–501) and renders `publicRoutes.landing.component` with no loading wrappers. |
| **App shell** | `src/App.tsx` | Hides `GlobalHeader` when `state.page === 'landing'`; landing renders without app chrome. |

**Landing page component:** `src/pages/MainLandingPage.tsx` (default export `LandingPage`).

### 1.2 Main landing page dependencies

**Direct imports in `MainLandingPage.tsx`:**

- **UI:** `Button`, `PageNumberBadge`, `PWAInstallIOSModal`, `UniversalHeader`, `AppDrawer` (latter two **imported but not used** in JSX — dead code).
- **Icons:** `MapPin`, `Play`, `Globe`, `X`, `ChevronUp as ChevronDown` from `lucide-react`.
- **Context:** `useCityContext` from `CityContext`.
- **Hooks:** `usePWAInstall`.
- **Services:** `deviceService`, `customerGPSService`, `ipGeolocationService` (IP used only in comment; detection is via CityContext).
- **Utils/config:** `findCityByCoordinates`, `findCityByName` (`constants/indonesianCities`), `convertLocationStringToId`, `loadLanguageResources`, `isPWA`, `shouldAllowRedirects`, `logger`, types.

**Other related files:**

- **Guard (optional):** `src/guards/LandingPageGuard.ts` — device/network/location pre-checks; not used in the current router path (landing renders immediately).
- **Error boundary:** `src/components/error-boundaries/LandingPageErrorBoundary.tsx` — class component for catching errors; only used if wrapped by parent (not applied in `AppRouter` for landing currently).
- **Shared landing:** `src/shared/components/LandingPage.tsx` and `src/pages/LandingPage.tsx` exist but the **active** route uses `MainLandingPage.tsx` only.

### 1.3 Data and constants (inside MainLandingPage)

- **Static data:** `COUNTRIES` (10 countries with code, name, flag, language), `CITIES_BY_COUNTRY` (large map of cities by country code, e.g. ID, MY, SG, TH, PH, VN, GB, US, AU, DE).
- **Hero image:** Single ImageKit URL `imageSrc` for full-screen background.
- **State:** City/country from `useCityContext`; local state for selected city, country modal, “city not listed”, GPS status, menu open, auto-detect state, etc.
- **Persistence:** `localStorage`: `user_city_id`, `user_city_name`, `user_city_lat`, `user_city_lng`, `user_city_address`. Session: `current_page` on navigate to home.

### 1.4 Flow from landing to home

1. User selects city (from list) or “Use My GPS Location”.
2. `persistCitySelection` / `persistAndBuildLocation` write to `localStorage` and `lastConfirmedLocationRef`.
3. `enterAppCallback` (from App: `handleEnterApp`) is called with language and `UserLocation`.
4. `navigateToHome()` updates session, history, and calls `setPage('home')` (or hash `#/home`).
5. `AppRouter` then renders `publicRoutes.home.component` (`HomePage` from `HomePage.tsx`).

---

## 2. User experience (UX) report

### 2.1 Purpose and flow

- **Purpose:** Collect **country + city** (or GPS), set language, then send user to the **home** page with therapists/places for that location.
- **Flow:** Landing → country (auto or “Change country”) → city list or GPS → “Enter” (implicit on city/GPS action) → Home.

### 2.2 Strengths

- **Clear hierarchy:** Brand (“Indastreet” + “[Country]’s Massage Hub”) → location block → city list or GPS.
- **Country first:** Country is auto-detected (e.g. via CityContext/IP); “Change country” opens a modal with all 10 countries. Language can follow country (e.g. ID → id, US → en).
- **Dual input:** “Use My GPS Location” (primary CTA) and “OR SELECT A CITY” with scrollable list; good for users who prefer not to share GPS.
- **Persistence:** Returning users get last city/country from `localStorage`; city is pre-selected and confirmed in context (no auto-redirect — user must choose again or use GPS to proceed).
- **Mobile-first:** `100dvh`, safe-area insets, touch-friendly targets, scrollable city list (`maxHeight: 35vh`).
- **PWA:** iOS install modal supported via `PWAInstallIOSModal` and `usePWAInstall`; no install prompt on landing in the snippet, but hook is present.
- **Visual feedback:** “Detecting your location...”, “Location detected: …”, “Auto-detected” / “Saved” badge, disabled state on GPS button while detecting.
- **Accessibility (partial):** Semantic buttons, labels, and structure; contrast (white/orange on dark) is generally good.

### 2.3 Pain points and risks

1. **No visible header on landing**  
   App intentionally hides `GlobalHeader` on landing. `UniversalHeader` / `AppDrawer` are imported in MainLandingPage but **not rendered**, so there is no menu or logo on the landing screen. Users cannot open a global nav without going to home first (by design, but limits discovery of “About”, “Contact”, etc. from landing).

2. **Two ways to “enter”**  
   Entering the app happens when user picks a city from the list or completes GPS. There is no explicit “Enter” or “Continue” after a stored city is restored; user must tap a city again or GPS. Copy could make this clearer (“Select a city or use GPS to continue”).

3. **GPS “City not listed”**  
   “Use My GPS Location” is the main CTA; “My city is not listed” is only implied by that flow. If GPS fails or is denied, the only fallback is the city list; no explicit “My city is not listed” link in the visible UI (handling exists in code for `handleCityNotListed`). Naming could be aligned (e.g. “Use GPS or choose city below”).

4. **Long city lists**  
   Some countries (e.g. Indonesia) have very long lists in one scrollable area; search/filter would improve findability on small screens.

5. **Error handling**  
   GPS failure falls back to `alert()`. Network or permission errors could use inline messages or a small toast consistent with the rest of the app.

6. **Landing not wrapped in error boundary**  
   If MainLandingPage throws, the error propagates. Wrapping the landing route in `LandingPageErrorBoundary` in `AppRouter` would show a friendly “Try again” / “Reload” instead of a blank or crash screen.

7. **Production-critical freeze**  
   File header forbids changes to render flow, async blocking, and API/DB calls. This improves stability but makes it harder to add features (e.g. header, search) without a deliberate decision to relax the freeze.

### 2.4 Performance and technical UX

- **Landing is not lazy-loaded** — good for first paint; bundle cost is paid up front.
- **Background image:** Single large ImageKit asset; no responsive variants or `srcset` in the snippet.
- **No loading skeleton** — landing is static enough that this is acceptable; GPS “Detecting…” is the main loading state.
- **Scroll:** Container uses `scrollable`, `touchAction: 'pan-y pan-x'`, `overscrollBehavior: 'auto'` to avoid lock and allow natural scroll.

### 2.5 Accessibility (short)

- **Keyboard:** Buttons are focusable; modal can trap focus (Change country). City list and country grid are button-based — tab order and focus management in the modal should be verified.
- **Screen readers:** No `aria-live` for “Detecting your location” or “Location detected”; adding them would improve feedback.
- **Contrast:** White/orange on dark gray meets basic contrast; “Select your city to continue” and “OR SELECT A CITY” are smaller — worth checking contrast ratios.

---

## 3. Summary

| Aspect | Summary |
|--------|--------|
| **File structure** | Single entry: `MainLandingPage.tsx`; route in `publicRoutes.tsx` (direct import); rendered directly in `AppRouter` when `page === 'landing'` with no header. Guard and error boundary exist but are not wired for the landing route. |
| **Dependencies** | CityContext, GPS service, i18n, constants (cities/countries), PWA hook. Unused: `UniversalHeader`, `AppDrawer`, `Button`, `Play`, `Globe` in current JSX. |
| **UX strengths** | Clear country → city flow, GPS + list, persistence, mobile-first layout, PWA support. |
| **UX risks** | No header on landing, no city search, GPS errors via `alert`, landing not wrapped in error boundary, production-freeze limits evolution. |

**Recommendations (non-breaking where possible):**  
(1) Remove or use `UniversalHeader`/`AppDrawer` (or add a minimal logo/menu on landing if product wants it).  
(2) Wrap landing route in `LandingPageErrorBoundary` in `AppRouter`.  
(3) Replace GPS failure `alert()` with inline or toast message.  
(4) Add optional city search/filter for long lists.  
(5) Add `aria-live` for location detection status for screen readers.

---

## 4. Improvement suggestions (prioritized)

### ✅ Fixed: Location not highlighted on arrival

**Issue:** When a user had a stored city in `localStorage`, the landing page restored it and set `selectedCity`, so that city appeared **highlighted (orange)** as soon as the page loaded.  
**Fix applied:** In the restore-from-storage effect, `setSelectedCity(storedCityName)` was removed. Context (e.g. `confirmLocation`, coordinates) is still restored so the app knows the last location, but **no city is visually selected** until the user taps a city or “Use My GPS Location”.

### High impact

1. **City search / filter**  
   For countries with many cities (e.g. Indonesia), add a search input above the city list so users can type “Denpasar” or “Jakarta” instead of scrolling.

2. **Replace GPS failure `alert()` with inline message**  
   When GPS fails or is denied, show an inline message (e.g. below the “Use My GPS Location” button) or a toast instead of `alert()`, and optionally show “Select your city from the list below.”

3. **Wrap landing in error boundary**  
   In `AppRouter.tsx`, wrap the landing route with `LandingPageErrorBoundary` so a render error shows “Try again” / “Reload” instead of a blank screen.

### Medium impact

4. **Optional “Last time: [City]” hint**  
   If a stored city exists, show a single line above the list, e.g. “Last time you used: Denpasar” (no highlight on the row). Tapping it could pre-fill and then user taps again to proceed, or add a “Use this again” button that proceeds with stored location.

5. **Remove dead imports**  
   In `MainLandingPage.tsx`, remove or use: `UniversalHeader`, `AppDrawer`, `Button`, `Play`, `Globe` if not used in JSX.

6. **Accessibility: `aria-live` for location status**  
   Add `aria-live="polite"` to the “Detecting your location...” and “Location detected: …” messages so screen readers announce the change.

### Lower priority

7. **Minimal header on landing**  
   Consider a small logo or “Menu” so users can open terms, privacy, or language without going to home first (only if product wants discovery from landing).

8. **Responsive hero image**  
   Use `srcset` or different image sizes for the background image to improve load time on mobile.

9. **Analytics**  
   Track landing → city selected vs GPS, and drop-off before any selection, to tune copy and layout.
