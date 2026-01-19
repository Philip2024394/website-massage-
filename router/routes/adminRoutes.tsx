/**
 * Admin Routes Configuration
 * Routes accessible only to logged-in admins
 * 
 * MERGED: Admin Dashboard fully integrated into main app
 * All admin routes protected by AdminGuard role-based access control
 * Uses unified appwriteClient.ts and shared environment variables
 */

import { lazy } from 'react';

// Unified admin dashboard (merged into main app)
const AdminDashboardPage = lazy(() => import('../../pages/admin/AdminDashboardPage'));
const AdminLiveListings = lazy(() => import('../../pages/AdminLiveListings'));

export const adminRoutes = {
  // Main Admin Dashboard - UNIFIED VERSION
  dashboard: {
    path: '/admin',
    component: AdminDashboardPage,
    name: 'admin-dashboard',
    requiresAuth: true,
    requiresAdmin: true
  },
  
  // Admin sub-routes - ALL USE UNIFIED DASHBOARD
  therapists: {
    path: '/admin/therapists',
    component: AdminDashboardPage,
    name: 'admin-therapists',
    requiresAuth: true,
    requiresAdmin: true
  },
  
  bookings: {
    path: '/admin/bookings',
    component: AdminDashboardPage,
    name: 'admin-bookings',
    requiresAuth: true,
    requiresAdmin: true
  },
  
  chat: {
    path: '/admin/chat',
    component: AdminDashboardPage,
    name: 'admin-chat',
    requiresAuth: true,
    requiresAdmin: true
  },
  
  revenue: {
    path: '/admin/revenue',
    component: AdminDashboardPage,
    name: 'admin-revenue',
    requiresAuth: true,
    requiresAdmin: true
  },
  
  commissions: {
    path: '/admin/commissions',
    component: AdminDashboardPage,
    name: 'admin-commissions',
    requiresAuth: true,
    requiresAdmin: true
  },
  
  ktpVerification: {
    path: '/admin/ktp',
    component: AdminDashboardPage,
    name: 'admin-ktp',
    requiresAuth: true,
    requiresAdmin: true
  },
  
  achievements: {
    path: '/admin/achievements',
    component: AdminDashboardPage,
    name: 'admin-achievements',
    requiresAuth: true,
    requiresAdmin: true
  },
  
  systemHealth: {
    path: '/admin/system-health',
    component: AdminDashboardPage,
    name: 'admin-system-health',
    requiresAuth: true,
    requiresAdmin: true
  },
  
  settings: {
    path: '/admin/settings',
    component: AdminDashboardPage,
    name: 'admin-settings',
    requiresAuth: true,
    requiresAdmin: true
  },
  
  // Legacy route
  liveListings: {
    path: '/admin/live-listings',
    component: AdminLiveListings,
    name: 'admin-live-listings',
    requiresAuth: true,
    requiresAdmin: true
  }
};
