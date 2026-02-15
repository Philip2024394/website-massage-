# Boon – Detailed Booking Flow (Order Now & Scheduled)

**Document purpose:** Who pays whom, and at what stage payment is introduced for **Order Now** and **Scheduled** bookings.

---

## 1. Overview: Two Booking Types

| Type | Trigger | When customer pays | When therapist/platform get paid |
|------|--------|--------------------|----------------------------------|
| **Order Now** | “Book Now” / “Order Now” on card or in chat | **After service** (full amount) | Therapist receives from customer; therapist then pays platform commission (30%) |
| **Scheduled** | “Schedule” button → date/time → deposit | **Deposit (30%) upfront**; **remaining (70%) after service** | Deposit: customer → (approval) → provider; remaining 70%: customer → therapist at service; platform commission (30%) from therapist |

---

## 2. Order Now (Immediate) Booking Flow

**Definition:** Customer wants a session as soon as possible (same day / ASAP). No fixed future time is locked at booking.

### 2.1 Stages and Who Does What

| Stage | Who | What happens | Payment introduced? |
|-------|-----|--------------|---------------------|
| **1. Customer opens booking** | Customer | Clicks “Order Now” or “Book Now” on therapist card (or from price list). Chat opens in booking mode. | **No.** No payment at this step. |
| **2. Customer fills form** | Customer | Enters: name, WhatsApp, who massage is for (male/female/children), location type (home/hotel/villa), address, duration (60/90/120 min). | **No.** |
| **3. Customer submits** | Customer | Clicks submit. System validates required fields, sends booking message, creates one booking document (status `pending`). | **No.** |
| **4. Therapist gets request** | Therapist | Sees request in dashboard with customer name, duration, price, location. **5-minute timer** to accept or reject. | **No.** |
| **5. Therapist accepts** | Therapist | Clicks “Accept”. Booking status → `confirmed`. **Platform creates commission record** (30% of booking price) with **4-hour payment deadline** for therapist (Pro plan). | **No customer payment.** Commission obligation created for **therapist → platform**. |
| **6. Session happens** | Customer + Therapist | Service is performed at agreed time/place. | **No in-app payment step.** |
| **7. Payment for service** | Customer → Therapist | Customer pays **full booking amount** to therapist: **cash** or **bank transfer** (using therapist’s bank details e.g. shared in chat). | **Yes. First (and only) time customer pays** – full price, **after service**. |
| **8. Commission payment** | Therapist → Platform | Therapist must pay **30% commission** to the platform (Pro plan). Proof uploaded in dashboard; **4-hour deadline** from booking acceptance. If not paid in time, account can be restricted (e.g. set to “busy”, no new bookings). | **Yes. Therapist pays platform** (30% of booking amount), after receiving from customer. |

### 2.2 Order Now – Payment Summary

- **Customer pays:** Full price **once**, **after service** (to therapist only: cash or bank transfer).
- **Therapist pays:** **30% commission** to platform (deadline e.g. 4 hours after acceptance; proof upload in dashboard).
- **Platform receives:** 30% commission from the therapist (not directly from the customer).
- **When payment is introduced:**  
  - **Customer:** at **service completion** (pay therapist).  
  - **Therapist:** at **booking acceptance** (obligation); actual payment to platform within deadline after acceptance.

---

## 3. Scheduled Booking Flow

**Definition:** Customer chooses a **future date and time**. Slot is secured with a **non-refundable 30% deposit**. Remaining 70% is paid at service.

### 3.1 Stages and Who Does What

| Stage | Who | What happens | Payment introduced? |
|-------|-----|--------------|---------------------|
| **1. Customer opens schedule** | Customer | Clicks “Schedule” on therapist card (or “Schedule (30% Deposit)” from price list). Schedule popup opens. | **No.** |
| **2. Select duration & date/time** | Customer | Chooses duration (e.g. 60/90/120 min), then date and time from calendar/slots. Sees price and **30% deposit** amount. | **No.** Deposit amount is **shown** but not yet paid. |
| **3. Customer confirms slot** | Customer | Confirms selection. System may create booking and **deposit requirement** (30% of total, non-refundable). Customer sees bank transfer instructions and policy. | **Yes. Payment is introduced:** customer must pay **30% deposit** to secure the slot. |
| **4. Customer pays deposit** | Customer | Transfers **30%** of total price to **therapist’s (or platform’s) bank account** per instructions. Uploads **payment proof** in app. | **Yes. Customer pays 30%** (deposit). |
| **5. Deposit verification** | Therapist / Admin | Verifies proof. Marks deposit as paid/approved. **Admin approval may be required** before deposit is released to provider. | **No new payment.** Flow is approval of customer’s deposit. |
| **6. Deposit payout to provider** | Platform / Admin | After approval, deposit (30%) can be paid out to therapist (per policy: “Admin approval required for deposit payout to providers”). | **No customer payment.** **Provider receives 30%** (deposit). |
| **7. Reminders** | System | **5-hour reminder** before scheduled time sent to customer and therapist. | **No.** |
| **8. Session happens** | Customer + Therapist | Service at scheduled date/time and location. | **No.** |
| **9. Remaining payment** | Customer → Therapist | Customer pays **remaining 70%** to therapist: **cash or bank transfer** at/after service. | **Yes. Customer pays 70%** (balance) **at service**. |
| **10. Commission** | Therapist → Platform | Platform **30% commission** applies to the **full** booking (same as Order Now). Therapist pays commission to platform (proof upload, deadline). | **Yes. Therapist pays platform** (30% of full booking). |

### 3.2 Scheduled – Payment Summary

- **Customer pays:**  
  - **30% deposit** – **upfront**, to secure the slot (bank transfer + proof). Non-refundable.  
  - **70% balance** – **at service** (to therapist: cash or bank transfer).
- **Therapist receives:**  
  - 30% when deposit is approved and paid out;  
  - 70% from customer at service (minus commission to platform).
- **Therapist pays:** **30% commission** to platform on the **full** booking amount (same rule as Order Now).
- **Platform receives:** 30% commission from the therapist; may also facilitate/approve deposit flow before payout to provider.
- **When payment is introduced:**  
  - **Customer:** deposit **at step 3–4** (after choosing date/time and confirming); balance **at step 9** (service).  
  - **Therapist:** commission obligation when booking is confirmed; actual payment to platform per deadline.

---

## 4. Who Pays Who – Quick Reference

| Flow | Customer pays | Therapist receives | Therapist pays (to platform) | Platform receives |
|------|----------------|---------------------|-----------------------------|-------------------|
| **Order Now** | Full price **after service** (to therapist) | Full price from customer | **30% commission** (after acceptance, within deadline) | 30% from therapist |
| **Scheduled** | **30% deposit** upfront (to secure slot); **70% at service** (to therapist) | 30% when deposit approved; 70% at service from customer | **30% commission** on full booking (same as above) | 30% from therapist |

- **Customer** never pays the platform directly for the massage; they pay the therapist (and for scheduled, a deposit first to secure the slot).
- **Platform** is paid by the **therapist** (30% commission), not by the customer.
- **Scheduled** is the only flow where payment is introduced **before** the session (the 30% deposit).

---

## 5. Business Rules (Locked in Code)

- **Scheduled deposit:** 30% of total price, **non-refundable** (constants: `SCHEDULED_BOOKING_DEPOSIT_PERCENTAGE = 30`, `SCHEDULED_BOOKING_DEPOSIT_REFUNDABLE = false`).
- **Platform commission:** 30% of booking price, taken from therapist side (`PLATFORM_COMMISSION_PERCENTAGE_INDONESIA = 30`).
- **Order Now:** Therapist has **5 minutes** to accept/reject (`BOOKING_ACCEPTANCE_TIMEOUT_MINUTES = 5`).
- **Scheduled reminders:** Notifications **5 hours** before scheduled time (`SCHEDULED_BOOKING_NOTIFICATION_HOURS = 5`).
- **Commission payment deadline (Pro):** e.g. **4 hours** after booking acceptance; therapist must upload proof or account may be restricted.
- **Bank details:** Required for therapist to accept **scheduled** bookings (`BANK_DETAILS_REQUIRED_FOR_SCHEDULED_BOOKINGS = true`).
- **No-show (scheduled):** If customer does not show, deposit can be forfeited (no refund); provider may keep deposit per policy.

---

## 6. Optional: Menu / Price-List Entry

- From the **price list** (menu slider), customer can choose:
  - **“Book Now”** → same as **Order Now** (payment only after service).
  - **“Schedule (30% Deposit)”** → same as **Scheduled** (30% deposit upfront, 70% at service).

Same payment rules and “who pays who” as above apply; only the entry point differs.

---

*Last aligned with codebase: business logic constants, `SCHEDULED_BOOKING_SYSTEM_COMPLETE.md`, `BOOKING_FLOW_LOCKED.md`, `AUTOMATIC_COMMISSION_TRACKING.md`, and scheduled booking payment service.*
