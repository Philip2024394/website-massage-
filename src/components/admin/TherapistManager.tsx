/**
 * ============================================================================
 * 👥 THERAPIST MANAGER - Individual Therapist Management
 * ============================================================================
 * 
 * Dedicated component for detailed therapist management with full CRUD operations.
 * Uses existing adminServices - no breaking changes to current functionality.
 * 
 * Features:
 * ✅ View all therapists
 * ✅ Edit therapist details  
 * ✅ Update therapist status
 * ✅ Verify KTP documents
 * ✅ Manage achievements
 * ✅ Safe error handling
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { adminTherapistService, getTherapistBusyTimer } from '../../lib/adminServices';
import { AdminGuardDev } from '../../lib/adminGuard';

// ============================================================================
// ⏱️ AVAILABILITY CELL – status badge, dropdown, Busy 60/90/120/custom, countdown
// ============================================================================

function BusyCountdown({ busyUntil }: { busyUntil: string | null }) {
    const [left, setLeft] = useState<string>('');
    useEffect(() => {
        if (!busyUntil) {
            setLeft('');
            return;
        }
        const run = () => {
            const end = new Date(busyUntil).getTime();
            const now = Date.now();
            if (end <= now) {
                setLeft('Expired');
                return;
            }
            const d = Math.floor((end - now) / 1000);
            const m = Math.floor(d / 60);
            const s = d % 60;
            setLeft(`${m}m ${s}s`);
        };
        run();
        const t = setInterval(run, 1000);
        return () => clearInterval(t);
    }, [busyUntil]);
    if (!busyUntil || !left) return null;
    return <span className="text-xs text-orange-700 ml-1">({left})</span>;
}

function AvailabilityCell({
    therapist,
    getAvailabilityInfo,
    onAvailabilityChange
}: {
    therapist: any;
    getAvailabilityInfo: (t: any) => { label: string; busyUntil: string | null; busyDuration: number | null };
    onAvailabilityChange: (id: string, av: 'available' | 'busy' | 'offline', busyMinutes?: number) => void;
}) {
    const info = getAvailabilityInfo(therapist);
    const [customMins, setCustomMins] = useState<string>('60');
    const isBusy = info.label === 'Busy';
    const isOffline = info.label === 'Offline';
    const badgeClass = isOffline
        ? 'bg-gray-200 text-gray-800'
        : isBusy
        ? 'bg-orange-100 text-orange-800'
        : 'bg-green-100 text-green-800';
    return (
        <div className="space-y-1">
            <div className="flex items-center flex-wrap gap-1">
                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${badgeClass}`}>
                    {info.label}
                    {isBusy && <BusyCountdown busyUntil={info.busyUntil} />}
                </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
                <select
                    value={info.label.toLowerCase()}
                    onChange={(e) => {
                        const v = e.target.value as 'available' | 'busy' | 'offline';
                        if (v === 'busy') onAvailabilityChange(therapist.$id, 'busy', 60);
                        else if (v === 'available') onAvailabilityChange(therapist.$id, 'available');
                        else if (v === 'offline') onAvailabilityChange(therapist.$id, 'offline');
                    }}
                    className="text-xs border border-gray-300 rounded px-1.5 py-0.5"
                >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                </select>
                <button
                    type="button"
                    onClick={() => onAvailabilityChange(therapist.$id, 'busy', 60)}
                    className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded hover:bg-orange-200"
                >
                    Busy 60m
                </button>
                <button
                    type="button"
                    onClick={() => onAvailabilityChange(therapist.$id, 'busy', 90)}
                    className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded hover:bg-orange-200"
                >
                    Busy 90m
                </button>
                <button
                    type="button"
                    onClick={() => onAvailabilityChange(therapist.$id, 'busy', 120)}
                    className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded hover:bg-orange-200"
                >
                    Busy 120m
                </button>
                <span className="inline-flex items-center gap-0.5">
                    <input
                        type="number"
                        min={1}
                        max={480}
                        value={customMins}
                        onChange={(e) => setCustomMins(e.target.value)}
                        className="w-12 text-xs border rounded px-1 py-0.5"
                    />
                    <button
                        type="button"
                        onClick={() => onAvailabilityChange(therapist.$id, 'busy', parseInt(customMins, 10) || 60)}
                        className="text-xs bg-orange-200 text-orange-900 px-1 py-0.5 rounded hover:bg-orange-300"
                    >
                        Set
                    </button>
                </span>
            </div>
        </div>
    );
}

// ============================================================================
// 🎯 THERAPIST MANAGER COMPONENT
// ============================================================================

export const TherapistManager: React.FC = () => {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // ============================================================================
  // 📊 DATA LOADING
  // ============================================================================
  
  const loadTherapists = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminTherapistService.getAll();
      setTherapists(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load therapists');
      console.error('Error loading therapists:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadTherapists();
  }, []);
  
  // ============================================================================
  // 🛠️ CRUD OPERATIONS
  // ============================================================================
  
  const handleEdit = (therapist: any) => {
    setSelectedTherapist(therapist);
    setEditMode(true);
  };
  
  const handleSave = async (updatedData: any) => {
    if (!selectedTherapist) return;
    
    try {
      await adminTherapistService.update(selectedTherapist.$id, updatedData);
      await loadTherapists(); // Refresh list
      setEditMode(false);
      setSelectedTherapist(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update therapist');
    }
  };
  
  const handleStatusChange = async (therapistId: string, newStatus: string) => {
    try {
      await adminTherapistService.update(therapistId, { status: newStatus });
      await loadTherapists();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };
  
  const handleKTPVerification = async (therapistId: string, isVerified: boolean) => {
    try {
      await adminTherapistService.verifyKTP(therapistId, isVerified);
      await loadTherapists();
    } catch (err: any) {
      setError(err.message || 'Failed to update KTP status');
    }
  };

  /** Plan: Free = show 3 trending therapists on profile; Standard/Premium = hide trending (paid). */
  const getDisplayPlan = (t: any) => {
    const p = (t.plan ?? t.membershipPlan ?? t.membershipTier ?? '').toString().toLowerCase();
    if (p === 'premium' || p === 'elite' || p === 'pro') return 'Premium';
    if (p === 'middle' || p === 'plus' || p === 'standard' || p === 'trusted') return 'Standard';
    return 'Free';
  };

  const handlePlanChange = async (therapistId: string, planLabel: 'Free' | 'Standard' | 'Premium') => {
    try {
      const planValue = planLabel === 'Free' ? '' : planLabel === 'Standard' ? 'middle' : 'premium';
      await adminTherapistService.update(therapistId, {
        plan: planValue,
        membershipPlan: planValue,
        membershipTier: planValue
      });
      await loadTherapists();
    } catch (err: any) {
      setError(err.message || 'Failed to update plan');
    }
  };

  /** Confirm payment and activate paid plan: sets plan to Standard (middle) and paymentConfirmed. Hides "3 trending therapists" on public profile. */
  const handleConfirmPaymentActivatePaid = async (therapist: any) => {
    if (!window.confirm(`Confirm payment and activate paid plan for ${therapist.name || 'this therapist'}? This will remove the "Trending therapists" section from their public profile.`)) return;
    try {
      const current = getDisplayPlan(therapist);
      const planValue = current === 'Premium' ? 'premium' : 'middle';
      await adminTherapistService.update(therapist.$id, {
        plan: planValue,
        membershipPlan: planValue,
        membershipTier: planValue,
        paymentConfirmed: true,
        subscriptionConfirmed: true
      });
      await loadTherapists();
    } catch (err: any) {
      setError(err.message || 'Failed to confirm payment / activate paid');
    }
  };

  /** Full deactivate: set offline and no longer available. */
  const handleDeactivate = async (therapistId: string) => {
    if (!window.confirm('Deactivate this therapist? They will no longer appear as available.')) return;
    try {
      await adminTherapistService.update(therapistId, {
        status: 'offline',
        availability: 'Offline',
        isLive: false,
      });
      await loadTherapists();
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate');
    }
  };

  /** Admin availability override: available | busy | offline. Busy uses busyUntil (auto-revert). */
  const handleAvailabilityChange = async (therapistId: string, availability: 'available' | 'busy' | 'offline', busyMinutes?: number) => {
    try {
      if (availability === 'available' || availability === 'offline') {
        await adminTherapistService.setAvailability(therapistId, {
          status: availability,
          availability: availability === 'available' ? 'Available' : 'Offline',
          busyUntil: null,
          busyDuration: null
        });
      } else {
        const mins = busyMinutes ?? 60;
        const busyUntil = new Date(Date.now() + mins * 60 * 1000).toISOString();
        await adminTherapistService.setAvailability(therapistId, {
          status: 'busy',
          availability: 'Busy',
          busyUntil,
          busyDuration: mins
        });
      }
      await loadTherapists();
    } catch (err: any) {
      setError(err.message || 'Failed to update availability');
    }
  };

  /** Parse availability and busyUntil for display (from raw doc). */
  const getAvailabilityInfo = (t: any) => {
    const av = (t.availability || t.status || '').toString();
    const st = (t.status || '').toString();
    const { busyUntil, busyDuration } = getTherapistBusyTimer(t);
    const isBusy = /busy/i.test(av) || /busy/i.test(st);
    const isOffline = /offline/i.test(av) || /offline/i.test(st);
    return {
      label: isOffline ? 'Offline' : isBusy ? 'Busy' : 'Available',
      busyUntil: busyUntil || null,
      busyDuration: busyDuration ?? null
    };
  };

  // ============================================================================
  // 🎨 RENDER COMPONENTS
  // ============================================================================
  
  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading therapists...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">⚠️</span>
            <h3 className="text-red-800 font-semibold">Error Loading Therapists</h3>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <button 
            onClick={loadTherapists}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <AdminGuardDev>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            👥 Therapist Management
          </h1>
          <p className="text-gray-600">
            Manage all therapists, verify documents, and update status
          </p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-blue-800 font-semibold">Total Therapists</h3>
            <p className="text-2xl font-bold text-blue-600">{therapists.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-green-800 font-semibold">Active</h3>
            <p className="text-2xl font-bold text-green-600">
              {therapists.filter(t => t.status === 'active').length}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-yellow-800 font-semibold">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {therapists.filter(t => t.status === 'pending').length}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-purple-800 font-semibold">KTP Verified</h3>
            <p className="text-2xl font-bold text-purple-600">
              {therapists.filter(t => t.ktpVerified || t.isKTPVerified).length}
            </p>
          </div>
        </div>
        
        {/* Therapist List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Therapists</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Therapist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KTP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {therapists.map((therapist) => (
                  <tr key={therapist.$id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {therapist.profileImage ? (
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={therapist.profileImage} 
                            alt={therapist.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">
                              {therapist.name?.charAt(0) || 'T'}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {therapist.name || 'Unnamed Therapist'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {therapist.location || 'No location'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{therapist.email || 'No email'}</div>
                      <div className="text-sm text-gray-500">{therapist.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        therapist.status === 'active' ? 'bg-green-100 text-green-800' :
                        therapist.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {therapist.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <AvailabilityCell
                        therapist={therapist}
                        getAvailabilityInfo={getAvailabilityInfo}
                        onAvailabilityChange={handleAvailabilityChange}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        (therapist.ktpVerified || therapist.isKTPVerified) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {(therapist.ktpVerified || therapist.isKTPVerified) ? 'Verified' : 'Not Verified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={getDisplayPlan(therapist)}
                        onChange={(e) => handlePlanChange(therapist.$id, e.target.value as 'Free' | 'Standard' | 'Premium')}
                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                        title="Free = show 3 trending therapists on profile; Standard/Premium = hide trending"
                      >
                        <option value="Free">Free</option>
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                      </select>
                      {(getDisplayPlan(therapist) === 'Free') && (
                        <button
                          type="button"
                          onClick={() => handleConfirmPaymentActivatePaid(therapist)}
                          className="ml-2 text-xs bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700"
                          title="Confirm payment and activate paid plan (hides trending section on profile)"
                        >
                          Confirm payment & activate paid
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(therapist)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <select 
                          value={therapist.status || 'pending'}
                          onChange={(e) => handleStatusChange(therapist.$id, e.target.value)}
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                          <option value="offline">Offline</option>
                        </select>
                        {!(therapist.ktpVerified || therapist.isKTPVerified) && (
                          <button
                            onClick={() => handleKTPVerification(therapist.$id, true)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Verify KTP
                          </button>
                        )}
                        <button
                          onClick={() => handleDeactivate(therapist.$id)}
                          className="text-red-600 hover:text-red-900"
                          title="Deactivate: set offline and no longer available"
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {therapists.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No therapists found</p>
              <button 
                onClick={loadTherapists}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
        
        {/* Edit Modal – full edit (name, description, location, profile image); admin can edit even when 72h locked */}
        {editMode && selectedTherapist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-lg w-full p-6 my-8">
              <h3 className="text-lg font-semibold mb-4">Edit Therapist (full admin control)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input 
                    type="text"
                    value={selectedTherapist.name || ''}
                    onChange={(e) => setSelectedTherapist({ ...selectedTherapist, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    value={selectedTherapist.description || ''}
                    onChange={(e) => setSelectedTherapist({ ...selectedTherapist, description: e.target.value })}
                    rows={4}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input 
                    type="text"
                    value={selectedTherapist.location || ''}
                    onChange={(e) => setSelectedTherapist({ ...selectedTherapist, location: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="e.g. Yogyakarta, Bali"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input 
                    type="text"
                    value={selectedTherapist.city || ''}
                    onChange={(e) => setSelectedTherapist({ ...selectedTherapist, city: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="e.g. Denpasar, Yogyakarta"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country / Location ID</label>
                  <input 
                    type="text"
                    value={selectedTherapist.country || selectedTherapist.locationId || ''}
                    onChange={(e) => setSelectedTherapist({ ...selectedTherapist, country: e.target.value, locationId: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="e.g. Indonesia, ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile image URL</label>
                  <input 
                    type="text"
                    value={selectedTherapist.profilePicture || selectedTherapist.profileImage || ''}
                    onChange={(e) => setSelectedTherapist({
                      ...selectedTherapist,
                      profilePicture: e.target.value,
                      profileImage: e.target.value
                    })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email"
                    value={selectedTherapist.email || ''}
                    onChange={(e) => setSelectedTherapist({ ...selectedTherapist, email: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    type="tel"
                    value={selectedTherapist.phone || selectedTherapist.whatsappNumber || ''}
                    onChange={(e) => setSelectedTherapist({ ...selectedTherapist, phone: e.target.value, whatsappNumber: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => { setEditMode(false); setSelectedTherapist(null); }}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(selectedTherapist)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuardDev>
  );
};

export default TherapistManager;