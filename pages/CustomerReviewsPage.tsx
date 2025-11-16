import React, { useEffect, useState } from 'react';
import { bookingService, reviewService } from '../lib/appwriteService';
import { Booking } from '../types';
import PageNumberBadge from '../components/PageNumberBadge';

interface CustomerReviewsPageProps {
  user: any;
  onBack: () => void;
  onNavigate?: (page: string) => void;
  t?: any;
}

interface ReviewState {
  [bookingId: string]: { rating: number; text: string; submitted?: boolean };
}

const CustomerReviewsPage: React.FC<CustomerReviewsPageProps> = ({ user, onBack }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewState>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await bookingService.getByUser(user?.$id || user?.userId);
        // Completed / past bookings only
        const past = list.filter(b => new Date(b.startTime) < new Date());
        setBookings(past);
      } catch (e) {
        console.error('Failed to load bookings for reviews page', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const handleChange = (bookingId: string, field: 'rating' | 'text', value: any) => {
    setReviews(prev => {
      const existing = prev[bookingId] || { rating: 0, text: '' };
      return { ...prev, [bookingId]: { ...existing, [field]: value } };
    });
  };

  const handleSubmit = async (booking: Booking) => {
    const state = reviews[String(booking.id)] || { rating: 0, text: '' };
    if (!state.rating || state.rating < 1) {
      alert('Please select a rating (1-5)');
      return;
    }
    setSubmittingId(String(booking.id));
    try {
      // Basic review payload (adjust to actual schema as needed)
      await reviewService.create({
        providerId: booking.providerId,
        providerType: booking.providerType,
        providerName: booking.providerName,
        rating: state.rating,
        comment: state.text || '',
        whatsapp: '',
        status: 'pending'
      });
      setReviews(prev => ({
        ...prev,
        [String(booking.id)]: { ...prev[String(booking.id)], submitted: true }
      }));
      alert('✅ Review submitted');
    } catch (e) {
      console.error('Failed to submit review', e);
      alert('❌ Could not submit review');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageNumberBadge pageNumber={302} pageName="CustomerReviews" isLocked={false} />
      <header className="bg-white p-4 shadow-md sticky top-0 z-40 flex items-center justify-between">
        <button onClick={onBack} className="text-gray-700 hover:text-orange-600 font-semibold">← Back</button>
        <h1 className="text-xl font-bold text-gray-800">Leave Reviews</h1>
        <div />
      </header>
      <div className="p-4 space-y-6">
        <p className="text-sm text-gray-600">Share feedback about therapists and massage places you have visited.</p>
        {isLoading && <p className="text-gray-500">Loading bookings...</p>}
        {!isLoading && bookings.length === 0 && (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-600">No past bookings available for review yet.</div>
        )}
        {bookings.map(b => {
          const r = reviews[String(b.id)];
          return (
            <div key={b.id} className="bg-white rounded-lg p-4 shadow border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{b.providerName}</h3>
                  <p className="text-xs text-gray-500">{b.providerType} • {new Date(b.startTime).toLocaleDateString()}</p>
                </div>
                {r?.submitted && <span className="text-green-600 text-sm font-semibold">Submitted</span>}
              </div>
              {!r?.submitted && (
                <>
                  <div className="flex items-center gap-2">
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleChange(String(b.id), 'rating', n)}
                        className={`text-2xl ${r?.rating >= n ? 'text-yellow-400' : 'text-gray-300'} hover:scale-110 transition-transform`}
                      >★</button>
                    ))}
                  </div>
                  <textarea
                    className="w-full border border-gray-200 rounded p-2 text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                    rows={3}
                    placeholder="Optional comments"
                    value={r?.text || ''}
                    onChange={e => handleChange(String(b.id), 'text', e.target.value)}
                  />
                  <button
                    onClick={() => handleSubmit(b)}
                    disabled={submittingId === String(b.id)}
                    className="px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm disabled:opacity-50"
                  >
                    {submittingId === String(b.id) ? 'Submitting...' : 'Submit Review'}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerReviewsPage;
