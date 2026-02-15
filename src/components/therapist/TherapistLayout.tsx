/**
 * 🔒 PRODUCTION LOCK — THERAPIST SYSTEM (ADMIN CONTROLLED)
 *
 * This file is LIVE and revenue-critical.
 * Layout, navigation, and mounting behavior are locked.
 *
 * FORBIDDEN:
 * - Changing layout structure
 * - Modifying navigation routing
 * - Changing sidebar menu structure
 * - Adding conditional redirects
 * - Modifying component lifecycle
 *
 * ALLOWED:
 * - Menu labels and translations
 * - Styling, colors, animations
 * - UI elements (badges, tooltips)
 *
 * 🔑 Admin unlock required: ADMIN_UNLOCK_THERAPIST.flag
 * Unauthorized edits cause production instability.
 */
// 🎯 AUTO-FIXED: Mobile scroll architecture violations (3 fixes)
// 🔧 FIX: Reduced sidebar header padding p-6 → p-4 for cleaner spacing
// 🔧 FIX: Optimized main content bottom padding from 80px to 60px, wrapper from 60px to 40px
/**
 * ============================================================================
 * �️ SEALED THERAPIST OPERATIONAL DASHBOARD (STOD) - TIER 1 PROTECTED
 * ============================================================================
 * 
 * This dashboard is a sealed operational surface; do not modify unless explicitly instructed by the owner.
 * 
 * 🔒 HARD LOCK: THERAPIST LAYOUT - STABLE MOUNTING & NAVIGATION
 * ============================================================================
 * Last Locked: 2026-01-28
 * Protection Level: TIER 1 - Owner-Sealed Operational Interface
 * 
 * SEALED LOGIC:
 * - Layout structure and mounting behavior
 * - Navigation routing patterns
 * - Sidebar menu structure and item order
 * - No conditional redirects on mount
 * - Stable component lifecycle (no flashing/remounting)
 * 
 * EDITABLE:
 * - Menu labels and translations
 * - Icon components
 * - Styling, colors, animations
 * - UI elements (badges, tooltips)
 * 
 * DO NOT MODIFY:
 * - useEffect hooks (push notification only - STABLE)
 * - Navigation handler logic
 * - Component mounting sequence
 * - Menu item IDs and routing paths
 * 
 * ============================================================================
 */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Menu, X, User, Calendar, DollarSign, Crown, Bell, FileText, Clock, CreditCard, ClipboardList, Wallet, Gift, Shield, LogOut, Users, BarChart, Home, Eye, Briefcase, HelpCircle, Scale, History } from 'lucide-react';
import BookingBadge from './BookingBadge';
import { useUnreadBadge } from "../../chat/hooks/useUnreadBadge";
import { useGestureSwipe } from "../../hooks/useGestureSwipe";
import { FloatingUnreadBadge } from "../../components/UnreadBadge";
import { pushNotificationsService } from '../../lib/pushNotificationsService';
import EnhancedNavigation from './EnhancedNavigation';
import FloatingActionButton from './FloatingActionButton';
import SmartBreadcrumb from './SmartBreadcrumb';
import { getTherapistSidebarPage } from '../../config/therapistSidebarConfig';
import ToastContainer from './ToastContainer';

// Alias BarChart as BarChart3 for compatibility (BarChart3 doesn't exist in lucide-react)
const BarChart3 = BarChart;

interface TherapistLayoutProps {
  children: React.ReactNode;
  therapist: any;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
  onRefresh?: () => Promise<void> | void;
  language?: string;
}

const TherapistLayout: React.FC<TherapistLayoutProps> = ({
  children,
  therapist,
  currentPage,
  onNavigate,
  onLogout,
  onRefresh,
  language = 'id' // Default to Indonesian
}) => {  // Safety check for required props
  if (!therapist) {
    console.warn('⚠️ TherapistLayout: therapist prop is missing');
  }
  if (!onNavigate) {
    console.warn('⚠️ TherapistLayout: onNavigate prop is missing');
  }
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [showEnhancedNav, setShowEnhancedNav] = useState(false);
  const [enableFloatingActions, setEnableFloatingActions] = useState(true);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(true);
  
  // Enhanced navigation preferences
  useEffect(() => {
    const prefs = localStorage.getItem('therapist_nav_enhanced_prefs');
    if (prefs) {
      try {
        const parsed = JSON.parse(prefs);
        setEnableFloatingActions(parsed.floatingActions !== false);
        setShowBreadcrumbs(parsed.breadcrumbs !== false);
      } catch (error) {
        console.error('Failed to load navigation preferences:', error);
      }
    }
  }, []);
  
  // Save navigation preferences
  const saveNavPreferences = useCallback((updates: any) => {
    const currentPrefs = {
      floatingActions: enableFloatingActions,
      breadcrumbs: showBreadcrumbs,
      ...updates
    };
    localStorage.setItem('therapist_nav_enhanced_prefs', JSON.stringify(currentPrefs));
  }, [enableFloatingActions, showBreadcrumbs]);

  // Scroll to top when therapist dashboard section changes (Bookings, Earnings, etc.)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [currentPage]);
  
  // Elite error recovery mechanism - only for critical errors
  const recoverFromError = useCallback(() => {
    setIsRecovering(true);
    // Clear any stale state
    setIsSidebarOpen(false);
    // Trigger re-render after cleanup
    setTimeout(() => {
      setHasError(false);
      setIsRecovering(false);
    }, 1000);
  }, []);
  
  // Elite error boundary effect - only catch critical errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Only trigger on critical errors, not navigation issues
      if (event.error && event.error.message && 
          !event.error.message.includes('Navigation') &&
          !event.error.message.includes('router') &&
          !event.error.message.includes('Loading chunk')) {
        console.error('🚨 TherapistLayout Critical Error:', event.error);
        setHasError(true);
      }
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Only trigger on critical promise rejections
      if (event.reason && typeof event.reason === 'object' && 
          event.reason.message &&
          !event.reason.message.includes('Navigation') &&
          !event.reason.message.includes('fetch')) {
        console.error('🚨 TherapistLayout Promise Rejection:', event.reason);
        setHasError(true);
      }
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  // Facebook-standard features
  const { totalUnread, unreadByRoom } = useUnreadBadge();
  
  // Gesture swipe for right-side drawer: swipe right = close, swipe left = open
  const { handlers: swipeHandlers } = useGestureSwipe(
    () => setIsSidebarOpen(false), // Swipe right to close
    () => setIsSidebarOpen(true),  // Swipe left to open
    undefined,
    undefined,
    { threshold: 50, direction: 'horizontal' }
  );
  
  // ============================================================================
  // 🔒 ENHANCED: ELITE VIEWPORT & NOTIFICATION MANAGEMENT
  // ============================================================================
  // Business Rule: Request push notification permission after 5 seconds
  // Enhanced: Viewport management and performance optimizations
  // ============================================================================
  useEffect(() => {
    // Elite viewport management
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    
    // Elite notification permission with user-friendly timing
    if (pushNotificationsService.isSupported() && 
        pushNotificationsService.getPermissionStatus() === 'default') {
      const timer = setTimeout(() => {
        pushNotificationsService.requestPermission();
      }, 5000);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', setViewportHeight);
        window.removeEventListener('orientationchange', setViewportHeight);
      };
    }
    
    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);

  const menuLabels = {
    en: {
      status: 'Online Status',
      schedule: 'My Schedule',
      dashboard: 'Profile Upload',
      bookings: 'Bookings',
      earnings: 'Earnings',
      payment: 'Payment Info',
      'payment-status': 'Payment History',
      chat: 'Support Chat',
      membership: 'Membership',
      notifications: 'Notifications',
      calendar: 'Calendar',
      legal: 'Legal',
      'custom-menu': 'Menu Prices',
      'commission-payment': 'Commission (30%)',
      'send-discount': 'Send Discount',
      'hotel-villa-safe-pass': 'Hotel Safe Pass',
      'more-customers': 'More Customers',
      analytics: 'Analytics',
      menu: 'Menu',
      'how-it-works': 'How It Works',
      'job-applications': 'Job Applications',
      logout: 'Logout',
    },
    id: {
      status: 'Status Online',
      schedule: 'Jadwal Saya',
      dashboard: 'Unggah Profil',
      bookings: 'Booking',
      earnings: 'Pendapatan',
      payment: 'Info Pembayaran',
      'payment-status': 'Riwayat Pembayaran',
      membership: 'Keanggotaan',
      notifications: 'Notifikasi',
      calendar: 'Kalender',
      legal: 'Hukum',
      'custom-menu': 'Harga Menu',
      'commission-payment': 'Komisi (30%)',
      'send-discount': 'Kirim Diskon',
      'hotel-villa-safe-pass': 'Hotel Safe Pass',
      'more-customers': 'Lebih Banyak Pelanggan',
      analytics: 'Analitik',
      menu: 'Menu',
      'how-it-works': 'Cara Kerja',
      'job-applications': 'Lamaran Pekerjaan',
      logout: 'Keluar',
    },
  };

  const labels = menuLabels[language] || menuLabels.id;
  
  const menuItems = [
    { id: 'status', label: labels.status, icon: Clock, color: 'text-orange-500' },
    { id: 'therapist-how-it-works', label: labels['how-it-works'], icon: HelpCircle, color: 'text-orange-500' },
    { id: 'dashboard', label: labels.dashboard, icon: User, color: 'text-orange-500' },
    { id: 'bookings', label: labels.bookings, icon: Calendar, color: 'text-orange-500' },
    { id: 'customers', label: labels['more-customers'], icon: Users, color: 'text-orange-500' },
    { id: 'send-discount', label: labels['send-discount'], icon: Gift, color: 'text-orange-500' },
    { id: 'earnings', label: labels.earnings, icon: DollarSign, color: 'text-orange-500' },
    { id: 'payment', label: labels.payment, icon: CreditCard, color: 'text-orange-500' },
    { id: 'payment-status', label: labels['payment-status'], icon: History, color: 'text-orange-500' },
    { id: 'commission-payment', label: labels['commission-payment'], icon: Wallet, color: 'text-orange-500' },
    { id: 'custom-menu', label: labels['custom-menu'], icon: ClipboardList, color: 'text-orange-500' },
    { id: 'analytics', label: labels.analytics, icon: BarChart3, color: 'text-orange-500' },
    { id: 'therapist-hotel-villa-safe-pass', label: labels['hotel-villa-safe-pass'], icon: Shield, color: 'text-orange-500' },
    { id: 'notifications', label: labels.notifications, icon: Bell, color: 'text-orange-500' },
    { id: 'job-applications', label: labels['job-applications'], icon: Briefcase, color: 'text-orange-500' },
    { id: 'legal', label: labels.legal, icon: Scale, color: 'text-orange-500' },
  ];

  // ============================================================================
  // 🔒 ENHANCED NAVIGATION HANDLER - Fixed Button Stickiness
  // ============================================================================
  // Business Rule: Navigate to page and close sidebar with debouncing
  // Impact: Controls therapist dashboard navigation flow, prevents double-clicks
  // Enhanced: Debouncing, state cleanup, proper event handling
  // ============================================================================
  const [isNavigating, setIsNavigating] = useState(false);
  
  const handleNavigate = useCallback((pageId: string) => {
    // Prevent rapid navigation calls
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    // Close sidebar and enhanced nav immediately for better UX
    setIsSidebarOpen(false);
    setShowEnhancedNav(false);
    
    // Safe lock: resolve sidebar id to canonical page (prevents landing redirect)
    const canonicalPage = getTherapistSidebarPage(pageId);
    
    requestAnimationFrame(() => {
      onNavigate(canonicalPage);
      
      setTimeout(() => {
        setIsNavigating(false);
      }, 300);
    });
  }, [isNavigating, onNavigate]);

  // Enhanced navigation toggle
  const handleEnhancedNavToggle = useCallback(() => {
    setShowEnhancedNav(prev => !prev);
    // Close regular sidebar when opening enhanced nav
    if (!showEnhancedNav) {
      setIsSidebarOpen(false);
    }
  }, [showEnhancedNav]);
  
  // Elite sidebar toggle with error resilience
  const handleSidebarToggle = useCallback((e: React.MouseEvent) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      
      // Debounce rapid clicks
      const target = e.currentTarget as HTMLElement;
      if (target.dataset.clicking === 'true') return;
      
      target.dataset.clicking = 'true';
      setTimeout(() => {
        target.dataset.clicking = 'false';
      }, 300);
      
      setIsSidebarOpen(prev => !prev);
    } catch (error) {
      console.error('🚨 Sidebar toggle error:', error);
      // Graceful fallback - ensure sidebar state is consistent
      setIsSidebarOpen(false);
    }
  }, []);

  return (
    <div 
      className="bg-white w-full max-w-full therapist-page-container"
      style={{ 
        // Block layout (no flex column): header + main stack in normal flow, no flex-grow gap
        display: 'block',
        overflow: 'visible',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      {/* Elite Header - Sticky, 60px */}
      <header 
        className="therapist-layout-header"
        style={{
          position: 'sticky',  // ✅ MODEL A: Sticky, not fixed
          top: '0',
          left: '0', 
          right: '0',
          height: '60px',
          minHeight: '60px',
          maxHeight: '60px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          zIndex: '100',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          maxWidth: '100%',
          contain: 'layout style'
        }}
      >
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '100%',
          padding: '0 16px',
          height: '100%',
          overflow: 'visible',
          minWidth: '0',
          contain: 'layout'
        }}>
          {/* Left side - Therapist Profile */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            flex: '1 1 auto',
            minWidth: '0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {therapist?.profilePicture ? (
                <img 
                  src={therapist?.profilePicture} 
                  alt={therapist?.name || 'Therapist'} 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#f97316',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <User style={{ width: '20px', height: '20px' }} />
                </div>
              )}
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  {therapist?.name || 'Therapist'}
                </div>
                {therapist?.location && (
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {therapist?.location}
                  </div>
                )}
              </div>
              
              {/* Page Title Container for Visual Presence */}
              <div style={{ 
                marginLeft: '16px',
                padding: '4px 12px',
                backgroundColor: '#f3f4f6',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '500',
                color: '#374151',
                textTransform: 'capitalize'
              }}>
                {currentPage === 'dashboard' ? 'Dashboard' : 
                 currentPage === 'status' ? 'Status' :
                 currentPage === 'bookings' ? 'Bookings' :
                 currentPage === 'calendar' ? 'Calendar' :
                 currentPage === 'chat' ? 'Messages' :
                 currentPage === 'analytics' ? 'Analytics' :
                 currentPage === 'settings' ? 'Settings' :
                 currentPage}</div>
            </div>
          </div>
          
          {/* Right side - Menu buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Enhanced Navigation Toggle */}
            <button
              onClick={handleEnhancedNavToggle}
              className={`p-2 rounded-lg transition-colors ${
                showEnhancedNav 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Enhanced Navigation"
            >
              <BarChart className="w-5 h-5" />
            </button>
            
            {/* Burger Menu - opens side drawer from right; selected when drawer open */}
            <button
              onClick={handleSidebarToggle}
              className={`burger-menu-btn relative flex items-center justify-center transition-all duration-200 ease-in-out rounded-lg
                         min-w-[56px] min-h-[56px] p-2
                         sm:min-w-[48px] sm:min-h-[48px] sm:p-2
                         lg:min-w-[44px] lg:min-h-[44px] lg:p-2
                         touch-manipulation select-none cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                         ${isSidebarOpen ? 'bg-orange-100' : 'hover:bg-gray-100 active:bg-gray-200 active:scale-95'}`}
              style={{
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
              aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isSidebarOpen}
              aria-controls="therapist-sidebar"
              role="button"
              tabIndex={0}
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6 sm:w-5 sm:h-5 text-gray-700 transition-colors" />
              ) : (
                <>
                  <Menu className="w-6 h-6 sm:w-5 sm:h-5 text-gray-700 transition-colors" />
                  {totalUnread > 0 && (
                    <FloatingUnreadBadge count={totalUnread} size="sm" />
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Enhanced Navigation Panel */}
      {showEnhancedNav && (
        <div className="fixed top-16 right-4 z-[130] max-w-sm w-full">
          <EnhancedNavigation
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onClose={() => setShowEnhancedNav(false)}
            therapistData={{
              ...therapist,
              unreadCount: totalUnread,
              pendingBookings: 2 // This would come from actual data
            }}
            className="animate-slideDown"
          />
        </div>
      )}

      {/* Breadcrumbs OFF for all browsers (no strip); content sits directly under sticky header */}
      {false && showBreadcrumbs && currentPage !== 'home' && currentPage !== 'status' && (
        <SmartBreadcrumb
          currentPage={currentPage}
          onNavigate={handleNavigate}
          therapistData={{
            ...therapist,
            unreadCount: totalUnread
          }}
          showActions={!showEnhancedNav}
          compact={false}
        />
      )}

      {/* Sidebar Overlay - Enhanced responsive behavior */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[110] transition-opacity duration-300 ease-in-out"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsSidebarOpen(false);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsSidebarOpen(false);
          }}
          style={{
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            contain: 'strict'
          }}
          aria-label="Close navigation menu"
          role="button"
          tabIndex={-1}
        />
      )}

      {/* Side drawer - 60% viewport width, therapist profile in header */}
      <aside
        {...swipeHandlers}
        id="therapist-sidebar"
        className={`fixed top-0 right-0 bg-white shadow-2xl z-[120] transform transition-transform duration-300 ease-out flex flex-col
                   w-[60%] max-w-[360px]
                   ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          pointerEvents: isSidebarOpen ? 'auto' : 'none',
          visibility: isSidebarOpen ? 'visible' : 'hidden',
          height: '100dvh',
          maxHeight: '100dvh',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          contain: 'layout style paint'
        }}
        aria-label="Therapist navigation menu"
        role="navigation"
        // ✅ ACCESSIBILITY FIX: Use inert when closed so sidebar is non-interactive (React expects boolean, not empty string)
        inert={!isSidebarOpen}
      >
        <div className="flex flex-col h-full">
          {/* Header: branding + therapist profile picture + close */}
          <div className="p-4 flex items-center justify-between gap-3 border-b border-gray-200 flex-shrink-0 bg-white">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <h2 id="therapist-drawer-title" className="font-bold text-xl shrink-0">
                <span className="text-black">Inda</span>
                <span className="text-orange-500">Street</span>
              </h2>
              {therapist?.profilePicture ? (
                <img src={therapist.profilePicture} alt={therapist?.name || 'Therapist'} className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-orange-200" />
              ) : (
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{therapist?.name || 'Therapist'}</p>
                <p className="text-xs text-gray-600 truncate">{therapist?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsSidebarOpen(false); }}
              className="rounded-full transition-all duration-200 touch-manipulation flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 min-w-[44px] min-h-[44px] w-11 h-11 shrink-0"
              aria-label="Close navigation menu"
              title="Close navigation menu"
              type="button"
              style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' } as React.CSSProperties}
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* Navigation - list design with slight orange shade on items */}
          <nav className="flex-grow p-4 overflow-y-auto" aria-label="Therapist navigation">
            <ul className="space-y-1.5 list-none m-0 p-0">
              <li>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const therapistId = therapist?.$id || therapist?.id;
                    if (therapistId) {
                      onNavigate('therapist-profile');
                      const slug = therapist?.name?.toLowerCase().replace(/\s+/g, '-') || 'therapist';
                      window.history.pushState({}, '', `/#/therapist-profile/${therapistId}-${slug}`);
                    }
                  }}
                  className="flex items-center w-full py-2.5 px-3 rounded-lg bg-orange-50/80 hover:bg-orange-100 border border-orange-200 text-orange-700 font-medium transition-colors text-left"
                  type="button"
                >
                  <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg" aria-hidden="true">
                    <Eye className="w-5 h-5 text-orange-500" />
                  </span>
                  <span className="flex-1 min-w-0 text-left text-sm pl-2">
                    {language === 'en' ? 'View My Public Profile' : 'Lihat Profil Publik Saya'}
                  </span>
                </button>
              </li>

              {menuItems.map((item) => {
                const Icon = item.icon;
                const canonicalPage = getTherapistSidebarPage(item.id);
                const isActive = currentPage === canonicalPage;
                return (
                  <li key={item.id}>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNavigate(item.id); }}
                      className={`flex items-center w-full py-2.5 px-3 rounded-lg transition-colors text-left border border-transparent ${
                        isActive
                          ? 'bg-orange-100 border-orange-200 text-orange-800'
                          : 'bg-orange-50/80 hover:bg-orange-100 border-orange-100 text-gray-700 hover:text-orange-800'
                      }`}
                      type="button"
                    >
                      <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg" aria-hidden="true">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-orange-600' : 'text-orange-500'}`} />
                      </span>
                      <span className="flex-1 min-w-0 text-left text-sm font-medium pl-2">
                        {item.label}
                      </span>
                      {item.id === 'bookings' && <BookingBadge className="ml-auto flex-shrink-0" size="sm" />}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Logout - footer */}
            {onLogout && (
              <ul className="list-none m-0 p-0 border-t border-gray-200 pt-4 mt-4 space-y-1.5">
                <li>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLogout(); }}
                    className="flex items-center w-full py-2.5 px-3 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors text-left"
                    type="button"
                  >
                    <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg" aria-hidden="true">
                      <LogOut className="w-5 h-5 text-red-600" />
                    </span>
                    <span className="flex-1 min-w-0 text-left text-sm font-medium pl-2">
                      {language === 'id' ? 'Keluar' : 'Logout'}
                    </span>
                  </button>
                </li>
              </ul>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content - block flow, no flex column */}
      <main 
        className="relative w-full therapist-layout-content" 
        style={{ 
          paddingTop: 0,
          marginTop: 0,
          paddingBottom: 'max(env(safe-area-inset-bottom, 8px), 12px)',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div 
          className="therapist-content-wrapper"
          style={{
            paddingTop: 0,
            marginTop: 0,
            paddingBottom: '6px'
          }}
        >
          {children}
        </div>
      </main>

      {/* Floating Action Button */}
      {enableFloatingActions && (
        <FloatingActionButton
          currentPage={currentPage}
          onNavigate={handleNavigate}
          therapistData={{
            ...therapist,
            pendingBookings: 2 // This would come from actual booking data
          }}
          position="bottom-right"
          size="md"
          showLabel={false}
        />
      )}

      {/* Toast notifications for success/error feedback (e.g. Download App) */}
      <ToastContainer />
    </div>
  );
};

export default TherapistLayout;
