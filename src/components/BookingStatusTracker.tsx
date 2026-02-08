import React, { useState, useEffect } from 'react';
import { startContinuousNotifications, stopContinuousNotifications } from '../lib/continuousNotificationService';
import { Clock, CheckCircle, XCircle, AlertTriangle, Search, User, MessageCircle } from 'lucide-react';
import { showToast } from '../utils/showToastPortal';
import { databases, client } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { bookingSoundService } from '../services/bookingSound.service';
import { logger } from '../utils/logger';

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

interface TherapistAcceptance {
  therapistId: string;
  therapistName: string;
  therapistImage?: string;
  acceptedAt: Date;
  estimatedArrival: number; // minutes
  whatsappNumber: string;
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
  const [status, setStatus] = useState<'waiting' | 'expired' | 'searching' | 'therapist-found' | 'confirmed'>('waiting');
  const [searchingDots, setSearchingDots] = useState<string>('');
  const [acceptedTherapist, setAcceptedTherapist] = useState<TherapistAcceptance | null>(null);
  const [showCancelWarning, setShowCancelWarning] = useState<boolean>(false);

  // Continuous notification audio while awaiting/trying to find therapist
  useEffect(() => {
    if (!isOpen || !bookingId) return;
    // Begin continuous notifications when tracker opens (awaiting response)
    startContinuousNotifications(bookingId);
    return () => {
      stopContinuousNotifications(bookingId);
    };
  }, [isOpen, bookingId]);

  // Play notification sound
  const playNotificationSound = (type: 'booking' | 'success' | 'alert') => {
    try {
      const audio = new Audio(`/${type}-notification.mp3`);
      audio.volume = 0.7;
      audio.play().catch(e => logger.debug('Audio play failed:', e));
    } catch (error) {
      logger.debug('Audio not available:', error);
    }
  };

  // Simulate therapist acceptance (replace with real Appwrite listener)
  const simulateTherapistAcceptance = () => {
    setTimeout(() => {
      const mockTherapist: TherapistAcceptance = {
        therapistId: 'therapist_456',
        therapistName: 'Maya Sari',
        therapistImage: '/api/placeholder/80/80',
        acceptedAt: new Date(),
        estimatedArrival: 15,
        whatsappNumber: '+6281234567890'
      };
      setAcceptedTherapist(mockTherapist);
      setStatus('therapist-found');
      showToast('Therapist found! Please confirm', 'success');
      // Stop continuous notifications once a therapist is found
      if (bookingId) stopContinuousNotifications(bookingId);
      playNotificationSound('success');
    }, 3000); // Simulate 3 seconds search time
  };

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const deadline = new Date(responseDeadline).getTime();
      const remaining = Math.max(0, Math.floor((deadline - now) / 1000));

      setTimeRemaining(remaining);

      if (remaining === 0 && status === 'waiting') {
        setStatus('searching');
        playNotificationSound('alert');
        showToast('Searching for another available therapist...', 'warning');
        simulateTherapistAcceptance();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, responseDeadline, status]);

  // Real-time subscription to booking status changes
  useEffect(() => {
    if (!isOpen || !bookingId) return;

    const unsubscribe = client.subscribe(
      `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.bookings}.documents.${bookingId}`,
      (response: any) => {
        logger.debug('📡 Booking status update received:', response);
        
        const updatedBooking = response.payload;
        
        if (updatedBooking.status === 'confirmed') {
          // Therapist accepted
          setStatus('confirmed');
          stopContinuousNotifications(bookingId);
          playNotificationSound('success');
          showToast(`${therapistName} has accepted your booking!`, 'success');
          
          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Booking Confirmed!', {
              body: `${therapistName} has accepted your booking.`,
              icon: '/logo.png'
            });
          }
        } else if (updatedBooking.status === 'rejected' || updatedBooking.status === 'expired' || updatedBooking.status === 'broadcast_all') {
          // Therapist rejected, booking expired, or now broadcasting to all
          if (updatedBooking.status === 'broadcast_all') {
            setStatus('broadcasting');
            playNotificationSound('alert');
            showToast('Finding nearby therapists for first-come-first-serve...', 'warning');
            
            // Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Broadcasting to All Therapists', {
                body: 'Finding the next available therapist in your location.',
                icon: '/logo.png'
              });
            }
          } else {
            setStatus('searching');
            playNotificationSound('alert');
            showToast('Finding another therapist...', 'warning');
            
            // Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Searching for Therapist', {
                body: 'Looking for another available therapist for you.',
                icon: '/logo.png'
              });
            }
            
            // Trigger auto-reassignment (will be handled by backend/service)
            simulateTherapistAcceptance();
          }
        }
      }
    );

    // Request notification permission if not granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      unsubscribe();
    };
  }, [isOpen, bookingId, therapistName]);

  // Searching animation effect
  useEffect(() => {
    if (status === 'searching') {
      const dotsInterval = setInterval(() => {
        setSearchingDots(prev => {
          if (prev.length >= 3) return '';
          return prev + '.';
        });
      }, 500);
      return () => clearInterval(dotsInterval);
    }
  }, [status]);

  // Handle customer accepting the therapist
  const handleAcceptTherapist = async () => {
    if (!acceptedTherapist) return;
    
    try {
      // Update therapist status to busy (replace with real Appwrite update)
      logger.debug('Setting therapist status to busy:', acceptedTherapist.therapistId);
      // CRITICAL: Stop notifications on accept
      if (bookingId) {
        stopContinuousNotifications(bookingId);
        bookingSoundService.stopBookingAlert(bookingId);
      }
      
      // Send WhatsApp confirmation to therapist
      const message = `✅ BOOKING CONFIRMED!\n\nCustomer has accepted your service.\nBooking Ref: Indastreet-${bookingId.slice(0, 5)}\nDuration: ${duration} min\nPrice: Rp ${(price * 15000).toLocaleString()}\n\nPlease start your journey to the customer.\nEstimated arrival: ${acceptedTherapist.estimatedArrival} minutes\n\nINDASTREET TEAM`;
      
      const whatsappUrl = `https://wa.me/${acceptedTherapist.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      setStatus('confirmed');
      showToast('Booking confirmed', 'success');
      playNotificationSound('success');
      
      // Close the tracker after a delay
      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (error) {
      logger.error('Error confirming booking:', error);
    }
  };

  // Handle continue browsing click
  const handleContinueBrowsing = () => {
    if (status === 'confirmed') {
      // If booking is confirmed, just close without warning
      onClose();
    } else {
      // Show cancellation warning for active bookings
      setShowCancelWarning(true);
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = () => {
    playNotificationSound('alert');
    if (bookingId) stopContinuousNotifications(bookingId);
    setShowCancelWarning(false);
    
    // Show cancel message with directory redirect
    showToast('Booking cancelled. Please view directory for your preferred Therapist / Places.', 'info');
    
    // Redirect to directory after brief delay
    setTimeout(() => {
      window.location.href = '/therapists';
    }, 2000);
    
    onClose();
  };

  // Handle cancel warning dismissal
  const handleKeepBooking = () => {
    setShowCancelWarning(false);
    showToast('Continuing booking', 'success');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

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
                  <span className="font-semibold text-gray-800 text-sm">Rp {(price * 15000).toLocaleString()}</span>
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
                onClick={handleContinueBrowsing}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg text-sm"
              >
                Continue Browsing
              </button>
            </div>
          </>
        )}

        {status === 'searching' && (
          <>
            {/* Searching State */}
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={48} className="text-orange-600 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Finding Therapist</h2>
              <p className="text-gray-600 mb-4">
                Looking for next suitable therapist{searchingDots}
              </p>
              <p className="text-sm text-orange-600 font-semibold">
                Broadcasting to all available therapists...
              </p>
            </div>

            <div className="flex justify-center items-center gap-2 py-4">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={handleCancelBooking}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold hover:from-red-600 hover:to-red-700 transition-all text-sm"
              >
                Cancel Booking
              </button>
            </div>
          </>
        )}

        {status === 'therapist-found' && acceptedTherapist && (
          <>
            {/* Therapist Found State */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={48} className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Therapist Available!</h2>
                <p className="text-gray-600 text-sm">
                  We found a qualified therapist for you
                </p>
              </div>

              {/* Therapist Profile */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <User size={32} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{acceptedTherapist.therapistName}</h3>
                    <p className="text-sm text-gray-600">Certified Massage Therapist</p>
                    <p className="text-xs text-green-600 font-semibold">
                      Arrives in {acceptedTherapist.estimatedArrival} minutes
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2 rounded">
                    <span className="text-gray-600">Experience</span>
                    <div className="font-semibold text-gray-800">5+ Years</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <span className="text-gray-600">Rating</span>
                    <div className="font-semibold text-gray-800">4.9/5 ⭐</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStatus('confirmed');
                    handleAcceptTherapist();
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition-all"
                >
                  Accept
                </button>
                <button
                  onClick={() => setStatus('searching')}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors"
                >
                  Find Another
                </button>
              </div>
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
              <p className="text-gray-600 mb-4">
                {acceptedTherapist ? acceptedTherapist.therapistName : therapistName} has accepted your booking.
              </p>
              <p className="text-sm text-gray-500">They will arrive shortly!</p>
              
              {/* WhatsApp Confirmation */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                <div className="flex items-center gap-2 justify-center">
                  <MessageCircle className="text-green-600" size={16} />
                  <span className="text-xs text-green-800 font-semibold">
                    WhatsApp confirmation sent!
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={onClose}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Close
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
                onClick={handleCancelBooking}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold hover:from-red-600 hover:to-red-700 transition-all"
              >
                Cancel Booking
              </button>
            </div>
          </>
        )}
      </div>

      {/* Cancellation Warning Popup */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            {/* Warning Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-t-2xl">
              <h3 className="text-lg font-bold text-white text-center">Cancel Booking?</h3>
            </div>

            {/* Warning Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={32} className="text-red-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Are you sure?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  If you continue browsing now, your current booking will be <strong className="text-red-600">cancelled</strong> and you'll need to start over.
                </p>
              </div>

              {/* Warning Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleCancelBooking}
                  className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold hover:from-red-600 hover:to-red-700 transition-all"
                >
                  Yes, Cancel Booking
                </button>
                <button
                  onClick={handleKeepBooking}
                  className="w-full py-3 border-2 border-orange-500 text-orange-600 rounded-lg font-bold hover:bg-orange-50 transition-colors"
                >
                  No, Keep Waiting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingStatusTracker;
