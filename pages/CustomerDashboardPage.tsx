import React, { useState, useEffect } from 'react';
import { bookingService } from '../lib/appwriteService';
import { Booking, BookingStatus, LoyaltyWallet, CoinTransaction } from '../types';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getUserWallets, getTransactionHistory } from '../lib/loyaltyService';
import { X, Calendar as CalendarIcon, Wallet, CreditCard, User, Coins, Camera, Users, History } from 'lucide-react';

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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [wallets, setWallets] = useState<LoyaltyWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<LoyaltyWallet | null>(null);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);

  useEffect(() => {
    loadBookings();
    loadWallets();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      // Get all bookings for this user
      const allBookings = await bookingService.getByUser(user.$id || user.userId);
      
      // Sort by startTime (newest first)
      allBookings.sort((a: Booking, b: Booking) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      
      setBookings(allBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWallets = async () => {
    try {
      const userWallets = await getUserWallets(user.$id || user.userId);
      setWallets(userWallets);
    } catch (error) {
      console.error('Error loading wallets:', error);
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

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingService.delete(String(bookingId));
      await loadBookings();
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
      {/* Header with Burger Menu */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 shadow-lg sticky top-0 z-30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSideDrawerOpen(true)}
              className="p-2 text-white hover:text-orange-200 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button onClick={onBack} className="text-white text-2xl">
              ←
            </button>
          </div>
          <button
            onClick={() => setShowConfirmLogout(true)}
            className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-all"
          >
            Logout
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-full p-4 text-4xl">
            👤
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-orange-100">{user.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                {user.membershipLevel?.toUpperCase() || 'FREE'} MEMBER
              </span>
              <span className="text-orange-100 text-sm">
                📚 {bookings.length} Total Bookings
              </span>
            </div>
          </div>
        </div>
      </header>

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
                <h2 className="text-white text-lg font-semibold">Customer Dashboard</h2>
                <button
                  onClick={() => setIsSideDrawerOpen(false)}
                  className="text-white hover:text-orange-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="p-4 space-y-2">
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
                  onNavigate?.('coin-history');
                  setIsSideDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
              >
                <History className="w-5 h-5" />
                💰 Coin History
              </button>

              {/* Coin Shop Link */}
              <button
                onClick={() => {
                  onNavigate?.('coin-shop');
                  setIsSideDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
              >
                <Coins className="w-5 h-5" />
                🛍️ Coin Shop
              </button>

              {/* Profile Upload Link */}
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setIsSideDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
              >
                <Camera className="w-5 h-5" />
                Upload Photo
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
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Quick Book Button */}
            <button
              onClick={onBookNow}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              ➕ Book New Appointment
            </button>

            {/* Upcoming Bookings */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                🔜 Upcoming Bookings ({upcomingBookings.length})
              </h2>
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">⏳ Loading...</div>
              ) : upcomingBookings.length === 0 ? (
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
                        onClick={() => handleCancelBooking(booking.id)}
                        className="w-full bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-all font-semibold"
                      >
                        ❌ Cancel Booking
                      </button>
                    </div>
                  ))}
                </div>
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

            {/* Coin Navigation Buttons */}
            {onNavigate && (
              <div className="space-y-3">
                {/* Coin Shop Button */}
                <button
                  onClick={() => onNavigate('coin-shop')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-md hover:shadow-lg transition-all text-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                      🛍️
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold">Coin Shop</h3>
                      <p className="text-sm text-purple-100">Spend coins on rewards</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Coin History Button */}
                <button
                  onClick={() => onNavigate('coin-history')}
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

        {/* Profile Tab - SAME DESIGN AS HOTEL DASHBOARD */}
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

            {/* Personal Information Section - Same layout as Hotel Dashboard */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Full Name
              </label>
              <input 
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-base font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50" 
                value={user.name}
                disabled
                readOnly
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
                Phone Number
              </label>
              <input 
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50" 
                value={user.phone || 'Not provided'}
                disabled
                readOnly
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
    </div>
  );
};

export default CustomerDashboardPage;
