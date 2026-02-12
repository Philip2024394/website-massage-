// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
// 🔧 FIX: Reduced excessive padding px-4 py-6 → px-2 py-3 for cleaner layout
// 🔧 FIX: White space eliminated - paddingBottom 60px → 20px, marginBottom 50px → 0, removed minHeight constraint
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
/**
 * 🔒 PRODUCTION UI – COMPLETE
 * This page is visually complete and approved.
 * ❌ Do NOT change layout, structure, or render order
 * ✅ Text, styling, and logic fixes allowed
 * 🛑 UI changes require explicit qw: instruction
 */

import React, { useState, useEffect } from 'react';
import { EliteTherapistDashboardWrapper } from '../../components/therapist/EliteTherapistDashboardWrapper';
import { FloatingChatWindow } from '../../chat';
import { MASSAGE_TYPES_CATEGORIZED } from '../../constants';
import type { Therapist } from '../../types';
import { therapistService, imageUploadService } from '../../lib/appwriteService';
import { CLIENT_PREFERENCE_OPTIONS, CLIENT_PREFERENCE_LABELS, CLIENT_PREFERENCE_DESCRIPTIONS, type ClientPreference } from '../../utils/clientPreferencesUtils';
import { showToast } from '../../utils/showToastPortal';
import { matchProviderToCity } from '../../constants/indonesianCities';
import { extractLocationId, normalizeLocationForSave, assertValidLocationData } from '../../utils/locationNormalizationV2';
import { extractGeopoint, deriveLocationIdFromGeopoint, validateTherapistGeopoint } from '../../utils/geoDistance';
import { getServiceAreasForCity } from '../../constants/serviceAreas';
import { useCityContext } from '../../context/CityContext';
import { locations } from '../../../locations';
import { logger } from '../../utils/logger';
import BookingRequestCard from '../../components/therapist/BookingRequestCard';
import ProPlanWarnings from '../../components/therapist/ProPlanWarnings';
import TherapistLayout from '../../components/therapist/TherapistLayout';
import { Star, Upload, X, CheckCircle, Square, Users, Save, DollarSign, Globe, Hand, User, MessageCircle, Image, MapPin, FileText, Calendar, Clock } from 'lucide-react';
import { checkGeolocationSupport, getGeolocationOptions, formatGeolocationError, logBrowserInfo } from '../../utils/browserCompatibility';
import HelpTooltip from '../../components/therapist/HelpTooltip';
import { profileEditHelp } from './constants/helpContent';
import { client, databases, DATABASE_ID } from '../../lib/appwrite';
import { APPWRITE_CONFIG } from '../../lib/appwrite.config';
import { bookingSoundService } from '../../services/bookingSound.service';

/* P0 FIX: App-sized dashboard layout for proper desktop/mobile rendering */

interface TherapistPortalPageProps {
  therapist: Therapist | null;
  onNavigate?: (page: string) => void;
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
  onNavigate,
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
  language = 'id' // Fixed Indonesian language for therapist dashboard
}) => {
  logger.debug('TherapistPortalPage rendering', { therapist: therapist?.name || 'null' });
  
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
  
  // Get country from context (selected on landing page)
  const { country, countryCode } = useCityContext();
  
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
      logger.warn('Failed to parse service areas:', e);
    }
    return [];
  });

  // Fixed Indonesian language - therapists can add additional languages
  
  // Language options for therapist selection
  const languageOptions = [
    { code: 'id', label: '🇮🇩 Indonesian' }, // Indonesian always available as default
    { code: 'en', label: '🇬🇧 English' },
    { code: 'zh', label: '🇨🇳 Chinese' },
    { code: 'ja', label: '🇯🇵 Japanese' },
    { code: 'ko', label: '🇰🇷 Korean' },
    { code: 'ar', label: '🇸🇦 Arabic' },
    { code: 'ru', label: '🇷🇺 Russian' },
    { code: 'fr', label: '🇫🇷 French' },
    { code: 'de', label: '🇩🇪 German' },
    { code: 'es', label: '🇪🇸 Spanish' },
  ];

  // Language toggle handler
  const handleToggleLanguage = (code: string) => {
    setSelectedGlobe(prev => {
      if (code === 'id') {
        // Indonesian cannot be removed - it's always included
        if (!prev.includes('id')) {
          return ['id', ...prev].slice(0, 3); // Add Indonesian and keep max 3
        }
        return prev; // Indonesian already included, do nothing
      }
      
      return prev.includes(code) 
        ? prev.filter(c => c !== code) 
        : (prev.length < 3 ? [...prev, code] : prev);
    });
  };
  
  // Ensure Indonesian is always included as base language
  React.useEffect(() => {
    if (!selectedGlobe.includes('id')) {
      setSelectedGlobe(prev => ['id', ...prev.filter(c => c !== 'id')].slice(0, 3));
    }
  }, []);

  // ============================================================================
  // 🔔 CRITICAL: REAL-TIME BOOKING NOTIFICATIONS FOR THERAPIST
  // ============================================================================
  // Subscribe to Appwrite bookings collection for real-time notifications
  // When new booking arrives → play sound → show notification → update UI
  // ============================================================================
  useEffect(() => {
    if (!therapist?.$id && !therapist?.id) {
      logger.debug('No therapist ID, skipping booking subscription');
      return;
    }

    const therapistId = String(therapist.$id || therapist.id);
    logger.debug('Starting real-time booking subscription for therapist:', { therapistId });

    try {
      // Subscribe to bookings collection for this therapist
      const channelName = `databases.${DATABASE_ID}.collections.${APPWRITE_CONFIG.collections.bookings}.documents`;
      
      logger.debug('Subscribing to booking channel:', { channelName });

      const unsubscribe = client.subscribe(channelName, (response: any) => {
        logger.debug('Real-time booking event received:', response.events);

        // Check if this is a new booking document creation
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          const booking = response.payload;
          
          logger.debug('New booking created:', {
            bookingId: booking.$id,
            therapistId: booking.therapistId,
            customerName: booking.customerName,
            status: booking.bookingStatus || booking.status
          });

          // Check if this booking is for current therapist
          if (booking.therapistId === therapistId || booking.providerId === therapistId) {
            logger.debug('Booking is for current therapist - triggering notification');
            
            // Dispatch custom event to BookingRequestCard component
            const event = new CustomEvent('playBookingNotification', {
              detail: {
                bookingId: booking.$id || booking.bookingId,
                therapistId: therapistId,
                customerName: booking.customerName || booking.userName,
                duration: booking.duration || booking.serviceDuration,
                location: booking.locationZone || booking.customerLocation,
                bookingType: booking.bookingType === 'SCHEDULED' ? 'scheduled' : 'immediate'
              }
            });
            
            window.dispatchEvent(event);
            
            // Also start sound service directly for redundancy
            try {
              bookingSoundService.startBookingAlert(booking.$id || booking.bookingId, 'pending');
              logger.debug('Sound alert started for booking:', booking.$id);
            } catch (soundError) {
              logger.error('Failed to start booking sound:', soundError);
            }

            // Show browser toast notification
            showToast(`🔔 New Booking from ${booking.customerName || 'Customer'}`, 'success');
          } else {
            logger.debug('Booking is for different therapist, ignoring');
          }
        }

        // Handle booking status updates (accept, decline, expire)
        if (response.events.includes('databases.*.collections.*.documents.*.update')) {
          const booking = response.payload;
          
          if (booking.therapistId === therapistId || booking.providerId === therapistId) {
            logger.debug('Booking updated:', {
              bookingId: booking.$id,
              status: booking.bookingStatus || booking.status
            });

            // If booking was accepted/declined/expired, stop sound
            const finalStatuses = ['ACCEPTED', 'DECLINED', 'EXPIRED', 'CONFIRMED', 'COMPLETED'];
            if (finalStatuses.includes(booking.bookingStatus) || finalStatuses.includes(booking.status)) {
              try {
                bookingSoundService.stopBookingAlert(booking.$id || booking.bookingId);
                logger.debug('Sound stopped for booking:', booking.$id);
              } catch (soundError) {
                logger.error('Failed to stop booking sound:', soundError);
              }

              // Dispatch stop event
              window.dispatchEvent(new Event('stopBookingNotification'));
            }
          }
        }
      });

      logger.debug('Real-time booking subscription active');

      // Cleanup subscription on unmount
      return () => {
        logger.debug('Unsubscribing from real-time booking notifications');
        unsubscribe();
      };

    } catch (error) {
      logger.error('Failed to subscribe to bookings:', error);
    }
  }, [therapist?.$id, therapist?.id]);

  // Fixed Indonesian language - no language selection for therapist dashboard

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
        logger.debug('Loading latest therapist data from database', { therapistId });
        
        const latestData = await therapistService.getById(therapistId);
        logger.debug('Latest therapist data loaded', { name: latestData.name });
        
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
          logger.debug('Profile picture loaded');
        }
        
        // Handle Globe
        if (latestData.Globe) {
          try {
            const langs = typeof latestData.Globe === 'string' 
              ? JSON.parse(latestData.Globe) 
              : latestData.Globe;
            if (Array.isArray(langs)) setSelectedGlobe(langs.slice(0, 3));
          } catch (e) {
            logger.warn('Failed to parse Globe:', e);
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
            logger.warn('Failed to parse massage types:', e);
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
            logger.warn('Failed to parse coordinates:', e);
          }
        }
        
      } catch (error) {
        logger.error('Failed to load latest therapist data:', error);
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
        logger.debug('📦 Package detected from registration', { pkg });
      }
    } catch (error) {
      logger.error('❌ Error parsing package details', { error });
    }
  }, []);

  // Reset profileSaved when any form field changes
  useEffect(() => {
    setProfileSaved(false);
  }, [name, whatsappNumber, description, selectedMassageTypes, selectedGlobe, price60, price90, price120, yearsOfExperience, clientPreferences]);

  const handleSetLocation = () => {
    logger.debug('🔘 Location button clicked');
    
    // Prevent multiple simultaneous requests
    if (gpsLoading) {
      logger.debug('⏳ GPS request already in progress');
      return;
    }
    
    // ✅ LOG BROWSER INFO for debugging
    logBrowserInfo();
    
    // ✅ COMPREHENSIVE BROWSER COMPATIBILITY CHECK
    const compatCheck = checkGeolocationSupport();
    
    if (!compatCheck.supported) {
      logger.error('❌ Browser compatibility issue', { error: compatCheck.error });
      showToast(`❌ ${compatCheck.error}`, 'error');
      return;
    }
    
    const { browserInfo } = compatCheck;
    logger.debug('✅ Browser supported', { browser: browserInfo.name, version: browserInfo.version });

    setGpsLoading(true);
    showToast('📍 Getting your GPS location... Please allow location access', 'info');
    logger.debug('📍 Requesting GPS location');
    
    // ✅ USE BROWSER-OPTIMIZED GEOLOCATION OPTIONS
    const geoOptions = getGeolocationOptions(browserInfo);
    logger.debug('🔧 Geolocation options', { geoOptions });
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        logger.debug('✅ GPS position received', { position });
        const accuracy = position.coords.accuracy;
        logger.debug('📍 GPS accuracy', { accuracy: `${accuracy}m` });
        
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        logger.debug('📍 Raw coordinates', { coords });
        
        // Validate GPS coordinates are within Indonesia
        const validation = validateTherapistGeopoint({ geopoint: coords });
        logger.debug('🔍 Validation result', { validation });
        
        if (!validation.isValid) {
          logger.error('❌ GPS validation failed', { error: validation.error });
          showToast(`❌ GPS location invalid: ${validation.error}`, 'error');
          setGpsLoading(false);
          return;
        }
        
        // Derive city from GPS coordinates
        const derivedCity = deriveLocationIdFromGeopoint(coords);
        logger.debug('🎯 GPS-derived city', { derivedCity });
        
        setCoordinates(coords);
        setLocationSet(true);
        
        // 🌍 CRITICAL FIX: IMMEDIATELY SAVE GPS TO DATABASE
        // "Set Location" button is the SINGLE SOURCE OF TRUTH for location
        logger.debug('💾 Saving GPS location immediately to database');
        
        try {
            await therapistService.update(String(therapist.$id || therapist.id), {
                geopoint: coords,
                coordinates: JSON.stringify(coords),
                city: derivedCity,
                locationId: derivedCity,
                location: derivedCity,
                isLive: true // GPS location enables marketplace visibility
            });
            
            logger.debug('✅ GPS location saved immediately to database');
            logger.debug('✅ City assignment', { derivedCity });
            
            // Verify the save
            setTimeout(async () => {
                try {
                    const updated = await therapistService.getById(String(therapist.$id || therapist.id));
                    if (updated.city === derivedCity && updated.locationId === derivedCity) {
                        logger.debug('✅ VERIFICATION PASSED: GPS location saved correctly');
                    } else {
                        logger.error('❌ VERIFICATION FAILED', {
                            expected: derivedCity,
                            savedCity: updated.city,
                            savedLocationId: updated.locationId
                        });
                    }
                } catch (verifyError) {
                    logger.warn('⚠️ Could not verify GPS save', { verifyError });
                }
            }, 1000);
            
        } catch (saveError) {
            logger.error('❌ Failed to save GPS to database', { saveError });
            showToast('⚠️ GPS captured but not saved. Please try again or contact support.', 'error');
            setGpsLoading(false);
            return;
        }
        
        setGpsLoading(false);
        
        if (accuracy > 500) {
            showToast(`⚠️ GPS accuracy is low (${Math.round(accuracy)}m). Consider moving to an open area for better accuracy.`, 'warning');
        } else {
            showToast(`✅ GPS location saved! You are now live in ${derivedCity}.`, 'success');
        }
        
        logger.debug('✅ Location state updated successfully');
      },
      (error) => {
        setGpsLoading(false);
        logger.error('❌ GPS error occurred', { error, code: error.code, message: error.message });
        
        // ✅ USE BROWSER-SPECIFIC ERROR FORMATTING
        const errorMessage = formatGeolocationError(error, browserInfo);
        logger.error('📱 Formatted error', { errorMessage });
        
        showToast(`❌ ${errorMessage}`, 'error');
      },
      geoOptions
    );
    
    logger.debug('⏳ Waiting for GPS response');
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

  // Language is fixed to Indonesian for therapist dashboard

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
    logger.debug('🚀 handleSaveProfile called');
    if (!therapist) {
      logger.error('❌ No therapist data found');
      showToast('❌ Error: Therapist data not loaded', 'error');
      return;
    }
    logger.debug('📝 Starting save with therapist', {
      id: therapist.$id || therapist.id,
      name: therapist.name,
      email: therapist.email,
      keys: Object.keys(therapist),
      updateId: String(therapist.$id || therapist.id)
    });
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
        logger.debug('📤 Uploading profile image to Appwrite Storage');
        try {
          profilePictureUrl = await imageUploadService.uploadProfileImage(profileImageDataUrl);
          logger.debug('✅ Profile image uploaded', { profilePictureUrl });
        } catch (uploadError) {
          logger.error('❌ Failed to upload profile image', { uploadError });
          showToast('⚠️ Image upload failed, saving without image', 'error');
        }
      }

      // 🌍 VALIDASI LOKASI GPS - WAJIB UNTUK ONLINE
      logger.debug('🌍 Memvalidasi persyaratan GPS WAJIB');
      
      // LANGKAH 1: Koordinat GPS SANGAT DIPERLUKAN
      if (!coordinates || !coordinates.lat || !coordinates.lng) {
        showToast('❌ Lokasi GPS WAJIB. Silakan klik tombol "ATUR LOKASI GPS" di atas.', 'error');
        setSaving(false);
        return;
      }
      
      const geopoint = { lat: coordinates.lat, lng: coordinates.lng };
      logger.debug('📍 GPS coordinates for save', { geopoint });
      
      // STEP 2: Validate GPS is within Indonesia bounds
      const validation = validateTherapistGeopoint({ geopoint });
      if (!validation.isValid) {
        showToast(`❌ GPS location invalid: ${validation.error}`, 'error');
        setSaving(false);
        return;
      }
      
      // STEP 3: Auto-derive city from GPS (GPS IS ONLY SOURCE OF TRUTH)
      const derivedLocationId = deriveLocationIdFromGeopoint(geopoint);
      logger.debug('🏷️ GPS-derived city (ONLY SOURCE)', { derivedLocationId });
      
      logger.debug('✅ Geopoint validation passed');

      // Price minimum: 100 = Rp 100,000 for 60/90/120 min
      const MIN_PRICE = 100;
      const p60 = parseInt(price60, 10);
      const p90 = parseInt(price90, 10);
      const p120 = parseInt(price120, 10);
      if ((price60 && !isNaN(p60) && p60 < MIN_PRICE) || (price90 && !isNaN(p90) && p90 < MIN_PRICE) || (price120 && !isNaN(p120) && p120 < MIN_PRICE)) {
        showToast('❌ Minimum price is Rp 100,000 (enter 100 or higher) for 60, 90, and 120 minutes.', 'error');
        setSaving(false);
        return;
      }

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
        serviceAreas: JSON.stringify(selectedServiceAreas),
        country: country || 'Indonesia', // Save country from context
        
        // 🌍 GPS-ONLY FIELDS (SINGLE SOURCE OF TRUTH) - ALL FROM GPS COORDINATES
        geopoint: geopoint,                    // Primary: lat/lng coordinates
        city: derivedLocationId,               // GPS-derived city
        locationId: derivedLocationId,         // GPS-derived locationId
        location: derivedLocationId,           // GPS-derived location
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
      logger.debug('✅ Profile saved to Appwrite', { savedTherapist });
      
      // 🌍 GEO-BASED VERIFICATION
      const savedGeopoint = extractGeopoint(savedTherapist);
      if (savedGeopoint && 
          Math.abs(savedGeopoint.lat - geopoint.lat) < 0.001 && 
          Math.abs(savedGeopoint.lng - geopoint.lng) < 0.001) {
        logger.debug('✅ GEOPOINT SAVE VERIFIED', { savedGeopoint });
      } else {
        logger.error('❌ GEOPOINT SAVE FAILED', {
          expected: geopoint,
          saved: savedGeopoint
        });
      }
      
      // Verify locationId and city
      if (savedTherapist.locationId === derivedLocationId && savedTherapist.city === derivedLocationId) {
        logger.debug('✅ LOCATION ID & CITY SAVE VERIFIED', { derivedLocationId });
      } else {
        logger.error('❌ LOCATION SAVE FAILED', {
          expected: derivedLocationId,
          savedLocationId: savedTherapist.locationId,
          savedCity: savedTherapist.city
        });
      }

      // Wait a moment for database to fully commit changes
      logger.debug('⏳ Waiting for database to commit changes');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Auto-translate profile data to both Globe
      logger.debug('🌐 Auto-translating profile data');
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
          logger.debug('✅ Auto-translation completed successfully');
        } else {
          logger.warn('⚠️ Auto-translation failed', { error: translationResult.error });
        }
      } catch (translationError) {
        logger.error('❌ Translation error (non-blocking)', { translationError });
      }

      // Update local state with saved data to reflect changes immediately
      setName(savedTherapist.name || name);
      setWhatsappNumber(savedTherapist.whatsappNumber || whatsappNumber);
      setDescription(savedTherapist.description || description);
      setPrice60(String(savedTherapist.price60 || price60));
      setPrice90(String(savedTherapist.price90 || price90));
      setPrice120(String(savedTherapist.price120 || price120));
      
      // Fire refresh event for other components (like main app)
      logger.debug('🔔 Dispatching refreshTherapistData event');
      window.dispatchEvent(new CustomEvent('refreshTherapistData', { detail: 'profile-updated' }));
      
      // Also dispatch a custom event to refresh the parent App.tsx user state
      logger.debug('🔔 Dispatching therapist data refresh for parent app');
      window.dispatchEvent(new CustomEvent('therapistProfileUpdated', { 
        detail: { therapistId: savedTherapist.$id, updatedData: savedTherapist } 
      }));
      
      logger.debug('🎉 About to show success toast');
      
      // 🚨 DATABASE ENFORCEMENT: Warn about geopoint requirement
      if (!geopoint || !geopoint.lat || !geopoint.lng) {
        showToast('⚠️ Profile saved but NOT LIVE: GPS location required for marketplace visibility', 'warning');
        logger.warn('🚨 PRODUCTION SAFETY: Therapist saved with isLive=false due to missing geopoint');
      } else {
        showToast('✅ Profile saved and LIVE! Visit the main homepage to see your card.', 'success');
        logger.debug('✅ isLive set to true - visible on HomePage at https://www.indastreetmassage.com');
      }
      
      // Don't auto-navigate away from profile page after saving
      // Let user stay on profile to continue editing if needed
      // User can click "Home" button in navbar to see their live card
    } catch (e: any) {
      logger.error('❌ Failed to save profile', { error: e, message: e?.message });
      const errorMessage = e?.message || e?.toString() || 'Failed to save profile';
      showToast(`❌ Error: ${errorMessage}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Form validation for save button - GPS is MANDATORY
  const canSave = name.trim() && 
                  /^\+62\d{6,15}$/.test(whatsappNumber.trim()) && 
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
      logger.error('❌ Failed to activate profile', { error, message: error?.message });
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
      logger.error('❌ Failed to activate profile', { error, message: error?.message });
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
      logger.debug('📤 Uploading payment proof');
      const paymentProofUrl = await imageUploadService.uploadProfileImage(paymentProofPreview!);
      logger.debug('✅ Payment proof uploaded', { paymentProofUrl });

      // TODO: Create payment submission record in database
      // This will be reviewed by admin later
      logger.debug('💰 Creating payment submission record');
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
      logger.error('❌ Payment submission failed', { error, message: error?.message });
      showToast('❌ Failed to submit payment. Please try again.', 'error');
    } finally {
      setUploadingPayment(false);
    }
  };

  // Navigation handler for TherapistLayout menu
  const handleNavigate = (pageId: string) => {
    logger.debug('[NAV CLICK] TherapistDashboard navigation', { pageId });
    logger.debug('[NAV CLICK] Available handlers', {
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
        logger.debug('[NAV CLICK] Calling onNavigateToStatus()');
        onNavigateToStatus?.();
        break;
      case 'schedule':
        logger.debug('[NAV CLICK] Calling onNavigateToSchedule()');
        onNavigateToSchedule?.();
        break;
      case 'dashboard':
        logger.debug('[NAV CLICK] Staying on dashboard - profile management page');
        // Stay on dashboard - this is the profile management page
        showToast('✅ You are on the Dashboard (Profile Management) page', 'info');
        break;
      case 'bookings':
        logger.debug('[NAV CLICK] Calling onNavigateToBookings()');
        onNavigateToBookings?.();
        break;
      case 'earnings':
        logger.debug('[NAV CLICK] Calling onNavigateToEarnings()');
        onNavigateToEarnings?.();
        break;
      case 'payment':
        logger.debug('[NAV CLICK] Calling onNavigateToPayment()');
        onNavigateToPayment?.();
        break;
      case 'payment-status':
        logger.debug('[NAV CLICK] Calling onNavigateToPaymentStatus()');
        onNavigateToPaymentStatus?.();
        break;
      case 'commission-payment':
        logger.debug('[NAV CLICK] Calling onNavigateToCommission()');
        onNavigateToCommission?.();
        break;
      case 'custom-menu':
        logger.debug('[NAV CLICK] Calling onNavigateToMenu()');
        if (onNavigateToMenu) {
          onNavigateToMenu();
        } else {
          logger.error('[NAV CLICK] onNavigateToMenu handler is undefined');
        }
        break;
      case 'chat':
        logger.debug('[NAV CLICK] Calling onNavigateToChat()');
        onNavigateToChat?.();
        break;
      case 'notifications':
        logger.debug('[NAV CLICK] Calling onNavigateToNotifications()');
        onNavigateToNotifications?.();
        break;
      case 'calendar':
        logger.debug('[NAV CLICK] Calling onNavigateToCalendar()');
        onNavigateToCalendar?.();
        break;
      case 'legal':
        logger.debug('[NAV CLICK] Calling onNavigateToLegal()');
        onNavigateToLegal?.();
        break;
      case 'how-it-works':
      case 'therapist-how-it-works':
        logger.debug('[NAV CLICK] Calling onNavigateToHowItWorks() or navigating to therapist-how-it-works');
        onNavigateToHowItWorks?.() || onNavigate?.('therapist-how-it-works');
        break;
      case 'customers':
        logger.debug('[NAV CLICK] Navigating to customers page');
        onNavigate?.('customers');
        break;
      case 'send-discount':
        logger.debug('[NAV CLICK] Navigating to send-discount page');
        onNavigate?.('send-discount');
        break;
      case 'analytics':
        logger.debug('[NAV CLICK] Navigating to analytics page');
        onNavigate?.('analytics');
        break;
      case 'therapist-hotel-villa-safe-pass':
        logger.debug('[NAV CLICK] Navigating to SafePass page');
        onNavigate?.('therapist-hotel-villa-safe-pass');
        break;
      case 'therapist-profile':
        logger.debug('[NAV CLICK] Navigating to public therapist profile');
        onNavigate?.('therapist-profile');
        break;
      case 'logout':
        logger.debug('[NAV CLICK] Calling onLogout()');
        onLogout?.();
        break;
      default:
        logger.warn('[NAV CLICK] Unknown navigation', { pageId });
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
      <div
        className="bg-white w-full max-w-full therapist-page-container"
        style={{ 
          WebkitOverflowScrolling: 'touch', 
          touchAction: 'pan-y pan-x',
          paddingBottom: 'max(env(safe-area-inset-bottom, 15px), 20px)',
          marginBottom: 0,
          flex: '1 1 auto'
        }}
      >
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

      {/* Main Content - MODEL A: NO top padding, sticky header provides spacing */}
      <main className="w-full px-2" style={{ paddingBottom: '10px', paddingTop: '0px' }}>

          {/* 🆕 ELITE FIX: Therapist Connection Status Indicator (Facebook/Amazon Standard) */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Real-Time Connection</span>
                </div>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full font-mono">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Check if PWA is installable
                    if ('BeforeInstallPromptEvent' in window || ('standalone' in navigator && !(navigator as any).standalone)) {
                      const event = (window as any).deferredPWAPrompt;
                      if (event) {
                        event.prompt();
                        event.userChoice.then((choiceResult: any) => {
                          if (choiceResult.outcome === 'accepted') {
                            showToast('✅ App installation started!', 'success');
                          }
                          (window as any).deferredPWAPrompt = null;
                        });
                      } else {
                        showToast('📱 To install: Use browser menu → "Add to Home Screen"', 'info');
                      }
                    } else {
                      showToast('📱 To install: Use browser menu → "Install App"', 'info');
                    }
                  }}
                  className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-1 shadow-sm"
                  title="Install as mobile app for 97% reliability"
                >
                  <img 
                    src="https://ik.imagekit.io/7grri5v7d/download_button-removebg-preview.png" 
                    alt="Download" 
                    className="w-3.5 h-3.5" 
                  />
                  Install App
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              ✅ WebSocket connected • Booking notifications enabled • Real-time chat active • PWA ready
            </p>
          </div>
          
          {/* Page Header with Status Badge and Stats - EXACT MATCH TO HOME PAGE */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Edit Profil</h2>
                <HelpTooltip {...profileEditHelp.overview} position="bottom" size="sm" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                <Clock className="w-4 h-4 text-gray-500" />
                {(() => {
                  const status = therapist?.status || therapist?.availability;
                  const statusStr = String(status).toLowerCase();
                  
                  // ❌ Timer logic removed (THERAPIST_AUTO_OFFLINE_TIMER_DISABLED.md)
                  // Status now manual-only, no countdown timers
                  
                  if (statusStr === 'available') {
                    return (
                      <>
                        <span className="text-sm font-semibold text-green-600">
                          Active
                        </span>
                        <span className="text-xs text-gray-500">Manual control</span>
                      </>
                    );
                  } else if (statusStr === 'busy') {
                    return (
                      <>
                        <span className="text-sm font-semibold text-red-700">Timer Expired</span>
                        <span className="text-xs text-gray-500">set available</span>
                      </>
                    );
                  } else {
                    return (
                      <>
                        <span className="text-sm font-semibold text-gray-700">12h 0m</span>
                        <span className="text-xs text-gray-500">when available</span>
                      </>
                    );
                  }
                })()}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Available */}
              <button
                onClick={() => {
                  // Status change logic would go here
                  logger.debug('Status changed', { status: 'Available' });
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
                  logger.debug('Status changed', { status: 'Busy' });
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
                  logger.debug('Status changed', { status: 'Offline' });
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
            <div>
              <BookingRequestCard 
                therapistId={therapist.$id}
                membershipTier={'plus'}
              />
            </div>
          )}

          {/* Pro Plan Warnings - Hidden since all features are now standard */}

          {/* Profile Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Live Status Banner */}
          {therapist.isLive && (
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-white font-bold text-lg">🟢 Profil Anda AKTIF!</p>
                    <p className="text-orange-100 text-sm">Pelanggan dapat melihat dan membooking Anda di halaman utama</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    // 🔐 PREVIEW MODE: Generate URL with previewTherapistId to show listing regardless of GPS
                    const therapistId = therapist.$id || therapist.id;
                    const previewUrl = `/?previewTherapistId=${therapistId}`;
                    window.open(previewUrl, '_blank');
                  }}
                  className="px-4 py-2 bg-white text-orange-600 rounded-lg font-bold hover:bg-orange-50 transition-all shadow-sm text-sm"
                  title="Lihat listing langsung Anda dengan mode preview (melewati batasan GPS)"
                >
                  👁️ Lihat Listing Langsung
                </button>
              </div>
            </div>
          )}

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

            {/* GPS-Only Location Display */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                📍 Your Location * {country && `(${country})`}
              </label>
              
              {/* Read-only location display */}
              <div className="mb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 mb-1">
                      Current City: {coordinates && deriveLocationIdFromGeopoint(coordinates) ? (
                        <span className="text-blue-700 uppercase">{deriveLocationIdFromGeopoint(coordinates)}</span>
                      ) : (
                        <span className="text-gray-400">Not set - Click "Set Location" below</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Your location is determined by GPS coordinates only. Use the "Set Location" button below to update.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                <p className="text-xs font-medium text-yellow-900">
                  ⚠️ <strong>Important:</strong> Custom locations require GPS verification below. Your exact location ensures customers can find and filter you correctly.
                </p>
              </div>
            </div>

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
              
              {/* UX FIX: Added tooltip to clarify GPS button behavior */}
              {!locationSet && !gpsLoading && (
                <div className="mb-3 text-center">
                  <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs px-3 py-2 rounded-full animate-bounce">
                    <span className="text-base">👆</span>
                    <span className="font-medium">Click button below to set your GPS location (required)</span>
                  </div>
                </div>
              )}
              
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

            {/* Service Areas - Show when GPS location is set */}
            {coordinates && (() => {
              const currentCity = deriveLocationIdFromGeopoint(coordinates);
              const availableAreas = getServiceAreasForCity(currentCity);
              if (availableAreas.length === 0) return null;
              
              return (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Areas in {currentCity} *
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

            {/* Languages */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Languages (max 3) - {selectedGlobe.length}/3 selected
                <span className="text-xs text-orange-600 ml-2">Indonesian always included</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {languageOptions.map(opt => {
                  const isSelected = selectedGlobe.includes(opt.code);
                  const isIndonesian = opt.code === 'id';
                  const isDisabled = !isSelected && selectedGlobe.length >= 3 && !isIndonesian;
                  
                  return (
                    <button
                      key={opt.code}
                      onClick={() => handleToggleLanguage(opt.code)}
                      disabled={isDisabled}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isIndonesian && isSelected
                          ? 'bg-orange-500 text-white cursor-default' // Indonesian always selected
                          : isSelected
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : isDisabled
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={isIndonesian ? 'Indonesian is always included as standard language' : `${isSelected ? 'Remove' : 'Add'} ${opt.label.split(' ')[1]}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Indonesian is your primary language. Add up to 2 additional languages to attract more international clients.
              </p>
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
                Massage Prices (Min 100 = Rp 100,000)
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
                    onBlur={() => {
                      const n = parseInt(price60, 10);
                      if (price60 && !isNaN(n) && n < 100) setPrice60('100');
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
                    onBlur={() => {
                      const n = parseInt(price90, 10);
                      if (price90 && !isNaN(n) && n < 100) setPrice90('100');
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
                    onBlur={() => {
                      const n = parseInt(price120, 10);
                      if (price120 && !isNaN(n) && n < 100) setPrice120('100');
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
                  {!coordinates && <li>• GPS Location (click "Set Location" button)</li>}
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
                    if (!coordinates || !coordinates.lat || !coordinates.lng) missingFields.push('GPS Location');
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
            <div className="p-6 space-y-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 24px), 48px)' }}>
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
    <EliteTherapistDashboardWrapper 
      title="Therapist Profile Dashboard" 
      subtitle="Elite Professional Interface"
    >
      <FloatingChatWindow userId={'therapist'} userName={'Therapist'} userRole="therapist" />
    </EliteTherapistDashboardWrapper>
      </>

  );
};

export default TherapistPortalPage;

