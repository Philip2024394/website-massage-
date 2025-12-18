// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState } from 'react';
import { 
  Menu, X, Power, User, Calendar, DollarSign, MessageCircle, 
  Crown, Bell, FileText, Clock, CreditCard
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
      menu: 'Menu',
      logout: 'Logout',
    },
    id: {
      status: 'Status Online',
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
      menu: 'Menu',
      logout: 'Keluar',
    },
  };

  const labels = menuLabels[language] || menuLabels.id;

  const menuItems = [
    { id: 'status', label: labels.status, icon: Clock, color: 'text-green-600' },
    { id: 'dashboard', label: labels.dashboard, icon: User, color: 'text-orange-600' },
    { id: 'bookings', label: labels.bookings, icon: Calendar, color: 'text-blue-600' },
    { id: 'earnings', label: labels.earnings, icon: DollarSign, color: 'text-purple-600' },
    { id: 'payment', label: labels.payment, icon: CreditCard, color: 'text-blue-600' },
    { id: 'payment-status', label: labels['payment-status'], icon: FileText, color: 'text-teal-600' },
    { id: 'chat', label: labels.chat, icon: MessageCircle, color: 'text-pink-600' },
    { id: 'membership', label: labels.membership, icon: Crown, color: 'text-yellow-600' },
    { id: 'packages', label: language === 'id' ? 'Paket Membership' : 'Membership Packages', icon: Crown, color: 'text-amber-600' },
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
          <div className="flex items-center gap-3">
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
            <h1 className="text-xl font-bold text-gray-900">
              {menuItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => onLanguageChange?.(language === 'id' ? 'en' : 'id')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
            >
              <span className="text-xl">{language === 'id' ? '🇮🇩' : '🇬🇧'}</span>
            </button>
            {therapist?.membershipTier === 'premium' && (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-lg">
                <Crown className="w-4 h-4 text-yellow-600" />
                <span className="text-xs font-semibold text-yellow-700">Premium</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                {therapist?.name || 'Therapist'}
              </span>
            </div>
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
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">{labels.menu}</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* Therapist Info */}
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-white" />
              </div>
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
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-orange-100 text-orange-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-orange-600' : item.color}`} />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <Power className="w-5 h-5" />
              <span className="text-sm font-medium">{labels.logout}</span>
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
