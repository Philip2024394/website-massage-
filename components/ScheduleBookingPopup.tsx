import React, { useState, useEffect } from 'react';
import { Clock, X, User, Phone, Calendar } from 'lucide-react';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../translations';
import { showToast } from '../utils/showToastPortal';

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
      isImmediateBooking?: boolean; // For immediate bookings via green "Pesan" button
      pricing?: { [key: string]: number }; // Pricing object (e.g., {"60": 250, "90": 350, "120": 450})
      discountPercentage?: number; // Discount percentage if applicable
      discountActive?: boolean; // Whether discount is currently active
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
  isImmediateBooking?: boolean; // Skip time selection for immediate bookings
  pricing?: { [key: string]: number }; // Pricing object from therapist/place (e.g., {"60": 250, "90": 350, "120": 450})
  discountPercentage?: number; // Discount percentage if applicable
  discountActive?: boolean; // Whether discount is currently active
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
  hotelVillaType,
  isImmediateBooking = false,
  pricing,
  discountPercentage = 0,
  discountActive = false
}) => {
  const { language } = useLanguage();
  const lang = language === 'gb' ? 'en' : language;
  const t = translations[lang] || translations['id'];
  
  const [step, setStep] = useState<'duration' | 'time' | 'details'>('duration');
  const [selectedDuration, setSelectedDuration] = useState<60 | 90 | 120 | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [countryCode, setCountryCode] = useState<string>('+62');
  const [customerWhatsApp, setCustomerWhatsApp] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [lastBookingTime, setLastBookingTime] = useState<string>('22:00');
  const [openingTime, setOpeningTime] = useState<string>('09:00');
  const [closingTime, setClosingTime] = useState<string>('21:00');
  const [isCreating, setIsCreating] = useState(false);

  // Debug pricing values
  console.log('📊 ScheduleBookingPopup pricing debug:', {
    therapistName,
    receivedPricing: pricing,
    discountPercentage,
    pricing60: pricing?.["60"],
    pricing90: pricing?.["90"],
    pricing120: pricing?.["120"]
  });

  // Note: pricing contains full IDR amounts (e.g., 250000), will be divided by 1000 for 'K' display
  const durations = [
    { 
      minutes: 60, 
      price: pricing && pricing["60"] 
        ? (discountActive && discountPercentage > 0 
            ? Math.round(Number(pricing["60"]) * (1 - discountPercentage / 100))
            : Number(pricing["60"]))
        : 250000, 
      label: '60 min' 
    },
    { 
      minutes: 90, 
      price: pricing && pricing["90"] 
        ? (discountActive && discountPercentage > 0 
            ? Math.round(Number(pricing["90"]) * (1 - discountPercentage / 100))
            : Number(pricing["90"]))
        : 350000, 
      label: '90 min' 
    },
    { 
      minutes: 120, 
      price: pricing && pricing["120"] 
        ? (discountActive && discountPercentage > 0 
            ? Math.round(Number(pricing["120"]) * (1 - discountPercentage / 100))
            : Number(pricing["120"]))
        : 450000, 
      label: '120 min' 
    }
  ];

  // Generate time slots from 8 AM to last booking time
  const generateTimeSlots = async () => {
    const slots: TimeSlot[] = [];
    const today = new Date();
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();

    // Parse last booking time (format: "HH:MM")
    const [lastHour, lastMinute] = lastBookingTime.split(':').map(Number);
    const [openH, openM] = openingTime.split(':').map(Number);
    const [closeH, closeM] = closingTime.split(':').map(Number);

    // Get today's bookings to mark unavailable slots
    let todayBookings: any[] = [];
    
    if (APPWRITE_CONFIG.collections.bookings && APPWRITE_CONFIG.collections.bookings !== '') {
      const bookingsResponse = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        []
      );

      todayBookings = bookingsResponse.documents.filter((booking: any) => {
        const bookingDate = new Date(booking.scheduledTime || booking.createdAt);
        return (
          booking.therapistId === therapistId &&
          bookingDate.toDateString() === today.toDateString() &&
          (booking.status === 'confirmed' || booking.status === 'pending')
        );
      });
    } else {
      console.warn('⚠️ Bookings collection disabled - no schedule conflicts will be checked');
    }

    // Generate slots: for places, use opening/closing; for therapists, 8AM to last booking time
    const isPlace = therapistType === 'place';
    const startHour = isPlace ? openH : 8;
    const endHour = isPlace ? closeH : lastHour;
    for (let hour = startHour; hour <= endHour; hour++) {
      const startMinute = isPlace ? (hour === openH ? openM : 0) : 0;
      const endMinute = hour === endHour ? (isPlace ? closeM : lastMinute) : 45;

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
          const buffer = therapistType === 'place' ? 0 : 30; // no travel buffer for places
          const bookingEnd = new Date(bookingStart.getTime() + (booking.duration + buffer) * 60000);
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
          const collectionId = therapistType === 'therapist' 
            ? APPWRITE_CONFIG.collections.therapists 
            : APPWRITE_CONFIG.collections.places;
            
          if (!collectionId || collectionId === '') {
            console.warn('⚠️ Collection disabled for therapist type:', therapistType);
            setTimeSlots([]);
            return;
          }
          
          const therapist = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            collectionId,
            therapistId
          );
          if (therapistType === 'place') {
            if ((therapist as any).openingTime) setOpeningTime((therapist as any).openingTime);
            if ((therapist as any).closingTime) setClosingTime((therapist as any).closingTime);
          } else {
            if (therapist.lastBookingTime) {
              setLastBookingTime(therapist.lastBookingTime);
            }
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
    // For immediate bookings, we don't need time selection
    if (!isImmediateBooking && (!selectedDuration || !selectedTime)) return;
    if (!customerName || !customerWhatsApp) return;

    try {
      setIsCreating(true);

      // For immediate bookings, use current time; for scheduled, use selected time
      const scheduledTime = new Date();
      if (!isImmediateBooking && selectedTime) {
        scheduledTime.setHours(selectedTime.hour, selectedTime.minute, 0, 0);
      }
      
      const responseDeadline = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Generate a client-side bookingId - required attribute
      let bookingId: string;
      try {
        bookingId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
          ? (crypto as any).randomUUID()
          : `booking_${Date.now()}`;
      } catch {
        bookingId = `booking_${Date.now()}`;
      }

      // For immediate bookings, use default 60-minute duration if none selected
      const finalDuration = selectedDuration || (isImmediateBooking ? 60 : 0);
      const finalPrice = durations.find(d => d.minutes === finalDuration)?.price || 0;

      // Get therapist/place WhatsApp number from database
      let therapistWhatsApp = '';
      try {
        const collectionId = therapistType === 'therapist' 
          ? APPWRITE_CONFIG.collections.therapists 
          : APPWRITE_CONFIG.collections.places;
        
        if (collectionId && collectionId !== '') {
          const provider = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            collectionId,
            therapistId
          );
          therapistWhatsApp = (provider as any).whatsappNumber || '';
        }
      } catch (error) {
        console.error('Error fetching provider WhatsApp:', error);
      }

      // Format booking date and time for WhatsApp message
      const bookingDate = scheduledTime.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const bookingTime = selectedTime?.label || scheduledTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });

      // Save scheduled booking to Appwrite database
      const bookingData = {
        therapistId: therapistId,
        therapistName: therapistName,
        customerName: customerName,
        customerWhatsApp: customerWhatsApp,
        duration: finalDuration,
        scheduledTime: scheduledTime.toISOString(),
        bookingType: 'scheduled',
        status: 'pending',
        providerType: therapistType,
        hotelVillaId: hotelVillaId || null,
        hotelVillaName: hotelVillaName || null,
        price: (selectedDuration && pricing?.[selectedDuration]) || 0,
        discountApplied: discountActive ? discountPercentage : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        // Save to Appwrite bookings collection
        const bookingResponse = await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.bookings,
          'unique()',
          bookingData
        );
        
        console.log('✅ Scheduled booking saved to Appwrite:', bookingResponse);
        
        // Create simple WhatsApp booking message
        let message = `Hi, can I book massage for ${bookingDate} at ${bookingTime} with ${finalDuration} minutes. I wait your reply, thank you. Booking ID: ${bookingResponse.$id}`;

        // Send WhatsApp message directly to therapist/place
        if (therapistWhatsApp) {
          const whatsappUrl = `https://wa.me/${therapistWhatsApp}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        } else {
          console.warn('⚠️ Therapist WhatsApp number not found');
          alert('Could not send WhatsApp message - therapist contact not available');
        }

        showToast('Scheduled booking saved and WhatsApp message sent!', 'success');
        
        // Close popup after showing success message
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      } catch (saveError: any) {
        console.error('❌ Error saving scheduled booking to Appwrite:', saveError);
        
        // Still send WhatsApp message even if save fails
        let message = `Hi, can I book massage for ${bookingDate} at ${bookingTime} with ${finalDuration} minutes. I wait your reply, thank you.`;
        
        if (therapistWhatsApp) {
          const whatsappUrl = `https://wa.me/${therapistWhatsApp}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
          showToast('WhatsApp message sent (booking save failed)', 'warning');
        } else {
          showToast('Failed to save booking and send message', 'error');
        }
        
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      }

    } catch (error: any) {
      console.error('❌ Error creating scheduled booking:', error);
      alert(`Failed to send booking request: ${error.message || 'Please try again.'}`);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
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
                <h2 className="text-xl font-bold text-white">
                  {isImmediateBooking ? '🟢 Book Now' : '📅 Schedule Booking'}
                </h2>
                <p className="text-orange-100 text-xs">Indastreet • {therapistName}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          {/* Step 1: Select Duration */}
          {step === 'duration' && (
            <div className="space-y-1.5 sm:space-y-2">
              <h3 className="text-base font-semibold text-gray-800 mb-2 sm:mb-3">{language === 'id' ? 'Pilih Durasi' : 'Select Duration'}</h3>
              {durations.map((option) => (
                <button
                  key={option.minutes}
                  onClick={() => {
                    setSelectedDuration(option.minutes as 60 | 90 | 120);
                    // For immediate bookings, skip time selection and go to details
                    if (isImmediateBooking) {
                      // Set current time as selected time for immediate booking
                      const now = new Date();
                      setSelectedTime({
                        hour: now.getHours(),
                        minute: now.getMinutes(),
                        label: 'Now',
                        available: true
                      });
                      setStep('details');
                    } else {
                      setStep('time');
                    }
                  }}
                  className="w-full p-2 sm:p-2.5 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left flex items-center gap-2">
                      <Clock className="text-orange-500" size={18} />
                      <div>
                        <div className="font-bold text-gray-800 text-sm">{option.label}</div>
                        {therapistType === 'therapist' && (
                          <div className="text-xs text-gray-500">{language === 'id' ? '+ 30 menit waktu perjalanan' : '+ 30 min travel time'}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-orange-600">IDR {Math.round(option.price / 1000)}K</div>
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
                ← {language === 'id' ? 'Kembali ke durasi' : 'Back to duration'}
              </button>
              <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Clock className="text-orange-500" size={18} />
                {language === 'id' ? `Pilih Waktu (${selectedDuration} menit)` : `Select Time (${selectedDuration} min)`}
              </h3>
              
              <div className="bg-orange-50 p-3 rounded-lg mb-3">
                <p className="text-xs text-orange-800 flex items-center gap-1">
                  <Clock className="inline w-3 h-3" />
                  {therapistType === 'place' ? (
                    <>{language === 'id' ? `Buka hari ini: ${openingTime}–${closingTime}` : `Open today: ${openingTime}–${closingTime}`}</>
                  ) : (
                    <>{language === 'id' ? `Booking terakhir hari ini: ${lastBookingTime}` : `Last booking today: ${lastBookingTime}`}</>
                  )}
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
                  <strong>Duration:</strong> {selectedDuration} min{therapistType === 'therapist' ? ' (+30 min travel)' : ''}
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
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <Phone className="inline w-3 h-3 mr-1" />
                  WhatsApp Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm text-gray-900 bg-white"
                    style={{ width: '110px' }}
                  >
                    <option value="+62">🇮🇩 +62</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+82">🇰🇷 +82</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+60">🇲🇾 +60</option>
                    <option value="+66">🇹🇭 +66</option>
                    <option value="+84">🇻🇳 +84</option>
                    <option value="+63">🇵🇭 +63</option>
                  </select>
                  <input
                    type="tel"
                    value={customerWhatsApp}
                    onChange={(e) => setCustomerWhatsApp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="812 3456 7890"
                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm text-gray-900"
                  />
                </div>
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
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {hotelVillaName ? `Your room at ${hotelVillaName}` : 'For service delivery location'}
                  </p>
                </div>
              )}

              <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                <p className="text-xs text-orange-800">
                  <strong>{isImmediateBooking ? 'Immediate Booking' : '15-Minute Confirmation'}</strong>
                  <br />
                  {isImmediateBooking 
                    ? `You'll be connected directly with ${therapistName} to discuss availability and pricing.`
                    : `The ${therapistType} has 15 minutes to confirm. If they don't respond, your booking will be sent to other available ${therapistType === 'therapist' ? 'therapists' : 'massage places'}.`
                  }
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
                {isCreating ? 'Sending...' : '📱 Send WhatsApp Request'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleBookingPopup;
