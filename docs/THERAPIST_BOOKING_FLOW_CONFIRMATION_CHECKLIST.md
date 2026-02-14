# Therapist Booking Flow – Confirmation Checklist (Tomorrow)

**Use this when confirming the booking flow with ~100 therapists on standby.**

**Date:** 2026-02-10  
**Goal:** Confirm therapist sees new bookings, can accept/reject, and customer is notified. Commission 30% recorded.

---

## Before you start

- [ ] **Appwrite CORS:** Production domain (e.g. `magenta-centaur-6443a1.netlify.app`) is added in Appwrite Console → Project → Platforms → Web App hostname (see `docs/NETLIFY_APPWRITE_CORS_FIX.md`).
- [ ] **Test devices:** At least one device as **customer** (browser or PWA), one as **therapist** (dashboard in browser or PWA).
- [ ] **Therapist account:** One therapist logged in with profile complete (so they appear in “Find therapist” and can receive bookings).

---

## 1. Customer creates a booking (Book Now)

| Step | What to do | Expected |
|------|------------|----------|
| 1.1 | Customer opens app → finds a therapist → taps **Book Now** (or equivalent). | Chat/booking UI opens. |
| 1.2 | Customer fills name, phone; selects duration/price; submits. | Booking is created; customer sees confirmation / “Waiting for therapist…” (or similar). |
| 1.3 | (Optional) Check Appwrite Console → **bookings** collection. | New document with `therapistId` matching therapist, status e.g. pending. |

---

## 2. Therapist sees and accepts the booking

| Step | What to do | Expected |
|------|------------|----------|
| 2.1 | Therapist is on **Dashboard** or **Bookings** (and ideally has app/PWA open). | — |
| 2.2 | Wait for new booking (real-time subscription). | **Sound** plays (if enabled). **Notification** appears (e.g. BookingRequestCard / notification bar). |
| 2.3 | Therapist opens **Bookings** (or notification). | New booking appears in list (e.g. “Received” or “Pending”). |
| 2.4 | Therapist taps **Accept**. | Booking status becomes accepted; no error. |
| 2.5 | (Optional) Check Appwrite: **bookings** doc `status` (or `bookingStatus`). | Status = accepted/confirmed. |
| 2.6 | (Optional) Check **commission** collection (or admin panel if you have one). | New commission record: **30%** of booking amount. |

---

## 3. Customer sees acceptance (Book Now)

| Step | What to do | Expected |
|------|------------|----------|
| 3.1 | Customer stays in same chat/session. | — |
| 3.2 | After therapist accepts. | **In-chat system message** e.g. “Your booking has been accepted…” (and any Book-Now-specific text, e.g. “You have 1 minute to cancel”). |
| 3.3 | (If you have Booking Status Tracker.) | Tracker updates to accepted/confirmed. |

---

## 4. Scheduled booking (optional but recommended)

| Step | What to do | Expected |
|------|------------|----------|
| 4.1 | Customer chooses **Schedule** (date + time), fills details, submits. | Scheduled booking created. |
| 4.2 | Therapist sees it in **Bookings** and taps **Accept**. | If **bank details** are required for scheduled: therapist must have bank details set; otherwise accept may be blocked with message. |
| 4.3 | After accept. | Customer gets in-chat message: **30% deposit** required, **30 minutes** to pay and upload proof. |
| 4.4 | Customer uploads deposit proof in chat. | Therapist (or admin flow) can approve; booking moves to confirmed. |
| 4.5 | (Optional) Check commission. | 30% commission record for this scheduled booking. |

---

## 5. Reject flow (quick check)

| Step | What to do | Expected |
|------|------------|----------|
| 5.1 | Customer creates another booking (different therapist or same after reset). | — |
| 5.2 | Therapist taps **Reject** (or Decline). | Booking status → rejected/cancelled. |
| 5.3 | Customer side. | In-chat or UI shows booking rejected/cancelled. |
| 5.4 | (Optional) No commission. | No commission record for rejected booking. |

---

## 6. Therapist PWA / notifications (optional)

| Step | What to do | Expected |
|------|------------|----------|
| 6.1 | Therapist has installed PWA (green “App installed” on dashboard). | — |
| 6.2 | New booking arrives (tab in background or app in background). | Sound plays when app is open; if you use background notifications, they may appear. |
| 6.3 | Dashboard “Bookings” / “Received”. | New booking appears in list. |

---

## If something fails – quick checks

| Issue | Check |
|-------|--------|
| Therapist never sees booking | Real-time: same therapist ID in booking doc; therapist logged in; Appwrite subscription connected (check console for subscription logs). |
| Accept button does nothing / error | Browser console + network; Appwrite permissions on bookings collection (therapist can update own bookings). |
| Customer doesn’t see “accepted” | In-chat system messages: `addSystemNotification` after accept; chat doc or real-time update for that booking/room. |
| No commission record | `trackBookingAcceptance` and `commissionTrackingService.createCommissionRecord` called on accept (see `THERAPIST_BOOKING_AND_COMMISSION_READINESS_REPORT.md`). |
| CORS / 403 on production | Appwrite Console → Platforms → add Netlify hostname (see `NETLIFY_APPWRITE_CORS_FIX.md`). |

---

## Sign-off (tomorrow)

- [ ] Book Now: customer creates → therapist sees → therapist accepts → customer sees accept → 30% commission recorded.  
- [ ] Scheduled (if tested): accept → deposit message → proof upload → commission.  
- [ ] Reject: therapist rejects → customer sees rejected → no commission.  
- [ ] Therapist notifications: sound + visible new booking (and PWA if in scope).

**Reference:** `docs/THERAPIST_BOOKING_AND_COMMISSION_READINESS_REPORT.md` (full technical flow).
