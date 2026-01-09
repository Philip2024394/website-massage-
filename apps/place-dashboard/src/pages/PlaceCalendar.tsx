import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Eye, Edit3, Trash2, Users, MapPin } from 'lucide-react';

interface PlaceCalendarProps {
  placeId: string;
  onBack?: () => void;
}

const PlaceCalendar: React.FC<PlaceCalendarProps> = ({ placeId, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  useEffect(() => {
    // Simulate bookings data
    setBookings([
      {
        id: 1,
        date: '2025-01-15',
        time: '10:00',
        duration: 90,
        customer: 'Sarah Martinez',
        service: 'Traditional Massage',
        therapist: 'Budi Santoso',
        status: 'confirmed',
        amount: 350000
      },
      {
        id: 2,
        date: '2025-01-15',
        time: '14:00',
        duration: 60,
        customer: 'John Davidson',
        service: 'Balinese Massage',
        therapist: 'Sari Dewi',
        status: 'pending',
        amount: 250000
      },
      {
        id: 3,
        date: '2025-01-16',
        time: '11:30',
        duration: 120,
        customer: 'Maria Kristina',
        service: 'Deep Tissue Massage',
        therapist: 'Wayan Putra',
        status: 'confirmed',
        amount: 450000
      }
    ]);
  }, [placeId]);

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => booking.date === dateStr);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              Booking Calendar
            </h1>
            <p className="text-gray-600 mt-1">Manage your massage place bookings and schedule</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={view}
              onChange={(e) => setView(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="month">Month View</option>
              <option value="week">Week View</option>
              <option value="day">Day View</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              <Plus className="w-4 h-4" />
              New Booking
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Calendar Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1 text-sm bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentDate).map((day, index) => (
                  <div key={index} className="aspect-square">
                    {day && (
                      <div
                        onClick={() => setSelectedDate(day)}
                        className={`h-full p-3 rounded-xl cursor-pointer transition-all duration-200 min-h-16 flex flex-col justify-center items-center touch-manipulation ${
                          selectedDate?.toDateString() === day.toDateString()
                            ? 'bg-green-500 text-white shadow-lg transform scale-105 font-bold'
                            : getBookingsForDate(day).length > 0
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-white hover:bg-gray-100 border border-gray-200'
                        }`}
                        style={{
                          fontSize: '18px',
                          minHeight: '64px',
                          touchAction: 'manipulation'
                        } as React.CSSProperties}
                      >
                        <div className="text-lg font-bold text-center">{day.getDate()}</div>
                        {getBookingsForDate(day).length > 0 && (
                          <div className="mt-1 space-y-1">
                            {getBookingsForDate(day).slice(0, 2).map((booking, idx) => (
                              <div key={idx} className={`text-xs p-1 rounded truncate ${
                                selectedDate?.toDateString() === day.toDateString()
                                  ? 'bg-white/20 text-white'
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {booking.time} {booking.customer.split(' ')[0]}
                              </div>
                            ))}
                            {getBookingsForDate(day).length > 2 && (
                              <div className={`text-xs p-1 rounded text-center ${
                                selectedDate?.toDateString() === day.toDateString()
                                  ? 'bg-white/20 text-white'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                +{getBookingsForDate(day).length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Bookings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                Today's Bookings
              </h3>
            </div>
            <div className="p-4">
              {bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length === 0 ? (
                <p className="text-gray-500 text-sm">No bookings for today</p>
              ) : (
                <div className="space-y-3">
                  {bookings
                    .filter(b => b.date === new Date().toISOString().split('T')[0])
                    .map((booking) => (
                    <div key={booking.id} className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3 text-orange-600" />
                        <span className="text-sm font-medium">{booking.time}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 font-medium">{booking.customer}</p>
                      <p className="text-xs text-gray-600">{booking.service}</p>
                      <p className="text-xs text-orange-600 font-medium">{formatCurrency(booking.amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Quick Stats</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Bookings</span>
                <span className="text-sm font-medium">{bookings.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Confirmed</span>
                <span className="text-sm font-medium text-green-600">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-medium text-orange-600">
                  {bookings.filter(b => b.status === 'pending').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceCalendar;