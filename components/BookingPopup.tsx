import React, { useState } from 'react';
import { Clock, AlertTriangle, X, User } from 'lucide-react';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

// Extend window type for global booking tracker
declare global {
  interface Window {
    openBookingStatusTracker?: (statusInfo: {
      bookingId: string;
      therapistName: string;
      duration: number;
      price: number;
      responseDeadline: Date;
    }) => void;
  }
}

interface BookingOption {
  duration: number;
  price: number;
}

interface BookingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  therapistId: string;
  therapistName: string;
  profilePicture?: string;
  providerType?: string;
  hotelVillaId?: string;
  hotelVillaName?: string;
  hotelVillaType?: 'hotel' | 'villa';
  hotelVillaLocation?: string;
  pricing?: { [key: string]: number };
  discountPercentage?: number;
}

const BookingPopup: React.FC<BookingPopupProps> = ({
  isOpen,
  onClose,
  therapistId,
  therapistName,
  profilePicture,
  providerType,
  hotelVillaId,
  hotelVillaName,
  hotelVillaType,
  hotelVillaLocation,
  pricing,
  discountPercentage = 0
}) => {
  const [showWarning, setShowWarning] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // User information fields
  const [customerName, setCustomerName] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+62');
  const [customerWhatsApp, setCustomerWhatsApp] = useState<string>('');
  const [locationType, setLocationType] = useState<'hotel' | 'villa' | 'home'>('hotel');
  const [hotelVillaNameInput, setHotelVillaNameInput] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [homeAddress, setHomeAddress] = useState<string>('');

  // Check if this is a hotel/villa booking
  const isHotelVillaBooking = Boolean(hotelVillaId && hotelVillaName);

  // Use pricing from props if available, otherwise use default prices
  const bookingOptions: BookingOption[] = [
    { 
      duration: 60, 
      price: pricing && pricing["60"] 
        ? (discountPercentage > 0 
            ? Math.round(Number(pricing["60"]) * 1000 * (1 - discountPercentage / 100))
            : Number(pricing["60"]) * 1000)
        : 250000 // Default IDR 250K
    },
    { 
      duration: 90, 
      price: pricing && pricing["90"] 
        ? (discountPercentage > 0 
            ? Math.round(Number(pricing["90"]) * 1000 * (1 - discountPercentage / 100))
            : Number(pricing["90"]) * 1000)
        : 350000 // Default IDR 350K
    },
    { 
      duration: 120, 
      price: pricing && pricing["120"] 
        ? (discountPercentage > 0 
            ? Math.round(Number(pricing["120"]) * 1000 * (1 - discountPercentage / 100))
            : Number(pricing["120"]) * 1000)
        : 450000 // Default IDR 450K
    }
  ];

  const createBookingRecord = async () => {
    if (!selectedDuration) return;

    try {
      setIsCreating(true);

      // If booking a place (venue), ensure current time is within opening hours
      const isPlace = (providerType || 'therapist') === 'place';
      if (isPlace) {
        try {
          const placeCollection = APPWRITE_CONFIG.collections.places;
          if (placeCollection && placeCollection !== '') {
            const place = await databases.getDocument(
              APPWRITE_CONFIG.databaseId,
              placeCollection,
              therapistId
            );
            const openingTime: string | undefined = (place as any).openingTime;
            const closingTime: string | undefined = (place as any).closingTime;
            if (openingTime && closingTime) {
              const [oh, om] = openingTime.split(':').map(Number);
              const [ch, cm] = closingTime.split(':').map(Number);
              const now = new Date();
              const nowMinutes = now.getHours() * 60 + now.getMinutes();
              const openMinutes = oh * 60 + (om || 0);
              const closeMinutes = ch * 60 + (cm || 0);
              if (nowMinutes < openMinutes || nowMinutes > closeMinutes) {
                alert(`${therapistName} is currently closed (hours ${openingTime}–${closingTime}). Please schedule within opening hours.`);
                setIsCreating(false);
                return;
              }
            }
          }
        } catch (e) {
          console.warn('Could not validate venue opening hours:', e);
          // Continue; do not block booking if hours cannot be fetched
        }
      }

      const selectedOption = bookingOptions.find(opt => opt.duration === selectedDuration);
      if (!selectedOption) throw new Error('Invalid duration selected');

      const now = new Date();
      const responseDeadline = new Date(now.getTime() + 5 * 60 * 1000);

      // Generate a client-side bookingId - required attribute
      let bookingId: string;
      try {
        bookingId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
          ? (crypto as any).randomUUID()
          : `booking_${Date.now()}`;
      } catch {
        bookingId = `booking_${Date.now()}`;
      }

      // Complete booking data with all required attributes
      const bookingData: any = {
        bookingId, // Required - unique identifier
        therapistId, // Required
        therapistName, // Required
        therapistType: providerType || 'therapist', // Required
        providerId: therapistId, // Required - maps to therapistId
        providerName: therapistName, // Required - maps to therapistName  
        providerType: providerType || 'therapist', // Required - maps to therapistType
        duration: selectedOption.duration, // Required
        price: Math.round(selectedOption.price / 1000), // Convert to thousands (IDR to k)
        status: 'pending', // Required
        createdAt: now.toISOString(), // Required
        bookingDate: now.toISOString(), // Required - your schema needs this
        responseDeadline: responseDeadline.toISOString(), // Required
        startTime: now.toISOString(), // Your schema uses startTime
        bookingType: 'immediate', // Optional - booking type
        service: 'massage', // Required in your schema
        
        // Customer Information
        customerName: customerName.trim(),
        customerWhatsApp: `${countryCode}${customerWhatsApp.trim()}`.replace(/\s/g, ''),
        
        ...(hotelVillaId && { hotelVillaId }),
        ...(hotelVillaId && { hotelId: hotelVillaId }), // Map to your hotelId field
        ...(hotelVillaName && { hotelVillaName }),
        ...(hotelVillaType && { hotelVillaType }),
        ...(hotelVillaLocation && { hotelVillaLocation }),
        
        // Commission tracking for hotel/villa bookings
        ...(isHotelVillaBooking && { 
          commissionStatus: 'pending',
          therapistStatusLocked: true // Therapist will be busy until commission confirmed
        })
      };

      console.log('📝 Creating immediate booking with data:', bookingData);

      // Create the document using the generated bookingId  
      if (!APPWRITE_CONFIG.collections.bookings || APPWRITE_CONFIG.collections.bookings === '') {
        console.warn('⚠️ Bookings collection disabled - simulating booking creation');
        const mockBooking = {
          $id: bookingId,
          ...bookingData,
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        };
        console.log('✅ Mock booking created:', mockBooking);
        // Still show success to user, but booking won't persist
        onClose();
        return;
      }
      
      const booking = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        bookingId,
        bookingData
      );

      console.log('✅ Booking created successfully:', booking);

      const acceptUrl = `${window.location.origin}/accept-booking/${booking.$id}`;
      
      // Enhanced WhatsApp message with complete customer information
      // selectedOption and isPlace already declared above
      
      let message = isPlace
        ? `🏢 NEW VENUE BOOKING - INDASTREET\n\n`
        : `🛵 NEW MOBILE BOOKING - INDASTREET\n\n`;
      
      // Customer Information
      message += `👤 CUSTOMER DETAILS:\n`;
      message += `Name: ${customerName}\n`;
      message += `WhatsApp: ${customerWhatsApp}\n\n`;
      
      // Location Information
      message += `📍 LOCATION:\n`;
      if (locationType === 'home') {
        message += `Type: Home Address\n`;
        message += `Address: ${homeAddress}\n\n`;
      } else {
        message += `Type: ${locationType === 'hotel' ? 'Hotel' : 'Villa'}\n`;
        message += `${locationType === 'hotel' ? 'Hotel' : 'Villa'} Name: ${hotelVillaNameInput}\n`;
        message += `Room Number: ${roomNumber}\n\n`;
      }
      
      // Service Details
      message += `💼 SERVICE DETAILS:\n`;
      message += `Duration: ${selectedDuration} minutes\n`;
      message += `Price: IDR ${Math.round(selectedOption.price / 1000)}K\n`;
      if (discountPercentage > 0) {
        message += `🔥 Discount: ${discountPercentage}% OFF Applied!\n`;
      }
      message += `Time: ${now.toLocaleString()}\n\n`;
      
      // Accept/Reject Link
      message += `🔗 RESPOND TO BOOKING:\n`;
      message += `${acceptUrl}\n\n`;
      
      // Important Notes
      message += `⏰ IMPORTANT:\n`;
      message += `- Click link above to Accept or Reject\n`;
      message += `- You have 5 minutes to respond\n`;
      message += `- After 5 minutes, request goes to next provider\n\n`;
      
      if (isPlace) {
        message += `🏢 Venue: ${therapistName}\n`;
      } else {
        message += `🛵 Therapist: ${therapistName}\n`;
      }
      message += `📞 INDASTREET Support: +62-XXX-XXXX`;

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      if (window.openBookingStatusTracker) {
        window.openBookingStatusTracker({
          bookingId: booking.$id,
          therapistName,
          duration: selectedOption.duration,
          price: selectedOption.price,
          responseDeadline
        });
      }

      onClose();

    } catch (error: any) {
      console.error('❌ Error creating booking:', error);
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

  if (!isOpen) return null;

  if (showWarning) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-white" size={28} />
                <h2 className="text-xl font-bold text-white">Important Notice</h2>
              </div>
              <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
              <div className="flex items-start gap-2">
                <Clock className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-bold text-gray-800 mb-1 text-sm">5-Minute Response Window</h3>
                  <p className="text-gray-700 text-xs leading-relaxed">
                    When you book, the therapist has <span className="font-bold text-orange-600">5 minutes</span> to accept your booking.
                  </p>
                  <p className="text-gray-700 text-xs leading-relaxed mt-1">
                    If they don't respond within 5 minutes, your booking will be automatically sent to all available therapists.
                  </p>
                  <p className="text-gray-700 text-xs leading-relaxed mt-1">
                    The first therapist to accept will get the booking.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
              <p className="text-gray-700 text-xs">
                <span className="font-semibold">Booking with:</span> {therapistName}
              </p>
            </div>

            <button
              onClick={() => setShowWarning(false)}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
            >
              I Understand - Continue to Book
            </button>

            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-t-2xl">
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
                <h2 className="text-xl font-bold text-white">Select Duration</h2>
                <p className="text-orange-100 text-xs">Indastreet • {therapistName}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* User Information Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Your Information</h3>
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm text-gray-900"
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm text-gray-900 bg-white"
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm text-gray-900"
                />
              </div>
            </div>

            {/* Location Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLocationType('hotel')}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    locationType === 'hotel'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-orange-300'
                  }`}
                >
                  Hotel
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType('villa')}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    locationType === 'villa'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-orange-300'
                  }`}
                >
                  Villa
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType('home')}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    locationType === 'home'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-orange-300'
                  }`}
                >
                  Home
                </button>
              </div>
            </div>

            {/* Hotel/Villa Details */}
            {(locationType === 'hotel' || locationType === 'villa') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locationType === 'hotel' ? 'Hotel' : 'Villa'} Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={hotelVillaNameInput}
                    onChange={(e) => setHotelVillaNameInput(e.target.value)}
                    placeholder={`Enter ${locationType} name`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g., 205"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm text-gray-900"
                  />
                </div>
              </>
            )}

            {/* Home Address */}
            {locationType === 'home' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                  placeholder="Enter your complete address with landmarks"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm text-gray-900"
                />
              </div>
            )}
          </div>

          {/* Duration Selection */}
          <div className="space-y-1.5">
            <h3 className="font-semibold text-gray-800 text-sm">Select Duration</h3>
          {bookingOptions.map((option) => (
            <button
              key={option.duration}
              onClick={() => setSelectedDuration(option.duration)}
              className={`w-full p-2 rounded-xl border-2 transition-all ${
                selectedDuration === option.duration
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left flex items-center gap-2">
                  <Clock className="text-orange-500" size={18} />
                  <div>
                    <div className="font-bold text-gray-800 text-sm">{option.duration} minutes</div>
                    <div className="text-xs text-gray-500">Professional massage</div>
                  </div>
                </div>
                <div className="text-right">
                  {discountPercentage > 0 && pricing && (
                    <div className="text-xs text-gray-500 line-through">
                      IDR {pricing[option.duration.toString()]}K
                    </div>
                  )}
                  <div className="text-lg font-bold text-orange-600">
                    IDR {Math.round(option.price / 1000)}K
                  </div>
                </div>
              </div>
            </button>
          ))}
          </div>

          {/* Remove old Hotel/Villa section since it's now in user info */}

          <button
            onClick={createBookingRecord}
            disabled={
              !selectedDuration || 
              isCreating || 
              !customerName.trim() || 
              !customerWhatsApp.trim() ||
              (locationType !== 'home' && (!hotelVillaNameInput.trim() || !roomNumber.trim())) ||
              (locationType === 'home' && !homeAddress.trim())
            }
            className={`w-full font-bold py-3 rounded-xl transition-all shadow-lg ${
              selectedDuration && 
              !isCreating && 
              customerName.trim() && 
              customerWhatsApp.trim() &&
              ((locationType !== 'home' && hotelVillaNameInput.trim() && roomNumber.trim()) ||
               (locationType === 'home' && homeAddress.trim()))
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isCreating ? 'Creating Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPopup;
