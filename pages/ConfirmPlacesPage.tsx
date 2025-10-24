import React, { useEffect, useState } from 'react';
import Button from '../components/Button';
import { placeService, authService } from '../lib/appwriteService';

interface PendingPlace {
  $id: string;
  name: string;
  email: string;
  city: string;
  country: string;
  whatsappNumber?: string;
  status: 'pending' | 'active' | 'deactivated';
  membershipPackage?: string;
  activeMembershipDate?: string;
}

const membershipOptions = [
  { label: '1 Month', value: '1', months: 1 },
  { label: '3 Months', value: '3', months: 3 },
  { label: '6 Months', value: '6', months: 6 },
  { label: '1 Year', value: '12', months: 12 },
];

const ConfirmPlacesPage: React.FC = () => {
  const [places, setPlaces] = useState<PendingPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await authService.createAnonymousSession().catch(console.error);
      fetchPlaces();
    };
    init();
  }, []);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const data = await placeService.getAll();
      const formattedData = data.map((p: any) => ({
        $id: p.$id,
        name: p.name || 'No name',
        email: p.email || 'No email',
        city: p.city || '',
        country: p.country || '',
        whatsappNumber: p.whatsappNumber || p.phoneNumber || '',
        status: p.status || 'pending',
        membershipPackage: p.membershipPackage,
        activeMembershipDate: p.activeMembershipDate,
      }));
      setPlaces(formattedData);
    } catch (error) {
      console.error('Error fetching places:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (placeId: string, membershipMonths: number) => {
    setUpdatingId(placeId);
    try {
      const newExpiryDate = new Date();
      newExpiryDate.setMonth(newExpiryDate.getMonth() + membershipMonths);
      const newExpiryDateString = newExpiryDate.toISOString().split('T')[0];

      await placeService.update(placeId, {
        id: Date.now().toString(),
        placeId: Date.now().toString(),
        hotelId: Date.now().toString(),
        status: 'active',
        isLive: true,
        activeMembershipDate: newExpiryDateString,
      });

      // Refresh list
      await fetchPlaces();
      alert(`Massage place activated with ${membershipMonths} month(s) membership!`);
    } catch (error: any) {
      console.error('Error activating place:', error);
      alert('Error activating place: ' + (error.message || 'Unknown error'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeactivate = async (placeId: string) => {
    setUpdatingId(placeId);
    try {
      await placeService.update(placeId, {
        id: Date.now().toString(),
        placeId: Date.now().toString(),
        hotelId: Date.now().toString(),
        status: 'deactivated',
        isLive: false,
      });

      await fetchPlaces();
      alert('Massage place deactivated successfully!');
    } catch (error: any) {
      console.error('Error deactivating place:', error);
      alert('Error deactivating place: ' + (error.message || 'Unknown error'));
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'deactivated':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const isExpired = (date?: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Confirm Massage Place Accounts</h2>
        <button
          onClick={fetchPlaces}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-green"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {places.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No massage place accounts found.</p>
            </div>
          ) : (
            places.map((place) => (
              <div
                key={place.$id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Info Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{place.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(place.status)}`}>
                        {place.status}
                      </span>
                      {place.status === 'active' && place.activeMembershipDate && (
                        <span className={`px-2 py-0.5 text-xs rounded-full ${isExpired(place.activeMembershipDate) ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {isExpired(place.activeMembershipDate) ? 'Expired' : `Until ${new Date(place.activeMembershipDate).toLocaleDateString()}`}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{place.email}</p>
                    {place.whatsappNumber && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        📱 WhatsApp: {place.whatsappNumber}
                      </p>
                    )}
                    {(place.city || place.country) && (
                      <p className="text-xs text-gray-500 mt-1">
                        📍 {[place.city, place.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {place.activeMembershipDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        🗓️ Membership: {new Date(place.activeMembershipDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                  </div>

                  {/* Actions Section */}
                  <div className="flex flex-col gap-2 md:items-end">
                    {place.status === 'pending' || place.status === 'deactivated' || (place.status === 'active' && isExpired(place.activeMembershipDate)) ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          id={`membership-${place.$id}`}
                          className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent"
                          disabled={updatingId === place.$id}
                        >
                          {membershipOptions.map((opt) => (
                            <option key={opt.value} value={opt.months}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <Button
                          variant="primary"
                          className="px-4 py-1.5 text-sm whitespace-nowrap"
                          disabled={updatingId === place.$id}
                          onClick={() => {
                            const select = document.getElementById(`membership-${place.$id}`) as HTMLSelectElement;
                            handleActivate(place.$id, parseInt(select.value));
                          }}
                        >
                          {updatingId === place.$id ? 'Activating...' : 'Activate'}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          className="px-4 py-1.5 text-sm"
                          disabled={updatingId === place.$id}
                          onClick={() => handleDeactivate(place.$id)}
                        >
                          {updatingId === place.$id ? 'Processing...' : 'Deactivate'}
                        </Button>
                        <select
                          id={`renew-${place.$id}`}
                          className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent"
                          disabled={updatingId === place.$id}
                        >
                          {membershipOptions.map((opt) => (
                            <option key={opt.value} value={opt.months}>
                              Renew {opt.label}
                            </option>
                          ))}
                        </select>
                        <Button
                          variant="primary"
                          className="px-4 py-1.5 text-sm"
                          disabled={updatingId === place.$id}
                          onClick={() => {
                            const select = document.getElementById(`renew-${place.$id}`) as HTMLSelectElement;
                            handleActivate(place.$id, parseInt(select.value));
                          }}
                        >
                          Renew
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ConfirmPlacesPage;
