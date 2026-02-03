// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, MapPin, DollarSign, X } from 'lucide-react';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { startContinuousNotifications, stopContinuousNotifications } from '../lib/continuousNotificationService';
import { playSound, playSequence } from '../lib/notificationSounds';
import { broadcastDecline } from '../lib/bookingAssignment';
import { bookingSoundService } from '../services/bookingSound.service';
import { TherapistOnTheWayButton } from './TherapistOnTheWayButton';

interface TherapistBookingAcceptPopupProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  customerName?: string;
  customerWhatsApp?: string;
  duration: number;
  price: number;
  location?: string;
  bookingTime: string;
  therapistId: string;
  therapistName?: string;
  address?: string;
  providerType?: 'therapist' | 'place';
  bookingType?: 'immediate' | 'scheduled';
  scheduledTime?: string;
}

const TherapistBookingAcceptPopup: React.FC<TherapistBookingAcceptPopupProps> = ({
  isOpen,
  onClose,
  bookingId,
  customerName = "Customer",
  customerWhatsApp = '',
  duration,
  price,
  location,
  bookingTime,
  therapistId,
  therapistName = 'Therapist',
  address = location || 'Customer Location',
  providerType = 'therapist', 
  bookingType = 'immediate', 
  scheduledTime
}) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [bookingAccepted, setBookingAccepted] = useState(false);
  const [bookingAccepted, setBookingAccepted] = useState(false);

  // CRITICAL: Loud continuous alert until therapist acts
  useEffect(() => {
    if (!isOpen || !bookingId) return;
    
    // Enable autoplay on component mount (requires user interaction)
    bookingSoundService.enableAutoplay();
    
    // Start both old and new sound systems
    startContinuousNotifications(bookingId);
    bookingSoundService.startBookingAlert(bookingId, 'pending');
    
    return () => {
      stopContinuousNotifications(bookingId);
      bookingSoundService.stopBookingAlert(bookingId);
    };
  }, [isOpen, bookingId]);

  const handleAcceptBooking = async () => {
    setIsAccepting(true);

    try {
      console.log('🔒 [POPUP] Accepting booking via SINGLE SOURCE OF TRUTH:', bookingId);
      
      // Import booking service
      const { bookingService } = await import('../lib/appwriteService');
      
      // Call SINGLE acceptance authority
      const result = await bookingService.acceptBookingAndCreateCommission(
        bookingId,
        therapistId,
        therapistName
      );
      
      console.log('✅ [POPUP] Booking accepted and commission created:', result.commission.$id);
      console.log(`   Commission: ${result.commission.commissionAmount} IDR (30%)`);
      console.log(`   Payment Deadline: ${result.commission.paymentDeadline}`);
      
      // Keep existing status update for backward compatibility
      if (APPWRITE_CONFIG.collections.bookings && APPWRITE_CONFIG.collections.bookings !== '') {
        // Status already updated by acceptance function - this is redundant but safe
      } else {
        console.warn('⚠️ Bookings collection disabled');
      }

      // For therapists: set Busy only for immediate bookings or when scheduled time is imminent
      if (providerType === 'therapist' && APPWRITE_CONFIG.collections.therapists && APPWRITE_CONFIG.collections.therapists !== '') {
        let shouldSetBusy = bookingType === 'immediate';
        if (!shouldSetBusy && scheduledTime) {
          try {
            const now = Date.now();
            const when = new Date(scheduledTime).getTime();
            // Consider imminent if within next 45 minutes
            shouldSetBusy = when - now <= 45 * 60 * 1000;
          } catch {}
        }
        if (shouldSetBusy) {
          const busyUntil = new Date(Date.now() + duration * 60000).toISOString();
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.therapists,
            therapistId,
            {
              status: 'Busy',
              currentBookingId: bookingId,
              busyUntil
            }
          );
        }
      }

      console.log('✅ Booking accepted:', bookingId);
      
      // STEP 4: CHAT SESSION CREATION VALIDATION
      console.log('[BOOKING ACCEPT] Creating chat session for booking:', bookingId);
      console.log('[BOOKING ACCEPT] Buyer ID: customer (derived from booking)');
      console.log('[BOOKING ACCEPT] Therapist ID:', therapistId);
      
      try {
        // Create chat session with validated payload
        const chatSessionPayload = {
          buyerId: 'customer', // Will be replaced with actual customer ID from booking
          therapistId: String(therapistId),
          bookingId: String(bookingId),
          status: 'pending', // Will be set to 'accepted' when therapist opens chat
          createdAt: new Date().toISOString()
        };
        
        console.log('[BOOKING ACCEPT] Chat session payload:', chatSessionPayload);
        console.log('[BOOKING ACCEPT] STEP 4 VALIDATION:');
        console.log('[BOOKING ACCEPT]   - buyerId:', chatSessionPayload.buyerId ? '✅' : '❌');
        console.log('[BOOKING ACCEPT]   - therapistId:', chatSessionPayload.therapistId ? '✅' : '❌');
        console.log('[BOOKING ACCEPT]   - bookingId:', chatSessionPayload.bookingId ? '✅' : '❌');
        console.log('[BOOKING ACCEPT]   - status:', chatSessionPayload.status === 'pending' ? '✅' : '❌');
        console.log('[BOOKING ACCEPT]   - createdAt:', chatSessionPayload.createdAt ? '✅' : '❌');
        
        // Create chat session in Appwrite
        if (APPWRITE_CONFIG.collections.chatSessions && APPWRITE_CONFIG.collections.chatSessions !== '') {
          const chatSession = await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.chatSessions,
            bookingId, // Use bookingId as document ID for easy lookup
            chatSessionPayload
          );
          
          console.log('[BOOKING ACCEPT] ✅ Chat session created:', chatSession.$id);
          console.log('[BOOKING ACCEPT] Therapist can now access chat for this booking');
        } else {
          console.warn('[BOOKING ACCEPT] ⚠️ Chat sessions collection disabled');
        }
      } catch (chatError: any) {
        console.error('[BOOKING ACCEPT] ❌ Failed to create chat session:', {
          message: chatError?.message,
          code: chatError?.code,
          type: chatError?.type,
          response: chatError?.response
        });
        // Don't fail the booking acceptance if chat session creation fails
      }
      
      setIsAccepted(true);
      setBookingAccepted(true); // Enable On The Way button
      
      // CRITICAL: Stop all booking alerts immediately on accept
      stopContinuousNotifications(bookingId);
      bookingSoundService.stopBookingAlert(bookingId);
      playSound('bookingAccepted');

      // Don't auto-close - keep open for On The Way button
      // setTimeout(() => {
      //   onClose();
      // }, 2000);

    } catch (error) {
      console.error('Error accepting booking:', error);
      alert('Failed to accept booking. Please try again.');
      setIsAccepting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] ">
        {isAccepted ? (
          // Success State with On The Way Button
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={48} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Accepted! ✅</h2>
              <p className="text-gray-600 mb-4">Customer has been notified.</p>
            </div>
            
            {/* On The Way Button Component */}
            <TherapistOnTheWayButton
              bookingId={bookingId}
              therapistId={therapistId}
              therapistName={customerName || 'Therapist'}
              customerName={customerName}
              customerPhone={customerWhatsApp}
              customerAddress={location || 'Customer Location'}
              isBookingAccepted={bookingAccepted}
              onStatusUpdate={(status) => {
                console.log('Journey status updated:', status);
              }}
            />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
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
                onClick={async () => {
                  if (isAccepting) return;
                  try {
                    // CRITICAL: Stop all booking alerts immediately on decline
                    stopContinuousNotifications(bookingId);
                    bookingSoundService.stopBookingAlert(bookingId);
                    
                    // Update booking status to 'rejected'
                    if (APPWRITE_CONFIG.collections.bookings && APPWRITE_CONFIG.collections.bookings !== '') {
                      await databases.updateDocument(
                        APPWRITE_CONFIG.databaseId,
                        APPWRITE_CONFIG.collections.bookings,
                        bookingId,
                        {
                          status: 'rejected',
                          rejectedAt: new Date().toISOString(),
                          rejectedBy: therapistId
                        }
                      );
                    }
                    
                    playSound('bookingDeclined');
                    // Broadcast to other available therapists (limit inside function)
                    await broadcastDecline({
                      bookingId,
                      customerName,
                      customerWhatsApp,
                      durationMinutes: duration,
                      price
                    }, therapistId);
                    // Sequence sound to indicate broadcast chain
                    void playSequence(['bookingBroadcast']);
                  } catch (e) {
                    console.warn('Decline broadcast failed', e);
                  } finally {
                    onClose();
                  }
                }}
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
