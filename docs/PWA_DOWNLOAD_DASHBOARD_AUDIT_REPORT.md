# PWA Download to Home Screen – Full Audit Report

**Scope:** Therapist dashboard, Places dashboard (where applicable), download button, fallbacks, status indicator, notifications/sounds, and post-install flow (divert to status/availability).

**Date:** 2026-02-13

---

## 1. Executive summary

| Area | Status | Notes |
|------|--------|------|
| Therapist dashboard – Install button | ⚠️ Partial | Small “Install App” in connection bar; uses `deferredPWAPrompt`; fallback is toast only |
| Therapist status page – Download section | ✅ Good | Full section with button, iOS modal, manual instructions (toast), `appinstalled` + notification request |
| **Green/red download indicator** | ❌ Missing | No dedicated “downloaded = green / need download = red” on dashboard |
| **Rock-solid manual fallback** | ⚠️ Partial | iOS: modal in status page + `PWAInstallIOSModal`; Android: toast + `pwaInstallationStatus` modal; no single, always-visible manual panel when button fails |
| Notifications + sounds after install | ✅ Good | `appinstalled` → localStorage + notification permission; `pwaNotificationSoundHandler` + SW; sounds when app open |
| Divert to status/availability after install | ✅ Good | App.tsx: `?pwa=true&page=status` → therapist-status; post-login redirect from sessionStorage |
| Places dashboard PWA | ❌ Not in main repo | Place dashboard = `apps/place-dashboard` (separate app); no PWA install UI in main codebase |

---

## 2. Current implementation (therapist)

### 2.1 Therapist dashboard (Profile Upload / Edit Profil)

- **Location:** `TherapistDashboard.tsx` – “Real-Time Connection” bar.
- **Install button:** Uses `(window as any).deferredPWAPrompt`; if missing, shows toast: “Use browser menu → Add to Home Screen” or “Install App”.
- **Gaps:**
  - No **green/red PWA status indicator** (green = installed, red = need download).
  - No **manual-install panel/modal** when prompt is unavailable; only a short toast.
  - `BeforeInstallPromptEvent` check is redundant with `deferredPWAPrompt`; no Android-specific step-by-step modal.

### 2.2 Therapist status page (Online Status / Availability)

- **Location:** `TherapistOnlineStatusPage.tsx` / `TherapistOnlineStatus.tsx`.
- **Download section:** “Unduh Aplikasi” with:
  - Native prompt when `deferredPrompt` exists.
  - **iOS:** Inline modal with Share → “Add to Home Screen” → “Add”.
  - **Android/other:** Toast with browser-specific instructions (Chrome, Edge, Firefox, Safari).
- **Install success:** `appinstalled` → `pwa-installed` / `pwa-install-completed`; optional notification permission request.
- **Gaps:**
  - Manual fallback is **toast-only** (dismissible, no persistent “Manual install” panel).
  - No **explicit “Go to Status”** CTA after install (user can navigate via drawer; URL `?pwa=true&page=status` already routes to status when opened from home screen).

### 2.3 Global PWA capture and routing

- **main.tsx:** `beforeinstallprompt` → `e.preventDefault()`; store in `window.deferredPWAPrompt`.
- **App.tsx:** If `?pwa=true&page=status` or `isPWA()` and `page=status` → therapist-status (or sign-in + `pwa-redirect-after-login`).
- **PWAStateManager:** Preserves chat state around install; listens for install events.
- **UniversalPWAInstall / PWAInstallationStatusChecker:** Central status, `triggerInstallation()`, iOS modal, instructions by platform.

### 2.4 Notifications and sounds

- **After install:** TherapistOnlineStatus(Page) requests `Notification.requestPermission()` on `appinstalled`; success notification with body text.
- **Sounds:** `pwaNotificationSoundHandler` (service worker messages); `notificationSoundSettings`; `/sounds/booking-notification.mp3` etc.; BookingRequestCard plays sound when `soundEnabled`.
- **When app is open:** In-app handler plays MP3; when closed, service worker can show system notification (depends on sw.js).

---

## 3. Places dashboard

- **Place dashboard** is rendered from **`apps/place-dashboard`** (separate app, `placeRoutes.dashboard.component` = PlaceApp).
- **Main repo** has no place-specific PWA install UI; therapist-focused PWA logic is in therapist dashboard and status pages.
- **Recommendation:** Either implement PWA install + status indicator in `place-dashboard` app, or expose a shared PWA install component and use it in both therapist and place dashboards.

---

## 4. Gaps and recommendations

### 4.1 Green / red PWA download status indicator (critical)

- **Gap:** No single, clear “Downloaded = green” / “Need download = red” on therapist (or place) dashboard.
- **Recommendation:**
  - Add a **PWA status badge** in the therapist dashboard header (or connection bar):
    - **Green:** `display-mode: standalone` or `pwa-install-completed` / `pwa-installed` in localStorage → “App installed”.
    - **Red (or orange):** Not installed → “Download app for notifications”.
  - Reuse `PWAInstallationStatusChecker.checkStatus()` (or equivalent) and update on `appinstalled` / `beforeinstallprompt` so the indicator stays in sync.

### 4.2 Rock-solid manual fallback for Android and Apple

- **Gap:** When `deferredPWAPrompt` is missing or user dismisses prompt:
  - **Android:** Only toast with instructions (no persistent modal/panel).
  - **iOS:** Modal exists on status page and in `PWAInstallIOSModal`; good.
- **Recommendation:**
  - **Single “Manual install” flow** used from both dashboard and status:
    - If native prompt fails or is unavailable → open a **dedicated modal (or bottom sheet on mobile)** with:
      - **Android:** Step-by-step (e.g. Chrome: “Menu (⋮) → Install app” or “Add to Home screen”; address bar install icon).
      - **iOS:** Share → “Add to Home Screen” → “Add” (reuse existing copy).
    - Use **platform detection** (userAgent / `PWAInstallationStatusChecker.platform`) to show the right steps.
  - **Avoid `alert()`** for manual instructions; use the same modal/panel so behaviour is consistent and “rock solid”.

### 4.3 Button failure path

- **Current:** Dashboard button: if no `deferredPWAPrompt`, toast only. Status page: try prompt → then iOS modal or long toast.
- **Recommendation:** On “Install App” / “Download App” click:
  1. Try `deferredPWAPrompt.prompt()` if present.
  2. If not present or user dismisses → **always** open the manual-install modal (Android + iOS steps), not only a toast.

### 4.4 After download: divert to status/availability

- **Current:** Opening the PWA with `?pwa=true&page=status` (or from home screen with same intent) routes to therapist-status; post-login redirect works.
- **Recommendation:** After a successful install (e.g. in `appinstalled` handler), optionally:
  - Show a short message: “App installed. Open it from your home screen to go straight to your status/availability.”
  - Or set a one-time flag and, when app is next opened in standalone mode, auto-navigate to therapist-status once. (Already partially there via URL params.)

### 4.5 Notifications and sounds “once downloaded”

- **Current:** Notification permission requested after install; sounds work when app is open via `pwaNotificationSoundHandler` and in-app audio.
- **Recommendation:** Document that “notifications and sounds are active once the app is downloaded to the phone and permission is granted”; ensure one-time “Enable notifications?” prompt is clear and not skipped when coming from install flow.

---

## 5. File reference

| Purpose | File(s) |
|--------|--------|
| Therapist dashboard install button | `src/pages/therapist/TherapistDashboard.tsx` (connection bar) |
| Therapist status download section | `src/pages/therapist/TherapistOnlineStatusPage.tsx`, `TherapistOnlineStatus.tsx` |
| Global prompt capture | `src/main.tsx` |
| PWA routing (status) | `src/App.tsx` |
| Status check + manual instructions | `src/utils/pwaInstallationStatus.ts` |
| Universal install component | `src/components/UniversalPWAInstall.tsx` |
| iOS modal | `src/components/PWAInstallIOSModal.tsx` |
| Notification sounds (PWA) | `src/services/pwaNotificationSoundHandler.ts`, `src/lib/notificationSound.ts` |
| Place dashboard | `src/router/routes/placeRoutes.tsx` → `apps/place-dashboard` |

---

## 6. Conclusion

- **Therapist flow:** Install button exists on dashboard and status; status page has better fallback (iOS modal + toasts). Notifications and sounds are wired for “once downloaded.”
- **Missing for “rock solid / state of the art”:**
  1. **Green/red PWA download indicator** on therapist (and ideally place) dashboard.
  2. **Unified manual fallback:** Always show a **modal (or panel)** with Android + iOS steps when the install button fails or prompt is unavailable; no reliance on toast-only.
  3. **Places dashboard:** PWA install and indicator need to be implemented in the place-dashboard app (or via a shared component).

Implementing the indicator and the unified manual-install modal in the therapist dashboard and status page will make the download path rock solid and clear for therapists; the same pattern can be reused for places when their dashboard is updated.

---

## 7. Implementation summary (post-audit)

The following was implemented to meet the “rock solid” and “state of the art” requirements:

| Item | Implementation |
|------|----------------|
| **Green/red PWA indicator** | `PWADashboardIndicator` in therapist dashboard connection bar: **green** “App installed” when PWA is installed (standalone or localStorage), **red** “Need download” when not. Listens to `appinstalled`, `beforeinstallprompt`, and `display-mode: standalone`. |
| **Rock-solid manual fallback** | **Android:** `showAndroidInstallationModal()` in `pwaInstallationStatus.ts` – DOM modal with step-by-step (Chrome menu → “Install app” / “Add to Home screen”, Samsung Internet, address bar). **Desktop:** `showDesktopInstallationModal()` for non-mobile. **iOS:** existing `showIOSInstallationModal()` unchanged. No `alert()` for manual install. |
| **Install method for Android** | `installMethod` set to `'manual'` when `isAndroid && canInstall` so Android gets the manual modal path when there is no native prompt. |
| **Dashboard Install button** | Therapist dashboard “Install App” now calls `PWAInstallationStatusChecker.triggerInstallation()` so native prompt is tried first, then the appropriate manual modal (Android/iOS/desktop) is shown when the button “fails” or prompt is unavailable. |
| **Status page fallback** | Therapist status page “Unduh Aplikasi” fallback (when no native prompt) now calls `PWAInstallationStatusChecker.triggerInstallation()` so the same Android/iOS/desktop modals are shown instead of a long toast. |
| **Places dashboard** | No change in main repo; place dashboard lives in `apps/place-dashboard`. Recommendation: reuse the same PWA status checker and manual modals (or shared component) when adding PWA install to the place app. |
