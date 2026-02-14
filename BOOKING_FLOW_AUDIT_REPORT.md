# Booking Flow Audit Report

**Date:** February 10, 2026  
**Scope:** User booking flow, Therapist booking flow, Scheduled bookings, Notifications, UX

---

## Executive Summary

The booking system has a **robust core** (atomic transactions, lifecycle management, Appwrite persistence) but several **notification and integration gaps** that affect user and therapist experience. The main flows work; reliability of notifications and some edge cases need attention.

---

## 1. User Booking Flow

### ✅ Fully Working

| Step | Status | Details |
|------|--------|---------|
| Open therapist/place profile | ✅ | TherapistCard, TherapistProfileBase, SharedTherapistProfile, PlaceCard, MassagePlaceProfilePage |
| Click "Book Now" | ✅ | TherapistCard → `openPriceChat()` / `handleBookingClick()`, HeroSection, PlacePricing |
| Select instant vs scheduled | ✅ | PersistentChatWindow booking form, ScheduleBookingPopup, BookingMenuSlider |
| Complete booking | ✅ | `executeBookingTransaction()` – atomic PREPARE → PERSIST → CONFIRM → COMMIT |
| Record in system | ✅ | Appwrite `bookings` collection via `bookingTransaction.service.ts`, `bookingLifecycleService` |

### ⚠️ Issues / Gaps

| Issue | Severity | Details |
|-------|----------|---------|
| **User real-time status updates** | Medium | When therapist accepts/declines from dashboard, customer may not see status change immediately. Provider subscribes to chat messages, not booking documents. No explicit Appwrite Realtime subscription for booking status changes. |
| **SMS notifications** | High | Not implemented. `transactionalEmailService` has TODO; `bookingAntiSpamService` has mock SMS; no production SMS (e.g. Twilio/SNS). |
| **Email notifications** | High | `TransactionalEmailService.sendBookingNotification()` has TODO – no actual integration with SendGrid/Appwrite. |
| **Push notifications (user)** | Medium | `pushNotifications.ts` stores subscription in `localStorage` only; not sent to backend, so server cannot send push. `saveSubscriptionToServer()` does not persist to Appwrite. |

---

## 2. Therapist Booking Flow

### ✅ Fully Working

| Step | Status | Details |
|------|--------|---------|
| Accept/decline bookings | ✅ | `acceptBooking`, `rejectBooking` in PersistentChatProvider; `bookingLifecycleService`, `therapistNotificationService` |
| See booked schedules | ✅ | TherapistBookingsPage, TherapistSchedule, filter by received/scheduled/completed |
| In-app notification UI | ✅ | TherapistDashboardWebSocket, PersistentChatWindow (in-app Accept/Decline), TherapistBookingAcceptPopup |
| Dashboard access | ✅ | TherapistLayout, TherapistDashboard, routing via AppRouter |
| Download app button | ✅ | TherapistOnlineStatus, TherapistOnlineStatusPage, PWA install flow, `handleSimpleDownload` |

### ⚠️ Issues / Gaps

| Issue | Severity | Details |
|-------|----------|---------|
| **WebSocket source of truth** | Medium | TherapistDashboardWebSocket uses `enterpriseWebSocketService`; unclear if backend pushes new bookings to WebSocket or if polling is used. |
| **Push when app closed** | Medium | Service worker is disabled for P0 fix (`index.html` line 455: `if (false && 'serviceWorker'...)`). Push cannot fire when app is closed. |
| **Browser notifications** | Low | Uses `Notification` API when permission granted; depends on dashboard being open. |

---

## 3. Scheduled Bookings

### ✅ Fully Working

| Step | Status | Details |
|------|--------|---------|
| Correct date/time storage | ✅ | `scheduledDate`, `scheduledTime` in transaction params and Appwrite schema |
| User dashboard display | ✅ | BookingWelcomeBanner shows `scheduledDate`, `scheduledTime` |
| Therapist dashboard display | ✅ | TherapistBookingsPage, filter by scheduled, `isScheduled` |
| Reminder scheduling (code) | ✅ | `scheduledBookingPaymentService.scheduleBookingReminder`, `mp3NotificationService`, `addToCalendarAndScheduleReminders` (6h, 5h, 4h, 3h, 2h, 1h) |

### ⚠️ Issues / Gaps

| Issue | Severity | Details |
|-------|----------|---------|
| **Reminder delivery** | Medium | Reminders depend on `enterpriseWebSocketService` / `enterpriseScheduledReminderService`. If user/therapist is not on dashboard, reminders may not be delivered. No SMS/email backup. |
| **Deposit flow completeness** | Low | `ScheduledBookingDepositModal`, `scheduledBookingPaymentService` exist; confirm end-to-end for scheduled bookings with deposit. |

---

## 4. Notifications Summary

| Channel | User | Therapist | Status |
|---------|------|-----------|--------|
| In-app (chat/system) | ✅ | ✅ | Working |
| Push (browser) | ⚠️ | ⚠️ | SW disabled; subscription not persisted to server |
| Email | ❌ | ❌ | TODO – not integrated |
| SMS | ❌ | ❌ | Mock only |
| In-app sound | ✅ | ✅ | `pwaNotificationSoundHandler`, `bookingSoundService` |

---

## 5. UX Consistency Check

### ✅ Strengths

- Consistent orange theme (#f97316)
- Share2 icon used across share buttons (TherapistCardHeader, PlaceCard, etc.)
- BookingWelcomeBanner, BookingCountdown, countdown timers
- Error boundaries, validation, atomic transactions
- Mobile-friendly (safe areas, viewport, touch targets)

### ⚠️ Issues

| Issue | Location | Suggestion |
|-------|----------|------------|
| `/placeholder-avatar.jpg` | ChatHeader.tsx | Replace with `getRandomTherapistImage()` or real image fallback |
| SVG placeholder detection | TherapistCard | Logs error when `mainImage` is SVG – ensure data source returns valid URLs |
| TODOs in critical path | App.tsx line 191 | `// TODO: Fetch booking details from Appwrite` |
| Cancel redirect | PersistentChatProvider | Cancel does not redirect to home – acceptable per earlier spec; consider adding optional redirect |

---

## 6. Recommendations

### High Priority

1. **Enable and fix push notifications**
   - Re-enable service worker when P0 fix window expires
   - Persist push subscription to Appwrite so backend can send push
   - Test push when app is in background/closed

2. **Integrate email notifications**
   - Connect `TransactionalEmailService` to SendGrid/Appwrite/Resend
   - Send to therapist on new booking, to user on accept/confirm
   - Use templates already defined in the service

3. **User real-time booking status**
   - Subscribe to booking document in Appwrite Realtime in PersistentChatProvider
   - Update `currentBooking` when therapist accepts/declines so customer sees status without refresh

### Medium Priority

4. **SMS for critical events (optional)**
   - Integrate Twilio/AWS SNS for booking confirmation, accept, reminders
   - Use `bookingAntiSpamService` rate limits and structure

5. **Reminder reliability**
   - Ensure `enterpriseScheduledReminderService` / cron jobs run reminders
   - Add email/SMS fallback when user is not on dashboard

6. **Replace placeholder avatar**
   - Use `getRandomTherapistImage()` in ChatHeader instead of `/placeholder-avatar.jpg`

### Low Priority

7. **Resolve TODO in App.tsx** for booking details fetch
8. **Optional redirect to home** after user cancels within 1-minute window
9. **Manual QA** of deposit flow for scheduled bookings

---

## 7. Summary Table

| Area | Working | Issues |
|------|---------|--------|
| User: Open profile, Book Now, Select type, Complete | ✅ | - |
| User: Recorded in system | ✅ | - |
| User: Notifications | ⚠️ | In-app only; no SMS, email, push |
| Therapist: Accept/Decline | ✅ | - |
| Therapist: See schedules | ✅ | - |
| Therapist: Notifications | ⚠️ | In-app + browser when open; push disabled |
| Scheduled: Date/time, dashboards | ✅ | - |
| Scheduled: Reminders | ⚠️ | Code exists; delivery when offline unclear |
| UX consistency | ✅ | Minor placeholders |
| Modern app standards | ✅ | PWA, responsive, accessibility-aware |

---

*Report generated from codebase analysis. Manual end-to-end testing recommended for production sign-off.*
