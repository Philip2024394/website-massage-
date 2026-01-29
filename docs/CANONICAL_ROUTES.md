# CANONICAL ROUTE MAP – PRODUCTION

This file is the SINGLE SOURCE OF TRUTH for all URLs.
No route may be added, removed, or remapped without explicit qw: approval.

## PUBLIC ROUTES
- `/` → LandingPage.tsx → ACTIVE
- `/home` → HomePage.tsx → ACTIVE
- `/about` → AboutUsPage.tsx → ACTIVE
- `/contact` → ContactUsPage.tsx → ACTIVE
- `/company` → CompanyProfilePage.tsx → ACTIVE
- `/how-it-works` → HowItWorksPage.tsx → ACTIVE
- `/faq` → FAQPage.tsx → ACTIVE
- `/massage-types` → MassageTypesPage.tsx → ACTIVE
- `/facial-types` → FacialTypesPage.tsx → ACTIVE
- `/providers` → CustomerProvidersPage.tsx → ACTIVE
- `/facial-providers` → FacialProvidersPage.tsx → ACTIVE
- `/discounts` → TodaysDiscountsPage.tsx → ACTIVE
- `/women-reviews` → WomenReviewsPage.tsx → ACTIVE
- `/advanced-search` → AdvancedSearchPage.tsx → ACTIVE

## AUTH ROUTES
- `/auth` → AuthPage.tsx → ACTIVE
- `/signin` → AuthPage.tsx → ACTIVE
- `/sign-in` → AuthPage.tsx → ACTIVE
- `/login` → AuthPage.tsx → ACTIVE
- `/signup` → AuthPage.tsx → ACTIVE
- `/simple-signup` → AuthPage.tsx → ACTIVE
- `/therapist-login` → TherapistLoginPage.tsx → ACTIVE
- `/place-login` → MassagePlaceLoginPage.tsx → ACTIVE
- `/facial-portal` → FacialPortalPage.tsx → ACTIVE

## PROFILE ROUTES
- `/therapist/:id` → TherapistProfilePage.tsx → ACTIVE
- `/profile/therapist/:id` → TherapistProfilePage.tsx → ACTIVE
- `/share/therapist/:id` → SharedTherapistProfile.tsx → ACTIVE
- `/share/place/:id` → SharedPlaceProfile.tsx → ACTIVE
- `/share/facial/:id` → SharedFacialProfile.tsx → ACTIVE
- `/therapist-profile/:id` → SharedTherapistProfile.tsx → ACTIVE (legacy)
- `/massage-place/:id` → MassagePlaceProfilePage.tsx → ACTIVE
- `/facial-place/:id` → FacialPlaceProfilePage.tsx → ACTIVE

## THERAPIST DASHBOARD ROUTES (PROTECTED)
- `/therapist` → TherapistDashboard.tsx → HARD LOCKED
- `/therapist/bookings` → TherapistBookings.tsx → HARD LOCKED
- `/therapist/earnings` → TherapistEarnings.tsx → HARD LOCKED
- `/therapist/chat` → TherapistChat.tsx → HARD LOCKED
- `/therapist/notifications` → TherapistNotifications.tsx → HARD LOCKED
- `/therapist/calendar` → TherapistCalendar.tsx → HARD LOCKED
- `/therapist/payment-info` → TherapistPaymentInfo.tsx → HARD LOCKED
- `/therapist/payment-status` → TherapistPaymentStatus.tsx → HARD LOCKED
- `/therapist/menu` → TherapistMenu.tsx → HARD LOCKED
- `/therapist/premium` → PremiumUpgrade.tsx → HARD LOCKED
- `/therapist/commission` → CommissionPayment.tsx → HARD LOCKED
- `/therapist/schedule` → TherapistSchedule.tsx → HARD LOCKED
- `/therapist/send-discount` → SendDiscountPage.tsx → HARD LOCKED

## ADMIN ROUTES (PROTECTED)
- `/admin` → AdminDashboard.tsx → HARD LOCKED
- `/admin/therapists` → AdminDashboard.tsx → HARD LOCKED
- `/admin/bookings` → AdminDashboard.tsx → HARD LOCKED
- `/admin/chat` → AdminDashboard.tsx → HARD LOCKED

## UI MODIFICATION RULES

### OVERRIDE MECHANISM
Any instruction that modifies UI structure, layout, or component placement MUST begin with:
```
qw:
```

### FORBIDDEN WITHOUT qw:
- UI structure changes
- Layout modifications  
- Component placement changes
- Render order modifications
- New page creation
- Route path changes

### ALLOWED WITHOUT qw:
- Text content changes
- Styling modifications
- Logic fixes (if UI output identical)
- Bug fixes (if visual output unchanged)

## FROZEN AREAS (PRE-LAUNCH)
Until booking system is confirmed, these areas are visually present but functionally inert:
- `/therapist/chat`
- `/therapist/bookings`  
- Any payment UI
- Any calendar mutation logic