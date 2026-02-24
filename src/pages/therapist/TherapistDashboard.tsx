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
import { extractLocationId, normalizeLocationForSave, assertValidLocationData } from '../../utils/locationNormalizationV2';
import { getServiceAreasForCity } from '../../constants/serviceAreas';
import { useCityContext } from '../../context/CityContext';
import { ALL_INDONESIAN_CITIES } from '../../data/indonesianCities';
import { getCitiesForCountry } from '../../data/citiesByCountry';
import { locations } from '../../../locations';
import { logger } from '../../utils/logger';
import BookingRequestCard from '../../components/therapist/BookingRequestCard';
import ProPlanWarnings from '../../components/therapist/ProPlanWarnings';
import TherapistSimplePageLayout from '../../components/therapist/TherapistSimplePageLayout';
import { Star, Upload, X, CheckCircle, Square, Users, Save, DollarSign, Globe, Hand, User, MessageCircle, Image, MapPin, FileText, Calendar, Clock } from 'lucide-react';
import TherapistDocumentsSection, { type DocumentItem } from '../../components/therapist/TherapistDocumentsSection';
import HelpTooltip from '../../components/therapist/HelpTooltip';
import OtherServicesOfferedSection, { parseSelectedIds as parseOtherServicesIds } from '../../components/therapist/OtherServicesOfferedSection';
import { profileEditHelp } from './constants/helpContent';
import { client, databases, DATABASE_ID } from '../../lib/appwrite';
import { APPWRITE_CONFIG } from '../../lib/appwrite.config';
import { bookingSoundService } from '../../services/bookingSound.service';
import { WHATSAPP_COUNTRY_PREFIXES, getWhatsAppPrefixForCountry, normalizeWhatsAppToDigits } from '../../config/whatsappCountryPrefix';

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
  const [showMenuSuggestionModal, setShowMenuSuggestionModal] = useState(false); // After save: suggest updating menu for conversion

  // Form state
  const [name, setName] = useState(therapist?.name || '');
  const [description, setDescription] = useState(therapist?.description || '');
  const [whatsappNumber, setWhatsappNumber] = useState(therapist?.whatsappNumber || '+62');
  const [whatsappCountryCode, setWhatsappCountryCode] = useState<string>(() => {
    const raw = therapist?.whatsappNumber || '';
    for (const [code, { dial }] of Object.entries(WHATSAPP_COUNTRY_PREFIXES)) {
      if (raw.startsWith(dial)) return code;
    }
    return 'ID';
  });
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
  const [selectedOtherServicesOffered, setSelectedOtherServicesOffered] = useState<string[]>(() =>
    parseOtherServicesIds((therapist as any)?.otherServicesOffered)
  );
  const [profileImageDataUrl, setProfileImageDataUrl] = useState<string | null>(null);
  
  // Get country from context (selected on landing page) – dashboard city list is per country
  const { country, countryCode } = useCityContext();
  const citiesForDropdown = getCitiesForCountry(countryCode || 'ID');
  
  // Profile lock removed: therapists can always edit name, profile image, phone, and description.
  const isProfileLocked = false;
  
  // Location: city dropdown only (no GPS). Matches app landing dropdown and filter (per country).
  const [selectedCityId, setSelectedCityId] = useState<string>(() => {
    const raw = therapist?.locationId || therapist?.city || therapist?.location || '';
    return (typeof raw === 'string' ? raw : '').trim().toLowerCase();
  });
  const [locationJustUpdated, setLocationJustUpdated] = useState(false);

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

  // Achievements & Insurance documents (licenses, certs, insurance)
  const parseDocList = (raw: any): DocumentItem[] => {
    try {
      if (Array.isArray(raw)) return raw.filter((x: any) => x && typeof x.url === 'string');
      if (typeof raw === 'string' && raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((x: any) => x && typeof x.url === 'string') : [];
      }
    } catch (e) { logger.warn('Parse doc list failed', e); }
    return [];
  };
  const [achievementsDocuments, setAchievementsDocuments] = useState<DocumentItem[]>(() =>
    parseDocList((therapist as any)?.achievementsDocuments)
  );
  const [insuranceDocuments, setInsuranceDocuments] = useState<DocumentItem[]>(() =>
    parseDocList((therapist as any)?.insuranceDocuments)
  );

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

    const therapistId = String((therapist as any).$id ?? (therapist as any).appwriteId ?? therapist.id);
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
            showToast(`🔔 Booking baru dari ${booking.customerName || 'Pelanggan'}`, 'success');
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

              // Stop event is global for current therapist view (all cards stop sound)
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
  // Auto-refresh: on mount and when user returns to this tab so they always see latest changes
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
        if (latestData.whatsappNumber) {
          setWhatsappNumber(latestData.whatsappNumber);
          const raw = String(latestData.whatsappNumber);
          for (const [code, { dial }] of Object.entries(WHATSAPP_COUNTRY_PREFIXES)) {
            if (raw.startsWith(dial)) { setWhatsappCountryCode(code); break; }
          }
        }
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

        // Other Services Offered
        if ((latestData as any).otherServicesOffered != null) {
          setSelectedOtherServicesOffered(parseOtherServicesIds((latestData as any).otherServicesOffered));
        }
        
        // Handle city (location from dropdown; no GPS)
        const cityRaw = latestData.locationId || latestData.city || latestData.location || '';
        const cityStr = (typeof cityRaw === 'string' ? cityRaw : '').trim().toLowerCase();
        setSelectedCityId(cityStr || '');

        // Achievements & Insurance documents
        if ((latestData as any).achievementsDocuments) setAchievementsDocuments(parseDocList((latestData as any).achievementsDocuments));
        if ((latestData as any).insuranceDocuments) setInsuranceDocuments(parseDocList((latestData as any).insuranceDocuments));
        
      } catch (error) {
        logger.error('Failed to load latest therapist data:', error);
      }
    };
    
    loadLatestTherapistData();
  }, [therapist?.$id, therapist?.id]);

  // Auto-refresh when user enters dashboard (e.g. returns to tab) so they see latest changes
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || !therapist?.$id && !therapist?.id) return;
      const therapistId = String(therapist.$id || therapist.id);
      therapistService.getById(therapistId).then((latestData) => {
        if (latestData.name) setName(latestData.name);
        if (latestData.description) setDescription(latestData.description);
        if (latestData.whatsappNumber) {
          setWhatsappNumber(latestData.whatsappNumber);
          const raw = String(latestData.whatsappNumber);
          for (const [code, { dial }] of Object.entries(WHATSAPP_COUNTRY_PREFIXES)) {
            if (raw.startsWith(dial)) { setWhatsappCountryCode(code); break; }
          }
        }
        if (latestData.price60) setPrice60(String(latestData.price60));
        if (latestData.price90) setPrice90(String(latestData.price90));
        if (latestData.price120) setPrice120(String(latestData.price120));
        if (latestData.yearsOfExperience) setYearsOfExperience(String(latestData.yearsOfExperience));
        if (latestData.clientPreferences) setClientPreferences(latestData.clientPreferences);
        if (latestData.profilePicture) setProfileImageDataUrl(latestData.profilePicture);
        const cityRaw = latestData.locationId || latestData.city || latestData.location || '';
        const cityStr = (typeof cityRaw === 'string' ? cityRaw : '').trim().toLowerCase();
        setSelectedCityId(cityStr || '');
      }).catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
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
  }, [name, whatsappNumber, description, selectedMassageTypes, selectedGlobe, selectedCityId, price60, price90, price120, yearsOfExperience, clientPreferences, achievementsDocuments, insuranceDocuments]);

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
      // REQUIRED FIELDS VALIDATION (including Traditional Massage 3 prices – profile cannot save without them)
      const missingFields: string[] = [];
      if (!name.trim()) missingFields.push('Name');
      const waDigits = normalizeWhatsAppToDigits(whatsappNumber);
      if (!whatsappNumber.trim() || waDigits.length < 10) missingFields.push('WhatsApp Number');
      if (!selectedCityId?.trim()) missingFields.push('Service city (select your city from dropdown)');
      const minP = 100;
      const pp60 = parseInt(price60, 10);
      const pp90 = parseInt(price90, 10);
      const pp120 = parseInt(price120, 10);
      if (!price60.trim() || !price90.trim() || !price120.trim() || isNaN(pp60) || pp60 < minP || isNaN(pp90) || pp90 < minP || isNaN(pp120) || pp120 < minP) {
        missingFields.push('Traditional Massage 3 prices (60/90/120 min, min 100 each)');
      }
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
      
      // Normalize WhatsApp: full number with country prefix (e.g. +62812345678 or +447911123456)
      const dial = WHATSAPP_COUNTRY_PREFIXES[whatsappCountryCode]?.dial || '+62';
      const prefixDigits = dial.replace(/\D/g, '');
      const digits = normalizeWhatsAppToDigits(whatsappNumber);
      const localPart = digits.startsWith(prefixDigits) ? digits.slice(prefixDigits.length) : digits;
      const normalizedWhatsApp = dial + localPart;
      const fullDigits = normalizeWhatsAppToDigits(normalizedWhatsApp);
      if (fullDigits.length < 10 || fullDigits.length > 15) {
        showToast('Invalid WhatsApp (10–15 digits with country prefix)', 'error');
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

      // Location: city from dropdown (same list as app filter; Indonesia has coordinates for backward compat)
      const derivedLocationId = selectedCityId.trim();
      const cityData = (countryCode === 'ID' ? ALL_INDONESIAN_CITIES.find(c => c.locationId === derivedLocationId) : null) ?? null;
      const geopoint = cityData?.coordinates ? { lat: cityData.coordinates.lat, lng: cityData.coordinates.lng } : undefined;
      logger.debug('🏷️ City from dropdown', { derivedLocationId, hasGeopoint: !!geopoint });

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

      const existingLocationId = therapist?.locationId || therapist?.city || therapist?.location || derivedLocationId;
      
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
        otherServicesOffered: JSON.stringify(selectedOtherServicesOffered),
        serviceAreas: JSON.stringify(selectedServiceAreas),
        country: country || 'Indonesia', // Save country from context
        
        // Location: city from dropdown (same list as app filter)
        city: derivedLocationId,
        locationId: derivedLocationId,
        location: derivedLocationId,
        ...(geopoint && { geopoint, coordinates: JSON.stringify(geopoint) }),
        
        isLive: !!derivedLocationId,
        // Home services: set Available immediately on save so therapist displays right away
        status: 'available',
        availability: 'Available',
        isOnline: true,

        // Achievements & Insurance documents (licenses, certs, insurance)
        achievementsDocuments: JSON.stringify(achievementsDocuments),
        insuranceDocuments: JSON.stringify(insuranceDocuments),
      };
      
      if (profilePictureUrl && !profilePictureUrl.startsWith('data:')) {
        updateData.profilePicture = profilePictureUrl;
      }

      const savedTherapist = await therapistService.update(String(therapist.$id || therapist.id), updateData);
      logger.debug('✅ Profile saved to Appwrite', { savedTherapist });
      
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
      const savedWa = savedTherapist.whatsappNumber || whatsappNumber;
      setWhatsappNumber(savedWa);
      if (savedWa) {
        const raw = String(savedWa);
        for (const [code, { dial }] of Object.entries(WHATSAPP_COUNTRY_PREFIXES)) {
          if (raw.startsWith(dial)) { setWhatsappCountryCode(code); break; }
        }
      }
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
      
      if (derivedLocationId) {
        showToast('✅ Profile saved and LIVE! Visit the main homepage and select your city to see your card.', 'success');
        setLocationJustUpdated(true);
        setTimeout(() => setLocationJustUpdated(false), 6000);
        // Show membership plans after profile goes live (skip/dashboard keeps profile live with admin WhatsApp until upgrade)
        setTimeout(() => onNavigate?.('therapist-membership-plans'), 1500);
      } else {
        showToast('✅ Profile saved. Select a service city to go live.', 'success');
      }
      
      // Suggest updating menu price list for higher customer conversion
      setShowMenuSuggestionModal(true);
      
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

  // Form validation for save button – city and Traditional Massage 3 prices are required
  const MIN_PRICE_VAL = 100;
  const p60Val = parseInt(price60, 10);
  const p90Val = parseInt(price90, 10);
  const p120Val = parseInt(price120, 10);
  const hasValidThreePrices = price60.trim() !== '' && price90.trim() !== '' && price120.trim() !== '' &&
    !isNaN(p60Val) && p60Val >= MIN_PRICE_VAL &&
    !isNaN(p90Val) && p90Val >= MIN_PRICE_VAL &&
    !isNaN(p120Val) && p120Val >= MIN_PRICE_VAL;
  const canSave = name.trim() && 
                  normalizeWhatsAppToDigits(whatsappNumber).length >= 10 && normalizeWhatsAppToDigits(whatsappNumber).length <= 15 && 
                  !!selectedCityId?.trim() &&
                  hasValidThreePrices; // City + Traditional Massage 3 prices MANDATORY

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
      <TherapistSimplePageLayout
        title="Edit Profil"
        subtitle="Unggah foto, informasi pribadi, dan pengaturan profil"
        onBackToStatus={() => onNavigate?.('therapist-status')}
        onNavigate={(page) => onNavigate?.(page)}
        therapist={therapist}
        currentPage="dashboard"
        language={language}
        onLogout={onLogout}
        icon={<User className="w-6 h-6 text-orange-600" />}
      >
      <div
        className="bg-white w-full max-w-full"
        style={{ 
          WebkitOverflowScrolling: 'touch', 
          touchAction: 'pan-y pan-x',
          paddingBottom: 'max(env(safe-area-inset-bottom, 15px), 20px)',
          marginBottom: 0
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                placeholder="Enter your first name"
              />
            </div>

            {/* WhatsApp with country prefix (so tourists can contact from any country) */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                WhatsApp Number * (with country prefix)
              </label>
              <div className="flex gap-2">
                <select
                  value={whatsappCountryCode}
                  onChange={e => {
                    const code = e.target.value;
                    const prevDial = WHATSAPP_COUNTRY_PREFIXES[whatsappCountryCode]?.dial || '+62';
                    const newDial = WHATSAPP_COUNTRY_PREFIXES[code]?.dial || '+62';
                    const allDigits = whatsappNumber.replace(/\D/g, '');
                    const prevPrefix = prevDial.replace(/\D/g, '');
                    const local = allDigits.startsWith(prevPrefix) ? allDigits.slice(prevPrefix.length) : allDigits;
                    setWhatsappCountryCode(code);
                    setWhatsappNumber(newDial + local);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 focus:outline-none min-w-[120px]"
                >
                  {Object.entries(WHATSAPP_COUNTRY_PREFIXES).map(([code, { dial, label }]) => (
                    <option key={code} value={code}>{dial} {label}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={(() => {
                    const dial = WHATSAPP_COUNTRY_PREFIXES[whatsappCountryCode]?.dial || '+62';
                    const prefixDigits = dial.replace(/\D/g, '');
                    const raw = whatsappNumber.replace(/\D/g, '');
                    if (raw.startsWith(prefixDigits)) return raw.slice(prefixDigits.length);
                    return raw || '';
                  })()}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '');
                    const dial = WHATSAPP_COUNTRY_PREFIXES[whatsappCountryCode]?.dial || '+62';
                    setWhatsappNumber(dial + digits);
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 focus:outline-none"
                  placeholder={whatsappCountryCode === 'ID' ? '812345678' : '7911123456'}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Use your country prefix so clients can reach you from anywhere.</p>
            </div>

            {/* Foto Profil */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Foto Profil
              </label>
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
                📍 Service city * {country && `(${country})`}
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Select the city where you provide service. This must match the city list on the main app so customers can find you.
              </p>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">— Pilih kota / Select city —</option>
                {citiesForDropdown.map((c) => (
                  <option key={c.locationId} value={c.locationId}>{c.name}</option>
                ))}
              </select>
              {citiesForDropdown.length === 0 && (
                <p className="text-sm text-amber-700 mt-2">No cities configured for this country. Select your country on the main app first, then return here.</p>
              )}
              {selectedCityId && citiesForDropdown.length > 0 && (
                <p className="text-sm text-green-700 mt-1 font-medium">
                  ✅ You will appear when customers select <span className="uppercase">{selectedCityId}</span>
                </p>
              )}
              {locationJustUpdated && (
                <div className="mt-3 p-3 bg-emerald-100 border-2 border-emerald-500 rounded-xl space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    <p className="text-sm font-bold text-emerald-800">Location updated.</p>
                  </div>
                  <p className="text-xs text-emerald-700 pl-8">
                    Your profile is assigned to this city. Customers will see you when they select this city on the main app.
                  </p>
                </div>
              )}
            </div>

            {/* Service Areas - Show when city is selected */}
            {selectedCityId && (() => {
              const availableAreas = getServiceAreasForCity(selectedCityId);
              if (availableAreas.length === 0) return null;
              
              return (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Areas in {selectedCityId} *
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
              <div className="border rounded-xl p-4 border-gray-200">
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={10}
                  className="w-full focus:outline-none transition-all resize-none border-0 p-0 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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

            {/* Achievements & Insurance – upload licenses, certs, insurance docs */}
            <div>
              <TherapistDocumentsSection
                achievementsDocuments={achievementsDocuments}
                insuranceDocuments={insuranceDocuments}
                onAchievementsChange={setAchievementsDocuments}
                onInsuranceChange={setInsuranceDocuments}
                uploading={uploadingImage}
                language={language}
              />
            </div>

            {/* Massage Types – tidy format by category, easy to select up to 5 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Massage types
                </label>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {selectedMassageTypes.length}/5 selected
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">Choose up to 5 services you offer. Tap to select or deselect.</p>
              <div className="space-y-4">
                {MASSAGE_TYPES_CATEGORIZED.map(({ category, types }) => (
                  <div key={category}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{category}</p>
                    <div className="flex flex-wrap gap-2">
                      {types.map(type => {
                        const selected = selectedMassageTypes.includes(type);
                        const atLimit = selectedMassageTypes.length >= 5 && !selected;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleToggleMassageType(type)}
                            disabled={atLimit}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                              selected
                                ? 'bg-orange-500 text-white border-orange-500'
                                : atLimit
                                  ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                            }`}
                          >
                            {type.replace(/\s+Massage$/i, '')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Services Offered – same UI as Massage City Places; Free 3, Middle 8, Premium unlimited */}
            {therapist && (
              <OtherServicesOfferedSection
                therapist={therapist}
                selectedIds={selectedOtherServicesOffered}
                onChange={setSelectedOtherServicesOffered}
                language={language === 'en' ? 'en' : 'id'}
                onNavigate={onNavigate}
              />
            )}

            {/* Pricing - Traditional Massage is the standard default; these 3 prices appear in the price slider and on profile when lowest */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Traditional Massage – 3 prices (Min 100 = Rp 100,000)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                These prices are shown as &quot;Traditional Massage&quot; in your price slider and on your profile when they are your lowest.
              </p>
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
                  {(normalizeWhatsAppToDigits(whatsappNumber).length < 10 || normalizeWhatsAppToDigits(whatsappNumber).length > 15) && <li>• Valid WhatsApp with country prefix</li>}
                  {!selectedCityId?.trim() && <li>• Service city (select from dropdown above)</li>}
                  {!hasValidThreePrices && <li>• Traditional Massage – 3 prices (60, 90, 120 min, min 100 = Rp 100,000 each)</li>}
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
                    if (normalizeWhatsAppToDigits(whatsappNumber).length < 10 || normalizeWhatsAppToDigits(whatsappNumber).length > 15) missingFields.push('WhatsApp Number');
                    if (!selectedCityId?.trim()) missingFields.push('Service city');
                    if (!hasValidThreePrices) missingFields.push('Traditional Massage 3 prices (60/90/120 min)');
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

      {/* Post-save suggestion: update menu price list for higher conversion */}
      {showMenuSuggestionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowMenuSuggestionModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 border border-gray-100" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Tip for more bookings</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Update your menu item price list so customers see clear options. Complete pricing leads to higher conversion.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowMenuSuggestionModal(false); onNavigateToMenu?.(); }}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors"
              >
                Update menu
              </button>
              <button
                onClick={() => setShowMenuSuggestionModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

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
      </TherapistSimplePageLayout>
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

