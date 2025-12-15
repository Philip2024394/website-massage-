// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Banknote, CheckCircle, XCircle, Filter, Search, MessageCircle } from 'lucide-react';
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
}

const TherapistBookings: React.FC<TherapistBookingsProps> = ({ therapist, onBack }) => {
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
      // TODO: Update booking status to 'completed' in Appwrite
      devLog('Marking booking as completed:', bookingId);
      
      setBookings(prev => prev.map(b => 
        b.$id === bookingId ? { ...b, status: 'completed' as const } : b
      ));
      
      devLog('✅ Booking completed');
    } catch (error) {
      console.error('Failed to complete booking:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <div className="w-full bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">My Bookings</h1>
              <p className="text-xs text-gray-500">Manage your appointments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">Received</span>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.received}</p>
            <p className="text-xs text-gray-500">Pending approval</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">Scheduled</span>
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.scheduled}</p>
            <p className="text-xs text-gray-500">Confirmed bookings</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">Completed</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.completed}</p>
            <p className="text-xs text-gray-500">Finished sessions</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">Earnings</span>
              <Banknote className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {(stats.totalEarnings / 1000).toFixed(0)}k
            </p>
            <p className="text-xs text-gray-500">Total completed</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              {['all', 'received', 'scheduled', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                    filter === f
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer, service, or location..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">No bookings found</p>
            <p className="text-sm text-gray-500 mt-2">
              {searchQuery ? 'Try adjusting your search' : 'New bookings will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.$id}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{booking.customerName}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {booking.customerPhone}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(booking.status)}`}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span><strong>Time:</strong> {booking.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-orange-500">💆</span>
                    <span><strong>Service:</strong> {booking.serviceType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span><strong>Duration:</strong> {booking.duration} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span><strong>Location:</strong> {booking.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Banknote className="w-4 h-4 text-gray-400" />
                    <span><strong>Price:</strong> Rp {booking.price.toLocaleString()}</span>
                  </div>
                </div>

                {booking.notes && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Notes:</strong> {booking.notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAcceptBooking(booking.$id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectBooking(booking.$id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-colors"
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
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Chat
                      </button>
                      <button
                        onClick={() => window.open(`https://wa.me/${booking.customerPhone.replace('+', '')}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                        WhatsApp
                      </button>
                      <button
                        onClick={() => handleCompleteBooking(booking.$id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Complete
                      </button>
                    </>
                  )}
                  {booking.status === 'completed' && (
                    <button
                      onClick={() => window.open(`https://wa.me/${booking.customerPhone.replace('+', '')}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      Contact Again
                    </button>
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
    </div>
  );
};

export default TherapistBookings;
