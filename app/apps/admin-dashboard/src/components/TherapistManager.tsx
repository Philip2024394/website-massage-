import React, { useEffect, useState } from 'react';
import { 
    Users, UserCheck, AlertCircle, RefreshCw, Eye, EyeOff, 
    Edit3, Save, X, CheckCircle, Clock, Star, MapPin 
} from 'lucide-react';
import { therapistService } from '../../../../../lib/appwrite/services/therapist.service';

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
  isLive?: boolean;
  description?: string;
  experience?: string;
  pricing?: any;
  mainImage?: string;
  additionalImages?: string[];
  languages?: string[];
  yearsOfExperience?: number;
  massageTypes?: string;
  discountPercentage?: number;
  hotelDiscount?: number;
  villaDiscount?: number;
  location?: string;
  coordinates?: string;
}

interface TherapistManagerProps {
  onBack: () => void;
}

const TherapistManager: React.FC<TherapistManagerProps> = ({ onBack }) => {
  const [therapists, setTherapists] = useState<PendingTherapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'deactivated'>('all');

  useEffect(() => {
    const init = async () => {
      // DISABLED: Anonymous session - use public collection permissions
      // await authService.createAnonymousSession().catch(console.error);
      fetchTherapists();
    };
    init();
  }, []);

  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const data = await therapistService.getAll();
      console.log('🔍 Fetched therapists:', data.length);
      
      // Quick check for pricing data
      const withPricing = data.filter((t: any) => t.pricing && t.pricing !== '{"60":0,"90":0,"120":0}').length;
      console.log(`💰 Pricing status: ${withPricing}/${data.length} therapists have pricing data`);
      
      const formattedData = data.map((t: any) => ({
        $id: t.$id,
        name: t.name || 'No name',
        email: t.email || 'No email',
        city: t.city || '',
        country: t.country || '',
        whatsappNumber: t.whatsappNumber || t.phoneNumber || '',
        profilePicture: t.profilePicture || '',
        mainImage: t.mainImage || '',
        additionalImages: t.additionalImages || [],
        massageTypes: t.massageTypes || '',
        languages: t.languages || [],
        description: t.description || '',
        experience: t.experience || '',
        specialties: t.specialties || [],
        // Prefer explicit stored status if valid; fall back to isLive heuristic
        status: (['pending','active','deactivated'].includes(t.status) 
          ? t.status 
          : (t.isLive ? 'active' : 'pending')) as 'pending' | 'active' | 'deactivated',
        membershipPackage: t.membershipPackage,
        activeMembershipDate: t.activeMembershipDate,
        isLive: t.isLive || false,
        pricing: t.pricing,
        hotelVillaPricing: t.hotelVillaPricing,
        discountPercentage: t.discountPercentage || 0,
        hotelDiscount: t.hotelDiscount || 20,
        villaDiscount: t.villaDiscount || 20,
        hotelVillaServiceStatus: t.hotelVillaServiceStatus || 'inactive',
        location: t.location || '',
        coordinates: t.coordinates || '',
        yearsOfExperience: t.yearsOfExperience || 0,
        isLicensed: t.isLicensed || false,
        licenseNumber: t.licenseNumber || ''
      }));
      
      console.log('✅ Formatted therapist data:', formattedData);
      console.log('🔴 Therapists with isLive=true:', formattedData.filter((t: any) => t.isLive === true));
      console.log('⚪ Therapists with isLive=false:', formattedData.filter((t: any) => t.isLive === false));
      
      setTherapists(formattedData);
    } catch (error) {
      console.error('❌ Error fetching therapists:', error);
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

      console.log('🔄 Admin activating therapist:', therapistId);
      console.log('📅 Setting expiry date:', newExpiryDateString);
      console.log('✅ Setting isLive: true');

      // Fetch existing data to preserve all fields
      let existingTherapist: any = null;
      try {
        existingTherapist = await therapistService.getById(therapistId);
        console.log('📖 Found existing therapist for activation');
      } catch {
        console.log('⚠️ Could not fetch existing data for activation');
      }

      // Prepare activation update with data preservation
      const updateData = {
        isLive: true,
        status: 'active',
        activeMembershipDate: newExpiryDateString,
        // Preserve all existing fields if available (valid schema attributes only)
        ...(existingTherapist && {
          name: existingTherapist.name,
          email: existingTherapist.email,
          whatsappNumber: existingTherapist.whatsappNumber,
          city: existingTherapist.city,
          country: existingTherapist.country,
          profilePicture: existingTherapist.profilePicture,
          mainImage: existingTherapist.mainImage,
          description: existingTherapist.description,
          experience: existingTherapist.experience,
          specialties: existingTherapist.specialties,
          languages: existingTherapist.languages,
          massageTypes: existingTherapist.massageTypes,
          pricing: existingTherapist.pricing,
          hotelVillaPricing: existingTherapist.hotelVillaPricing,
          discountPercentage: existingTherapist.discountPercentage,
          additionalImages: existingTherapist.additionalImages,
          hotelDiscount: existingTherapist.hotelDiscount,
          villaDiscount: existingTherapist.villaDiscount,
          hotelVillaServiceStatus: existingTherapist.hotelVillaServiceStatus,
          location: existingTherapist.location,
          coordinates: existingTherapist.coordinates,
          yearsOfExperience: existingTherapist.yearsOfExperience,
          isLicensed: existingTherapist.isLicensed,
          licenseNumber: existingTherapist.licenseNumber
        })
      };

      console.log('📋 Final update data keys:', Object.keys(updateData));
      
      await therapistService.update(therapistId, updateData);
      
      console.log('✅ Successfully activated therapist');
      
      // Update local state
      setTherapists(prev => 
        prev.map(therapist => 
          therapist.$id === therapistId 
            ? { ...therapist, status: 'active' as const, isLive: true, activeMembershipDate: newExpiryDateString }
            : therapist
        )
      );
      
      // Show success message
      alert(`✅ Therapist activated successfully! They are now LIVE and visible on the main site.`);
      
    } catch (error: any) {
      console.error('❌ Failed to activate therapist:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      alert(`❌ Failed to activate therapist: ${errorMessage}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeactivate = async (therapistId: string) => {
    setUpdatingId(therapistId);
    try {
      await therapistService.update(therapistId, {
        isLive: false,
        status: 'deactivated'
      });
      
      setTherapists(prev => 
        prev.map(therapist => 
          therapist.$id === therapistId 
            ? { ...therapist, status: 'deactivated' as const, isLive: false }
            : therapist
        )
      );
      
      alert('✅ Therapist deactivated successfully!');
      
    } catch (error: any) {
      console.error('❌ Failed to deactivate therapist:', error);
      alert(`❌ Failed to deactivate therapist: ${error?.message || 'Unknown error'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         therapist.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (therapist.city || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || therapist.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (therapist: PendingTherapist) => {
    const isLiveStatus = therapist.isLive;
    const status = therapist.status;
    
    if (isLiveStatus && status === 'active') {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        LIVE
      </span>;
    }
    
    if (status === 'deactivated') {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1">
        <X className="w-3 h-3" />
        Deactivated
      </span>;
    }
    
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1">
      <Clock className="w-3 h-3" />
      Pending
    </span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-orange-600" />
          <span>Loading therapists...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                <span className="text-black">Inda</span>
                <span className="text-orange-500">Street</span> Therapist Manager
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={fetchTherapists}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search therapists by name, email, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold">{therapists.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Live</p>
                <p className="text-xl font-bold text-green-600">
                  {therapists.filter(t => t.isLive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-bold text-yellow-600">
                  {therapists.filter(t => t.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <X className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Deactivated</p>
                <p className="text-xl font-bold text-red-600">
                  {therapists.filter(t => t.status === 'deactivated').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Therapist List */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Therapist
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTherapists.map((therapist) => (
                  <tr key={therapist.$id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {therapist.profilePicture ? (
                          <img
                            src={therapist.profilePicture}
                            alt={therapist.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{therapist.name}</p>
                          <p className="text-sm text-gray-500">{therapist.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {therapist.whatsappNumber || 'No WhatsApp'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {therapist.city}, {therapist.country}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(therapist)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {!therapist.isLive ? (
                          <button
                            onClick={() => handleActivate(therapist.$id, 1)}
                            disabled={updatingId === therapist.$id}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {updatingId === therapist.$id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeactivate(therapist.$id)}
                            disabled={updatingId === therapist.$id}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {updatingId === therapist.$id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <EyeOff className="w-3 h-3" />
                            )}
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredTherapists.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No therapists found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search criteria' : 'No therapists match the current filter'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistManager;