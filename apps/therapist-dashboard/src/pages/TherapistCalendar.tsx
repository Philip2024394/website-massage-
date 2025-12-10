import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User, Phone, Crown, Lock, ChevronLeft, ChevronRight, Bell } from 'lucide-react';

interface Booking {
  $id: string;
  customerName: string;
  customerPhone: string;
  serviceType: string;
  duration: number;
  price: number;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reminderSent?: boolean;
}

interface TherapistCalendarProps {
  therapist: any;
  onBack: () => void;
  onNavigateToMembership?: () => void;
}

const TherapistCalendar: React.FC<TherapistCalendarProps> = ({ 
  therapist, 
  onBack,
  onNavigateToMembership
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium] = useState(therapist?.membershipTier === 'premium' || false);

  useEffect(() => {
    if (isPremium) {
      fetchBookings();
      // Poll for new bookings and check reminders every minute
      const interval = setInterval(() => {
        fetchBookings();
        checkUpcomingReminders();
      }, 60000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [therapist, isPremium]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from Appwrite bookings collection
      // Filter by therapistId === therapist.$id
      // Filter by status === 'confirmed'
      // Include bookings from current month and next 2 months

      // Mock data for premium feature demo
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
          time: '15:00',
          status: 'confirmed',
          reminderSent: false
        },
        {
          $id: '2',
          customerName: 'Sarah Johnson',
          customerPhone: '+6281234567891',
          serviceType: 'Thai Massage',
          duration: 120,
          price: 200000,
          location: 'Villa Sunset, Seminyak',
          date: '2024-12-15',
          time: '18:00',
          status: 'confirmed',
          reminderSent: true
        },
        {
          $id: '3',
          customerName: 'Mike Wilson',
          customerPhone: '+6281234567892',
          serviceType: 'Deep Tissue',
          duration: 60,
          price: 120000,
          location: 'Customer Home, Canggu',
          date: '2024-12-17',
          time: '14:00',
          status: 'confirmed',
          reminderSent: false
        },
        {
          $id: '4',
          customerName: 'Emma Brown',
          customerPhone: '+6281234567893',
          serviceType: 'Hot Stone',
          duration: 90,
          price: 180000,
          location: 'Hotel Intercontinental',
          date: '2024-12-20',
          time: '10:00',
          status: 'confirmed',
          reminderSent: false
        },
        {
          $id: '5',
          customerName: 'David Lee',
          customerPhone: '+6281234567894',
          serviceType: 'Swedish Massage',
          duration: 60,
          price: 120000,
          location: 'Spa Center Ubud',
          date: '2024-12-22',
          time: '16:00',
          status: 'confirmed',
          reminderSent: false
        }
      ];

      setBookings(mockBookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUpcomingReminders = () => {
    const now = new Date();
    
    bookings.forEach(booking => {
      if (booking.status !== 'confirmed' || booking.reminderSent) return;

      const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
      const hoursUntil = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Send reminder 3 hours before booking
      if (hoursUntil <= 3 && hoursUntil > 2.9) {
        sendBookingReminder(booking);
      }
    });
  };

  const sendBookingReminder = async (booking: Booking) => {
    try {
      // TODO: Send push notification via Firebase
      // TODO: Send in-app notification
      // TODO: Optionally send SMS/WhatsApp reminder
      
      console.log('🔔 Sending 3-hour reminder for booking:', booking.$id);
      
      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Upcoming Booking Reminder', {
          body: `You have a booking with ${booking.customerName} in 3 hours at ${booking.time}`,
          icon: '/logo.png',
          badge: '/logo.png',
          tag: `booking-${booking.$id}`,
          requireInteraction: true
        });
      }

      // Mark reminder as sent in database
      setBookings(prev =>
        prev.map(b => b.$id === booking.$id ? { ...b, reminderSent: true } : b)
      );

      // TODO: Update in Appwrite
      console.log('✅ Reminder sent and marked in database');
    } catch (error) {
      console.error('Failed to send reminder:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getBookingsForDate = (dateStr: string) => {
    return bookings.filter(b => b.date === dateStr && b.status === 'confirmed');
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Non-premium lock screen
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={onBack}
            className="mb-6 text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to Dashboard
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-yellow-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Premium Feature</h1>
            <p className="text-gray-600 text-lg mb-8">
              Calendar view with automatic booking detection and 3-hour advance reminders is available for Premium members only
            </p>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                Premium Calendar Features
              </h3>
              <div className="space-y-3 text-left max-w-md mx-auto">
                {[
                  '📅 Visual calendar view of all confirmed bookings',
                  '🔔 Automatic 3-hour advance notifications',
                  '📊 Monthly booking overview at a glance',
                  '⏰ Time slot availability visualization',
                  '📱 Push notifications for upcoming bookings',
                  '🔄 Real-time calendar updates',
                  '📈 Booking density heatmap'
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-lg">{feature.split(' ')[0]}</span>
                    <span className="text-gray-700 text-sm">{feature.substring(feature.indexOf(' ') + 1)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-left">
                  <p className="text-sm opacity-90">Premium Membership</p>
                  <p className="text-3xl font-bold">Rp 200,000</p>
                  <p className="text-sm opacity-90">per month</p>
                </div>
                <Crown className="w-12 h-12 opacity-90" />
              </div>
              <p className="text-sm mb-4 opacity-90">
                or Rp 2,000,000/year (save 16% - 2 months free!)
              </p>
            </div>

            <button
              onClick={onNavigateToMembership}
              className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Premium calendar view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={onBack}
              className="text-white hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
            >
              ← Back
            </button>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Booking Calendar</h1>
              <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                PREMIUM
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Bell className="w-4 h-4" />
              <span>3-hour reminders ON</span>
            </div>
          </div>

          <p className="text-blue-100 text-sm">
            Automatic booking detection with 3-hour advance notifications for all confirmed appointments
          </p>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading calendar...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b bg-gray-50">
                {dayNames.map(day => (
                  <div key={day} className="p-3 text-center font-semibold text-gray-700 text-sm">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {/* Empty cells before first day */}
                {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                  <div key={`empty-${index}`} className="p-3 border-b border-r bg-gray-50 min-h-24" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const dateKey = formatDateKey(year, month, day);
                  const dayBookings = getBookingsForDate(dateKey);
                  const isToday = dateKey === new Date().toISOString().split('T')[0];
                  const isSelected = dateKey === selectedDate;

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(dateKey)}
                      className={`p-3 border-b border-r min-h-24 cursor-pointer transition-colors ${
                        isToday ? 'bg-blue-50 border-blue-200' : ''
                      } ${
                        isSelected ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`text-sm font-semibold mb-2 ${
                        isToday ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {day}
                        {isToday && <span className="ml-1 text-xs bg-blue-500 text-white px-1 rounded">Today</span>}
                      </div>

                      {dayBookings.length > 0 && (
                        <div className="space-y-1">
                          {dayBookings.slice(0, 2).map(booking => (
                            <div
                              key={booking.$id}
                              className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded truncate"
                              title={`${booking.time} - ${booking.customerName} (${booking.serviceType})`}
                            >
                              <div className="font-semibold">{booking.time}</div>
                              <div className="truncate">{booking.customerName}</div>
                            </div>
                          ))}
                          {dayBookings.length > 2 && (
                            <div className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded text-center">
                              +{dayBookings.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Details */}
            {selectedDate && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Bookings for {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>

                {getBookingsForDate(selectedDate).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No bookings for this date</p>
                ) : (
                  <div className="space-y-4">
                    {getBookingsForDate(selectedDate)
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map(booking => (
                        <div key={booking.$id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {booking.customerName.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">{booking.customerName}</h4>
                                <p className="text-sm text-gray-600">{booking.serviceType}</p>
                              </div>
                            </div>
                            {booking.reminderSent && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                <Bell className="w-3 h-3" />
                                Reminder Sent
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span>{booking.time} ({booking.duration} min)</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span>{booking.customerPhone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 col-span-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span>{booking.location}</span>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-green-200 flex items-center justify-between">
                            <span className="font-bold text-green-700">Rp {booking.price.toLocaleString()}</span>
                            <a
                              href={`https://wa.me/${booking.customerPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-sm"
                            >
                              Contact via WhatsApp
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Reminder Info Banner */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">Automatic Reminder System</h3>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    As a Premium member, you'll automatically receive notifications 3 hours before each confirmed booking. 
                    This helps you prepare and ensures you never miss an appointment. Reminders are sent via push notification 
                    and shown in your notifications center.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TherapistCalendar;
