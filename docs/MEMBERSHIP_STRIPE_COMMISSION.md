# Membership Flow: Stripe & Commission (Country-Specific)

This document describes the **full membership package** for partner signup: country detection, Stripe (monthly fee) vs commission, benefits messaging, and dashboard access.

---

## Countries and pricing

- **Indonesia (ID) only:** **30% commission**, no monthly fee. Partners join via “Join with 30% commission” and are onboarded as commission-based.
- **All other countries:** **Monthly fee** with **first month free** (to drive signups). After the free month, standard monthly/yearly pricing applies.

| Country   | Code | Model              | Amount / note |
|-----------|------|--------------------|---------------|
| UK        | GB   | Monthly fee        | First month free, then £15/month (or £150/year) |
| US        | US   | Monthly fee        | First month free, then $19/month (or $190/year) |
| Australia | AU   | Monthly fee        | First month free, then AU$30/month (or AU$300/year) |
| Germany   | DE   | Monthly fee        | First month free, then €19.99/month (or €199.99/year) |
| Indonesia | ID   | **30% commission** | No monthly fee; commission only |
| Vietnam   | VN   | Monthly fee        | First month free, then ₫499,000/month (or yearly) |
| Malaysia  | MY   | Monthly fee        | First month free, then RM79/month (or yearly) |
| Singapore | SG   | Monthly fee        | First month free, then S$29/month (or yearly) |
| Philippines | PH  | Monthly fee        | First month free, then ₱999/month (or yearly) |
| Thailand  | TH   | Monthly fee        | First month free, then ฿599/month (or yearly) |

Config: `src/config/membershipCountryPricing.ts`. Constants: `MONTHLY_FEE_COUNTRY_CODES`, `COMMISSION_COUNTRY_CODES = ['ID']`.

---

## Stage 1 — Country detection and routing

- **Auto-detect:** Use existing `CityContext` / `ipGeolocationService` (or pass `countryCode` into the membership page when available).
- **Manual override:** The partner membership page includes a country dropdown; URL can override with `?country=XX` (e.g. `/#/membership-partner?country=DE`).
- **Access:** Membership pages are intended to be reached only via a **“Become a Partner” / “Join Now”** link (e.g. in footer or landing). Add a link that navigates to `membership-partner` or updates the hash to `/#/membership-partner`.

---

## Stage 2 — Stripe and commission flows

### Monthly fee countries (GB, US, AU, DE, VN, MY, SG, PH, TH)

- **Client:** `MembershipPartnerPage` shows “First month free” when applicable, monthly/yearly toggle, and “Start free trial — Subscribe with Stripe” (or “Subscribe with Stripe”).
- **Flow:** Button calls `createMembershipCheckoutSession()` in `src/lib/stripeMembershipService.ts`, which **POSTs to your backend** `/api/membership/create-checkout-session` with:
  - `countryCode`, `currency`, `interval` (month | year), `amount` (in smallest unit, e.g. cents), `successUrl`, `cancelUrl`, optional `email`, `partnerId`, and **`firstMonthFree`** (boolean).
- **Backend (you implement):**
  - Create a Stripe Checkout Session in `subscription` mode with the correct Price ID (or create Price from amount/currency/interval).
  - When `firstMonthFree === true`, set **subscription trial**: e.g. `subscription_data: { trial_period_days: 30 }` so the first month is free and billing starts after.
  - Return `{ sessionId, url }`; client redirects to `url`.
- **Success:** Redirect to `successUrl` (e.g. `/#/membership-success?country=DE`). Show `MembershipSuccessPage` with “Create account” / “Log in” and optional “Back to home”.
- **Webhook:** On `checkout.session.completed`, create or update the partner account and attach the subscription (e.g. store `stripeCustomerId`, `stripeSubscriptionId`). Then they can log in and see subscription status in the dashboard.

### Commission country (ID only)

- **Client:** “Join with 30% commission” button calls `onJoinCommission(countryCode)` which navigates to **create-account** (or your therapist/partner signup flow).
- **Backend:** No Stripe subscription. On signup, create partner with a “commission” billing type and store `commissionPercent: 30`. On each booking, apply 30% commission (use existing `commissionTrackingService` / booking lifecycle).

---

## Stage 3 — Benefits messaging

All membership pages use shared copy from `src/config/membershipBenefits.ts`:

- Admin assistant support  
- Booking management dashboard  
- Analytics & reporting  
- Full access to all platform tools and features  
- Support and onboarding resources  

Display these on every country-specific membership view for consistency and conversion.

---

## Stage 4 — Account creation and dashboard

- **After Stripe payment:** User lands on `membership-success` and chooses “Create account” or “Log in”. Your auth/signup flow creates the partner account; backend has already linked the Stripe subscription via webhook.
- **After commission signup:** User completes existing create-account/therapist onboarding; backend marks them as commission-based partner.
- **Dashboard:** Ensure the therapist/partner dashboard shows:
  - **Subscription status** (active/canceled) or **30% commission** and next payout / Stripe billing status.
  - Booking tools, admin assistant features, income reports (existing pages).

---

## Files reference

| File | Purpose |
|------|--------|
| `src/config/membershipCountryPricing.ts` | Country → pricing (monthly vs commission, amounts, optional monthly). |
| `src/config/membershipBenefits.ts` | Shared benefit list and short descriptions. |
| `src/lib/stripeMembershipService.ts` | Client: calls backend to create Checkout Session, redirects to Stripe. |
| `src/pages/MembershipPartnerPage.tsx` | Country selector, pricing card, Stripe or commission CTA, benefits. |
| `src/pages/MembershipSuccessPage.tsx` | Post-payment success: create account / login / back home. |
| `src/types/pageTypes.ts` | Added `membership-partner`, `membership-success`. |
| `src/utils/urlMapper.ts` | URL ↔ page for `membership-partner`, `membership-success`. |
| `src/hooks/useAppState.ts` | Hash routes `/#/membership-partner`, `/#/membership-success` → page. |
| `src/AppRouter.tsx` | Routes for `membership-partner` and `membership-success`. |

---

## Backend integration checklist

1. **Stripe**
   - Create Products/Prices per country (or one product per currency) for monthly and yearly.
   - Implement `POST /api/membership/create-checkout-session` (create Checkout Session, return `sessionId` and `url`). Accept **`firstMonthFree`** in the body; when `true`, create the subscription with `subscription_data: { trial_period_days: 30 }` so the first month is free.
   - Add webhook for `checkout.session.completed` → create/update partner, attach subscription.
   - Store `stripeCustomerId`, `stripeSubscriptionId` (and optionally `priceId`) on the partner document.

2. **Commission (ID only)**
   - On partner signup in Indonesia (ID), set billing type to “commission” and `commissionPercent: 30`.
   - Use existing commission logic on bookings.

3. **Dashboard**
   - Subscription status: read from your DB (or Stripe API) and show “Active” / “Canceled” and next billing date.
   - Commission: show “30% per booking” and link to income/payout reports.

4. **Env**
   - `VITE_STRIPE_PUBLISHABLE_KEY` for any future client-side Stripe.js use.
   - Backend: Stripe secret key only on server; never in frontend.

---

## Adding the “Become a Partner” link

- **Landing or footer:** Add a button or link that sets the app page to `membership-partner` or navigates to `/#/membership-partner`.
- Example: `onClick={() => props.onNavigate?.('membership-partner')}` or `<a href="#/membership-partner">Become a Partner</a>`.
