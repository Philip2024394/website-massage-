# Full project scan – build, UI, and errors

**Date:** 2026-02-26  
**Scope:** Build, type-check, lint, and obsolete files. No app-breaking changes were made.

---

## 1. Build status

| Command           | Result   | Notes |
|-------------------|----------|--------|
| `npm run build`   | **PASS** | Exit code 0. Production build completes. |

### Build warnings (non-blocking)

- **Circular chunks:**  
  - `route-booking` ↔ `route-therapist`  
  - `route-therapist` ↔ `route-portals`  
  Consider adjusting `vite.config` manual chunk logic to break these if you want smaller, clearer chunks.

- **Mixed dynamic/static imports:**  
  Several modules are both dynamically and statically imported, so Vite may not split them into separate chunks. Affected modules include:
  - `src/lib/appwrite.ts`
  - `src/translations/index.ts`
  - `src/lib/appwrite.config.ts`
  - `src/lib/services/bookingLifecycleService.ts`
  - `src/lib/services/bookingCalendarService.ts`
  - `src/lib/services/adminCommissionService.ts`
  - `src/lib/services/availabilityEnforcementService.ts`
  - `src/lib/services/commissionTrackingService.ts`
  - `src/lib/services/serverEnforcedChatService.ts`
  - `src/data/indonesianCities.ts`
  - `src/lib/appwrite/services/messaging.service.ts`
  - `src/lib/appwriteService.ts`
  - `src/lib/chatService.ts`
  - `src/lib/bookingService.ts`
  - `src/lib/nearbyProvidersService.ts`
  - `src/lib/sessionCache.ts`
  - `src/services/analyticsService.ts`
  - `src/features/shared-profiles/SharedTherapistProfile.tsx`

These do not prevent the app from building or running.

---

## 2. TypeScript (type-check)

| Command            | Result   | Notes |
|--------------------|----------|--------|
| `npm run type-check` | **FAIL** | Exit code 2. Many TS errors. |

### Error summary (by area)

- **apps/facial-dashboard:** `LanguageContext` value, `FacialPlaceDashboardPageProps` props.
- **apps/place-dashboard:** `PlaceDashboardPageProps` (`onBack` etc.), `lucide-react` (`ArrowRight`), `Place` type (`membershipPlan`, `plan`), missing icons (`UserSolidIcon`, `DocumentTextIcon`, `PhoneIcon`, `ClockIcon`, `MapPinIcon`, `CurrencyRpIcon`), `ShowerHead`, `Quote`.
- **src/App.tsx:** `setPage` missing from hook return, `Language` vs `"en"|"id"|"gb"`, CustomEvent/EventListener cast, `agentShareAnalyticsService` not found, `Language` not found, `User.type` / `isTherapist`, `LoggedInProvider` props, analytics callback type, etc.
- **src/AppRouter.tsx:** `Page` type mismatches (`"place-profile"`, string vs Page), `User.type` / `User.$id`, `showToast` missing, Place type casts, `"agent"` / `"agent-portal"` not in Page, fallthrough case.
- **src/apps/admin:** `lucide-react` (`Activity`), `healthAPIService.ts` – cannot find `../../../../services/chatSessionService` or `../../../../services/appwriteHealthMonitor` (path likely wrong; files exist under `src/services/`).
- **src/booking/useBookingSubmit.ts:** `duration` not in type, `result` not found.
- **src/chat:** `ChatMessage.therapistId`, `FloatingChatWindow` state shape and `gender`, `"booking-in-progress"` vs status type, `ChatRoom.profilePicture`, missing `chatAvatars` module, `lucide-react` (`Baby`).
- **src/components/accessibility:** Many `lucide-react` exports missing (e.g. `Volume`, `Brush`, `Sun`, `Moon`, `Type`, `Palette`, `Pause`, `RotateCcw`, `ZapOff`, `Sliders`, `Computer`, `Phone`, `Hash`, `ArrowRight`, `ArrowDown`, `ArrowUp`, `Cursor`, `Focus`, `List`, `Map`, `Command`, `Layers`, `Activity`, `Trophy`, `VolumeOff`, `Headphones`, `Speaker`, `Mic`, `Text`, `Link`, `Table`, `Form`), duplicate identifiers, `Contrast` / `BarChart3` / `Volume2` / `Keyboard` / `Palette` not found, props mismatches, `VisualTheme` export conflict.
- **src/pages/therapist:** `ChevronUp`, `ArrowRight`, `Wrench`, event handler types, `TherapistOnlineStatusPage` `offline` in status map.
- **src/pages/TopTherapistsPage.tsx:** language callback type.
- **src/utils/therapistMatching.ts:** type conversion to `MatchedTherapist<TherapistAny>`.
- **src/utils/urlMapper.ts:** `'massagePlace'` does not exist on `Partial<Record<Page, string>>`.

**Total:** 1300+ lines of type-check output; errors across main app, apps (facial/place/admin), chat, booking, and accessibility.

**Impact:** Build still succeeds because `tsc` is not run as part of the default `vite build`. Running `npm run type-check` or a build that runs `tsc` (e.g. `build:npm`) will fail until these are fixed.

---

## 3. ESLint

| Command   | Result   | Notes |
|-----------|----------|--------|
| `npm run lint` | **FAIL** | Exit code 2. |

**Error:**  
`Cannot find package 'eslint-plugin-react' imported from D:\website-massage\website-massage-\eslint.config.js`

**Cause:** `eslint.config.js` uses `eslint-plugin-react`, but it is not installed (not listed in `package.json` devDependencies).

**Fix (optional):**  
`npm install -D eslint-plugin-react`  
(or `pnpm add -D eslint-plugin-react` if using pnpm).  
No code or config changes were made to avoid breaking the app.

---

## 4. Deleted / obsolete files

**Folder created:** `deleted-files/`

**Moved into `deleted-files/` (originals removed):**

| Original path | New path |
|---------------|----------|
| `PRICE_LAYOUT_TROUBLESHOOTING.md` (root) | `deleted-files/PRICE_LAYOUT_TROUBLESHOOTING.md` |
| `docs/PRICE_CONTAINER_LAYOUT_ANALYSIS.md` | `deleted-files/PRICE_CONTAINER_LAYOUT_ANALYSIS.md` |

**Reason:** These are price-container troubleshooting/analysis docs that are no longer needed for the app or build. They are kept in `deleted-files/` for reference only.

**Not moved:**  
No source files, configs, or other docs were moved or deleted. Only the two markdown files above were relocated so the project root and `docs/` stay clean without risking runtime or build breakage.

---

## 5. What does *not* block build or UI

- **Default production build:** Works. `npm run build` (Vite only) succeeds and the app can be deployed.
- **Dev server:** Works. `npm run dev` runs and serves the app.
- **UI updates:** Code changes are picked up by Vite; no evidence of a single “file preventing UI update” beyond cache (browser/Vite). If the UI still doesn’t update, try: restart dev server, clear `.vite` cache, hard refresh (Ctrl+Shift+R), or run `npm run clean` then `npm run dev`.

---

## 6. Recommendations (no changes applied)

1. **TypeScript:** Fix type errors incrementally (e.g. by route or app). Start with `src/App.tsx` and `AppRouter.tsx`, then `apps/place-dashboard` and `apps/facial-dashboard`, then chat/booking/accessibility. Re-run `npm run type-check` after each batch.
2. **Lint:** Install `eslint-plugin-react` so `npm run lint` runs; then fix any new lint errors.
3. **Admin health API:** In `src/apps/admin/services/healthAPIService.ts`, correct import paths for `chatSessionService` and `appwriteHealthMonitor` (e.g. `../../../services/...` from `src/apps/admin/services/` to `src/services/`).
4. **lucide-react:** Many errors are “Module 'lucide-react' has no exported member 'X'”. Either upgrade `lucide-react` to a version that exports these icons or replace with the correct icon names for your version.
5. **Chunks:** Optionally adjust Vite manual chunks to remove circular chunk warnings and clarify bundle boundaries.

---

## 7. Summary

| Check        | Status  | Blocks build? | Blocks UI? |
|-------------|---------|----------------|------------|
| `npm run build` | ✅ Pass | No            | No         |
| `npm run type-check` | ❌ Fail | Only if build runs tsc | No |
| `npm run lint` | ❌ Fail | No            | No         |
| Obsolete docs | ✅ Moved to `deleted-files/` | No | No         |

**Conclusion:** The project builds and runs. Type-check and lint fail and should be fixed for quality and CI; they do not currently block the default build or UI updates. No app code was changed; only two obsolete markdown files were moved to `deleted-files/`.
