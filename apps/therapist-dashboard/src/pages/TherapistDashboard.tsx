import React, { useState, useEffect, useRef } from 'react';
import { MASSAGE_TYPES_CATEGORIZED } from '../../../../constants';
import type { Therapist } from '../../../../types';
import { therapistService, imageUploadService } from '../../../../lib/appwriteService';
import { CLIENT_PREFERENCE_OPTIONS, CLIENT_PREFERENCE_LABELS, CLIENT_PREFERENCE_DESCRIPTIONS, type ClientPreference } from '../../../../utils/clientPreferencesUtils';
import { showToast } from '../../../../utils/showToastPortal';
import { loadGoogleMapsScript } from '../../../../constants/appConstants';
import { getStoredGoogleMapsApiKey } from '../../../../utils/appConfig';
import CityLocationDropdown from '../../../../components/CityLocationDropdown';
import { matchProviderToCity } from '../../../../constants/indonesianCities';
import BookingRequestCard from '../components/BookingRequestCard';
import ProPlanWarnings from '../components/ProPlanWarnings';
import { Star, Upload, X, CheckCircle } from 'lucide-react';

interface TherapistPortalPageProps {
  therapist: Therapist | null;
  onNavigateToStatus?: () => void;
  onNavigateToBookings?: () => void;
  onNavigateToEarnings?: () => void;
  onNavigateToChat?: () => void;
  onNavigateToMembership?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToLegal?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToPayment?: () => void;
  onLogout?: () => void;
  onNavigateHome?: () => void;
  onProfileSaved?: () => void;
}

const TherapistPortalPage: React.FC<TherapistPortalPageProps> = ({
  therapist,
  onNavigateToStatus,
  onNavigateToBookings,
  onNavigateToEarnings,
  onNavigateToPayment,
  onNavigateToChat,
  onNavigateToMembership,
  onNavigateToNotifications,
  onNavigateToLegal,
  onNavigateToCalendar,
  onLogout,
  onNavigateHome,
  onProfileSaved
}) => {
  console.log('🎨 TherapistPortalPage rendering with therapist:', therapist);
  
  const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);

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
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    // Try to get city from existing therapist data or auto-detect from coordinates
    if (therapist?.city) return therapist.city;
    
    try {
      const coords = therapist?.coordinates;
      if (coords) {
        const parsed = typeof coords === 'string' ? JSON.parse(coords) : coords;
        if (parsed?.lat && parsed?.lng) {
          const matchedCity = matchProviderToCity({ lat: parsed.lat, lng: parsed.lng }, 25);
          return matchedCity?.name || 'all';
        }
      }
    } catch {}
    
    return 'all';
  });
  
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
    try {
      if (!mapRef.current || !(window as any).google || !(window as any).google.maps || !(window as any).google.maps.Map) {
        console.warn('⚠️ Google Maps API not fully loaded yet');
        return;
      }

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
    } catch (error) {
      console.error('❌ Error initializing map:', error);
      // Don't throw - allow page to continue loading
    }
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
    console.log('🚀 handleSaveProfile called');
    if (!therapist) {
      console.error('❌ No therapist data found');
      showToast('❌ Error: Therapist data not loaded', 'error');
      return;
    }
    console.log('📝 Starting save with therapist:', therapist.$id || therapist.id);
    setSaving(true);
    
    try {
      // Validation
      const missingFields: string[] = [];
      if (!name.trim()) missingFields.push('Name');
      if (!whatsappNumber.trim() || whatsappNumber.trim() === '+62') missingFields.push('WhatsApp Number');
      if (selectedCity === 'all') missingFields.push('City/Location selection');
      
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
        clientPreferences: clientPreferences,
        whatsappNumber: normalizedWhatsApp,
        massageTypes: JSON.stringify(selectedMassageTypes.slice(0, 5)),
        coordinates: JSON.stringify(coordinates),
        city: selectedCity !== 'all' ? selectedCity : null,
        isLive: true, // Auto-live on save
        // 🎯 NEW: Set default status fields for new profiles
        status: therapist.status || 'Available', // Default to Available if no status set
        availability: therapist.availability || 'Available', // Ensure consistency
        isOnline: true, // Set as online when profile is saved
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
        const { adminTranslationService } = await import('../../../../lib/translationService');
        
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
      
      console.log('🎉 About to show success toast...');
      showToast('✅ Profile saved and LIVE!', 'success');
      console.log('✅ Toast dispatched - Profile saved successfully');
      console.log('✅ Check HomePage for your therapist card!');
      
      // Call onProfileSaved callback if provided (for onboarding flow)
      // Otherwise fall back to onNavigateToStatus
      const navigationCallback = onProfileSaved || onNavigateToStatus;
      if (navigationCallback) {
        setTimeout(() => {
          console.log('🔄 Navigating after profile save...');
          navigationCallback();
        }, 1500); // Short delay to let user see the success message
      }
    } catch (e: any) {
      console.error('❌ Failed to save profile:', e);
      const errorMessage = e?.message || e?.toString() || 'Failed to save profile';
      showToast(`❌ Error: ${errorMessage}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const canSave = name.trim() && /^\+62\d{6,15}$/.test(whatsappNumber.trim()) && selectedCity !== 'all';

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
      // Plus members: Activate profile FIRST, then show payment modal
      await handlePlusActivation();
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

      showToast('✅ Your profile is now LIVE! You\'ll earn 30% commission on bookings.', 'success');
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
  const handlePlusActivation = async () => {
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

      // Profile is already LIVE from handlePlusActivation
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
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Upload Your Profile
                {therapist?.membershipTier === 'premium' && therapist?.verifiedBadge && (
                  <img 
                    src="https://ik.imagekit.io/7grri5v7d/indastreet_verfied-removebg-preview.png?updatedAt=1764750953473"
                    alt="Verified"
                    className="w-6 h-6"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                  />
                )}
              </h1>
              <p className="text-xs text-gray-500">Complete all fields to publish</p>
            </div>
          </div>
          {/* TEST: Membership Page Button */}
          <button 
            onClick={onNavigateToMembership}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors shadow-md"
          >
            👑 View Membership
          </button>
          
          {/* Payment Pending Button - Show when payment not submitted yet */}
          {paymentPending && !showPaymentModal && (
            <button 
              onClick={() => setShowPaymentModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-lg animate-pulse"
            >
              ⏰ Submit Payment (Due 12 AM)
            </button>
          )}
        </div>
      </div>

      {/* Payment Pending Banner - Show when payment not submitted */}
      {paymentPending && !showPaymentModal && therapist.isLive && (
        <div className="bg-red-600 text-white px-6 py-3 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">⏰</span>
              <div>
                <p className="font-bold text-lg">Payment Due Tonight at 12:00 AM</p>
                <p className="text-sm text-red-100">Your profile is LIVE but payment proof required to keep it active</p>
              </div>
            </div>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-6 py-3 bg-white text-red-600 rounded-lg font-bold hover:bg-red-50 transition-colors shadow-lg"
            >
              Submit Payment Now →
            </button>
          </div>
        </div>
      )}

      {/* Upload Form Card */}
      <main className="flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-2xl space-y-6">
          
          {/* Booking Request Cards - Always visible at top */}
          {therapist?.$id && (
            <BookingRequestCard 
              therapistId={therapist.$id}
              membershipTier={therapist.membershipTier === 'plus' ? 'plus' : 'free'}
            />
          )}

          {/* Pro Plan Warnings - Show for free tier members */}
          {therapist?.membershipTier === 'free' && (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-red-500 overflow-hidden">
              <ProPlanWarnings 
                therapistName={therapist?.name || therapist?.fullName || 'Member'}
                showFullTerms={false}
              />
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
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
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 font-medium pointer-events-none">
                  +62
                </span>
                <input
                  type="tel"
                  value={whatsappNumber.replace(/^\+62/, '')}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setWhatsappNumber('+62' + digits);
                  }}
                  className="w-full border-2 border-gray-300 rounded-lg pl-14 pr-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                  placeholder="812345678"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter your WhatsApp number (numbers only after +62)</p>
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
                  <div className="relative inline-block">
                    {/* Verified Badge on Profile Picture */}
                    {therapist?.membershipTier === 'premium' && therapist?.verifiedBadge && (profileImageDataUrl || therapist?.profilePicture) && (
                      <div className="absolute -top-2 -left-2 z-10 w-10 h-10">
                        <img 
                          src="https://ik.imagekit.io/7grri5v7d/indastreet_verfied-removebg-preview.png?updatedAt=1764750953473"
                          alt="Verified"
                          className="w-full h-full object-contain drop-shadow-lg"
                          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                        />
                      </div>
                    )}
                    {(profileImageDataUrl || therapist?.profilePicture) ? (
                      <img
                        src={profileImageDataUrl || therapist?.profilePicture}
                        alt="Preview"
                        className="w-28 h-28 rounded-full object-cover border-4 border-orange-200"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-4xl">📷</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-orange-600 font-medium mt-2">{uploadingImage ? 'Uploading...' : 'Click to upload'}</p>
                  <p className="text-xs text-gray-500">Max 5MB</p>
                </label>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">📍 Location (optional)</label>
              <button
                onClick={handleSetLocation}
                className="w-full px-4 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 font-semibold shadow-md hover:shadow-lg transition-all"
              >
                {locationSet ? '✅ Location Set - Click to Update' : '📍 Set My Location (optional)'}
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

            {/* City/Tourist Location */}
            <div>
              <CityLocationDropdown
                selectedCity={selectedCity}
                onCityChange={setSelectedCity}
                placeholder="Select Your City/Location"
                label="🏙️ City / Tourist Location *"
                showLabel={true}
                includeAll={false}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Select the city or tourist area where you provide services. This helps customers find you easily.
              </p>
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

            {/* Client Preferences */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">👥 Client Preferences</label>
              <select
                value={clientPreferences}
                onChange={e => setClientPreferences(e.target.value as ClientPreference)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">💰 Pricing (IDR in thousands, e.g., 100 = Rp 100,000)</label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1 font-medium">60 min (IDR '000)</label>
                  <input
                    value={price60}
                    onChange={e => setPrice60(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:outline-none transition-colors text-center font-semibold"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1 font-medium">90 min (IDR '000)</label>
                  <input
                    value={price90}
                    onChange={e => setPrice90(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:outline-none transition-colors text-center font-semibold"
                    placeholder="150"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1 font-medium">120 min (IDR '000)</label>
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
                <li style={{ display: selectedCity === 'all' ? 'list-item' : 'none' }}>City/Location must be selected</li>
              </ul>
            </div>

            {/* Go Live Section - Show if profile is NOT live yet */}
            {!therapist.isLive && selectedPackage && (
              <div className="pt-4 border-t-2 border-gray-200">
                <div className={`p-4 rounded-xl mb-4 ${selectedPackage.plan === 'pro' ? 'bg-orange-50 border-2 border-orange-200' : 'bg-purple-50 border-2 border-purple-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedPackage.plan === 'pro' ? '🎯' : '👑'} 
                    <h3 className="font-bold text-gray-800">
                      {selectedPackage.plan === 'pro' ? 'Pro Plan (30% Commission)' : 'Plus Plan (Rp 250K/month)'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          selectedPackage.plan === 'plus' || i < 3 ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'
                        }`}
                      />
                    ))}
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
                  className={`w-full px-6 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform ${
                    !canSave || saving
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : selectedPackage.plan === 'pro'
                        ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 hover:scale-[1.02] hover:shadow-xl'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:scale-[1.02] hover:shadow-xl'
                  }`}
                >
                  {!canSave ? (
                    <span className="flex items-center justify-center gap-2">
                      ⚠️ Complete Required Fields First
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      🚀 Activate Profile {selectedPackage.plan === 'pro' ? '(Free)' : '& See Payment Details'}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Publish Button - Only show when profile is already live (for updates) */}
            {therapist.isLive && (
              <div className="pt-4">
                <button
                  onClick={(e) => {
                    if (!canSave) {
                      e.preventDefault();
                      const missingFields: string[] = [];
                      if (!name.trim()) missingFields.push('Name');
                      if (!/^\+62\d{6,15}$/.test(whatsappNumber.trim())) missingFields.push('WhatsApp Number');
                      if (selectedCity === 'all') missingFields.push('City/Location');
                      showToast(`❌ Please complete: ${missingFields.join(', ')}`, 'error');
                      return;
                    }
                    handleSaveProfile();
                  }}
                  disabled={saving}
                  className={`w-full px-6 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform ${
                    saving 
                      ? 'bg-gray-400 cursor-wait' 
                      : !canSave 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 cursor-pointer animate-pulse' 
                        : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 hover:scale-[1.02] hover:shadow-xl'
                  }`}
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Updating...
                    </span>
                  ) : !canSave ? (
                    <span className="flex items-center justify-center gap-2">
                      ⚠️ Complete Required Fields
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      💾 Update Profile
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
          </div>
        </div>
      </main>

      {/* Payment Modal for Plus Members */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-white" />
                  <h2 className="text-white text-lg font-bold">Submit Payment & Go Live</h2>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors"
                  title="Close modal (you can edit profile and come back)"
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
                  <li>✅ Premium profile badge</li>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📸 Upload Payment Proof *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
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
                        <img src={paymentProofPreview} alt="Payment proof" className="max-h-48 mx-auto rounded-lg" />
                        <p className="text-sm text-green-600 font-semibold">✅ Image uploaded</p>
                        <p className="text-xs text-gray-500">Click to change</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-12 h-12 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload payment proof</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handlePaymentSubmit}
                disabled={!paymentProof || uploadingPayment}
                className={`w-full px-6 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all ${
                  !paymentProof || uploadingPayment
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl'
                }`}
              >
                {uploadingPayment ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Submitting...
                  </span>
                ) : !paymentProof ? (
                  '⚠️ Please Upload Payment Proof'
                ) : (
                  '🚀 Submit Payment & Go LIVE!'
                )}
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
  );
};

export default TherapistPortalPage;
