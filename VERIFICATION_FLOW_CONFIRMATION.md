# Verified Badge & Verification Flow – Confirmation

This document confirms how therapists and places get the **verified badge** and how admin reviews and acts on verification requests.

---

## 1. Who must verify

- **Therapists:** To show the verified badge on their card, they must upload **ID (KTP or passport)** and **bank details** in their dashboard.
- **Places:** Verification for places is managed by admin (e.g. via Places Manager). Place cards show the verified badge when `isVerified` (or equivalent) is set by admin after ID and bank are confirmed.

---

## 2. Therapist flow (dashboard)

1. Therapist goes to **Therapist Dashboard** → **Payment / verification** (TherapistPaymentInfo).
2. They upload:
   - **ID:** KTP or passport image (`ktpPhotoUrl`).
   - **Bank:** Bank name, account name, account number.
3. On save, the system sets:
   - `ktpSubmitted: true`
   - `ktpVerified: false`
   - `ktpRejected: false`
4. **Verified badge on card:** Therapist cards (e.g. TherapistHomeCard) show the verified badge when the therapist is considered verified: `verifiedBadge` or `isVerified` or (has bank details and has KTP uploaded **and** admin has verified). Exact logic is in the card components; after admin verifies, `ktpVerified: true` and the badge is shown.

---

## 3. Admin notice and actions

- **Notice:** Admin dashboard shows:
  - **Stat card:** “Awaiting ID/Bank Verification” with the count of therapists who have submitted but are not yet verified or rejected.
  - **Quick action:** “KTP Verification” (with count in parentheses when > 0).
  - **Nav:** “KTP Verification” with a badge count when there are submissions awaiting verification.
- **KTP Verification panel:** Lists all therapists with `ktpSubmitted === true` and `!ktpVerified` and `!ktpRejected`. For each, admin sees:
  - Name, email
  - KTP/ID image (link to open full size)
  - Bank name, account name, masked account number (e.g. ****1234)
- **Actions per therapist:**
  - **Verify** – Sets `ktpVerified: true`, clears rejection. The verified badge then appears on the therapist’s card.
  - **Reject / Request more info** – Admin enters a reason; system sets `ktpRejected: true` and `ktpRejectionReason`. Therapist can see this in their dashboard and resubmit.
  - **Deactivate** – Sets therapist to offline/unavailable (`status: 'offline'`, `availability: 'Offline'`, `isLive: false`). They no longer appear as available.

---

## 4. Summary

| Step | Actor | Action |
|------|--------|--------|
| 1 | Therapist / Place | Upload ID (KTP or passport) and bank details in dashboard. |
| 2 | System | Badge can show on card once data is present and (for therapists) admin has verified. |
| 3 | Admin | Receives notice via “Awaiting ID/Bank Verification” count and KTP Verification panel. |
| 4 | Admin | Can **Verify** (grant badge), **Reject / Request more info** (with reason), or **Deactivate** from the admin dashboard. |

---

## 5. Relevant code (reference)

- **Therapist upload:** `TherapistPaymentInfo.tsx` (KTP + bank), therapist dashboard save and Appwrite mapping.
- **Badge on cards:** `TherapistHomeCard.tsx`, `MassagePlaceHomeCard` / `PlaceCard` / `FacialPlaceHomeCard` (verified when `isVerified` / `verifiedBadge` or equivalent).
- **Admin panel:** `AdminDashboardPage.tsx` – KtpVerification component (list, Verify / Reject / Deactivate); stats include `awaitingKtpVerification`.
- **Admin API:** `adminServices.ts` – `adminTherapistService.update` (allowed fields include `ktpVerified`, `ktpRejected`, `ktpRejectionReason`, `ktpVerifiedAt`, `ktpVerifiedBy`, `isLive`, etc.).
