import React, { useState, useEffect } from 'react';
import { bookingService, userService } from '../lib/appwriteService';
import { Booking, BookingStatus, LoyaltyWallet, CoinTransaction } from '../types';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getUserWallets, getTransactionHistory } from '../lib/loyaltyService';
import { X, Calendar as CalendarIcon, Wallet, CreditCard, User, Coins, Camera, Users, History } from 'lucide-react';
import { imageUploadService } from '../lib/services/imageService';
// Welcome popup disabled: no deviceTracking popup helpers needed

interface CustomerDashboardPageProps {
  customer?: any;
  user: any;
  onLogout: () => void;
  onBack: () => void;
  onBookNow: () => void;
  onNavigate?: (page: string) => void;
  t: any;
}

const CustomerDashboardPage: React.FC<CustomerDashboardPageProps> = ({
  user,
  onLogout,
  onBack,
  onBookNow,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'calendar' | 'wallet'>('bookings');
  const [previousTab, setPreviousTab] = useState<'profile' | 'bookings' | 'calendar' | 'wallet'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [wallets, setWallets] = useState<LoyaltyWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<LoyaltyWallet | null>(null);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelOtherText, setCancelOtherText] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [memberSince, setMemberSince] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    address: (user?.address as string) || '',
    whatsappNumber: (user?.whatsappNumber as string) || '',
    customerPhoto: (user?.customerPhoto as string) || ''
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Respect an initial tab request (e.g., from footer navigation)
  useEffect(() => {
    try {
      const key = 'customer_dashboard_initial_tab';
      const requested = sessionStorage.getItem(key);
      if (requested === 'profile' || requested === 'bookings' || requested === 'calendar' || requested === 'wallet') {
        setPreviousTab('bookings');
        setActiveTab(requested as 'profile' | 'bookings' | 'calendar' | 'wallet');
        sessionStorage.removeItem(key);
      }
    } catch {}
  }, []);

  // Listen for runtime tab switches (e.g., footer click while already on dashboard)
  useEffect(() => {
    const handler = (e: any) => {
      try {
        const tab = e?.detail?.tab;
        if (tab === 'profile' || tab === 'bookings' || tab === 'calendar' || tab === 'wallet') {
          setPreviousTab(activeTab);
          setActiveTab(tab);
        }
      } catch {}
    };
    window.addEventListener('customer_dashboard_set_tab', handler as EventListener);
    return () => window.removeEventListener('customer_dashboard_set_tab', handler as EventListener);
  }, [activeTab]);

  // Listen for open drawer request from footer Menu button
  useEffect(() => {
    const openDrawer = () => setIsSideDrawerOpen(true);
    window.addEventListener('customer_dashboard_open_drawer', openDrawer as EventListener);
    return () => window.removeEventListener('customer_dashboard_open_drawer', openDrawer as EventListener);
  }, []);

  // First-login profile prompt: show if critical fields are missing and not previously dismissed
  useEffect(() => {
    try {
      const seen = localStorage.getItem('profile_prompt_seen') === 'true';
      const missingName = !((profileForm.name || user?.name || '').trim());
      const missingWhatsApp = !((profileForm.whatsappNumber || '').trim());
      const missingPhoto = !((profileForm.customerPhoto || '').trim());
      if (!seen && (missingName || missingWhatsApp || missingPhoto)) {
        setShowProfilePrompt(true);
      }
    } catch {}
  }, [profileForm.name, profileForm.whatsappNumber, profileForm.customerPhoto, user?.name]);

  // Derive a friendly display name: prefer profile name; if generic 'User' or empty, derive from email; else fallback to 'Guest'
  const getDisplayName = () => {
    try {
      const raw = (profileForm.name || user?.name || '').trim();
      const isGeneric = raw.toLowerCase() === 'user';
      if (raw && !isGeneric) return raw;
      const email: string | undefined = user?.email;
      if (email && email.includes('@')) {
        const local = email.split('@')[0];
        const formatted = local
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase());
        return formatted || 'Guest';
      }
    } catch {}
    return 'Guest';
  };

  const getMembershipLabel = () => {
    const raw = (user?.membershipLevel || '').toString().trim();
    if (!raw) return 'Free Member';
    const lower = raw.toLowerCase();
    return lower.replace(/\b\w/g, (c: string) => c.toUpperCase()) + ' Member';
  };

  useEffect(() => {
    loadBookings();
    loadWallets();
  }, []);

  // Ensure user profile document exists and derive "member since" date
  useEffect(() => {
    const ensureProfileAndMemberSince = async () => {
      try {
        // Try fetch existing profile doc
        let doc = await userService.getCustomerByEmail(user.email);
        if (!doc) {
          // Create minimal doc if missing
          const uid = (user && (user.$id || (user as any).userId || user.id)) as string | undefined;
          await userService.updateCustomerByEmail(user.email, uid ? { userId: uid } : {});
          doc = await userService.getCustomerByEmail(user.email);
        }
        const created = (doc && (doc.$createdAt || doc.createdAt)) ? new Date(doc.$createdAt || doc.createdAt) : new Date();
        const label = created.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
        setMemberSince(label);
        try { localStorage.setItem(`member_since_${user.email}`, created.toISOString()); } catch {}
      } catch (e) {
        // Fallback to local storage or today
        try {
          const iso = localStorage.getItem(`member_since_${user.email}`);
          if (iso) {
            const d = new Date(iso);
            setMemberSince(d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' }));
            return;
          }
        } catch {}
        const today = new Date();
        setMemberSince(today.toLocaleDateString(undefined, { year: 'numeric', month: 'short' }));
      }
    };
    ensureProfileAndMemberSince();
  }, [user?.email]);

  // Auto-sync any locally saved profile edits when online
  useEffect(() => {
    const trySyncLocalProfile = async () => {
      try {
        const key = `customer_profile_${user.email}`;
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const pending = JSON.parse(raw);
        const uid = (user && (user.$id || (user as any).userId || user.id)) as string | undefined;
        await userService.updateCustomerByEmail(user.email, uid ? { userId: uid, ...pending } : pending);
        localStorage.removeItem(key);
        console.log('✅ Synced local profile changes to server');
      } catch (e) {
        console.warn('⚠️ Failed to sync local profile to server:', e);
      }
    };
    trySyncLocalProfile();

    // Also listen for browser coming back online to attempt immediate sync
    const handleOnline = () => {
      console.log('🌐 Online event detected, attempting profile sync');
      trySyncLocalProfile();
    };
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [user?.email]);

  // Welcome bonus popup disabled for customers

  const loadBookings = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Get all bookings for this user
      const userId = (user && (user.$id || (user as any).userId || user.id)) as string | undefined;
      if (!userId) throw new Error('Missing user id for loading bookings');
      const allBookings = await bookingService.getByUser(userId);
      
      // Sort by startTime (newest first)
      allBookings.sort((a: Booking, b: Booking) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      
      setBookings(allBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setErrorMessage('Failed to load updates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWallets = async () => {
    try {
      setErrorMessage(null);
      const userId = (user && (user.$id || (user as any).userId || user.id)) as string | undefined;
      if (!userId) throw new Error('Missing user id for loading wallets');
      const userWallets = await getUserWallets(userId);
      setWallets(userWallets);
    } catch (error) {
      console.error('Error loading wallets:', error);
      setErrorMessage('Failed to load updates. Please try again.');
    }
  };

  const loadTransactions = async (walletId: string) => {
    try {
      const txHistory = await getTransactionHistory(walletId);
      setTransactions(txHistory);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.startTime) >= new Date() && b.status !== BookingStatus.Cancelled
  );

  const pastBookings = bookings.filter(
    (b) => new Date(b.startTime) < new Date() || b.status === BookingStatus.Cancelled
  );

  const CANCELLATION_REASONS = [
    'I have changed my mind',
    'I would like to rebook another time',
    'I got delayed',
    'The Therapist is running late',
    'Important meeting',
    'Other Reason'
  ];

  const checkCancellationAllowed = (booking: Booking): { allowed: boolean; message?: string } => {
    const now = new Date();
    const start = new Date(booking.startTime);
    const createdRaw = (booking as any).createdAt || (booking as any).$createdAt || booking.startTime;
    const created = new Date(createdRaw);

    if (start.getTime() <= now.getTime()) {
      return { allowed: false, message: 'This booking has started or passed and cannot be cancelled.' };
    }

    const msToStart = start.getTime() - now.getTime();
    const msFromCreate = now.getTime() - created.getTime();
    const fiveHoursMs = 5 * 60 * 60 * 1000;
    const tenMinutesMs = 10 * 60 * 1000;

    if (msToStart >= fiveHoursMs) {
      return { allowed: true };
    }

    if (msFromCreate <= tenMinutesMs) {
      return { allowed: true };
    }

    return {
      allowed: false,
      message:
        'Cancellations must be 5 hours in advance for scheduled bookings. For Book Now, you can cancel within 10 minutes of the request.'
    };
  };

  const openCancelModal = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelReason('');
    setCancelOtherText('');
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;

    const policy = checkCancellationAllowed(bookingToCancel);
    if (!policy.allowed) {
      alert(`❌ ${policy.message}`);
      return;
    }

    const finalReason = cancelReason === 'Other Reason' ? (cancelOtherText || 'Other Reason') : cancelReason;
    if (!finalReason) {
      alert('Please select a cancellation reason.');
      return;
    }

    try {
      const id = String((bookingToCancel as any).id || (bookingToCancel as any).$id || '');
      if (!id) throw new Error('Missing booking id');
      await bookingService.cancel(id, finalReason);
      await loadBookings();
      setShowCancelModal(false);
      setBookingToCancel(null);
      alert('✅ Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('❌ Failed to cancel booking');
    }
  };

  const getBookingDates = () => {
    return bookings
      .filter((b) => b.status !== BookingStatus.Cancelled)
      .map((b) => new Date(b.startTime).toDateString());
  };

  const tileClassName = ({ date, view }: any) => {
    if (view === 'month') {
      const dateString = date.toDateString();
      if (getBookingDates().includes(dateString)) {
        return 'has-booking';
      }
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header matching HomePage style */}
      <header className="bg-white p-4 shadow-md sticky top-0 z-[9997]">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-black">Inda</span><span className="text-orange-500">Street</span>
          </h1>
          <div className="flex items-center gap-3 text-gray-600">
            <button
              onClick={() => { loadBookings(); loadWallets(); if (selectedWallet) { loadTransactions(selectedWallet.$id!); } }}
              className="p-2 hover:bg-orange-50 rounded-full transition-colors text-orange-500"
              title="Refresh"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 10-6.906 11.906" />
              </svg>
            </button>
            <button 
              onClick={() => setIsSideDrawerOpen(true)}
              className="p-2 hover:bg-orange-50 rounded-full transition-colors text-orange-500" 
              title="Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button 
              onClick={() => setShowConfirmLogout(true)}
              className="px-3 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 rounded-lg"
            >Logout</button>
          </div>
        </div>
      </header>

      {/* Error banner */}
      {errorMessage && (
        <div className="mx-4 mt-3 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 flex items-start gap-2">
          <span className="text-xl">⚠️</span>
          <div className="flex-1 text-sm">
            {errorMessage}
            <button
              onClick={() => { setErrorMessage(null); loadBookings(); loadWallets(); }}
              className="ml-2 text-red-700 underline font-semibold"
            >Try again</button>
          </div>
        </div>
      )}

      {/* Compact user summary below header */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-xl p-4 shadow flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-2xl">👤</div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{getDisplayName()}</h2>
            <p className="text-xs text-gray-500">{user.email}</p>
            {memberSince && (
              <p className="text-[11px] text-gray-400">Member since {memberSince}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-[10px] font-semibold tracking-wide">{getMembershipLabel()}</span>
              <span className="text-gray-600 text-xs">📚 {bookings.length} bookings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Side Drawer */}
      {isSideDrawerOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsSideDrawerOpen(false)}
          ></div>
          
          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl">
            {/* Drawer Header */}
            <div className="bg-orange-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                  <span className="text-xl">👤</span>
                  <span>Guest Dashboard</span>
                </h2>
                <button
                  onClick={() => setIsSideDrawerOpen(false)}
                  className="text-white hover:text-orange-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Navigation Items (extended for customer needs) */}
            <div className="p-4 space-y-2">
              {/* Book a Massage (Home) */}
              <button
                onClick={() => {
                  onNavigate?.('home');
                  setIsSideDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                Book a Massage
              </button>
              <button
                onClick={() => {
                  setActiveTab('bookings');
                  setIsSideDrawerOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'bookings' 
                    ? 'bg-orange-100 text-orange-600 border-l-4 border-orange-500' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Bookings
              </button>

              <button
                onClick={() => {
                  onNavigate?.('customerProviders');
                  setIsSideDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
              >
                <Users className="w-5 h-5" />
                Booked Providers
              </button>

              <button
                onClick={() => {
                  setActiveTab('wallet');
                  setIsSideDrawerOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'wallet' 
                    ? 'bg-orange-100 text-orange-600 border-l-4 border-orange-500' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Wallet className="w-5 h-5" />
                Wallet
              </button>

              <button
                onClick={() => {
                  setActiveTab('calendar');
                  setIsSideDrawerOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'calendar' 
                    ? 'bg-orange-100 text-orange-600 border-l-4 border-orange-500' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CalendarIcon className="w-5 h-5" />
                Calendar
              </button>

              <button
                onClick={() => {
                  setPreviousTab(activeTab);
                  setActiveTab('profile');
                  setIsSideDrawerOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-orange-100 text-orange-600 border-l-4 border-orange-500' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
                Profile
              </button>

              {/* Coin History Link */}
              <button
                onClick={() => {
                  onNavigate?.('coinHistory');
                  setIsSideDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
              >
                <History className="w-5 h-5" />
                💰 Coin History
              </button>

              {/* Reviews Page */}
              <button
                onClick={() => {
                  onNavigate?.('customerReviews');
                  setIsSideDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                Reviews
              </button>

              {/* Support Page */}
              <button
                onClick={() => {
                  onNavigate?.('customerSupport');
                  setIsSideDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 11-12.728 0M12 8v4m0 4h.01" /></svg>
                Support
              </button>

              {/* Terms & Conditions */}
              <button
                onClick={() => {
                  onNavigate?.('serviceTerms');
                  setIsSideDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c.667 0 2-.4 2-2s-1.333-2-2-2-2 .4-2 2 1.333 2 2 2zm0 2c-2.667 0-8 1.333-8 4v2h16v-2c0-2.667-5.333-4-8-4z" /></svg>
                Terms & Conditions
              </button>

              {/* Privacy Policy */}
              <button
                onClick={() => {
                  onNavigate?.('privacy');
                  setIsSideDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3V5a3 3 0 10-6 0v3c0 1.657 1.343 3 3 3zM5 21h14a2 2 0 002-2v-7H3v7a2 2 0 002 2z" /></svg>
                Privacy Policy
              </button>

              {/* Rewards Link */}
              <button
                onClick={() => {
                  onNavigate?.('coin-shop');
                  setIsSideDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
              >
                <Coins className="w-5 h-5" />
                🛍️ Rewards
              </button>

              {/* Profile Upload Link */}
              <button
                onClick={() => {
                  setPreviousTab(activeTab);
                  setActiveTab('profile');
                  setIsSideDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
              >
                <Camera className="w-5 h-5" />
                Profile Upload
              </button>

              {/* Become Agent Link */}
              <button
                onClick={() => {
                  onNavigate?.('agent-portal');
                  setIsSideDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
              >
                <Users className="w-5 h-5" />
                Become Agent
              </button>

              {/* Invite Friends (Referral) */}
              <button
                onClick={() => {
                  onNavigate?.('referral');
                  setIsSideDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Invite Friends
              </button>

              {/* Logout */}
              <button
                onClick={() => {
                  setIsSideDrawerOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0v-1" /></svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* First-login Edit Profile Prompt */}
            {showProfilePrompt && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 flex items-start gap-3">
                <div className="text-2xl leading-none">🪪</div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Complete your profile</p>
                  <p className="text-sm text-blue-700">Add your name, WhatsApp number, and a photo so therapists can reach you easily.</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        setPreviousTab(activeTab);
                        setActiveTab('profile');
                        setShowProfilePrompt(false);
                        try { localStorage.setItem('profile_prompt_seen', 'true'); } catch {}
                      }}
                      className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                    >Edit Profile Now</button>
                    <button
                      onClick={() => {
                        setShowProfilePrompt(false);
                        try { localStorage.setItem('profile_prompt_seen', 'true'); } catch {}
                      }}
                      className="px-3 py-1.5 rounded-md bg-transparent border border-blue-300 text-blue-700 text-sm hover:bg-blue-100"
                    >Maybe Later</button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Book Button */}
            <button
              onClick={onBookNow}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              ➕ Book New Appointment
            </button>

            {/* Upcoming Bookings */}
            <div>
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">⏳ Loading...</div>
              ) : upcomingBookings.length === 0 ? (
                // Hide the "Upcoming Bookings (0)" header; show only the CTA card
                <div className="bg-white rounded-xl p-8 text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-gray-600 mb-4">No upcoming bookings</p>
                  <button
                    onClick={onBookNow}
                    className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all"
                  >
                    Book Your First Massage
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    🔜 Upcoming Bookings ({upcomingBookings.length})
                  </h2>
                  <div className="space-y-3">
                    {upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white rounded-xl p-4 shadow-md border-l-4 border-orange-500"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">
                            {booking.providerName}
                          </h3>
                          <p className="text-orange-500 font-semibold">
                            {booking.service} Min Session
                          </p>
                        </div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <div>📅 {new Date(booking.startTime).toLocaleDateString()}</div>
                        <div>⏰ {new Date(booking.startTime).toLocaleTimeString()}</div>
                        <div>⏱️ {booking.service} min</div>
                        <div>🏢 {booking.providerType}</div>
                      </div>

                      <button
                        onClick={() => openCancelModal(booking)}
                        className="w-full bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-all font-semibold"
                      >
                        ❌ Cancel Booking
                      </button>
                    </div>
                  ))}
                  </div>
                </>
              )}
            </div>

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  📜 Past Bookings ({pastBookings.length})
                </h2>
                <div className="space-y-3">
                  {pastBookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-gray-300 opacity-75"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {booking.providerName}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {booking.service} Min Session
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === BookingStatus.Cancelled
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        📅 {new Date(booking.startTime).toLocaleDateString()} • ⏰ {new Date(booking.startTime).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            {/* Total Coins Summary */}
            <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm font-semibold">Total Loyalty Coins</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">{wallets.reduce((sum, w) => sum + w.totalCoins, 0)}</span>
                    <span className="text-2xl">🪙</span>
                  </div>
                </div>
                <div className="text-6xl opacity-80">👛</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/20 rounded-lg p-2">
                  <p className="text-white/70">Active Wallets</p>
                  <p className="text-xl font-bold">{wallets.length}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-2">
                  <p className="text-white/70">Total Earned</p>
                  <p className="text-xl font-bold">{wallets.reduce((sum, w) => sum + w.coinsEarned, 0)}</p>
                </div>
              </div>
            </div>

            {/* Rewards & Coin Navigation Buttons */}
            {onNavigate && (
              <div className="space-y-3">
                {/* Rewards Button */}
                <button
                  onClick={() => onNavigate('coin-shop')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-md hover:shadow-lg transition-all text-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                      🛍️
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold">Rewards</h3>
                      <p className="text-sm text-purple-100">Spend coins on rewards</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Coin History Button */}
                <button
                  onClick={() => onNavigate('coinHistory')}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-orange-200 hover:border-orange-400"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl">
                      📊
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-900">Coin History</h3>
                      <p className="text-sm text-gray-600">View transactions & expiration</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

              </div>
            )}

            {/* Loyalty Info */}
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">ℹ️</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-1">How It Works</h3>
                  <p className="text-blue-800 text-sm">
                    Earn 5 coins per completed booking. After 3 visits, unlock 5% discount with each provider. 
                    Keep booking to reach higher tiers: 5 visits = 10% off, 10 visits = 15% off, 20 visits = 20% off!
                  </p>
                </div>
              </div>
            </div>

            {/* Provider Wallets */}
            {wallets.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">🪙</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Coins Yet</h3>
                <p className="text-gray-600 mb-4">Book your first massage to start earning loyalty coins!</p>
                <button
                  onClick={onBookNow}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all"
                >
                  Book Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Your Loyalty Wallets ({wallets.length})
                </h2>
                {wallets.map((wallet) => {
                  const tierNames = ['None', 'Bronze 🥉', 'Silver 🥈', 'Gold 🥇', 'Platinum 👑'];
                  const tierBgColors = ['bg-gray-100', 'bg-orange-100', 'bg-gray-200', 'bg-yellow-100', 'bg-purple-100'];
                  const tierTextColors = ['text-gray-700', 'text-orange-700', 'text-gray-700', 'text-yellow-700', 'text-purple-700'];
                  
                  const nextTier = wallet.currentTier < 4 ? wallet.currentTier + 1 : 4;
                  const nextTierVisits = [3, 5, 10, 20][nextTier - 1] || 20;
                  const progress = wallet.currentTier === 4 ? 100 : (wallet.totalVisits / nextTierVisits) * 100;

                  return (
                    <div
                      key={wallet.$id}
                      className="bg-white rounded-xl p-5 shadow-md border-2 border-orange-100 hover:border-orange-300 transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedWallet(wallet);
                        loadTransactions(wallet.$id!);
                      }}
                    >
                      {/* Provider Info */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {wallet.providerName}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`${tierBgColors[wallet.currentTier]} ${tierTextColors[wallet.currentTier]} px-3 py-1 rounded-full text-xs font-bold`}>
                              {tierNames[wallet.currentTier]}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {wallet.providerCoinId}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-orange-600">{wallet.totalCoins}</div>
                          <div className="text-gray-500 text-xs">coins</div>
                        </div>
                      </div>

                      {/* Current Discount */}
                      {wallet.currentDiscount > 0 && (
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-white/80">Your Discount</p>
                              <p className="text-2xl font-bold">{wallet.currentDiscount}% OFF</p>
                            </div>
                            <div className="text-3xl">🎉</div>
                          </div>
                          <p className="text-xs text-white/90 mt-1">
                            Auto-applied on your next booking
                          </p>
                        </div>
                      )}

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-500">Visits</div>
                          <div className="text-lg font-bold text-gray-900">{wallet.totalVisits}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-500">Earned</div>
                          <div className="text-lg font-bold text-green-600">{wallet.coinsEarned}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-500">Used</div>
                          <div className="text-lg font-bold text-orange-600">{wallet.coinsRedeemed}</div>
                        </div>
                      </div>

                      {/* Streak Bonus */}
                      {wallet.streak >= 3 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-xl">🔥</span>
                            <span className="font-semibold text-red-700">
                              {wallet.streak} Booking Streak! Keep it up!
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Progress to Next Tier */}
                      {wallet.currentTier < 4 && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Next: {tierNames[nextTier]}</span>
                            <span className="text-gray-900 font-semibold">
                              {wallet.totalVisits}/{nextTierVisits} visits
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Last Visit */}
                      {wallet.lastVisitDate && (
                        <div className="mt-3 text-xs text-gray-500 border-t pt-2">
                          Last visit: {new Date(wallet.lastVisitDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Transaction History Modal */}
            {selectedWallet && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedWallet(null)}>
                <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedWallet.providerName}</h3>
                      <p className="text-sm text-gray-500">{selectedWallet.providerCoinId}</p>
                    </div>
                    <button onClick={() => setSelectedWallet(null)} className="text-2xl text-gray-400 hover:text-gray-600">
                      ✕
                    </button>
                  </div>

                  <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl p-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-700 mb-1">Current Balance</p>
                      <p className="text-4xl font-bold text-orange-600">{selectedWallet.totalCoins} 🪙</p>
                    </div>
                  </div>

                  <h4 className="font-bold text-gray-900 mb-3">Recent Transactions</h4>
                  {transactions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No transactions yet</p>
                  ) : (
                    <div className="space-y-2">
                      {transactions.map((tx) => (
                        <div key={tx.$id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-start gap-2">
                              <span className="text-xl">
                                {tx.type === 'earned' ? '➕' : tx.type === 'redeemed' ? '🎁' : tx.type === 'decayed' ? '⏰' : '🎉'}
                              </span>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{tx.reason}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(tx.createdAt!).toLocaleDateString()} • {new Date(tx.createdAt!).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {tx.amount > 0 ? '+' : ''}{tx.amount}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 flex justify-between">
                            <span>Balance: {tx.balanceBefore} → {tx.balanceAfter}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div>
            <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
              <style>{`
                .react-calendar {
                  width: 100%;
                  border: none;
                  font-family: inherit;
                }
                .react-calendar__tile--active {
                  background: #f97316 !important;
                }
                .has-booking {
                  background: #fed7aa !important;
                  font-weight: bold;
                  color: #c2410c !important;
                }
              `}</style>
              <Calendar
                value={selectedDate}
                onChange={(value: any) => setSelectedDate(value)}
                tileClassName={tileClassName}
              />
            </div>

            <div className="bg-orange-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-2">Legend:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-orange-200 rounded"></div>
                  <span>= Booking scheduled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-orange-500 rounded"></div>
                  <span>= Selected date</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab - Editable */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Page Header - Same as Hotel Dashboard */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
                <p className="text-xs text-gray-500">Your personal information and statistics</p>
              </div>
            </div>

            {/* Personal Information Section */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Full Name
              </label>
              <input
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-base font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Address
              </label>
              <input
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                value={user.email}
                disabled
                readOnly
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                WhatsApp Number
              </label>
              <input
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                value={profileForm.whatsappNumber}
                onChange={(e) => setProfileForm({ ...profileForm, whatsappNumber: e.target.value })}
                placeholder="e.g. +62 812-3456-7890"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Member Since
              </label>
              <input 
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50" 
                value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                disabled
                readOnly
              />
            </div>

            {/* Address */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-3.333 0-10 1.667-10 5v3h20v-3c0-3.333-6.667-5-10-5z"/></svg>
                Address
              </label>
              <input
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                placeholder="Your address"
              />
            </div>

            {/* Profile Photo Upload */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h4l2-3h6l2 3h4v12H3z"/></svg>
                Profile Photo
              </label>
              {profileForm.customerPhoto ? (
                <div className="flex items-center gap-3 mb-2">
                  <img src={profileForm.customerPhoto} alt="Profile" className="w-16 h-16 rounded-full object-cover border" />
                  <button
                    className="px-3 py-2 text-sm bg-gray-100 rounded-lg border hover:bg-gray-200"
                    onClick={() => setProfileForm({ ...profileForm, customerPhoto: '' })}
                  >
                    Remove
                  </button>
                </div>
              ) : null}
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = async () => {
                    try {
                      const base64 = reader.result as string;
                      const url = await imageUploadService.uploadProfileImage(base64);
                      setProfileForm((p) => ({ ...p, customerPhoto: url }));
                    } catch (err) {
                      alert('Failed to upload image');
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                disabled={isSavingProfile}
                onClick={async () => {
                  setIsSavingProfile(true);
                  try {
                    const uid = (user && (user.$id || (user as any).userId || user.id)) as string | undefined;
                    await userService.updateCustomerByEmail(user.email, {
                      ...(uid ? { userId: uid } : {}),
                      name: profileForm.name,
                      address: profileForm.address,
                      whatsappNumber: profileForm.whatsappNumber,
                      customerPhoto: profileForm.customerPhoto
                    });
                    alert('Profile saved');
                  } catch (e) {
                    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
                    // Persist locally as fallback if offline or server error
                    try {
                      localStorage.setItem(
                        `customer_profile_${user.email}`,
                        JSON.stringify(profileForm)
                      );
                      if (isOffline) {
                        alert('You are offline. Changes saved locally and will sync when connection returns.');
                      } else {
                        // Provide more diagnostic info for logged-in users
                        const msg = (e && (e as any).message) ? (e as any).message : 'Unknown error';
                        alert('Server update failed. Changes saved locally and will retry when online.\nDetails: ' + msg);
                      }
                    } catch (storageErr) {
                      console.warn('Failed to persist local profile backup:', storageErr);
                      alert('Failed to save profile: ' + ((storageErr as any)?.message || 'Unknown storage error'));
                    }
                  } finally {
                    setIsSavingProfile(false);
                    try { localStorage.setItem('profile_prompt_seen', 'true'); } catch {}
                    setShowProfilePrompt(false);
                    setActiveTab(previousTab);
                  }
                }}
                className={`px-6 py-3 rounded-lg font-semibold text-white ${isSavingProfile ? 'bg-orange-300' : 'bg-orange-500 hover:bg-orange-600'} shadow`}
              >
                {isSavingProfile ? 'Saving…' : 'Save Profile'}
              </button>
            </div>

            {/* Statistics Section - Same as Hotel Dashboard */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Account Statistics</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your booking activity overview
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 rounded-xl p-4 text-center border-2 border-orange-100">
                  <div className="text-3xl font-bold text-orange-500 mb-1">
                    {bookings.length}
                  </div>
                  <div className="text-gray-700 text-sm font-medium">Total Bookings</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center border-2 border-green-100">
                  <div className="text-3xl font-bold text-green-500 mb-1">
                    {upcomingBookings.length}
                  </div>
                  <div className="text-gray-700 text-sm font-medium">Upcoming</div>
                </div>
              </div>
            </div>

            {/* Logout Button - Same styling as Hotel Dashboard */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowConfirmLogout(true)}
                className="bg-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showConfirmLogout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">👋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Logout Confirmation
              </h3>
              <p className="text-gray-600">
                Are you sure you want to logout?
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onLogout}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && bookingToCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Booking</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please select a reason to cancel. Policy: 5 hours in advance for scheduled bookings; Book Now can be cancelled within 10 minutes of request.
            </p>

            <div className="space-y-2 mb-3">
              {CANCELLATION_REASONS.map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="cancel-reason"
                    value={r}
                    checked={cancelReason === r}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            {cancelReason === 'Other Reason' && (
              <input
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 mb-4"
                placeholder="Enter reason..."
                value={cancelOtherText}
                onChange={(e) => setCancelOtherText(e.target.value)}
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setBookingToCancel(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Close
              </button>
              <button
                onClick={confirmCancelBooking}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-all"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome bonus celebration removed */}
    </div>
  );
};

export default CustomerDashboardPage;
