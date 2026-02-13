# Side drawer links audit (home page)

**Date:** 2026-02-10  
**Scope:** `AppDrawerClean.tsx` (side drawer on MainHomePage, HomePage, ContactUsPage, IndastreetPartnersPage) and `AppRouter.tsx`.

## Summary

- **Broken links fixed:** `simpleSignup` (camelCase used by `setPage` elsewhere) and `agentPortal` (drawer “Admin” / agent portal had no route).
- **Protection added:** Drawer allowlist `DRAWER_FALLBACK_PAGES` in `AppDrawerClean.tsx`; unknown fallback pages redirect to `home` instead of causing a 404.

## Drawer navigation

- The drawer uses `handleItemClick(callback?, fallbackPage?)`. If a callback is provided it runs that; otherwise it calls `onNavigate(fallbackPage)`.
- Callbacks (e.g. `onMassageJobsClick`, `onAdminPortalClick`, `onAgentPortalClick`) are passed from the home page and typically call `state.setPage(...)`.

## Fixes applied

### 1. AppRouter.tsx

- **simpleSignup:** Added `case 'simpleSignup':` alongside `case 'simple-signup':` so both render the same simple signup route (used by `setPage('simpleSignup')` elsewhere).
- **agentPortal:** Added `case 'agentPortal':` and `case 'agent-portal':` that render the same as `admin` (admin dashboard). There is no separate AgentAuthPage; agent portal and admin share the same destination.

### 2. AppDrawerClean.tsx

- **Allowlist:** Introduced `DRAWER_FALLBACK_PAGES` (set of allowed fallback page ids). When navigating by fallback, the drawer only calls `onNavigate(page)` if `page` is in this set; otherwise it navigates to `home` and logs a warning.
- **Effect:** Prevents typos and future drawer links from sending users to an unknown route; they are sent to home instead.

## Drawer items and targets (reference)

| Drawer item        | Navigation                         | Status   |
|--------------------|------------------------------------|----------|
| Create Account     | `createAccount`                    | OK       |
| Sign In            | callback or `login`                | OK       |
| Indastreet Partners| `indastreet-partners`              | OK       |
| Partnership Application | `partnership-application`     | OK       |
| Massage Jobs       | callback or `massage-jobs`         | OK       |
| How It Works       | `how-it-works`                     | OK       |
| About Us           | `about`                            | OK       |
| Company Profile    | `company`                          | OK       |
| Contact            | `contact`                          | OK       |
| Hotels & Villas    | `hotels-and-villas`                | OK       |
| Blog               | `blog`                             | OK       |
| Massage in Bali    | `massage-bali`                     | OK       |
| Massage Directory  | `massage-types`                    | OK       |
| Facial Directory   | `facial-types`                     | OK       |
| Balinese Massage   | `balinese-massage`                 | OK       |
| Deep Tissue Massage| `deep-tissue-massage`              | OK       |
| FAQ                | `faq`                              | OK       |
| Verified Pro Badge | `verifiedProBadge`                 | OK       |
| Join as Provider (simple signup) | `simple-signup` / `simpleSignup` | **Fixed** |
| Website Management | `website-management`               | OK       |
| Admin              | callback or `admin` / `agentPortal`| **Fixed** |

## Central config (implemented)

- **`src/config/drawerConfig.ts`** is the single source of truth for drawer navigation:
  - `DRAWER_PAGE_IDS` – typed list of allowed page ids (`satisfies readonly Page[]` so invalid ids are a compile error).
  - `getSafeDrawerPage(fallbackPage)` – returns a safe page id (uses allowlist + alias normalization; unknown pages → `'home'`).
- The drawer calls `getSafeDrawerPage(fallbackPage)` before `onNavigate`, so it stays safe from broken links and alias mismatches.

## Maintaining the allowlist

When adding a **new drawer link** that uses a fallback page:

1. Add the page id to `DRAWER_PAGE_IDS` in **`src/config/drawerConfig.ts`** (and to `Page` in `src/types/pageTypes.ts` if it’s a new route).
2. Ensure **`AppRouter.tsx`** has a matching `case` for that page (and any alias you need, e.g. camelCase vs kebab-case).
3. If the app uses multiple names for the same route (e.g. `simpleSignup` and `simple-signup`), add an entry in the `ALIASES` map in `drawerConfig.ts` so both resolve to the same canonical page.
4. Optionally add the page to `pageToUrl` in `src/utils/urlMapper.ts` if you use URL mapping.

This keeps the drawer and router in sync and avoids broken links.

---

## Suggestions for even safer drawer links

1. **Keep using the central config** – All new drawer fallback pages should be added only in `drawerConfig.ts`; the drawer already uses `getSafeDrawerPage()` from there.
2. **CI / script check** – Optional: add a small script or ESLint rule that:
   - Reads `DRAWER_PAGE_IDS` (or parses `drawerConfig.ts`),
   - Greps `AppRouter.tsx` for `case '...'`,
   - Fails if any drawer page id has no matching router case.
3. **Router fallback for unknown pages** – Today the router’s `default` case shows “Route Not Found” with a “Go to Home” button. You could optionally redirect to home automatically (e.g. in a `useEffect`) so any future broken `setPage(...)` elsewhere in the app sends users to home instead of a dead screen.
4. **Data-driven drawer (future)** – The drawer could be refactored to map over a single array of items (each with `id`, `labelKey`, `icon`), so the list of buttons and the allowlist are derived from the same data and you can’t add a button without adding its id to the config.
5. **Type `onNavigate` as `(page: Page) => void`** – If the app’s navigation handler is typed to accept only `Page`, then invalid page strings become type errors at call sites (e.g. in `App.tsx` and the drawer).
