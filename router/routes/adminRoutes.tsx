/**
 * Admin Routes Configuration
 * Routes accessible only to logged-in agents/admins
 */

import { lazy } from 'react';

// Lazy-loaded admin components
const AdminLiveListings = lazy(() => import('../../pages/AdminLiveListings'));

export const adminRoutes = {
  liveListings: {
    path: '/admin/live-listings',
    component: AdminLiveListings,
    name: 'admin-live-listings',
    requiresAuth: true,
    requiresAdmin: true
  }
};
