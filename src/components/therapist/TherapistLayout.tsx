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
  Menu, X, User, Calendar, DollarSign, Crown, Bell, FileText, Clock, CreditCard, ClipboardList, Wallet, Gift, Shield, LogOut, Users, BarChart, Home} from 'lucide-react';
import BookingBadge from './BookingBadge';
import { useUnreadBadge } from "../../chat/hooks/useUnreadBadge";
import { useGestureSwipe } from "../../hooks/useGestureSwipe";
import { FloatingUnreadBadge } from "../../components/UnreadBadge";
import { pushNotificationsService } from '../../lib/pushNotificationsService';
import EnhancedNavigation from './EnhancedNavigation';
import FloatingActionButton from './FloatingActionButton';
import SmartBreadcrumb from './SmartBreadcrumb';

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
  
  // Gesture swipe to open/close drawer
  const { handlers: swipeHandlers } = useGestureSwipe(
    () => setIsSidebarOpen(false), // Swipe left to close
    () => setIsSidebarOpen(true),  // Swipe right to open
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
      dashboard: 'Profile',
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
      'commission-payment': 'Payments 30%',
      'send-discount': 'Send Discount',
      'hotel-villa-safe-pass': 'Hotel Safe Pass',
      'more-customers': 'More Customers',
      analytics: 'Analytics',
      menu: 'Menu',
      'how-it-works': 'How It Works',
      logout: 'Logout',
    },
    id: {
      status: 'Status Online',
      schedule: 'Jadwal Saya',
      dashboard: 'Profil',
      bookings: 'Booking',
      earnings: 'Pendapatan',
      payment: 'Info Pembayaran',
      'payment-status': 'Riwayat Pembayaran',
      membership: 'Keanggotaan',
      notifications: 'Notifikasi',
      calendar: 'Kalender',
      legal: 'Hukum',
      'custom-menu': 'Harga Menu',
      'commission-payment': 'Pembayaran 30%',
      'send-discount': 'Kirim Diskon',
      'hotel-villa-safe-pass': 'Hotel Safe Pass',
      'more-customers': 'Lebih Banyak Pelanggan',
      analytics: 'Analitik',
      menu: 'Menu',
      'how-it-works': 'Cara Kerja',
      logout: 'Keluar',
    },
  };

  const labels = menuLabels[language] || menuLabels.id;
  
  const menuItems = [
    { id: 'status', label: labels.status, icon: Clock, color: 'text-orange-500' },
    { id: 'therapist-how-it-works', label: labels['how-it-works'], icon: FileText, color: 'text-orange-500' },
    { id: 'dashboard', label: labels.dashboard, icon: User, color: 'text-orange-500' },
    { id: 'bookings', label: labels.bookings, icon: Calendar, color: 'text-orange-500' },
    { id: 'customers', label: labels['more-customers'], icon: Users, color: 'text-orange-500' },
    { id: 'send-discount', label: labels['send-discount'], icon: Gift, color: 'text-orange-500' },
    { id: 'earnings', label: labels.earnings, icon: DollarSign, color: 'text-orange-500' },
    { id: 'payment', label: labels.payment, icon: CreditCard, color: 'text-orange-500' },
    { id: 'payment-status', label: labels['payment-status'], icon: FileText, color: 'text-orange-500' },
    { id: 'commission-payment', label: labels['commission-payment'], icon: Wallet, color: 'text-orange-500' },
    { id: 'custom-menu', label: labels['custom-menu'], icon: ClipboardList, color: 'text-orange-500' },
    { id: 'analytics', label: labels.analytics, icon: BarChart3, color: 'text-orange-500' },
    { id: 'therapist-hotel-villa-safe-pass', label: labels['hotel-villa-safe-pass'], icon: Shield, color: 'text-orange-500' },
    { id: 'notifications', label: labels.notifications, icon: Bell, color: 'text-orange-500' },
    { id: 'legal', label: labels.legal, icon: FileText, color: 'text-orange-500' },
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
    
    // Navigate with slight delay to ensure state cleanup
    requestAnimationFrame(() => {
      onNavigate(pageId);
      
      // Reset navigation state after completion
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
        height: '100vh',
        maxHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      {/* Elite Header - Now working with forced visibility and safe area support */}
      <header 
        className="therapist-layout-header"
        style={{
          position: 'fixed',
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
            
            {/* Burger Menu - Enhanced Responsive Design */}
            <button
              onClick={handleSidebarToggle}
              className="burger-menu-btn relative flex items-center justify-center transition-all duration-200 ease-in-out rounded-lg
                         min-w-[56px] min-h-[56px] p-2
                         sm:min-w-[48px] sm:min-h-[48px] sm:p-2
                         lg:min-w-[44px] lg:min-h-[44px] lg:p-2
                         hover:bg-gray-100 active:bg-gray-200 active:scale-95
                         touch-manipulation select-none cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
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

      {/* Smart Breadcrumb Navigation */}
      {showBreadcrumbs && currentPage !== 'home' && (
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

      {/* Sidebar with gesture support - Enhanced responsive design */}
      <aside
        {...swipeHandlers}
        id="therapist-sidebar"
        className={`fixed top-0 right-0 bg-white shadow-2xl z-[120] transform transition-transform duration-300 ease-in-out
                   w-80 max-w-[90vw] sm:w-72 sm:max-w-[80vw] lg:w-80 lg:max-w-[400px]
                   ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          pointerEvents: isSidebarOpen ? 'auto' : 'none',
          visibility: isSidebarOpen ? 'visible' : 'hidden',
          height: '100vh',
          maxHeight: '100vh',
          overflowY: 'auto',
          contain: 'layout style paint'
        }}
        aria-label="Therapist navigation menu"
        role="navigation"
        aria-hidden={!isSidebarOpen}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header - Reduced padding for cleaner layout */}
          <div className="p-4 border-b border-black">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                <span className="text-black">Inda</span>
                <span className="text-orange-500">Street</span>
              </h2>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsSidebarOpen(false);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                }}
                className="sidebar-close-btn flex items-center justify-center transition-all duration-200 ease-in-out rounded-full
                           min-w-[48px] min-h-[48px] p-2
                           hover:bg-gray-100 active:bg-gray-200 active:scale-95
                           touch-manipulation cursor-pointer select-none
                           focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none',
                  touchAction: 'manipulation'
                }}
                aria-label="Close navigation menu"
                role="button"
                tabIndex={0}
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>
            
            {/* Therapist Info */}
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              {therapist?.profilePicture ? (
                <img 
                  src={therapist?.profilePicture} 
                  alt={therapist?.name || 'Therapist'} 
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-7 h-7 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {therapist?.name || 'Therapist'}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {therapist?.email || 'therapist@example.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Enhanced debounce with visual feedback
                      if (e.currentTarget?.dataset?.clicking === 'true') {
                        console.log('🚫 Click debounced for:', item.id);
                        return;
                      }
                      
                      if (e.currentTarget?.dataset) {
                        e.currentTarget.dataset.clicking = 'true';
                        
                        // Visual feedback
                        e.currentTarget.style.transform = 'scale(0.98)';
                        e.currentTarget.style.backgroundColor = isActive ? '#fed7aa' : '#fff7ed';
                        
                        setTimeout(() => {
                          if (e.currentTarget?.dataset) {
                            e.currentTarget.dataset.clicking = 'false';
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.backgroundColor = '';
                          }
                        }, 200);
                      }
                      
                      console.log('📱 Sidebar navigation click:', item.id);
                      handleNavigate(item.id);
                    }}
                    onTouchStart={(e) => {
                      // Remove preventDefault - causes passive listener warning
                      e.currentTarget.style.transform = 'scale(0.98)';
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    className={`flex items-center gap-3 w-full min-h-[48px] py-3 px-4 rounded-lg transition-all transform active:scale-98 touch-manipulation cursor-pointer select-none ${
                      isActive
                        ? 'bg-orange-500 text-white font-semibold shadow-md ring-2 ring-orange-300'
                        : 'hover:bg-orange-50 active:bg-orange-100 text-gray-700 hover:text-orange-600'
                    }`}
                    style={{
                      WebkitTapHighlightColor: 'rgba(249, 115, 22, 0.3)',
                      userSelect: 'none',
                      touchAction: 'manipulation'
                    }}
                  >
                    <div className="relative">
                      <Icon className={`w-6 h-6 flex-shrink-0 transition-colors ${
                        isActive ? 'text-white' : item.color
                      }`} />
                      
                      {/* Unread badge for chat */}
                      {item.id === 'chat' && totalUnread > 0 && (
                        <FloatingUnreadBadge count={totalUnread} size="sm" />
                      )}
                      
                      {/* Active indicator dot */}
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-300 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <span className={`text-sm font-medium flex-1 transition-colors ${
                      isActive ? 'text-white' : 'text-gray-700'
                    }`}>
                      {item.label}
                    </span>
                    
                    {/* Booking Badge for Bookings Menu Item */}
                    {item.id === 'bookings' && (
                      <BookingBadge className="ml-auto" size="sm" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Logout Button */}
          {onLogout && (
            <div className="p-4 border-t border-gray-300">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onLogout) onLogout();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                }}
                className="flex items-center gap-3 w-full py-3 px-3 rounded-lg bg-red-50 hover:bg-red-100 active:bg-red-200 transition-colors touch-manipulation cursor-pointer select-none"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none',
                  touchAction: 'manipulation'
                }}
              >
                <LogOut className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-sm font-semibold text-red-600">
                  {language === 'id' ? 'Keluar' : 'Logout'}
                </span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content - Optimized padding for cleaner layout */}
      <main 
        className="relative w-full therapist-layout-content" 
        style={{ 
          paddingBottom: 'max(env(safe-area-inset-bottom, 10px), 60px)',
          flex: '1 1 auto',
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
          WebkitOverflowScrolling: 'touch',
          marginTop: '60px'
        }}
      >
        <div 
          className="therapist-content-wrapper"
          style={{
            paddingBottom: '40px',
            minHeight: '100%'
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
    </div>
  );
};

export default TherapistLayout;
