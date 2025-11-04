import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface BookingStatusTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  therapistName: string;
  duration: number;
  price: number;
  responseDeadline: Date;
  onFindNewTherapist: () => void;
}

const BookingStatusTracker: React.FC<BookingStatusTrackerProps> = ({
  isOpen,
  onClose,
  bookingId,
  therapistName,
  duration,
  price,
  responseDeadline,
  onFindNewTherapist
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [status, setStatus] = useState<'waiting' | 'confirmed' | 'expired'>('waiting');

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStatus('waiting');
      setTimeRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const deadline = new Date(responseDeadline).getTime();
      const remaining = Math.max(0, Math.floor((deadline - now) / 1000));

      setTimeRemaining(remaining);

      if (remaining === 0) {
        setStatus('expired');
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isOpen, responseDeadline]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  // Safety check for invalid data
  if (!bookingId || !therapistName) {
    console.warn('BookingStatusTracker: Missing required data');
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {status === 'waiting' && (
          <>
            {/* Waiting State - Orange Indastreet Branding */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white text-center">Waiting for Confirmation</h2>
            </div>

            <div className="p-4 space-y-4">
              {/* Countdown Timer - Compact */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="text-orange-600 animate-pulse" size={28} />
                  <div className="text-4xl font-bold text-orange-600">
                    {formatTime(timeRemaining)}
                  </div>
                </div>
                <p className="text-center text-gray-600 text-xs">
                  Time remaining for therapist response
                </p>
              </div>

              {/* Booking Details - Compact */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm">Therapist</span>
                  <span className="font-semibold text-gray-800 text-sm">{therapistName}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm">Duration</span>
                  <span className="font-semibold text-gray-800 text-sm">{duration} min</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm">Price</span>
                  <span className="font-semibold text-gray-800 text-sm">${price}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm">Reference</span>
                  <span className="font-mono text-xs text-orange-600 font-bold">Indastreet-{bookingId.slice(0, 5)}</span>
                </div>
              </div>

              {/* Status Message - New Text */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-orange-600 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-orange-900 leading-relaxed">
                    <strong>{therapistName}</strong> HAS RECEIVED YOUR BOOKING NOTIFICATION AND WILL REPLY WITHIN THE COUNTER TIME DURATION ABOVE. 
                    WE THANK YOU FOR YOUR PATIENCE WHILE WE CONFIRM YOUR BOOKING.
                    <br />
                    <span className="font-semibold mt-1 block">INDASTREET TEAM</span>
                  </p>
                </div>
              </div>

              {/* Loading Animation - Orange */}
              <div className="flex justify-center items-center gap-2">
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <button
                onClick={onClose}
                className="w-full py-2.5 text-gray-600 hover:text-gray-800 font-semibold transition-colors text-sm"
              >
                Continue Browsing
              </button>
            </div>
          </>
        )}

        {status === 'confirmed' && (
          <>
            {/* Confirmed State */}
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={48} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-4">{therapistName} has accepted your booking.</p>
              <p className="text-sm text-gray-500">They will arrive shortly!</p>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={onClose}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </>
        )}

        {status === 'expired' && (
          <>
            {/* Expired State */}
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={48} className="text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Response Yet</h2>
              <p className="text-gray-600 mb-4">
                {therapistName} hasn't responded within 5 minutes.
              </p>
              <p className="text-sm text-orange-600 font-semibold">
                We're now broadcasting your request to all available therapists!
              </p>
            </div>

            <div className="p-6 pt-0 space-y-3">
              <button
                onClick={onFindNewTherapist}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
              >
                Find Another Therapist
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
              >
                Cancel Booking
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingStatusTracker;
