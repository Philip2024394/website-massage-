import React, { useState, useEffect, useRef } from 'react';
import { MASSAGE_TYPES_CATEGORIZED } from '../constants/rootConstants';
import type { Therapist } from '../types';
import { therapistService, imageUploadService } from '../lib/appwriteService';
import { showToast } from '../utils/showToastPortal';
import { loadGoogleMapsScript } from '../constants/appConstants';
import { getStoredGoogleMapsApiKey } from '../utils/appConfig';

interface TherapistPortalPageProps {
  therapist: Therapist | null;
  onNavigateToStatus?: () => void;
  onLogout?: () => void;
  onNavigateHome?: () => void;
}

const TherapistPortalPage: React.FC<TherapistPortalPageProps> = ({ 
  therapist, 
  onNavigateToStatus,
  onLogout, 
  onNavigateHome 
}) => {
  console.log('🎨 TherapistPortalPage rendering with therapist:', therapist);
  
  const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);

  // Form state
  const [name, setName] = useState(therapist?.name || '');
  const [description, setDescription] = useState(therapist?.description || '');
  const [whatsappNumber, setWhatsappNumber] = useState(therapist?.whatsappNumber || '+62');
  const [price60, setPrice60] = useState(String(therapist?.price60 || '100'));
  const [price90, setPrice90] = useState(String(therapist?.price90 || '150'));
  const [price120, setPrice120] = useState(String(therapist?.price120 || '200'));
  const [yearsOfExperience, setYearsOfExperience] = useState(String(therapist?.yearsOfExperience || '5'));
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(() => {
    try {
      const raw: any = therapist?.languages;
      // Handle both array format (already parsed) and JSON string format
      if (Array.isArray(raw)) return raw.slice(0, 3);
      if (typeof raw === 'string' && raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.slice(0, 3);
      }
    } catch {}
    return [];
  });
  const [selectedMassageTypes, setSelectedMassageTypes] = useState<string[]>(() => {
    try {
      const raw: any = therapist?.massageTypes;
      if (Array.isArray(raw)) return raw.slice(0, 5);
      if (typeof raw === 'string' && raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.slice(0, 5);
      }
    } catch {}
    return [];
  });
  const [profileImageDataUrl, setProfileImageDataUrl] = useState<string | null>(null);
  
  // Location state
  const [locationSet, setLocationSet] = useState(false);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(() => {
    try {
      const coords = therapist?.coordinates;
      if (coords) {
        const parsed = typeof coords === 'string' ? JSON.parse(coords) : coords;
        if (parsed?.lat && parsed?.lng) {
          return { lat: parsed.lat, lng: parsed.lng };
        }
      }
    } catch {}
    return null;
  });

  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'id', label: 'Indonesian' },
    { code: 'zh', label: 'Chinese' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' },
  ];

  // Load Google Maps
  useEffect(() => {
    const checkGoogleMaps = () => {
      if ((window as any).google?.maps?.Geocoder) {
        setMapsApiLoaded(true);
        return true;
      }
      return false;
    };

    const loadMapsAPI = () => {
      const apiKey = getStoredGoogleMapsApiKey();
      if (!apiKey) {
        console.warn('⚠️ Google Maps API key not configured');
        return;
      }

      console.log('🗺️ Loading Google Maps API...');
      loadGoogleMapsScript(
        apiKey,
        () => {
          console.log('✅ Google Maps API loaded');
          setMapsApiLoaded(true);
        },
        () => {
          console.error('❌ Failed to load Google Maps API');
        }
      );
    };

    if (!checkGoogleMaps()) {
      loadMapsAPI();
    }
  }, []);

  // Initialize map when coordinates exist and API is loaded
  useEffect(() => {
    if (coordinates && mapsApiLoaded && mapRef.current) {
      initializeMap(coordinates);
    }
  }, [coordinates, mapsApiLoaded]);

  const initializeMap = (coords: {lat: number, lng: number}) => {
    if (!mapRef.current || !(window as any).google) return;

    const map = new (window as any).google.maps.Map(mapRef.current, {
      center: coords,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
    });

    // Clear existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Add new marker
    markerRef.current = new (window as any).google.maps.Marker({
      position: coords,
      map: map,
      title: 'Your Location',
    });
  };

  const handleSetLocation = () => {
    if (!navigator.geolocation) {
      showToast('❌ Geolocation not supported', 'error');
      return;
    }

    showToast('📍 Getting your location...', 'info');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        console.log(`📍 Location accuracy: ${accuracy}m`);
        
        if (accuracy > 500) {
          showToast(`⚠️ Location accuracy is low (${Math.round(accuracy)}m). Try moving to an open area.`, 'warning');
        }
        
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCoordinates(coords);
        setLocationSet(true);
        showToast('✅ Location captured successfully!', 'success');
        
        if (mapsApiLoaded && mapRef.current) {
          initializeMap(coords);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        showToast('❌ Location access denied. Please enable location permissions.', 'error');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0 // Always get fresh location, no cache
      }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image too large (max 5MB)', 'error');
      return;
    }
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImageDataUrl(reader.result as string);
      setUploadingImage(false);
      showToast('✅ Image ready (will upload on save)', 'success');
    };
    reader.onerror = () => {
      setUploadingImage(false);
      showToast('❌ Image load failed', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleToggleLanguage = (code: string) => {
    setSelectedLanguages(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code) 
        : (prev.length < 3 ? [...prev, code] : prev)
    );
  };

  const handleToggleMassageType = (type: string) => {
    setSelectedMassageTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : (prev.length < 5 ? [...prev, type] : prev)
    );
  };

  const countWords = (text: string) => {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const handleSaveProfile = async () => {
    if (!therapist) return;
    setSaving(true);
    
    try {
      // Validation
      const missingFields: string[] = [];
      if (!name.trim()) missingFields.push('Name');
      if (!whatsappNumber.trim() || whatsappNumber.trim() === '+62') missingFields.push('WhatsApp Number');
      if (!coordinates) missingFields.push('Location (use Set Location button)');
      
      if (missingFields.length > 0) {
        showToast(`❌ Please complete: ${missingFields.join(', ')}`, 'error');
        setSaving(false);
        return;
      }
      
      const words = countWords(description);
      if (words > 350) {
        showToast(`Description too long (${words}/350)`, 'error');
        setSaving(false);
        return;
      }
      
      // Normalize WhatsApp
      let normalizedWhatsApp = whatsappNumber.trim();
      if (!normalizedWhatsApp.startsWith('+62')) {
        normalizedWhatsApp = '+62' + normalizedWhatsApp.replace(/^\+?/, '');
      }
      if (!/^\+62\d{6,15}$/.test(normalizedWhatsApp)) {
        showToast('Invalid WhatsApp (+62 + digits)', 'error');
        setSaving(false);
        return;
      }

      // Upload profile image to Appwrite Storage if changed
      let profilePictureUrl = therapist.profilePicture;
      if (profileImageDataUrl && profileImageDataUrl.startsWith('data:')) {
        console.log('📤 Uploading profile image to Appwrite Storage...');
        try {
          profilePictureUrl = await imageUploadService.uploadProfileImage(profileImageDataUrl);
          console.log('✅ Profile image uploaded:', profilePictureUrl);
        } catch (uploadError) {
          console.error('❌ Failed to upload profile image:', uploadError);
          showToast('⚠️ Image upload failed, saving without image', 'error');
        }
      }

      // Build update data
      const updateData: any = {
        name: name.trim(),
        description: description.trim(),
        languages: JSON.stringify(selectedLanguages), // FIX: JSON stringify languages array
        price60: price60.trim(),
        price90: price90.trim(),
        price120: price120.trim(),
        yearsOfExperience: parseInt(yearsOfExperience) || 5,
        whatsappNumber: normalizedWhatsApp,
        massageTypes: JSON.stringify(selectedMassageTypes.slice(0, 5)),
        coordinates: JSON.stringify(coordinates),
        isLive: true, // Auto-live on save
      };
      
      // Only include profilePicture if it's a valid URL
      if (profilePictureUrl && !profilePictureUrl.startsWith('data:')) {
        updateData.profilePicture = profilePictureUrl;
      }

      const savedTherapist = await therapistService.update(String(therapist.$id || therapist.id), updateData);
      console.log('✅ Profile saved to Appwrite:', savedTherapist);
      console.log('📊 Saved data includes:', {
        name: savedTherapist.name,
        isLive: savedTherapist.isLive,
        whatsappNumber: savedTherapist.whatsappNumber,
        coordinates: savedTherapist.coordinates
      });

      // Auto-translate profile data to both languages
      console.log('🌐 Auto-translating profile data...');
      try {
        const { adminTranslationService } = await import('../lib/translationService');
        
        // Detect if the user entered data in Indonesian or English
        const sourceLanguage = description.match(/[a-zA-Z]/) ? 'en' : 'id';
        
        const translationResult = await adminTranslationService.translateAndSaveTherapistData(
          String(therapist.$id || therapist.id),
          {
            description: description.trim(),
            massageTypes: selectedMassageTypes.join(', '),
            location: (therapist?.location || '').trim(),
            name: name.trim()
          },
          sourceLanguage
        );
        
        if (translationResult.success) {
          console.log('✅ Auto-translation completed successfully');
        } else {
          console.warn('⚠️ Auto-translation failed:', translationResult.error);
        }
      } catch (translationError) {
        console.error('❌ Translation error (non-blocking):', translationError);
      }

      // Fire refresh event
      console.log('🔔 Dispatching refreshTherapistData event...');
      window.dispatchEvent(new CustomEvent('refreshTherapistData', { detail: 'profile-updated' }));
      
      showToast('✅ Profile saved and LIVE!', 'success');
      console.log('✅ Profile saved successfully - Check HomePage in 2 seconds');
    } catch (e) {
      console.error('❌ Failed to save profile:', e);
      showToast('Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const canSave = name.trim() && /^\+62\d{6,15}$/.test(whatsappNumber.trim()) && coordinates;

  // Safety check for null therapist
  if (!therapist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading therapist data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Simple Header */}
      <div className="w-full bg-white border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Upload Your Profile</h1>
              <p className="text-xs text-gray-500">Complete all fields to publish</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onNavigateToStatus} 
              className="text-xs px-3 py-2 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 font-medium"
              style={{ display: onNavigateToStatus ? 'block' : 'none' }}
            >
              Status
            </button>
            <button 
              onClick={onLogout} 
              className="text-xs px-3 py-2 rounded-lg border hover:bg-gray-50"
              style={{ display: onLogout ? 'block' : 'none' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Upload Form Card */}
      <main className="flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
            <h2 className="text-white text-lg font-bold">📝 Profile Information</h2>
            <p className="text-orange-100 text-sm">Fill in your details to appear on the live site</p>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Name *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">📱 WhatsApp Number *</label>
              <input
                value={whatsappNumber}
                onChange={e => setWhatsappNumber(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="+62812345678"
              />
              <p className="text-xs text-gray-500 mt-1">Format: +62 followed by 6-15 digits</p>
            </div>

            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🖼️ Profile Picture</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-upload"
                />
                <label htmlFor="profile-upload" className="cursor-pointer">
                  {(profileImageDataUrl || therapist?.profilePicture) ? (
                    <img
                      src={profileImageDataUrl || therapist?.profilePicture}
                      alt="Preview"
                      className="w-28 h-28 rounded-full object-cover border-4 border-orange-200 mx-auto mb-2"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                      <span className="text-4xl">📷</span>
                    </div>
                  )}
                  <p className="text-sm text-orange-600 font-medium">{uploadingImage ? 'Uploading...' : 'Click to upload'}</p>
                  <p className="text-xs text-gray-500">Max 5MB</p>
                </label>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">📍 Location *</label>
              <button
                onClick={handleSetLocation}
                className="w-full px-4 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 font-semibold shadow-md hover:shadow-lg transition-all"
              >
                {locationSet ? '✅ Location Set - Click to Update' : '📍 Set My Location'}
              </button>
              <div 
                className="mt-3 p-3 bg-green-50 border-2 border-green-200 rounded-lg"
                style={{ display: (locationSet && coordinates) ? 'block' : 'none' }}
              >
                {coordinates && (
                  <p className="text-sm text-green-800 font-medium">
                    ✅ Location captured: {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                  </p>
                )}
              </div>
              <div 
                ref={mapRef} 
                className="mt-3 w-full h-48 rounded-lg border-2 border-gray-300"
                style={{ display: coordinates ? 'block' : 'none' }}
              ></div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">📄 Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={5}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                placeholder="Describe your massage services, experience, and specialties..."
              />
              <p className={`text-xs mt-1 ${countWords(description) > 350 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                {countWords(description)} / 350 words
              </p>
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🎯 Years of Experience</label>
              <input
                type="number"
                min="1"
                max="50"
                value={yearsOfExperience}
                onChange={e => setYearsOfExperience(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="5"
              />
              <p className="text-xs text-gray-500 mt-1">Enter your years of professional massage experience (1-50)</p>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🌍 Languages (up to 3)</label>
              <div className="flex flex-wrap gap-2">
                {languageOptions.map(opt => (
                  <button
                    key={opt.code}
                    onClick={() => handleToggleLanguage(opt.code)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                      selectedLanguages.includes(opt.code)
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                        : 'bg-white hover:bg-orange-50 border-gray-300 hover:border-orange-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">{selectedLanguages.length} / 3 selected</p>
            </div>

            {/* Massage Types */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">💆 Massage Types (up to 5)</label>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {MASSAGE_TYPES_CATEGORIZED.flatMap(category => category.types).map(type => (
                  <button
                    key={type}
                    onClick={() => handleToggleMassageType(type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                      selectedMassageTypes.includes(type)
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                        : 'bg-white hover:bg-orange-50 border-gray-300 hover:border-orange-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">{selectedMassageTypes.length} / 5 selected</p>
            </div>

            {/* Pricing */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">💰 Pricing (in thousands, e.g., 100 = 100k IDR)</label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1 font-medium">60 min</label>
                  <input
                    value={price60}
                    onChange={e => setPrice60(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:outline-none transition-colors text-center font-semibold"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1 font-medium">90 min</label>
                  <input
                    value={price90}
                    onChange={e => setPrice90(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:outline-none transition-colors text-center font-semibold"
                    placeholder="150"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1 font-medium">120 min</label>
                  <input
                    value={price120}
                    onChange={e => setPrice120(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:outline-none transition-colors text-center font-semibold"
                    placeholder="200"
                  />
                </div>
              </div>
            </div>

            {/* Validation Warning */}
            <div 
              className="bg-red-50 border-2 border-red-200 rounded-lg p-4"
              style={{ display: !canSave ? 'block' : 'none' }}
            >
              <p className="text-sm text-red-700 font-semibold">⚠️ Missing Required Fields:</p>
              <ul className="text-xs text-red-600 mt-2 space-y-1 list-disc list-inside">
                <li style={{ display: !name.trim() ? 'list-item' : 'none' }}>Name is required</li>
                <li style={{ display: !/^\+62\d{6,15}$/.test(whatsappNumber.trim()) ? 'list-item' : 'none' }}>Valid WhatsApp number is required</li>
                <li style={{ display: !coordinates ? 'list-item' : 'none' }}>Location must be set</li>
              </ul>
            </div>

            {/* Publish Button */}
            <div className="pt-4">
              <button
                onClick={handleSaveProfile}
                disabled={saving || !canSave}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-lg hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:transform-none"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Publishing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    🚀 Publish Profile & Go Live
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TherapistPortalPage;
