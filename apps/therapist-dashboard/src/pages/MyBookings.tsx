// @ts-nocheck - Temporary fix for React 19 type incompatibility
import React, { useState, useEffect } from 'react';
import { FloatingChatWindow } from '../../../../src/chat';
import { Calendar, Clock, MapPin, User, Phone, Banknote, CheckCircle, XCircle, Filter, Search } from 'lucide-react';
import TherapistPageHeader from '../components/TherapistPageHeader';
import { BookingListSkeleton } from '../../../../src/components/LoadingSkeletons';

interface Booking {
  $id: string;
  bookingId: string;
  bookingDate: string;
  startTime: string;
  duration: number;
  customerName: string;
  service: string;
  status: string;
  source: 'platform' | 'manual';
  totalCost?: number;
  location?: string;
  customerPhone?: string;
  notes?: string;
}

interface MyBookingsProps {
  therapist: any;
  onBack: () => void;
}

const MyBookings: React.FC<MyBookingsProps> = ({ therapist, onBack }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Manual booking form state
  const [manualBooking, setManualBooking] = useState({
    bookingDate: '',
    startTime: '',
    duration: 60,
    customerName: '',
    customerPhone: '',
    service: '60',
    location: '',
    notes: '',
    totalCost: 0
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    fetchBookings();
  }, [therapist]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { databases, Query, APPWRITE_CONFIG } = await import('@lib/appwriteService');
      
      // Fetch all bookings for this therapist
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        [
          Query.equal('providerId', therapist.$id),
          Query.equal('providerType', 'therapist'),
          Query.orderDesc('bookingDate'),
          Query.limit(100)
        ]
      );

      const formattedBookings: Booking[] = response.documents.map((doc: any) => ({
        $id: doc.$id,
        bookingId: doc.bookingId,
        bookingDate: doc.bookingDate,
        startTime: doc.startTime,
        duration: doc.duration || parseInt(doc.service),
        customerName: doc.userName || doc.customerName || 'Customer',
        service: doc.service,
        status: doc.status,
        source: doc.source || 'platform',
        totalCost: doc.totalCost,
        location: doc.location,
        customerPhone: doc.customerPhone,
        notes: doc.notes
      }));

      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const checkBookingConflict = (date: string, time: string, duration: number): boolean => {
    const [hours, minutes] = time.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;

    return bookings.some(booking => {
      if (booking.bookingDate !== date) return false;
      
      const [bHours, bMinutes] = booking.startTime.split(':').map(Number);
      const bStartMinutes = bHours * 60 + bMinutes;
      const bEndMinutes = bStartMinutes + booking.duration;

      // Check for overlap
      return (startMinutes < bEndMinutes && endMinutes > bStartMinutes);
    });
  };

  const validateBookingTime = (date: string, time: string): string | null => {
    const bookingDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    if (bookingDateTime < oneHourFromNow) {
      return 'Booking must be at least 1 hour from now for preparation and travel time';
    }

    return null;
  };

  const handleAddManualBooking = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!manualBooking.bookingDate || !manualBooking.startTime || !manualBooking.customerName) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate 1-hour minimum
    const timeError = validateBookingTime(manualBooking.bookingDate, manualBooking.startTime);
    if (timeError) {
      setError(timeError);
      return;
    }

    // Check for conflicts
    if (checkBookingConflict(manualBooking.bookingDate, manualBooking.startTime, manualBooking.duration)) {
      setError('This time slot conflicts with an existing booking');
      return;
    }

    try {
      const { databases, ID, APPWRITE_CONFIG } = await import('@lib/appwriteService');

      const bookingId = ID.unique();
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        bookingId,
        {
          bookingId: bookingId,
          bookingDate: manualBooking.bookingDate,
          startTime: manualBooking.startTime,
          duration: manualBooking.duration,
          providerId: therapist.$id,
          providerType: 'therapist',
          providerName: therapist.name,
          userName: manualBooking.customerName,
          customerName: manualBooking.customerName,
          customerPhone: manualBooking.customerPhone || null,
          service: manualBooking.service,
          totalCost: manualBooking.totalCost || 0,
          location: manualBooking.location || null,
          notes: manualBooking.notes || null,
          status: 'Confirmed',
          source: 'manual',
          paymentMethod: 'Cash',
          createdAt: new Date().toISOString()
        }
      );

      setSuccess('Manual booking added successfully!');
      setShowAddModal(false);
      setManualBooking({
        bookingDate: '',
        startTime: '',
        duration: 60,
        customerName: '',
        customerPhone: '',
        service: '60',
        location: '',
        notes: '',
        totalCost: 0
      });
      fetchBookings();
    } catch (error) {
      console.error('Error adding manual booking:', error);
      setError('Failed to add booking. Please try again.');
    }
  };

  const getBookingsForDate = (date: string) => {
    return bookings
      .filter(b => b.bookingDate === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 shadow-sm';
      case 'pending': return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200 shadow-sm animate-pulse';
      case 'completed': return 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border-blue-200 shadow-sm';
      case 'cancelled': return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200 shadow-sm';
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200 shadow-sm';
    }
  };

  const dayBookings = getBookingsForDate(selectedDate);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
      <TherapistPageHeader
        title="Scheduled Orders"
        subtitle="Manage your appointments and schedule"
        onBackToStatus={onBack}
      />

      <main className="max-w-sm mx-auto px-4 py-6">
        <div className="mb-6">
          {/* Important Notice */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-orange-900 text-sm mb-1">1-Hour Preparation Time</h3>
              <p className="text-xs text-orange-800">
                All bookings require minimum 1 hour advance notice for preparation and travel. 
                Customers are automatically notified of this requirement.
              </p>
            </div>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Date Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
          <label className="block text-lg font-semibold text-gray-800 mb-3">📅 Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 text-lg font-medium shadow-sm transition-all duration-200"
            style={{
              fontSize: '18px',
              minHeight: '56px',
              touchAction: 'manipulation'
            } as React.CSSProperties}
          />
        </div>

        </div>

        {/* Add Manual Booking Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full mb-4 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add External Booking
        </button>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Bookings for {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Loading bookings...</p>
            </div>
          ) : dayBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No bookings for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayBookings.map((booking) => (
                <div
                  key={booking.$id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-900">
                        {booking.startTime} ({booking.duration} min)
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{booking.customerName}</span>
                    </div>

                    {booking.customerPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{booking.customerPhone}</span>
                      </div>
                    )}

                    {booking.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{booking.location}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Source: <span className="font-medium">{booking.source === 'platform' ? 'App Booking' : 'External'}</span>
                      </span>
                      {booking.totalCost > 0 && (
                        <span className="text-sm font-bold text-gray-900">
                          Rp {booking.totalCost.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>

                    {booking.notes && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600 italic">{booking.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Manual Booking Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Add External Booking</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setError('');
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={manualBooking.bookingDate}
                    onChange={(e) => setManualBooking({ ...manualBooking, bookingDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={manualBooking.startTime}
                    onChange={(e) => setManualBooking({ ...manualBooking, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={manualBooking.duration}
                    onChange={(e) => {
                      const duration = parseInt(e.target.value);
                      setManualBooking({ 
                        ...manualBooking, 
                        duration,
                        service: duration.toString()
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualBooking.customerName}
                    onChange={(e) => setManualBooking({ ...manualBooking, customerName: e.target.value })}
                    placeholder="Enter customer name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    value={manualBooking.customerPhone}
                    onChange={(e) => setManualBooking({ ...manualBooking, customerPhone: e.target.value })}
                    placeholder="+62 xxx xxx xxxx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={manualBooking.location}
                    onChange={(e) => setManualBooking({ ...manualBooking, location: e.target.value })}
                    placeholder="Hotel, home address, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Amount (Rp)
                  </label>
                  <input
                    type="number"
                    value={manualBooking.totalCost}
                    onChange={(e) => setManualBooking({ ...manualBooking, totalCost: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={manualBooking.notes}
                    onChange={(e) => setManualBooking({ ...manualBooking, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <button
                  onClick={handleAddManualBooking}
                  className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Add Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
    {/* Floating Chat Window */}
    <FloatingChatWindow userId={'therapist'} userName={'Therapist'} userRole="therapist" />
    </>
  );
};

export default MyBookings;


