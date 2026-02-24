# Massage City Places (Indonesia) – Vendor Onboarding & Membership

Vendor onboarding and membership system for Indonesia: **fast signup, no pricing at signup, listing goes live first**, then "Increase Your Earnings" for upgrades.

## Flow

1. **Step 1 – Account creation (no pricing shown)**  
   - Route: `massage-city-places-signup`  
   - Fields: Name, Phone, WhatsApp, Business Name, City, Password  
   - Phone verification: OTP step (stub: any 6 digits in dev)  
   - On success: create Appwrite user + place document, auto sign-in, redirect to `massage-place-dashboard` with `mcp_onboarding` flag  

2. **Step 2 – Create listing**  
   - In place dashboard: when `mcp_onboarding` is set and place is not live, an onboarding banner is shown with:  
     - “Your listing is X% complete” progress bar  
     - Free plan: up to 5 photos  
     - Complete profile (logo, photos, services/pricing, description, hours, address)  
   - When ready: **“Publish My Listing”** button  

3. **Step 3 – Listing goes live**  
   - On Publish: place is saved with `isLive: true`, `STORAGE_MCP_ONBOARDING` cleared  
   - Redirect to **“Increase Your Earnings”** page (`increase-your-earnings`)  
   - Message: listing is live under Free Plan (20–25% commission); can upgrade anytime  

4. **Step 4 – Membership page**  
   - **Increase Your Earnings** shows 3 plans:  
     - **Free**: 0 IDR, 25% commission, 5 photos, basic listing, WhatsApp booking, admin scheduling  
     - **Pro**: 149,000 IDR/month, 10% commission, 15 photos, “Verified” badge, dashboard, analytics – *Most Popular*  
     - **Elite**: 190,000 IDR/month, 0% commission, unlimited photos, top placement, full tools – *Best for Growing Spas*  
   - From dashboard: **Membership** tab shows the same plans (same config).  

## Entry points

- **New signup**: Navigate to `massage-city-places-signup` (e.g. from a “Join as Massage City Place” link that uses this route instead of `place-signup`).  
- **Existing place signup**: `place-signup` / `massage-place-signup` still use the generic signup and go to dashboard without the MCP onboarding banner.  

## Config

- **Plans**: `src/config/massageCityPlacesPlans.ts` – `MCP_PLANS`, `MCP_DEFAULT_FREE_COMMISSION_PERCENT` (25), `MCP_FREE_COMMISSION_MIN/MAX` (20–25).  
- **Storage**: `sessionStorage` key `mcp_onboarding` = `'1'` until listing is published.  

## Admin (future)

- Commission % (20–25% for free), manual approval, WhatsApp routing, booking moderation, plan upgrades/downgrades.  
- Commission tracker (“This month you have paid X IDR in commission”) and upgrade popup (e.g. after 3 bookings or 200 profile views) can be added later using the same plan config and place/booking data.

## Files

| Area | File |
|------|------|
| Signup (no pricing) | `src/pages/auth/MassageCityPlacesSignupPage.tsx` |
| Plans config | `src/config/massageCityPlacesPlans.ts` |
| Increase Your Earnings page | `src/pages/place/IncreaseYourEarningsPage.tsx` |
| Place auth (businessName, city) | `src/lib/auth.ts` (placeAuth.signUp options) |
| Dashboard onboarding + Publish | `apps/place-dashboard/src/pages/PlaceDashboard.tsx` |
| Dashboard Membership tab | `apps/place-dashboard/src/pages/MembershipPlansPage.tsx` |
| Routes | `src/AppRouter.tsx` (`massage-city-places-signup`, `increase-your-earnings`) |
| Place app props | `apps/place-dashboard/src/App.tsx` (place, onBack, onNavigate, language) |
