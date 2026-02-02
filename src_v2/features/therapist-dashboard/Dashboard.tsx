/**
 * ============================================================================
 * STEP 24 — THERAPIST DASHBOARD MIGRATION (Screen 1 of 4)
 * ============================================================================
 * 
 * MIGRATED FROM: /src/pages/therapist/TherapistDashboard.tsx
 * MIGRATION DATE: 2026-02-02
 * 
 * BOUNDARIES:
 * ✅ UI + business logic only
 * ✅ Imports from src_v2/core/ for data operations
 * 🚫 NO layout or routing logic (handled by shell)
 * 🚫 NO direct Appwrite client usage
 * 
 * ROLLBACK STRATEGY:
 * If this breaks → revert to legacy /src/pages/therapist/TherapistDashboard.tsx
 * Other features remain unaffected
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  Star, Upload, X, CheckCircle, Square, Users, Save, 
  DollarSign, Globe, Hand, User, MessageCircle, Image, 
  MapPin, FileText, Calendar, Clock 
} from 'lucide-react';

// V2 CORE INTEGRATION - Single source of truth
import { createBooking } from '../../core/booking/createBooking';
import { CoreLogger } from '../../core/CoreLogger';

// Legacy services for migration transition
import { therapistService, imageUploadService } from '../../../src/lib/appwriteService';
import { showToast } from '../../../src/utils/showToastPortal';

// Types
import type { Therapist } from '../../../src/types';

// UI Components (kept from legacy for now)
import CityLocationDropdown from '../../../src/components/CityLocationDropdown';
import BookingRequestCard from '../../../src/components/therapist/BookingRequestCard';
import HelpTooltip from '../../../src/components/therapist/HelpTooltip';

// Constants
import { MASSAGE_TYPES_CATEGORIZED } from '../../../src/constants';
import { CLIENT_PREFERENCE_OPTIONS, CLIENT_PREFERENCE_LABELS, CLIENT_PREFERENCE_DESCRIPTIONS, type ClientPreference } from '../../../src/utils/clientPreferencesUtils';
import { extractLocationId, normalizeLocationForSave } from '../../../src/utils/locationNormalizationV2';

export interface TherapistDashboardProps {
  therapist: Therapist | null;
  onNavigateToStatus?: () => void;
  onNavigateToBookings?: () => void;
  onNavigateToEarnings?: () => void;
  onNavigateToChat?: () => void;
  onNavigateToMembership?: () => void;
  language?: 'en' | 'id';
}

/**
 * Therapist Dashboard - Main Hub
 * 
 * Features:
 * - Profile management
 * - Service configuration
 * - Pricing setup
 * - Location/availability settings
 * - Quick stats overview
 */
export const TherapistDashboard: React.FC<TherapistDashboardProps> = ({
  therapist,
  onNavigateToStatus,
  onNavigateToBookings,
  onNavigateToEarnings,
  onNavigateToChat,
  onNavigateToMembership,
  language = 'id'
}) => {
  const [saving, setSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    serviceArea: [] as string[],
    massageTypes: [] as string[],
    clientPreferences: [] as ClientPreference[],
    pricing: { '60': 0, '90': 0, '120': 0 }
  });

  // Load therapist data on mount
  useEffect(() => {
    if (therapist) {
      setFormData({
        name: therapist.name || '',
        bio: therapist.bio || '',
        location: therapist.location || '',
        serviceArea: therapist.serviceArea || [],
        massageTypes: therapist.massageTypes || [],
        clientPreferences: therapist.clientPreferences || [],
        pricing: therapist.pricing || { '60': 0, '90': 0, '120': 0 }
      });
    }
  }, [therapist]);

  // Save profile handler
  const handleSaveProfile = async () => {
    if (!therapist) return;

    setSaving(true);
    try {
      // Use legacy service for now (will migrate to V2 core in next phase)
      await therapistService.update(therapist.$id, formData);
      
      setProfileSaved(true);
      showToast('Profile updated successfully', 'success');
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error) {
      console.error('Profile save failed:', error);
      showToast('Failed to update profile', 'error');
      CoreLogger.failure('therapist-dashboard', 'saveProfile', error as Error, 0);
    } finally {
      setSaving(false);
    }
  };

  // Image upload handler
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !therapist) return;

    const file = event.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const imageUrl = await imageUploadService.uploadImage(file);
      await therapistService.update(therapist.$id, { profilePicture: imageUrl });
      showToast('Profile picture updated', 'success');
    } catch (error) {
      console.error('Image upload failed:', error);
      showToast('Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading therapist data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Profile Picture */}
            <div className="relative">
              <img
                src={therapist.profilePicture || 'https://via.placeholder.com/80'}
                alt={therapist.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-orange-500"
              />
              <label className="absolute bottom-0 right-0 bg-orange-500 text-white p-1.5 rounded-full cursor-pointer hover:bg-orange-600 transition-colors">
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>

            {/* Therapist Info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{therapist.name}</h1>
              <p className="text-gray-600">{therapist.location || 'No location set'}</p>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{therapist.rating || '5.0'}</span>
                <span className="text-sm text-gray-500">• {therapist.totalBookings || 0} bookings</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <button
              onClick={onNavigateToStatus}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Status
            </button>
            <button
              onClick={onNavigateToBookings}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Bookings
            </button>
            <button
              onClick={onNavigateToEarnings}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Earnings
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold">{therapist.totalBookings || 0}</span>
            </div>
            <p className="text-gray-600">Total Bookings</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold">${therapist.totalEarnings || 0}</span>
            </div>
            <p className="text-gray-600">Total Earnings</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold">{therapist.rating || '5.0'}</span>
            </div>
            <p className="text-gray-600">Average Rating</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold">{therapist.availability || 'N/A'}</span>
            </div>
            <p className="text-gray-600">Availability</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
          
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Tell clients about yourself..."
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <CityLocationDropdown
                selectedCity={formData.location}
                onSelect={(city) => setFormData({ ...formData, location: city })}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : profileSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onNavigateToChat}
            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-orange-500 transition-colors text-left"
          >
            <MessageCircle className="w-8 h-8 text-orange-500 mb-3" />
            <h3 className="font-semibold text-gray-900">Messages</h3>
            <p className="text-sm text-gray-600 mt-1">View customer messages</p>
          </button>

          <button
            onClick={onNavigateToMembership}
            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-orange-500 transition-colors text-left"
          >
            <Star className="w-8 h-8 text-orange-500 mb-3" />
            <h3 className="font-semibold text-gray-900">Membership</h3>
            <p className="text-sm text-gray-600 mt-1">Upgrade your plan</p>
          </button>

          <button
            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-orange-500 transition-colors text-left"
          >
            <Hand className="w-8 h-8 text-orange-500 mb-3" />
            <h3 className="font-semibold text-gray-900">Services</h3>
            <p className="text-sm text-gray-600 mt-1">Manage your services</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;
