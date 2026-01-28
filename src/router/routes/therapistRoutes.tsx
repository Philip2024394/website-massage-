/**
 * Therapist Dashboard Routes Configuration
 * All therapist-related pages and features
 * 
 * ✅ CONSOLIDATED: All therapist pages now in src/pages/therapist/
 * ✅ SINGLE SOURCE: No duplicate dashboard folders
 */

import { lazy } from 'react';

// Direct imports to fix component load errors
import TherapistPortalPage from '../../pages/therapist/TherapistDashboard';
import TherapistOnlineStatus from '../../pages/therapist/TherapistOnlineStatus';
const TherapistBookings = lazy(() => import('../../pages/therapist/TherapistBookings'));
const TherapistEarnings = lazy(() => import('../../pages/therapist/TherapistEarnings'));
const TherapistChat = lazy(() => import('../../pages/therapist/TherapistChat'));
const TherapistNotifications = lazy(() => import('../../pages/therapist/TherapistNotifications'));
const TherapistLegal = lazy(() => import('../../pages/therapist/TherapistLegal'));
const TherapistCalendar = lazy(() => import('../../pages/therapist/TherapistCalendar'));
const TherapistPaymentInfo = lazy(() => import('../../pages/therapist/TherapistPaymentInfo'));
const TherapistPaymentStatus = lazy(() => import('../../pages/therapist/TherapistPaymentStatus'));
const TherapistMenu = lazy(() => import('../../pages/therapist/TherapistMenu'));
const PremiumUpgrade = lazy(() => import('../../pages/therapist/PremiumUpgrade'));
const CommissionPayment = lazy(() => import('../../pages/therapist/CommissionPayment'));
const TherapistSchedule = lazy(() => import('../../pages/therapist/TherapistSchedule'));
const PackageTermsPage = lazy(() => import('../../pages/therapist/PackageTermsPage'));
const SendDiscountPage = lazy(() => import('../../pages/therapist/SendDiscountPage'));

// Placeholder component for routes under construction
const TherapistPlaceholderPage = lazy(() => import('../../pages/therapist/TherapistPlaceholderPage'));

export const therapistRoutes = {
  dashboard: {
    path: '/therapist',
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
    component: TherapistBookings,
    name: 'therapist-bookings',
    requiresAuth: true
  },
  earnings: {
    path: '/therapist/earnings',
    component: TherapistEarnings,
    name: 'therapist-earnings',
    requiresAuth: true
  },
  chat: {
    path: '/therapist/chat',
    component: TherapistChat,
    name: 'therapist-chat',
    requiresAuth: true
  },
  notifications: {
    path: '/therapist/notifications',
    component: TherapistNotifications,
    name: 'therapist-notifications',
    requiresAuth: true
  },
  legal: {
    path: '/therapist/legal',
    component: TherapistLegal,
    name: 'therapist-legal',
    requiresAuth: true
  },
  calendar: {
    path: '/therapist/calendar',
    component: TherapistCalendar,
    name: 'therapist-calendar',
    requiresAuth: true
  },
  payment: {
    path: '/therapist/payment',
    component: TherapistPaymentInfo,
    name: 'therapist-payment',
    requiresAuth: true
  },
  paymentStatus: {
    path: '/therapist/payment-status',
    component: TherapistPaymentStatus,
    name: 'therapist-payment-status',
    requiresAuth: true
  },
  menu: {
    path: '/therapist/menu',
    component: TherapistMenu,
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
    component: TherapistSchedule,
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
  placeholder: {
    path: '/therapist/placeholder',
    component: TherapistPlaceholderPage,
    name: 'therapist-placeholder',
    requiresAuth: false
  }
};
