/**
 * 🔴 PRODUCTION-CRITICAL — DO NOT MODIFY
 *
 * This file controls the initial app load and landing page.
 * Previously caused full app crashes and blank screens.
 * Current behavior is STABLE and MUST NOT CHANGE.
 *
 * ALLOWED:
 * - Read user location
 * - Allow city selection (slider/manual)
 * - Save selected location to state/storage
 *
 * FORBIDDEN:
 * - Changing render flow
 * - Adding async blocking logic
 * - Adding new effects, polling, or refactors
 * - Adding API or DB calls
 *
 * If this file breaks, the app does not load.
 * Stability > Features > Refactors.
 */

// 🎯 AUTO-FIXED: Mobile scroll architecture violations (6 fixes)
/**
 * 🔒 PRODUCTION UI – COMPLETE
 * This page is visually complete and approved.
 * ❌ Do NOT change layout, structure, or render order
 * ✅ Text, styling, and logic fixes allowed
 * 🛑 UI changes require explicit qw: instruction
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { User, UserLocation, Agent, Place, Therapist, Analytics, UserCoins } from '../types';
// Direct imports to avoid lazy loading issues on home page
import TherapistHomeCard from '../components/TherapistHomeCard';
import MassagePlaceHomeCard from '../components/MassagePlaceHomeCard';
import FacialPlaceHomeCard from '../components/FacialPlaceHomeCard';
import RatingModal from '../components/RatingModal';
// Removed MASSAGE_TYPES_CATEGORIZED import - now using city-based filtering
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import PageContainer from '../components/layout/PageContainer';
import { customLinksService, reviewService, bookingService } from '../lib/appwriteService';
import { AppDrawer } from '../components/AppDrawerClean';
import { Users, Building, Sparkles, X } from 'lucide-react';
import SocialMediaLinks from '../components/SocialMediaLinks';
import HomeIcon from '../components/icons/HomeIcon';
import FlyingButterfly from '../components/FlyingButterfly';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import CityLocationDropdown from '../components/CityLocationDropdown';
import AreaFilter from '../components/AreaFilter';
import PageNumberBadge from '../components/PageNumberBadge';
import { initializeGoogleMaps, loadGoogleMapsScript } from '../lib/appwrite.config';
import MusicPlayer from '../components/MusicPlayer';
import UniversalHeader from '../components/shared/UniversalHeader';
import { FloatingChatWindow } from '../chat';
import { APP_CONFIG } from '../config';
import { getStoredGoogleMapsApiKey } from '../utils/appConfig';
import { matchProviderToCity } from '../constants/indonesianCities';
import { deriveLocationIdFromGeopoint, calculateDistance, extractGeopoint } from '../utils/geoDistance';
import { MOCK_FACIAL_PLACE } from '../constants/mockFacialPlace';
import { matchesLocation } from '../utils/locationNormalization';
import { filterTherapistsByCity } from '../utils/cityFilterUtils';
import { convertLocationStringToId } from '../utils/locationNormalizationV2';
import { applyDisplayStatusToTherapists } from '../utils/therapistDisplayStatus';
import { INDONESIAN_CITIES_CATEGORIZED } from '../constants/indonesianCities';
import PWAInstallBanner from '../components/PWAInstallBanner';
import { useCityContext } from '../context/CityContext';
import { matchTherapistsForUser, type MatchOutcome, type UserLocationContext } from '../utils/therapistMatching';
import { parseMassageTypes } from '../utils/appwriteHelpers';
import { logger } from '../utils/logger';

// No cap: show all profiles per GPS-derived city (synced with therapist/place upload page)
const MAX_THERAPISTS_PER_LOCATION = 99999;
const MAX_PLACES_PER_LOCATION = 99999;

// 🚀 PERFORMANCE: Bulk data fetching to eliminate N+1 queries
import { prefetchTherapistCardData } from '../lib/services/bulkDataService';

// Custom hooks for logic extraction
import { useHomePageState } from '../hooks/useHomePageState';
import { useHomePageLocation } from '../hooks/useHomePageLocation';
import { useHomePageAdmin } from '../hooks/useHomePageAdmin';
import { useHomePageTranslations } from '../hooks/useHomePageTranslations';

// Facebook-style silent location capture
import { getCustomerLocation } from '../lib/nearbyProvidersService';

interface HomePageProps {
    page?: string; // Current page from routing system
    user: User | null;
    loggedInAgent: Agent | null;
    loggedInProvider?: { id: number | string; type: 'therapist' | 'place' } | null; // Add logged in provider
    loggedInCustomer?: any | null; // Add customer login state
    userCoins?: UserCoins | null; // Add user coins
    therapists: any[];
    places: any[];
    facialPlaces: any[];
    hotels: any[];
    userLocation: UserLocation | null;
    selectedCity?: string; // Add optional prop for external control
    readOnly?: boolean; // Lock components to read-only mode
    onSetUserLocation: (location: UserLocation) => void;
    onSelectPlace: (place: Place) => void;
    onSelectTherapist?: (therapist: Therapist) => void; // Add therapist selection
    onBook: (provider: Therapist | Place, type: 'therapist' | 'place') => void;
    onQuickBookWithChat?: (provider: Therapist | Place, type: 'therapist' | 'place') => void;
    onChatWithBusyTherapist?: (therapist: Therapist) => void;
    onShowRegisterPrompt?: () => void; // NEW: Show registration prompt for busy chat
    onIncrementAnalytics: (id: number | string, type: 'therapist' | 'place', metric: keyof Analytics) => void;
    onLogout: () => void;
    onLoginClick: () => void;
    onCreateProfileClick: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void; // Add customer portal callback
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick: () => void;
    onMassagePlacePortalClick: () => void;
    onFacialPortalClick?: () => void;
    onAdminPortalClick: () => void;
    onBrowseJobsClick?: () => void;
    onEmployerJobPostingClick?: () => void;
    onMassageJobsClick?: () => void;
    onTherapistJobsClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    onNavigate?: (page: string) => void;
    onLanguageChange?: (lang: 'en' | 'id') => void;
    isLoading: boolean;
    t: any;
    language?: 'en' | 'id';
    /** When set (e.g. from Massage Types page Find Therapists/Places), home filters and optionally switches tab */
    selectedMassageType?: string;
}



// Icon used in massage type filter
const ChevronDownIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

// Helper: display name for location (locationId -> city name)
const getLocationDisplayName = (locationId: string | null | undefined, allAreasLabel: string): string => {
    if (!locationId || locationId === 'all') return allAreasLabel;
    for (const cat of INDONESIAN_CITIES_CATEGORIZED) {
        const city = cat.cities.find(c => c.locationId === locationId);
        if (city) return city.name;
    }
    return locationId;
};

// Helper function to calculate display rating
const getDisplayRating = (rating: number, reviewCount: number): number => {
    // Return the rating if there are reviews, otherwise return 0
    return reviewCount > 0 ? rating : 0;
};

const HomePage: React.FC<HomePageProps> = ({ 
    page, // Current page from routing system
    user, // Add user for chat system
    loggedInAgent: _loggedInAgent,
    loggedInProvider,
    loggedInCustomer,
    therapists,
    places,
    facialPlaces,
    hotels,
    userLocation,
    selectedCity: propSelectedCity, // Get from prop
    readOnly = false, // Default to editable unless specified
    onSetUserLocation, 
    onSelectPlace,
    onSelectTherapist,
    onBook,
    onQuickBookWithChat,
    onChatWithBusyTherapist,
    onShowRegisterPrompt,
    onIncrementAnalytics, 
    onAgentPortalClick,
    onCustomerPortalClick,
    onHotelPortalClick,
    onVillaPortalClick, 
    onTherapistPortalClick, 
    onMassagePlacePortalClick,
    onFacialPortalClick,
    onAdminPortalClick, 
    onBrowseJobsClick: _onBrowseJobsClick, 
    onEmployerJobPostingClick: _onEmployerJobPostingClick, 
    onMassageJobsClick, 
    onTherapistJobsClick: _onTherapistJobsClick, 
    onTermsClick, 
    onPrivacyClick, 
    onNavigate,
    onLanguageChange, 
    onLoginClick,
    t,
    language,
    selectedMassageType: selectedMassageTypeProp
}) => {
    // Get city from CityContext
    const { city: contextCity, countryCode, country, hasConfirmedCity, confirmedLocation, setCity: setContextCity } = useCityContext();
    const [initializingCityGuard, setInitializingCityGuard] = useState(true);
    
    // 🚨 CRITICAL ROUTE GUARD - HomePage must ONLY render on home page
    // Use the page prop from the routing system instead of React Router DOM
    // This prevents HomePage from rendering on therapist profile routes and causing permission errors
    if (page !== 'home' && page !== 'landing') {
        logger.warn('HomePage: Blocked render outside home route. Current page:', { page });
        return null;
    }
    
    // 🔓 UNLOCK LoadingGate - Clear the lock when reaching home page
    useEffect(() => {
        const locked = sessionStorage.getItem("LOADING_LOCKED");
        if (locked) {
            logger.debug("HomePage: Clearing LoadingGate lock");
            sessionStorage.removeItem("LOADING_LOCKED");
        }
    }, []);
    
    // OOM: No logger in render path – avoid retaining large objects
    // Custom hooks for logic extraction
    const translationsObject = useHomePageTranslations(t);
    const hasAdminPrivileges = !!(_loggedInAgent || loggedInProvider);
    
    // ✅ CRITICAL FIX: Destructure all hook returns
    const {
        activeTab,
        setActiveTab,
        showComingSoonModal,
        setShowComingSoonModal,
        comingSoonSection,
        setComingSoonSection,
        isMenuOpen,
        setIsMenuOpen,
        isLocationModalOpen,
        setIsLocationModalOpen,
        selectedCity,
        setSelectedCity,
        customLinks,
        setCustomLinks,
        showRatingModal,
        setShowRatingModal,
        selectedTherapist,
        setSelectedTherapist,
        selectedRatingItem,
        setSelectedRatingItem,
        isDevelopmentMode,
        setIsDevelopmentMode,
        shuffledHomeImages,
        shuffleArray
    } = useHomePageState();

    const [showLocationSelectPopup, setShowLocationSelectPopup] = useState(false);
    
    // Sync selectedCity with CityContext city
    useEffect(() => {
        if (contextCity && contextCity !== selectedCity) {
            logger.debug('Syncing selectedCity with CityContext:', { contextCity, currentSelectedCity: selectedCity });
            setSelectedCity(contextCity);
        }
    }, [contextCity]);
    
    // Debug log for selectedCity changes
    useEffect(() => {
        logger.debug('HomePage selectedCity changed:', { selectedCity, contextCity });
    }, [selectedCity, contextCity]);
    
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            let storedCityId = window.localStorage.getItem('user_city_id');
            const storedCityName = window.localStorage.getItem('user_city_name');

            if (!storedCityId && storedCityName) {
                storedCityId = convertLocationStringToId(storedCityName);
                window.localStorage.setItem('user_city_id', storedCityId);
            }

            if (!storedCityId && !storedCityName) {
                logger.debug('City not set — redirecting to landing.');
                onNavigate?.('landing');
                return;
            }

            const storedCity = storedCityId || storedCityName;
            if (storedCity && (selectedCity === 'all' || !selectedCity)) {
                logger.debug('Restoring selected city from storage on HomePage:', storedCity);
                setSelectedCity(storedCityId && storedCityId !== 'all' ? storedCityId : (storedCityName || storedCityId));
            }
        } catch (error) {
            logger.error('Failed to read city selection from storage', error);
        }
    }, [hasConfirmedCity, onNavigate, selectedCity, setSelectedCity]);
    
    const userLocationForMatching = useMemo<UserLocationContext | null>(() => {
        if (!confirmedLocation) return null;
        
        return {
            cityId: confirmedLocation.cityId,
            cityName:
                confirmedLocation.cityName ||
                contextCity ||
                selectedCity ||
                'Unknown City',
            latitude:
                typeof confirmedLocation.latitude === 'number'
                    ? confirmedLocation.latitude
                    : null,
            longitude:
                typeof confirmedLocation.longitude === 'number'
                    ? confirmedLocation.longitude
                    : null,
            locationText: confirmedLocation.locationText ?? null
        };
    }, [confirmedLocation, contextCity, selectedCity]);
    
    // No distance radius: therapists are displayed per city location (all in selected city)
    const therapistMatchOutcome = useMemo<MatchOutcome | null>(() => {
        if (!userLocationForMatching) return null;
        return matchTherapistsForUser(
            Array.isArray(therapists) ? (therapists as any[]) : [],
            userLocationForMatching,
            {
                radiusKm: 999,
                minResults: 5,
                maxResults: 500
            }
        );
    }, [therapists, userLocationForMatching]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            setInitializingCityGuard(false);
            return;
        }

        try {
            const storedCityId = window.localStorage.getItem('user_city_id');
            const storedCityName = window.localStorage.getItem('user_city_name');

            if (!storedCityId && !storedCityName) {
                logger.warn('City not set — redirecting to landing.');
                onNavigate?.('landing');
                return;
            }
            const storedCity = storedCityId || storedCityName;
            if (storedCity && storedCity !== 'all' && (selectedCity === 'all' || !selectedCity)) {
                logger.debug('Restoring selected city from storage on HomePage:', storedCity);
                setSelectedCity(storedCityId && storedCityId !== 'all' ? storedCityId : (storedCityName || storedCityId));
            }
        } catch (error) {
            logger.error('Failed to read city selection from storage', error);
        } finally {
            setInitializingCityGuard(false);
        }
    }, [hasConfirmedCity, onNavigate, selectedCity, setSelectedCity]);
    
    const hasPlaceholderMatches = Boolean(therapistMatchOutcome?.placeholders.length);
    const distanceMatchCount = therapistMatchOutcome?.distanceMatches.length ?? 0;
    // Prefer current selection (popup or drawer) so header location updates when user changes city from either
    const locationSelection = selectedCity || contextCity || null;
    const displayCityName = locationSelection
        ? getLocationDisplayName(locationSelection, translationsObject?.home?.allAreas ?? 'All areas')
        : (userLocationForMatching?.cityName || 'your area');
    
    // Female therapist filter state
    const [showFemaleOnly, setShowFemaleOnly] = useState(false);
    
    // Area filter state
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const [showAreaFilter, setShowAreaFilter] = useState(false);
    
    // FAB menu state
    const [fabMenuOpen, setFabMenuOpen] = useState(false);
    
    // Special Offers State (for click-to-enlarge)
    const [selectedOffer, setSelectedOffer] = useState<any>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    
    // Advanced Filter States
    const [selectedTherapistGender, setSelectedTherapistGender] = useState<'female' | 'male' | null>(null);
    const [selectedServiceFor, setSelectedServiceFor] = useState<'women' | 'men' | 'children' | null>(null);
    const [selectedMassageType, setSelectedMassageType] = useState<string>('');
    const [selectedSpecialFeature, setSelectedSpecialFeature] = useState<string>('');
    const [priceRange, setPriceRange] = useState<[number, number]>([100000, 450000]);

    // 🚀 PERFORMANCE: Prefetched bulk data for therapist cards (eliminates N+1 queries).
    // Always-initialized Maps: no null, no defensive ?. required; stable production pattern.
    const [prefetchedData, setPrefetchedData] = useState<{
        menus: Map<string, any>;
        shareLinks: Map<string, any>;
    }>({ menus: new Map(), shareLinks: new Map() });

    // When arriving from Massage Types page, prop is set so filter applies on first paint
    const effectiveMassageType = selectedMassageTypeProp ?? selectedMassageType;
    
    const {
        previewTherapistId,
        adminViewArea,
        bypassRadiusForAdmin,
        devLocationOverride,
        setDevLocationOverride,
        devShowAllTherapists,
        setDevShowAllTherapists,
        devTestLocations,
        isDev
    } = useHomePageAdmin({ hasAdminPrivileges });

    // 🌍 FACEBOOK-STYLE AUTO LOCATION CAPTURE
    // Silently capture location when entering from landing page
    const [silentLocationCaptured, setSilentLocationCaptured] = useState(false);
    
    useEffect(() => {
        const captureLocationSilently = async () => {
            // Only capture if not already done
            if (silentLocationCaptured) return;
            
            // Import the Facebook-style location capture utility
            const { captureSilentLocation, getStoredLocation } = await import('../utils/silentLocationCapture');
            
            // Check if we already have stored location
            const existing = getStoredLocation();
            if (existing) {
                logger.debug('Using existing location capture:', existing);
                if (!userLocation && onSetUserLocation) {
                    onSetUserLocation({
                        lat: existing.lat,
                        lng: existing.lng,
                        address: existing.address || 'Auto-detected location'
                    });
                }
                setSilentLocationCaptured(true);
                return;
            }
            
            // Capture new location silently
            const captured = await captureSilentLocation();
            if (captured) {
                logger.debug('New location captured:', captured);
                if (!userLocation && onSetUserLocation) {
                    onSetUserLocation({
                        lat: captured.lat,
                        lng: captured.lng,
                        address: captured.address || 'Auto-detected location'
                    });
                }
            }
            
            setSilentLocationCaptured(true);
        };
        
        // Small delay to avoid blocking initial render
        const timer = setTimeout(captureLocationSilently, 2000);
        return () => clearTimeout(timer);
    }, [silentLocationCaptured, userLocation, onSetUserLocation]);

    const {
        autoDetectedLocation,
        setAutoDetectedLocation,
        nearbyTherapists,
        setNearbyTherapists,
        nearbyPlaces,
        setNearbyPlaces,
        nearbyHotels,
        setNearbyHotels,
        cityFilteredTherapists,
        setCityFilteredTherapists,
        isLocationDetecting,
        setIsLocationDetecting,
        parseCoordinates,
        getCustomerLocation,
        findAllNearbyTherapists,
        findAllNearbyPlaces,
        findCityByCoordinates
    } = useHomePageLocation({
        therapists,
        places,
        hotels,
        selectedCity,
        propSelectedCity,
        userLocation,
        previewTherapistId,
        adminViewArea,
        bypassRadiusForAdmin,
        devLocationOverride,
        devShowAllTherapists,
        hasAdminPrivileges,
        onSetUserLocation
    });

    // TEMPORARY DEBUG – remove after confirming location/filter behavior
    useEffect(() => {
        console.log('Selected location:', selectedCity ?? contextCity ?? 'all');
        console.log('All therapists:', therapists);
        console.log('After city filter:', cityFilteredTherapists);
    }, [selectedCity, contextCity, therapists, cityFilteredTherapists]);

    // Populate cityFilteredTherapists: only therapists whose profile city matches the selected city
    // (from main landing page city OR location dropdown) are shown on home.
    useEffect(() => {
        let effectiveCity = selectedCity || contextCity ||
            (typeof window !== 'undefined' ? window.localStorage.getItem('user_city_name') : null);
        // Fallback: after landing→home navigation, state may not be synced yet; use localStorage directly
        if ((!effectiveCity || effectiveCity === 'all') && typeof window !== 'undefined') {
            const storedName = window.localStorage.getItem('user_city_name');
            const storedId = window.localStorage.getItem('user_city_id');
            effectiveCity = (storedName || storedId || '').trim() || effectiveCity;
        }
        const hasCity = !!effectiveCity && effectiveCity !== 'all';

        if (!initializingCityGuard && !hasConfirmedCity && !hasCity && effectiveCity !== 'all') {
            setCityFilteredTherapists([]);
            return;
        }

        if (!Array.isArray(therapists) || therapists.length === 0) {
            return;
        }

        // When user has selected a city: show ALL therapists in that city; sort by distance (nearest first) when user has coords.
        // We do not filter by 25km when a city is selected, so "Yogyakarta" always shows all Yogyakarta therapists.
        if (hasCity) {
            let byCity = filterTherapistsByCity(therapists, effectiveCity);
            // Fallback: if 0 match (e.g. effectiveCity stored as "Yogyakarta, Indonesia"), try canonical locationId so "yogyakarta" matches
            if (byCity.length === 0 && therapists.length > 0) {
                const cityPart = effectiveCity.includes(',') ? effectiveCity.split(',')[0].trim() : effectiveCity;
                const canonicalId = convertLocationStringToId(cityPart || effectiveCity);
                if (canonicalId && canonicalId !== 'all') {
                    byCity = filterTherapistsByCity(therapists, canonicalId);
                    if (byCity.length > 0) {
                        logger.debug('🏙️ City filter fallback: matched using locationId', { effectiveCity, locationId: canonicalId, count: byCity.length });
                    }
                }
            }
            const isYogyakarta = /yogyakarta|jogja|yogya/i.test(effectiveCity || '');
            if (isYogyakarta && typeof console !== 'undefined') {
                console.log(`[IndaStreet] Listed therapists in Yogyakarta: ${byCity.length} (of ${therapists.length} total from database)`);
            }
            if (byCity.length === 0 && therapists.length > 0) {
                logger.warn('🏙️ No therapists match selected city. Ensure therapist profiles have city/locationId set (e.g. "Yogyakarta", "yogyakarta", "Jogja").', {
                    city: effectiveCity,
                    totalTherapists: therapists.length,
                    sampleCities: therapists.slice(0, 5).map((t: any) => t.city || t.locationId || t.location_id || t.location)
                });
            }
            const userLat = confirmedLocation?.latitude;
            const userLng = confirmedLocation?.longitude;
            const hasUserCoords = typeof userLat === 'number' && typeof userLng === 'number';

            if (hasUserCoords) {
                const userCoords = { lat: userLat, lng: userLng };
                const withDistance = byCity.map((t) => {
                    const gp = extractGeopoint(t);
                    const distanceKm = gp ? calculateDistance(userCoords, gp) / 1000 : null;
                    return { therapist: t, distanceKm };
                });
                const sorted = [...withDistance].sort((a, b) => {
                    if (a.distanceKm == null && b.distanceKm == null) return 0;
                    if (a.distanceKm == null) return 1;
                    if (b.distanceKm == null) return -1;
                    return a.distanceKm - b.distanceKm;
                });
                const result = sorted.map((x) => ({ ...x.therapist, _distanceKm: x.distanceKm }));
                logger.debug('🏙️ City + nearest first', { city: effectiveCity, count: result.length, total: therapists.length });
                setCityFilteredTherapists(result);
            } else {
                logger.debug('🏙️ City filter', { city: effectiveCity, count: byCity.length, total: therapists.length });
                setCityFilteredTherapists(byCity);
            }
        } else if (effectiveCity === 'all') {
            setCityFilteredTherapists(therapists);
        }
    }, [initializingCityGuard, hasConfirmedCity, therapists, selectedCity, contextCity, confirmedLocation, setCityFilteredTherapists]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const storedCityId = window.localStorage.getItem('user_city_id');
            const storedCityName = window.localStorage.getItem('user_city_name');
            if (!storedCityId && !storedCityName) {
                logger.warn('City not set — redirecting to landing.');
                onNavigate?.('landing');
                return;
            }
            const storedCity = storedCityId || storedCityName;
            if (storedCity && storedCity !== 'all' && (selectedCity === 'all' || !selectedCity)) {
                setSelectedCity(storedCityId && storedCityId !== 'all' ? storedCityId : (storedCityName || storedCityId));
            }
        } catch (error) {
            logger.error('Failed to read city selection from storage', error);
        }
    }, [hasConfirmedCity, onNavigate, selectedCity, setSelectedCity]);

    // State for city-filtered places
    const [cityFilteredPlaces, setCityFilteredPlaces] = useState<any[]>([]);
    const [cityFilteredHotels, setCityFilteredHotels] = useState<any[]>([]);

    
    // Google Maps Autocomplete (minimal UI state)
    const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
    const locationInputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);
    
    // Initialize Google Maps and body classes
    useEffect(() => {
        const initGoogleMaps = async () => {
            try {
                logger.debug('Initializing Google Maps for city location system...');
                await initializeGoogleMaps();
                setMapsApiLoaded(true);
                logger.debug('Google Maps initialized successfully for city filtering');
            } catch (error) {
                logger.warn('Google Maps failed to load, using fallback location matching:', { error });
            }
        };
        initGoogleMaps();
        
        // Add body classes for proper CSS support
        document.body.classList.add('has-footer', 'is-home');
        return () => {
            document.body.classList.remove('has-footer', 'is-home');
        };
    }, []);

    // Ensure activeTab is always 'home' when HomePage loads (shows therapist cards)
    useEffect(() => {
        setActiveTab('home');
    }, []); // Run once when component mounts

    // Apply advanced search params when arriving from Advanced Search (tab + city); clear after so next visit is normal
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem('advanced_search_params');
            if (!raw) return;
            const params = JSON.parse(raw) as { providerType?: string; city?: string; area?: string | null; [k: string]: unknown };
            const ptype = params.providerType;
            if (ptype === 'massage_place') setActiveTab('places');
            else if (ptype === 'skin_care') setActiveTab('facials');
            // else therapist or missing → keep default 'home' tab
            if (params.city && params.city !== 'all' && setContextCity) setContextCity(params.city);
            sessionStorage.removeItem('advanced_search_params');
        } catch (_) { /* ignore */ }
    }, [setContextCity]);

    // When arriving from Massage Types page (Find Therapists / Find Massage Places): apply filter and switch tab
    useEffect(() => {
        if (!selectedMassageTypeProp) return;
        setSelectedMassageType(selectedMassageTypeProp);
        try {
            const view = sessionStorage.getItem('massage_type_filter_view');
            if (view === 'places') setActiveTab('places');
            else setActiveTab('home');
            sessionStorage.removeItem('massage_type_filter_view');
        } catch (_) { /* ignore */ }
    }, [selectedMassageTypeProp]);

    // 🚀 PERFORMANCE: Bulk prefetch therapist menu and share link data
    // This eliminates N+1 queries by fetching all data in 2 queries instead of 2*N queries
    // 🔒 MODAL PROTECTION: Track prefetch to prevent re-fetching from closing open modals
    const hasPrefetched = useRef(false);
    
    useEffect(() => {
        const prefetch = async () => {
            if (!therapists || therapists.length === 0) {
                logger.debug('Skipping prefetch - no therapists');
                return;
            }

            // 🛡️ CRITICAL: Only prefetch once to prevent modal closures from data reloading
            // Modal state must remain independent of data loading
            if (hasPrefetched.current) {
                logger.debug('Skipping prefetch - already completed');
                return;
            }

            logger.debug(`Prefetching data for ${therapists.length} therapists...`);
            try {
                const data = await prefetchTherapistCardData(therapists);
                setPrefetchedData(data);
                hasPrefetched.current = true; // 🔒 Mark as prefetched
                logger.debug(`Prefetch complete - ${data.menus.size} menus, ${data.shareLinks.size} share links`);
            } catch (error) {
                logger.error('Prefetch failed:', { error });
                // Reset to empty Maps so cards still render (will fall back to individual queries)
                setPrefetchedData({ menus: new Map(), shareLinks: new Map() });
                hasPrefetched.current = true; // 🔒 Mark as attempted to prevent infinite retry
            }
        };

        prefetch();
        // 🛡️ PROTECTION: Removed selectedCity from dependencies to prevent re-fetch when city changes
        // Menu data is city-independent, so we don't need to re-fetch
    }, [therapists.length]); // Only re-fetch if therapist count changes

    // Add has-footer class for proper CSS support
    useEffect(() => {
        document.body.classList.add('has-footer');
        document.body.classList.add('is-home');
        return () => {
            document.body.classList.remove('has-footer');
            document.body.classList.remove('is-home');
        };
    }, []);

    // Load Google Maps API for location autocomplete
    useEffect(() => {
        const checkGoogleMaps = () => {
            if ((window as any).google?.maps?.places) {
                setMapsApiLoaded(true);
                return true;
            }
            return false;
        };

        const loadMapsAPI = () => {
            const apiKey = getStoredGoogleMapsApiKey();
            if (!apiKey) {
                logger.warn('Google Maps API key not configured');
                return;
            }

            logger.debug('Loading Google Maps API for location autocomplete');
            loadGoogleMapsScript(apiKey, () => {
                logger.debug('Google Maps API loaded for HomePage');
                setMapsApiLoaded(true);
            });
        };

        if (!checkGoogleMaps()) {
            loadMapsAPI();
        }
    }, []);

    // Initialize Google Maps Places Autocomplete
    useEffect(() => {
        if (!mapsApiLoaded || !locationInputRef.current) return;

        try {
            const autocomplete = new (window as any).google.maps.places.Autocomplete(locationInputRef.current, {
                types: ['(cities)'],
                fields: ['geometry', 'formatted_address', 'name']
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                
                if (!place.geometry || !place.geometry.location) {
                    logger.warn('No location details available for selected place');
                    return;
                }

                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const address = place.formatted_address || place.name || 'Selected location';

                logger.debug('Location selected from autocomplete', { address, lat, lng });

                // Update user location
                if (onSetUserLocation) {
                    onSetUserLocation({
                        address,
                        lat,
                        lng
                    });
                }
            });

            autocompleteRef.current = autocomplete;
            logger.debug('Google Maps Autocomplete initialized');
        } catch (error) {
            logger.error('Failed to initialize autocomplete', { error });
        }
    }, [mapsApiLoaded, onSetUserLocation]);

    // Note: Replaced massage type filtering with city-based location filtering

    const handleOpenRatingModal = (item: any, type: 'therapist' | 'place' = 'therapist') => {
        // Check if customer is logged in before allowing review
        if (!loggedInCustomer) {
            if (onShowRegisterPrompt) {
                onShowRegisterPrompt();
            }
            return;
        }
        setSelectedRatingItem({ item, type });
        if (type === 'therapist') {
            setSelectedTherapist(item);
        }
        setShowRatingModal(true);
    };

    const handleCloseRatingModal = () => {
        setShowRatingModal(false);
        setSelectedTherapist(null);
        setSelectedRatingItem(null);
    };

    const handleSubmitReview = async () => {
        if (!selectedRatingItem) return;

        try {
            const itemId = selectedRatingItem.item.id || (selectedRatingItem.item as any).$id;
            await reviewService.create({
                providerId: String(itemId),
                providerType: selectedRatingItem.type,
                rating: 0, // Will be set by RatingModal
                reviewContent: '',
                reviewerId: '',
                status: 'pending'
            });
            handleCloseRatingModal();
        } catch (error) {
            logger.error('Error submitting review', { error });
        }
    };

    // Function to show custom orange location modal
    const handleLocationRequest = () => {
        logger.debug('Showing custom orange location modal');
        setIsLocationModalOpen(true);
    };

    // Function to handle when user allows location in custom modal
    const handleLocationAllow = async () => {
        setIsLocationModalOpen(false);
        try {
            logger.debug('User allowed location, requesting via browser API');
            const location = await getCustomerLocation();
            
            logger.debug('Location detected', { location });
            
            // Use Google Maps Geocoding to get address from coordinates
            let address = 'Current location';
            
            if ((window as any).google?.maps?.Geocoder) {
                try {
                    const geocoder = new (window as any).google.maps.Geocoder();
                    const result = await new Promise<any>((resolve, reject) => {
                        geocoder.geocode(
                            { location: { lat: location.lat, lng: location.lng } },
                            (results: any[], status: string) => {
                                if (status === 'OK' && results && results.length > 0) {
                                    resolve(results[0]);
                                } else {
                                    reject(new Error('Geocoding failed'));
                                }
                            }
                        );
                    });
                    
                    address = result.formatted_address || 'Current location';
                    logger.debug('Reverse geocoded address', { address });
                } catch (geoError) {
                    logger.warn('Reverse geocoding failed, using default address', { geoError });
                }
            }
            
            // Update the app's user location
            if (onSetUserLocation) {
                onSetUserLocation({
                    address,
                    lat: location.lat,
                    lng: location.lng
                });
            }
            
            // Update auto-detected location state
            setAutoDetectedLocation(location);
            
        } catch (error) {
            logger.warn('Location detection failed', { error });
            // Show a user-friendly error message
            alert('Unable to detect location. Please enable location permissions in your browser and try again.');
        }
    };

    // Function to handle when user denies location in custom modal
    const handleLocationDeny = () => {
        logger.debug('User denied location access');
        setIsLocationModalOpen(false);
        // App continues with default location (Jakarta, Indonesia)
    };

    // Show custom location modal for new users
    useEffect(() => {
        try {
            // Show location modal for regular users (not providers/agents/customers) who don't have location set
            if (!loggedInProvider && !_loggedInAgent && !loggedInCustomer && !userLocation && !autoDetectedLocation) {
                // Small delay for better UX
                setTimeout(() => {
                    setIsLocationModalOpen(true);
                }, 1000);
            }
        } catch (error) {
            logger.warn('HomePage location modal effect warning (safe to ignore in React 19)', { error });
        }
    }, [loggedInProvider, _loggedInAgent, loggedInCustomer, userLocation, autoDetectedLocation]);

    // ⚠️ AUTOMATIC LOCATION DETECTION INTENTIONALLY DISABLED
    // 
    // IP-based location intentionally disabled due to inaccuracy in Indonesia.
    // ISPs often route traffic through Jakarta, causing incorrect city detection.
    // 
    // Users MUST:
    // - Manually select their city via CitySelectionPage
    // - OR manually enable GPS when they need nearby search
    // 
    // NO automatic GPS detection on page load.
    // NO IP-based location detection.
    // NO browser locale/timezone-based city detection.
    useEffect(() => {
        // INTENTIONALLY EMPTY - no automatic location detection
        // Users must explicitly choose their city or enable GPS manually
        logger.debug('Automatic location detection disabled - users must select city manually');
    }, [loggedInProvider, _loggedInAgent, autoDetectedLocation, isLocationDetecting, userLocation, onSetUserLocation]);

    // ⚠️ AUTO-DETECT CITY INTENTIONALLY DISABLED
    // 
    // IP-based location intentionally disabled due to inaccuracy in Indonesia.
    // Users MUST manually select their city via CitySelectionPage.
    // 
    // Even if userLocation (GPS) is available, we DO NOT auto-set selectedCity.
    // The browsing city (selectedCity) must be explicitly chosen by the user.
    useEffect(() => {
        // INTENTIONALLY EMPTY - no auto city detection from GPS coordinates
        // GPS is ONLY used for distance calculations, NOT for setting browsing city
        logger.debug('Auto city detection disabled - user must select city via CitySelectionPage');
    }, [userLocation]);

    // Map postal codes to cities for automatic detection
    const mapPostalCodeToCity = (address: string): string | null => {
        if (!address) return null;
        
        // Extract postal code from address (5-digit numbers)
        const postalCodeMatch = address.match(/\b(\d{5})\b/);
        if (!postalCodeMatch) return null;
        
        const postalCode = postalCodeMatch[1];
        
        // Yogyakarta Special Region postal codes
        if (postalCode.startsWith('551') || postalCode.startsWith('552') || postalCode.startsWith('553') || postalCode.startsWith('554') || postalCode.startsWith('555')) {
            return 'yogyakarta';
        }
        
        // Jakarta postal codes
        if (postalCode.startsWith('101') || postalCode.startsWith('102') || postalCode.startsWith('103') || postalCode.startsWith('104') || postalCode.startsWith('105') || 
            postalCode.startsWith('106') || postalCode.startsWith('107') || postalCode.startsWith('108') || postalCode.startsWith('109') || postalCode.startsWith('110') ||
            postalCode.startsWith('111') || postalCode.startsWith('112') || postalCode.startsWith('113') || postalCode.startsWith('114') || postalCode.startsWith('115') ||
            postalCode.startsWith('116') || postalCode.startsWith('117') || postalCode.startsWith('118') || postalCode.startsWith('119')) {
            return 'jakarta';
        }
        
        // Central Java (Semarang area)
        if (postalCode.startsWith('501') || postalCode.startsWith('502') || postalCode.startsWith('503') || postalCode.startsWith('504') || postalCode.startsWith('505')) {
            return 'semarang';
        }
        
        // West Java (Bandung area)
        if (postalCode.startsWith('401') || postalCode.startsWith('402') || postalCode.startsWith('403') || postalCode.startsWith('404') || postalCode.startsWith('405')) {
            return 'bandung';
        }
        
        return null;
    };

    // Helper to check if provider is a featured sample (always show in all cities)
    const isFeaturedSample = (provider: any, type: 'therapist' | 'place' | 'hotel'): boolean => {
        if (!provider) return false;
        
        const name = provider.name?.toLowerCase() || '';
        const isFeatured = type === 'therapist' 
            ? name.includes('budi') // More flexible - just need "budi" in the name
            : name.includes('sample') && name.includes('massage') && name.includes('spa');
        
        // Debug logging for featured sample detection
        if (isFeatured) {
            logger.debug(`Featured sample detected: ${type} "${provider.name}" - will show in ALL Indonesian cities`);
        }
        
        return isFeatured;
    };
    const normalizeBooleanFlag = (value: any): boolean | null => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase();
            if (normalized === 'true') return true;
            if (normalized === 'false') return false;
        }
        return null;
    };

    const shouldTreatTherapistAsLive = (therapist: any): boolean => {
        const normalizedLiveFlag = normalizeBooleanFlag(therapist.isLive);
        const normalizedStatus = (therapist.status || therapist.availability || '')
            .toString()
            .trim()
            .toLowerCase();
        
        // Show therapists who have location data so they display in location lists
        let hasCoords = false;
        if (therapist.coordinates) {
            if (typeof therapist.coordinates === 'object' && therapist.coordinates.lat != null) hasCoords = true;
            else if (typeof therapist.coordinates === 'string') {
                try {
                    const c = JSON.parse(therapist.coordinates);
                    if (c && typeof c.lat === 'number' && typeof c.lng === 'number') hasCoords = true;
                } catch (_) {}
            }
        }
        const hasLocationData = !!(therapist.city || therapist.locationId || therapist.location || hasCoords);
        if (hasLocationData) return true;
        
        if (normalizedLiveFlag === false && (normalizedStatus === 'offline' || normalizedStatus === '')) return false;
        return true;
    };

    // SHOWCASE PROFILE SYSTEM - Random 5 Yogyakarta profiles appear in each city
    const getYogyakartaShowcaseProfiles = (allTherapists: any[], targetCity: string): any[] => {
        if (!allTherapists || allTherapists.length === 0) return [];
        
        // Don't create showcase profiles for Yogyakarta itself (show real profiles there)
        if (targetCity.toLowerCase() === 'yogyakarta' || 
            targetCity.toLowerCase() === 'yogya' || 
            targetCity.toLowerCase() === 'jogja') {
            return [];
        }
        
        // Find all Yogyakarta therapists
        const yogyaTherapists = allTherapists
            .filter((t: any) => {
                if (!t.location) return false;
                
                const location = t.location.toLowerCase();
                return location.includes('yogyakarta') || 
                       location.includes('yogya') || 
                       location.includes('jogja');
            });
        
        logger.debug(`Found ${yogyaTherapists.length} Yogyakarta therapists for showcase generation`);
        
        // If we have less than 5 Yogyakarta therapists, duplicate them to reach 5
        let expandedTherapists = [...yogyaTherapists];
        if (yogyaTherapists.length > 0 && yogyaTherapists.length < 5) {
            logger.debug(`Only ${yogyaTherapists.length} Yogyakarta therapists available, expanding to 5`);
            
            // Keep duplicating until we have at least 5
            while (expandedTherapists.length < 5) {
                expandedTherapists = [...expandedTherapists, ...yogyaTherapists];
            }
            expandedTherapists = expandedTherapists.slice(0, 5); // Take exactly 5
            logger.debug(`Expanded to ${expandedTherapists.length} therapists for showcase`);
        }
        
        // Shuffle and take random 5 - different for each city
        const shuffled = shuffleArray([...expandedTherapists]);
        const selectedTherapists = shuffled.slice(0, 5);
        
        logger.debug(`Selected ${selectedTherapists.length} therapists for showcase in ${targetCity}`, 
                   { therapistNames: selectedTherapists.map((t: any) => t.name) });
        
        // Create showcase versions with busy status and target city location
        // CRITICAL: Preserve original Appwrite $id for share links to work
        const showcaseProfiles = selectedTherapists.map((therapist: any, index: number) => ({
            ...therapist,
            // KEEP ORIGINAL APPWRITE $id (required for /share/{id} URLs to work)
            // DO NOT modify $id or id fields
            status: 'busy', // Always busy to prevent bookings outside Yogyakarta
            availability: 'busy',
            isAvailable: false, // Ensure not bookable
            location: `${targetCity}, Indonesia`, // Dynamic location matching user's viewing area
            city: targetCity, // Set city field as well
            locationId: targetCity.toLowerCase(), // Set locationId to match city
            _locationArea: targetCity.toLowerCase(), // Set _locationArea for card display
            isShowcaseProfile: true, // Flag to identify showcase profiles
            showcaseCity: targetCity, // Track which city this showcase is for
            // Keep all other properties (name, image, rating, reviews, etc.) the same
        }));
        
        logger.debug(`Created ${showcaseProfiles.length} showcase profiles from Yogyakarta for city: ${targetCity}`);
        
        return showcaseProfiles;
    };

    interface PlaceholderCardProps {
        cityName: string;
        description?: string | null;
        onRequest?: () => void;
        onTherapistPortalClick?: () => void;
    }

    const PlaceholderTherapistCard: React.FC<PlaceholderCardProps> = ({
        cityName,
        description,
        onRequest,
        onTherapistPortalClick
    }) => (
        <div className="rounded-2xl border border-dashed border-orange-300 bg-white px-5 py-6 text-center shadow-sm">
            <p className="text-lg font-semibold text-gray-900">Therapists Coming Soon</p>
            <p className="text-sm text-gray-600 mt-1">
                {description || `We are onboarding certified therapists for ${cityName}.`}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <button
                    onClick={() => onRequest?.()}
                    className="inline-flex items-center justify-center rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600 transition-colors"
                >
                    Request Therapist
                </button>
                <button
                    onClick={() => onTherapistPortalClick?.()}
                    className="inline-flex items-center justify-center rounded-full border border-orange-300 bg-white px-4 py-2 text-sm font-semibold text-orange-600 shadow-sm hover:bg-orange-100 transition-colors"
                >
                    Become a Therapist
                </button>
            </div>
        </div>
    );

    // Filter therapists and places by location automatically
    useEffect(() => {
        const filterByLocation = async () => {
            const locationToUse = autoDetectedLocation || userLocation;
            
            // Location filtering enabled with city-based matching (OOM: no logger here – avoids retaining lists)
            // For now, set default coordinates to Yogyakarta if no location available
            const defaultYogyaCoords = { lat: -7.7956, lng: 110.3695 };
            
            const safeTherapistsList = Array.isArray(therapists) ? therapists : [];
            const safePlacesList = Array.isArray(places) ? places : [];
            const safeHotelsList = Array.isArray(hotels) ? hotels : [];
            // Add default coordinates to therapists and places if missing
            const therapistsWithCoords = safeTherapistsList.map((t: any) => {
                const parsedCoords = parseCoordinates(t.coordinates);
                const coords = parsedCoords || defaultYogyaCoords;
                const derivedCity = (coords && coords.lat && coords.lng) ? deriveLocationIdFromGeopoint(coords) : null;
                const city = t.city || (derivedCity && derivedCity !== 'other' ? derivedCity : null) || null;
                const locationId = t.locationId || city || null;
                const location = t.location || t.city || t.locationId || (derivedCity || 'Yogyakarta');
                return {
                    ...t,
                    coordinates: coords,
                    city: city || t.city,
                    locationId: locationId || t.locationId,
                    location
                };
            });
            
            const placesWithCoords = safePlacesList.map((p: any) => {
                const parsedCoords = parseCoordinates(p.coordinates);
                return {
                    ...p,
                    coordinates: parsedCoords || defaultYogyaCoords,
                    location: p.location || 'Yogyakarta'
                };
            });
            
            const hotelsWithCoords = safeHotelsList.map((h: any) => {
                const parsedCoords = parseCoordinates(h.coordinates);
                return {
                    ...h,
                    coordinates: parsedCoords || defaultYogyaCoords,
                    location: h.location || 'Yogyakarta'
                };
            });
            
            // GPS-based filtering (25km radius) when user sets location AND city is 'all'
            // City dropdown filtering takes priority when user selects specific city
            // 🔧 DISABLE GPS filtering for "All Indonesia" - show all therapists nationwide
            if (false && locationToUse && selectedCity === 'all') {
                try {
                    logger.debug('Filtering providers by GPS location (25km radius)', { location: locationToUse });
                    
                    // Get location coordinates
                    // 🔧 DEV-ONLY: Use override location if set, otherwise use real location
                    const realCoords = (locationToUse && 'lat' in locationToUse) 
                        ? { lat: locationToUse.lat, lng: locationToUse.lng }
                        : autoDetectedLocation;
                    const coords = (isDev && devLocationOverride) ? { lat: devLocationOverride?.lat || 0, lng: devLocationOverride?.lng || 0 } : realCoords;

                    if (coords && coords.lat !== undefined && coords.lng !== undefined) {
                        logger.debug('Using coordinates', { coords });

                        // Find ALL nearby therapists and places (25km radius) - NO status filtering for homepage
                        const nearbyTherapistsResult = await findAllNearbyTherapists(coords as { lat: number; lng: number }, 25);
                        const nearbyPlacesResult = await findAllNearbyPlaces(coords as { lat: number; lng: number }, 25);
                        
                        logger.debug('Found nearby providers', {
                            therapists: nearbyTherapistsResult.length,
                            places: nearbyPlacesResult.length
                        });
                        
                        // Always include featured samples (Budi) regardless of location
                        const featuredTherapists = safeTherapistsList.filter((t: any) => isFeaturedSample(t, 'therapist'));
                        const featuredPlaces = safePlacesList.filter((p: any) => isFeaturedSample(p, 'place'));
                        
                        // Merge nearby results with featured samples (remove duplicates)
                        const mergedTherapists = [
                            ...featuredTherapists,
                            ...nearbyTherapistsResult.filter((t: any) => 
                                !featuredTherapists.some((ft: any) => 
                                    (ft.$id && ft.$id === t.$id) || (ft.id && ft.id === t.id)
                                )
                            )
                        ];
                        
                        const mergedPlaces = [
                            ...featuredPlaces,
                            ...nearbyPlacesResult.filter((p: any) => 
                                !featuredPlaces.some((fp: any) => 
                                    (fp.$id && fp.$id === p.$id) || (fp.id && fp.id === p.id)
                                )
                            )
                        ];
                        
                        // Use nearby results if found, otherwise fallback to all with coords
                        setNearbyTherapists(mergedTherapists.length > 0 ? mergedTherapists : therapistsWithCoords);
                        setNearbyPlaces(mergedPlaces.length > 0 ? mergedPlaces : placesWithCoords);
                        setNearbyHotels(hotelsWithCoords);
                        return;
                    }
                } catch (error) {
                    logger.error('Location filtering error', { error });
                    // Fallback to showing all providers
                }
            }
            
            // Default: Show all providers with coordinates (city dropdown will filter later)
            setNearbyTherapists(therapistsWithCoords);
            setNearbyPlaces(placesWithCoords);
            setNearbyHotels(hotelsWithCoords);
        };

        filterByLocation();
    }, [therapists, places, hotels, autoDetectedLocation, userLocation, selectedCity]);

    useEffect(() => {
        const effectiveCity = selectedCity || contextCity ||
            (typeof window !== 'undefined' ? window.localStorage.getItem('user_city_name') : null);
        const hasCity = !!effectiveCity && effectiveCity !== 'all';

        if (!hasConfirmedCity && !hasCity && effectiveCity !== 'all') {
            setCityFilteredPlaces([]);
            setCityFilteredHotels([]);
            return;
        }

        const cityForFilter = selectedCity || effectiveCity || '';
        const livePlaces = nearbyPlaces.filter((p: any) => p.isLive === true);
        const filteredPlacesByCity = livePlaces.filter((p: any) => {
            if (isFeaturedSample(p, 'place')) {
                return true;
            }

            if (cityForFilter === 'all') return true;

            const placeCity = p.city || p.locationId || p.location;

            if (!placeCity) {
                logger.debug(`Excluded place "${p.name}" - no city data`);
                return false;
            }

            const normalizedPlaceCity = placeCity.toLowerCase().trim();
            const normalizedSelectedCity = cityForFilter.toLowerCase().trim();

            const matches = normalizedPlaceCity === normalizedSelectedCity;

            if (matches) {
                logger.debug(`Included place "${p.name}" matches city "${selectedCity}"`);
            } else {
                logger.debug(`Excluded place "${p.name}" (city: "${placeCity}") does not match "${selectedCity}"`);
            }

            return matches;
        });
        setCityFilteredPlaces(filteredPlacesByCity);

        const liveHotels = nearbyHotels.filter((h: any) => h.isLive === true);
        const filteredHotels = liveHotels.filter((h: any) => {
            if (isFeaturedSample(h, 'hotel')) {
                return true;
            }

            if (cityForFilter === 'all') return true;

            const hotelCity = h.city || h.locationId || h.location;

            if (!hotelCity) {
                logger.debug(`Excluded hotel "${h.name}" - no city data`);
                return false;
            }

            const normalizedHotelCity = hotelCity.toLowerCase().trim();
            const normalizedSelectedCity = cityForFilter.toLowerCase().trim();

            const matches = normalizedHotelCity === normalizedSelectedCity;

            if (matches) {
                logger.debug(`Included hotel "${h.name}" matches city "${selectedCity}"`);
            } else {
                logger.debug(`Excluded hotel "${h.name}" (city: "${hotelCity}") does not match "${selectedCity}"`);
            }

            return matches;
        });
        setCityFilteredHotels(filteredHotels);

        if (therapistMatchOutcome) {
            logger.debug('[MATCH FLOW] Therapist matching summary', therapistMatchOutcome.stats);
            if (therapistMatchOutcome.placeholders.length > 0) {
                logger.debug('[MATCH FLOW] Placeholder therapists injected', {
                    city: userLocationForMatching?.cityName,
                    placeholderCount: therapistMatchOutcome.placeholders.length
                });
            }
        }
    }, [
        hasConfirmedCity,
        nearbyPlaces,
        nearbyHotels,
        selectedCity,
        contextCity,
        therapistMatchOutcome,
        userLocationForMatching
    ]);

    useEffect(() => {
        // Fetch custom drawer links
        const fetchCustomLinks = async () => {
            try {
                const links = await customLinksService.getAll();
                setCustomLinks(links);
            } catch (error) {
                // Silent fail - custom links are optional feature
            }
        };
        fetchCustomLinks();

        // Listen for drawer toggle events from footer - React 19 concurrent rendering safe
        const handleToggleDrawer = () => {
            logger.debug('toggleDrawer event received', { currentIsMenuOpen: isMenuOpen });
            setIsMenuOpen(prev => !prev);
        };

        const handleCustomerDashboardDrawer = () => {
            logger.debug('customer_dashboard_open_drawer event received', { currentIsMenuOpen: isMenuOpen });
            setIsMenuOpen(true);
        };
        
        // Add event listener with defensive checks for React 19 concurrent rendering
        let listenersAdded: [string, () => void][] = [];
        try {
            if (typeof window !== 'undefined' && window.addEventListener) {
                window.addEventListener('toggleDrawer', handleToggleDrawer);
                listenersAdded.push(['toggleDrawer', handleToggleDrawer]);
                
                window.addEventListener('customer_dashboard_open_drawer', handleCustomerDashboardDrawer);
                listenersAdded.push(['customer_dashboard_open_drawer', handleCustomerDashboardDrawer]);
                
                logger.debug('Added event listeners for drawer events');
            }
        } catch (error) {
            logger.warn('Event listener setup warning (safe to ignore)', { error });
        }
        
        return () => {
            // React 19 concurrent rendering safe cleanup - only remove if actually added
            listenersAdded.forEach(([eventType, handler]) => {
                try {
                    if (typeof window !== 'undefined' && window.removeEventListener) {
                        window.removeEventListener(eventType, handler);
                    }
                } catch (error) {
                    // Suppress DOM manipulation errors during React 19 concurrent rendering
                    logger.warn('Event listener cleanup warning (safe to ignore in React 19)', { error });
                }
            });
        };
    }, []);

    // Removed unused processedTherapists and processedPlaces

    const safeTherapists = Array.isArray(therapists) ? therapists : [];
    // Count of online therapists (status === 'online')
    const onlineTherapistsCount = safeTherapists.filter(t => t.status === 'online').length;

    // Single source of truth: header count and list both from this pipeline (never count from A, list from B).
    // Must be after safeTherapists so useMemo can reference it.
    const therapistDisplay = useMemo(() => {
        const isOwner = (t: any) => (
            loggedInProvider && loggedInProvider.type === 'therapist' && (
                String(t.id) === String(loggedInProvider.id) || String(t.$id) === String(loggedInProvider.id)
            )
        );
        const currentUserLocation = (isDev && devLocationOverride)
            ? { lat: (devLocationOverride || {}).lat, lng: (devLocationOverride || {}).lng }
            : (autoDetectedLocation || (userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null));
        const getCoords = (t: any) => {
            try {
                const c = typeof t.coordinates === 'string' ? JSON.parse(t.coordinates) : t.coordinates;
                if (typeof c?.lat === 'number' && typeof c?.lng === 'number') return c;
            } catch (e) { logger.warn('Invalid coordinates for therapist', { therapistId: t.$id }); }
            return null;
        };
        const calculateHaversineDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) => {
            const R = 6371;
            const dLat = (point2.lat - point1.lat) * Math.PI / 180;
            const dLon = (point2.lng - point1.lng) * Math.PI / 180;
            const a = Math.sin(dLat/2) ** 2 + Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * Math.sin(dLon/2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        };
        const safeInput = Array.isArray(cityFilteredTherapists) ? cityFilteredTherapists : [];
        let therapistsWithDistance = safeInput.map((t: any) => {
            let distance: number | null = null;
            // Use city/locationId/location_id/location so Yogyakarta (and all cities) show all matching profiles
            let locationArea: string = t.city || t.locationId || t.location_id || t.location || 'Unknown';
            if (currentUserLocation) {
                const therapistCoords = getCoords(t) || (t.geopoint ? { lat: t.geopoint.latitude, lng: t.geopoint.longitude } : null);
                if (therapistCoords) {
                    distance = calculateHaversineDistance(currentUserLocation, therapistCoords);
                    const matchedCity = matchProviderToCity(therapistCoords, 25);
                    if (matchedCity) locationArea = matchedCity.locationId;
                }
            }
            return { ...t, _distance: distance, _locationArea: locationArea };
        });
        let baseList = therapistsWithDistance.filter((t: any) => {
            if (isFeaturedSample(t, 'therapist')) return true;
            if (selectedCity !== 'all' && adminViewArea && bypassRadiusForAdmin && hasAdminPrivileges) return t._locationArea === adminViewArea;
            return true;
        });
        if (showFemaleOnly) {
            baseList = baseList.filter((t: any) => {
                const gender = String(t.therapistGender || t.gender || '').toLowerCase();
                const clientPrefs = String(t.clientPreferences || '').toLowerCase();
                return gender === 'female' || clientPrefs.includes('female') || clientPrefs.includes('woman') || gender === 'unisex';
            });
        }
        if (selectedArea) {
            baseList = baseList.filter((t: any) => {
                let serviceAreas: string[] = [];
                if (t.serviceAreas) {
                    try {
                        serviceAreas = typeof t.serviceAreas === 'string' ? JSON.parse(t.serviceAreas) : Array.isArray(t.serviceAreas) ? t.serviceAreas : [];
                    } catch (_) { return false; }
                }
                return Array.isArray(serviceAreas) && serviceAreas.includes(selectedArea);
            });
        }
        if (selectedTherapistGender || selectedServiceFor || effectiveMassageType || selectedSpecialFeature || (priceRange[0] !== 100000 || priceRange[1] !== 450000)) {
            baseList = baseList.filter((t: any) => {
                if (selectedTherapistGender && String(t.therapistGender || t.gender || '').toLowerCase() !== selectedTherapistGender) return false;
                if (selectedServiceFor) {
                    const clientPrefs = String(t.clientPreferences || '').toLowerCase();
                    const serviceFor = selectedServiceFor.toLowerCase();
                    const searchTerm = serviceFor === 'women' ? ['women', 'female', 'ladies'] : serviceFor === 'men' ? ['men', 'male', 'gentleman'] : ['children', 'kids', 'family'];
                    if (!searchTerm.some(term => clientPrefs.includes(term)) && clientPrefs !== 'all' && clientPrefs !== 'everyone') return false;
                }
                if (effectiveMassageType) {
                    const services = String(t.services || t.massageTypes || '').toLowerCase();
                    const specialties = String(t.specialties || '').toLowerCase();
                    if (!services.includes(effectiveMassageType.toLowerCase()) && !specialties.includes(effectiveMassageType.toLowerCase())) return false;
                }
                if (selectedSpecialFeature) {
                    const feat = selectedSpecialFeature;
                    if (feat === 'verified-only' && !t.isVerified && !t.hasIndustryStandards) return false;
                    if (feat === 'with-facial' && !String(t.services || '').toLowerCase().includes('facial')) return false;
                    if (feat === 'highly-rated' && parseFloat(t.averageRating || '0') < 4.5) return false;
                    if (feat === 'home-service' && !t.homeService && !t.mobileService) return false;
                    if (['coin-rub','body-scrub','hot-stones','aromatherapy','deep-pressure'].includes(feat)) {
                        const str = String(t.services || t.specialties || '').toLowerCase();
                        const key = feat === 'coin-rub' ? 'coin' : feat === 'body-scrub' ? 'scrub' : feat === 'hot-stones' ? 'hot stone' : feat === 'aromatherapy' ? 'aroma' : 'deep';
                        if (!str.includes(key)) return false;
                    }
                }
                const price = parseInt(t.price || t.basePrice || t.hourlyRate || '0');
                if (price > 0 && (price < priceRange[0] || price > priceRange[1])) return false;
                return true;
            });
        }
        if (loggedInProvider && loggedInProvider.type === 'therapist') {
            const alreadyIncluded = baseList.some((t: any) => String(t.id) === String(loggedInProvider.id) || String(t.$id) === String(loggedInProvider.id));
            if (!alreadyIncluded) {
                const ownerDoc = safeTherapists.find((t: any) => String(t.id) === String(loggedInProvider.id) || String(t.$id) === String(loggedInProvider.id));
                if (ownerDoc) {
                    let includeOwner = selectedCity === 'all';
                    if (!includeOwner && ownerDoc.coordinates && currentUserLocation) {
                        const coords = typeof ownerDoc.coordinates === 'object' ? ownerDoc.coordinates : (() => { try { return JSON.parse(ownerDoc.coordinates); } catch { return null; } })();
                        if (coords?.lat != null && coords?.lng != null) {
                            includeOwner = calculateHaversineDistance(currentUserLocation, { lat: coords.lat, lng: coords.lng }) <= 10;
                        }
                    }
                    if (includeOwner) baseList = [ownerDoc, ...baseList];
                }
            }
        }
        if (selectedCity !== 'all') {
            const realTherapistsInCity = baseList.filter((t: any) => !isFeaturedSample(t, 'therapist'));
            if (realTherapistsInCity.length === 0) {
                const showcaseProfiles = getYogyakartaShowcaseProfiles(safeTherapists, selectedCity);
                if (showcaseProfiles.length > 0) baseList = [...baseList, ...showcaseProfiles];
            }
        }
        // When optional filters (female-only, area, price, etc.) remove everyone but city has therapists, show full city list so we never show "60" then 0 cards
        if (baseList.length === 0 && safeInput.length > 0) {
            baseList = therapistsWithDistance.slice();
        }
        const getPriorityScore = (therapist: any) => {
            let score = 0;
            const status = String(therapist.status || '').toLowerCase();
            if (status === 'available' || status === 'online') score += 10000;
            else if (status === 'busy') score += 5000;
            if (therapist.isPremium || therapist.accountType === 'premium') score += 500;
            if (therapist.isVerified || therapist.hasIndustryStandards || therapist.certifications?.length > 0) score += 300;
            const lastActivity = therapist.lastSeen || therapist.$updatedAt || therapist.updatedAt;
            if (lastActivity) {
                const hoursAgo = (new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60);
                if (hoursAgo <= 1) score += 200; else if (hoursAgo <= 6) score += 150; else if (hoursAgo <= 24) score += 100; else if (hoursAgo <= 72) score += 50; else if (hoursAgo <= 168) score += 25;
            }
            score -= Math.min(500, (therapist.missedBookingsCount ?? therapist.missedBookings ?? 0) * 100);
            const rating = parseFloat(therapist.averageRating || '0');
            if (rating >= 4.5) score += 100; else if (rating >= 4.0) score += 75; else if (rating >= 3.5) score += 50;
            const orders = parseInt(therapist.orderCount || '0');
            if (orders >= 50) score += 50; else if (orders >= 20) score += 30; else if (orders >= 10) score += 20;
            return score;
        };
        baseList = applyDisplayStatusToTherapists(baseList);
        baseList = baseList.map((t: any) => ({ ...t, status: t.display_status ?? t.status, availability: t.display_status ?? t.availability }));
        baseList = baseList.map(therapist => {
            const status = String(therapist.status || '').toLowerCase();
            if (status === 'offline' || status === '') return { ...therapist, status: therapist.display_status || 'Busy' };
            return therapist;
        });
        baseList = baseList.slice()
            .map(therapist => ({ ...therapist, priorityScore: getPriorityScore(therapist), randomSeed: Math.random() }))
            .sort((a: any, b: any) => {
                if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
                if (currentUserLocation && a._distance != null && b._distance != null && a._distance !== b._distance) return a._distance - b._distance;
                const priceA = parseFloat(a.price) || parseFloat(a.basePrice) || 999999;
                const priceB = parseFloat(b.price) || parseFloat(b.basePrice) || 999999;
                if (priceA !== priceB) return priceA - priceB;
                return a.randomSeed - b.randomSeed;
            });
        const preparedTherapists = baseList.map((therapist: any) => {
            let displayLocation = therapist.location, displayCity = therapist.city;
            if (isFeaturedSample(therapist, 'therapist') && selectedCity !== 'all') { displayLocation = selectedCity; displayCity = selectedCity; }
            return { ...therapist, location: displayLocation, city: displayCity };
        });
        // No cap: show all therapists with location for the selected city
        const therapistsToRender = preparedTherapists;
        const therapistsByLocation: { [key: string]: any[] } = {};
        therapistsToRender.forEach((therapist: any) => {
            const area = therapist._locationArea || 'Unknown';
            if (!therapistsByLocation[area]) therapistsByLocation[area] = [];
            therapistsByLocation[area].push(therapist);
        });
        const locationAreas = Object.keys(therapistsByLocation).sort();
        const noTherapistsToShow = baseList.length === 0;
        return { therapistsToRender, therapistsByLocation, locationAreas, noTherapistsToShow };
    }, [cityFilteredTherapists, isDev, devLocationOverride, autoDetectedLocation, userLocation, adminViewArea, selectedCity, bypassRadiusForAdmin, hasAdminPrivileges, showFemaleOnly, selectedArea, selectedTherapistGender, selectedServiceFor, effectiveMassageType, selectedSpecialFeature, priceRange, loggedInProvider, safeTherapists]);

    // Rating modal handlers removed for design mock

    // SEO: Add Schema.org structured data for LocalBusiness and AggregateRating
    useEffect(() => {
        const list = Array.isArray(therapists) ? therapists : [];
        const therapistsWithRatings = list.filter(t => t.rating && t.rating > 0);
        const avgRating = therapistsWithRatings.length > 0 
            ? therapistsWithRatings.reduce((sum, t) => sum + t.rating, 0) / therapistsWithRatings.length 
            : 4.8;
        const reviewCount = list.reduce((sum, t) => sum + (t.reviewCount || 0), 0) || 500;

        const schema = {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "IndaStreet Massage",
            "image": "https://ik.imagekit.io/7grri5v7d/Massage%20hub%20indastreet.png",
            "url": "https://www.indastreetmassage.com",
            "telephone": "+62-812-3456-7890",
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "Indonesia",
                "addressLocality": "Multiple Cities",
                "addressRegion": "Indonesia"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": -8.4095,
                "longitude": 115.1889
            },
            "priceRange": "$$",
            "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "00:00",
                "closes": "23:59"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": avgRating.toFixed(1),
                "reviewCount": reviewCount,
                "bestRating": "5",
                "worstRating": "1"
            },
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.indastreetmassage.com/search?q={search_term}",
                "query-input": "required name=search_term"
            },
            "sameAs": [
                "https://www.facebook.com/share/g/1C2QCPTp62/",
                "https://www.instagram.com/indastreet",
                "https://www.instagram.com/indastreet.id/"
            ]
        };

        // Inject schema into document head
        const scriptId = 'homepage-schema';
        let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
        
        if (!scriptTag) {
            scriptTag = document.createElement('script') as HTMLScriptElement;
            scriptTag.id = scriptId;
            scriptTag.type = 'application/ld+json';
            document.head.appendChild(scriptTag);
        }
        
        scriptTag.textContent = JSON.stringify(schema);

        return () => {
            // Cleanup on unmount
            const tag = document.getElementById(scriptId);
            if (tag) {
                tag.remove();
            }
        };
    }, [therapists]);

    // ...existing code...

    // Removed unused renderTherapists

    // Removed unused renderPlaces

    if (!hasConfirmedCity) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-sm w-full bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Set your location to continue
                    </h2>
                    <p className="text-sm text-gray-600 mb-5">
                        Choose your city or use GPS on the landing page so we can show therapists near you.
                    </p>
                    <button
                        onClick={() => {
                            if (onNavigate) {
                                onNavigate('landing');
                            } else if (typeof window !== 'undefined' && (window as any).setPage) {
                                (window as any).setPage('landing');
                            }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
                    >
                        Set Location
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="home-page-container scrollable min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 w-full max-w-full ">
            <PageNumberBadge pageNumber={2} pageName="HomePage" isLocked={false} />
            {/* Flying Butterfly Animation */}
            <FlyingButterfly />
            
            {/* Universal Header */}
            <UniversalHeader 
                language={language}
                onLanguageChange={onLanguageChange as (lang: string) => void}
                onMenuClick={() => {
                    logger.debug('UniversalHeader burger menu clicked in HomePage');
                    setIsMenuOpen(true);
                }}
            />

            {/* Global App Drawer - Chrome Safe Rendering */}
            <React19SafeWrapper condition={isMenuOpen}>
                <AppDrawer
                    isHome={true}
                    isOpen={isMenuOpen}
                    onClose={() => {
                        try {
                            logger.debug('AppDrawer onClose called');
                            setIsMenuOpen(false);
                        } catch (e) {
                            logger.error('AppDrawer onClose error', e);
                        }
                    }}
                    t={translationsObject}
                    language={language}
                    onMassageJobsClick={onMassageJobsClick}
                    onHotelPortalClick={onHotelPortalClick}
                    onVillaPortalClick={onVillaPortalClick}
                    onTherapistPortalClick={onTherapistPortalClick}
                    onMassagePlacePortalClick={onMassagePlacePortalClick}
                    onFacialPortalClick={onFacialPortalClick}
                    onAgentPortalClick={onAgentPortalClick}
                    onCustomerPortalClick={onCustomerPortalClick}
                    onAdminPortalClick={onAdminPortalClick}
                    onNavigate={onNavigate}
                    onTermsClick={onTermsClick}
                    onPrivacyClick={onPrivacyClick}
                    onQRCodeClick={() => onNavigate && onNavigate('qr-code')}
                    onLoginClick={onLoginClick}
                    therapists={therapists}
                    places={places}
                />
            </React19SafeWrapper>

            {/* Fixed Hero Section - Always Visible */}
            <div className="bg-white sticky top-[60px] z-10">
                <PageContainer className="px-0 sm:px-0 pt-0 pb-3">
                    {/* Location Display */}
                    {(userLocation || userLocationForMatching) && (
                        <div className="bg-white flex flex-col items-center gap-0.5 pt-4 pb-3">
                            <div className="flex items-center justify-center gap-2">
                                {userLocation && <MusicPlayer autoPlay={true} />}
                                <svg
                                    className="w-4 h-4 text-gray-700"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-lg font-bold text-gray-900">
                                    {displayCityName}
                                </span>
                            </div>
                            <p className="text-base font-semibold text-gray-600">{country}'s {(activeTab === 'facials' || activeTab === 'facial-places') ? 'Facial' : 'Massage'} Therapist Hub</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {(selectedCity || contextCity) && (selectedCity || contextCity) !== 'all'
                                    ? `Showing ${therapistDisplay.therapistsToRender.length} therapist${therapistDisplay.therapistsToRender.length === 1 ? '' : 's'} in ${getLocationDisplayName(selectedCity || contextCity, translationsObject?.home?.allAreas ?? 'All areas')}.`
                                    : (distanceMatchCount > 0
                                        ? `Showing ${distanceMatchCount} therapist${distanceMatchCount === 1 ? '' : 's'} in your area.`
                                        : 'Showing trusted therapists across the city.')}
                            </p>
                        </div>
                    )}

                    {/* Tab bar: 2 tabs only – Massage mode: "Home Massage" | "Massage Places" ; Facial mode: "Home Facial" | "Facial Places" */}
                    {(() => {
                        const isFacialMode = activeTab === 'facials' || activeTab === 'facial-places';
                        return (
                            <div className="flex bg-gray-200 rounded-full p-1 max-w-2xl mx-auto overflow-x-auto">
                                {!isFacialMode ? (
                                    <>
                                        <button
                                            onClick={() => setActiveTab('home')}
                                            className={`flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-full flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold transition-colors duration-300 min-h-[42px] ${activeTab === 'home' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            <HomeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">Home Massage</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('places')}
                                            className={`flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-full flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold transition-colors duration-300 min-h-[42px] ${activeTab === 'places' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">Massage Places</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setActiveTab('facials')}
                                            className={`flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-full flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold transition-colors duration-300 min-h-[42px] ${activeTab === 'facials' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">Home Facial</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('facial-places')}
                                            className={`flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-full flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold transition-colors duration-300 min-h-[42px] ${activeTab === 'facial-places' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">Facial Places</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        );
                    })()}

                    {/*  ADMIN/PREVIEW MODE BANNER */}
                    {(previewTherapistId || (adminViewArea && bypassRadiusForAdmin)) && hasAdminPrivileges && (
                        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 max-w-2xl mx-auto mt-4">
                            <div className="font-bold text-yellow-800 mb-1">🔐 Admin Mode Active</div>
                            <div className="text-sm text-yellow-700">
                                {previewTherapistId && <div>• Preview Mode: Showing therapist ID {previewTherapistId} (bypassing 10km radius)</div>}
                                {adminViewArea && bypassRadiusForAdmin && <div>• Area View: Showing all therapists in {adminViewArea} (radius bypass)</div>}
                                <div className="mt-1 text-xs">This mode is only visible to admins/therapists</div>
                            </div>
                        </div>
                    )}

                    {/* Row: Massage (left) | Location dropdown (center) | Facial (right) */}
                    <div className="max-w-2xl mx-auto mt-4">
                        <div className="flex flex-row gap-2 sm:gap-3 items-center min-h-[54px]">
                            {(() => {
                                const isFacialMode = activeTab === 'facials' || activeTab === 'facial-places';
                                return (
                                    <>
                                        <button
                                            onClick={() => setActiveTab('home')}
                                            title={t?.home?.massage ?? 'Home massage & massage places'}
                                            aria-label="Massage"
                                            className={`flex-1 min-w-0 h-[42px] px-2 rounded-full font-semibold text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors border ${!isFacialMode ? 'bg-orange-500 text-white border-orange-500 shadow' : 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300'}`}
                                        >
                                            <HomeIcon className="w-4 h-4 flex-shrink-0" />
                                            <span className="whitespace-nowrap">{t?.home?.massage ?? 'Massage'}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowLocationSelectPopup(true)}
                                            title={getLocationDisplayName(contextCity ?? null, t?.home?.allAreas ?? 'All areas')}
                                            aria-label={t?.home?.changeCity || 'Select location'}
                                            className="flex-shrink-0 w-[54px] h-[54px] rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-500 hover:bg-orange-100 transition-colors shadow-sm"
                                        >
                                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('facials')}
                                            title={t?.home?.facialHomeService ?? 'Facial & Skin Clinic'}
                                            aria-label="Facial"
                                            className={`flex-1 min-w-0 h-[42px] px-2 rounded-full font-semibold text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors border ${isFacialMode ? 'bg-orange-500 text-white border-orange-500 shadow' : 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300'}`}
                                        >
                                            <Sparkles className="w-4 h-4 flex-shrink-0" />
                                            <span className="whitespace-nowrap truncate min-w-0">{t?.home?.facialHomeService || t?.home?.facial || 'Facial'}</span>
                                        </button>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </PageContainer>
            </div>
            
            {/* Scrollable Content Area */}
            <main className="w-full max-w-full ">
            <PageContainer className="px-3 sm:px-4 pt-8 pb-24">
                {/* Content changes based on active tab */}
                {activeTab === 'home' && (
                    <div className="max-w-full  pb-8">
                        <div className="mb-3 text-center mt-[26px]">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{t?.home?.therapistsTitle || 'Home Service Therapists'}</h3>
                            <p className="text-gray-600">
                                {(contextCity === 'all' || !contextCity)
                                    ? (t?.home?.therapistsSubtitleAll || 'We monitor provider locations and user activity to ensure a safe platform for everyone.')
                                    : (t?.home?.therapistsSubtitleCity?.replace('{city}', getLocationDisplayName(contextCity ?? null, t?.home?.allAreas ?? 'All areas')) || 'We monitor provider locations and user activity to ensure a safe platform for everyone.')
                                }
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {t?.home?.browseRegionNote || 'Browse Region dropdown (distance still applies)'}
                            </p>
                            {(selectedCity || contextCity) && (selectedCity || contextCity) !== 'all' && (
                                <>
                                    <p className="text-sm font-medium text-gray-700 mt-2" data-testid="therapist-city-count">
                                        Showing {therapistDisplay.therapistsToRender.length} therapist{therapistDisplay.therapistsToRender.length === 1 ? '' : 's'} in {getLocationDisplayName(selectedCity || contextCity, t?.home?.allAreas ?? 'All areas')}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5" data-testid="therapist-city-total-vs-shown">
                                        {Array.isArray(cityFilteredTherapists) ? cityFilteredTherapists.length : 0} therapist{(Array.isArray(cityFilteredTherapists) ? cityFilteredTherapists.length : 0) === 1 ? '' : 's'} with location for this city · all shown on this page
                                    </p>
                                </>
                            )}
                        </div>
                        
                        <div className="space-y-3 max-w-full overflow-hidden">
                        {/* Build list from single source of truth (therapistDisplay); header count = therapistsToRender.length */}
                        {(() => {
                            const d = therapistDisplay;
                            return (
                                <>
                                {d.locationAreas.map((area) => {
                                    const therapistsInArea = d.therapistsByLocation[area];
                                    return (
                                        <div key={`area-${area}`} className="mb-8">
                                            {/* Therapist Cards in This Area */}
                                            {therapistsInArea.map((therapist: any, index: number) => {
                                                const isFakePlaceholder = therapist._isPlaceholder && String(therapist.$id || therapist.id || '').startsWith('placeholder-');
                                                if (therapist._isPlaceholder && isFakePlaceholder) {
                                                    return (
                                                        <div key={therapist.$id || therapist.id} className="mb-8">
                                                            <PlaceholderTherapistCard
                                                                cityName={displayCityName}
                                                                description={(therapist as any).description}
                                                                onRequest={() => onNavigate?.('contact')}
                                                                onTherapistPortalClick={onTherapistPortalClick}
                                                            />
                                                        </div>
                                                    );
                                                }
                                // 🌐 Enhanced Debug: Comprehensive therapist data analysis
                                // Parse languages safely - handle both JSON arrays and comma-separated strings
                                let languagesParsed: string[] = [];
                                try {
                                    if (therapist.languages) {
                                        // Try parsing as JSON first
                                        languagesParsed = JSON.parse(therapist.languages);
                                    }
                                } catch (e) {
                                    // If JSON parse fails, treat as comma-separated string
                                    languagesParsed = therapist.languages ? therapist.languages.split(',').map((lang: string) => lang.trim()) : [];
                                }
                                
                                // Debug in development mode (reduced verbosity)
                                if (process.env.NODE_ENV === 'development' && therapist.name?.toLowerCase().includes('budi')) {
                                    logger.debug(`HomePage → ${therapist.name}`, { 
                                        languages: therapist.languages, 
                                        isLive: therapist.isLive 
                                    });
                                }
                                
                                // Real discount data - check if therapist has active discount
                                const realDiscount = (therapist.discountPercentage && therapist.discountPercentage > 0 && therapist.discountEndTime) ? {
                                    percentage: therapist.discountPercentage,
                                    expiresAt: new Date(therapist.discountEndTime)
                                } : null;
                                
                                // 🔍 Check if this is the previewed therapist
                                const isPreviewMode = previewTherapistId && (String(therapist.$id) === String(previewTherapistId) || String(therapist.id) === String(previewTherapistId));
                                
                                return (
                                <div key={therapist.$id || therapist.id}>
                                {/* 🔍 Preview Mode Banner */}
                                {isPreviewMode && (
                                    <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-2 mb-2 text-center">
                                        <span className="text-blue-700 font-semibold text-sm">
                                            🔍 Preview Mode - Showing outside 10km radius
                                        </span>
                                    </div>
                                )}
                                <div className={isPreviewMode ? 'ring-4 ring-blue-400 rounded-lg' : ''}>
                                <TherapistHomeCard
                                    therapist={therapist}
                                    userLocation={autoDetectedLocation || (userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null)}
                                    readOnly={readOnly}
                                    selectedCity={selectedCity}
                                    t={t}
                                    avatarOffsetPx={8}
                                    // 🚀 PERFORMANCE: Pass prefetched data to eliminate N+1 queries (prefetchedData always has menus/shareLinks)
                                    prefetchedMenu={prefetchedData.menus.get(String(therapist.$id || therapist.id))}
                                    prefetchedShareLink={prefetchedData.shareLinks.get(String(therapist.$id || therapist.id))}
                                    onClick={(selectedTherapist) => {
                                        logger.debug('TherapistHomeCard onClick', { selectedCity });
                                        // Set selected therapist and navigate to profile page with URL update
                                        onSelectTherapist?.(selectedTherapist);
                                        const therapistId = selectedTherapist.id || selectedTherapist.$id;
                                        const slug = selectedTherapist.name?.toLowerCase().replace(/\s+/g, '-') || 'therapist';
                                        const profileUrl = `/profile/therapist/${therapistId}-${slug}`;
                                        window.history.pushState({}, '', profileUrl);
                                        onNavigate?.('therapist-profile');
                                    }}
                                    onNavigate={onNavigate}
                                    onIncrementAnalytics={(metric) => onIncrementAnalytics(therapist.id || therapist.$id, 'therapist', metric)}
                                />
                                </div>
                                {/* Accommodation Massage Service Link */}
                                <div className="mt-2 mb-8 flex justify-center">
                                    <button
                                        onClick={() => onNavigate?.('indastreet-partners')}
                                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        <span className="font-medium">{translationsObject?.home?.accommodationMassageService || 'Accommodation With Massage Service'}</span>
                                    </button>
                                </div>
                                </div>
                                );
                            })}
                                        </div>
                                    );
                                })}
                                    {d.noTherapistsToShow && (
                                        <div className="text-center py-12 bg-white rounded-lg">
                                            <p className="text-gray-500">{translationsObject?.home?.noTherapistsAvailable ?? 'No therapists are available right now.'}</p>
                                            {(selectedCity || contextCity) && (selectedCity || contextCity) !== 'all' && (
                                                <p className="text-gray-400 text-sm mt-2">
                                                    Showing therapists in your selected region
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </>
                            );
                        })()}

                        </div>
                    </div>
                )}

                {/* Rating Modal */}
                {showRatingModal && selectedRatingItem && (
                    <RatingModal
                        onClose={handleCloseRatingModal}
                        onSubmit={handleSubmitReview}
                        itemName={selectedRatingItem.item.name}
                        itemType={selectedRatingItem.type}
                        itemId={selectedRatingItem.item.id || (selectedRatingItem.item as any).$id}
                        t={{
                            title: translationsObject.ratingModal?.title || 'Rate {itemName}',
                            prompt: translationsObject.ratingModal?.prompt || 'How was your experience?',
                            whatsappLabel: translationsObject.ratingModal?.whatsappLabel || 'WhatsApp Number',
                            whatsappPlaceholder: translationsObject.ratingModal?.whatsappPlaceholder || 'Enter your WhatsApp number',
                            submitButton: translationsObject.ratingModal?.submitButton || 'Submit Review',
                            selectRatingError: translationsObject.ratingModal?.selectRatingError || 'Please select a rating',
                            whatsappRequiredError: translationsObject.ratingModal?.whatsappRequiredError || 'WhatsApp number is required',
                            confirmationV2: translationsObject.ratingModal?.confirmationV2 || 'Thank you for your review! It will be visible once approved by admin.'
                        }}
                    />
                )}

                {activeTab === 'places' && (
                    <div className="max-w-full ">
                        <div className="mb-3 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{t?.home?.massagePlacesTitle || 'Featured Massage Spas'}</h3>
                            <p className="text-gray-600">
                                {selectedCity === 'all' 
                                    ? 'Find the best massage places across Indonesia'
                                    : `Find the best massage places in ${selectedCity}`
                                }
                            </p>
                        </div>
                        
                        {/* Show places from Appwrite */}
                        {(() => {
                            // Dev summary (avoid logging full objects to prevent console slowdowns)
                            try {
                                const total = places?.length ?? 0;
                                const live = places ? places.filter((p: any) => p.isLive).length : 0;
                                logger.debug('Massage Places Tab', { total, live });
                            } catch {}
                            
                            // Use city-filtered places; when effectiveMassageType is set (from Massage Types page), only show places that offer it
                            let livePlaces = cityFilteredPlaces.slice();
                            if (effectiveMassageType) {
                                livePlaces = livePlaces.filter((p: any) => {
                                    const types = parseMassageTypes((p as any).massageTypes ?? (p as any).massagetypes);
                                    return types.some((t: string) => t === effectiveMassageType || t.trim() === effectiveMassageType);
                                });
                            }

                            // Sort places by status: Available/Open → Busy → Offline/Closed
                            const getPlaceStatusScore = (p: any) => {
                                const status = String(p.status || '').toLowerCase();
                                
                                // Check if place is open now
                                let isOpen = false;
                                try {
                                    if (p.openingTime && p.closingTime) {
                                        const now = new Date();
                                        const [oh, om] = String(p.openingTime).split(':').map(Number);
                                        const [ch, cm] = String(p.closingTime).split(':').map(Number);
                                        const current = now.getHours() * 60 + now.getMinutes();
                                        const openM = (oh || 0) * 60 + (om || 0);
                                        const closeM = (ch || 0) * 60 + (cm || 0);
                                        if (closeM >= openM) {
                                            isOpen = current >= openM && current <= closeM;
                                        } else {
                                            isOpen = current >= openM || current <= closeM;
                                        }
                                    }
                                } catch {}
                                
                                // Priority scoring: Available/Open first, Busy second, Offline/Closed last
                                if (status === 'available' || status === 'online' || isOpen) {
                                    return 10000; // Available/Open first
                                } else if (status === 'busy') {
                                    return 5000;  // Busy second
                                } else {
                                    return 0;     // Offline/Closed last
                                }
                            };
                            livePlaces.sort((a, b) => getPlaceStatusScore(b) - getPlaceStatusScore(a));
                            
                            if (livePlaces.length === 0) {
                                return (
                                    <div className="text-center py-12">
                                        <div className="mb-4">
                                            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 mb-2 text-lg font-semibold">{t?.home?.noPlacesAvailable || 'Tidak ada tempat pijat tersedia di area Anda'}</p>
                                        <p className="text-sm text-gray-400">Check back soon for featured spas!</p>
                                        {(selectedCity || contextCity) && (selectedCity || contextCity) !== 'all' && (
                                            <p className="text-xs text-gray-300 mt-2">
                                                Showing places in your selected region
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-300 mt-4">Total places in DB: {places?.length || 0} | Nearby: {nearbyPlaces.length} | Live: {livePlaces.length}</p>
                                    </div>
                                );
                            }
                            
                            return (
                                <div className="space-y-4 max-w-full overflow-hidden">
                                    {livePlaces
                                        .map((place, index) => {
                                            const placeId = place.id || (place as any).$id;
                                            
                                            return (
                                                <React.Fragment key={placeId}>
                                                <MassagePlaceHomeCard
                                                    place={place}
                                                    onClick={(p) => {
                                                        logger.debug('Homepage place card clicked', {
                                                            placeId: p.id || p.$id,
                                                            placeName: p.name
                                                        });
                                                        // Set selected place first (for AppRouter to access)
                                                        onSelectPlace(p);
                                                        
                                                        // Build URL with ID and slug
                                                        const placeId = p.id || p.$id;
                                                        const slug = p.name?.toLowerCase().replace(/\s+/g, '-') || 'place';
                                                        const profileUrl = `/profile/place/${placeId}-${slug}`;
                                                        logger.debug('Pushing place profile URL', { url: profileUrl });
                                                        window.history.pushState({}, '', profileUrl);
                                                        
                                                        // Note: onSelectPlace already triggers navigation to massage-place-profile
                                                        // via useNavigation.handleSetSelectedPlace
                                                    }}
                                                    onIncrementAnalytics={(metric) => onIncrementAnalytics(placeId, 'place', metric)}
                                                    userLocation={autoDetectedLocation || (userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null)}
                                                />
                                                {/* Accommodation Massage Service Link */}
                                                <div className="mt-2 mb-4 flex justify-center">
                                                    <button
                                                        onClick={() => onNavigate?.('indastreet-partners')}
                                                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                        </svg>
                                                        <span className="font-medium">{translationsObject?.home?.accommodationMassageService || 'Accommodation With Massage Service'}</span>
                                                    </button>
                                                </div>
                                                </React.Fragment>
                                            );
                                        })}
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* Home Facial / Facial Places - Show facial / skin clinic places */}
                {(activeTab === 'facials' || activeTab === 'facial-places') && (
                    <div className="max-w-full ">
                        <div className="mb-3 text-center mt-[26px]">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{t?.home?.facialTherapistsTitle || 'Home Service Facial'}</h3>
                            <p className="text-gray-600">
                                {(contextCity === 'all' || !contextCity)
                                    ? (t?.home?.facialTherapistsSubtitleAll || 'We monitor provider locations and user activity to ensure a safe platform for everyone.')
                                    : (t?.home?.facialTherapistsSubtitleCity?.replace('{city}', getLocationDisplayName(contextCity ?? null, t?.home?.allAreas ?? 'All areas')) || 'We monitor provider locations and user activity to ensure a safe platform for everyone.')
                                }
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {t?.home?.browseRegionNote || 'Browse Region dropdown (distance still applies)'}
                            </p>
                        </div>
                        
                        {/* Show facial places from Appwrite – same online status as therapist: Available, Busy, Offline; filter by isLive like therapists */}
                        {(() => {
                            const normalizedFacialStatus = (place: any) => String(place.availability || place.status || 'offline').trim().toLowerCase();
                            const facialStatusImpliesLive = (s: string) => s === 'available' || s === 'busy';
                            // Only hide if explicitly isLive false AND status offline/empty (same as therapist)
                            const isFacialPlaceVisible = (place: any) => {
                                if (isFeaturedSample(place, 'place')) return true;
                                const isLive = place.isLive !== false;
                                const status = normalizedFacialStatus(place);
                                if (isLive === false && (status === 'offline' || status === '')) return false;
                                return true;
                            };
                            const liveFacialPlaces = (facialPlaces?.filter((place: any) => {
                                if (!isFacialPlaceVisible(place)) return false;
                                // Always show featured sample places in ALL cities
                                if (isFeaturedSample(place, 'place')) {
                                    logger.debug(`Including featured place "${place.name}" in Facial Places tab for city "${selectedCity}"`);
                                    return true;
                                }
                                if (selectedCity === 'all') return true;
                                
                                // Try to match place location to selected city
                                if (place.coordinates) {
                                    // Handle both array [lng, lat] and object {lat, lng} formats
                                    const placeLocation = Array.isArray(place.coordinates)
                                        ? { lat: place.coordinates[1], lng: place.coordinates[0] }
                                        : { lat: place.coordinates.lat || 0, lng: place.coordinates.lng || 0 };
                                    const matchedCity = matchProviderToCity(placeLocation, 25);
                                    return matchedCity?.locationId === selectedCity;
                                }
                                
                                return false;
                            }) || []).slice();

                            // Sort facial places by status: same as therapist – Available → Busy → Offline
                            const getFacialPlaceStatusScore = (p: any) => {
                                const status = String(p.availability || p.status || 'offline').toLowerCase();
                                if (status === 'available' || status === 'online') {
                                    return 10000; // Available first
                                } else if (status === 'busy') {
                                    return 5000;  // Busy second
                                }
                                return 0; // Offline last
                            };
                            liveFacialPlaces.sort((a, b) => getFacialPlaceStatusScore(b) - getFacialPlaceStatusScore(a));

                            // OOM: Facial Places debug removed (was building facialPlaceNames array in render)
                            // When no places after filter, show mock facial home service card so user always sees at least one
                            const listToShow = liveFacialPlaces.length > 0 ? liveFacialPlaces : [MOCK_FACIAL_PLACE];

                            return (
                                <div className="space-y-4 max-w-full overflow-hidden">
                                    {listToShow
                                        .map((place: any) => {
                                            const placeId = place.id || place.$id;
                                            
                                            return (
                                                <FacialPlaceHomeCard
                                                    key={placeId}
                                                    place={place}
                                                    onClick={onSelectPlace}
                                                    onIncrementAnalytics={(metric) => onIncrementAnalytics(placeId, 'place', metric)}
                                                    userLocation={autoDetectedLocation || (userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null)}
                                                />
                                            );
                                        })}
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* ...existing code for therapists/places rendering, modals, etc. should follow here... */}
            </PageContainer>
            </main>
            
            {/* Rating modal removed for design mock */}

            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-8px);
                    }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                
                /* EMERGENCY FOOTER FIX - HIGHEST PRIORITY */
                footer[class*="fixed"] {
                    position: fixed !important;
                    bottom: 0px !important;
                    left: 0px !important;
                    right: 0px !important;
                    z-index: 99999 !important;
                    width: 100% !important;
                    transform: none !important;
                    transition: none !important;
                }
                
                /* SCROLL CONTAINER FIX */
                .scroll-container {
                    height: 100%;
                    overflow-y: auto;
                    overflow-x: hidden;
                }
                
                /* ENSURE PROPER BODY SCROLL */
                body {
                    overflow-x: hidden;
                }
                
                /* PREVENT HORIZONTAL SCROLL */
                * {
                    box-sizing: border-box;
                }
                
                /* MOBILE VIEWPORT FIX - PREVENT HORIZONTAL OVERFLOW */
                html, body {
                    max-width: 100%;
                    overflow-x: hidden;
                }
                
                main, section, div {
                    max-width: 100%;
                    overflow-x: hidden;
                }
                
                /* ENSURE IMAGES AND BUTTONS DON'T CAUSE OVERFLOW */
                img, button, select, input {
                    max-width: 100%;
                }
                
                /* FIX FLEX CONTAINERS ON MOBILE */
                .flex {
                    min-width: 0;
                }
            `}</style>
            
            {/* Directory footer: Brand */}
            <div className="mt-12 mb-6 flex flex-col items-center gap-2">
                <div className="font-bold text-lg">
                    <span className="text-black">Inda</span>
                    <span className="text-orange-500">Street</span>
                </div>
                {/* Social Media Icons */}
                <SocialMediaLinks className="mt-2" />

                {/* Quick Links for SEO */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-center text-lg font-bold text-gray-800 mb-4">Quick Links</h3>
                    <div className="flex flex-wrap justify-center gap-1 max-w-2xl mx-auto">
                        <button
                            onClick={() => onNavigate?.('massage-types')}
                            className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                        >
                            Massage Types
                        </button>
                        <button
                            onClick={() => onNavigate?.('facial-types')}
                            className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                        >
                            Facial Types
                        </button>
                        <button
                            onClick={() => onNavigate?.('therapist-signup')}
                            className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                        >
                            Join as a Therapist Today
                        </button>
                        <button
                            onClick={() => onNavigate?.('place-signup')}
                            className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                        >
                            Join Massage Place Today
                        </button>
                        <button
                            onClick={() => onNavigate?.('facial-place-signup')}
                            className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                        >
                            Join Facial Place Today
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Coming Soon Modal */}
            {showComingSoonModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-white text-xl font-bold">Coming Soon!</h2>
                                <button
                                    onClick={() => setShowComingSoonModal(false)}
                                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-xl p-2 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    {comingSoonSection} Section
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    We are currently updating this section. Check back soon for amazing {comingSoonSection.toLowerCase()} near you!
                                </p>
                                <p className="text-sm text-orange-600 font-semibold">
                                    🚧 Under Development - Live Site
                                </p>
                            </div>

                            <button
                                onClick={() => setShowComingSoonModal(false)}
                                className="w-full px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
                            >
                                Got It!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Frosted glass backdrop when menu is open */}
            {activeTab === 'home' && fabMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-[55] transition-all duration-300"
                    onClick={() => setFabMenuOpen(false)}
                />
            )}

            {/* Collapsible FAB Menu - Bottom Right - Homepage Only */}
            {activeTab === 'home' && (
                <>
                    {/* FAB Action Buttons - Fixed position above main button */}
                    {fabMenuOpen && (
                        <div className="fixed bottom-[140px] right-6 flex flex-col gap-3 z-[60] animate-slideUp pr-2">
                            {/* Advanced Search - Moved to top */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    (onNavigate || (window as any).setPage)?.('advanced-search');
                                    setFabMenuOpen(false);
                                }}
                                className="backdrop-blur-xl bg-black/70 hover:bg-black/80 shadow-2xl rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 hover:scale-105 border border-white/10 will-change-transform"
                                title={translationsObject?.home?.fabMenu?.advancedSearch || 'Advanced Search'}
                            >
                                <span className="text-xl">🔍</span>
                            </button>
                            
                            {/* Women Reviews */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    (onNavigate || (window as any).setPage)?.('women-reviews');
                                    setFabMenuOpen(false);
                                }}
                                className="backdrop-blur-xl bg-black/70 hover:bg-black/80 shadow-2xl rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 hover:scale-105 border border-white/10"
                                title={translationsObject?.home?.fabMenu?.womenReviews || 'Indastreet Reviews'}
                            >
                                <span className="text-xl">👩‍💼</span>
                            </button>
                            
                            {/* Help & FAQ */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    (onNavigate || (window as any).setPage)?.('help-faq');
                                    setFabMenuOpen(false);
                                }}
                                className="backdrop-blur-xl bg-black/70 hover:bg-black/80 shadow-2xl rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 hover:scale-105 border border-white/10"
                                title={translationsObject?.home?.fabMenu?.helpFaq || 'Help & FAQ'}
                            >
                                <span className="text-xl">❓</span>
                            </button>
                            
                            {/* Top 5 Therapists */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    (onNavigate || (window as any).setPage)?.('top-therapists');
                                    setFabMenuOpen(false);
                                }}
                                className="backdrop-blur-xl bg-black/70 hover:bg-black/80 shadow-2xl rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 hover:scale-105 border border-white/10"
                                title={translationsObject?.home?.fabMenu?.topTherapists || 'Top 5 Therapists'}
                            >
                                <span className="text-xl">🏆</span>
                            </button>
                            
                            {/* Special Offers */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    (onNavigate || (window as any).setPage)?.('special-offers');
                                    setFabMenuOpen(false);
                                }}
                                className="backdrop-blur-xl bg-black/70 hover:bg-black/80 shadow-2xl rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 hover:scale-105 border border-white/10"
                                title={translationsObject?.home?.fabMenu?.specialOffers || 'Special Offers'}
                            >
                                <span className="text-xl">⭐</span>
                            </button>
                            
                            {/* Video Center */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    (onNavigate || (window as any).setPage)?.('video-center');
                                    setFabMenuOpen(false);
                                }}
                                className="backdrop-blur-xl bg-black/70 hover:bg-black/80 shadow-2xl rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 hover:scale-105 border border-white/10"
                                title={translationsObject?.home?.fabMenu?.videoCenter || 'Video Center'}
                            >
                                <span className="text-xl">🎥</span>
                            </button>
                        </div>
                    )}
                    
                    {/* Main FAB Button */}
                    <div className="fixed bottom-20 right-6 z-[60] pr-2 pb-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            logger.debug('FAB button clicked', { currentState: fabMenuOpen });
                            setFabMenuOpen(!fabMenuOpen);
                        }}
                        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 will-change-transform ${
                            fabMenuOpen 
                                ? 'bg-orange-600 hover:bg-orange-700' 
                                : 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 scale-100 hover:scale-110'
                        }`}
                        title={fabMenuOpen 
                            ? (translationsObject?.home?.fabMenu?.close || 'Close') 
                            : (translationsObject?.home?.fabMenu?.openMenu || 'Quick Actions')
                        }
                    >
                        <svg 
                            className={`w-6 h-6 text-white transition-transform duration-300 ${fabMenuOpen ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                    </div>
                </>
            )}

            {/* Location select popup - round hero button opens this; select city then closes and updates location */}
            {showLocationSelectPopup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowLocationSelectPopup(false)} role="dialog" aria-modal="true" aria-label={t?.home?.changeCity || 'Select location'}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col overflow-hidden border border-orange-100 ring-1 ring-orange-200/50" onClick={e => e.stopPropagation()}>
                        {/* Header with orange accent bar */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50/50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-8 rounded-full bg-orange-500 flex-shrink-0" aria-hidden />
                                <h3 className="text-lg font-semibold text-gray-900">{t?.home?.changeCity || 'Select location'}</h3>
                            </div>
                            <button type="button" onClick={() => setShowLocationSelectPopup(false)} className="p-2 rounded-full text-gray-500 hover:bg-orange-50 hover:text-orange-600 transition-colors" aria-label="Close">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-3 sm:p-4">
                            {/* You are viewing - current location */}
                            <div className="mb-4 p-4 rounded-xl bg-orange-50 border border-orange-200 ring-1 ring-orange-100">
                                <p className="text-xs font-semibold text-orange-600/90 uppercase tracking-wider mb-1">{t?.home?.youAreViewing ?? 'You are viewing'}</p>
                                <p className="text-base font-semibold text-gray-900">{getLocationDisplayName(contextCity ?? null, t?.home?.allAreas ?? 'All areas')}</p>
                            </div>
                            {/* Change location - options list */}
                            <p className="text-xs font-semibold text-orange-600/90 uppercase tracking-wider mb-3 px-1">{t?.home?.changeLocation ?? 'Change location'}</p>
                            <button
                                type="button"
                                onClick={() => {
                                    if (typeof window !== 'undefined' && window.localStorage) {
                                        window.localStorage.setItem('user_city_id', 'all');
                                        window.localStorage.setItem('user_city_name', 'all');
                                    }
                                    setContextCity('all');
                                    setSelectedCity('all');
                                    setShowLocationSelectPopup(false);
                                }}
                                className={`w-full text-left px-4 py-3.5 rounded-xl font-medium transition-all ${(contextCity === 'all' || !contextCity) ? 'bg-orange-50 text-orange-800 ring-1 ring-orange-200 shadow-sm' : 'text-gray-700 hover:bg-orange-50/50 hover:ring-1 hover:ring-orange-100'}`}
                            >
                                {t?.home?.allAreas ?? 'All areas'}
                            </button>
                            {INDONESIAN_CITIES_CATEGORIZED.map((cat) => (
                                <div key={cat.category} className="mt-4">
                                    <div className="px-3 py-1.5 text-xs font-semibold text-orange-600/90 uppercase tracking-wider border-l-2 border-orange-400 mb-1">{cat.category}</div>
                                    {cat.cities.map((city) => (
                                        <button
                                            key={city.locationId}
                                            type="button"
                                            onClick={() => {
                                                if (typeof window !== 'undefined' && window.localStorage) {
                                                    window.localStorage.setItem('user_city_id', city.locationId);
                                                    window.localStorage.setItem('user_city_name', city.name || city.locationId);
                                                }
                                                setContextCity(city.locationId);
                                                setSelectedCity(city.locationId);
                                                setShowLocationSelectPopup(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${contextCity === city.locationId ? 'bg-orange-50 text-orange-800 ring-1 ring-orange-200 shadow-sm' : 'text-gray-700 hover:bg-orange-50/50 hover:ring-1 hover:ring-orange-100'}`}
                                        >
                                            {city.name}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Chat Window - hidden when in-app booking disabled */}
            {!APP_CONFIG.IN_APP_BOOKING_DISABLED && (
                <FloatingChatWindow
                    userId={loggedInCustomer?.$id || loggedInCustomer?.id || user?.id || 'guest'}
                    userName={loggedInCustomer?.name || loggedInCustomer?.username || user?.name || 'Guest User'}
                    userRole="customer"
                />
            )}

            {/* PWA Install Banner - Fixed positioning for mobile */}
            <div className="pwa-install-banner mobile-safe-area">
                <PWAInstallBanner />
            </div>
        </div>
    );
};

export default HomePage;









