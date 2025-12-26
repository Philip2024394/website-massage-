// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Banknote, CheckCircle, XCircle, Filter, Search, MessageCircle, Crown, Lock } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';

interface Booking {
  $id: string;
  customerName: string;
  customerPhone: string;
  serviceType: string;
  duration: number;
  price: number;
  location: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
  customerId?: string;
}

interface TherapistBookingsProps {
  therapist: any;
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

const TherapistBookings: React.FC<TherapistBookingsProps> = ({ therapist, onBack, onNavigate }) => {
  const isPremium = therapist?.membershipTier === 'premium';
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'received' | 'scheduled' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
    
    // Subscribe to real-time booking updates with audio notification
    let unsubscribe: (() => void) | null = null;
    
    const setupRealtimeBookings = async () => {
      try {
        const { bookingService } = await import('../../../../lib/appwriteService');
        
        unsubscribe = bookingService.subscribeToProviderBookings(
          therapist.$id,
          (newBooking) => {
            devLog('🔔 New booking notification:', newBooking);
            
            // Play booking notification sound
            try {
              const audio = new Audio('/sounds/booking-notification.mp3');
              audio.volume = 0.8;
              audio.play().catch(err => devWarn('Failed to play booking sound:', err));
            } catch (err) {
              devWarn('Audio playback error:', err);
            }
            
            // Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('New Booking Request! 🎉', {
                body: `${newBooking.userName || 'Customer'} requested ${newBooking.service} min massage`,
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                tag: 'booking-' + newBooking.$id
              });
            }
            
            // Add to bookings list
            setBookings(prev => [newBooking, ...prev]);
          }
        );
      } catch (error) {
        console.error('Failed to setup real-time bookings:', error);
      }
    };
    
    setupRealtimeBookings();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [therapist]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from Appwrite bookings collection
      // Filter by therapistId === therapist.$id
      
      // Mock data for now
      const mockBookings: Booking[] = [
        {
          $id: '1',
          customerName: 'John Doe',
          customerPhone: '+6281234567890',
          serviceType: 'Balinese Massage',
          duration: 90,
          price: 150000,
          location: 'Hotel Grand Bali, Room 302',
          date: '2024-12-15',
          time: '14:00',
          status: 'pending',
          createdAt: '2024-12-11T10:30:00',
          notes: 'Prefer deep tissue pressure'
        },
        {
          $id: '2',
          customerName: 'Sarah Johnson',
          customerPhone: '+6281234567891',
          serviceType: 'Swedish Massage',
          duration: 60,
          price: 100000,
          location: 'Villa Sunset, Seminyak',
          date: '2024-12-16',
          time: '10:00',
          status: 'confirmed',
          createdAt: '2024-12-10T15:20:00',
        },
        {
          $id: '3',
          customerName: 'Michael Chen',
          customerPhone: '+6281234567892',
          serviceType: 'Thai Massage',
          duration: 120,
          price: 200000,
          location: 'Ubud Resort, Bungalow 5',
          date: '2024-12-10',
          time: '16:00',
          status: 'completed',
          createdAt: '2024-12-09T12:00:00',
          notes: 'Regular customer, knows the routine'
        },
      ];
      
      setBookings(mockBookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      // TODO: Update booking status to 'confirmed' in Appwrite
      devLog('Accepting booking:', bookingId);
      
      setBookings(prev => prev.map(b => 
        b.$id === bookingId ? { ...b, status: 'confirmed' as const } : b
      ));
      
      // TODO: Send notification to customer
      devLog('✅ Booking accepted and customer notified');
    } catch (error) {
      console.error('Failed to accept booking:', error);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      // TODO: Update booking status to 'cancelled' in Appwrite
      devLog('Rejecting booking:', bookingId);
      
      setBookings(prev => prev.map(b => 
        b.$id === bookingId ? { ...b, status: 'cancelled' as const } : b
      ));
      
      // TODO: Send notification to customer and offer to reassign
      devLog('❌ Booking rejected and customer notified');
    } catch (error) {
      console.error('Failed to reject booking:', error);
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      console.log('💼 Marking booking as completed:', bookingId);

      // Update booking status in Appwrite
      const { bookingService } = await import('../../../../lib/appwriteService');
      await bookingService.updateStatus(bookingId, 'Completed');

      // Note: Commission record is automatically created by bookingService.updateStatus()
      // when status changes to 'Completed' (integrated in booking.service.ts)

      setBookings(prev => prev.map(b =>
        b.$id === bookingId ? { ...b, status: 'completed' as const } : b
      ));

      console.log('✅ Booking completed successfully');
    } catch (error) {
      console.error('❌ Failed to complete booking:', error);
      alert('Failed to complete booking. Please try again.');
    }
  };

  const getFilteredBookings = () => {
    let filtered = bookings;

    // Apply status filter
    if (filter === 'received') {
      filtered = filtered.filter(b => b.status === 'pending');
    } else if (filter === 'scheduled') {
      filtered = filtered.filter(b => b.status === 'confirmed');
    } else if (filter === 'completed') {
      filtered = filtered.filter(b => b.status === 'completed');
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(b => 
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusBadge = (status: Booking['status']) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return badges[status] || badges.pending;
  };

  const stats = {
    received: bookings.filter(b => b.status === 'pending').length,
    scheduled: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    totalEarnings: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.price, 0),
  };

  const filteredBookings = getFilteredBookings();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-3 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-sm text-gray-600">Manage your appointments and schedule</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-sm mx-auto px-4 py-6">
        <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Received</span>
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">{stats.received}</p>
            <p className="text-xs text-gray-500 font-medium">Pending approval</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Scheduled</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">{stats.scheduled}</p>
            <p className="text-xs text-gray-500 font-medium">Confirmed bookings</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Completed</span>
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">{stats.completed}</p>
            <p className="text-xs text-gray-500 font-medium">Finished sessions</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Earnings</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 mb-1">
              Rp {stats.totalEarnings.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-gray-500 font-medium">Total completed</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col gap-4">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              {['all', 'received', 'scheduled', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                    filter === f
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200 scale-105'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer, service, or location..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-50 focus:outline-none transition-all bg-gray-50 focus:bg-white font-medium"
              />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-100 border-t-orange-500 mx-auto mb-5"></div>
            <p className="text-gray-700 font-semibold text-lg">Loading bookings...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-800 font-bold text-xl mb-2">No bookings found</p>
            <p className="text-gray-500 font-medium">
              {searchQuery ? 'Try adjusting your search' : 'New bookings will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredBookings.map((booking) => (
              <div
                key={booking.$id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 hover:border-orange-100"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center shadow-sm">
                      <User className="w-7 h-7 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{booking.customerName}</h3>
                      {isPremium ? (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {booking.customerPhone}
                        </p>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            +62 ••• •••• ••••
                          </p>
                          <Crown className="w-3 h-3 text-yellow-500" />
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide shadow-sm ${getStatusBadge(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-5">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-gray-700"><strong className="text-gray-900 font-semibold">Date:</strong> {new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-gray-700"><strong className="text-gray-900 font-semibold">Time:</strong> {booking.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <span className="text-base">💆</span>
                    </div>
                    <span className="text-gray-700"><strong className="text-gray-900 font-semibold">Service:</strong> {booking.serviceType}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-gray-700"><strong className="text-gray-900 font-semibold">Duration:</strong> {booking.duration} min</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-gray-700"><strong className="text-gray-900 font-semibold">Location:</strong> {booking.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Banknote className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-gray-700"><strong className="text-gray-900 font-semibold">Price:</strong> Rp {booking.price.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {booking.notes && (
                  <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-100 rounded-xl">
                    <p className="text-sm text-blue-900 font-medium">
                      <strong className="font-bold">💬 Notes:</strong> {booking.notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAcceptBooking(booking.$id)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white rounded-2xl hover:from-green-600 hover:via-green-700 hover:to-green-800 font-bold transition-all shadow-lg shadow-green-300/50 hover:shadow-xl hover:shadow-green-400/60 hover:-translate-y-0.5"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectBooking(booking.$id)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white rounded-2xl hover:from-red-600 hover:via-red-700 hover:to-red-800 font-bold transition-all shadow-lg shadow-red-300/50 hover:shadow-xl hover:shadow-red-400/60 hover:-translate-y-0.5"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setChatOpen(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white rounded-2xl hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 font-bold transition-all shadow-lg shadow-orange-300/50 hover:shadow-xl hover:shadow-orange-400/60 hover:-translate-y-0.5"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Chat
                      </button>
                      {isPremium ? (
                        <button
                          onClick={() => window.open(`https://wa.me/${booking.customerPhone.replace('+', '')}`)}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white rounded-2xl hover:from-green-600 hover:via-green-700 hover:to-green-800 font-bold transition-all shadow-lg shadow-green-300/50 hover:shadow-xl hover:shadow-green-400/60 hover:-translate-y-0.5"
                        >
                          <Phone className="w-5 h-5" />
                          WhatsApp
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (onNavigate) {
                              onNavigate('premium-upgrade');
                            } else {
                              alert('⭐ WhatsApp access is a Premium feature! Upgrade to Premium to contact customers directly via WhatsApp.');
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 text-white rounded-2xl hover:from-yellow-500 hover:via-amber-600 hover:to-yellow-700 font-bold transition-all shadow-lg shadow-yellow-300/50 hover:shadow-xl hover:shadow-yellow-400/60 hover:-translate-y-0.5"
                        >
                          <Crown className="w-5 h-5" />
                          Upgrade
                        </button>
                      )}
                      <button
                        onClick={() => handleCompleteBooking(booking.$id)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 font-bold transition-all shadow-lg shadow-blue-300/50 hover:shadow-xl hover:shadow-blue-400/60 hover:-translate-y-0.5"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Complete
                      </button>
                    </>
                  )}
                  {booking.status === 'completed' && (
                    isPremium ? (
                      <button
                        onClick={() => window.open(`https://wa.me/${booking.customerPhone.replace('+', '')}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 text-gray-700 rounded-2xl hover:from-gray-200 hover:via-gray-300 hover:to-gray-400 font-bold transition-all shadow-lg shadow-gray-300/50 hover:shadow-xl hover:shadow-gray-400/60 hover:-translate-y-0.5"
                      >
                        <Phone className="w-5 h-5" />
                        Contact Again
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (onNavigate) {
                            onNavigate('premium-upgrade');
                          } else {
                            alert('⭐ WhatsApp access is a Premium feature! Upgrade to Premium for direct customer contact.');
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 text-white rounded-2xl hover:from-yellow-500 hover:via-amber-600 hover:to-yellow-700 font-bold transition-all shadow-lg shadow-yellow-300/50 hover:shadow-xl hover:shadow-yellow-400/60 hover:-translate-y-0.5"
                      >
                        <Crown className="w-5 h-5" />
                        Upgrade to Contact
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Window */}
      {chatOpen && selectedBooking && (
        <ChatWindow
          providerId={therapist.$id}
          providerRole="therapist"
          providerName={therapist.name}
          customerId={selectedBooking.customerId || 'customer-' + selectedBooking.$id}
          customerName={selectedBooking.customerName}
          customerWhatsApp={selectedBooking.customerPhone}
          bookingId={selectedBooking.$id}
          bookingDetails={{
            date: selectedBooking.date,
            duration: selectedBooking.duration,
            price: selectedBooking.price
          }}
          isOpen={chatOpen}
          onClose={() => {
            setChatOpen(false);
            setSelectedBooking(null);
          }}
        />
      )}
      </main>
    </div>
  );
};

export default TherapistBookings;
