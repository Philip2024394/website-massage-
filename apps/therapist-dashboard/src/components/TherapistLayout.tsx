import React, { useState, useEffect } from 'react';
import { 
  Menu, X, User, Calendar, DollarSign, 
  Crown, Bell, FileText, Clock, CreditCard, ClipboardList, Wallet, Gift, Shield, LogOut
} from 'lucide-react';
import BookingBadge from './BookingBadge';
import { useUnreadBadge } from '../../../../chat/hooks/useUnreadBadge';
import { useGestureSwipe } from '../../../../hooks/useGestureSwipe';
import { FloatingUnreadBadge } from '../../../../components/UnreadBadge';
import { pushNotificationsService } from '../../../../lib/pushNotificationsService';
import PullToRefresh from '../../../../components/PullToRefresh';

interface TherapistLayoutProps {
  children: React.ReactNode;
  therapist: any;
  currentPage: string;
  onNavigate: (page: string) => void;
  language?: 'en' | 'id';
  onLanguageChange?: (lang: 'en' | 'id') => void;
  onLogout?: () => void;
  onRefresh?: () => Promise<void> | void;
}

const TherapistLayout: React.FC<TherapistLayoutProps> = ({
  children,
  therapist,
  currentPage,
  onNavigate,
  language = 'id',
  onLanguageChange,
  onLogout,
  onRefresh
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
  
  // Request push notification permission on mount
  useEffect(() => {
    if (pushNotificationsService.isSupported() && 
        pushNotificationsService.getPermissionStatus() === 'default') {
      // Show a friendly prompt after 5 seconds
      const timer = setTimeout(() => {
        pushNotificationsService.requestPermission();
      }, 5000);
      return () => clearTimeout(timer);
    }
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
      menu: 'Menu',
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
      menu: 'Menu',
      logout: 'Keluar',
    },
  };

  const labels = menuLabels[language] || menuLabels.id;
  
  const menuItems = [
    { id: 'status', label: labels.status, icon: Clock, color: 'text-orange-500' },
    { id: 'dashboard', label: labels.dashboard, icon: User, color: 'text-orange-500' },
    { id: 'bookings', label: labels.bookings, icon: Calendar, color: 'text-orange-500' },
    { id: 'send-discount', label: labels['send-discount'], icon: Gift, color: 'text-orange-500' },
    { id: 'earnings', label: labels.earnings, icon: DollarSign, color: 'text-orange-500' },
    { id: 'payment', label: labels.payment, icon: CreditCard, color: 'text-orange-500' },
    { id: 'payment-status', label: labels['payment-status'], icon: FileText, color: 'text-orange-500' },
    { id: 'commission-payment', label: labels['commission-payment'], icon: Wallet, color: 'text-orange-500' },
    { id: 'custom-menu', label: labels['custom-menu'], icon: ClipboardList, color: 'text-orange-500' },
    { id: 'hotel-villa-safe-pass', label: labels['hotel-villa-safe-pass'], icon: Shield, color: 'text-orange-500' },
    { id: 'notifications', label: labels.notifications, icon: Bell, color: 'text-orange-500' },
    { id: 'legal', label: labels.legal, icon: FileText, color: 'text-orange-500' },
  ];

  const handleNavigate = (pageId: string) => {
    onNavigate(pageId);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar with Burger Menu */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side - Therapist Profile Name */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {therapist?.profilePicture ? (
                <img 
                  src={therapist.profilePicture} 
                  alt={therapist?.name || 'Therapist'} 
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center"><svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg></div>`;
                    }
                  }}
                />
              ) : (
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">
                  {therapist?.name || 'Therapist'}
                </span>
                {therapist?.location && (
                  <span className="text-xs text-gray-500">
                    {therapist.location}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Right side - Language and Burger Menu */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => onLanguageChange?.(language === 'id' ? 'en' : 'id')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
            >
              <span className="text-xl">{language === 'id' ? '🇮🇩' : '🇬🇧'}</span>
            </button>
            
            {/* Burger Menu with unread indicator */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <>
                  <Menu className="w-6 h-6 text-gray-700" />
                  {totalUnread > 0 && (
                    <FloatingUnreadBadge count={totalUnread} size="sm" />
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar with gesture support */}
      <aside
        {...swipeHandlers}
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-black">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                <span className="text-black">Inda</span>
                <span className="text-orange-500">Street</span>
              </h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-black" />
              </button>
            </div>
            
            {/* Therapist Info */}
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              {therapist?.profilePicture ? (
                <img 
                  src={therapist.profilePicture} 
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
                    onClick={() => handleNavigate(item.id)}
                    className={`flex items-center gap-3 w-full py-2 px-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-orange-100 font-semibold'
                        : 'hover:bg-orange-50'
                    }`}
                  >
                    <div className="relative">
                      <Icon className={`w-5 h-5 ${item.color} flex-shrink-0`} />
                      
                      {/* Unread badge for chat */}
                      {item.id === 'chat' && totalUnread > 0 && (
                        <FloatingUnreadBadge count={totalUnread} size="sm" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
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
                onClick={() => {
                  if (confirm(language === 'id' ? 'Yakin ingin keluar?' : 'Are you sure you want to logout?')) {
                    onLogout();
                  }
                }}
                className="flex items-center gap-3 w-full py-3 px-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
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

      {/* Main Content */}
      <main className="relative">
        <PullToRefresh 
          onRefresh={async () => {
            console.log('🔄 Dashboard refresh triggered');
            
            if (onRefresh) {
              await onRefresh();
            } else {
              // Default dashboard refresh
              window.dispatchEvent(new CustomEvent('refresh-dashboard', {
                detail: { 
                  page: currentPage,
                  therapistId: therapist?.$id,
                  timestamp: Date.now()
                }
              }));
              
              // Provide haptic feedback
              if ('navigator' in window && 'vibrate' in navigator) {
                navigator.vibrate(50);
              }
              
              // Wait for visual feedback
              await new Promise(resolve => setTimeout(resolve, 800));
            }
          }}
          className="min-h-screen"
        >
          {children}
        </PullToRefresh>
      </main>
    </div>
  );
};

export default TherapistLayout;
