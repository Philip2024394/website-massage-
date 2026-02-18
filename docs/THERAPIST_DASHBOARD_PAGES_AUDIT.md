# Therapist Dashboard – Page Count & Names Audit

**Audit date:** Generated from codebase  
**Scope:** All routes and page components that form the therapist dashboard (portal after login).

---

## Total counts

| Scope | Count |
|-------|--------|
| **Routed pages (AppRouter cases)** | **28** therapist-related routes |
| **Unique page components (files)** | **25** main dashboard pages |
| **Files in `src/pages/therapist/`** | **54** (includes wrappers, duplicates, and legacy) |

---

## 1. Routed dashboard pages (by route name)

These are the **route IDs** used in `AppRouter.tsx` and `therapistSidebarConfig` when a therapist is in the portal. Each resolves to one page component.

| # | Route name | Page component (file) |
|---|------------|------------------------|
| 1 | `therapist-dashboard` | TherapistDashboardPage (wrapper) → TherapistDashboardPageImpl |
| 2 | `therapist-status` | TherapistOnlineStatus |
| 3 | `dashboard` | TherapistPortalPage (TherapistDashboard) – profile/edit home |
| 4 | `therapist-bookings` | TherapistBookingsPage |
| 5 | `therapist-earnings` | TherapistEarningsPage |
| 6 | `therapist-chat` | TherapistChatPage |
| 7 | `therapist-notifications` | TherapistNotificationsPage |
| 8 | `therapist-legal` | TherapistLegalPage |
| 9 | `therapist-job-applications` | TherapistJobApplicationsPage |
| 10 | `therapist-how-it-works` | HowItWorksPage |
| 11 | `therapist-calendar` | TherapistCalendarPage |
| 12 | `therapist-payment` | TherapistPaymentInfoPage |
| 13 | `therapist-payment-status` | TherapistPaymentStatusPage |
| 14 | `therapist-menu` | TherapistMenuPage |
| 15 | `therapist-commission` / `therapist-commission-payment` | CommissionPayment |
| 16 | `send-discount` | SendDiscountPage |
| 17 | `customers` / `therapist-customers` | TherapistCustomersPage |
| 18 | `more-customers` | MoreCustomersPage |
| 19 | `therapist-analytics` / `analytics` | TherapistAnalyticsPage |
| 20 | `therapist-banner-discount` / `banner-discount` | BannerDiscountPage |
| 21 | `therapist-hotel-villa-safe-pass` | TherapistHotelVillaSafePassPage |
| 22 | `therapist-safepass-apply` | TherapistSafePassWrapper |
| 23 | `therapist-schedule` | TherapistSchedulePage |
| 24 | `therapist-package-terms` | PackageTermsPage |

---

## 2. Sidebar menu (what therapists see in the drawer)

From `therapistSidebarConfig.ts` – **THERAPIST_SIDEBAR_IDS**:

| # | Sidebar id | Resolves to route |
|---|------------|--------------------|
| 1 | status | therapist-status |
| 2 | therapist-how-it-works | therapist-how-it-works |
| 3 | dashboard | dashboard |
| 4 | bookings | therapist-bookings |
| 5 | customers | therapist-customers |
| 6 | send-discount | send-discount |
| 7 | earnings | therapist-earnings |
| 8 | payment | therapist-payment |
| 9 | payment-status | therapist-payment-status |
| 10 | commission-payment | therapist-commission |
| 11 | custom-menu | therapist-menu |
| 12 | analytics | therapist-analytics |
| 13 | therapist-hotel-villa-safe-pass | therapist-hotel-villa-safe-pass |
| 14 | notifications | therapist-notifications |
| 15 | legal | therapist-legal |
| 16 | job-applications | therapist-job-applications |

**FAB quick actions:** bookings, status, earnings, notifications, dashboard, analytics, more-customers, send-discount.

---

## 3. All page component names (unique)

These are the **component/file names** used for the therapist dashboard (one per logical screen):

1. TherapistDashboardPage / TherapistDashboardPageImpl  
2. TherapistOnlineStatus  
3. TherapistPortalPage (exported as TherapistDashboard)  
4. TherapistBookingsPage  
5. TherapistEarningsPage  
6. TherapistChatPage  
7. TherapistNotificationsPage  
8. TherapistLegalPage  
9. TherapistJobApplicationsPage  
10. HowItWorksPage  
11. TherapistCalendarPage  
12. TherapistPaymentInfoPage  
13. TherapistPaymentStatusPage  
14. TherapistMenuPage  
15. CommissionPayment  
16. SendDiscountPage  
17. MoreCustomersPage  
18. TherapistCustomersPage  
19. TherapistAnalyticsPage  
20. BannerDiscountPage  
21. TherapistHotelVillaSafePassPage  
22. TherapistSafePassWrapper  
23. TherapistSchedulePage  
24. PackageTermsPage  
25. PremiumUpgrade  

---

## 4. Other therapist-related routes (outside main dashboard)

| Route | Purpose |
|-------|--------|
| therapist-signup | Signup flow |
| therapist-login | Login |
| therapist-login-for-jobs | Login for job registration |
| therapist-signup-for-jobs | Signup for jobs |
| therapist-profile | Public profile view (by ID) |
| therapist-terms-and-conditions / therapist-terms | Terms |
| therapist-job-registration | Job registration |
| therapist-listing-payment | Listing payment |
| therapist-info | Info page |

---

## 5. Files in `src/pages/therapist/` (54 total)

Included for reference; many are wrappers, legacy variants, or shared pieces:

- TherapistChatPage.tsx  
- TherapistCalendar.tsx  
- TherapistCommissionPage.tsx  
- TherapistBookings.tsx  
- TherapistPaymentInfo.tsx  
- TherapistDashboardPage.tsx  
- TherapistOnlineStatus.tsx  
- CommissionPayment.tsx  
- TherapistNotifications.tsx  
- TherapistDashboard.tsx  
- TherapistEarnings.tsx  
- TherapistCalendarPage.tsx  
- TherapistSchedule.tsx  
- TherapistChat.tsx  
- TherapistCustomerBookingPage.tsx  
- CustomerBookingPage.tsx  
- TherapistMembershipOnboardingPage.tsx  
- TherapistNotificationsPage.tsx  
- TherapistPaymentInfoPage.tsx  
- TherapistOnlineStatusPage.tsx  
- TherapistJobApplicationsPage.tsx  
- TherapistHotelVillaSafePassPage.tsx  
- SendDiscountPage.tsx  
- HowItWorksPage.tsx  
- TherapistHowItWorksPage.tsx  
- TherapistCustomersPage.tsx  
- TherapistBookingsPage.tsx  
- TherapistMenu.tsx  
- TherapistMenuPage.tsx  
- TherapistEarningsPage.tsx  
- TherapistSchedulePage.tsx  
- TherapistPaymentStatusPage.tsx  
- TherapistAnalyticsPage.tsx  
- BannerDiscountPage.tsx  
- TherapistLegalPage.tsx  
- TherapistSafePassWrapper.tsx  
- TherapistSafePassApplication.tsx  
- TherapistPaymentStatus.tsx  
- MoreCustomersPage.tsx  
- MyBookings.tsx  
- TherapistMyBookingsPage.tsx  
- TherapistSendDiscountPage.tsx  
- TherapistPremiumUpgradePage.tsx  
- TherapistPlaceholderPage.tsx  
- TherapistPaymentReviewPage.tsx  
- TherapistPackageTermsPage.tsx  
- TherapistMoreCustomersPage.tsx  
- TherapistLegalPageNew.tsx  
- TherapistLegal.tsx  
- PremiumUpgrade.tsx  
- PaymentReviewPage.tsx  
- PackageTermsPage.tsx  
- MembershipOnboarding.tsx  
- HotelVillaSafePass.tsx  

---

## Summary

- **28** therapist-related route cases in AppRouter.  
- **25** unique dashboard page components (named above).  
- **16** sidebar menu items.  
- **54** files in `src/pages/therapist/` (includes wrappers, legacy, and alternate implementations).

If you want, the next step can be an audit of **which of these have country toggles (ID/VN/MY vs UK/US/AU)** or a **file cleanup** list (e.g. duplicate or unused pages).
