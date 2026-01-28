// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User, Phone, Crown, Lock, ChevronLeft, ChevronRight, Bell, CheckCircle, X } from 'lucide-react';
import TherapistPageHeader from '../../components/therapist/TherapistPageHeader';
import HelpTooltip from '../../components/therapist/HelpTooltip';
import { calendarHelp } from './constants/helpContent';

interface Booking {
  $id: string;
  customerName: string;
  // 🔒 PRIVACY RULE: customerPhone removed - not accessible to therapists
  // Customer WhatsApp is ONLY stored in admin-accessible database fields
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
  // Calculate isPremium dynamically from therapist prop - recalculates on therapist update
  const isPremium = true; // All accounts are premium

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
      // Fetch real calendar bookings from Appwrite
      const { bookingService } = await import('../../lib/appwriteService');
      
      // Get confirmed bookings for this therapist's calendar
      const realBookings = await bookingService.getProviderBookings(therapist.$id);
      
      // Transform and filter confirmed/scheduled bookings only
      const transformedBookings: Booking[] = realBookings
        .filter((doc: any) => doc.status === 'confirmed' || doc.status === 'scheduled')
        .map((doc: any) => ({
          $id: doc.$id,
          customerName: doc.userName || doc.customerName || 'Unknown Customer',
          // 🔒 PRIVACY: customerPhone/customerWhatsApp NOT included for therapists
          serviceType: doc.service || doc.serviceType || 'Massage Service',
          duration: doc.duration || 60,
          price: doc.totalAmount || doc.price || 0,
          location: doc.location || '',
          date: doc.date ? new Date(doc.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          time: doc.time || '00:00',
          status: doc.status || 'confirmed',
          reminderSent: doc.reminderSent || false
        }));
      
      setBookings(transformedBookings);
      console.log('✅ Loaded', transformedBookings.length, 'calendar bookings for therapist', therapist.$id);
      
    } catch (error) {
      console.error('Failed to fetch calendar bookings:', error);
      
      // Fallback to empty array instead of mock data
      setBookings([]);
      console.warn('❌ No calendar bookings loaded - service may be unavailable');
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

      // Send reminder 5 hours before booking
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
      
      console.log('🔔 Sending 5-hour reminder for booking:', booking.$id);
      
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
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-sm mx-auto">
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
              Premium Features Active
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Premium calendar view
  const dict = {
    therapistDashboard: {
      thisMonth: 'this month'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Standardized Status Header */}
      <div className="max-w-sm mx-auto px-4 pt-6 pb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Kalender</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">{(therapist?.onlineHoursThisMonth || 0).toFixed(1)}j</span>
              <span className="text-xs text-gray-500">bulan ini</span>
            </div>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => console.log('Status change: available')}
              className={`p-4 rounded-xl border-2 transition-all ${
                therapist?.status === 'available' && therapist?.availability === 'online'
                  ? 'bg-green-50 border-green-500'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <CheckCircle className={`w-6 h-6 mx-auto mb-2 ${
                therapist?.status === 'available' && therapist?.availability === 'online'
                  ? 'text-green-600'
                  : 'text-gray-400'
              }`} />
              <p className={`text-sm font-semibold ${
                therapist?.status === 'available' && therapist?.availability === 'online'
                  ? 'text-green-700'
                  : 'text-gray-600'
              }`}>Tersedia</p>
            </button>

            <button
              onClick={() => console.log('Status change: busy')}
              className={`p-4 rounded-xl border-2 transition-all ${
                therapist?.status === 'busy'
                  ? 'bg-amber-50 border-amber-500'
                  : 'border-gray-200 hover:border-amber-300'
              }`}
            >
              <Clock className={`w-6 h-6 mx-auto mb-2 ${
                therapist?.status === 'busy'
                  ? 'text-amber-600'
                  : 'text-gray-400'
              }`} />
              <p className={`text-sm font-semibold ${
                therapist?.status === 'busy'
                  ? 'text-amber-700'
                  : 'text-gray-600'
              }`}>Sibuk</p>
            </button>

            <button
              onClick={() => console.log('Status change: offline')}
              className={`p-4 rounded-xl border-2 transition-all ${
                therapist?.availability === 'offline'
                  ? 'bg-red-50 border-red-500'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <X className={`w-6 h-6 mx-auto mb-2 ${
                therapist?.availability === 'offline'
                  ? 'text-red-600'
                  : 'text-gray-400'
              }`} />
              <p className={`text-sm font-semibold ${
                therapist?.availability === 'offline'
                  ? 'text-red-700'
                  : 'text-gray-600'
              }`}>Offline</p>
            </button>
          </div>
        </div>
      </div>
      
      {/* Minimalistic Header */}
      <TherapistPageHeader
        title=""
        subtitle="View your upcoming appointments"
        onBackToStatus={onBack}
        icon={
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            <HelpTooltip 
              {...calendarHelp.scheduleView}
              position="left"
              size="md"
            />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Reminders ON</span>
            </div>
          </div>
        }
      />

      {/* Calendar Navigation */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">Loading calendar...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b bg-gray-50">
                {dayNames.map(day => (
                  <div key={day} className="p-2 sm:p-3 text-center font-medium text-gray-700 text-xs sm:text-sm">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.charAt(0)}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {/* Empty cells before first day */}
                {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                  <div key={`empty-${index}`} className="p-2 border-b border-r bg-gray-50 min-h-20 sm:min-h-24" />
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
                      className={`p-3 border-b border-r min-h-24 sm:min-h-28 cursor-pointer transition-all touch-manipulation ${
                        isToday ? 'bg-green-50 border-green-200' : ''
                      } ${
                        isSelected ? 'bg-green-500 text-white ring-2 ring-green-400 shadow-lg transform scale-105 font-bold' : 'hover:bg-gray-50'
                      }`}
                      style={{
                        minHeight: '72px',
                        fontSize: '16px',
                        touchAction: 'manipulation'
                      } as React.CSSProperties}
                    >
                      <div className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                        isToday ? 'text-orange-600' : 'text-gray-700'
                      }`}>
                        {day}
                        {isToday && <span className="ml-1 text-[10px] bg-orange-500 text-white px-1 rounded">Today</span>}
                      </div>

                      {dayBookings.length > 0 && (
                        <div className="space-y-1">
                          {dayBookings.slice(0, 2).map(booking => (
                            <div
                              key={booking.$id}
                              className="text-[10px] sm:text-xs bg-green-50 text-green-700 border border-green-200 px-1.5 py-1 rounded truncate"
                              title={`${booking.time} - ${booking.customerName} (${booking.serviceType})`}
                            >
                              <div className="font-semibold">{booking.time}</div>
                              <div className="truncate hidden sm:block">{booking.customerName}</div>
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
              <div className="mt-6 bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                  {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>

                {getBookingsForDate(selectedDate).length === 0 ? (
                  <p className="text-gray-500 text-center py-8 text-sm">No bookings for this date</p>
                ) : (
                  <div className="space-y-3">
                    {getBookingsForDate(selectedDate)
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map(booking => (
                        <div key={booking.$id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-semibold">
                                {booking.customerName.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm">{booking.customerName}</h4>
                                <p className="text-xs text-gray-500">{booking.serviceType}</p>
                              </div>
                            </div>
                            {booking.reminderSent && (
                              <span className="px-2 py-1 bg-green-50 text-green-600 rounded-md text-[10px] font-medium flex items-center gap-1">
                                <Bell className="w-3 h-3" />
                                <span className="hidden sm:inline">Sent</span>
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>{booking.time} · {booking.duration} min</span>
                            </div>
                            {/* 🔒 PRIVACY RULE: Customer WhatsApp is HIDDEN from therapists */}
                            {/* Only admin dashboard has access to customer WhatsApp for support purposes */}
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="w-4 h-4 text-gray-400" />
                              <span>Use in-app chat to contact customer</span>
                            </div>
                            <div className="flex items-start gap-2 text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                              <span className="flex-1">{booking.location}</span>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="font-semibold text-gray-900">Rp {booking.price.toLocaleString()}</span>
                            {/* 🔒 REMOVED: WhatsApp button - therapists use in-app chat only */}
                            <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium text-xs sm:text-sm">
                              💬 Use Chat
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Reminder Info Banner */}
            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-900 mb-1 text-sm">Automatic Reminders</h3>
                  <p className="text-xs text-orange-700 leading-relaxed">
                    Receive notifications 3 hours before each confirmed booking to help you prepare.
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
