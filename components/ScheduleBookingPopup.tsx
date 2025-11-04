import React, { useState, useEffect } from 'react';
import { Clock, X, User, Phone, Calendar } from 'lucide-react';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

// Extend window type
declare global {
  interface Window {
    openScheduleBookingPopup?: (therapistInfo: {
      therapistId: string;
      therapistName: string;
      therapistType: 'therapist' | 'place';
      hotelVillaId?: string;
      hotelVillaName?: string;
      hotelVillaType?: 'hotel' | 'villa';
    }) => void;
  }
}

interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
  available: boolean;
}

interface ScheduleBookingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  therapistId: string;
  therapistName: string;
  therapistType: 'therapist' | 'place';
  profilePicture?: string;
  hotelVillaId?: string;
  hotelVillaName?: string;
  hotelVillaType?: 'hotel' | 'villa';
}

const ScheduleBookingPopup: React.FC<ScheduleBookingPopupProps> = ({
  isOpen,
  onClose,
  therapistId,
  therapistName,
  therapistType,
  profilePicture,
  hotelVillaId,
  hotelVillaName,
  hotelVillaType
}) => {
  const [step, setStep] = useState<'duration' | 'time' | 'details' | 'confirming'>('duration');
  const [selectedDuration, setSelectedDuration] = useState<60 | 90 | 120 | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsApp, setCustomerWhatsApp] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [lastBookingTime, setLastBookingTime] = useState<string>('22:00');
  const [isCreating, setIsCreating] = useState(false);

  const durations = [
    { minutes: 60, price: 50, label: '60 min' },
    { minutes: 90, price: 70, label: '90 min' },
    { minutes: 120, price: 90, label: '120 min' }
  ];

  // Generate time slots from 8 AM to last booking time
  const generateTimeSlots = async () => {
    const slots: TimeSlot[] = [];
    const today = new Date();
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();

    // Parse last booking time (format: "HH:MM")
    const [lastHour, lastMinute] = lastBookingTime.split(':').map(Number);

    // Get today's bookings to mark unavailable slots
    const bookingsResponse = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.bookings,
      []
    );

    const todayBookings = bookingsResponse.documents.filter((booking: any) => {
      const bookingDate = new Date(booking.scheduledTime || booking.createdAt);
      return (
        booking.therapistId === therapistId &&
        bookingDate.toDateString() === today.toDateString() &&
        (booking.status === 'confirmed' || booking.status === 'pending')
      );
    });

    // Generate slots from 8 AM to last booking time
    for (let hour = 8; hour <= lastHour; hour++) {
      const startMinute = hour === 8 ? 0 : 0;
      const endMinute = hour === lastHour ? lastMinute : 45;

      for (let minute = startMinute; minute <= endMinute; minute += 15) {
        // Skip past times
        if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
          continue;
        }

        const slotTime = new Date(today);
        slotTime.setHours(hour, minute, 0, 0);

        // Check if this slot conflicts with existing bookings (including 30min buffer)
        const isBooked = todayBookings.some((booking: any) => {
          const bookingStart = new Date(booking.scheduledTime || booking.createdAt);
          const bookingEnd = new Date(bookingStart.getTime() + (booking.duration + 30) * 60000); // duration + 30min travel
          return slotTime >= bookingStart && slotTime < bookingEnd;
        });

        slots.push({
          hour,
          minute,
          label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          available: !isBooked
        });
      }
    }

    setTimeSlots(slots);
  };

  // Fetch therapist's last booking time
  useEffect(() => {
    if (isOpen && therapistId) {
      const fetchTherapistSchedule = async () => {
        try {
          const therapist = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            therapistType === 'therapist' 
              ? APPWRITE_CONFIG.collections.therapists 
              : APPWRITE_CONFIG.collections.places,
            therapistId
          );
          if (therapist.lastBookingTime) {
            setLastBookingTime(therapist.lastBookingTime);
          }
        } catch (error) {
          console.error('Error fetching therapist schedule:', error);
        }
      };

      fetchTherapistSchedule();
    }
  }, [isOpen, therapistId, therapistType]);

  // Generate slots when duration is selected
  useEffect(() => {
    if (step === 'time' && selectedDuration) {
      generateTimeSlots();
    }
  }, [step, selectedDuration]);

  const handleCreateBooking = async () => {
    if (!selectedDuration || !selectedTime || !customerName || !customerWhatsApp) return;

    try {
      setIsCreating(true);

      const scheduledTime = new Date();
      scheduledTime.setHours(selectedTime.hour, selectedTime.minute, 0, 0);
      
      const responseDeadline = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Generate a client-side bookingId - required attribute
      let bookingId: string;
      try {
        bookingId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
          ? (crypto as any).randomUUID()
          : `booking_${Date.now()}`;
      } catch (e) {
        bookingId = `booking_${Date.now()}`;
      }

      // Complete booking data with all required and optional attributes
      const bookingData: any = {
        bookingId, // Required - unique identifier
        therapistId, // Required
        therapistName, // Required
        therapistType, // Required
        providerId: therapistId, // Required - maps to therapistId
        providerName: therapistName, // Required - maps to therapistName
        providerType: therapistType, // Required - maps to therapistType
        duration: selectedDuration, // Required
        price: durations.find(d => d.minutes === selectedDuration)?.price || 0, // Required
        status: 'pending', // Required
        createdAt: new Date().toISOString(), // Required
        bookingDate: new Date().toISOString(), // Required - your schema needs this
        responseDeadline: responseDeadline.toISOString(), // Required
        scheduledTime: scheduledTime.toISOString(), // Optional - for scheduled bookings
        startTime: scheduledTime.toISOString(), // Your schema uses startTime
        customerName, // Optional - customer's name
        userName: customerName, // Map to your userName field
        bookingType: 'scheduled', // Optional - booking type
        service: 'massage', // Required in your schema
        // Include hotel/villa details if booking from venue
        ...(hotelVillaId && { hotelVillaId }),
        ...(hotelVillaId && { hotelId: hotelVillaId }), // Map to your hotelId field
        ...(roomNumber && { roomNumber }),
        ...(roomNumber && { hotelRoomNumber: roomNumber }) // Map to your hotelRoomNumber field
      };

      console.log('📝 Creating booking with data:', bookingData);

      // Create the document using the generated bookingId
      const booking = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        bookingId,
        bookingData
      );

      console.log('✅ Booking created successfully:', booking);

      // Send WhatsApp notification to therapist
      const acceptUrl = `${window.location.origin}/accept-booking/${booking.$id}`;
      const message = `New Scheduled Booking!\n\nCustomer: ${customerName}\nWhatsApp: ${customerWhatsApp}\nTime: ${selectedTime.label}\nDuration: ${selectedDuration} min\nPrice: $${bookingData.price}\n\nAccept booking: ${acceptUrl}\n\nIMPORTANT: You have 15 minutes to respond!`;

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      // Open status tracker
      if (window.openBookingStatusTracker) {
        console.log('📊 Opening booking status tracker...');
        window.openBookingStatusTracker({
          bookingId: booking.$id,
          therapistName,
          duration: selectedDuration,
          price: bookingData.price,
          responseDeadline
        });
      } else {
        console.warn('⚠️ BookingStatusTracker not available');
      }

      setStep('confirming');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);

    } catch (error: any) {
      console.error('❌ Error creating scheduled booking:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type,
        response: error.response
      });
      alert(`Failed to create booking: ${error.message || 'Please try again.'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setStep('duration');
    setSelectedDuration(null);
    setSelectedTime(null);
    setCustomerName('');
    setCustomerWhatsApp('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header - Orange Indastreet Branding */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Profile Picture */}
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt={therapistName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-orange-300 flex items-center justify-center border-2 border-white">
                  <User className="text-white" size={24} />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white">Schedule Booking</h2>
                <p className="text-orange-100 text-xs">Indastreet • {therapistName}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Step 1: Select Duration */}
          {step === 'duration' && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Select Duration</h3>
              {durations.map((option) => (
                <button
                  key={option.minutes}
                  onClick={() => {
                    setSelectedDuration(option.minutes as 60 | 90 | 120);
                    setStep('time');
                  }}
                  className="w-full p-3 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left flex items-center gap-2">
                      <Clock className="text-orange-500" size={18} />
                      <div>
                        <div className="font-bold text-gray-800 text-sm">{option.label}</div>
                        <div className="text-xs text-gray-500">+ 30 min travel time</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-orange-600">${option.price}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Select Time Slot */}
          {step === 'time' && (
            <div className="space-y-3">
              <button
                onClick={() => setStep('duration')}
                className="text-orange-600 text-sm font-medium mb-2"
              >
                ← Back to duration
              </button>
              <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Clock className="text-orange-500" size={18} />
                Select Time ({selectedDuration} min)
              </h3>
              
              <div className="bg-orange-50 p-3 rounded-lg mb-3">
                <p className="text-xs text-orange-800 flex items-center gap-1">
                  <Clock className="inline w-3 h-3" />
                  Last booking today: {lastBookingTime}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {timeSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => slot.available && setSelectedTime(slot)}
                    disabled={!slot.available}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      !slot.available
                        ? 'bg-red-100 text-red-400 cursor-not-allowed'
                        : selectedTime?.label === slot.label
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-orange-100'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>

              {selectedTime && (
                <button
                  onClick={() => setStep('details')}
                  className="w-full mt-3 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700"
                >
                  Continue to Details
                </button>
              )}
            </div>
          )}

          {/* Step 3: Customer Details */}
          {step === 'details' && (
            <div className="space-y-3">
              <button
                onClick={() => setStep('time')}
                className="text-orange-600 text-sm font-medium mb-2"
              >
                ← Back to time selection
              </button>
              <h3 className="text-base font-semibold text-gray-800 mb-3">Your Details</h3>

              <div className="bg-orange-50 p-3 rounded-lg mb-3">
                <div className="text-xs text-orange-800 flex items-center gap-1">
                  <Calendar className="inline w-3 h-3" />
                  <strong>Scheduled:</strong> Today at {selectedTime?.label}
                </div>
                <div className="text-xs text-orange-800 mt-1 flex items-center gap-1">
                  <Clock className="inline w-3 h-3" />
                  <strong>Duration:</strong> {selectedDuration} min (+30 min travel)
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <User className="inline w-3 h-3 mr-1" />
                  Your Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <Phone className="inline w-3 h-3 mr-1" />
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={customerWhatsApp}
                  onChange={(e) => setCustomerWhatsApp(e.target.value)}
                  placeholder="+62 xxx xxx xxx"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm"
                />
              </div>

              {/* Room Number - Only for hotel/villa bookings */}
              {hotelVillaId && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    <svg className="inline w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {hotelVillaType === 'hotel' ? 'Hotel' : 'Villa'} Room Number
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g., 101, 205A"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {hotelVillaName ? `Your room at ${hotelVillaName}` : 'For service delivery location'}
                  </p>
                </div>
              )}

              <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                <p className="text-xs text-orange-800">
                  <strong>15-Minute Confirmation</strong>
                  <br />
                  The {therapistType} has 15 minutes to confirm. If they don't respond, your booking will be sent to other available {therapistType === 'therapist' ? 'therapists' : 'massage places'}.
                </p>
              </div>

              <button
                onClick={handleCreateBooking}
                disabled={!customerName || !customerWhatsApp || isCreating}
                className={`w-full py-3 rounded-lg font-bold text-white ${
                  customerName && customerWhatsApp && !isCreating
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isCreating ? 'Creating Booking...' : 'Confirm Booking'}
              </button>
            </div>
          )}

          {/* Step 4: Confirming */}
          {step === 'confirming' && (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Booking Sent!</h3>
              <p className="text-gray-600">
                Waiting for {therapistName} to confirm...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleBookingPopup;
