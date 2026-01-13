import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CreditCard, Upload, CheckCircle, AlertCircle, X, Download, Smartphone, ChevronLeft, ChevronRight, Building2, Bell } from 'lucide-react';
import { Therapist, Booking } from '../../../../types';
import { showToast } from '../../../../utils/showToastPortal';

interface CustomerBookingPageProps {
  therapist: Therapist;
  onBookingComplete?: (booking: Booking) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const CustomerBookingPage: React.FC<CustomerBookingPageProps> = ({ therapist, onBookingComplete }) => {
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<'60' | '90' | '120'>('60');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer' | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Check if PWA is installed
  useEffect(() => {
    const checkPWAInstalled = () => {
      // Check if running in standalone mode (installed PWA)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone ||
                          document.referrer.includes('android-app://');
      setIsPWAInstalled(isStandalone);
    };

    checkPWAInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPWAPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      showToast('Installation prompt not available', 'error');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      showToast('App installed! Please reopen from your home screen', 'success');
      setShowPWAPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const getAvailableTimeSlots = (date: Date): TimeSlot[] => {
    if (!therapist.operationalHours) {
      return [];
    }

    try {
      const weekSchedule = JSON.parse(therapist.operationalHours);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const daySchedule = weekSchedule[dayName];

      if (!daySchedule || !daySchedule.enabled) {
        return [];
      }

      // Generate time slots from operational hours
      const slots: TimeSlot[] = [];
      const startHour = parseInt(daySchedule.start.split(':')[0]);
      const endHour = parseInt(daySchedule.end.split(':')[0]);

      for (let hour = startHour; hour < endHour; hour++) {
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:00`,
          available: true, // TODO: Check against existing bookings
        });
      }

      return slots;
    } catch (error) {
      console.error('Error parsing operational hours:', error);
      return [];
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

  const isDayAvailable = (date: Date): boolean => {
    if (!therapist.operationalHours) return false;
    
    try {
      const weekSchedule = JSON.parse(therapist.operationalHours);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      return weekSchedule[dayName]?.enabled || false;
    } catch {
      return false;
    }
  };

  const handlePaymentProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }

      setPaymentProof(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getPrice = (): string => {
    switch (selectedDuration) {
      case '60':
        return therapist.price60 || '250';
      case '90':
        return therapist.price90 || '350';
      case '120':
        return therapist.price120 || '450';
      default:
        return '0';
    }
  };

  const handleSubmitBooking = async () => {
    if (!selectedDate || !selectedTime || !customerName || !customerPhone || !paymentMethod) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (paymentMethod === 'bank_transfer' && !paymentProof) {
      showToast('Please upload payment proof', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // TODO: Upload payment proof if bank transfer
      // TODO: Create booking in Appwrite
      // TODO: Schedule 3-hour notification

      const bookingTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      bookingTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const newBooking: Partial<Booking> = {
        providerId: Number(therapist.id),
        providerType: 'therapist',
        providerName: therapist.name,
        userName: customerName,
        service: selectedDuration,
        startTime: bookingTime.toISOString(),
        status: 'pending', // Always pending until therapist verifies payment
        paymentType: paymentMethod,
        paymentStatus: 'pending', // Requires therapist verification
        customerPhoneNumber: customerPhone,
        therapistAccepted: false,
        notificationSent: false,
      };

      showToast('Booking request submitted! Awaiting payment verification.', 'success');
      
      // Reset form
      setSelectedDate(null);
      setSelectedTime('');
      setPaymentMethod(null);
      setPaymentProof(null);
      setPaymentProofPreview('');
      setCustomerName('');
      setCustomerPhone('');
      setTermsAccepted(false);
      
      if (onBookingComplete) {
        onBookingComplete(newBooking as Booking);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      showToast('Failed to create booking', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 bg-gray-50" />);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isAvailable = isDayAvailable(date);
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
      
      days.push(
        <button
          key={day}
          onClick={() => !isPast && isAvailable && setSelectedDate(date)}
          disabled={isPast || !isAvailable}
          className={`h-12 border border-gray-200 flex items-center justify-center transition-all ${
            isSelected ? 'bg-orange-500 text-white border-orange-500' : ''
          } ${
            isAvailable && !isPast && !isSelected ? 'bg-white hover:bg-orange-50 cursor-pointer' : ''
          } ${
            !isAvailable || isPast ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
          }`}
        >
          <span className="text-sm font-semibold">{day}</span>
        </button>
      );
    }
    
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-bold text-gray-900">{monthName}</h3>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-px mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-xs font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {days}
        </div>
      </div>
    );
  };

  // PWA Installation Gate
  if (!isPWAInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Smartphone className="w-10 h-10 text-orange-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Install App Required</h2>
          <p className="text-gray-600 mb-6">
            To receive booking notifications with sound alerts, please install our app on your device.
          </p>

          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3 text-left">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Audio Notifications</h4>
                <p className="text-xs text-gray-500">Receive sound alerts 3 hours before your booking</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-left">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Offline Access</h4>
                <p className="text-xs text-gray-500">Access your bookings anytime</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-left">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Fast & Reliable</h4>
                <p className="text-xs text-gray-500">Native app experience</p>
              </div>
            </div>
          </div>

          {showPWAPrompt ? (
            <button
              onClick={handleInstallPWA}
              className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-6 h-6" />
              Install App Now
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-left">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Manual Installation:</h4>
                <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Tap the Share button in your browser</li>
                  <li>Select "Add to Home Screen"</li>
                  <li>Tap "Add" to install</li>
                </ol>
              </div>
              <p className="text-xs text-gray-500">
                If the install button doesn't appear, use your browser's menu to add to home screen.
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <AlertCircle className="w-5 h-5 text-orange-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500">
              Booking without app installation will not include notification alerts
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Booking Interface (only shown after PWA installed)
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-sm mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Book Appointment</h1>
              <p className="text-sm text-gray-500">{therapist.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-4 py-6 space-y-6">
        {/* Step 1: Select Duration */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Select Duration</h3>
          <div className="grid grid-cols-3 gap-3">
            {['60', '90', '120'].map((duration) => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration as any)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedDuration === duration
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-white border-gray-300 hover:border-orange-500'
                }`}
              >
                <div className="text-center">
                  <h4 className="text-lg font-bold">{duration}</h4>
                  <p className="text-xs">min</p>
                  <p className="text-sm font-semibold mt-1">
                    IDR {duration === '60' ? therapist.price60 : duration === '90' ? therapist.price90 : therapist.price120}K
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Date */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Select Date</h3>
          {renderCalendar()}
        </div>

        {/* Step 3: Select Time */}
        {selectedDate && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Select Time</h3>
            <div className="grid grid-cols-4 gap-2">
              {getAvailableTimeSlots(selectedDate).map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => slot.available && setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedTime === slot.time
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : slot.available
                      ? 'bg-white border-gray-300 hover:border-orange-500'
                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span className="text-sm font-semibold">{slot.time}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Customer Info */}
        {selectedTime && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Your Information</h3>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Full Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Phone Number</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+62 xxx xxx xxxx"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        )}

        {/* Step 5: Payment & Terms */}
        {customerName && customerPhone && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Details</h3>
            <p className="text-sm text-gray-600 mb-4">Transfer deposit to therapist's account</p>
            
            {/* Important Terms - Always Visible */}
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-red-900">Important Booking Terms</h4>
                </div>
              </div>
              <ul className="text-xs text-red-800 space-y-2 ml-7">
                <li>• <strong>Deposits are NON-REFUNDABLE</strong> under any circumstances</li>
                <li>• <strong>Date changes allowed</strong> with advance notice and therapist agreement</li>
                <li>• Time slots can be booked outside calendar window with approval</li>
                <li>• Deposit required to confirm scheduled appointment</li>
                <li>• Remaining amount paid after service completion</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  paymentMethod === 'bank_transfer'
                    ? 'bg-orange-50 border-orange-500'
                    : 'bg-white border-gray-300 hover:border-orange-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Upload className="w-6 h-6 text-orange-600" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">Bank Transfer</h4>
                    <p className="text-xs text-gray-500">Upload payment proof after transfer</p>
                  </div>
                  {paymentMethod === 'bank_transfer' && <CheckCircle className="w-5 h-5 text-orange-500" />}
                </div>
              </button>
            </div>

            {/* Bank Transfer Details - Always Show When Selected */}
            {paymentMethod === 'bank_transfer' && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-orange-600" />
                    Transfer Deposit to Therapist:
                  </h4>
                  <div className="bg-white rounded-lg p-3 space-y-2 border border-orange-300">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Bank:</span>
                      <span className="font-bold text-gray-900">{therapist.bankName || 'BCA'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Account Name:</span>
                      <span className="font-bold text-gray-900">{therapist.accountName || therapist.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Account Number:</span>
                      <span className="font-bold text-gray-900">{therapist.accountNumber || '1234567890'}</span>
                    </div>
                    <div className="h-px bg-orange-200 my-2" />
                    <div className="flex justify-between text-base">
                      <span className="font-semibold text-gray-900">Deposit Amount:</span>
                      <span className="font-bold text-orange-600 text-lg">IDR {getPrice()},000</span>
                    </div>
                  </div>
                </div>

                <div className="mb-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                  <p className="text-xs font-semibold text-yellow-900 mb-1">⚠️ Payment Instructions:</p>
                  <ol className="text-xs text-yellow-800 space-y-1 ml-4 list-decimal">
                    <li>Transfer exact amount to account above</li>
                    <li>Take screenshot of transfer confirmation</li>
                    <li>Upload proof below to confirm booking</li>
                    <li>Wait for therapist verification</li>
                  </ol>
                </div>

                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePaymentProofUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-orange-500 transition-colors bg-white">
                    {paymentProofPreview ? (
                      <div className="relative">
                        <img src={paymentProofPreview} alt="Payment proof" className="max-h-40 mx-auto rounded-lg" />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setPaymentProof(null);
                            setPaymentProofPreview('');
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-700">Upload Transfer Proof</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Terms Acceptance & Submit */}
        {paymentMethod === 'bank_transfer' && paymentProof && (
          <div className="space-y-4">
            {/* Terms Checkbox */}
            <label className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">I agree to the booking terms</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>✓ I understand deposits are <strong>NON-REFUNDABLE</strong></li>
                  <li>✓ I understand <strong>NO RESCHEDULING</strong> is allowed</li>
                  <li>✓ I will make a new booking if I need to change date/time</li>
                </ul>
              </div>
            </label>

            {/* Submit Button */}
            <button
              onClick={handleSubmitBooking}
              disabled={submitting || !termsAccepted}
              className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? 'Submitting Booking...' : 'Submit Booking Request'}
              <CheckCircle className="w-6 h-6" />
            </button>

            {!termsAccepted && (
              <p className="text-xs text-center text-red-600">
                You must accept the terms to continue
              </p>
            )}
          </div>
        )}

        {/* Notification Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-gray-900">Reminder Notification</h4>
              <p className="text-xs text-gray-600 mt-1">
                You'll receive a sound notification 3 hours before your appointment. Make sure notifications are enabled!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerBookingPage;
