import React, { useEffect, useState } from 'react';
import Button from '../components/Button';
import { therapistService, authService } from '../lib/appwriteService';

interface PendingTherapist {
  $id: string;
  name: string;
  email: string;
  city: string;
  country: string;
  whatsappNumber?: string;
  profilePicture?: string;
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

const ConfirmTherapistsPage: React.FC = () => {
  const [therapists, setTherapists] = useState<PendingTherapist[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await authService.createAnonymousSession().catch(console.error);
      fetchTherapists();
    };
    init();
  }, []);

  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const data = await therapistService.getAll();
      const formattedData = data.map((t: any) => ({
        $id: t.$id,
        name: t.name || 'No name',
        email: t.email || 'No email',
        city: t.city || '',
        country: t.country || '',
        whatsappNumber: t.whatsappNumber || t.phoneNumber || '',
        profilePicture: t.profilePicture || '',
        status: t.status || 'pending',
        membershipPackage: t.membershipPackage,
        activeMembershipDate: t.activeMembershipDate,
      }));
      setTherapists(formattedData);
    } catch (error) {
      console.error('Error fetching therapists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (therapistId: string, membershipMonths: number) => {
    setUpdatingId(therapistId);
    try {
      const newExpiryDate = new Date();
      newExpiryDate.setMonth(newExpiryDate.getMonth() + membershipMonths);
      const newExpiryDateString = newExpiryDate.toISOString().split('T')[0];

      await therapistService.update(therapistId, {
        id: Date.now().toString(),
        therapistId: Date.now().toString(),
        hotelId: Date.now().toString(),
        status: 'active',
        isLive: true,
        activeMembershipDate: newExpiryDateString,
      });

      // Refresh list
      await fetchTherapists();
      alert(`Therapist activated with ${membershipMonths} month(s) membership!`);
    } catch (error: any) {
      console.error('Error activating therapist:', error);
      alert('Error activating therapist: ' + (error.message || 'Unknown error'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeactivate = async (therapistId: string) => {
    setUpdatingId(therapistId);
    try {
      await therapistService.update(therapistId, {
        id: Date.now().toString(),
        therapistId: Date.now().toString(),
        hotelId: Date.now().toString(),
        status: 'deactivated',
        isLive: false,
      });

      await fetchTherapists();
      alert('Therapist deactivated successfully!');
    } catch (error: any) {
      console.error('Error deactivating therapist:', error);
      alert('Error deactivating therapist: ' + (error.message || 'Unknown error'));
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
        <h2 className="text-xl font-bold text-gray-800">Confirm Therapist Accounts</h2>
        <button
          onClick={fetchTherapists}
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
          {therapists.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No therapist accounts found.</p>
            </div>
          ) : (
            therapists.map((therapist) => (
              <div
                key={therapist.$id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Profile Image Section */}
                  <div className="flex-shrink-0">
                    {therapist.profilePicture ? (
                      <img
                        src={therapist.profilePicture}
                        alt={therapist.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-green-500"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-red-500 flex items-center justify-center">
                        <span className="text-gray-400 text-2xl">👤</span>
                      </div>
                    )}
                    <p className="text-xs text-center mt-1 font-medium">
                      {therapist.profilePicture ? (
                        <span className="text-green-600">✓ Image Set</span>
                      ) : (
                        <span className="text-red-600">⚠ No Image</span>
                      )}
                    </p>
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{therapist.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(therapist.status)}`}>
                        {therapist.status}
                      </span>
                      {therapist.status === 'active' && therapist.activeMembershipDate && (
                        <span className={`px-2 py-0.5 text-xs rounded-full ${isExpired(therapist.activeMembershipDate) ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {isExpired(therapist.activeMembershipDate) ? 'Expired' : `Until ${new Date(therapist.activeMembershipDate).toLocaleDateString()}`}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{therapist.email}</p>
                    {therapist.whatsappNumber && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        📱 WhatsApp: {therapist.whatsappNumber}
                      </p>
                    )}
                    {(therapist.city || therapist.country) && (
                      <p className="text-xs text-gray-500 mt-1">
                        📍 {[therapist.city, therapist.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {therapist.activeMembershipDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        🗓️ Membership: {new Date(therapist.activeMembershipDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                  </div>

                  {/* Actions Section */}
                  <div className="flex flex-col gap-2 md:items-end">
                    {therapist.status === 'pending' || therapist.status === 'deactivated' || (therapist.status === 'active' && isExpired(therapist.activeMembershipDate)) ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          id={`membership-${therapist.$id}`}
                          className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent"
                          disabled={updatingId === therapist.$id}
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
                          disabled={updatingId === therapist.$id}
                          onClick={() => {
                            const select = document.getElementById(`membership-${therapist.$id}`) as HTMLSelectElement;
                            handleActivate(therapist.$id, parseInt(select.value));
                          }}
                        >
                          {updatingId === therapist.$id ? 'Activating...' : 'Activate'}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          className="px-4 py-1.5 text-sm"
                          disabled={updatingId === therapist.$id}
                          onClick={() => handleDeactivate(therapist.$id)}
                        >
                          {updatingId === therapist.$id ? 'Processing...' : 'Deactivate'}
                        </Button>
                        <select
                          id={`renew-${therapist.$id}`}
                          className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent"
                          disabled={updatingId === therapist.$id}
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
                          disabled={updatingId === therapist.$id}
                          onClick={() => {
                            const select = document.getElementById(`renew-${therapist.$id}`) as HTMLSelectElement;
                            handleActivate(therapist.$id, parseInt(select.value));
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

export default ConfirmTherapistsPage;
