/**
 * 🔒 HARD LOCK: THERAPIST ROUTING CONFIGURATION
 * 
 * LOCKED ELEMENTS (require business approval to modify):
 * - Route paths (/therapist, /therapist/bookings, etc.)
 * - Route names (therapist-dashboard, therapist-bookings, etc.) 
 * - Component mappings (which component serves which route)
 * - requiresAuth flags (all therapist routes require authentication)
 * - Route structure and organization
 * 
 * EDITABLE ELEMENTS (safe to modify):
 * - Component implementations (UI, styling, layouts)
 * - Lazy loading strategy (performance optimization)
 * - Comments and documentation
 * 
 * ⚠️ CRITICAL: Changing route paths or names will break:
 * - Deep links from notifications
 * - Saved bookmarks
 * - Navigation from TherapistLayout menu
 * - External integrations
 * 
 * Therapist Dashboard Routes Configuration
 * All therapist-related pages and features
 * 
 * ✅ CONSOLIDATED: All therapist pages now in src/pages/therapist/
 * ✅ SINGLE SOURCE: No duplicate dashboard folders
 */

import { lazy } from 'react';

// 🔒 BULLETPROOF IMPORTS - Direct imports prevent component load errors
// All critical therapist routes use direct imports for maximum reliability
import TherapistPortalPage from '../../pages/therapist/TherapistDashboard';
import TherapistOnlineStatus from '../../pages/therapist/TherapistOnlineStatus';
import TherapistLegalPage from '../../pages/therapist/TherapistLegalPage';
import HowItWorksPage from '../../pages/therapist/HowItWorksPage';
import TherapistBookingsPage from '../../pages/therapist/TherapistBookingsPage';
import TherapistEarningsPage from '../../pages/therapist/TherapistEarningsPage';
import TherapistChatPage from '../../pages/therapist/TherapistChatPage';
import TherapistNotificationsPage from '../../pages/therapist/TherapistNotificationsPage';
import TherapistCalendarPage from '../../pages/therapist/TherapistCalendarPage';
import TherapistPaymentInfoPage from '../../pages/therapist/TherapistPaymentInfoPage';
import TherapistPaymentStatusPage from '../../pages/therapist/TherapistPaymentStatusPage';
import TherapistMenuPage from '../../pages/therapist/TherapistMenuPage';
import PremiumUpgrade from '../../pages/therapist/PremiumUpgrade';
import CommissionPayment from '../../pages/therapist/CommissionPayment';
import TherapistSchedulePage from '../../pages/therapist/TherapistSchedulePage';
import PackageTermsPage from '../../pages/therapist/PackageTermsPage';
import SendDiscountPage from '../../pages/therapist/SendDiscountPage';
import MoreCustomersPage from '../../pages/therapist/MoreCustomersPage';
import TherapistPlaceholderPage from '../../pages/therapist/TherapistPlaceholderPage';
import TherapistHotelVillaSafePassPage from '../../pages/therapist/TherapistHotelVillaSafePassPage';
import TherapistCustomersPage from '../../pages/therapist/TherapistCustomersPage';
import TherapistAnalyticsPage from '../../pages/therapist/TherapistAnalyticsPage';
import BannerDiscountPage from '../../pages/therapist/BannerDiscountPage.tsx';

export const therapistRoutes = {
  dashboard: {
    path: '/therapist/dashboard',
    component: TherapistPortalPage,
    name: 'therapist-dashboard',
    requiresAuth: true
  },
  status: {
    path: '/therapist/status',
    component: TherapistOnlineStatus,
    name: 'therapist-status',
    requiresAuth: true
  },
  bookings: {
    path: '/therapist/bookings',
    component: TherapistBookingsPage,
    name: 'therapist-bookings',
    requiresAuth: true
  },
  earnings: {
    path: '/therapist/earnings',
    component: TherapistEarningsPage,
    name: 'therapist-earnings',
    requiresAuth: true
  },
  chat: {
    path: '/therapist/chat',
    component: TherapistChatPage,
    name: 'therapist-chat',
    requiresAuth: true
  },
  notifications: {
    path: '/therapist/notifications',
    component: TherapistNotificationsPage,
    name: 'therapist-notifications',
    requiresAuth: true
  },
  legal: {
    path: '/therapist/legal',
    component: TherapistLegalPage,
    name: 'therapist-legal',
    requiresAuth: true
  },
  howItWorks: {
    path: '/therapist/how-it-works',
    component: HowItWorksPage,
    name: 'therapist-how-it-works',
    requiresAuth: true
  },
  calendar: {
    path: '/therapist/calendar',
    component: TherapistCalendarPage,
    name: 'therapist-calendar',
    requiresAuth: true
  },
  payment: {
    path: '/therapist/payment',
    component: TherapistPaymentInfoPage,
    name: 'therapist-payment',
    requiresAuth: true
  },
  paymentStatus: {
    path: '/therapist/payment-status',
    component: TherapistPaymentStatusPage,
    name: 'therapist-payment-status',
    requiresAuth: true
  },
  menu: {
    path: '/therapist/menu',
    component: TherapistMenuPage,
    name: 'therapist-menu',
    requiresAuth: true
  },
  premium: {
    path: '/therapist/premium',
    component: PremiumUpgrade,
    name: 'therapist-premium',
    requiresAuth: true
  },
  commission: {
    path: '/therapist/commission',
    component: CommissionPayment,
    name: 'therapist-commission',
    requiresAuth: true
  },
  schedule: {
    path: '/therapist/schedule',
    component: TherapistSchedulePage,
    name: 'therapist-schedule',
    requiresAuth: true
  },
  packageTerms: {
    path: '/therapist/package-terms',
    component: PackageTermsPage,
    name: 'therapist-package-terms',
    requiresAuth: true
  },
  sendDiscount: {
    path: '/therapist/send-discount',
    component: SendDiscountPage,
    name: 'send-discount',
    requiresAuth: true
  },
  moreCustomers: {
    path: '/therapist/more-customers',
    component: MoreCustomersPage,
    name: 'more-customers',
    requiresAuth: true
  },
  placeholder: {
    path: '/therapist/placeholder',
    component: TherapistPlaceholderPage,
    name: 'therapist-placeholder',
    requiresAuth: false
  },
  hotelVillaSafePass: {
    path: '/therapist/hotel-villa-safe-pass',
    component: TherapistHotelVillaSafePassPage,
    name: 'therapist-hotel-villa-safe-pass',
    requiresAuth: true
  },
  customers: {
    path: '/therapist/customers',
    component: TherapistCustomersPage,
    name: 'therapist-customers',
    requiresAuth: true
  },
  analytics: {
    path: '/therapist/analytics',
    component: TherapistAnalyticsPage,
    name: 'therapist-analytics',
    requiresAuth: true
  },
  bannerDiscount: {
    path: '/therapist/banner-discount',
    component: BannerDiscountPage,
    name: 'therapist-banner-discount',
    requiresAuth: true
  }
};
