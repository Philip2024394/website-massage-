# Preview Screen Updates Not Displaying – Diagnostic Report

**Generated:** February 10, 2026  
**Scope:** Therapist/Place preview screen (`/?previewTherapistId=XXX`) and dev server preview

---

## 1. Preview Screen Flow Overview

When a therapist clicks **Preview** from the dashboard:

1. Opens new tab: `/?previewTherapistId={therapistId}`
2. `useHomePageAdmin` reads `window.location.search` → `previewTherapistId`
3. `useHomePageLocation` finds therapist: `therapists.find(t => t.$id === previewTherapistId || t.id === previewTherapistId)`
4. Renders that single therapist in the home page list

---

## 2. Likely Causes Why Updates Don’t Show

### A. **Data Fetch Timing – Single Load**
- **Location:** `useAllHooks.ts` – `fetchPublicData()` runs once on app init (after ~300ms)
- **Issue:** Therapists data is loaded only at startup. A new preview tab will fetch fresh data, but it can still be outdated if:
  - Appwrite returns cached data
  - The new tab reuses cached app shell/state

### B. **Hash Routing vs Query Params**
- **Location:** `useHomePageAdmin.ts` line 37: `new URLSearchParams(window.location.search)`
- **Issue:** If the app redirects to `#/home` or another hash route, `window.location.search` can sometimes be dropped or not parsed depending on navigation logic
- **Check:** Ensure the preview URL keeps `?previewTherapistId=XXX` when the SPA loads (e.g. `http://localhost:3000/?previewTherapistId=abc123#/` or `#/home`)

### C. **Admin/Preview Access (`hasAdminPrivileges`)**
- **Location:** `useHomePageAdmin.ts` lines 42–56
- **Issue:** `previewTherapistId` is only applied when `hasAdminPrivileges === true`
- **Impact:** If the auth check is slow or fails, the effect clears `previewTherapistId` and preview mode is never activated

### D. **Service Worker / PWA Caching**
- **Location:** `vite.config.ts` – VitePWA with Workbox
- **Issue:**
  - `CacheFirst` for ImageKit URLs (30 days)
  - `globPatterns` caching for JS/CSS/images
  - Old app bundle can be served, making it look like “code” changes aren’t updating
- **Impact:** Updates to the app may not appear until the SW updates and cache is invalidated

### E. **Browser Cache**
- **Issue:** Cached HTML, JS, and assets can make changes appear missing
- **Fix:** Hard refresh (Ctrl+Shift+R) or DevTools → Disable cache while devtools is open

### F. **Appwrite Data Latency**
- **Issue:** Profile changes in the dashboard are written to Appwrite, but:
  - `fetchPublicData()` might not refetch immediately
  - Appwrite CDN or edge cache might delay propagation
- **Impact:** Preview tab may show stale therapist data even with a fresh load

### G. **Therapist Not in `therapists` Array**
- **Location:** `useHomePageLocation.ts` line 137:  
  `const previewTherapist = therapists.find(t => t.$id === previewTherapistId || t.id === previewTherapistId)`
- **Issue:** If `fetchPublicData()` filters or limits results (by location, status, etc.), the previewed therapist might not be in `therapists`
- **Impact:** Preview mode finds nothing and may show an empty or wrong state

---

## 3. Quick Fixes to Try

| Issue | Action |
|-------|--------|
| Service Worker cache | DevTools → Application → Service Workers → Unregister, then reload |
| Browser cache | Hard refresh (Ctrl+Shift+R) |
| Stale therapist data | Refresh the page or trigger `refreshData()` after dashboard edits |
| Preview not activating | Ensure you’re logged in as therapist/admin so `hasAdminPrivileges` is true |
| Query params lost | Verify URL in preview tab stays `/?previewTherapistId=XXX` |

---

## 4. Dev Server Specific (localhost)

If code changes don’t appear in the dev preview:

1. **HMR:** Confirm Vite HMR is working (no console errors)
2. **Service Worker in dev:** PWA `devOptions.enabled: true` – the SW can still cache; try disabling or unregistering it in dev
3. **Multiple tabs:** Ensure you’re looking at the tab that hot-reloaded, not an older one

---

## 5. Recommended Code/Config Checks

1. **`useHomePageAdmin`:** Add `window.location.search` to the `useEffect` dependency array so it reacts to URL changes.
2. **Preview data freshness:** When opening preview, consider passing a cache-busting query (e.g. `&_t=Date.now()`) or triggering a dedicated therapist fetch for that ID.
3. **Service Worker in dev:** Consider `devOptions.enabled: false` for local development to reduce SW-related caching issues.
4. **`refreshData` exposure:** Expose `refreshData` (or equivalent) on the home page so users can force a data refresh before/after using preview.

---

## 6. Files Involved

| File | Role |
|------|------|
| `src/hooks/useHomePageAdmin.ts` | Reads `previewTherapistId` from URL |
| `src/hooks/useHomePageLocation.ts` | Finds therapist for preview mode |
| `src/hooks/useAllHooks.ts` | Loads therapists via `fetchPublicData()` |
| `vite.config.ts` | PWA / Service Worker config |
| `src/pages/therapist/TherapistDashboard.tsx` | Opens preview URL |

---

## 7. Suggested Diagnostic Command

Run this in the browser console on the preview tab:

```javascript
console.log('Preview diagnostics:', {
  search: window.location.search,
  previewId: new URLSearchParams(window.location.search).get('previewTherapistId'),
  hash: window.location.hash,
  href: window.location.href
});
```

Check that `previewId` is set and that `href` still contains `previewTherapistId`.
