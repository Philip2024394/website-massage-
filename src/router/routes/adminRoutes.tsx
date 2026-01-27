/**
 * Admin Routes Configuration
 * Routes accessible only to logged-in admins
 * 
 * MERGED: Admin Dashboard fully integrated into main app
 * All admin routes protected by AdminGuard role-based access control
 * Uses unified appwriteClient.ts and shared environment variables
 */

import { lazy } from 'react';

// NEWEST Admin Dashboard with full Appwrite integration and commission flow
const AdminDashboard = lazy(() => import('../../../apps/admin-dashboard/src/pages/AdminDashboard'));
const AdminLiveListings = lazy(() => import('../../pages/AdminLiveListings'));

export const adminRoutes = {
  // Main Admin Dashboard - NEWEST VERSION with Appwrite + Commission Flow
  dashboard: {
    path: '/admin',
    component: AdminDashboard,
    name: 'admin-dashboard',
    requiresAuth: true,
    requiresAdmin: true
  },
  
  // Admin sub-routes - ALL USE NEWEST DASHBOARD (apps/admin-dashboard)
  therapists: {
    path: '/admin/therapists',
    component: AdminDashboard,
    name: 'admin-therapists',
    requiresAuth: true,
    requiresAdmin: true
  },
  
  bookings: {
    path: '/admin/bookings',
    component: AdminDashboard,
    name: 'admin-bookings',
    requiresAuth: true,
    requiresAdmin: true
  },
  
  chat: {
    path: '/admin/chat',
    component: AdminDashboard,
    name: 'admin-chat',
    requiresAuth: true,
    requiresAdmin: true
  },
  
  revenue: {
    path: '/admin/revenue',
    component: AdminDashboard,
    name: 'admin-revenue',
    requiresAuth: true,
    requiresAdmin: true
  },
  
  commissions: {
    path: '/admin/commissions',
    component: AdminDashboard,
    name: 'admin-commissions',
    requiresAuth: true,
    requiresAdmin: true
  },
  
  ktpVerification: {
    path: '/admin/ktp',
    component: AdminDashboard,
    name: 'admin-ktp',
    requiresAuth: true,
    requiresAdmin: true
  },
  
  achievements: {
    path: '/admin/achievements',
    component: AdminDashboard,
    name: 'admin-achievements',
    requiresAuth: true,
    requiresAdmin: true
  },
  
  systemHealth: {
    path: '/admin/system-health',
    component: AdminDashboard,
    name: 'admin-system-health',
    requiresAuth: true,
    requiresAdmin: true
  },
  
  settings: {
    path: '/admin/settings',
    component: AdminDashboard,
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
