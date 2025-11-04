import React, { useState } from 'react';
import { CheckCircle, Clock, MapPin, DollarSign, X } from 'lucide-react';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

interface TherapistBookingAcceptPopupProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  customerName?: string;
  duration: number;
  price: number;
  location?: string;
  bookingTime: string;
  therapistId: string;
}

const TherapistBookingAcceptPopup: React.FC<TherapistBookingAcceptPopupProps> = ({
  isOpen,
  onClose,
  bookingId,
  customerName = "Customer",
  duration,
  price,
  location,
  bookingTime,
  therapistId
}) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  const handleAcceptBooking = async () => {
    setIsAccepting(true);

    try {
      // Update booking status to 'confirmed'
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        bookingId,
        {
          status: 'confirmed',
          confirmedAt: new Date().toISOString(),
          confirmedBy: therapistId
        }
      );

      // Update therapist status to Busy (if not already)
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.therapists,
        therapistId,
        {
          status: 'Busy',
          currentBookingId: bookingId
        }
      );

      console.log('✅ Booking accepted:', bookingId);
      setIsAccepted(true);

      // Close popup after showing success
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error accepting booking:', error);
      alert('Failed to accept booking. Please try again.');
      setIsAccepting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {isAccepted ? (
          // Success State
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={48} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Accepted!</h2>
            <p className="text-gray-600">Customer has been notified. See you soon!</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">🔔 New Booking Request</h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-orange-700 rounded-full transition-colors"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>
              <p className="text-orange-100 mt-1">Immediate service needed</p>
            </div>

            {/* Booking Details */}
            <div className="p-6 space-y-4">
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="text-orange-600" size={20} />
                  <span className="font-bold text-orange-900">URGENT - Respond within 5 minutes!</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    👤
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Customer</div>
                    <div className="font-semibold text-gray-800">{customerName}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Duration</div>
                    <div className="font-semibold text-gray-800">{duration} minutes</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarSign size={20} className="text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Payment</div>
                    <div className="font-semibold text-gray-800">${price}</div>
                  </div>
                </div>

                {location && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin size={20} className="text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Location</div>
                      <div className="font-semibold text-gray-800">{location}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    ⏰
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Requested Time</div>
                    <div className="font-semibold text-gray-800">{bookingTime}</div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-yellow-800 text-center">
                  ⚠️ If you don't respond, this booking will be sent to other therapists
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 pt-0 space-y-3">
              <button
                onClick={handleAcceptBooking}
                disabled={isAccepting}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                  isAccepting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg'
                }`}
              >
                {isAccepting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Accepting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={24} />
                    <span>Accept Booking</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                disabled={isAccepting}
                className="w-full py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
              >
                Decline
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TherapistBookingAcceptPopup;
