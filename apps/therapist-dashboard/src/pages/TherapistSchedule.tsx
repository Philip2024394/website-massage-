import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X, CheckCircle, Upload, CreditCard, Building2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Therapist, Booking } from '../../../../types';
import { therapistService } from '../../../../lib/appwriteService';
import { showToast } from '../../../../utils/showToastPortal';

interface TherapistScheduleProps {
  therapist: Therapist | null;
}

interface DaySchedule {
  start: string;
  end: string;
  enabled: boolean;
}

interface WeekSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface ManualBooking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  note: string;
}

const TherapistSchedule: React.FC<TherapistScheduleProps> = ({ therapist }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [manualBookings, setManualBookings] = useState<ManualBooking[]>([]);
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>({
    monday: { start: '09:00', end: '17:00', enabled: true },
    tuesday: { start: '09:00', end: '17:00', enabled: true },
    wednesday: { start: '09:00', end: '17:00', enabled: true },
    thursday: { start: '09:00', end: '17:00', enabled: true },
    friday: { start: '09:00', end: '17:00', enabled: true },
    saturday: { start: '09:00', end: '17:00', enabled: true },
    sunday: { start: '09:00', end: '17:00', enabled: false },
  });
  
  const [showScheduleSettings, setShowScheduleSettings] = useState(false);
  const [showManualBookingForm, setShowManualBookingForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Manual booking form
  const [manualBookingForm, setManualBookingForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    note: '',
  });

  useEffect(() => {
    if (therapist) {
      loadScheduleData();
      loadBookings();
    }
  }, [therapist]);

  const loadScheduleData = () => {
    if (!therapist) return;
    
    // Load operational hours
    if (therapist.operationalHours) {
      try {
        const hours = JSON.parse(therapist.operationalHours);
        setWeekSchedule(hours);
      } catch (error) {
        console.error('Error parsing operational hours:', error);
      }
    }
    
    // Load manual bookings
    if (therapist.manualBookings) {
      try {
        const manual = JSON.parse(therapist.manualBookings);
        setManualBookings(manual);
      } catch (error) {
        console.error('Error parsing manual bookings:', error);
      }
    }
  };

  const loadBookings = async () => {
    // TODO: Load bookings from Appwrite
    // For now, using empty array
    setBookings([]);
  };

  const saveScheduleSettings = async () => {
    if (!therapist) return;
    
    setSaving(true);
    try {
      await therapistService.updateTherapist(therapist.$id || String(therapist.id), {
        operationalHours: JSON.stringify(weekSchedule),
      });
      
      showToast('Schedule settings saved successfully', 'success');
      setShowScheduleSettings(false);
    } catch (error) {
      console.error('Error saving schedule:', error);
      showToast('Failed to save schedule settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addManualBooking = async () => {
    if (!therapist || !manualBookingForm.date || !manualBookingForm.startTime || !manualBookingForm.endTime) {
      showToast('Please fill in all booking details', 'error');
      return;
    }
    
    const newBooking: ManualBooking = {
      id: `manual-${Date.now()}`,
      date: manualBookingForm.date,
      startTime: manualBookingForm.startTime,
      endTime: manualBookingForm.endTime,
      note: manualBookingForm.note,
    };
    
    const updatedManualBookings = [...manualBookings, newBooking];
    
    setSaving(true);
    try {
      await therapistService.updateTherapist(therapist.$id || String(therapist.id), {
        manualBookings: JSON.stringify(updatedManualBookings),
      });
      
      setManualBookings(updatedManualBookings);
      setManualBookingForm({ date: '', startTime: '', endTime: '', note: '' });
      setShowManualBookingForm(false);
      showToast('Manual booking added successfully', 'success');
    } catch (error) {
      console.error('Error adding manual booking:', error);
      showToast('Failed to add manual booking', 'error');
    } finally {
      setSaving(false);
    }
  };

  const removeManualBooking = async (bookingId: string) => {
    if (!therapist) return;
    
    const updatedManualBookings = manualBookings.filter(b => b.id !== bookingId);
    
    setSaving(true);
    try {
      await therapistService.updateTherapist(therapist.$id || String(therapist.id), {
        manualBookings: JSON.stringify(updatedManualBookings),
      });
      
      setManualBookings(updatedManualBookings);
      showToast('Manual booking removed', 'success');
    } catch (error) {
      console.error('Error removing manual booking:', error);
      showToast('Failed to remove manual booking', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const isDateBooked = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    // Check system bookings
    const hasSystemBooking = bookings.some(booking => {
      const bookingDate = new Date(booking.startTime).toISOString().split('T')[0];
      return bookingDate === dateString && booking.status !== 'cancelled';
    });
    
    // Check manual bookings
    const hasManualBooking = manualBookings.some(booking => booking.date === dateString);
    
    return hasSystemBooking || hasManualBooking;
  };

  const isDayEnabled = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return weekSchedule[dayName as keyof WeekSchedule]?.enabled || false;
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-14 bg-gray-50" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isBooked = isDateBooked(date);
      const isEnabled = isDayEnabled(date);
      const isToday = new Date().toDateString() === date.toDateString();
      
      days.push(
        <div
          key={day}
          onClick={() => {
            setSelectedDate(date);
            setManualBookingForm({ ...manualBookingForm, date: date.toISOString().split('T')[0] });
          }}
          className={`h-12 border-r border-b border-gray-200 flex flex-col items-center justify-center cursor-pointer transition-all
            ${isToday ? 'ring-2 ring-orange-500 ring-inset' : ''}
            ${isBooked ? 'bg-orange-500 text-white font-bold' : 'bg-white hover:bg-orange-50 text-black'}
            ${!isEnabled ? 'bg-gray-100 text-gray-400' : ''}
          `}
        >
          <span className="text-sm">
            {day}
          </span>
        </div>
      );
    }
    
    return (
      <div>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-black" />
          </button>
          <h3 className="text-base font-bold text-black">{monthName}</h3>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-black" />
          </button>
        </div>
        
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-0 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={day + i} className="text-center text-xs font-medium text-gray-500 py-1.5">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0 border border-gray-300 rounded-lg overflow-hidden">
          {days}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-sm" />
            <span className="text-gray-600">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-white border border-gray-300 rounded-sm" />
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-gray-100 rounded-sm" />
            <span className="text-gray-600">Off</span>
          </div>
        </div>
      </div>
    );
  };

  const getTodaysBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    
    const systemBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.startTime).toISOString().split('T')[0];
      return bookingDate === today && booking.status !== 'cancelled';
    });
    
    const manualBookingsToday = manualBookings.filter(booking => booking.date === today);
    
    return { systemBookings, manualBookingsToday };
  };

  const { systemBookings, manualBookingsToday } = getTodaysBookings();

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="w-full bg-white border-b border-black sticky top-0 z-10">
        <div className="max-w-sm mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-black">My Bookings</h1>
              </div>
            </div>
            <button
              onClick={() => setShowScheduleSettings(true)}
              className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <Clock className="w-5 h-5 text-orange-500" />
            </button>
          </div>
          <p className="text-xs text-gray-600 ml-13">Manage your appointments and schedule</p>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-4 py-4 space-y-4">
        {/* Monthly Calendar */}
        <div className="bg-white rounded-lg border border-black p-4">
          {renderCalendar()}
        </div>

        {/* Today's Bookings */}
        <div className="bg-white rounded-lg border border-black p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-black">Today's Bookings</h3>
            <button
              onClick={() => setShowManualBookingForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {systemBookings.length === 0 && manualBookingsToday.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No bookings today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* System Bookings */}
              {systemBookings.map(booking => (
                <div key={booking.id} className="p-3 bg-white border border-black rounded-lg">
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <h4 className="text-sm font-bold text-black">{booking.userName}</h4>
                      <p className="text-xs text-gray-600">{booking.service} min</p>
                    </div>
                    <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded">
                      {booking.paymentType === 'bank_transfer' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    <span>{new Date(booking.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}

              {/* Manual Bookings */}
              {manualBookingsToday.map(booking => (
                <div key={booking.id} className="p-3 bg-white border border-black rounded-lg">
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <h4 className="text-sm font-bold text-black">Manual</h4>
                      {booking.note && <p className="text-xs text-gray-600">{booking.note}</p>}
                    </div>
                    <button
                      onClick={() => removeManualBooking(booking.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-black" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    <span>{booking.startTime} - {booking.endTime}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Upcoming Bookings */}
        {bookings.filter(b => new Date(b.startTime) > new Date() && b.status !== 'cancelled').length > 0 && (
          <div className="bg-white rounded-lg border border-black p-4">
            <h3 className="text-base font-bold text-black mb-3">Upcoming</h3>
            <div className="space-y-2">
              {bookings
                .filter(b => new Date(b.startTime) > new Date() && b.status !== 'cancelled')
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map(booking => (
                  <div key={booking.id} className="p-3 bg-white border border-gray-300 rounded-lg">
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <h4 className="text-sm font-bold text-black">{booking.userName}</h4>
                        <p className="text-xs text-gray-600">{booking.service} min</p>
                      </div>
                      {booking.paymentType === 'bank_transfer' && (
                        <CheckCircle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-orange-500" />
                        <span>{new Date(booking.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        <span>{new Date(booking.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Schedule Settings Modal */}
      {showScheduleSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="w-full max-w-sm mx-auto bg-white border-t border-black rounded-t-2xl p-5 space-y-3 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-black">Working Hours</h2>
              <button
                onClick={() => setShowScheduleSettings(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-2.5">
              {Object.entries(weekSchedule).map(([day, schedule]) => (
                <div key={day} className="p-3 bg-white border border-gray-300 rounded-lg">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-sm font-bold text-black capitalize">{day}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={schedule.enabled}
                        onChange={(e) => setWeekSchedule({
                          ...weekSchedule,
                          [day]: { ...schedule, enabled: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>

                  {schedule.enabled && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Start</label>
                        <input
                          type="time"
                          value={schedule.start}
                          onChange={(e) => setWeekSchedule({
                            ...weekSchedule,
                            [day]: { ...schedule, start: e.target.value }
                          })}
                          className="w-full px-2.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">End</label>
                        <input
                          type="time"
                          value={schedule.end}
                          onChange={(e) => setWeekSchedule({
                            ...weekSchedule,
                            [day]: { ...schedule, end: e.target.value }
                          })}
                          className="w-full px-2.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={saveScheduleSettings}
              disabled={saving}
              className="w-full py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Manual Booking Form Modal */}
      {showManualBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="w-full max-w-sm mx-auto bg-white border-t border-black rounded-t-2xl p-5 space-y-3 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-black">Add Booking</h2>
              <button
                onClick={() => setShowManualBookingForm(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-black mb-1.5 block">Date</label>
                <input
                  type="date"
                  value={manualBookingForm.date}
                  onChange={(e) => setManualBookingForm({ ...manualBookingForm, date: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-sm font-medium text-black mb-1.5 block">Start</label>
                  <input
                    type="time"
                    value={manualBookingForm.startTime}
                    onChange={(e) => setManualBookingForm({ ...manualBookingForm, startTime: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-black mb-1.5 block">End</label>
                  <input
                    type="time"
                    value={manualBookingForm.endTime}
                    onChange={(e) => setManualBookingForm({ ...manualBookingForm, endTime: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-black mb-1.5 block">Note (Optional)</label>
                <input
                  type="text"
                  value={manualBookingForm.note}
                  onChange={(e) => setManualBookingForm({ ...manualBookingForm, note: e.target.value })}
                  placeholder="e.g., Private client, Hotel"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                />
              </div>
            </div>

            <button
              onClick={addManualBooking}
              disabled={saving || !manualBookingForm.date || !manualBookingForm.startTime || !manualBookingForm.endTime}
              className="w-full py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistSchedule;
