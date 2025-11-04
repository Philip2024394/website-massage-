import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import TherapistBookingAcceptPopup from '../components/TherapistBookingAcceptPopup';

const AcceptBookingPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError('Invalid booking link');
        setLoading(false);
        return;
      }

      try {
        const bookingDoc = await databases.getDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.bookings,
          bookingId
        );

        if (bookingDoc.status !== 'pending') {
          setError('This booking is no longer available');
        } else {
          setBooking(bookingDoc);
        }
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Booking not found');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Not Available</h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to load booking'}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TherapistBookingAcceptPopup
        isOpen={true}
        onClose={() => window.location.href = '/'}
        bookingId={booking.$id}
        therapistId={booking.therapistId}
        customerName={booking.customerName || 'Customer'}
        duration={booking.duration}
        price={booking.price}
        location={booking.location || 'Not specified'}
        bookingTime={booking.createdAt}
      />
    </div>
  );
};

export default AcceptBookingPage;
