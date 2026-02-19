# Admin Elite System – Data Flow & Full Control

This document describes the admin dashboard data flow and features for **Indonesia and all countries**: payments received for monthly subscriptions, verification required notice, and full control to deactivate or edit any therapist or place profile.

---

## 1. Data flow (single source of truth)

- **Admin services:** `src/lib/adminServices.ts` – all admin operations use `appwriteClient` (same `DATABASE_ID`, `COLLECTIONS`).
- **Therapists:** `adminTherapistService` → therapists collection.
- **Places:** `adminPlacesService` → places collection (massage + facial).
- **Bookings:** `adminBookingService` → bookings collection.
- **Subscriptions & payments:** `adminSubscriptionService` → `payment_records`, `member_subscriptions` (optional; graceful if collections are missing).
- **Verification:** KTP/ID verification uses therapist attributes `ktpSubmitted`, `ktpVerified`, `ktpRejected`, `ktpRejectionReason`; admin can Verify / Reject / Deactivate from **KTP Verification** view.

---

## 2. Dashboard overview

| View | Purpose |
|------|--------|
| **Dashboard** | Stats: total/active therapists, places, bookings, revenue, commission, pending approvals, **awaiting KTP verification**, **payments this month**, quick actions. |
| **Therapists** | List all therapists; Edit (name, description, location, **city**, **country/locationId**, profile, email, phone); Status (pending/active/inactive/suspended/**offline**); Verify KTP; **Deactivate**. |
| **Places** | List all places; Edit (name, type, email, phone, location, **city**, **country**, pricing, etc.); Status; Verify; **Deactivate**. |
| **Subscriptions & Payments** | **Payments received this month** (count + IDR total); pending payments; active subscriptions list; link to **KTP Verification**. |
| **KTP Verification** | List therapists who submitted ID + bank and await review; **Verify** / **Reject (request more info)** / **Deactivate** per row. |

---

## 3. Payments received for monthly subscriptions

- **Stat on dashboard:** “Payments This Month” shows count and total IDR from `payment_records` where `paymentStatus === 'paid'` and `paidDate` in current month.
- **Subscriptions & Payments view:** Same data; list of recent payments (paid/pending); list of `member_subscriptions` (member name, status, location).
- **Collections:** `payment_records` (memberId, subscriptionId, monthNumber, amount, dueDate, paidDate, paymentStatus, etc.), `member_subscriptions` (memberId, memberType, memberName, memberLocation, subscriptionStatus, etc.). If these collections do not exist yet, the UI shows 0 and “No payment/subscription records” without breaking.

---

## 4. When verification is required

- Therapists (and places) must upload **ID (KTP or passport)** and **bank details** in their dashboard to get the verified badge.
- **Admin notice:** Dashboard stat “Awaiting ID/Bank Verification” and nav badge show the count of therapists with `ktpSubmitted === true` and not yet verified or rejected.
- **KTP Verification panel:** Admin can **Verify** (grant badge), **Reject / Request more info** (with reason), or **Deactivate** (set offline/unavailable).

---

## 5. Full control: edit any profile or account

- **Therapists:** Admin can edit name, description, location, **city**, **country/locationId**, profile image, email, phone; change status (including **offline**); verify KTP; **Deactivate** (sets `status: 'offline'`, `availability: 'Offline'`, `isLive: false`).
- **Places:** Admin can edit name, type, email, phone, location, **city**, **country**, pricing, etc.; change status; verify; **Deactivate** (sets `status: 'inactive'`, `isLive: false`).
- All updates go through `adminTherapistService.update` and `adminPlacesService.update` with explicit allowed fields (no arbitrary document writes).

---

## 6. Indonesia and all countries

- **Location/city:** Therapist and place profiles support `city`, `country`, `locationId` for filtering and display (e.g. Denpasar, Yogyakarta, Indonesia). Admin can set or correct these in Edit.
- **Pricing:** Membership/subscription pricing can be country-specific (e.g. `membershipCountryPricing.ts`). Payment records store amounts; dashboard displays IDR for current flow; multi-currency can be extended via same collections.
- **Verification:** Same KTP/ID + bank verification flow for all members regardless of country.

---

## 7. Key files

| File | Role |
|------|------|
| `src/lib/appwriteClient.ts` | `COLLECTIONS` (including `MEMBER_SUBSCRIPTIONS`, `PAYMENT_RECORDS`). |
| `src/lib/adminServices.ts` | `adminTherapistService`, `adminPlacesService`, `adminSubscriptionService`; allowed fields for update. |
| `src/pages/admin/AdminDashboardPage.tsx` | Dashboard stats, Subscriptions & Payments view, KTP Verification view, nav. |
| `src/components/admin/TherapistManager.tsx` | Therapist list, edit (with city/country), status, Verify KTP, Deactivate. |
| `src/components/admin/PlacesManager.tsx` | Places list, edit (with city/country), status, Verify, Deactivate. |
| `VERIFICATION_FLOW_CONFIRMATION.md` | Verified badge and verification flow summary. |
