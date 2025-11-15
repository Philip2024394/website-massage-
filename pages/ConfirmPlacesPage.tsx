import React, { useEffect, useState } from 'react';
import Button from '../components/Button';
import ImageUpload from '../components/ImageUpload';
import { placeService, authService } from '../lib/appwriteService';
import { membershipOptions } from '../constants/languages';
import { LanguageSelector } from '../components/admin/LanguageSelector';

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
  membershipStartDate?: string;
  mainImage?: string;
  description?: string;
  address?: string;
  facilities?: string[];
  pricing?: any;
  hotelVillaPricing?: any;
  additionalImages?: string[];
  amenities?: string[];
  massageTypes?: string;
  discountPercentage?: number;
  openingTime?: string;
  closingTime?: string;
  languages?: string[];
  isLive?: boolean;
}

interface EditPlaceModalData {
  $id: string;
  name: string;
  email: string;
  country: string;
  whatsappNumber: string;
  mainImage: string;
  description: string;
  address: string;
  facilities: string[];
  pricing: {
    standard?: string;
    premium?: string;
    luxury?: string;
  };
  additionalImages: string[];
  amenities: string[];
  languages: string[];
  discountPercentage: number;
}

const ConfirmPlacesPage: React.FC = () => {
  const [places, setPlaces] = useState<PendingPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingPlace, setEditingPlace] = useState<EditPlaceModalData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

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
        mainImage: p.mainImage || '',
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
        isLive: true,
        status: 'active',
        activeMembershipDate: newExpiryDateString,
      });

      // Refresh list
      await fetchPlaces();
      alert(`Massage place membership set to ${membershipMonths} month(s)!`);
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
        isLive: false,
        status: 'deactivated'
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

  const handleEditPlace = (place: PendingPlace) => {
    const editData: EditPlaceModalData = {
      $id: place.$id,
      name: place.name || '',
      email: place.email || '',
      country: place.country || '',
      whatsappNumber: place.whatsappNumber || '',
      mainImage: place.mainImage || '',
      description: place.description || '',
      address: place.address || '',
      facilities: Array.isArray(place.facilities) ? place.facilities : [],
      pricing: place.pricing || {
        standard: '',
        premium: '',
        luxury: ''
      },
      additionalImages: Array.isArray(place.additionalImages) ? place.additionalImages : [],
      amenities: Array.isArray(place.amenities) ? place.amenities : [],
      languages: Array.isArray(place.languages) ? place.languages : [],
      discountPercentage: place.discountPercentage || 0
    };
    setEditingPlace(editData);
    setShowEditModal(true);
  };

  const handleSaveEditPlace = async () => {
    if (!editingPlace) return;
    
    setUpdatingId(editingPlace.$id);
    try {
      await placeService.update(editingPlace.$id, {
        name: editingPlace.name,
        email: editingPlace.email,
        country: editingPlace.country,
        whatsappNumber: editingPlace.whatsappNumber,
        mainImage: editingPlace.mainImage,
        description: editingPlace.description,
        address: editingPlace.address,
        facilities: editingPlace.facilities,
        pricing: editingPlace.pricing,
        additionalImages: editingPlace.additionalImages,
        amenities: editingPlace.amenities,
        languages: editingPlace.languages,
        discountPercentage: editingPlace.discountPercentage
      });

      await fetchPlaces();
      setShowEditModal(false);
      setEditingPlace(null);
      alert('Massage place updated successfully!');
    } catch (error: any) {
      console.error('Error updating place:', error);
      alert('Error updating place: ' + (error.message || 'Unknown error'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCloseEditPlaceModal = () => {
    setShowEditModal(false);
    setEditingPlace(null);
  };

  const handleDiscountUpdate = async (placeId: string, discountPercentage: number) => {
    setUpdatingId(placeId);
    try {
      await placeService.update(placeId, {
        discountPercentage: discountPercentage
      });
      
      await fetchPlaces();
      alert(`Discount updated to ${discountPercentage}%!`);
    } catch (error: any) {
      console.error('Error updating discount:', error);
      alert('Error updating discount: ' + (error.message || 'Unknown error'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (placeId: string, placeName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently DELETE "${placeName}"?\n\nThis action CANNOT be undone and will remove:\n- Profile and all data\n- Reviews and ratings\n- Membership history\n- Profile images\n\nType "DELETE" to confirm.`
    );
    
    if (!confirmed) return;

    const doubleConfirm = window.prompt(
      `To confirm deletion of "${placeName}", type DELETE in capital letters:`
    );

    if (doubleConfirm !== 'DELETE') {
      alert('Deletion cancelled - confirmation text did not match.');
      return;
    }

    setUpdatingId(placeId);
    try {
      await placeService.delete(placeId);
      await fetchPlaces();
      alert(`Massage place "${placeName}" has been permanently deleted.`);
    } catch (error: any) {
      console.error('Error deleting place:', error);
      alert('Error deleting place: ' + (error.message || 'Unknown error'));
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
        <h2 className="text-xl font-bold text-gray-800">Manage Live Massage Place Profiles</h2>
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
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Place Info */}
                  <div className="lg:col-span-1">
                    <div className="flex flex-col items-center text-center">
                      {/* Main Image */}
                      <div className="relative mb-4">
                        {place.mainImage ? (
                          <img
                            src={place.mainImage}
                            alt={place.name}
                            className="w-24 h-24 rounded-lg object-cover border-4 border-green-500"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-lg bg-gray-200 border-4 border-red-500 flex items-center justify-center">
                            <span className="text-gray-400 text-3xl">🏢</span>
                          </div>
                        )}
                        <span className={`absolute -bottom-1 -right-1 px-2 py-0.5 text-xs rounded-full ${getStatusColor(place.status)}`}>
                          {place.status}
                        </span>
                      </div>

                      {/* Basic Info */}
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{place.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{place.email}</p>
                      
                      {place.whatsappNumber && (
                        <p className="text-sm text-green-600 font-medium mb-2">
                          📱 {place.whatsappNumber}
                        </p>
                      )}
                      
                      {(place.city || place.country) && (
                        <p className="text-xs text-gray-500 mb-2">
                          📍 {[place.city, place.country].filter(Boolean).join(', ')}
                        </p>
                      )}

                      {(place.openingTime && place.closingTime) && (
                        <p className="text-xs text-blue-600 mb-2">
                          🕒 {place.openingTime} - {place.closingTime}
                        </p>
                      )}

                      {/* Membership Status */}
                      {place.status === 'active' && place.activeMembershipDate && (
                        <span className={`px-3 py-1 text-xs rounded-full ${isExpired(place.activeMembershipDate) ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {isExpired(place.activeMembershipDate) ? 'Expired' : `Until ${new Date(place.activeMembershipDate).toLocaleDateString()}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle Column - Services & Pricing */}
                  <div className="lg:col-span-1 space-y-4">
                    {/* Massage Types */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Services Offered</h4>
                      <div className="space-y-2">
                        {place.massageTypes && typeof place.massageTypes === 'string' ? (
                          (() => {
                            try {
                              const types = JSON.parse(place.massageTypes);
                              return (
                                <div className="flex flex-wrap gap-1">
                                  {types.map((type: string, index: number) => (
                                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              );
                            } catch {
                              return <span className="text-xs text-gray-400">No services set</span>;
                            }
                          })()
                        ) : (
                          <span className="text-xs text-gray-400">No services set</span>
                        )}
                      </div>
                    </div>

                    {/* Facilities */}
                    {place.facilities && place.facilities.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Facilities</h4>
                        <div className="flex flex-wrap gap-1">
                          {place.facilities.map((facility: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {facility}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Standard Pricing */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Standard Rates</h4>
                      <div className="space-y-1">
                        {place.pricing && typeof place.pricing === 'string' ? (
                          (() => {
                            try {
                              const pricing = JSON.parse(place.pricing);
                              return (
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div className="bg-green-50 p-2 rounded text-center">
                                    <div className="font-medium">60min</div>
                                    <div className="text-green-600">{pricing['60'] || 0}k</div>
                                  </div>
                                  <div className="bg-green-50 p-2 rounded text-center">
                                    <div className="font-medium">90min</div>
                                    <div className="text-green-600">{pricing['90'] || 0}k</div>
                                  </div>
                                  <div className="bg-green-50 p-2 rounded text-center">
                                    <div className="font-medium">120min</div>
                                    <div className="text-green-600">{pricing['120'] || 0}k</div>
                                  </div>
                                </div>
                              );
                            } catch {
                              return <span className="text-xs text-gray-400">No pricing set</span>;
                            }
                          })()
                        ) : (
                          <span className="text-xs text-gray-400">No pricing set</span>
                        )}
                      </div>
                    </div>

                    {/* Hotel/Villa Pricing */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Hotel/Villa Rates</h4>
                      <div className="space-y-1">
                        {place.hotelVillaPricing && typeof place.hotelVillaPricing === 'string' ? (
                          (() => {
                            try {
                              const hotelPricing = JSON.parse(place.hotelVillaPricing);
                              return (
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div className="bg-orange-50 p-2 rounded text-center">
                                    <div className="font-medium">60min</div>
                                    <div className="text-orange-600">{hotelPricing['60'] || 0}k</div>
                                  </div>
                                  <div className="bg-orange-50 p-2 rounded text-center">
                                    <div className="font-medium">90min</div>
                                    <div className="text-orange-600">{hotelPricing['90'] || 0}k</div>
                                  </div>
                                  <div className="bg-orange-50 p-2 rounded text-center">
                                    <div className="font-medium">120min</div>
                                    <div className="text-orange-600">{hotelPricing['120'] || 0}k</div>
                                  </div>
                                </div>
                              );
                            } catch {
                              return <span className="text-xs text-gray-400">Same as standard rates</span>;
                            }
                          })()
                        ) : (
                          <span className="text-xs text-gray-400">Same as standard rates</span>
                        )}
                      </div>
                    </div>

                    {/* Discount */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Current Discount</h4>
                      <div className="flex items-center gap-2">
                        <select
                          value={place.discountPercentage || 0}
                          onChange={(e) => handleDiscountUpdate(place.$id, parseInt(e.target.value))}
                          disabled={updatingId === place.$id}
                          className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent"
                        >
                          <option value={0}>No Discount</option>
                          <option value={5}>5% Off</option>
                          <option value={10}>10% Off</option>
                          <option value={15}>15% Off</option>
                          <option value={20}>20% Off</option>
                        </select>
                        {(place.discountPercentage && place.discountPercentage > 0) && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                            {place.discountPercentage}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Actions */}
                  <div className="lg:col-span-1 space-y-4">
                    {/* Status Control */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Account Status</h4>
                      
                      {place.status === 'pending' || place.status === 'deactivated' || (place.status === 'active' && isExpired(place.activeMembershipDate)) ? (
                        <div className="space-y-3">
                          <select
                            id={`membership-${place.$id}`}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent"
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
                            className="w-full py-2 text-sm font-medium"
                            disabled={updatingId === place.$id}
                            onClick={() => {
                              const select = document.getElementById(`membership-${place.$id}`) as HTMLSelectElement;
                              handleActivate(place.$id, parseInt(select.value));
                            }}
                          >
                            {updatingId === place.$id ? 'Setting Membership...' : '💳 Set Membership Status'}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <span className="text-green-700 font-medium">✅ Account Active</span>
                          </div>
                          
                          <Button
                            variant="secondary"
                            className="w-full py-2 text-sm bg-yellow-600 hover:bg-yellow-700 text-white"
                            disabled={updatingId === place.$id}
                            onClick={() => handleDeactivate(place.$id)}
                          >
                            {updatingId === place.$id ? 'Deactivating...' : '⏸️ Deactivate'}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button
                        variant="secondary"
                        className="w-full py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={updatingId === place.$id}
                        onClick={() => handleEditPlace(place)}
                      >
                        ✏️ Edit Full Profile
                      </Button>
                      
                      <Button
                        variant="secondary"
                        className="w-full py-2 text-sm bg-red-600 hover:bg-red-700 text-white"
                        disabled={updatingId === place.$id}
                        onClick={() => handleDelete(place.$id, place.name)}
                      >
                        🗑️ Delete Account
                      </Button>
                    </div>

                    {/* Membership Info */}
                    {place.activeMembershipDate && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h5 className="text-xs font-medium text-gray-700 mb-1">Membership Details</h5>
                        <p className="text-xs text-gray-600">
                          �️ Active until: {new Date(place.activeMembershipDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        {place.membershipStartDate && (
                          <p className="text-xs text-gray-600">
                            📅 Started: {new Date(place.membershipStartDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Edit Place Modal */}
      {showEditModal && editingPlace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pb-20">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Edit Massage Place</h3>
                <button
                  onClick={handleCloseEditPlaceModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={editingPlace.name}
                      onChange={(e) => setEditingPlace({...editingPlace, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={editingPlace.email}
                      onChange={(e) => setEditingPlace({...editingPlace, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={editingPlace.whatsappNumber}
                      onChange={(e) => setEditingPlace({...editingPlace, whatsappNumber: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      placeholder="+62812345678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={editingPlace.country}
                      onChange={(e) => setEditingPlace({...editingPlace, country: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Languages */}
                <LanguageSelector
                  selectedLanguages={editingPlace.languages}
                  onLanguagesChange={(languages) => setEditingPlace({
                    ...editingPlace,
                    languages
                  })}
                />

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address
                  </label>
                  <textarea
                    value={editingPlace.address}
                    onChange={(e) => setEditingPlace({...editingPlace, address: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    placeholder="Complete address with landmarks..."
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingPlace.description}
                    onChange={(e) => setEditingPlace({...editingPlace, description: e.target.value})}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    placeholder="Business description, ambiance, specialties..."
                  />
                </div>

                {/* Main Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Main Business Image
                  </label>
                  <div className="flex items-center gap-4 pb-20">
                    {editingPlace.mainImage && (
                      <img 
                        src={editingPlace.mainImage} 
                        alt="Main" 
                        className="w-32 h-20 object-cover rounded border-2 border-gray-300"
                      />
                    )}
                    <ImageUpload
                      id="place-main-image"
                      label="Upload Main Business Image"
                      currentImage={editingPlace.mainImage}
                      onImageChange={(url: string) => setEditingPlace({...editingPlace, mainImage: url})}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Pricing Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Pricing (IDR)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-20">
                    <div className="border border-gray-300 rounded-lg p-4 pb-20">
                      <h4 className="font-medium text-gray-800 mb-2">Standard Package</h4>
                      <input
                        type="text"
                        value={editingPlace.pricing?.standard || ''}
                        onChange={(e) => setEditingPlace({
                          ...editingPlace, 
                          pricing: {
                            ...editingPlace.pricing,
                            standard: e.target.value
                          }
                        })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="150000"
                      />
                    </div>
                    <div className="border border-gray-300 rounded-lg p-4 pb-20">
                      <h4 className="font-medium text-gray-800 mb-2">Premium Package</h4>
                      <input
                        type="text"
                        value={editingPlace.pricing?.premium || ''}
                        onChange={(e) => setEditingPlace({
                          ...editingPlace, 
                          pricing: {
                            ...editingPlace.pricing,
                            premium: e.target.value
                          }
                        })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="250000"
                      />
                    </div>
                    <div className="border border-gray-300 rounded-lg p-4 pb-20">
                      <h4 className="font-medium text-gray-800 mb-2">Luxury Package</h4>
                      <input
                        type="text"
                        value={editingPlace.pricing?.luxury || ''}
                        onChange={(e) => setEditingPlace({
                          ...editingPlace, 
                          pricing: {
                            ...editingPlace.pricing,
                            luxury: e.target.value
                          }
                        })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="500000"
                      />
                    </div>
                  </div>
                </div>

                {/* Facilities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facilities
                  </label>
                  <input
                    type="text"
                    value={editingPlace.facilities.join(', ')}
                    onChange={(e) => setEditingPlace({
                      ...editingPlace, 
                      facilities: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    placeholder="Private Rooms, Jacuzzi, Steam Room, Sauna"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple facilities with commas</p>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amenities
                  </label>
                  <input
                    type="text"
                    value={editingPlace.amenities.join(', ')}
                    onChange={(e) => setEditingPlace({
                      ...editingPlace, 
                      amenities: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    placeholder="Parking, WiFi, Air Conditioning, Refreshments"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple amenities with commas</p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={handleCloseEditPlaceModal}
                  disabled={updatingId === editingPlace.$id}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveEditPlace}
                  disabled={updatingId === editingPlace.$id}
                  className="bg-brand-green hover:bg-green-700"
                >
                  {updatingId === editingPlace.$id ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmPlacesPage;

