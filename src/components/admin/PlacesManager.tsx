/**
 * ============================================================================
 * 🏢 PLACES MANAGER - Massage Places & Skin Clinics Management
 * ============================================================================
 * 
 * Dedicated component for managing all places including massage places and 
 * skin clinics. Uses existing adminServices - safe and non-breaking.
 * 
 * Features:
 * ✅ View all places (massage places + skin clinics)
 * ✅ Filter by place type
 * ✅ Edit place details
 * ✅ Update place status
 * ✅ Manage services and pricing
 * ✅ Safe error handling
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { adminPlacesService } from '@/lib/adminServices';
import { AdminGuardDev } from '@/lib/adminGuard';

// ============================================================================
// 🎯 PLACES MANAGER COMPONENT
// ============================================================================

export const PlacesManager: React.FC = () => {
  const [places, setPlaces] = useState<any[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [filter, setFilter] = useState<'all' | 'massage' | 'facial'>('all');
  
  // ============================================================================
  // 📊 DATA LOADING
  // ============================================================================
  
  const loadPlaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminPlacesService.getAll();
      setPlaces(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load places');
      console.error('Error loading places:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadPlaces();
  }, []);
  
  // ============================================================================
  // 🔍 FILTERING
  // ============================================================================
  
  useEffect(() => {
    if (filter === 'all') {
      setFilteredPlaces(places);
    } else if (filter === 'massage') {
      setFilteredPlaces(places.filter(place => !place.isFacialPlace));
    } else if (filter === 'facial') {
      setFilteredPlaces(places.filter(place => place.isFacialPlace));
    }
  }, [places, filter]);
  
  // ============================================================================
  // 🛠️ CRUD OPERATIONS
  // ============================================================================
  
  const handleEdit = (place: any) => {
    setSelectedPlace(place);
    setEditMode(true);
  };
  
  const handleSave = async (updatedData: any) => {
    if (!selectedPlace) return;
    
    try {
      await adminPlacesService.update(selectedPlace.$id, updatedData);
      await loadPlaces(); // Refresh list
      setEditMode(false);
      setSelectedPlace(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update place');
    }
  };
  
  const handleStatusChange = async (placeId: string, newStatus: string) => {
    try {
      await adminPlacesService.update(placeId, { status: newStatus });
      await loadPlaces();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };
  
  const handleVerificationChange = async (placeId: string, isVerified: boolean) => {
    try {
      await adminPlacesService.update(placeId, { isVerified });
      await loadPlaces();
    } catch (err: any) {
      setError(err.message || 'Failed to update verification status');
    }
  };
  
  // ============================================================================
  // 🎨 RENDER COMPONENTS
  // ============================================================================
  
  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading places...</p>
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
            <h3 className="text-red-800 font-semibold">Error Loading Places</h3>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <button 
            onClick={loadPlaces}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  const massagePlaces = places.filter(p => !p.isFacialPlace);
  const skinClinics = places.filter(p => p.isFacialPlace);
  const activePlaces = places.filter(p => p.status === 'active');
  const verifiedPlaces = places.filter(p => p.isVerified);
  
  return (
    <AdminGuardDev>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🏢 Places Management
          </h1>
          <p className="text-gray-600">
            Manage all massage places and skin clinics, update details and status
          </p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-blue-800 font-semibold">Total Places</h3>
            <p className="text-2xl font-bold text-blue-600">{places.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-green-800 font-semibold">Massage Places</h3>
            <p className="text-2xl font-bold text-green-600">{massagePlaces.length}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-purple-800 font-semibold">Skin Clinics</h3>
            <p className="text-2xl font-bold text-purple-600">{skinClinics.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-yellow-800 font-semibold">Active</h3>
            <p className="text-2xl font-bold text-yellow-600">{activePlaces.length}</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4">
            <h3 className="text-indigo-800 font-semibold">Verified</h3>
            <p className="text-2xl font-bold text-indigo-600">{verifiedPlaces.length}</p>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setFilter('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Places ({places.length})
              </button>
              <button
                onClick={() => setFilter('massage')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === 'massage'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Massage Places ({massagePlaces.length})
              </button>
              <button
                onClick={() => setFilter('facial')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === 'facial'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Skin Clinics ({skinClinics.length})
              </button>
            </nav>
          </div>
        </div>
        
        {/* Places List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {filter === 'all' ? 'All Places' : 
               filter === 'massage' ? 'Massage Places' : 'Skin Clinics'}
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Place
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pricing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlaces.map((place) => (
                  <tr key={place.$id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {place.profileImage ? (
                          <img 
                            className="h-12 w-12 rounded-lg object-cover" 
                            src={place.profileImage} 
                            alt={place.name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-lg">
                              {place.isFacialPlace ? '🧔' : '💆'}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {place.name || 'Unnamed Place'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {place.location || 'No location'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        place.isFacialPlace ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {place.isFacialPlace ? 'Skin Clinic' : 'Massage Place'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{place.email || 'No email'}</div>
                      <div className="text-sm text-gray-500">{place.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          place.status === 'active' ? 'bg-green-100 text-green-800' :
                          place.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {place.status || 'unknown'}
                        </span>
                        {place.isVerified && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        {place.price60 && <div>60min: ${place.price60}</div>}
                        {place.price90 && <div>90min: ${place.price90}</div>}
                        {place.price120 && <div>120min: ${place.price120}</div>}
                        {!place.price60 && !place.price90 && !place.price120 && (
                          <span className="text-gray-500">No pricing</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleEdit(place)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <select 
                          value={place.status || 'pending'}
                          onChange={(e) => handleStatusChange(place.$id, e.target.value)}
                          className="text-xs border rounded px-1 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                        {!place.isVerified && (
                          <button
                            onClick={() => handleVerificationChange(place.$id, true)}
                            className="text-green-600 hover:text-green-900 text-xs"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredPlaces.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No places found</p>
              <button 
                onClick={loadPlaces}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
        
        {/* Edit Modal */}
        {editMode && selectedPlace && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Edit Place</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input 
                    type="text"
                    value={selectedPlace.name || ''}
                    onChange={(e) => setSelectedPlace({
                      ...selectedPlace,
                      name: e.target.value
                    })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={selectedPlace.isFacialPlace ? 'facial' : 'massage'}
                    onChange={(e) => setSelectedPlace({
                      ...selectedPlace,
                      isFacialPlace: e.target.value === 'facial'
                    })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="massage">Massage Place</option>
                    <option value="facial">Skin Clinic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input 
                    type="email"
                    value={selectedPlace.email || ''}
                    onChange={(e) => setSelectedPlace({
                      ...selectedPlace,
                      email: e.target.value
                    })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input 
                    type="tel"
                    value={selectedPlace.phone || ''}
                    onChange={(e) => setSelectedPlace({
                      ...selectedPlace,
                      phone: e.target.value
                    })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input 
                    type="text"
                    value={selectedPlace.location || ''}
                    onChange={(e) => setSelectedPlace({
                      ...selectedPlace,
                      location: e.target.value
                    })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    60min Price
                  </label>
                  <input 
                    type="number"
                    value={selectedPlace.price60 || ''}
                    onChange={(e) => setSelectedPlace({
                      ...selectedPlace,
                      price60: e.target.value
                    })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    90min Price
                  </label>
                  <input 
                    type="number"
                    value={selectedPlace.price90 || ''}
                    onChange={(e) => setSelectedPlace({
                      ...selectedPlace,
                      price90: e.target.value
                    })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setEditMode(false);
                    setSelectedPlace(null);
                  }}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(selectedPlace)}
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

export default PlacesManager;