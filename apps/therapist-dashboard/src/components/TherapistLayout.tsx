// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState } from 'react';
import { 
  Menu, X, Power, User, Calendar, DollarSign, MessageCircle, 
  Crown, Bell, FileText, Clock, CreditCard, ClipboardList, Wallet
} from 'lucide-react';

interface TherapistLayoutProps {
  children: React.ReactNode;
  therapist: any;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  language?: 'en' | 'id';
  onLanguageChange?: (lang: 'en' | 'id') => void;
}

const TherapistLayout: React.FC<TherapistLayoutProps> = ({
  children,
  therapist,
  currentPage,
  onNavigate,
  onLogout,
  language = 'id',
  onLanguageChange
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Translations for menu items
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
      'premium-upgrade': 'Upgrade Premium',
      'commission-payment': 'Payments 30%',
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
      chat: 'Chat Dukungan',
      membership: 'Keanggotaan',
      notifications: 'Notifikasi',
      calendar: 'Kalender',
      legal: 'Hukum',
      'premium-upgrade': 'Upgrade Premium',
      'custom-menu': 'Harga Menu',
      'commission-payment': 'Pembayaran 30%',
      menu: 'Menu',
      logout: 'Keluar',
    },
  };

  const labels = menuLabels[language] || menuLabels.id;

  const isPremium = therapist?.membershipTier === 'premium';
  const isPending = therapist?.premiumPaymentStatus === 'pending' && isPremium;
  const isDeclined = therapist?.premiumPaymentStatus === 'declined';
  
  // Determine premium menu label and color
  let premiumLabel = labels['premium-upgrade'];
  let premiumColor = 'text-orange-600';
  
  if (isPremium && !isPending) {
    // Fully approved premium
    premiumLabel = language === 'id' ? 'Premium Aktif' : 'Premium Active';
    premiumColor = 'text-green-600';
  } else if (isPending) {
    // Premium active but under review
    premiumLabel = language === 'id' ? 'Premium (Ditinjau)' : 'Premium (Reviewing)';
    premiumColor = 'text-green-600'; // Green because features are active
  } else if (isDeclined) {
    premiumLabel = language === 'id' ? 'Ditolak - Coba Lagi' : 'Declined - Retry';
    premiumColor = 'text-red-600';
  }
  
  const menuItems = [
    { id: 'status', label: labels.status, icon: Clock, color: 'text-green-600' },
    { id: 'schedule', label: labels.schedule, icon: Calendar, color: 'text-orange-500' },
    { id: 'dashboard', label: labels.dashboard, icon: User, color: 'text-orange-600' },
    { id: 'bookings', label: labels.bookings, icon: Calendar, color: 'text-blue-600' },
    { id: 'earnings', label: labels.earnings, icon: DollarSign, color: 'text-purple-600' },
    { id: 'payment', label: labels.payment, icon: CreditCard, color: 'text-blue-600' },
    { id: 'payment-status', label: labels['payment-status'], icon: FileText, color: 'text-teal-600' },
    { id: 'commission-payment', label: labels['commission-payment'], icon: Wallet, color: 'text-orange-500' },
    { 
      id: 'premium-upgrade', 
      label: premiumLabel, 
      icon: Crown, 
      color: premiumColor 
    },
    { id: 'custom-menu', label: labels['custom-menu'], icon: ClipboardList, color: 'text-orange-600' },
    { id: 'chat', label: labels.chat, icon: MessageCircle, color: 'text-pink-600' },
    { id: 'notifications', label: labels.notifications, icon: Bell, color: 'text-red-600' },
    { id: 'calendar', label: labels.calendar, icon: Calendar, color: 'text-indigo-600' },
    { id: 'legal', label: labels.legal, icon: FileText, color: 'text-gray-600' },
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
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">
                  {therapist?.name || 'Therapist'}
                </span>
                {therapist?.membershipTier && (
                  <span className="text-xs text-gray-500">
                  {therapist.membershipTier === 'free' || therapist.membershipTier === 'commission' ? 'Pro - Pay As You Go' : 
                   therapist.membershipTier === 'plus' || therapist.membershipTier === 'monthly' ? 'Plus - Everything For Success' : 'Pro Plan'}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Right side - Language, Membership Badge, and Burger Menu */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => onLanguageChange?.(language === 'id' ? 'en' : 'id')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
            >
              <span className="text-xl">{language === 'id' ? '🇮🇩' : '🇬🇧'}</span>
            </button>
            
            {/* Burger Menu */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
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

      {/* Sidebar */}
      <aside
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
                    <Icon className={`w-5 h-5 ${item.color} flex-shrink-0`} />
                    <span className={`text-sm font-medium ${item.id === 'premium-upgrade' && isPremium ? 'text-green-700' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-300">
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <Power className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 font-medium">{labels.logout}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>
    </div>
  );
};

export default TherapistLayout;
