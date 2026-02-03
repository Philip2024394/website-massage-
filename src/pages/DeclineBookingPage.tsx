// 🎯 AUTO-FIXED: Mobile scroll architecture violations (3 fixes)
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { startContinuousNotifications, stopContinuousNotifications } from '../lib/continuousNotificationService';
import { broadcastDecline } from '../lib/bookingAssignment';
import { playSound } from '../lib/notificationSounds';
import { showToast } from '../utils/showToastPortal';
import { bookingSoundService } from '../services/bookingSound.service';

const DeclineBookingPage: React.FC = () => {
  let { bookingId } = useParams<{ bookingId: string }>();
  if (!bookingId && typeof window !== 'undefined') {
    const parts = (window.location.pathname || '').split('/').filter(Boolean);
    if (parts[0] === 'decline-booking' && parts[1]) bookingId = parts[1];
  }

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [declining, setDeclining] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState<string>('');

  useEffect(() => {
    if (!bookingId) { setError('Invalid booking link'); setLoading(false); return; }
    const fetchBooking = async () => {
      try {
        if (!APPWRITE_CONFIG.collections.bookings || APPWRITE_CONFIG.collections.bookings === '') {
          setError('Bookings unavailable');
          setLoading(false);
          return;
        }
        const doc = await databases.getDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.bookings, bookingId!);
        if (doc.status !== 'pending') {
          setError('This booking is no longer pending');
        } else {
          setBooking(doc);
        }
      } catch (e) {
        setError('Booking not found');
      } finally { setLoading(false); }
    };
    fetchBooking();
  }, [bookingId]);

  // CRITICAL: Start notification sound until decision
  useEffect(() => {
    if (bookingId && booking && !declined) {
      // Enable autoplay preparation
      bookingSoundService.enableAutoplay();
      
      // Start both sound systems for maximum alerting
      startContinuousNotifications(bookingId);
      bookingSoundService.startBookingAlert(bookingId, 'pending');
      
      return () => { 
        stopContinuousNotifications(bookingId); 
        bookingSoundService.stopBookingAlert(bookingId);
      };
    }
  }, [bookingId, booking, declined]);

  const handleDecline = async () => {
    if (!bookingId || !booking) return;
    setDeclining(true);
    try {
      // Update booking status to declined
      if (APPWRITE_CONFIG.collections.bookings && APPWRITE_CONFIG.collections.bookings !== '') {
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.bookings,
          bookingId,
          {
            status: 'declined',
            declinedAt: new Date().toISOString(),
            declinedBy: booking.therapistId
          }
        );
      }
      // CRITICAL: Stop all sounds immediately on decline
      stopContinuousNotifications(bookingId);
      bookingSoundService.stopBookingAlert(bookingId);
      playSound('bookingDeclined');
      setDeclined(true);
      showToast('Booking declined', 'success');

      // Broadcast to other therapists if providerType is therapist
      if ((booking.providerType || booking.therapistType) === 'therapist') {
        const result = await broadcastDecline({
          bookingId,
          customerName: booking.customerName || 'Customer',
          // 🔒 PRIVACY: WhatsApp NEVER shared with therapists
          durationMinutes: booking.duration,
          price: booking.price
        }, booking.therapistId);
        setBroadcastMsg(result.message || 'Broadcast complete');
      }
    } catch (e: any) {
      console.error('Decline failed', e);
      showToast('Failed declining booking', 'error');
      setDeclining(false);
    }
  };

  if (loading) {
    return <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex items-center justify-center bg-gray-50"><div className="text-gray-600">Loading booking...</div></div>;
  }
  if (error || !booking) {
    return <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex items-center justify-center bg-gray-50 p-4"><div className="bg-white p-6 rounded-xl shadow"><h1 className="text-lg font-bold mb-2">Booking Not Available</h1><p className="text-sm text-gray-600 mb-4">{error || 'Unable to load booking'}</p><button onClick={() => window.location.href='/'} className="px-4 py-2 bg-orange-600 text-white rounded">Home</button></div></div>;
  }

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {declined ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Booking Declined</h2>
            {broadcastMsg && <p className="text-xs text-gray-600 mb-3">{broadcastMsg}</p>}
            <button onClick={() => window.location.href='/'} className="bg-orange-600 text-white px-4 py-2 rounded w-full">Return Home</button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Decline Booking Request</h2>
            <p className="text-sm text-gray-600 mb-4">Customer: <span className="font-medium">{booking.customerName || 'Customer'}</span></p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-xs text-yellow-800 mb-4">
              This action will notify Indastreet & broadcast to other available therapists.
            </div>
            <button onClick={handleDecline} disabled={declining} className={`w-full py-3 rounded-lg font-bold text-white ${declining ? 'bg-gray-300' : 'bg-red-600 hover:bg-red-700'}`}>{declining ? 'Declining...' : 'Confirm Decline'}</button>
            <button onClick={() => { stopContinuousNotifications(bookingId!); window.location.href='/'; }} className="w-full mt-3 text-gray-600 text-sm">Cancel & Silence</button>
          </>
        )}
      </div>
    </div>
  );
};

export default DeclineBookingPage;
