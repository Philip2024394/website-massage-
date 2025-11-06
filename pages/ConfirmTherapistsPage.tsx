import React, { useEffect, useState } from 'react';
import Button from '../components/Button';
import ImageUpload from '../components/ImageUpload';
import { therapistService, authService } from '../lib/appwriteService';
import { parseMassageTypes, parseLanguages } from '../utils/appwriteHelpers';
import { membershipOptions } from '../constants/languages';
import { LanguageSelector } from '../components/admin/LanguageSelector';

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
  membershipStartDate?: string;
  description?: string;
  experience?: string;
  specialties?: string[];
  pricing?: any;
  mainImage?: string;
  additionalImages?: string[];
  languages?: string[];
  isLive?: boolean;
  yearsOfExperience?: number;
  massageTypes?: string;
  discountPercentage?: number;
  // Schema-compliant fields from database
  hotelDiscount?: number;
  villaDiscount?: number;
  hotelVillaServiceStatus?: string;
  hotelVillaPricing?: any;
  location?: string;
  coordinates?: string;
  isLicensed?: boolean;
  licenseNumber?: string;
}

interface EditModalData {
  $id: string;
  name: string;
  email: string;
  country: string;
  whatsappNumber: string;
  profilePicture: string;
  description: string;
  experience: string;
  specialties: string[];
  pricing: {
    home?: { '60min'?: string; '90min'?: string; '120min'?: string };
    hotelVilla?: { '60min'?: string; '90min'?: string; '120min'?: string };
  };
  discountPercentage: number;
  additionalImages: string[];
  languages: string[];
  massageTypes: string[];
}

const ConfirmTherapistsPage: React.FC = () => {
  const [therapists, setTherapists] = useState<PendingTherapist[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingTherapist, setEditingTherapist] = useState<EditModalData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

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
      console.log('🔍 Fetched therapists:', data.length);
      
      // Quick check for pricing data
      const withPricing = data.filter(t => t.pricing && t.pricing !== '{"60":0,"90":0,"120":0}').length;
      console.log(`💰 Pricing status: ${withPricing}/${data.length} therapists have pricing data`);
      
      const formattedData = data.map((t: any) => ({
        $id: t.$id,
        name: t.name || 'No name',
        email: t.email || 'No email',
        city: t.city || '',
        country: t.country || '',
        whatsappNumber: t.whatsappNumber || t.phoneNumber || '',
        profilePicture: t.profilePicture || '',
        status: (t.isLive ? 'active' : 'pending') as 'pending' | 'active' | 'deactivated', // Map isLive to status for display
        membershipPackage: t.membershipPackage,
        activeMembershipDate: t.activeMembershipDate,
        isLive: t.isLive || false,
        pricing: t.pricing, // Add pricing data to formatted object
        hotelVillaPricing: t.hotelVillaPricing, // Add hotel villa pricing data
        // Add missing fields needed for editing
        description: t.description || '',
        experience: t.experience || '',
        specialties: t.specialties || [],
        languages: t.languages || [],
        massageTypes: t.massageTypes || [],
        discountPercentage: t.discountPercentage || 0,
        additionalImages: t.additionalImages || [],
        hotelDiscount: t.hotelDiscount || 20,
        villaDiscount: t.villaDiscount || 20,
        location: t.location || '',
        coordinates: t.coordinates || '',
        yearsOfExperience: t.yearsOfExperience || 0,
        isLicensed: t.isLicensed || false,
        licenseNumber: t.licenseNumber || ''
      }));
      
      console.log('✅ Formatted therapist data:', formattedData);
      console.log('🔴 Therapists with isLive=true:', formattedData.filter(t => t.isLive === true));
      console.log('⚪ Therapists with isLive=false:', formattedData.filter(t => t.isLive === false));
      
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
        activeMembershipDate: newExpiryDateString,
        // Preserve all existing fields if available (valid schema attributes only)
        ...(existingTherapist && {
          name: existingTherapist.name,
          email: existingTherapist.email,
          whatsappNumber: existingTherapist.whatsappNumber,
          profilePicture: existingTherapist.profilePicture,
          description: existingTherapist.description,
          mainImage: existingTherapist.mainImage,
          yearsOfExperience: existingTherapist.yearsOfExperience,
          massageTypes: existingTherapist.massageTypes,
          languages: existingTherapist.languages,
          pricing: existingTherapist.pricing,
          location: existingTherapist.location,
          coordinates: existingTherapist.coordinates,
          status: existingTherapist.status,
          rating: existingTherapist.rating,
          reviewCount: existingTherapist.reviewCount,
          isLicensed: existingTherapist.isLicensed,
          licenseNumber: existingTherapist.licenseNumber,
          analytics: existingTherapist.analytics,
          hotelVillaServiceStatus: existingTherapist.hotelVillaServiceStatus,
          serviceRadius: existingTherapist.serviceRadius,
          password: existingTherapist.password,
          createdAt: existingTherapist.createdAt
        }),
        // Only include discount fields if they exist in the existing record
        ...(existingTherapist?.hotelDiscount !== undefined && { hotelDiscount: existingTherapist.hotelDiscount }),
        ...(existingTherapist?.villaDiscount !== undefined && { villaDiscount: existingTherapist.villaDiscount })
      };

      await therapistService.update(therapistId, updateData);

      console.log('✅ Therapist activation completed successfully');

      // Refresh list
      await fetchTherapists();
      alert(`Therapist activated with ${membershipMonths} month(s) membership! All therapist data preserved.`);
    } catch (error: any) {
      console.error('❌ Error activating therapist:', error);
      alert('Error activating therapist: ' + (error.message || 'Unknown error. Please try again.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeactivate = async (therapistId: string) => {
    setUpdatingId(therapistId);
    try {
      console.log('🔄 Admin deactivating therapist:', therapistId);
      
      // Fetch existing data to preserve all fields
      let existingTherapist: any = null;
      try {
        existingTherapist = await therapistService.getById(therapistId);
        console.log('📖 Found existing therapist for deactivation');
      } catch {
        console.log('⚠️ Could not fetch existing data for deactivation');
      }

      // Prepare deactivation update with data preservation
      const updateData = {
        status: 'deactivated',
        isLive: false,
        // Preserve all existing fields if available (valid schema attributes only)
        ...(existingTherapist && {
          name: existingTherapist.name,
          email: existingTherapist.email,
          whatsappNumber: existingTherapist.whatsappNumber,
          profilePicture: existingTherapist.profilePicture,
          description: existingTherapist.description,
          mainImage: existingTherapist.mainImage,
          yearsOfExperience: existingTherapist.yearsOfExperience,
          massageTypes: existingTherapist.massageTypes,
          languages: existingTherapist.languages,
          pricing: existingTherapist.pricing,
          location: existingTherapist.location,
          coordinates: existingTherapist.coordinates,
          rating: existingTherapist.rating,
          reviewCount: existingTherapist.reviewCount,
          isLicensed: existingTherapist.isLicensed,
          licenseNumber: existingTherapist.licenseNumber,
          analytics: existingTherapist.analytics,
          hotelVillaServiceStatus: existingTherapist.hotelVillaServiceStatus,
          serviceRadius: existingTherapist.serviceRadius,
          password: existingTherapist.password,
          activeMembershipDate: existingTherapist.activeMembershipDate,
          createdAt: existingTherapist.createdAt
        }),
        // Only include discount fields if they exist in the existing record
        ...(existingTherapist?.hotelDiscount !== undefined && { hotelDiscount: existingTherapist.hotelDiscount }),
        ...(existingTherapist?.villaDiscount !== undefined && { villaDiscount: existingTherapist.villaDiscount })
      };

      await therapistService.update(therapistId, updateData);

      console.log('✅ Therapist deactivation completed successfully');
      await fetchTherapists();
      alert('Therapist deactivated successfully! All therapist data preserved.');
    } catch (error: any) {
      console.error('❌ Error deactivating therapist:', error);
      alert('Error deactivating therapist: ' + (error.message || 'Unknown error. Please try again.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEditTherapist = (therapist: PendingTherapist) => {
    // Parse pricing data from JSON string format to edit modal format
    const parsePricingForEdit = (pricingString: any, hotelDiscount?: number, villaDiscount?: number) => {
      if (!pricingString || typeof pricingString !== 'string') {
        return {
          home: { '60min': '', '90min': '', '120min': '' },
          hotelVilla: { '60min': '', '90min': '', '120min': '' }
        };
      }
      
      try {
        const parsed = JSON.parse(pricingString);
        const avgDiscount = ((hotelDiscount || 20) + (villaDiscount || 20)) / 2;
        
        // Calculate hotel/villa pricing from home pricing + discount
        const hotelPricing = {
          '60min': parsed['60'] ? Math.round(parsed['60'] * (1 - avgDiscount/100)).toString() : '',
          '90min': parsed['90'] ? Math.round(parsed['90'] * (1 - avgDiscount/100)).toString() : '',
          '120min': parsed['120'] ? Math.round(parsed['120'] * (1 - avgDiscount/100)).toString() : ''
        };
        
        return {
          home: { 
            '60min': parsed['60'] ? parsed['60'].toString() : '', 
            '90min': parsed['90'] ? parsed['90'].toString() : '', 
            '120min': parsed['120'] ? parsed['120'].toString() : '' 
          },
          hotelVilla: hotelPricing
        };
      } catch {
        return {
          home: { '60min': '', '90min': '', '120min': '' },
          hotelVilla: { '60min': '', '90min': '', '120min': '' }
        };
      }
    };

    const pricingData = parsePricingForEdit(therapist.pricing, therapist.hotelDiscount, therapist.villaDiscount);
    
    // Combined pricing structure for edit modal
    const combinedPricing = {
      home: pricingData.home,
      hotelVilla: pricingData.hotelVilla
    };

    const editData: EditModalData = {
      $id: therapist.$id,
      name: therapist.name || '',
      email: therapist.email || '',
      country: therapist.country || '',
      whatsappNumber: therapist.whatsappNumber || '',
      profilePicture: therapist.profilePicture || '',
      description: therapist.description || '',
      experience: therapist.experience || '',
      specialties: Array.isArray(therapist.specialties) ? therapist.specialties : [],
      pricing: combinedPricing,
      discountPercentage: therapist.discountPercentage || 0,
      additionalImages: Array.isArray(therapist.additionalImages) ? therapist.additionalImages : [],
      languages: therapist.languages 
        ? (typeof therapist.languages === 'string' 
            ? parseLanguages(therapist.languages) 
            : (Array.isArray(therapist.languages) ? therapist.languages : []))
        : [],
      massageTypes: therapist.massageTypes ? parseMassageTypes(therapist.massageTypes) : []
    };
    
    setEditingTherapist(editData);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTherapist) return;
    
    setUpdatingId(editingTherapist.$id);
    try {
      console.log('💾 Admin saving therapist data...');
      
      // First, fetch the current complete therapist data to preserve all fields
      let existingTherapist: any = null;
      try {
        existingTherapist = await therapistService.getById(editingTherapist.$id);
        console.log('📖 Found existing therapist data for preservation:', existingTherapist);
      } catch {
        console.log('⚠️ Could not fetch existing data, proceeding with admin updates only');
      }
      
      // Convert edit modal pricing format to database JSON string format
      const convertPricingForDatabase = (pricingData: any) => {
        if (!pricingData || typeof pricingData !== 'object') {
          return '{"60":0,"90":0,"120":0}';
        }
        
        // Extract home pricing values and convert to database format
        const homePricing = pricingData.home || {};
        const pricing = {
          "60": parseInt(homePricing['60min']) || 0,
          "90": parseInt(homePricing['90min']) || 0,
          "120": parseInt(homePricing['120min']) || 0
        };
        
        return JSON.stringify(pricing);
      };

      const finalPricingString = convertPricingForDatabase(editingTherapist.pricing);
      
      // Calculate hotel and villa discounts based on hotel/villa pricing vs home pricing
      const calculateDiscounts = (pricingData: any) => {
        if (!pricingData || typeof pricingData !== 'object') {
          return { hotelDiscount: 20, villaDiscount: 20 }; // Default 20% discount
        }
        
        const homePricing = pricingData.home || {};
        const hotelPricing = pricingData.hotelVilla || {};
        
        // Get average home price
        const homeAvg = (
          (parseInt(homePricing['60min']) || 0) +
          (parseInt(homePricing['90min']) || 0) +
          (parseInt(homePricing['120min']) || 0)
        ) / 3;
        
        // Get average hotel price
        const hotelAvg = (
          (parseInt(hotelPricing['60min']) || 0) +
          (parseInt(hotelPricing['90min']) || 0) +
          (parseInt(hotelPricing['120min']) || 0)
        ) / 3;
        
        // Calculate discount percentage
        let discountPercent = 20; // Default 20%
        if (homeAvg > 0 && hotelAvg > 0) {
          discountPercent = Math.round(((homeAvg - hotelAvg) / homeAvg) * 100);
          discountPercent = Math.max(0, Math.min(50, discountPercent)); // Clamp between 0-50%
        }
        
        return { 
          hotelDiscount: discountPercent, 
          villaDiscount: discountPercent 
        };
      };

      const { hotelDiscount, villaDiscount } = calculateDiscounts(editingTherapist.pricing);
      
      console.log('🏠 Pricing for database:', finalPricingString);
      console.log('🏨 Calculated discounts:', { hotelDiscount, villaDiscount });

      // Convert arrays to JSON strings with length validation
      let languagesString = typeof editingTherapist.languages === 'string'
        ? editingTherapist.languages
        : JSON.stringify(editingTherapist.languages);
      
      if (languagesString.length > 255) {
        console.warn('⚠️ Languages string too long, using fallback');
        languagesString = '[]';
      }

      let massageTypesString = typeof editingTherapist.massageTypes === 'string'
        ? editingTherapist.massageTypes
        : JSON.stringify(editingTherapist.massageTypes);
        
      if (massageTypesString.length > 255) {
        console.warn('⚠️ MassageTypes string too long, using fallback');
        massageTypesString = '[]';
      }

      // Prepare update data with complete data preservation
      const updateData = {
        // Admin-controlled fields (these get updated)
        name: editingTherapist.name,
        email: editingTherapist.email,
        whatsappNumber: editingTherapist.whatsappNumber,
        profilePicture: editingTherapist.profilePicture,
        description: editingTherapist.description,
        yearsOfExperience: parseInt(editingTherapist.experience) || 0,
        pricing: finalPricingString,
        languages: languagesString,
        massageTypes: massageTypesString,
        
        // Only include discount fields if they exist in the existing therapist record
        ...(existingTherapist?.hotelDiscount !== undefined && { hotelDiscount: hotelDiscount }),
        ...(existingTherapist?.villaDiscount !== undefined && { villaDiscount: villaDiscount }),
        
        // Preserve all other existing fields that the therapist may have set (valid schema attributes only)
        ...(existingTherapist && {
          mainImage: existingTherapist.mainImage,
          location: existingTherapist.location,
          coordinates: existingTherapist.coordinates,
          status: existingTherapist.status,
          rating: existingTherapist.rating,
          reviewCount: existingTherapist.reviewCount,
          isLicensed: existingTherapist.isLicensed,
          licenseNumber: existingTherapist.licenseNumber,
          analytics: existingTherapist.analytics,
          hotelVillaServiceStatus: existingTherapist.hotelVillaServiceStatus,
          serviceRadius: existingTherapist.serviceRadius,
          // System fields that should be preserved
          password: existingTherapist.password,
          isLive: existingTherapist.isLive,
          activeMembershipDate: existingTherapist.activeMembershipDate,
          createdAt: existingTherapist.createdAt
        })
      };

      console.log('💾 Admin update preserving existing data:', {
        preservedFields: ['mainImage', 'location', 'coordinates', 'status', 'analytics', 'hotelDiscount', 'villaDiscount'],
        updatedFields: ['name', 'email', 'whatsappNumber', 'pricing', 'description', 'yearsOfExperience']
      });

      await therapistService.update(editingTherapist.$id, updateData);

      console.log('✅ Admin save completed successfully');
      await fetchTherapists();
      setShowEditModal(false);
      setEditingTherapist(null);
      alert('Therapist updated successfully! All existing therapist data has been preserved while updating the admin-controlled fields.');
    } catch (error: any) {
      console.error('❌ Admin save error:', error);
      alert('Error updating therapist: ' + (error.message || 'Unknown error. Please try again.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingTherapist(null);
  };

  const handleDiscountUpdate = async (therapistId: string, discountPercentage: number) => {
    setUpdatingId(therapistId);
    try {
      console.log('💰 Admin updating discount percentage...');
      
      // Fetch existing data to preserve all fields
      let existingTherapist: any = null;
      try {
        existingTherapist = await therapistService.getById(therapistId);
        console.log('📖 Found existing therapist for discount update');
      } catch {
        console.log('⚠️ Could not fetch existing data for discount update');
      }
      
      // Update only the discount field while preserving everything else
      const updateData = {
        hotelDiscount: discountPercentage,
        // Preserve all existing fields if available (valid schema attributes only)
        ...(existingTherapist && {
          name: existingTherapist.name,
          email: existingTherapist.email,
          whatsappNumber: existingTherapist.whatsappNumber,
          profilePicture: existingTherapist.profilePicture,
          description: existingTherapist.description,
          mainImage: existingTherapist.mainImage,
          yearsOfExperience: existingTherapist.yearsOfExperience,
          massageTypes: existingTherapist.massageTypes,
          languages: existingTherapist.languages,
          pricing: existingTherapist.pricing,
          location: existingTherapist.location,
          coordinates: existingTherapist.coordinates,
          status: existingTherapist.status,
          isLive: existingTherapist.isLive,
          rating: existingTherapist.rating,
          reviewCount: existingTherapist.reviewCount,
          isLicensed: existingTherapist.isLicensed,
          licenseNumber: existingTherapist.licenseNumber,
          analytics: existingTherapist.analytics,
          hotelVillaServiceStatus: existingTherapist.hotelVillaServiceStatus,
          serviceRadius: existingTherapist.serviceRadius,
          password: existingTherapist.password,
          activeMembershipDate: existingTherapist.activeMembershipDate,
          createdAt: existingTherapist.createdAt
        }),
        // Only include villaDiscount if it exists in the existing record
        ...(existingTherapist?.villaDiscount !== undefined && { villaDiscount: existingTherapist.villaDiscount })
      };
      
      await therapistService.update(therapistId, updateData);
      
      console.log('✅ Discount updated successfully');
      await fetchTherapists();
      alert(`Discount updated to ${discountPercentage}%! All other therapist data has been preserved.`);
    } catch (error: any) {
      console.error('❌ Error updating discount:', error);
      alert('Error updating discount: ' + (error.message || 'Unknown error. Please try again.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (therapistId: string, therapistName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently DELETE "${therapistName}"?\n\nThis action CANNOT be undone and will remove:\n- Profile and all data\n- Reviews and ratings\n- Membership history\n- Profile images\n\nType "DELETE" to confirm.`
    );
    
    if (!confirmed) return;

    const doubleConfirm = window.prompt(
      `To confirm deletion of "${therapistName}", type DELETE in capital letters:`
    );

    if (doubleConfirm !== 'DELETE') {
      alert('Deletion cancelled - confirmation text did not match.');
      return;
    }

    setUpdatingId(therapistId);
    try {
      await therapistService.delete(therapistId);
      await fetchTherapists();
      alert(`Therapist "${therapistName}" has been permanently deleted.`);
    } catch (error: any) {
      console.error('Error deleting therapist:', error);
      alert('Error deleting therapist: ' + (error.message || 'Unknown error'));
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
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const pricingHelper = (window as any).pricingHelper;
                if (pricingHelper) {
                  const result = await pricingHelper.addSamplePricingToAllTherapists();
                  alert(`✅ Updated pricing for ${result.updated} therapists!`);
                  fetchTherapists(); // Refresh the list
                } else {
                  alert('❌ Pricing helper not loaded. Please refresh the page.');
                }
              } catch (error) {
                console.error('Error adding pricing:', error);
                alert('❌ Error adding pricing data. Check console for details.');
              }
            }}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            🏷️ Add Sample Pricing
          </button>
          <button
            onClick={async () => {
              console.log('🔍 Manual Debug Check:');
              const data = await therapistService.getAll();
              console.log('📊 Raw Database Data:', data);
              data.forEach((t: any, index: number) => {
                console.log(`👤 Therapist ${index + 1}:`, {
                  id: t.$id,
                  name: t.name,
                  isLive: t.isLive,
                  status: t.status,
                  activeMembershipDate: t.activeMembershipDate
                });
              });
            }}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔍 Debug Data
          </button>
          <button
            onClick={fetchTherapists}
            className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
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
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Profile Info */}
                  <div className="lg:col-span-1">
                    <div className="flex flex-col items-center text-center">
                      {/* Profile Image */}
                      <div className="relative mb-4">
                        {therapist.profilePicture ? (
                          <img
                            src={therapist.profilePicture}
                            alt={therapist.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-green-500"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-red-500 flex items-center justify-center">
                            <span className="text-gray-400 text-3xl">👤</span>
                          </div>
                        )}
                        
                        {/* Discount Badge - Top Right */}
                        {therapist.discountPercentage && therapist.discountPercentage > 0 && (
                          <span className="absolute -top-2 -right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg border-2 border-white">
                            -{therapist.discountPercentage}%
                          </span>
                        )}
                        
                        {/* Status Badge - Bottom Right */}
                        <span className={`absolute -bottom-1 -right-1 px-2 py-0.5 text-xs rounded-full ${getStatusColor(therapist.status)}`}>
                          {therapist.status}
                        </span>
                      </div>

                      {/* Basic Info */}
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{therapist.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{therapist.email}</p>
                      
                      {therapist.whatsappNumber && (
                        <p className="text-sm text-green-600 font-medium mb-2">
                          📱 {therapist.whatsappNumber}
                        </p>
                      )}
                      
                      {(therapist.city || therapist.country) && (
                        <p className="text-xs text-gray-500 mb-2">
                          📍 {[therapist.city, therapist.country].filter(Boolean).join(', ')}
                        </p>
                      )}

                      {therapist.yearsOfExperience && (
                        <p className="text-xs text-blue-600 mb-2">
                          🎯 {therapist.yearsOfExperience} years experience
                        </p>
                      )}
                    </div>

                    {/* Membership Status */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Membership</h4>
                      {therapist.status === 'active' && therapist.activeMembershipDate && (
                        <span className={`px-3 py-1 text-xs rounded-full ${isExpired(therapist.activeMembershipDate) ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {isExpired(therapist.activeMembershipDate) ? 'Expired' : `Until ${new Date(therapist.activeMembershipDate).toLocaleDateString()}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle Column - Services & Pricing */}
                  <div className="lg:col-span-1 space-y-4">
                    {/* Massage Types */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Massage Types</h4>
                      <div className="space-y-2">
                        {therapist.massageTypes && typeof therapist.massageTypes === 'string' ? (
                          (() => {
                            try {
                              const types = JSON.parse(therapist.massageTypes);
                              return (
                                <div className="flex flex-wrap gap-1">
                                  {types.map((type: string, index: number) => (
                                    <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              );
                            } catch {
                              return <span className="text-xs text-gray-400">No massage types set</span>;
                            }
                          })()
                        ) : (
                          <span className="text-xs text-gray-400">No massage types set</span>
                        )}
                      </div>
                    </div>

                    {/* Home Visit Pricing */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Home Visit Rates</h4>
                      <div className="space-y-1">
                        {therapist.pricing && typeof therapist.pricing === 'string' ? (
                          (() => {
                            try {
                              const pricing = JSON.parse(therapist.pricing);
                              return (
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div className="bg-blue-50 p-2 rounded text-center">
                                    <div className="font-medium">60min</div>
                                    <div className="text-blue-600">{pricing['60'] || 0}k</div>
                                  </div>
                                  <div className="bg-blue-50 p-2 rounded text-center">
                                    <div className="font-medium">90min</div>
                                    <div className="text-blue-600">{pricing['90'] || 0}k</div>
                                  </div>
                                  <div className="bg-blue-50 p-2 rounded text-center">
                                    <div className="font-medium">120min</div>
                                    <div className="text-blue-600">{pricing['120'] || 0}k</div>
                                  </div>
                                </div>
                              );
                            } catch (error) {
                              console.error(`❌ Error parsing pricing for ${therapist.name}:`, error);
                              return (
                                <div className="text-xs text-red-500 p-2 bg-red-50 rounded">
                                  Invalid pricing data. Use console: pricingHelper.addPricingToTherapist('{therapist.$id}', {`{60: 350, 90: 500, 120: 650}`})
                                </div>
                              );
                            }
                          })()
                        ) : (
                          <div className="text-xs text-orange-500 p-2 bg-orange-50 rounded">
                            No pricing set. Use console: pricingHelper.addSamplePricingToAllTherapists()
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hotel/Villa Pricing */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Hotel/Villa Rates</h4>
                      <div className="space-y-1">
                        {therapist.pricing && typeof therapist.pricing === 'string' ? (
                          (() => {
                            try {
                              const pricing = JSON.parse(therapist.pricing);
                              // Calculate discounted rates using hotelDiscount/villaDiscount from schema
                              const hotelDiscount = therapist.hotelDiscount || 20; // Default 20% discount
                              const villaDiscount = therapist.villaDiscount || 20; // Default 20% discount
                              const avgDiscount = (hotelDiscount + villaDiscount) / 2;
                              
                              return (
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div className="bg-purple-50 p-2 rounded text-center">
                                    <div className="font-medium">60min</div>
                                    <div className="text-purple-600">{Math.round((pricing['60'] || 0) * (1 - avgDiscount/100))}k</div>
                                    <div className="text-xs text-gray-500">-{avgDiscount}%</div>
                                  </div>
                                  <div className="bg-purple-50 p-2 rounded text-center">
                                    <div className="font-medium">90min</div>
                                    <div className="text-purple-600">{Math.round((pricing['90'] || 0) * (1 - avgDiscount/100))}k</div>
                                    <div className="text-xs text-gray-500">-{avgDiscount}%</div>
                                  </div>
                                  <div className="bg-purple-50 p-2 rounded text-center">
                                    <div className="font-medium">120min</div>
                                    <div className="text-purple-600">{Math.round((pricing['120'] || 0) * (1 - avgDiscount/100))}k</div>
                                    <div className="text-xs text-gray-500">-{avgDiscount}%</div>
                                  </div>
                                </div>
                              );
                            } catch {
                              return <span className="text-xs text-gray-400">Same as home visit rates</span>;
                            }
                          })()
                        ) : (
                          <span className="text-xs text-gray-400">Same as home visit rates</span>
                        )}
                      </div>
                    </div>

                    {/* Discount */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Current Discount</h4>
                      <div className="flex items-center gap-2">
                        <select
                          value={therapist.discountPercentage || 0}
                          onChange={(e) => handleDiscountUpdate(therapist.$id, parseInt(e.target.value))}
                          disabled={updatingId === therapist.$id}
                          className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent"
                        >
                          <option value={0}>No Discount</option>
                          <option value={5}>5% Off</option>
                          <option value={10}>10% Off</option>
                          <option value={15}>15% Off</option>
                          <option value={20}>20% Off</option>
                        </select>
                        {therapist.discountPercentage && therapist.discountPercentage > 0 && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                            {therapist.discountPercentage}% OFF
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
                      
                      {therapist.status === 'pending' || therapist.status === 'deactivated' || (therapist.status === 'active' && isExpired(therapist.activeMembershipDate)) ? (
                        <div className="space-y-3">
                          <select
                            id={`membership-${therapist.$id}`}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent"
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
                            className="w-full py-2 text-sm font-medium"
                            disabled={updatingId === therapist.$id}
                            onClick={() => {
                              const select = document.getElementById(`membership-${therapist.$id}`) as HTMLSelectElement;
                              handleActivate(therapist.$id, parseInt(select.value));
                            }}
                          >
                            {updatingId === therapist.$id ? 'Activating...' : '✅ Activate Account'}
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
                            disabled={updatingId === therapist.$id}
                            onClick={() => handleDeactivate(therapist.$id)}
                          >
                            {updatingId === therapist.$id ? 'Deactivating...' : '⏸️ Deactivate'}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button
                        variant="secondary"
                        className="w-full py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={updatingId === therapist.$id}
                        onClick={() => handleEditTherapist(therapist)}
                      >
                        ✏️ Edit Full Profile
                      </Button>
                      
                      <Button
                        variant="secondary"
                        className="w-full py-2 text-sm bg-red-600 hover:bg-red-700 text-white"
                        disabled={updatingId === therapist.$id}
                        onClick={() => handleDelete(therapist.$id, therapist.name)}
                      >
                        🗑️ Delete Account
                      </Button>
                    </div>

                    {/* Membership Info */}
                    {therapist.activeMembershipDate && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h5 className="text-xs font-medium text-gray-700 mb-1">Membership Details</h5>
                        <p className="text-xs text-gray-600">
                          🗓️ Active until: {new Date(therapist.activeMembershipDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        {therapist.membershipStartDate && (
                          <p className="text-xs text-gray-600">
                            📅 Started: {new Date(therapist.membershipStartDate).toLocaleDateString()}
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

      {/* Edit Therapist Modal */}
      {showEditModal && editingTherapist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pb-20">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Edit Therapist Profile</h3>
                <button
                  onClick={handleCloseEditModal}
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
                      Name *
                    </label>
                    <input
                      type="text"
                      value={editingTherapist.name}
                      onChange={(e) => setEditingTherapist({...editingTherapist, name: e.target.value})}
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
                      value={editingTherapist.email}
                      onChange={(e) => setEditingTherapist({...editingTherapist, email: e.target.value})}
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
                      value={editingTherapist.whatsappNumber}
                      onChange={(e) => setEditingTherapist({...editingTherapist, whatsappNumber: e.target.value})}
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
                      value={editingTherapist.country}
                      onChange={(e) => setEditingTherapist({...editingTherapist, country: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience
                    </label>
                    <input
                      type="text"
                      value={editingTherapist.experience}
                      onChange={(e) => setEditingTherapist({...editingTherapist, experience: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      placeholder="e.g., 5 years"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingTherapist.description}
                    onChange={(e) => setEditingTherapist({...editingTherapist, description: e.target.value})}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    placeholder="Professional description and specializations..."
                  />
                </div>

                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4 pb-20">
                    {editingTherapist.profilePicture && (
                      <img 
                        src={editingTherapist.profilePicture} 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      />
                    )}
                    <ImageUpload
                      id="therapist-profile-picture"
                      label="Upload Profile Picture"
                      currentImage={editingTherapist.profilePicture}
                      onImageChange={(url: string) => setEditingTherapist({...editingTherapist, profilePicture: url})}
                      className="flex-1"
                      variant="profile"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Note: Main card images are automatically assigned from our curated collection
                  </p>
                </div>

                {/* Pricing Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pricing (IDR)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
                    <div className="border border-gray-300 rounded-lg p-4 pb-20">
                      <h4 className="font-medium text-gray-800 mb-3">Home Service</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-sm">60 min:</span>
                          <input
                            type="text"
                            value={editingTherapist.pricing?.home?.['60min'] || ''}
                            onChange={(e) => setEditingTherapist({
                              ...editingTherapist, 
                              pricing: {
                                ...editingTherapist.pricing,
                                home: {
                                  ...editingTherapist.pricing?.home,
                                  '60min': e.target.value
                                }
                              }
                            })}
                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                            placeholder="250000"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-sm">90 min:</span>
                          <input
                            type="text"
                            value={editingTherapist.pricing?.home?.['90min'] || ''}
                            onChange={(e) => setEditingTherapist({
                              ...editingTherapist, 
                              pricing: {
                                ...editingTherapist.pricing,
                                home: {
                                  ...editingTherapist.pricing?.home,
                                  '90min': e.target.value
                                }
                              }
                            })}
                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                            placeholder="350000"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-sm">120 min:</span>
                          <input
                            type="text"
                            value={editingTherapist.pricing?.home?.['120min'] || ''}
                            onChange={(e) => setEditingTherapist({
                              ...editingTherapist, 
                              pricing: {
                                ...editingTherapist.pricing,
                                home: {
                                  ...editingTherapist.pricing?.home,
                                  '120min': e.target.value
                                }
                              }
                            })}
                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                            placeholder="450000"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="border border-gray-300 rounded-lg p-4 pb-20">
                      <h4 className="font-medium text-gray-800 mb-3">Hotel/Villa Service</h4>
                      <p className="text-sm text-gray-600 mb-4">Special rates for hotel and villa services (minimum 20% discount required)</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-sm">60 min:</span>
                          <input
                            type="text"
                            value={editingTherapist.pricing?.hotelVilla?.['60min'] || ''}
                            onChange={(e) => setEditingTherapist({
                              ...editingTherapist, 
                              pricing: {
                                ...editingTherapist.pricing,
                                hotelVilla: {
                                  ...editingTherapist.pricing?.hotelVilla,
                                  '60min': e.target.value
                                }
                              }
                            })}
                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                            placeholder="200000"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-sm">90 min:</span>
                          <input
                            type="text"
                            value={editingTherapist.pricing?.hotelVilla?.['90min'] || ''}
                            onChange={(e) => setEditingTherapist({
                              ...editingTherapist, 
                              pricing: {
                                ...editingTherapist.pricing,
                                hotelVilla: {
                                  ...editingTherapist.pricing?.hotelVilla,
                                  '90min': e.target.value
                                }
                              }
                            })}
                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                            placeholder="300000"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-sm">120 min:</span>
                          <input
                            type="text"
                            value={editingTherapist.pricing?.hotelVilla?.['120min'] || ''}
                            onChange={(e) => setEditingTherapist({
                              ...editingTherapist, 
                              pricing: {
                                ...editingTherapist.pricing,
                                hotelVilla: {
                                  ...editingTherapist.pricing?.hotelVilla,
                                  '120min': e.target.value
                                }
                              }
                            })}
                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                            placeholder="400000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Promotional Discount Setting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Promotional Discount
                  </label>
                  <div className="border border-gray-200 rounded-lg p-4 pb-20">
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 mb-3">
                        Select a discount percentage that will apply to ALL pricing (home and hotel/villa services):
                      </div>
                      
                      <div className="grid grid-cols-5 gap-3">
                        {[0, 5, 10, 15, 20].map((discount) => (
                          <label key={discount} className="flex flex-col items-center cursor-pointer">
                            <input
                              type="radio"
                              name="discountPercentage"
                              value={discount}
                              checked={editingTherapist.discountPercentage === discount}
                              onChange={(e) => setEditingTherapist({
                                ...editingTherapist,
                                discountPercentage: parseInt(e.target.value)
                              })}
                              className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                            />
                            <span className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                              editingTherapist.discountPercentage === discount 
                                ? discount === 0 
                                  ? 'bg-gray-100 text-gray-700' 
                                  : 'bg-orange-100 text-orange-700'
                                : 'bg-gray-50 text-gray-500'
                            }`}>
                              {discount === 0 ? 'No Discount' : `${discount}% OFF`}
                            </span>
                          </label>
                        ))}
                      </div>
                      
                      {editingTherapist.discountPercentage > 0 && (
                        <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                          <div className="text-sm font-medium text-orange-800 mb-2">
                            Discount Preview (applies to all prices):
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            {editingTherapist.pricing?.home && Object.entries(editingTherapist.pricing.home).map(([duration, price]) => (
                              <div key={duration} className="bg-white p-2 rounded border">
                                <div className="font-medium text-gray-700">{duration}</div>
                                <div className="text-gray-500 line-through">Rp{parseInt(price || '0').toLocaleString()}</div>
                                <div className="text-orange-600 font-medium">
                                  Rp{Math.round(parseInt(price || '0') * (1 - editingTherapist.discountPercentage / 100)).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Massage Specialties
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4 pb-20">
                    {[
                      'Swedish Massage', 'Deep Tissue', 'Hot Stone', 'Thai Massage', 
                      'Aromatherapy', 'Sports Massage', 'Reflexology', 'Shiatsu',
                      'Prenatal Massage', 'Couples Massage', 'Bamboo Massage', 'Balinese',
                      'Traditional Indonesian', 'Oil Massage', 'Dry Massage', 'Four Hands',
                      'Head & Shoulder', 'Foot Massage', 'Full Body', 'Lymphatic Drainage',
                      'Trigger Point', 'Cupping Therapy', 'Acupressure', 'Reiki',
                      'Craniosacral', 'Myofascial Release', 'Stone Therapy', 'Herbal Compress'
                    ].map((specialty) => (
                      <label key={specialty} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={editingTherapist.specialties.includes(specialty)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditingTherapist({
                                ...editingTherapist,
                                specialties: [...editingTherapist.specialties, specialty]
                              });
                            } else {
                              setEditingTherapist({
                                ...editingTherapist,
                                specialties: editingTherapist.specialties.filter(s => s !== specialty)
                              });
                            }
                          }}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className={`text-sm ${editingTherapist.specialties.includes(specialty) ? 'font-medium text-green-600' : 'text-gray-700'}`}>
                          {specialty}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Add Custom Specialty:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter custom specialty..."
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const customSpecialty = e.currentTarget.value.trim();
                            if (customSpecialty && !editingTherapist.specialties.includes(customSpecialty)) {
                              setEditingTherapist({
                                ...editingTherapist,
                                specialties: [...editingTherapist.specialties, customSpecialty]
                              });
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          const customSpecialty = input.value.trim();
                          if (customSpecialty && !editingTherapist.specialties.includes(customSpecialty)) {
                            setEditingTherapist({
                              ...editingTherapist,
                              specialties: [...editingTherapist.specialties, customSpecialty]
                            });
                            input.value = '';
                          }
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Selected: {editingTherapist.specialties.length} specialties
                    </p>
                    {editingTherapist.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {editingTherapist.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-green-600 text-white text-xs rounded-full"
                          >
                            {specialty}
                            <button
                              type="button"
                              onClick={() => setEditingTherapist({
                                ...editingTherapist,
                                specialties: editingTherapist.specialties.filter(s => s !== specialty)
                              })}
                              className="ml-1 text-white hover:text-gray-200"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Massage Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Massage Types Offered
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4 pb-20">
                    {[
                      'Relaxation Massage', 'Therapeutic Massage', 'Sports Recovery', 'Stress Relief',
                      'Pain Management', 'Wellness Massage', 'Beauty Treatment', 'Detox Massage',
                      'Energy Healing', 'Medical Massage', 'Prenatal Care', 'Couples Treatment',
                      'Hot Oil Treatment', 'Cold Stone Therapy', 'Herbal Treatment', 'Aromatherapy Session',
                      'Full Body Session', 'Partial Body Session', 'Head & Neck Focus', 'Back & Shoulder Focus',
                      'Leg & Foot Focus', 'Hand & Arm Focus', 'Custom Treatment', 'Consultation Available'
                    ].map((massageType) => (
                      <label key={massageType} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={editingTherapist.massageTypes.includes(massageType)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditingTherapist({
                                ...editingTherapist,
                                massageTypes: [...editingTherapist.massageTypes, massageType]
                              });
                            } else {
                              setEditingTherapist({
                                ...editingTherapist,
                                massageTypes: editingTherapist.massageTypes.filter(mt => mt !== massageType)
                              });
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className={`text-sm ${editingTherapist.massageTypes.includes(massageType) ? 'font-medium text-blue-600' : 'text-gray-700'}`}>
                          {massageType}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Add Custom Massage Type:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter custom massage type..."
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const customType = e.currentTarget.value.trim();
                            if (customType && !editingTherapist.massageTypes.includes(customType)) {
                              setEditingTherapist({
                                ...editingTherapist,
                                massageTypes: [...editingTherapist.massageTypes, customType]
                              });
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          const customType = input.value.trim();
                          if (customType && !editingTherapist.massageTypes.includes(customType)) {
                            setEditingTherapist({
                              ...editingTherapist,
                              massageTypes: [...editingTherapist.massageTypes, customType]
                            });
                            input.value = '';
                          }
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Selected: {editingTherapist.massageTypes.length} massage types
                    </p>
                    {editingTherapist.massageTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {editingTherapist.massageTypes.map((massageType, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
                          >
                            {massageType}
                            <button
                              type="button"
                              onClick={() => setEditingTherapist({
                                ...editingTherapist,
                                massageTypes: editingTherapist.massageTypes.filter(mt => mt !== massageType)
                              })}
                              className="ml-1 text-white hover:text-gray-200"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <LanguageSelector
                  selectedLanguages={editingTherapist.languages}
                  onLanguagesChange={(languages) => setEditingTherapist({
                    ...editingTherapist,
                    languages
                  })}
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={handleCloseEditModal}
                  disabled={updatingId === editingTherapist.$id}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveEdit}
                  disabled={updatingId === editingTherapist.$id}
                  className="bg-brand-green hover:bg-green-700"
                >
                  {updatingId === editingTherapist.$id ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmTherapistsPage;

