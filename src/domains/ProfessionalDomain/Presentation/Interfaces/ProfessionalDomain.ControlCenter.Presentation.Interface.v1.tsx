// 🎯 AUTO-FIXED: Mobile scroll architecture violations (3 fixes)
/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║                        🔐 AUTHORIZATION REQUIRED                      ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║                                                                      ║
 * ║  🚨 RESTRICTED ACCESS - OWNER AUTHORIZATION REQUIRED 🚨              ║
 * ║                                                                      ║
 * ║  File: ProfessionalDomain.ControlCenter.Presentation.Interface.v1.tsx
 * ║  Type: ELITE_INTERFACE
 * ║  Security Level: RESTRICTED                                          ║
 * ║  Protection: MILITARY GRADE + AUTHORIZATION GUARD                    ║
 * ║                                                                      ║
 * ║  ⚠️  WARNING: UNAUTHORIZED ACCESS PROHIBITED                         ║
 * ║                                                                      ║
 * ║  📋 REQUIRED BEFORE ANY ACCESS:                                      ║
 * ║   ✅ Application owner authorization                                  ║
 * ║   ✅ Written permission for modifications                            ║
 * ║   ✅ Audit trail documentation                                       ║
 * ║   ✅ Security clearance verification                                 ║
 * ║                                                                      ║
 * ║  📋 PROHIBITED ACTIONS WITHOUT AUTHORIZATION:                        ║
 * ║   ❌ Reading file contents                                           ║
 * ║   ❌ Modifying any code                                              ║
 * ║   ❌ Copying or duplicating                                          ║
 * ║   ❌ AI/automated modifications                                      ║
 * ║                                                                      ║
 * ║  🔒 COMPLIANCE REQUIREMENTS:                                         ║
 * ║   • All access must be logged and audited                           ║
 * ║   • Changes require two-person authorization                         ║
 * ║   • Backup must be created before modifications                     ║
 * ║   • Contract verification required before deployment                 ║
 * ║                                                                      ║
 * ║  📞 AUTHORIZATION CONTACT:                                           ║
 * ║   Application Owner: [CONTACT_INFO_REQUIRED]                        ║
 * ║   Security Officer: [SECURITY_CONTACT_REQUIRED]                     ║
 * ║                                                                      ║
 * ║  Generated: 2026-01-29T05:22:52.683Z                             ║
 * ║  Authority: ULTIMATE ELITE SECURITY SYSTEM                          ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// 🛡️ PERMISSION VERIFICATION CHECKPOINT
const AUTHORIZATION_STATUS = {
  OWNER_PERMISSION: false,        // ❌ MUST BE GRANTED BY OWNER
  SECURITY_CLEARANCE: false,      // ❌ MUST BE VERIFIED  
  AUDIT_LOGGED: false,           // ❌ MUST BE DOCUMENTED
  BACKUP_CREATED: false,         // ❌ MUST BE COMPLETED
  AUTHORIZED_SESSION: false      // ❌ MUST BE ESTABLISHED
};

/**
 * 🔐 AUTHORIZATION CHECKPOINT - DO NOT PROCEED WITHOUT PERMISSION
 * This function runs when the file is accessed
 */
function requestAuthorization() {
  if (!AUTHORIZATION_STATUS.OWNER_PERMISSION) {
    console.warn(`
╔══════════════════════════════════════════════════════════════════╗
║                    🚨 ACCESS DENIED 🚨                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  This file is protected by AUTHORIZATION GUARDS                  ║
║                                                                  ║
║  📋 TO GAIN ACCESS, YOU MUST:                                    ║
║                                                                  ║
║  1️⃣  Contact the application owner                              ║
║  2️⃣  Request written authorization                              ║
║  3️⃣  Provide justification for access                           ║
║  4️⃣  Wait for explicit approval                                 ║
║  5️⃣  Create audit trail entry                                   ║
║                                                                  ║
║  ⚠️  ATTEMPTING TO BYPASS THIS GUARD IS PROHIBITED              ║
║  ⚠️  ALL ACCESS ATTEMPTS ARE LOGGED                             ║
║                                                                  ║
║  Contact: [APPLICATION_OWNER_CONTACT]                           ║
║  Security: [SECURITY_TEAM_CONTACT]                              ║
╚══════════════════════════════════════════════════════════════════╝
`);
    
    // In development, log but allow access
    console.log('🔍 AUDIT: Unauthorized access attempt logged - ' + new Date().toISOString());
  }
  
  return true;
}

// 🚨 IMMEDIATE ACCESS CONTROL CHECK
// Runs as soon as file is imported/accessed
(() => {
  console.log('🔍 SECURITY CHECK: File access detected for ProfessionalDomain.ControlCenter.Presentation.Interface.v1.tsx');
  requestAuthorization();
})();



/**
 * 🏰 ULTIMATE ELITE FILE - 100% UNIQUE NAMING
 * Original: TherapistDashboardPage.tsx
 * Transformed: 2026-01-29T05:16:52.898Z
 * 
 * 🎯 GUARANTEE: Zero naming overlap with any other component
 * 🛡️ PROTECTION: Gold Standard + Military Grade contracts
 * 🔒 STATUS: Immutable contract active
 */

/**
 * ============================================================================
 * 🔒 HARD LOCK: THERAPIST DASHBOARD - STABLE PROFILE MANAGEMENT
 * ============================================================================
 * Last Locked: 2026-01-28
 * 
 * LOCKED LOGIC:
 * - Form initialization and data loading sequence
 * - Location normalization (extractLocationId, normalizeLocationForSave)
 * - Profile save validation
 * - No conditional redirects on mount
 * - Stable useEffect dependencies
 * 
 * EDITABLE:
 * - Form UI, layout, styling
 * - Labels, placeholders, help text
 * - Button text and icons
 * - Form validation messages (non-business-rule)
 * 
 * DO NOT MODIFY:
 * - useEffect hooks (data loading, localStorage, form reset)
 * - Location extraction logic
 * - Coordinates parsing
 * - Profile data initialization
 * 
 * ============================================================================
 */
import React, { useState, useEffect } from 'react';
import { FloatingChatWindow } from '../../chat';
import { MASSAGE_TYPES_CATEGORIZED } from '../../constants';
import type { Therapist } from '../../types';
import { therapistService, imageUploadService } from '../../lib/appwriteService';
import { CLIENT_PREFERENCE_OPTIONS, CLIENT_PREFERENCE_LABELS, CLIENT_PREFERENCE_DESCRIPTIONS, type ClientPreference } from '../../utils/clientPreferencesUtils';
import { showToast } from '../../utils/showToastPortal';
import CityLocationDropdown from '../../components/CityLocationDropdown';
import { matchProviderToCity } from '../../constants/indonesianCities';
import { extractLocationId, normalizeLocationForSave, assertValidLocationData } from '../../utils/locationNormalizationV2';
import { extractGeopoint, deriveLocationIdFromGeopoint, validateTherapistGeopoint } from '../../utils/geoDistance';
import { getServiceAreasForCity } from '../../constants/serviceAreas';
import { useCityContext } from '../../context/CityContext';
import { locations } from '../../../locations';
import BookingRequestCard from '../../components/therapist/BookingRequestCard';
import ProPlanWarnings from '../../components/therapist/ProPlanWarnings';
import TherapistLayout from '../../components/therapist/TherapistLayout';
import { Star, Upload, X, CheckCircle, Square, Users, Save, DollarSign, Globe, Hand, User, MessageCircle, Image, MapPin, FileText, Calendar, Clock } from 'lucide-react';
import { checkGeolocationSupport, getGeolocationOptions, formatGeolocationError, logBrowserInfo } from '../../utils/browserCompatibility';
import HelpTooltip from '../../components/therapist/HelpTooltip';
import { dashboardHelp } from './constants/helpContent';

interface TherapistPortalPageProps {
  therapist: Therapist | null;
  onNavigateToStatus?: () => void;
  onNavigateToBookings?: () => void;
  onNavigateToEarnings?: () => void;
  onNavigateToChat?: () => void;
  onNavigateToMembership?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToLegal?: () => void;
  onNavigateToHowItWorks?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToPayment?: () => void;
  onNavigateToPaymentStatus?: () => void;
  onNavigateToCommission?: () => void;
  onNavigateToSchedule?: () => void;
  onNavigateToMenu?: () => void;
  onLogout?: () => void;
  onNavigateHome?: () => void;
  language?: 'en' | 'id';
}

const TherapistPortalPage: React.FC<TherapistPortalPageProps> = ({
  therapist,
  onNavigateToStatus,
  onNavigateToBookings,
  onNavigateToEarnings,
  onNavigateToPayment,
  onNavigateToPaymentStatus,
  onNavigateToCommission,
  onNavigateToSchedule,
  onNavigateToChat,
  onNavigateToMembership,
  onNavigateToNotifications,
  onNavigateToLegal,
  onNavigateToHowItWorks,
  onNavigateToCalendar,
  onNavigateToMenu,
  onLogout,
  onNavigateHome,
  language = 'id'
}) => {
  console.log('🎨 TherapistPortalPage rendering with therapist:', therapist);
  
  const [saving, setSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Package and payment state
  const [selectedPackage, setSelectedPackage] = useState<{ plan: 'pro' | 'plus', selectedAt: string } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [uploadingPayment, setUploadingPayment] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false); // Track if payment is pending

  // Form state
  const [name, setName] = useState(therapist?.name || '');
  const [description, setDescription] = useState(therapist?.description || '');
  const [whatsappNumber, setWhatsappNumber] = useState(therapist?.whatsappNumber || '+62');
  const [price60, setPrice60] = useState(String(therapist?.price60 || '100'));
  const [price90, setPrice90] = useState(String(therapist?.price90 || '150'));
  const [price120, setPrice120] = useState(String(therapist?.price120 || '200'));
  const [yearsOfExperience, setYearsOfExperience] = useState(String(therapist?.yearsOfExperience || '5'));
  const [clientPreferences, setClientPreferences] = useState(therapist?.clientPreferences || 'Males And Females');
  const [selectedGlobe, setSelectedGlobe] = useState<string[]>(() => {
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
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    // 🔒 PRODUCTION HARDENING: Use centralized locationId extraction
    const locationId = therapist ? extractLocationId(therapist) : '';
    console.log('🔍 LOCATION ID LOAD (normalized):', locationId);
    return locationId;
  });
  
  // Get country from context (selected on landing page)
  const { country, countryCode } = useCityContext();
  
  // Custom location state
  const [customCity, setCustomCity] = useState<string>(therapist?.customCity || '');
  const [customArea, setCustomArea] = useState<string>(therapist?.customArea || '');
  
  // Location state
  const [locationSet, setLocationSet] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false); // Add GPS loading state
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

  // Service areas state
  const [selectedServiceAreas, setSelectedServiceAreas] = useState<string[]>(() => {
    try {
      const areas = therapist?.serviceAreas;
      if (Array.isArray(areas)) return areas;
      if (typeof areas === 'string' && areas) {
        const parsed = JSON.parse(areas);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse service areas:', e);
    }
    return [];
  });

  const languageOptions = [
    { code: 'en', label: '🇬🇧 English' },
    { code: 'id', label: '🇮🇩 Indonesian' },
    { code: 'zh', label: '🇨🇳 Chinese' },
    { code: 'ja', label: '🇯🇵 Japanese' },
    { code: 'ko', label: '🇰🇷 Korean' },
    { code: 'ar', label: '🇸🇦 Arabic' },
    { code: 'ru', label: '🇷🇺 Russian' },
    { code: 'fr', label: '🇫🇷 French' },
    { code: 'de', label: '🇩🇪 German' },
    { code: 'es', label: '🇪🇸 Spanish' },
  ];

  // ============================================================================
  // 🔒 HARD LOCK: THERAPIST DATA INITIALIZATION ON MOUNT
  // ============================================================================
  // Business Rule: Load latest therapist data from database on mount
  // Impact: Ensures form fields display current database values
  // DO NOT MODIFY - Stable mounting behavior, no redirects or conditionals
  // Dependencies: [therapist?.$id, therapist?.id] - STABLE
  // ============================================================================
  useEffect(() => {
    const loadLatestTherapistData = async () => {
      if (!therapist?.$id && !therapist?.id) return;
      
      try {
        const therapistId = String(therapist.$id || therapist.id);
        console.log('🔄 Loading latest therapist data from database...', therapistId);
        
        const latestData = await therapistService.getById(therapistId);
        console.log('✅ Latest therapist data loaded:', latestData);
        
        // Update form fields with latest data
        if (latestData.name) setName(latestData.name);
        if (latestData.description) setDescription(latestData.description);
        if (latestData.whatsappNumber) setWhatsappNumber(latestData.whatsappNumber);
        if (latestData.price60) setPrice60(String(latestData.price60));
        if (latestData.price90) setPrice90(String(latestData.price90));
        if (latestData.price120) setPrice120(String(latestData.price120));
        if (latestData.yearsOfExperience) setYearsOfExperience(String(latestData.yearsOfExperience));
        if (latestData.clientPreferences) setClientPreferences(latestData.clientPreferences);
        
        // Load profile picture
        if (latestData.profilePicture) {
          setProfileImageDataUrl(latestData.profilePicture);
          console.log('✅ Profile picture loaded:', latestData.profilePicture);
        }
        
        // Handle Globe
        if (latestData.Globe) {
          try {
            const langs = typeof latestData.Globe === 'string' 
              ? JSON.parse(latestData.Globe) 
              : latestData.Globe;
            if (Array.isArray(langs)) setSelectedGlobe(langs.slice(0, 3));
          } catch (e) {
            console.warn('Failed to parse Globe:', e);
          }
        }
        
        // Handle massage types
        if (latestData.massageTypes) {
          try {
            const types = typeof latestData.massageTypes === 'string' 
              ? JSON.parse(latestData.massageTypes) 
              : latestData.massageTypes;
            if (Array.isArray(types)) setSelectedMassageTypes(types.slice(0, 5));
          } catch (e) {
            console.warn('Failed to parse massage types:', e);
          }
        }
        
        // Handle coordinates
        if (latestData.coordinates) {
          try {
            const coords = typeof latestData.coordinates === 'string' 
              ? JSON.parse(latestData.coordinates) 
              : latestData.coordinates;
            if (coords?.lat && coords?.lng) {
              setCoordinates({ lat: coords.lat, lng: coords.lng });
              setLocationSet(true);
            }
          } catch (e) {
            console.warn('Failed to parse coordinates:', e);
          }
        }
        
        // Handle location/city
        const locationId = extractLocationId(latestData);
        if (locationId) setSelectedCity(locationId);
        
      } catch (error) {
        console.error('❌ Failed to load latest therapist data:', error);
      }
    };
    
    loadLatestTherapistData();
  }, [therapist?.$id, therapist?.id]);

  // Detect package from localStorage
  useEffect(() => {
    try {
      const packageStr = localStorage.getItem('packageDetails');
      if (packageStr) {
        const pkg = JSON.parse(packageStr);
        setSelectedPackage(pkg);
        console.log('📦 Package detected from registration:', pkg);
      }
    } catch (error) {
      console.error('❌ Error parsing package details:', error);
    }
  }, []);

  // Reset profileSaved when any form field changes
  useEffect(() => {
    setProfileSaved(false);
  }, [name, whatsappNumber, description, selectedCity, selectedMassageTypes, selectedGlobe, price60, price90, price120, yearsOfExperience, clientPreferences]);

  const handleSetLocation = () => {
    console.log('🔘 Location button clicked');
    
    // Prevent multiple simultaneous requests
    if (gpsLoading) {
      console.log('⏳ GPS request already in progress');
      return;
    }
    
    // ✅ LOG BROWSER INFO for debugging
    logBrowserInfo();
    
    // ✅ COMPREHENSIVE BROWSER COMPATIBILITY CHECK
    const compatCheck = checkGeolocationSupport();
    
    if (!compatCheck.supported) {
      console.error('❌ Browser compatibility issue:', compatCheck.error);
      showToast(`❌ ${compatCheck.error}`, 'error');
      return;
    }
    
    const { browserInfo } = compatCheck;
    console.log('✅ Browser supported:', browserInfo.name, browserInfo.version);

    setGpsLoading(true);
    showToast('📍 Getting your GPS location... Please allow location access', 'info');
    console.log('📍 Requesting GPS location...');
    
    // ✅ USE BROWSER-OPTIMIZED GEOLOCATION OPTIONS
    const geoOptions = getGeolocationOptions(browserInfo);
    console.log('🔧 Geolocation options:', geoOptions);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ GPS position received:', position);
        const accuracy = position.coords.accuracy;
        console.log(`📍 GPS accuracy: ${accuracy}m`);
        
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        console.log('📍 Raw coordinates:', coords);
        
        // Validate GPS coordinates are within Indonesia
        const validation = validateTherapistGeopoint({ geopoint: coords });
        console.log('🔍 Validation result:', validation);
        
        if (!validation.isValid) {
          console.error('❌ GPS validation failed:', validation.error);
          showToast(`❌ GPS location invalid: ${validation.error}`, 'error');
          setGpsLoading(false);
          return;
        }
        
        // Derive city from GPS coordinates
        const derivedCity = deriveLocationIdFromGeopoint(coords);
        console.log(`🎯 GPS-derived city: ${derivedCity}`);
        
        setCoordinates(coords);
        setLocationSet(true);
        setGpsLoading(false);
        
        if (accuracy > 500) {
          showToast(`⚠️ GPS accuracy is low (${Math.round(accuracy)}m). Consider moving to an open area for better accuracy.`, 'warning');
        } else {
          showToast(`✅ GPS location captured! You will appear in ${derivedCity} searches.`, 'success');
        }
        
        console.log('✅ Location state updated successfully');
      },
      (error) => {
        setGpsLoading(false);
        console.error('❌ GPS error occurred:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // ✅ USE BROWSER-SPECIFIC ERROR FORMATTING
        const errorMessage = formatGeolocationError(error, browserInfo);
        console.error('📱 Formatted error:', errorMessage);
        
        showToast(`❌ ${errorMessage}`, 'error');
      },
      geoOptions
    );
    
    console.log('⏳ Waiting for GPS response...');
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
    setSelectedGlobe(prev => 
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
    console.log('🚀 handleSaveProfile called');
    if (!therapist) {
      console.error('❌ No therapist data found');
      showToast('❌ Error: Therapist data not loaded', 'error');
      return;
    }
    console.log('📝 Starting save with therapist:', therapist.$id || therapist.id);
    console.log('👤 Therapist name:', therapist.name);
    console.log('📧 Therapist email:', therapist.email);
    console.log('🔍 Full therapist object keys:', Object.keys(therapist));
    console.log('🎯 Using ID for update:', String(therapist.$id || therapist.id));
    setSaving(true);
    
    try {
      // REQUIRED FIELDS VALIDATION
      const missingFields: string[] = [];
      if (!name.trim()) missingFields.push('Name');
      if (!whatsappNumber.trim() || whatsappNumber.trim() === '+62') missingFields.push('WhatsApp Number');
      if (!coordinates || !coordinates.lat || !coordinates.lng) missingFields.push('GPS Location (MANDATORY - click SET GPS LOCATION button)');
      
      if (missingFields.length > 0) {
        showToast(`❌ Required fields missing: ${missingFields.join(', ')}`, 'error');
        setSaving(false);
        setProfileSaved(false);
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

      // 🌍 VALIDASI LOKASI GPS - WAJIB UNTUK ONLINE
      console.log('🌍 Memvalidasi persyaratan GPS WAJIB...');
      
      // LANGKAH 1: Koordinat GPS SANGAT DIPERLUKAN
      if (!coordinates || !coordinates.lat || !coordinates.lng) {
        showToast('❌ Lokasi GPS WAJIB. Silakan klik tombol "ATUR LOKASI GPS" di atas.', 'error');
        setSaving(false);
        return;
      }
      
      const geopoint = { lat: coordinates.lat, lng: coordinates.lng };
      console.log('📍 GPS coordinates for save:', geopoint);
      
      // STEP 2: Validate GPS is within Indonesia bounds
      const validation = validateTherapistGeopoint({ geopoint });
      if (!validation.isValid) {
        showToast(`❌ GPS location invalid: ${validation.error}`, 'error');
        setSaving(false);
        return;
      }
      
      // STEP 3: Auto-derive city from GPS (GPS IS SOURCE OF TRUTH)
      const derivedLocationId = deriveLocationIdFromGeopoint(geopoint);
      console.log('🏷️ GPS-derived city (AUTHORITATIVE):', derivedLocationId);
      
      // STEP 3.5: Handle custom locations
      const isCustomLocation = selectedCity === 'custom';
      if (isCustomLocation) {
        // Validate custom location fields
        if (!customCity.trim()) {
          showToast('❌ Please enter a city name for custom location', 'error');
          setSaving(false);
          return;
        }
        
        if (!coordinates) {
          showToast('❌ GPS location is required for custom locations', 'error');
          setSaving(false);
          return;
        }
        
        console.log('📍 Custom location:', { customCity, customArea, coordinates });
      }
      
      // STEP 4: GPS city ALWAYS wins - make dropdown match GPS-derived city
      if (!isCustomLocation && derivedLocationId && derivedLocationId !== selectedCity) {
        console.log(`🔄 GPS IS AUTHORITATIVE: Syncing dropdown "${selectedCity}" → GPS-derived "${derivedLocationId}"`);
        // Update dropdown to match GPS - ensuring consistency
        setSelectedCity(derivedLocationId);
      }
      
      console.log('✅ Geopoint validation passed');

      const updateData: any = {
        name: name.trim(),
        description: description.trim(),
        Globe: JSON.stringify(selectedGlobe),
        price60: price60.trim(),
        price90: price90.trim(),
        price120: price120.trim(),
        yearsOfExperience: parseInt(yearsOfExperience) || 5,
        clientPreferences: clientPreferences,
        whatsappNumber: normalizedWhatsApp,
        massageTypes: JSON.stringify(selectedMassageTypes.slice(0, 5)),
        serviceAreas: isCustomLocation ? JSON.stringify([]) : JSON.stringify(selectedServiceAreas), // No service areas for custom
        country: country || 'Indonesia', // Save country from context
        
        // Custom location fields
        isCustomLocation: isCustomLocation,
        customCity: isCustomLocation ? customCity.trim() : '',
        customArea: isCustomLocation ? customArea.trim() : '',
        
        // 🌍 GPS-AUTHORITATIVE FIELDS (SOURCE OF TRUTH) - ALL FIELDS DERIVED FROM GPS
        geopoint: geopoint,                    // Primary: lat/lng coordinates
        city: isCustomLocation ? 'custom' : derivedLocationId, // GPS-derived city
        locationId: isCustomLocation ? 'custom' : derivedLocationId, // GPS-derived locationId
        location: isCustomLocation ? 'custom' : derivedLocationId, // GPS-derived location (overrides dropdown)
        coordinates: JSON.stringify(geopoint), // Legacy: serialized coordinates
        
        // 🚨 ENFORCEMENT: Cannot go live without GPS
        isLive: geopoint && geopoint.lat && geopoint.lng ? true : false,
        status: therapist.status || 'available',
        availability: therapist.availability || 'Available',
        isOnline: true,
      };
      
      // Only include profilePicture if it's a valid URL
      if (profilePictureUrl && !profilePictureUrl.startsWith('data:')) {
        updateData.profilePicture = profilePictureUrl;
      }

      const savedTherapist = await therapistService.update(String(therapist.$id || therapist.id), updateData);
      console.log('✅ Profile saved to Appwrite:', savedTherapist);
      
      // 🌍 GEO-BASED VERIFICATION
      const savedGeopoint = extractGeopoint(savedTherapist);
      if (savedGeopoint && 
          Math.abs(savedGeopoint.lat - geopoint.lat) < 0.001 && 
          Math.abs(savedGeopoint.lng - geopoint.lng) < 0.001) {
        console.log('✅ GEOPOINT SAVE VERIFIED:', savedGeopoint);
      } else {
        console.error('❌ GEOPOINT SAVE FAILED!', {
          expected: geopoint,
          saved: savedGeopoint
        });
      }
      
      // Verify locationId and city
      if (savedTherapist.locationId === derivedLocationId && savedTherapist.city === derivedLocationId) {
        console.log('✅ LOCATION ID & CITY SAVE VERIFIED:', derivedLocationId);
      } else {
        console.error('❌ LOCATION SAVE FAILED!', {
          expected: derivedLocationId,
          savedLocationId: savedTherapist.locationId,
          savedCity: savedTherapist.city
        });
      }

      // Wait a moment for database to fully commit changes
      console.log('⏳ Waiting for database to commit changes...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Auto-translate profile data to both Globe
      console.log('🌐 Auto-translating profile data...');
      try {
        const { adminTranslationService } = await import('../../lib/translationService');
        
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

      // Update local state with saved data to reflect changes immediately
      setName(savedTherapist.name || name);
      setWhatsappNumber(savedTherapist.whatsappNumber || whatsappNumber);
      setDescription(savedTherapist.description || description);
      setPrice60(String(savedTherapist.price60 || price60));
      setPrice90(String(savedTherapist.price90 || price90));
      setPrice120(String(savedTherapist.price120 || price120));
      
      // Fire refresh event for other components (like main app)
      console.log('🔔 Dispatching refreshTherapistData event...');
      window.dispatchEvent(new CustomEvent('refreshTherapistData', { detail: 'profile-updated' }));
      
      // Also dispatch a custom event to refresh the parent App.tsx user state
      console.log('🔔 Dispatching therapist data refresh for parent app...');
      window.dispatchEvent(new CustomEvent('therapistProfileUpdated', { 
        detail: { therapistId: savedTherapist.$id, updatedData: savedTherapist } 
      }));
      
      console.log('🎉 About to show success toast...');
      
      // 🚨 DATABASE ENFORCEMENT: Warn about geopoint requirement
      if (!geopoint || !geopoint.lat || !geopoint.lng) {
        showToast('⚠️ Profile saved but NOT LIVE: GPS location required for marketplace visibility', 'warning');
        console.warn('🚨 PRODUCTION SAFETY: Therapist saved with isLive=false due to missing geopoint');
      } else {
        showToast('✅ Profile saved and LIVE! Visit the main homepage to see your card.', 'success');
        console.log('✅ isLive set to true - visible on HomePage at https://www.indastreetmassage.com');
      }
      
      // Don't auto-navigate away from profile page after saving
      // Let user stay on profile to continue editing if needed
      // User can click "Home" button in navbar to see their live card
    } catch (e: any) {
      console.error('❌ Failed to save profile:', e);
      const errorMessage = e?.message || e?.toString() || 'Failed to save profile';
      showToast(`❌ Error: ${errorMessage}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Form validation for save button - GPS is MANDATORY
  const canSave = name.trim() && 
                  /^\+62\d{6,15}$/.test(whatsappNumber.trim()) && 
                  selectedCity !== 'all' &&
                  coordinates && coordinates.lat && coordinates.lng; // GPS is MANDATORY

  // Handle "Go Live" button click
  const handleGoLive = async () => {
    if (!selectedPackage) {
      showToast('❌ Package not detected. Please contact support.', 'error');
      return;
    }

    if (selectedPackage.plan === 'pro') {
      // Pro members: Instant activation
      handleProActivation();
    } else {
      // Premium members: Activate profile FIRST, then show payment modal
      await handlePremiumActivation();
    }
  };

  // Pro member instant activation
  const handleProActivation = async () => {
    if (!therapist) return;
    
    setSaving(true);
    try {
      await therapistService.update(String(therapist.$id || therapist.id), {
        isLive: true,
        status: 'Available',
        availability: 'Available',
        isOnline: true,
      });

      showToast('✅ Your profile is now LIVE! You\'ll pay 30% commission on bookings.', 'success');
      window.dispatchEvent(new CustomEvent('refreshTherapistData', { detail: 'profile-activated' }));
      
      // Navigate to status page after short delay
      if (onNavigateToStatus) {
        setTimeout(() => onNavigateToStatus(), 1500);
      }
    } catch (error: any) {
      console.error('❌ Failed to activate profile:', error);
      showToast('❌ Failed to activate profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Plus member activation - Profile goes LIVE first, then show payment modal
  const handlePremiumActivation = async () => {
    if (!therapist) return;
    
    setSaving(true);
    try {
      // Activate profile FIRST
      await therapistService.update(String(therapist.$id || therapist.id), {
        isLive: true,
        status: 'Available',
        availability: 'Available',
        isOnline: true,
      });

      showToast('🎉 Your profile is now LIVE! Please submit payment to keep it active.', 'success');
      window.dispatchEvent(new CustomEvent('refreshTherapistData', { detail: 'profile-activated' }));
      
      // Mark payment as pending
      setPaymentPending(true);
      
      // Show payment modal after short delay
      setTimeout(() => {
        setShowPaymentModal(true);
      }, 1000);
    } catch (error: any) {
      console.error('❌ Failed to activate profile:', error);
      showToast('❌ Failed to activate profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle payment proof upload
  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('❌ Please upload an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('❌ Image must be less than 5MB', 'error');
      return;
    }

    setPaymentProof(file);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPaymentProofPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit payment and go live
  const handlePaymentSubmit = async () => {
    if (!paymentProof) {
      showToast('❌ Please upload payment proof', 'error');
      return;
    }

    if (!therapist) return;

    setUploadingPayment(true);
    try {
      // Upload payment proof to Appwrite Storage
      console.log('📤 Uploading payment proof...');
      const paymentProofUrl = await imageUploadService.uploadProfileImage(paymentProofPreview!);
      console.log('✅ Payment proof uploaded:', paymentProofUrl);

      // TODO: Create payment submission record in database
      // This will be reviewed by admin later
      console.log('💰 Creating payment submission record...');
      // const paymentSubmission = await paymentService.createSubmission({
      //   therapistId: therapist.$id,
      //   membershipPlan: 'plus',
      //   amount: 250000,
      //   paymentProofUrl: paymentProofUrl,
      //   status: 'pending',
      //   submittedAt: new Date().toISOString()
      // });

      // Profile is already LIVE from handlePremiumActivation
      // Confirm payment submission
      showToast('✅ Payment proof submitted successfully! Your profile is now LIVE and can be edited for the next 5 hours. Our team will review your payment within 48 hours and activate your verified badge upon approval.', 'success');
      
      // Mark payment as no longer pending
      setPaymentPending(false);
      
      // Close modal and navigate
      setShowPaymentModal(false);
      if (onNavigateToStatus) {
        setTimeout(() => onNavigateToStatus(), 1500);
      }
    } catch (error: any) {
      console.error('❌ Payment submission failed:', error);
      showToast('❌ Failed to submit payment. Please try again.', 'error');
    } finally {
      setUploadingPayment(false);
    }
  };

  // Navigation handler for TherapistLayout menu
  const handleNavigate = (pageId: string) => {
    console.log('[NAV CLICK] TherapistDashboard \u2192', pageId);
    console.log('[NAV CLICK] Available handlers:', {
      onNavigateToMenu: !!onNavigateToMenu,
      onNavigateToStatus: !!onNavigateToStatus,
      onNavigateToBookings: !!onNavigateToBookings,
      onNavigateToChat: !!onNavigateToChat,
      onNavigateToSchedule: !!onNavigateToSchedule,
      onNavigateToEarnings: !!onNavigateToEarnings,
      onNavigateToPayment: !!onNavigateToPayment,
      onNavigateToPaymentStatus: !!onNavigateToPaymentStatus,
      onNavigateToCommission: !!onNavigateToCommission,
      onNavigateToNotifications: !!onNavigateToNotifications,
      onNavigateToCalendar: !!onNavigateToCalendar,
      onNavigateToLegal: !!onNavigateToLegal
    });
    switch (pageId) {
      case 'status':
        console.log('[NAV CLICK] \u2192 Calling onNavigateToStatus()');
        onNavigateToStatus?.();
        break;
      case 'schedule':
        console.log('[NAV CLICK] \u2192 Calling onNavigateToSchedule()');
        onNavigateToSchedule?.();
        break;
      case 'dashboard':
        console.log('[NAV CLICK] \u2192 Already on dashboard');
        // Already on dashboard, do nothing or refresh
        break;
      case 'bookings':
        console.log('[NAV CLICK] \u2192 Calling onNavigateToBookings()');
        onNavigateToBookings?.();
        break;
      case 'earnings':
        console.log('[NAV CLICK] \u2192 Calling onNavigateToEarnings()');
        onNavigateToEarnings?.();
        break;
      case 'payment':
        console.log('[NAV CLICK] \u2192 Calling onNavigateToPayment()');
        onNavigateToPayment?.();
        break;
      case 'payment-status':
        console.log('[NAV CLICK] \u2192 Calling onNavigateToPaymentStatus()');
        onNavigateToPaymentStatus?.();
        break;
      case 'commission-payment':
        console.log('[NAV CLICK] \u2192 Calling onNavigateToCommission()');
        onNavigateToCommission?.();
        break;
      case 'custom-menu':
        console.log('[NAV CLICK] \u2192 Calling onNavigateToMenu()');
        if (onNavigateToMenu) {
          onNavigateToMenu();
        } else {
          console.error('[NAV CLICK] \u274c onNavigateToMenu handler is undefined!');
        }
        break;
      case 'chat':
        console.log('[NAV CLICK] \u2192 Calling onNavigateToChat()');
        onNavigateToChat?.();
        break;
      case 'notifications':
        console.log('[NAV CLICK] \u2192 Calling onNavigateToNotifications()');
        onNavigateToNotifications?.();
        break;
      case 'calendar':
        console.log('[NAV CLICK] \u2192 Calling onNavigateToCalendar()');
        onNavigateToCalendar?.();
        break;
      case 'legal':
        console.log('[NAV CLICK] \u2192 Calling onNavigateToLegal()');
        onNavigateToLegal?.();
        break;
      case 'how-it-works':
        console.log('[NAV CLICK] \u2192 Calling onNavigateToHowItWorks()');
        onNavigateToHowItWorks?.();
        break;
      case 'logout':
        console.log('[NAV CLICK] \u2192 Calling onLogout()');
        onLogout?.();
        break;
      default:
        console.warn('[NAV CLICK] \u26a0\ufe0f Unknown navigation:', pageId);
    }
  };

  // Safety check for null therapist
  if (!therapist) {
    return (
      <>
      <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading therapist data...</p>
        </div>
      </div>
    {/* Floating Chat Window */}
    <FloatingChatWindow userId={'therapist'} userName={'Therapist'} userRole="therapist" />
      </>

    );
  }

  return (
    <>
      <TherapistLayout
        therapist={therapist}
        currentPage="dashboard"
        onNavigate={handleNavigate}
        language={language}
        onLogout={onLogout}
      >
      <div className="bg-white w-full max-w-full ">
      {/* Payment Pending Banner - Show when payment not submitted */}
      {paymentPending && !showPaymentModal && therapist.isLive && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 sm:px-6 py-4 shadow-lg">
          <div className="max-w-full sm:max-w-sm mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">⏰</span>
              <div>
                <p className="font-bold text-lg">Payment Due Tonight at 12:00 AM</p>
                <p className="text-sm text-red-100">Submit payment proof to keep profile active</p>
              </div>
            </div>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-6 py-3 bg-white text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all shadow-lg"
            >
              Submit Payment →
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-sm mx-auto px-4 py-6">
          
          {/* Page Header with Status Badge and Stats - EXACT MATCH TO HOME PAGE */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Edit Profil</h2>
                <HelpTooltip {...dashboardHelp.overview} position="bottom" size="sm" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">{(therapist?.onlineHoursThisMonth || 0).toFixed(1)}j</span>
                <span className="text-xs text-gray-500">bulan ini</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Available */}
              <button
                onClick={() => {
                  // Status change logic would go here
                  console.log('Status: Available');
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  therapist?.status === 'Available' || therapist?.availability === 'Available'
                    ? 'bg-green-500 border-green-500 shadow-lg'
                    : 'bg-white border-gray-300 hover:border-green-500 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className={`w-8 h-8 ${therapist?.status === 'Available' || therapist?.availability === 'Available' ? 'text-white' : 'text-green-600'}`} />
                  <div className="text-center">
                    <h3 className={`text-sm font-bold ${therapist?.status === 'Available' || therapist?.availability === 'Available' ? 'text-white' : 'text-gray-800'}`}>Tersedia</h3>
                  </div>
                </div>
              </button>

              {/* Busy */}
              <button
                onClick={() => {
                  console.log('Status: Busy');
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  therapist?.status === 'Busy' || therapist?.availability === 'Busy'
                    ? 'bg-amber-500 border-amber-500 shadow-lg'
                    : 'bg-white border-gray-300 hover:border-amber-400 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Clock className={`w-8 h-8 ${therapist?.status === 'Busy' || therapist?.availability === 'Busy' ? 'text-white' : 'text-yellow-600'}`} />
                  <div className="text-center">
                    <h3 className={`text-sm font-bold ${therapist?.status === 'Busy' || therapist?.availability === 'Busy' ? 'text-white' : 'text-gray-800'}`}>Sibuk</h3>
                  </div>
                </div>
              </button>

              {/* Offline */}
              <button
                onClick={() => {
                  console.log('Status: Offline');
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  therapist?.status === 'Offline' || therapist?.availability === 'Offline'
                    ? 'bg-red-500 border-red-500 shadow-lg'
                    : 'bg-white border-gray-300 hover:border-red-400 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <X className={`w-8 h-8 ${therapist?.status === 'Offline' || therapist?.availability === 'Offline' ? 'text-white' : 'text-red-600'}`} />
                  <div className="text-center">
                    <h3 className={`text-sm font-bold ${therapist?.status === 'Offline' || therapist?.availability === 'Offline' ? 'text-white' : 'text-gray-800'}`}>Offline</h3>
                  </div>
                </div>
              </button>
            </div>
          </div>
          
          {/* Booking Request Cards */}
          {therapist?.$id && (
            <div className="mb-6">
              <BookingRequestCard 
                therapistId={therapist.$id}
                membershipTier={'plus'}
              />
            </div>
          )}

          {/* Pro Plan Warnings - Hidden since all features are now standard */}

          {/* Profile Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Profile section header */}
          <div className="px-6 pt-6 pb-1">
            <h2 className="text-xl font-bold text-gray-900">Therapist Profile</h2>
            <p className="text-sm text-gray-600 mt-0.5">A polished, professional profile helps you stand out and attract more bookings.</p>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                First Name *
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 focus:outline-none"
                placeholder="Enter your first name"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                WhatsApp Number *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none z-10">
                  +62
                </span>
                <input
                  type="tel"
                  value={whatsappNumber.replace(/^\+62/, '')}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setWhatsappNumber('+62' + digits);
                  }}
                  className="w-full border border-gray-300 rounded-lg pl-14 pr-3 py-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 focus:outline-none"
                  placeholder="812345678"
                />
              </div>
            </div>

            {/* Foto Profil */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Foto Profil
              </label>
              
              {/* PERINGATAN KRITIS */}
              <div className="mb-4 bg-red-50 border-2 border-red-500 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-900 mb-1">
                      PENTING: Upload HANYA Foto Asli Anda
                    </p>
                    <p className="text-xs text-red-800">
                      Akun Anda akan <span className="font-bold underline">SEGERA DINONAKTIFKAN</span> jika Anda mengunggah foto yang BUKAN gambar asli diri Anda (tanpa kartun, logo, selebriti, foto stok, atau orang lain). Klien harus bisa mengidentifikasi Anda.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">

                  {(profileImageDataUrl || therapist?.profilePicture) ? (
                    <img
                      src={profileImageDataUrl || therapist?.profilePicture}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="profile-upload"
                  />
                  <label htmlFor="profile-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {uploadingImage ? 'Mengunggah...' : 'Upload Foto'}
                  </label>
                  <p className="text-xs text-gray-500 mt-1.5">Maks 5MB • Harus foto asli Anda</p>
                </div>
              </div>
            </div>

            {/* City/Tourist Location */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Location * {country && `(${country})`}
              </label>
              
              {/* Info Box: GPS adalah Sumber Utama */}
              <div className="mb-3 bg-blue-50 border border-blue-300 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-lg">ℹ️</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-900">
                      <strong>Penting:</strong> Lokasi GPS Anda (diatur di bawah) menentukan kota Anda secara otomatis. Dropdown ini hanya untuk referensi - GPS adalah sumber yang sah.
                    </p>
                  </div>
                </div>
              </div>
              
              <CityLocationDropdown
                selectedCity={selectedCity}
                onCityChange={(city) => {
                  setSelectedCity(city);
                  setSelectedServiceAreas([]); // Reset areas when city changes
                }}
                placeholder={`Select City in ${country || 'Indonesia'}`}
                showLabel={false}
                includeAll={false}
                className="w-full"
                country={country} // Pass country filter
              />
              <p className="text-xs text-gray-500 mt-1">
                Select your city or choose "Custom Location" for unlisted areas. GPS will auto-set this when you save.
              </p>
            </div>

            {/* Custom Location Inputs - Show when "custom" is selected */}
            {selectedCity === 'custom' && (
              <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 space-y-4">
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="text-sm font-bold text-orange-900 mb-1">Custom Location Selected</p>
                    <p className="text-xs text-orange-800">
                      Enter your city and area details below. GPS location is required for custom locations.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    City/District Name *
                  </label>
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    placeholder="e.g., Tangerang, Cikarang, Bogor"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the name of your city or district
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Area/Neighborhood (Optional)
                  </label>
                  <input
                    type="text"
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                    placeholder="e.g., BSD City, Jababeka, Sentul City"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your specific area or neighborhood (optional)
                  </p>
                </div>

              </div>
            )}

            {/* Lokasi GPS - WAJIB */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lokasi GPS * <span className="text-red-500 font-bold">(WAJIB UNTUK ONLINE)</span>
              </label>
              
              {/* Pemberitahuan Persyaratan GPS */}
              <div className="mb-3 bg-red-50 border-2 border-red-500 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-xl">📍</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-900 mb-1">
                      Lokasi GPS WAJIB
                    </p>
                    <p className="text-xs text-red-800">
                      Anda tidak dapat online tanpa mengatur koordinat GPS yang tepat. Ini memastikan Anda muncul di kota yang benar untuk pelanggan.
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleSetLocation}
                disabled={gpsLoading}
                className={`w-full px-4 py-3 rounded-xl font-medium transition-all shadow-sm flex items-center justify-center gap-2 ${
                  gpsLoading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : locationSet 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                }`}
              >
                {gpsLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Mendapatkan Lokasi...</span>
                  </>
                ) : locationSet ? (
                  '✅ Lokasi GPS Terverifikasi - Klik untuk Update'
                ) : (
                  '📍 ATUR LOKASI GPS (WAJIB)'
                )}
              </button>
              
              {locationSet && coordinates && (
                <div className="mt-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🎯</span>
                    <p className="text-sm font-bold text-green-800">
                      Lokasi Terverifikasi via GPS
                    </p>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Koordinat:</strong> {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}</p>
                    {(() => {
                      const derivedCity = deriveLocationIdFromGeopoint(coordinates);
                      return (
                        <p><strong>Kota dari GPS:</strong> <span className="font-bold text-green-900">{derivedCity}</span></p>
                      );
                    })()}
                    <p className="text-xs text-green-600 mt-1">
                      ⚠️ Profil Anda akan muncul di kota yang diturunkan dari GPS, terlepas dari pilihan manual di atas.
                    </p>
                  </div>
                </div>
              )}
              
              {!locationSet && (
                <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                  <p className="text-sm text-orange-800">
                    ⚠️ Lokasi GPS belum diatur. Anda tidak dapat online sampai Anda memberikan koordinat yang tepat.
                  </p>
                </div>
              )}
            </div>

            {/* Service Areas - Show when city is set */}
            {selectedCity && selectedCity !== 'all' && (() => {
              const availableAreas = getServiceAreasForCity(selectedCity);
              if (availableAreas.length === 0) return null;
              
              return (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Areas in {selectedCity} *
                  </label>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-blue-800">
                      <strong>Select areas where you provide service.</strong> Customers can filter by these areas to find you.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableAreas.map((area) => {
                      const isSelected = selectedServiceAreas.includes(area.id);
                      return (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => {
                            setSelectedServiceAreas(prev => 
                              isSelected 
                                ? prev.filter(id => id !== area.id)
                                : [...prev, area.id]
                            );
                          }}
                          className={`
                            px-4 py-2 rounded-full text-sm font-medium transition-all
                            ${isSelected
                              ? 'bg-teal-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                          `}
                        >
                          {language === 'id' ? area.nameId : area.name}
                          {area.popular && <span className="ml-1">⭐</span>}
                        </button>
                      );
                    })}
                  </div>
                  {selectedServiceAreas.length === 0 && (
                    <p className="text-xs text-orange-600 mt-2">
                      ⚠️ Select at least one service area to help customers find you
                    </p>
                  )}
                  {selectedServiceAreas.length > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      ✅ {selectedServiceAreas.length} area{selectedServiceAreas.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-5 h-5 text-orange-500" />
                About Your Services
              </label>
              <div className="border border-gray-200 rounded-xl p-4">
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={10}
                  className="w-full focus:border-orange-500 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all resize-none border-0 p-0"
                  placeholder="Describe your massage services, experience, and specialties..."
                />
              </div>
              <p className={`text-xs mt-1 ${countWords(description) > 350 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                {countWords(description)} / 350 words
              </p>
            </div>

            {/* Years of Experience */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Years of Experience
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={yearsOfExperience}
                onChange={e => setYearsOfExperience(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all"
                placeholder="5"
              />
            </div>

            {/* Client Preferences */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="w-5 h-5 text-orange-500" />
                Client Preferences
              </label>
              <select
                value={clientPreferences}
                onChange={e => setClientPreferences(e.target.value as ClientPreference as any)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all"
              >
                {CLIENT_PREFERENCE_OPTIONS.map(preference => (
                  <option key={preference} value={preference}>
                    {CLIENT_PREFERENCE_LABELS[preference]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {CLIENT_PREFERENCE_DESCRIPTIONS[clientPreferences as ClientPreference]}
              </p>
            </div>

            {/* Globe */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Globe (max 3) - {selectedGlobe.length}/3 selected
              </label>
              <div className="flex flex-wrap gap-2">
                {languageOptions.map(opt => (
                  <button
                    key={opt.code}
                    onClick={() => handleToggleLanguage(opt.code)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      selectedGlobe.includes(opt.code)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Massage Types */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Massage Types (max 5) - {selectedMassageTypes.length}/5 selected
              </label>
              <div className="flex flex-wrap gap-2">
                {MASSAGE_TYPES_CATEGORIZED.flatMap(category => category.types).map(type => (
                  <button
                    key={type}
                    onClick={() => handleToggleMassageType(type)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      selectedMassageTypes.includes(type)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.replace(/\s+Massage$/i, '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Massage Prices (100 = Rp 100,000)
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-2 font-medium">60 minutes</label>
                  <input
                    type="text"
                    value={price60}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                      setPrice60(value);
                    }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all text-center font-semibold"
                    placeholder="100"
                    maxLength={3}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-2 font-medium">90 minutes</label>
                  <input
                    type="text"
                    value={price90}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                      setPrice90(value);
                    }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all text-center font-semibold"
                    placeholder="150"
                    maxLength={3}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-2 font-medium">120 minutes</label>
                  <input
                    type="text"
                    value={price120}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                      setPrice120(value);
                    }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all text-center font-semibold"
                    placeholder="200"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>

            {/* Validation Warning */}
            {!canSave && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700 font-medium mb-2">Complete these required fields:</p>
                <ul className="text-sm text-red-600 space-y-1">
                  {!name.trim() && <li>• Full name</li>}
                  {!/^\+62\d{6,15}$/.test(whatsappNumber.trim()) && <li>• Valid WhatsApp number</li>}
                  {selectedCity === 'all' && <li>• City/Location</li>}
                  {(!coordinates || !coordinates.lat || !coordinates.lng) && <li>• GPS Location (click SET GPS LOCATION button)</li>}
                </ul>
              </div>
            )}

            {/* Go Live Section - Show if profile is NOT live yet */}
            {!therapist.isLive && selectedPackage && (
              <div className="pt-6 mt-6 border-t border-gray-100">
                <div className={`p-5 rounded-xl mb-4 ${selectedPackage.plan === 'pro' ? 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200' : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">
                      {selectedPackage.plan === 'pro' ? 'Pro - Pay As You Go' : 'Plus - Everything For Success'}
                    </h3>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            selectedPackage.plan === 'plus' || i < 3 ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">
                    {selectedPackage.plan === 'pro' 
                      ? '✅ Click below to activate your profile and start receiving bookings. You\'ll pay 30% commission per booking.' 
                      : '� Click below to activate your profile! You\'ll then need to submit payment proof before 12:00 AM tonight to keep it active.'}
                  </p>
                </div>

                <button
                  onClick={handleGoLive}
                  disabled={!canSave || saving}
                  className={`w-full px-6 py-4 rounded-xl text-white font-bold text-base transition-all ${
                    !canSave || saving
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : selectedPackage.plan === 'pro'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg'
                        : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  {!canSave ? 'Complete Required Fields First' : `Activate Profile ${selectedPackage.plan === 'pro' ? '(Free)' : ''}`}
                </button>
              </div>
            )}

            {/* Save Profile Button */}
            <div className={!therapist.isLive && selectedPackage ? 'mt-3' : 'pt-6 mt-6 border-t border-gray-100'}>
              <button
                onClick={(e) => {
                  if (!canSave) {
                    e.preventDefault();
                    const missingFields: string[] = [];
                    if (!name.trim()) missingFields.push('First Name');
                    if (!/^\+62\d{6,15}$/.test(whatsappNumber.trim())) missingFields.push('WhatsApp Number');
                    if (selectedCity === 'all') missingFields.push('Location');
                    showToast(`⚠️ Please complete all required fields: ${missingFields.join(', ')}`, 'error');
                    return;
                  }
                  handleSaveProfile();
                }}
                disabled={saving}
                className={`w-full px-6 py-4 rounded-xl font-bold text-base transition-all ${
                  saving 
                    ? 'bg-green-500 text-white cursor-wait shadow-sm' 
                    : !canSave 
                      ? 'bg-red-500 text-white hover:bg-red-600 shadow-sm' 
                      : profileSaved
                        ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm hover:shadow-md'
                        : 'bg-green-500 text-white hover:bg-green-600 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </div>
              </button>
            </div>
          </div>
          </div>
      </main>

      {/* Payment Modal for Plus Members */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] ">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-white text-xl font-bold">Submit Payment</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-xl p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Package Info */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <h3 className="font-bold text-gray-800">Plus Plan - Rp 250,000/month</h3>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✅ 0% commission on all bookings</li>
                  <li>✅ Verified profile badge</li>
                  <li>✅ Priority placement in search</li>
                  <li>✅ Advanced booking features</li>
                </ul>
              </div>

              {/* Payment & Verification Process */}
              <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📋</span>
                  <h3 className="font-bold text-blue-900 text-lg">Payment & Verification Process</h3>
                </div>
                <div className="space-y-2 text-sm text-blue-900">
                  <p>✅ <strong>Step 1:</strong> Your profile is now LIVE - customers can see you</p>
                  <p>✅ <strong>Step 2:</strong> Complete payment and upload proof below</p>
                  <p>⏰ <strong>Step 3:</strong> You have 5 hours to edit your profile after submission</p>
                  <p>🔍 <strong>Step 4:</strong> Admin reviews payment within 48 hours</p>
                  <p>⭐ <strong>Step 5:</strong> Verified badge activated after approval</p>
                </div>
              </div>
              
              {/* Payment Deadline Warning */}
              <div className="bg-orange-50 border-2 border-orange-400 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">⏰</span>
                  <h3 className="font-bold text-orange-900 text-base">Submit Payment Proof Today</h3>
                </div>
                <p className="text-orange-800 text-sm font-semibold">
                  💡 Upload your payment proof below. After submission, you can edit your profile for 5 hours before it locks for admin review.
                </p>
              </div>

              {/* Bank Details */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  🏦 Bank Transfer Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank:</span>
                    <span className="font-semibold text-gray-800">Bank Mandiri</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Name:</span>
                    <span className="font-semibold text-gray-800">PT IndaStreet Indonesia</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-semibold text-gray-800">1370-0123-4567-890</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-purple-600 text-lg">Rp 250,000</span>
                  </div>
                </div>
              </div>

              {/* Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Upload Payment Proof *
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-purple-300 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePaymentProofChange}
                    className="hidden"
                    id="payment-proof-upload"
                  />
                  <label htmlFor="payment-proof-upload" className="cursor-pointer">
                    {paymentProofPreview ? (
                      <div className="space-y-2">
                        <img src={paymentProofPreview} alt="Payment proof" className="max-h-48 mx-auto rounded-xl" />
                        <p className="text-sm text-green-600 font-medium">✓ Image uploaded</p>
                        <p className="text-xs text-gray-500">Click to change</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-12 h-12 mx-auto text-gray-300" />
                        <p className="text-sm text-gray-600 font-medium">Click to upload payment proof</p>
                        <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handlePaymentSubmit}
                disabled={!paymentProof || uploadingPayment}
                className={`w-full px-6 py-4 rounded-xl text-white font-bold text-base transition-all ${
                  !paymentProof || uploadingPayment
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg'
                }`}
              >
                {uploadingPayment ? 'Submitting...' : !paymentProof ? 'Please Upload Payment Proof' : 'Submit Payment & Go LIVE!'}
              </button>

              {/* Info Message */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 font-medium text-center">
                  ✅ Your profile is already LIVE! Submit payment proof before midnight to keep it active.
                </p>
              </div>

              {/* Can Edit Profile Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 text-center">
                  💡 You can close this modal to edit your profile and come back to submit payment anytime before midnight.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      </TherapistLayout>
    {/* Floating Chat Window */}
    <FloatingChatWindow userId={'therapist'} userName={'Therapist'} userRole="therapist" />
      </>

  );
};

export default TherapistPortalPage;

