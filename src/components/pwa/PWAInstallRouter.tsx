/**
 * 🏆 GOLD STANDARD PWA INSTALL ROUTER
 * 
 * Scope-aware PWA install banner router
 * Automatically shows the correct banner based on current route
 * 
 * LOCKED RULES:
 * - Main App Banner: Shows on consumer pages (/, /therapist/:id, /place/:id, /shared/*)
 * - Dashboard Banner: Shows on dashboard pages (/therapist, /admin, /place without ID)
 * - Never shows both banners simultaneously
 * - Respects install state and dismissal timeout
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import MainAppPWABanner from './MainAppPWABanner';
import DashboardPWABanner from './DashboardPWABanner';

export const PWAInstallRouter: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  // 🔒 GOLD STANDARD RULE: Detect dashboard routes
  const isDashboard = 
    pathname === '/therapist' || // Therapist dashboard (no ID)
    pathname === '/admin' ||      // Admin dashboard
    pathname === '/place' ||      // Place dashboard (no ID)
    pathname.startsWith('/therapist/dashboard') ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/place/dashboard');

  // 🔒 GOLD STANDARD RULE: Detect consumer routes
  const isConsumer = 
    pathname === '/' ||                          // Home page
    pathname.startsWith('/therapist/') ||        // Therapist profile (with ID)
    pathname.startsWith('/place/') ||            // Place profile (with ID)
    pathname.startsWith('/shared/') ||           // Shared profiles
    pathname.startsWith('/booking/') ||          // Booking flow
    pathname.startsWith('/search') ||            // Search pages
    pathname.startsWith('/filter');              // Filter pages

  console.log('[PWA Router]', {
    pathname,
    isDashboard,
    isConsumer,
    willShowBanner: isDashboard ? 'Dashboard' : isConsumer ? 'Main App' : 'None'
  });

  // Show appropriate banner based on context
  if (isDashboard) {
    return <DashboardPWABanner />;
  }

  if (isConsumer) {
    return <MainAppPWABanner />;
  }

  // Don't show banner on other pages (settings, help, etc.)
  return null;
};

export default PWAInstallRouter;
