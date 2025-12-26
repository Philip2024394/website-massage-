/**
 * Therapist Dashboard Routes Configuration
 * All therapist-related pages and features
 */

import React from 'react';

// Lazy-loaded therapist dashboard components
const TherapistDashboard = React.lazy(() => import('../../apps/therapist-dashboard/src/pages/TherapistDashboard'));
const TherapistOnlineStatus = React.lazy(() => import('../../apps/therapist-dashboard/src/pages/TherapistOnlineStatus'));
const TherapistBookings = React.lazy(() => import('../../apps/therapist-dashboard/src/pages/TherapistBookings'));
const TherapistEarnings = React.lazy(() => import('../../apps/therapist-dashboard/src/pages/TherapistEarnings'));
const TherapistChat = React.lazy(() => import('../../apps/therapist-dashboard/src/pages/TherapistChat'));
const TherapistNotifications = React.lazy(() => import('../../apps/therapist-dashboard/src/pages/TherapistNotifications'));
const TherapistLegal = React.lazy(() => import('../../apps/therapist-dashboard/src/pages/TherapistLegal'));
const TherapistCalendar = React.lazy(() => import('../../apps/therapist-dashboard/src/pages/TherapistCalendar'));
const TherapistPaymentInfo = React.lazy(() => import('../../apps/therapist-dashboard/src/pages/TherapistPaymentInfo'));
const TherapistPaymentStatus = React.lazy(() => import('../../apps/therapist-dashboard/src/pages/TherapistPaymentStatus'));
const TherapistMenu = React.lazy(() => import('../../apps/therapist-dashboard/src/pages/TherapistMenu'));
const PremiumUpgrade = React.lazy(() => import('../../apps/therapist-dashboard/src/pages/PremiumUpgrade'));
const CommissionPayment = React.lazy(() => import('../../apps/therapist-dashboard/src/pages/CommissionPayment'));
const TherapistSchedule = React.lazy(() => import('../../apps/therapist-dashboard/src/pages/TherapistSchedule'));
const PackageTermsPage = React.lazy(() => import('../../apps/therapist-dashboard/src/pages/PackageTermsPage'));

export const therapistRoutes = {
  dashboard: {
    path: '/therapist',
    component: TherapistDashboard,
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
  }
};
