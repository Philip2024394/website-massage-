import React, { useEffect, useState } from 'react';
import { bookingService } from '../lib/appwriteService';
import { Booking } from '../types';
import PageNumberBadge from '../components/PageNumberBadge';

interface CustomerProvidersPageProps {
  user: any;
  onBack: () => void;
  onNavigate?: (page: string) => void;
  t?: any;
}

const CustomerProvidersPage: React.FC<CustomerProvidersPageProps> = ({ user, onBack, onNavigate, t }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await bookingService.getByUser(user?.$id || user?.userId);
        setBookings(list);
      } catch (e) {
        console.error('Failed to load bookings for providers page', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const therapistProviders = Array.from(new Map(
    bookings.filter(b => b.providerType === 'therapist').map(b => [b.providerId, b])
  ).values());
  const placeProviders = Array.from(new Map(
    bookings.filter(b => b.providerType === 'place').map(b => [b.providerId, b])
  ).values());

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageNumberBadge pageNumber={301} pageName="CustomerProviders" isLocked={false} />
      <header className="bg-white p-4 shadow-md sticky top-0 z-40 flex items-center justify-between">
        <button onClick={onBack} className="text-gray-700 hover:text-orange-600 font-semibold">← Back</button>
        <h1 className="text-xl font-bold text-gray-800">Your Providers</h1>
        <div />
      </header>
      <div className="p-4 space-y-8">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Massage Therapists ({therapistProviders.length})</h2>
          {isLoading ? <p className="text-gray-500">Loading...</p> : therapistProviders.length === 0 ? (
            <p className="text-gray-600">No therapist bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {therapistProviders.map(b => (
                <div key={b.providerId} className="bg-white rounded-lg p-4 shadow border border-gray-100">
                  <h3 className="font-semibold text-gray-900">{b.providerName}</h3>
                  <p className="text-sm text-gray-600">Last booked: {new Date(b.startTime).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </section>
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Massage Places ({placeProviders.length})</h2>
          {isLoading ? <p className="text-gray-500">Loading...</p> : placeProviders.length === 0 ? (
            <p className="text-gray-600">No massage place bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {placeProviders.map(b => (
                <div key={b.providerId} className="bg-white rounded-lg p-4 shadow border border-gray-100">
                  <h3 className="font-semibold text-gray-900">{b.providerName}</h3>
                  <p className="text-sm text-gray-600">Last booked: {new Date(b.startTime).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CustomerProvidersPage;
