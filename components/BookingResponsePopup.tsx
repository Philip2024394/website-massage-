import React, { useState, useEffect } from 'react';
import { X, Clock, User, MapPin, Phone, CheckCircle, XCircle } from 'lucide-react';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { notificationSound } from '../lib/notificationSound';

interface BookingResponsePopupProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
}

const BookingResponsePopup: React.FC<BookingResponsePopupProps> = ({
  isOpen,
  onClose,
  bookingId
}) => {
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes in seconds
  const [hasExpired, setHasExpired] = useState(false);

  // Fetch booking details
  useEffect(() => {
    if (isOpen && bookingId) {
      fetchBookingDetails();
      // Play notification sound when popup opens
      notificationSound.playBookingAlert();
    }
  }, [isOpen, bookingId]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || !booking || hasExpired) return;

    const interval = setInterval(() => {
      const now = new Date();
      const deadline = new Date(booking.responseDeadline);
      const secondsLeft = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000));
      
      setTimeLeft(secondsLeft);
      
      if (secondsLeft <= 0) {
        setHasExpired(true);
        handleAutoReject();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, booking, hasExpired]);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      const bookingDoc = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        bookingId
      );
      setBooking(bookingDoc);
      
      // Calculate initial time left
      const now = new Date();
      const deadline = new Date(bookingDoc.responseDeadline);
      const secondsLeft = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000));
      setTimeLeft(secondsLeft);
      
      if (secondsLeft <= 0) {
        setHasExpired(true);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      alert('Failed to load booking details');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (isResponding || hasExpired) return;

    try {
      setIsResponding(true);
      
      // Stop persistent notification
      notificationSound.stopPersistentAlert();
      
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        bookingId,
        {
          status: 'accepted',
          acceptedAt: new Date().toISOString(),
          respondedAt: new Date().toISOString()
        }
      );

      alert('✅ Booking Accepted! Customer will be notified.');
      onClose();
    } catch (error) {
      console.error('Error accepting booking:', error);
      alert('Failed to accept booking. Please try again.');
    } finally {
      setIsResponding(false);
    }
  };

  const handleReject = async () => {
    if (isResponding || hasExpired) return;

    try {
      setIsResponding(true);
      
      // Stop persistent notification
      notificationSound.stopPersistentAlert();
      
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        bookingId,
        {
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          respondedAt: new Date().toISOString()
        }
      );

      alert('❌ Booking Rejected. Sending to next available provider...');
      onClose();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Failed to reject booking. Please try again.');
    } finally {
      setIsResponding(false);
    }
  };

  const handleAutoReject = async () => {
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        bookingId,
        {
          status: 'expired',
          expiredAt: new Date().toISOString(),
          respondedAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error auto-rejecting booking:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Clock className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">New Booking Request</h2>
                <p className="text-orange-100 text-sm">Respond within {formatTime(timeLeft)}</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-white hover:bg-white/20 rounded-full p-1"
              disabled={isResponding}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="spinner-mobile mx-auto mb-4"></div>
              <p className="text-gray-600">Loading booking details...</p>
            </div>
          ) : hasExpired ? (
            <div className="text-center py-8">
              <XCircle className="mx-auto text-red-500 mb-4" size={64} />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Time Expired</h3>
              <p className="text-gray-600">This booking request has been sent to another provider.</p>
            </div>
          ) : booking ? (
            <>
              {/* Timer Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Time Remaining</span>
                  <span className={`text-lg font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-orange-600'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      timeLeft < 60 ? 'bg-red-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${(timeLeft / 300) * 100}%` }}
                  />
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  Customer Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold text-gray-800">{booking.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">WhatsApp:</span>
                    <span className="font-semibold text-blue-600">{booking.customerWhatsApp}</span>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MapPin size={18} className="text-green-600" />
                  Location
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold text-gray-800 capitalize">{booking.locationType}</span>
                  </div>
                  {booking.locationType === 'home' ? (
                    <div>
                      <span className="text-gray-600">Address:</span>
                      <p className="font-semibold text-gray-800 mt-1">{booking.homeAddress}</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{booking.locationType === 'hotel' ? 'Hotel' : 'Villa'}:</span>
                        <span className="font-semibold text-gray-800">{booking.hotelVillaName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room:</span>
                        <span className="font-semibold text-gray-800">{booking.roomNumber}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Service Details */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Clock size={18} className="text-orange-600" />
                  Service Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-gray-800">{booking.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold text-orange-600 text-lg">IDR {booking.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleReject}
                  disabled={isResponding}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <XCircle size={20} />
                  Reject
                </button>
                <button
                  onClick={handleAccept}
                  disabled={isResponding}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={20} />
                  Accept
                </button>
              </div>

              {isResponding && (
                <p className="text-center text-gray-600 text-sm mt-3">Processing your response...</p>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Failed to load booking details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingResponsePopup;
