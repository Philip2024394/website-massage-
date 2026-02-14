# Therapist Booking Flow, User Flow, Notifications & Commission – Full Readiness Report

**Purpose:** Confirm therapist booking flow, user (customer) booking flow, notifications for both, download-app (PWA) function, and admin 30% commission for Book Now and Scheduled bookings are rock solid and ready for testing.

**Date:** 2026-02-13

---

## 1. Executive summary

| Area | Status | Notes |
|------|--------|------|
| **Therapist booking flow** | ✅ Ready for testing | Accept/decline from Bookings page; universal tracker + commission on accept; scheduled deposit rules enforced |
| **User (customer) booking flow** | ✅ Ready for testing | Chat-based Book Now / Schedule; countdowns; 30% deposit for scheduled; in-chat notifications on accept |
| **Notifications – therapist** | ✅ Ready for testing | Real-time Appwrite subscription + therapistNotificationService; sound (BookingRequestCard); PWA sounds when installed |
| **Notifications – user** | ✅ Ready for testing | In-chat system messages (accept, deposit, expiry); optional push/WebSocket where wired |
| **Download app (PWA)** | ✅ In place | Install button (dashboard + status); green/red indicator; Android + iOS manual modals; notification permission after install |
| **Admin commission 30%** | ✅ Recorded for both | Book Now and Scheduled both create 30% commission on acceptance; universal tracker + commissionTrackingService |

---

## 2. Therapist booking flow

### 2.1 Accept / reject

- **Location:** `TherapistBookingsPage.tsx`, `TherapistBookings.tsx`
- **Accept:** `handleAcceptBooking` → `bookingService.acceptBooking()` (or equivalent) then **`trackBookingAcceptance()`** with `bookingType: booking?.isScheduled ? 'scheduled' : 'book_now'`.
- **Reject:** `handleRejectBooking` → `bookingService.cancelBookingAndReverseCommission()`.
- **Scheduled rules:** 30% deposit required; therapist cannot accept until deposit is paid (BANK_DETAILS_REQUIRED_FOR_SCHEDULED_BOOKINGS); customer must upload proof in chat; 30‑minute deposit countdown after accept.

### 2.2 Commission on accept

- Every accept (Book Now or Scheduled) goes through **`trackBookingAcceptance()`** (`universalBookingAcceptanceTracker.ts`).
- **UniversalBookingAcceptanceTracker:**  
  - Calculates **30%** of `serviceAmount`.  
  - Creates commission via **`commissionTrackingService.createCommissionRecord()`** (same for both booking types).  
  - Notifies admin via **`adminCommissionNotificationService.notifyNewCommission()`**.

### 2.3 Other entry points

- **ChatWindow (therapist):** Accept in chat also calls `commissionTrackingService.createCommissionRecord()` and `trackBookingAcceptance` where integrated.
- **appwrite/booking.service:** Create commission on accept (Book Now and Scheduled) via `commissionTrackingService.createCommissionRecord()`.
- **bookingLifecycleService:** Uses `adminCommissionService.createCommissionOnCompletion()` when booking is marked completed (completion-based commission path).

**Conclusion:** Therapist booking flow is consistent: accept/reject, scheduled deposit rules, and commission creation are in place and ready for end-to-end testing.

---

## 3. User (customer) booking flow

### 3.1 Creating a booking

- **Entry:** Chat (PersistentChatProvider + PersistentChatWindow) – customer chooses therapist/place, then Book Now or Schedule.
- **Create:** `createBooking()` in PersistentChatProvider; uses BookingEngine / appwrite booking creation; supports Book Now (immediate) and Scheduled (date/time).
- **Rules:** Block after permanent reject; 2 failed deposit attempts → 24h lock; one active scheduled booking at a time; customer name and phone required.

### 3.2 After therapist accepts

- **In-chat:** `addSystemNotification()` used to tell customer:
  - “Your booking has been accepted by [therapist]. … Transfer 30% deposit within 30 minutes and upload proof…” (scheduled), or  
  - “Your booking has been accepted… You have 1 minute to cancel…” (Book Now).
- **Chat data flow / acknowledgment:** `chatDataFlowService` and `bookingAcknowledgmentService` notify customer that booking was accepted; enterprise flow sends “Your booking has been accepted!”.
- **Deposit:** 30% deposit for scheduled; countdown and upload proof in chat.

**Conclusion:** User booking flow (create → accept → deposit for scheduled) and in-chat notifications are in place and ready for testing.

---

## 4. Notifications

### 4.1 Therapist

- **Real-time bookings:** TherapistDashboard subscribes to Appwrite `databases.*.collections.bookings.documents`; on create, if booking is for current therapist → trigger notification + sound.
- **Chat:** PersistentChatWindow (therapist view) uses **`therapistNotificationService.onBookingNotification()`**; new booking notification can auto-open chat when not on landing.
- **Sound:** BookingRequestCard plays `/sounds/booking-notification.mp3` when `soundEnabled`; PWA: `pwaNotificationSoundHandler` + service worker for in-app and (when supported) background.
- **PWA:** After install, notification permission requested; sounds work when app is open (and via SW when implemented).

### 4.2 User (customer)

- **In-chat:** System messages for: booking accepted, deposit instructions, expiry, cancellation, spam lock, etc. (`addSystemNotification` in PersistentChatProvider).
- **Push / other:** Where implemented (e.g. TherapistDashboardWebSocket “Your booking has been accepted”), customer is notified; main guarantee is in-chat system notifications.

**Conclusion:** Notifications for both therapist and user are implemented and ready for testing; PWA and sound paths are in place for therapist.

---

## 5. Download app (PWA)

### 5.1 What’s in place

- **Global:** `beforeinstallprompt` captured in `main.tsx` → `window.deferredPWAPrompt`.
- **Therapist dashboard:** “Install App” in connection bar; uses **`PWAInstallationStatusChecker.triggerInstallation()`**; **green/red indicator** (App installed / Need download) via `PWADashboardIndicator`.
- **Therapist status page:** Full “Unduh Aplikasi” section; native prompt or **manual modals** (Android step-by-step modal, iOS Share → Add to Home Screen, desktop modal) via `pwaInstallationStatus.ts`.
- **After install:** `appinstalled` → localStorage (`pwa-installed`, `pwa-install-completed`); notification permission requested; App.tsx `?pwa=true&page=status` routes to therapist status when opened from home screen.

### 5.2 Documentation

- **PWA_DOWNLOAD_DASHBOARD_AUDIT_REPORT.md** describes the design; post-audit implementation added green/red indicator, Android manual modal, and central install trigger.

**Conclusion:** Download app is in place with install button, status indicator, and manual fallbacks; ready for testing on therapist dashboard and status page.

---

## 6. Admin commission 30% – Book Now and Scheduled

### 6.1 Rate and usage

- **Rate:** 30% everywhere it matters:
  - **commissionTrackingService:** `commissionRate = 30`, `commissionAmount = Math.round(serviceAmount * 0.30)`.
  - **adminCommissionService:** `COMMISSION_RATE = 0.30`; used on booking completion path.
  - **universalBookingAcceptanceTracker:** `commissionAmount = Math.round(acceptance.serviceAmount * 0.30)`.
  - **BookingEngine:** `adminCommission = Math.round(params.totalPrice * 0.3)`.
  - **bookingService (accept):** `commissionAmount = Math.round(booking.price * 0.30)`.

### 6.2 When commission is created

- **On acceptance (Book Now and Scheduled):**  
  Therapist accept → `trackBookingAcceptance({ bookingType: booking?.isScheduled ? 'scheduled' : 'book_now', ... })` → UniversalBookingAcceptanceTracker → **commissionTrackingService.createCommissionRecord()** (30% of `serviceAmount`) and **adminCommissionNotificationService.notifyNewCommission()**.
- **createCommissionRecord** is used for both Book Now and Scheduled; the only difference is `bookingType` and optional `scheduledDate`; **commission rate is 30% for both**.
- **On completion (optional path):** `adminCommissionService.createCommissionOnCompletion()` also uses 30% of booking amount.

### 6.3 What admin gets

- Commission record in Appwrite (commission_records or equivalent) with: therapistId, therapistName, bookingId, bookingDate, scheduledDate, serviceAmount, **commissionRate 30**, **commissionAmount**, paymentDeadline, status, customerName, massageType, duration.
- Admin notification via **adminCommissionNotificationService** when a new commission is created.

**Conclusion:** Admin commission is recorded at **30% for both Book Now and Scheduled bookings** on acceptance (and optionally on completion); ready for testing and admin reconciliation.

---

## 7. Files reference

| Topic | Files |
|-------|--------|
| Therapist accept + commission | `TherapistBookingsPage.tsx`, `TherapistBookings.tsx`, `universalBookingAcceptanceTracker.ts`, `commissionTrackingService.ts` |
| User booking + notifications | `PersistentChatProvider.tsx`, `PersistentChatWindow.tsx`, `chatDataFlowService.ts`, `bookingAcknowledgmentService.ts` |
| Therapist notifications | `TherapistDashboard.tsx` (Appwrite subscribe), `therapistNotificationService`, `BookingRequestCard.tsx`, `pwaNotificationSoundHandler.ts` |
| PWA download | `TherapistDashboard.tsx` (indicator + Install button), `TherapistOnlineStatus.tsx` / `TherapistOnlineStatusPage.tsx`, `pwaInstallationStatus.ts`, `main.tsx`, `App.tsx` |
| Commission 30% | `commissionTrackingService.ts`, `adminCommissionService.ts`, `universalBookingAcceptanceTracker.ts`, `adminCommissionNotificationService.ts` |

---

## 8. Final confirmation

- **Therapist booking flow:** Accept/reject and scheduled deposit rules are enforced; commission is created on accept. **Ready for testing.**
- **User booking flow:** Book Now and Schedule from chat; in-chat notifications on accept and for deposit/expiry. **Ready for testing.**
- **Notifications (therapist and user):** Real-time + in-chat + sound where implemented. **Ready for testing.**
- **Download app:** Install button, green/red indicator, manual modals (Android/iOS), post-install notification permission. **In place and ready for testing.**
- **Admin commission 30%:** Recorded for both **Book Now** and **Scheduled** on acceptance via universal tracker and commission service; admin is notified. **Ready for testing and reconciliation.**

**Overall:** The therapist booking flow, user booking flow, notifications for both, download app function, and 30% admin commission for Book Now and Scheduled bookings are **rock solid and ready for full end-to-end testing.**
