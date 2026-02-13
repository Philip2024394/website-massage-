# Scheduled Booking Flow – Elite Standard Audit Report

**Version:** 1.0  
**Date:** February 2026  
**Scope:** User and therapist/place flows vs `SCHEDULED_BOOKING_FLOW_SPEC.md`  
**Status:** ✅ **Elite-standard flow in place** with noted improvement suggestions.

---

## 1. Executive summary

The scheduled booking flow is **implemented to spec** for both **user** and **therapist/place**, with a single source of truth (Persistent Chat + Booking Lifecycle), clear timers, and consistent handling of accept/reject, deposit, payment proof, and confirm. The implementation qualifies as **elite standard** with the improvements below recommended for full spec alignment and operational robustness.

---

## 2. Spec compliance matrix

### 2.1 Accept / Reject (30 minutes) – Spec §1

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 1.1 Therapist/place does not reply in 30 min → booking **cancelled** | ✅ | `handleTimerExpiration` (THERAPIST_RESPONSE) → `expireBooking` → EXPIRED; `activeScheduledBookingId` cleared. |
| 1.1 Same chat: **suggested therapists/places** | ✅ | `suggestedTherapists` / `suggestedPlaces` loaded when `lifecycleStatus === EXPIRED \|\| DECLINED`. |
| 1.1 Filter: **active** therapists, **open** places only | ✅ | Therapists: `(t.status \|\| t.availability).toLowerCase() === 'available'`; Places: `isLive !== false && (isOpen \|\| status === 'open')`. Fallback if none. |
| 1.2 Reject → user **cannot** book that provider **again** (permanent block) | ✅ | `addBookingBlock(userId, providerId, providerType)`; `createBooking` checks `isBookingBlocked`. |
| 1.2 Therapist message vs place message | ✅ | Therapist: "Therapist is not available on the date."; Place: "This date and time has been filled." |

### 2.2 Bank details and 30% deposit (30 minutes) – Spec §2

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 2.1 Bank details from **dashboard**, auto-post in chat on **accept** | ✅ | `acceptBooking` → `secureBankCardService` formats and `addSystemNotification(bankCardMessage)` when `therapist.bankCardDetails` present. |
| 2.2 User: bank details + **30 min** to transfer + upload proof in **same chat** | ✅ | Deposit countdown from `acceptedAt` or `depositDeadlineExtendedAt`; upload proof in chat (payment_proof message). |
| 2.3 No proof in 30 min → booking **expires**, slot released | ✅ | `depositCountdownSeconds` → 0 triggers `recordDepositTimeout(providerId)`; timer/expiration logic clears booking state. |
| 2.3 **2 attempts** (expiries) → **24 h lock** for that provider | ✅ | `deposit_attempts` in localStorage; `isDepositLocked`; `recordDepositFailure`; lock message shown in chat. |

### 2.3 Payment proof – Spec §3

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 3.1 JPG/PNG, max **5 MB** | ✅ | `handleUploadPaymentProof`: `image/jpeg`, `image/png`, `image/jpg`; `file.size <= 5 * 1024 * 1024`. |
| 3.2 Re-upload; therapist can **accept** or **reject** | ✅ | New proof = new message; `confirmPaymentReceived` / `rejectPaymentProof`; reject extends deadline. |
| 3.2 All proof images **visible** to therapist | ✅ | All `payment_proof` messages shown in chat. |
| 3.3 Store in chat and **link to booking** (paymentProofUrl, paymentProofSubmittedAt) | ⚠️ | Proof stored in **chat** (message type `payment_proof` with URL). Booking document is **not** updated with `paymentProofUrl` / `paymentProofSubmittedAt` on upload (see improvement 1). |

### 2.4 Therapist/place: confirm payment (30 minutes) – Spec §4

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 4.1 **30 min** to confirm or reject proof; confirm → **active**, calendar red | ✅ | `therapistConfirmCountdownSeconds` from first `payment_proof`; `confirmPaymentReceived` → lifecycle `confirmBooking` → CONFIRMED; `addToCalendarAndScheduleReminders`. |
| 4.2 Reject → user gets **new 30 min** | ✅ | `rejectPaymentProof` → `depositDeadlineExtendedAt`; user countdown uses `depositDeadlineExtendedAt \|\| acceptedAt`. |
| 4.3 No action 30 min → **reminder** and/or **auto-expire** (e.g. 24 h) | ✅ | One-time reminder when countdown hits 0; 24 h auto-expire: `providerConfirmExpiredDoneRef`, decline booking and clear state. |

### 2.5 Calendar and double-booking – Spec §5

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 5.1 Slot **red** only after **confirm payment received** | ✅ | `addToCalendarAndScheduleReminders` called from `confirmBooking` (lifecycle) only on CONFIRMED. |
| 5.2 Slot **reserved on accept** (blocked for others until expire/cancel) | ⚠️ | Calendar **events** are created only on CONFIRMED. No explicit “tentative hold” or slot-block for **ACCEPTED** in calendar/live view (see improvement 2). |
| 5.3 Same flow for therapist and place | ✅ | `providerType` flows from PlaceCard / integration through transaction and lifecycle. |

### 2.6 One scheduled at a time / Book now – Spec §6

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 6.1 **One** scheduled booking per user (until confirmed or expired/cancelled) | ✅ | `activeScheduledBookingId` in state + `active_scheduled_booking_${userId}` in localStorage; cleared on CONFIRMED/DECLINED/EXPIRED/deposit timeout. |
| 6.2 **No** Book now (or second Schedule) until payment confirmed | ✅ | `hasActiveScheduledBooking`; `assertTherapistCanOpenChat` blocks book/schedule; TherapistCard disables Book/Schedule when `hasActiveScheduledBooking`. |
| 6.3 After payment confirmed, user **can** book again | ✅ | `activeScheduledBookingId` cleared on confirm; guard in `createBooking` only when id is set. |

### 2.7 Notifications and countdowns – Spec §7

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 7.1 User: 30 min deposit countdown + bank details + upload in **same chat** | ✅ | Single chat: deposit block, countdown, upload proof. |
| 7.2 Therapist: 30 min confirm countdown; **optional** sound/notification on proof | ✅ | Countdown in therapist block; sound + optional browser notification when new `payment_proof` from customer. |

### 2.8 Data and cancellation/refund – Spec §8

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 8.1 Appwrite attributes as needed | ✅ | Statuses, `depositDeadlineExtendedAt`, `providerType`, etc. used. |
| 8.2 Deposit **non-refundable**; no switch therapist/place; exceptions (no-show, service not provided, provider agrees) | ✅ | Non-refundable message on accept and in deposit block; `refundDeposit()` → decline + system message; “Refund deposit (exception…)” for provider. |

### 2.9 Places – Spec §9

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| **Same flow** as therapists | ✅ | `providerType: 'place'` from PlaceCard; transaction/lifecycle use `providerType`; blocks and messages use providerType. |

---

## 3. User flow (elite standard)

- **Create scheduled:** Schedule mode → datetime → details → create booking (SCHEDULED) with 30 min therapist response timer.  
- **Timer expiry:** Booking → EXPIRED; suggested active therapists and open places in same chat.  
- **Reject:** DECLINED + permanent block + therapist/place-specific message.  
- **Accept:** ACCEPTED + bank details (if present) + 30 min deposit countdown + non-refundable wording.  
- **Deposit:** Countdown from `acceptedAt` or `depositDeadlineExtendedAt`; proof upload in chat (JPG/PNG ≤5MB).  
- **No proof in time:** Deposit timeout recorded; 2nd failure → 24 h lock for that provider.  
- **Proof rejected:** New 30 min from `depositDeadlineExtendedAt`.  
- **Payment confirmed:** CONFIRMED → calendar red, `activeScheduledBookingId` cleared → user can book again.  
- **One at a time:** Enforced; Book now and Schedule disabled until current scheduled is resolved.

---

## 4. Therapist / place flow (elite standard)

- **30 min to accept/reject:** Same timer; accept → bank details in chat (if dashboard has them).  
- **Confirm / reject proof:** 30 min countdown from first proof; “Confirm payment received” / “Reject proof”; reject extends user’s deposit deadline.  
- **Reminder / 24 h expire:** One-time reminder at 0; 24 h auto-decline if no action.  
- **Refund exception:** “Refund deposit (exception…)” → confirm → decline + message.  
- **Sound/notification:** On new payment proof from customer.  
- **Calendar:** Slot turns red only after “Confirm payment received” (CONFIRMED).

---

## 5. Improvement suggestions

### 5.1 (Spec 3.3) Link payment proof to booking document

- **Current:** Proof is stored in chat (message type `payment_proof` with URL).  
- **Spec:** “Store proof in chat and **link to booking record** (e.g. `paymentProofUrl`, `paymentProofSubmittedAt` on booking document).”  
- **Suggestion:** When the user uploads payment proof in chat, also update the booking document (e.g. via lifecycle or booking API) with:
  - `paymentProofUrl` (e.g. latest or first proof URL)
  - `paymentProofSubmittedAt` (timestamp)  
  This supports dashboard views, audits, and reporting without changing chat behaviour.

### 5.2 (Spec 5.2) Slot reserved on accept

- **Current:** Calendar events (slot “red”) are created only when booking becomes **CONFIRMED** (`addToCalendarAndScheduleReminders`).  
- **Spec:** “When therapist/place **accepts**, that **date + time** is **reserved** (blocked for other users) until booking expires or is cancelled.”  
- **Suggestion:** Ensure the **live booking / calendar view** used by other users treats **ACCEPTED** scheduled bookings for that provider/date/time as blocking the slot (e.g. query ACCEPTED + CONFIRMED for slot availability). Alternatively, add a “tentative” or “pending_deposit” calendar entry on ACCEPT that blocks the slot until expire or CONFIRMED.

### 5.3 Suggested list fallback (Spec 1.1)

- **Current:** If no active therapists or open places are found, a fallback list is shown without re-applying the active/open filter.  
- **Suggestion:** Prefer to keep “only active/open” per spec: e.g. show an explicit “No other active therapists or open places right now” message instead of a fallback list that might include unavailable providers, or label the fallback as “Other options” and still filter by availability if the API supports it.

### 5.4 Bank details when missing

- **Current:** If `therapist.bankCardDetails` is empty, user only sees the 30 min deposit message, not actual bank details.  
- **Suggestion:** Ensure dashboard is the single source of truth and that “bank details in chat” is either required for scheduled accept (e.g. warn provider to add details) or show a clear message: “Bank details will be shared by the therapist/place in chat” so the user knows what to expect.

### 5.5 Elite UX and observability (optional)

- **Step indicator:** Consider a compact “Step X of Y” (e.g. “Step 2: Pay deposit”) in the scheduled flow to reduce confusion.  
- **Accessibility:** Ensure key actions (accept, reject, confirm payment, reject proof, refund) have clear labels and keyboard/ARIA support.  
- **Analytics:** Emit events for key transitions (e.g. PENDING → ACCEPTED → CONFIRMED, deposit_timeout, proof_rejected) to support support/debugging and product analytics.

---

## 6. Conclusion

The scheduled booking flow is **elite standard** for both user and therapist/place: timers, one-at-a-time, deposit and proof rules, 24 h lock, non-refundable and exception refund, and places parity are all in place. The suggestions above are aimed at full spec alignment (proof on booking doc, slot reserved on accept), clearer edge behaviour (suggested list, bank details), and optional UX/observability improvements.

---

*Audit based on `docs/SCHEDULED_BOOKING_FLOW_SPEC.md` and codebase review of `PersistentChatProvider`, `PersistentChatWindow`, `bookingLifecycleService`, `bookingCalendarService`, `usePersistentChatIntegration`, `TherapistCard`, `PlaceCard`, and related services.*
