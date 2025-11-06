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
  hotelVillaLocation
}) => {
  const [showWarning, setShowWarning] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [roomNumber, setRoomNumber] = useState<string>('');

  // Check if this is a hotel/villa booking
  const isHotelVillaBooking = Boolean(hotelVillaId && hotelVillaName);

  const bookingOptions: BookingOption[] = [
    { duration: 60, price: 50 },
    { duration: 90, price: 70 },
    { duration: 120, price: 90 }
  ];

  const createBookingRecord = async () => {
    if (!selectedDuration) return;

    try {
      setIsCreating(true);

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
        price: selectedOption.price, // Required
        status: 'pending', // Required
        createdAt: now.toISOString(), // Required
        bookingDate: now.toISOString(), // Required - your schema needs this
        responseDeadline: responseDeadline.toISOString(), // Required
        startTime: now.toISOString(), // Your schema uses startTime
        bookingType: 'immediate', // Optional - booking type
        service: 'massage', // Required in your schema
        ...(hotelVillaId && { hotelVillaId }),
        ...(hotelVillaId && { hotelId: hotelVillaId }), // Map to your hotelId field
        ...(hotelVillaName && { hotelVillaName }),
        ...(hotelVillaType && { hotelVillaType }),
        ...(hotelVillaLocation && { hotelVillaLocation }),
        ...(isHotelVillaBooking && roomNumber.trim() && { roomNumber: roomNumber.trim() }),
        // Commission tracking for hotel/villa bookings
        ...(isHotelVillaBooking && { 
          commissionStatus: 'pending',
          therapistStatusLocked: true // Therapist will be busy until commission confirmed
        })
      };

      console.log('📝 Creating immediate booking with data:', bookingData);

      // Create the document using the generated bookingId
      const booking = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        bookingId,
        bookingData
      );

      console.log('✅ Booking created successfully:', booking);

      const acceptUrl = `${window.location.origin}/accept-booking/${booking.$id}`;
      
      // Enhanced WhatsApp message with hotel/villa details
      let message = `🏨 NEW BOOKING REQUEST - INDASTREET\n\n`;
      message += `💼 Service: ${selectedOption.duration} min Professional Massage\n`;
      message += `💰 Price: $${selectedOption.price}\n`;
      message += `📅 Time: ${now.toLocaleString()}\n\n`;
      
      if (isHotelVillaBooking) {
        message += `🏨 ${hotelVillaType === 'hotel' ? 'HOTEL' : 'VILLA'} BOOKING\n`;
        message += `🏢 ${hotelVillaType === 'hotel' ? 'Hotel' : 'Villa'}: ${hotelVillaName}\n`;
        if (hotelVillaLocation) {
          message += `📍 Location: ${hotelVillaLocation}\n`;
        }
        message += `🚪 Room: ${roomNumber}\n\n`;
        message += `💼 COMMISSION TRACKING:\n`;
        message += `- You will be marked BUSY during service\n`;
        message += `- Status returns to AVAILABLE when ${hotelVillaType} confirms commission received\n\n`;
      }
      
      message += `✅ Accept booking: ${acceptUrl}\n\n`;
      message += `⏰ Note: You have 5 minutes to respond.\n`;
      message += `📞 INDASTREET SUPPORT: +62-XXX-XXXX`;

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
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
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
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
          {bookingOptions.map((option) => (
            <button
              key={option.duration}
              onClick={() => setSelectedDuration(option.duration)}
              className={`w-full p-3 rounded-xl border-2 transition-all ${
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
                <div className="text-xl font-bold text-orange-600">${option.price}</div>
              </div>
            </button>
          ))}

          {/* Hotel/Villa Room Number Field */}
          {isHotelVillaBooking && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">
                {hotelVillaType === 'hotel' ? 'Hotel' : 'Villa'} Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="Enter room number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  />
                </div>
                <div className="text-xs text-gray-600">
                  <div><strong>{hotelVillaType === 'hotel' ? 'Hotel' : 'Villa'}:</strong> {hotelVillaName}</div>
                  {hotelVillaLocation && <div><strong>Location:</strong> {hotelVillaLocation}</div>}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={createBookingRecord}
            disabled={!selectedDuration || isCreating || (isHotelVillaBooking && !roomNumber.trim())}
            className={`w-full font-bold py-3 rounded-xl transition-all shadow-lg ${
              selectedDuration && !isCreating && (!isHotelVillaBooking || roomNumber.trim())
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
