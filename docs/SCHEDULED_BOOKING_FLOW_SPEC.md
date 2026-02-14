# Scheduled Booking Flow – Specification (Approved)

**Version:** 1.0  
**Date:** February 2026  
**Scope:** Therapists and Places (same flow for both).

---

## 1. Accept / Reject (30 minutes)

### 1.1 Therapist/place does not reply in 30 minutes
- **Action:** Booking is **cancelled** automatically.
- **UX:** In the **same chat window**, show **suggested therapists or places** for the user to click and view.
- **Filter:** Only show **active** therapists (available) or **open** places. No offline/closed options.

### 1.2 Therapist/place rejects
- **Restriction:** User **cannot** book with that therapist or place **again at all** (permanent block for that therapist/place).
- **UX:** User can view and book other available therapists or open places.
- **Messages:**
  - **Therapist:** e.g. “Therapist is not available on the date.”
  - **Place:** e.g. “This date and time has been filled.”

---

## 2. Bank details and 30% deposit (30 minutes)

### 2.1 Bank details source and display
- **Source:** Same bank details uploaded in therapist or place **dashboard**. Image + details (e.g. bank name, account name, number) from dashboard.
- **When:** **Auto-post** bank details into the **chat window** as soon as therapist/place **accepts** the scheduled booking.
- **Where:** Bank details (and image) are **displayed in the chat window** for the user to see.

### 2.2 After therapist/place accepts
- User receives:
  - Bank details (auto-posted in chat).
  - Notification that to **secure their booking** they must transfer a **30% deposit**.
- **Countdown:** **30 minutes** in the same chat window to:
  1. Transfer the 30% deposit.
  2. Upload screenshot (proof of payment).
  3. Send to therapist/place (in chat).

### 2.3 User does not upload proof in 30 minutes
- **Action:** Scheduled booking **expires**. Slot is **released** and **available** for other users (and can be scheduled again by the same user).
- **Spam protection:**
  - After **2 attempts** (two expiries for the same therapist/place by the same user?), **lock** that user from booking **that therapist or place** for **24 hours**.
  - Show user a notice that the spam filter applied and they can try **another** therapist or place.

---

## 3. Payment proof (screenshot)

### 3.1 Format
- **Type:** Screenshot from mobile (or similar) – e.g. **JPG, PNG**. Max **5 MB**.

### 3.2 Re-upload and visibility
- User can **delete** and **re-upload** and send again.
- Therapist/place can **accept** or **reject** the proof.
- **Keep all proof images visible** for therapist/place (history in chat or booking view).

### 3.3 Storage
- Store proof in chat and **link to booking record** (e.g. `paymentProofUrl`, `paymentProofSubmittedAt` on booking document).

---

## 4. Therapist/place: confirm payment (30 minutes)

### 4.1 When user submits payment proof
- Therapist/place has **30 minutes** to:
  - **Confirm** “payment received” → booking becomes **active**, calendar updates (slot red), live calendar blocks that date/time for other users.
  - Or **reject** (e.g. “payment not yet received” / “please submit clear image”).

### 4.2 If proof is rejected (e.g. unclear)
- **User:** Timer **resets to 30 minutes** to upload a new screenshot and send again.
- User can **chat live** in the same booking window with therapist/place.

### 4.3 If therapist/place does nothing for 30 minutes after proof submitted
- Per earlier agreement: reminder to therapist/place and/or auto-expire after a set time (e.g. 24 h) – to be implemented as chosen.

---

## 5. Calendar and double-booking

### 5.1 When is slot shown as “booked” (red)?
- Only after therapist/place **confirms “payment received”**. Then:
  - Therapist/place **calendar** updates (date/time shown **red**).
  - **Live** booking calendar view: same date/time **red** and **not bookable** by other users.

### 5.2 Slot reserved on accept
- When therapist/place **accepts** the scheduled request, that **date + time** is **reserved** (blocked for other users) until booking expires or is cancelled.

### 5.3 Therapist vs place status
- **Therapist:** availability = **online** status.
- **Place:** availability = **open** / **closed**.
- Same scheduled flow and rules for both.

---

## 6. One scheduled booking at a time / Book now

### 6.1 One scheduled booking per user
- User may have only **one** scheduled booking in progress (from “created” until “payment confirmed” or “expired/cancelled”).

### 6.2 Book now while scheduled is pending
- **No.** User can use **Book now** only **after** the scheduled booking’s payment has been **confirmed received**. Until then, only the current scheduled flow is allowed (no second scheduled, no Book now).

### 6.3 After payment confirmed
- User **can** create another booking (scheduled or Book now).

---

## 7. Notifications and countdowns

### 7.1 User
- **30-minute deposit countdown** and **bank details** and **upload payment proof** all in the **same chat window**.

### 7.2 Therapist/place
- **30-minute “confirm payment” countdown** (and payment proof) visible in **dashboard** (booking/chat view). Optional: sound/notification when proof is submitted.

---

## 8. Data and statuses

### 8.1 Appwrite
- **If** new attributes are needed for this flow (e.g. statuses, proof URL, lock expiry), **add** them to the booking (and related) collections.
- **Otherwise** use existing Appwrite attributes where they fit.

### 8.2 Cancellation and refund after payment sent
- **Default:** Once user has **sent** payment (deposit), **no cancel** by user. Chat must **clearly state** that deposit is **non-refundable** and user cannot switch to another therapist/place for that booking.
- **Exceptions:** Booking **can** be cancelled (and deposit refunded) only if:
  - Therapist does **not show**, or
  - Place does **not** provide the service as booked, or
  - **Therapist (or place) agrees to refund** the deposit.
- Refund/cancel logic to follow business rules (e.g. therapist-initiated refund updates booking status and optionally payment state).

---

## 9. Places

- **Same flow** as therapists for all scheduled booking steps (accept/reject, bank details, 30% deposit, 30 min proof, confirm payment, calendar, one-at-a-time, no Book now until confirmed).

---

## Summary – States and timers

| Step | Who | Timer | On expiry / reject |
|------|-----|-------|---------------------|
| 1 | Therapist/place | 30 min to Accept/Reject | Booking cancelled; show suggested active therapists/open places in chat |
| 2 | User | 30 min to transfer + upload proof | Booking expires; slot released; 2 fails → 24 h lock for that therapist/place |
| 3 | Therapist/place | 30 min to confirm payment received | Reminder / auto-expire per product choice |
| After confirm | – | – | Calendar red; slot blocked; user can book again (scheduled or Book now) |

---

## Implementation notes (for dev)

- Reuse **same chat window** (persistent chat) for: bank details, countdown, upload proof, and live chat.
- **Suggested therapists/places** after timeout/reject: query only **active** (therapist) or **open** (place); link to profile from chat.
- **24-hour lock:** store per (userId, therapistOrPlaceId) with expiry; block creation of new scheduled booking for that pair until lock expires.
- **Book now disabled** when user has one scheduled booking in progress (any stage until “payment confirmed” or “expired/cancelled”).
- Calendar “red” and blocking: only after status = payment confirmed; live view must use same source of truth so other users cannot book that slot.
