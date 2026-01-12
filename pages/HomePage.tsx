import React, { useState, useEffect, useRef } from 'react';
import type { User, UserLocation, Agent, Place, Therapist, Analytics, UserCoins } from '../types';
import TherapistHomeCard from '../components/TherapistHomeCard';
import MassagePlaceHomeCard from '../components/MassagePlaceHomeCard';
import FacialPlaceHomeCard from '../components/FacialPlaceHomeCard';
import RatingModal from '../components/RatingModal';
// Removed MASSAGE_TYPES_CATEGORIZED import - now using city-based filtering
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import PageContainer from '../components/layout/PageContainer';
import { customLinksService, reviewService } from '../lib/appwriteService';
import { AppDrawer } from '../components/AppDrawerClean';
import { Users, Building, Sparkles } from 'lucide-react';
import SocialMediaLinks from '../components/SocialMediaLinks';
import HomeIcon from '../components/icons/HomeIcon';
import FlyingButterfly from '../components/FlyingButterfly';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import CityLocationDropdown from '../components/CityLocationDropdown';
import PageNumberBadge from '../components/PageNumberBadge';
import { initializeGoogleMaps, loadGoogleMapsScript } from '../lib/appwrite.config';
import MusicPlayer from '../components/MusicPlayer';
import UniversalHeader from '../components/shared/UniversalHeader';
import { FloatingChatWindow } from '../chat';
import { getStoredGoogleMapsApiKey } from '../utils/appConfig';
import { matchProviderToCity } from '../constants/indonesianCities';
import { matchesLocation } from '../utils/locationNormalization';
import { INDONESIAN_CITIES_CATEGORIZED } from '../constants/indonesianCities';
import PWAInstallBanner from '../components/PWAInstallBanner';

// Custom hooks for logic extraction
import { useHomePageState } from '../hooks/useHomePageState';
import { useHomePageLocation } from '../hooks/useHomePageLocation';
import { useHomePageAdmin } from '../hooks/useHomePageAdmin';
import { useHomePageTranslations } from '../hooks/useHomePageTranslations';


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
}



// Icon used in massage type filter
const ChevronDownIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

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
    language
}) => {
    // 🚨 CRITICAL ROUTE GUARD - HomePage must ONLY render on home page
    // Use the page prop from the routing system instead of React Router DOM
    // This prevents HomePage from rendering on therapist profile routes and causing permission errors
    if (page !== 'home' && page !== 'landing') {
        console.warn('🚫 HomePage: Blocked render outside home route. Current page:', page);
        return null;
    }
    
    console.log('🔍 [STAGE 4 - HomePage] Component rendering');
    console.log('🔍 [STAGE 4] Therapists prop received:', therapists?.length || 0);
    console.log('🔍 [STAGE 4] First 3 therapist names:', therapists?.slice(0, 3).map(t => t.name) || []);
    
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
    
    // Female therapist filter state
    const [showFemaleOnly, setShowFemaleOnly] = useState(false);
    
    // FAB menu state
    const [fabMenuOpen, setFabMenuOpen] = useState(false);
    const [showWomenReviews, setShowWomenReviews] = useState(false);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [showHelpFaq, setShowHelpFaq] = useState(false);
    const [showTopTherapists, setShowTopTherapists] = useState(false);
    const [showSpecialOffers, setShowSpecialOffers] = useState(false);
    
    // Special Offers Modal States
    const [selectedOffer, setSelectedOffer] = useState<any>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    
    // Advanced Filter States
    const [selectedTherapistGender, setSelectedTherapistGender] = useState<'female' | 'male' | null>(null);
    const [selectedServiceFor, setSelectedServiceFor] = useState<'women' | 'men' | 'children' | null>(null);
    const [selectedMassageType, setSelectedMassageType] = useState<string>('');
    const [selectedSpecialFeature, setSelectedSpecialFeature] = useState<string>('');
    const [priceRange, setPriceRange] = useState<[number, number]>([100000, 450000]);
    
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

    
    // Google Maps Autocomplete (minimal UI state)
    const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
    const locationInputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);
    
    // Initialize Google Maps and body classes
    useEffect(() => {
        const initGoogleMaps = async () => {
            try {
                console.log('🗺️ Initializing Google Maps for city location system...');
                await initializeGoogleMaps();
                setMapsApiLoaded(true);
                console.log('✅ Google Maps initialized successfully for city filtering');
            } catch (error) {
                console.warn('⚠️ Google Maps failed to load, using fallback location matching:', error);
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
                console.warn('⚠️ Google Maps API key not configured');
                return;
            }

            console.log('🗺️ Loading Google Maps API for location autocomplete...');
            loadGoogleMapsScript(() => {
                console.log('✅ Google Maps API loaded for HomePage');
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
                    console.warn('No location details available for selected place');
                    return;
                }

                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const address = place.formatted_address || place.name || 'Selected location';

                console.log('✅ Location selected from autocomplete:', { address, lat, lng });

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
            console.log('✅ Google Maps Autocomplete initialized');
        } catch (error) {
            console.error('❌ Failed to initialize autocomplete:', error);
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
            console.error('Error submitting review:', error);
        }
    };

    // Function to show custom orange location modal
    const handleLocationRequest = () => {
        console.log('📍 Showing custom orange location modal...');
        setIsLocationModalOpen(true);
    };

    // Function to handle when user allows location in custom modal
    const handleLocationAllow = async () => {
        setIsLocationModalOpen(false);
        try {
            console.log('📍 User allowed location, requesting via browser API...');
            const location = await getCustomerLocation();
            
            console.log('✅ Location detected:', location);
            
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
                    console.log('✅ Reverse geocoded address:', address);
                } catch (geoError) {
                    console.warn('⚠️ Reverse geocoding failed, using default address:', geoError);
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
            console.log('❌ Location detection failed:', error);
            // Show a user-friendly error message
            alert('Unable to detect location. Please enable location permissions in your browser and try again.');
        }
    };

    // Function to handle when user denies location in custom modal
    const handleLocationDeny = () => {
        console.log('📍 User denied location access');
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
            console.warn('HomePage location modal effect warning (safe to ignore in React 19):', error);
        }
    }, [loggedInProvider, _loggedInAgent, loggedInCustomer, userLocation, autoDetectedLocation]);

    // Automatic location detection (seamless, no UI)
    useEffect(() => {
        const detectLocationAutomatically = async () => {
            if (isLocationDetecting || autoDetectedLocation) return;
            
            setIsLocationDetecting(true);
            try {
                console.log('🌍 Automatically detecting user location...');
                const location = await getCustomerLocation();
                setAutoDetectedLocation(location);
                
                console.log('✅ Location detected:', location);
                
                // Use Google Maps Geocoding to get address from coordinates
                let address = 'Auto-detected location';
                
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
                        
                        address = result.formatted_address || 'Auto-detected location';
                        console.log('✅ Auto reverse geocoded address:', address);
                    } catch (geoError) {
                        console.warn('⚠️ Auto reverse geocoding failed, using default address:', geoError);
                    }
                }
                
                // Automatically update the app's user location if not set
                if (!userLocation && onSetUserLocation) {
                    onSetUserLocation({
                        address,
                        lat: location.lat,
                        lng: location.lng
                    });
                }
                
            } catch (error) {
                console.log('📍 Auto location detection failed (silent fallback):', error);
                // Silent fallback - no error shown to user
            } finally {
                setIsLocationDetecting(false);
            }
        };

        // Only auto-detect for regular users, not providers/agents
        if (!loggedInProvider && !_loggedInAgent) {
            detectLocationAutomatically();
        }
    }, [loggedInProvider, _loggedInAgent, autoDetectedLocation, isLocationDetecting, userLocation, onSetUserLocation]);

    // Auto-detect city from user location and update selectedCity
    useEffect(() => {
        if (userLocation && userLocation.lat && userLocation.lng) {
            // First try postal code detection from address
            let detectedCityId = null;
            
            if (userLocation.address) {
                detectedCityId = mapPostalCodeToCity(userLocation.address);
                if (detectedCityId) {
                    console.log('🎯 Auto-detected city from postal code:', detectedCityId, 'from address:', userLocation.address);
                    setSelectedCity(detectedCityId);
                    return;
                }
            }
            
            // Fallback: Find the closest Indonesian city to user's location
            const detectedCity = findCityByCoordinates(userLocation.lat, userLocation.lng);
            if (detectedCity) {
                console.log('🎯 Auto-detected city from coordinates:', detectedCity.name);
                setSelectedCity(detectedCity.locationId);
            }
        }
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
    const isFeaturedSample = (provider: any, type: 'therapist' | 'place'): boolean => {
        if (!provider) return false;
        
        const name = provider.name?.toLowerCase() || '';
        const isFeatured = type === 'therapist' 
            ? name.includes('budi') // More flexible - just need "budi" in the name
            : name.includes('sample') && name.includes('massage') && name.includes('spa');
        
        // Debug logging for featured sample detection
        if (isFeatured) {
            console.log(`🎯 FEATURED SAMPLE DETECTED: ${type} "${provider.name}" - will show in ALL Indonesian cities including Yogyakarta, Jakarta, Bali, etc.`);
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
        
        // 🔥 CRITICAL FIX: Much more permissive filtering - show therapists by default
        // Only hide if explicitly set to false AND offline status
        const statusImpliesLive = normalizedStatus === 'available' || 
                                  normalizedStatus === 'busy' || 
                                  normalizedStatus === 'offline' ||  
                                  normalizedStatus === 'online';
        
        // ✅ NEW LOGIC: Show therapists by default, only hide if explicitly disabled
        // If isLive is explicitly false AND status is offline/empty, then hide
        if (normalizedLiveFlag === false && (normalizedStatus === 'offline' || normalizedStatus === '')) {
            console.log(`🚫 Hiding therapist ${therapist.name}: isLive=false AND status=${normalizedStatus}`);
            return false;
        }
        
        // Show in all other cases
        console.log(`✅ Showing therapist ${therapist.name}: isLive=${normalizedLiveFlag}, status=${normalizedStatus}`);
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
        
        // Shuffle and take random 5 - different for each city
        const shuffled = shuffleArray([...yogyaTherapists]);
        const selectedTherapists = shuffled.slice(0, 5);
        
        console.log(`🎭 Selected ${selectedTherapists.length} random Yogyakarta therapists for showcase in ${targetCity}:`, 
                   selectedTherapists.map((t: any) => t.name));
        
        // Create showcase versions with busy status and target city location
        const showcaseProfiles = selectedTherapists.map((therapist: any, index: number) => ({
            ...therapist,
            // Override key properties for showcase
            $id: `showcase-${therapist.$id || therapist.id}-${targetCity}`, // Unique ID for showcase version
            id: `showcase-${therapist.$id || therapist.id}-${targetCity}`,
            status: 'busy', // Always busy to prevent bookings outside Yogyakarta
            availability: 'busy',
            isAvailable: false, // Ensure not bookable
            location: `${targetCity}, Indonesia`, // Dynamic location matching user's viewing area
            city: targetCity, // Set city field as well
            isShowcaseProfile: true, // Flag to identify showcase profiles
            originalTherapistId: therapist.$id || therapist.id, // Keep reference to original
            showcaseCity: targetCity, // Track which city this showcase is for
            // Keep all other properties (name, image, rating, reviews, etc.) the same
        }));
        
        console.log(`🎭 Created ${showcaseProfiles.length} showcase profiles from Yogyakarta for city: ${targetCity}`);
        
        return showcaseProfiles;
    };

    // Filter therapists and places by location automatically
    useEffect(() => {
        const filterByLocation = async () => {
            const locationToUse = autoDetectedLocation || userLocation;
            
            // Location filtering enabled with city-based matching
            console.log('🌍 Location filtering enabled - using city-based filtering');
            console.log('📊 Data counts:', {
                totalTherapists: therapists?.length || 0,
                totalPlaces: places?.length || 0,
                liveTherapists: therapists?.filter((t: any) => t.isLive)?.length || 0,
                livePlaces: places?.filter((p: any) => p.isLive)?.length || 0
            });
            
            // For now, set default coordinates to Yogyakarta if no location available
            const defaultYogyaCoords = { lat: -7.7956, lng: 110.3695 };
            
            // Add default coordinates to therapists and places if missing
            const therapistsWithCoords = therapists.map((t: any) => {
                const parsedCoords = parseCoordinates(t.coordinates);
                return {
                    ...t,
                    coordinates: parsedCoords || defaultYogyaCoords,
                    location: t.location || 'Yogyakarta'
                };
            });
            
            const placesWithCoords = places.map((p: any) => {
                const parsedCoords = parseCoordinates(p.coordinates);
                return {
                    ...p,
                    coordinates: parsedCoords || defaultYogyaCoords,
                    location: p.location || 'Yogyakarta'
                };
            });
            
            const hotelsWithCoords = hotels.map((h: any) => {
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
                    console.log('🔍 Filtering providers by GPS location (25km radius):', locationToUse);
                    
                    // Get location coordinates
                    // 🔧 DEV-ONLY: Use override location if set, otherwise use real location
                    const realCoords = 'lat' in locationToUse 
                        ? { lat: locationToUse.lat, lng: locationToUse.lng }
                        : autoDetectedLocation;
                    const coords = (isDev && devLocationOverride) ? { lat: devLocationOverride.lat, lng: devLocationOverride.lng } : realCoords;

                    if (coords) {
                        console.log('📍 Using coordinates:', coords);

                        // Find ALL nearby therapists and places (25km radius) - NO status filtering for homepage
                        const nearbyTherapistsResult = await findAllNearbyTherapists(coords, 25);
                        const nearbyPlacesResult = await findAllNearbyPlaces(coords, 25);
                        
                        console.log(`✅ Found ${nearbyTherapistsResult.length} nearby therapists within 25km`);
                        console.log(`✅ Found ${nearbyPlacesResult.length} nearby places within 25km`);
                        
                        // Always include featured samples (Budi) regardless of location
                        const featuredTherapists = therapists.filter((t: any) => isFeaturedSample(t, 'therapist'));
                        const featuredPlaces = places.filter((p: any) => isFeaturedSample(p, 'place'));
                        
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
                    console.error('❌ Location filtering error:', error);
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

    // Log therapist display info with location filtering
    useEffect(() => {
        const liveTherapists = nearbyTherapists.filter((t: any) => {
            const isOwner = loggedInProvider && loggedInProvider.type === 'therapist' && (
                String(t.id) === String(loggedInProvider.id) || String(t.$id) === String(loggedInProvider.id)
            );
            const featuredTherapist = isFeaturedSample(t, 'therapist');
            const treatedAsLive = shouldTreatTherapistAsLive(t);
            
            return treatedAsLive || isOwner || featuredTherapist;
        });
        const filteredTherapists = liveTherapists.filter((t: any) => {
            // Always show featured sample therapists (like Budi) in ALL cities
            if (isFeaturedSample(t, 'therapist')) {
                console.log(`✅ Including featured therapist "${t.name}" in city "${selectedCity}" (Budi shows everywhere in Indonesia)`);
                return true;
            }
            
            if (selectedCity === 'all') return true;
            
            // 🌍 PRIMARY: GPS coordinates-based city detection (source of truth)
            const therapistCoords = parseCoordinates(t.coordinates);
            if (therapistCoords) {
                const matchedCity = matchProviderToCity(therapistCoords, 25);
                if (matchedCity && matchedCity.locationId === selectedCity) {
                    console.log(`✅ GPS coordinate match for ${t.name}:`, { 
                        coordinates: therapistCoords, 
                        detectedCity: matchedCity.locationId, 
                        filterCity: selectedCity 
                    });
                    return true;
                }
            }
            
            // 🔄 FALLBACK: String-based location matching (only if GPS fails)
            if (!therapistCoords) {
                const matches = matchesLocation(t.location, selectedCity);
                if (matches) {
                    console.log(`✅ Fallback location string match for ${t.name}:`, { location: t.location, filter: selectedCity });
                    return true;
                }
            }
            
            console.log(`❌ No city match for ${t.name}:`, { 
                coordinates: therapistCoords, 
                locationString: t.location, 
                filterCity: selectedCity 
            });
            return false;
        });
        
        // Add showcase profiles from Yogyakarta ONLY to cities with no real therapists
        let finalTherapistList = [...filteredTherapists];
        if (selectedCity !== 'all') {
            // Count real therapists (excluding featured Budi sample)
            const realTherapistsInCity = filteredTherapists.filter((t: any) => !isFeaturedSample(t, 'therapist'));
            
            // Only add showcase profiles if city has NO real therapists
            if (realTherapistsInCity.length === 0) {
                const showcaseProfiles = getYogyakartaShowcaseProfiles(therapists, selectedCity);
                if (showcaseProfiles.length > 0) {
                    // Add showcase profiles to the list (they'll appear as busy)
                    finalTherapistList = [...filteredTherapists, ...showcaseProfiles];
                    console.log(`🎭 Added ${showcaseProfiles.length} Yogyakarta showcase profiles to ${selectedCity} (no real therapists in city)`);
                }
            } else {
                console.log(`✅ ${selectedCity} has ${realTherapistsInCity.length} real therapist(s), skipping showcase profiles`);
            }
        }
        
        // Update city-filtered therapists state
        setCityFilteredTherapists(finalTherapistList);
        
        // Filter hotels by selected city (similar logic to therapists)
        const liveHotels = nearbyHotels.filter((h: any) => h.isLive === true);
        const filteredHotels = liveHotels.filter((h: any) => {
            if (selectedCity === 'all') return true;
            
            // Try multiple matching strategies for city filtering
            
            // 1. Direct location OR city field name match
            if (h.location && h.location.toLowerCase().includes(selectedCity.toLowerCase())) {
                return true;
            }
            if (h.city && h.city.toLowerCase().includes(selectedCity.toLowerCase())) {
                return true;
            }
            
            // 2. Coordinate-based matching
            if (h.coordinates) {
                const parsedCoords = parseCoordinates(h.coordinates);
                if (parsedCoords) {
                    const matchedCity = matchProviderToCity(parsedCoords, 25);
                    if (matchedCity && matchedCity.locationId === selectedCity) {
                        return true;
                    }
                }
            }
            
            // 3. Check aliases for common name variations (Yogya, Jogja for Yogyakarta)
            const selectedCityLower = selectedCity.toLowerCase();
            if (selectedCityLower === 'yogyakarta' && 
                h.location && (h.location.toLowerCase().includes('yogya') || h.location.toLowerCase().includes('jogja'))) {
                return true;
            }
            
            return false;
        });
        
        console.log('🏠 [HomePage RENDER] Provider Display Debug (Location-Filtered 25km radius):');
        console.log('🔍 [STAGE 5 - HomePage Filters] Filter analysis:');
        console.log('  📊 Total therapists prop:', therapists.length);
        console.log('  📍 Nearby therapists (location-filtered):', nearbyTherapists.length);
        console.log('  🔴 Live nearby therapists (isLive=true):', liveTherapists.length);
        console.log('  🎯 Final filtered therapists:', finalTherapistList.length);
        console.log('🔍 [STAGE 5] Filter breakdown:', {
            input: therapists.length,
            afterLocation: nearbyTherapists.length,
            afterLiveFilter: liveTherapists.length,
            final: finalTherapistList.length,
            reduction: therapists.length - finalTherapistList.length
        });
        console.log('  🏨 Final filtered hotels (location):', filteredHotels.length);
        console.log('  📍 Auto-detected location:', autoDetectedLocation);
        console.log('  🏙️ Selected city:', selectedCity);
        const missingCoords = therapists.filter((t: any)=>!t.coordinates).length;
        console.log('  ⚠️ Therapists missing coordinates:', missingCoords);
        
        // Also log places
        const livePlaces = nearbyPlaces.filter((p: any) => p.isLive === true);
        console.log('  🏢 Total places prop:', places.length);
        console.log('  📍 Nearby places (location-filtered):', nearbyPlaces.length);
        const missingPlaceCoords = places.filter((p: any)=>!p.coordinates).length;
        console.log('  ⚠️ Places missing coordinates:', missingPlaceCoords);
        console.log('  🔴 Live nearby places:', livePlaces.length);
        
        // Also log hotels 
        const liveHotelsCount = nearbyHotels.filter((h: any) => h.isLive === true).length;
        console.log('  🏨 Total hotels prop:', hotels.length);
        console.log('  📍 Nearby hotels (location-filtered):', nearbyHotels.length);
        const missingHotelCoords = hotels.filter((h: any)=>!h.coordinates).length;
        console.log('  ⚠️ Hotels missing coordinates:', missingHotelCoords);
        console.log('  🔴 Live nearby hotels:', liveHotelsCount);
        
        // 🔧 DEV-ONLY: Diagnostic assertions
        if (isDev) {
            console.assert(
                therapists.length === 0 || nearbyTherapists.length > 0,
                '⚠️ WARNING: Therapists exist in DB but 0 after location filtering. Check coordinates or location matching.'
            );
            
            const currentCoords = (isDev && devLocationOverride) 
                ? { lat: devLocationOverride.lat, lng: devLocationOverride.lng }
                : (autoDetectedLocation || (userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null));
            
            if (nearbyTherapists.length === 0 && therapists.length > 0 && currentCoords) {
                const therapistsWithCoords = therapists.filter((t: any) => t.geopoint);
                if (therapistsWithCoords.length > 0) {
                    const minDist = Math.min(...therapistsWithCoords.map((t: any) => {
                        const coords = t.geopoint;
                        const dlat = currentCoords.lat - coords.latitude;
                        const dlng = currentCoords.lng - coords.longitude;
                        return Math.sqrt(dlat * dlat + dlng * dlng) * 111;
                    }));
                    console.assert(
                        minDist <= 15,
                        `⚠️ WARNING: User location is ${minDist.toFixed(1)}km from nearest therapist cluster. Consider location override.`
                    );
                }
            }
        }
    }, [therapists, nearbyTherapists, places, nearbyPlaces, hotels, nearbyHotels, selectedCity, autoDetectedLocation, isDev, devLocationOverride, userLocation]);

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
            console.log('🍔 toggleDrawer event received, current isMenuOpen:', isMenuOpen);
            setIsMenuOpen(prev => !prev);
        };

        const handleCustomerDashboardDrawer = () => {
            console.log('🍔 customer_dashboard_open_drawer event received, current isMenuOpen:', isMenuOpen);
            setIsMenuOpen(true);
        };
        
        // Add event listener with defensive checks for React 19 concurrent rendering
        let listenersAdded = [];
        try {
            if (typeof window !== 'undefined' && window.addEventListener) {
                window.addEventListener('toggleDrawer', handleToggleDrawer);
                listenersAdded.push(['toggleDrawer', handleToggleDrawer]);
                
                window.addEventListener('customer_dashboard_open_drawer', handleCustomerDashboardDrawer);
                listenersAdded.push(['customer_dashboard_open_drawer', handleCustomerDashboardDrawer]);
                
                console.log('🍔 Added event listeners for drawer events');
            }
        } catch (error) {
            console.warn('Event listener setup warning (safe to ignore):', error);
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
                    console.warn('Event listener cleanup warning (safe to ignore in React 19):', error);
                }
            });
        };
    }, []);

    // Removed unused processedTherapists and processedPlaces

    // Count of online therapists (status === 'online')
    const onlineTherapistsCount = therapists.filter(t => t.status === 'online').length;

    // Rating modal handlers removed for design mock

    // SEO: Add Schema.org structured data for LocalBusiness and AggregateRating
    useEffect(() => {
        // Calculate average rating from therapists
        const therapistsWithRatings = therapists.filter(t => t.rating && t.rating > 0);
        const avgRating = therapistsWithRatings.length > 0 
            ? therapistsWithRatings.reduce((sum, t) => sum + t.rating, 0) / therapistsWithRatings.length 
            : 4.8;
        const reviewCount = therapists.reduce((sum, t) => sum + (t.reviewCount || 0), 0) || 500;

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

    return (
        <div className="min-h-screen bg-gray-50 w-full max-w-[100vw] overflow-x-hidden">
            <PageNumberBadge pageNumber={2} pageName="HomePage" isLocked={false} />
            {/* Flying Butterfly Animation */}
            <FlyingButterfly />
            
            {/* Universal Header */}
            <UniversalHeader 
                language={language}
                onLanguageChange={onLanguageChange}
                onMenuClick={() => {
                    console.log('🍔 UniversalHeader burger menu clicked in HomePage!');
                    setIsMenuOpen(true);
                }}
            />

            {/* Global App Drawer - Chrome Safe Rendering */}
            <React19SafeWrapper condition={isMenuOpen}>
                <AppDrawer
                    isHome={true}
                    isOpen={isMenuOpen}
                    onClose={() => {
                        console.log('🍔 AppDrawer onClose called');
                        setIsMenuOpen(false);
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
            <div className="bg-white sticky top-[60px] z-10 border-b border-gray-100">
                <PageContainer className="px-3 sm:px-4 pt-3 pb-3">
                    {/* Hero Section - Optimized Layout */}
                    <div className="space-y-3 max-w-6xl mx-auto">
                        {/* Location Display */}
                        <div className="w-full">
                            {userLocation ? (
                                <div className="flex flex-col items-center gap-0.5">
                                <div className="flex items-center justify-center gap-2">
                                    <MusicPlayer autoPlay={true} />
                                    <svg 
                                        className="w-4 h-4 text-gray-600" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor" 
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-sm font-semibold text-gray-800">
                                        {(() => {
                                            if (!userLocation.address || userLocation.address.trim() === '') {
                                                return `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
                                            }
                                            try {
                                                const parts = String(userLocation.address).split(',').map(p => p.trim());
                                                return parts.slice(-2).join(', ');
                                            } catch (e) {
                                                return `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
                                            }
                                        })()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-xs font-medium text-orange-600">
                                        {selectedCity === 'all' ? 'All Indonesia' : (() => {
                                            for (const category of INDONESIAN_CITIES_CATEGORIZED) {
                                                const foundCity = category.cities.find(city => city.name === selectedCity);
                                                if (foundCity) {
                                                    return `${foundCity.name}${foundCity.isTouristDestination ? ' 🏖️' : foundCity.isMainCity ? ' 🏙️' : ''}`;
                                                }
                                            }
                                            return selectedCity;
                                        })()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 font-medium">Indonesia's Massage Therapist Hub</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 max-w-md mx-auto py-1">
                                <label className="text-sm font-medium text-gray-700">Search your city or area</label>
                                <input
                                    ref={locationInputRef}
                                    type="text"
                                    placeholder="Enter your location..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 text-center">
                                    Or <button onClick={handleLocationAllow} className="text-orange-600 hover:underline">use my current location</button>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Toggle Buttons - Standard Height */}
                    <div className="flex bg-gray-200 rounded-full p-1 max-w-md mx-auto">
                        <button 
                            onClick={() => setActiveTab('home')} 
                            className={`w-1/2 py-2.5 px-3 sm:px-4 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-colors duration-300 min-h-[44px] ${activeTab === 'home' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                        >
                            <HomeIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">{translationsObject?.home?.homeServiceTab || 'Home Service'}</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('places')} 
                            className={`w-1/2 py-2.5 px-3 sm:px-4 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-colors duration-300 min-h-[44px] ${
                                activeTab === 'places' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Building className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">{translationsObject?.home?.massagePlacesTab || 'Massage Places'}</span>
                        </button>
                    </div>

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

                    {/* City Dropdown + Facial Button - Responsive Grid */}
                    <div className="flex flex-row gap-2 items-center max-w-2xl mx-auto">
                        {/* City Dropdown - Flexible width, constrained on mobile */}
                        <div className="relative flex-1 min-w-0 max-w-[200px] sm:max-w-none z-20">
                            <CityLocationDropdown
                                selectedCity={selectedCity}
                                onCityChange={setSelectedCity}
                                placeholder={translationsObject?.home?.viewingAllIndonesia || '🇮🇩 All Indonesia'}
                                includeAll={true}
                                showLabel={false}
                                className="w-full"
                            />
                        </div>
                        
                        {/* Facial Button - Standard Orange Button */}
                        <div className="flex justify-end flex-shrink-0">
                            <button
                                onClick={() => {
                                    console.log('🏨 Facial button clicked - switching to facials tab');
                                    setActiveTab('facials');
                                }}
                                className="px-4 py-2.5 rounded-lg transition-colors font-semibold text-sm min-h-[44px] flex items-center justify-center gap-2 shadow-sm bg-orange-500 text-white hover:bg-orange-600"
                                title="Facials Indonesia"
                                aria-label="Browse Facial Spas"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{t?.home?.facial || 'Facial'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </PageContainer>
            </div>
            
            {/* Scrollable Content Area */}
            <main className="w-full max-w-full overflow-x-hidden">
            <PageContainer className="px-3 sm:px-4 pt-4 pb-24">
                {/* Content changes based on active tab */}
                {activeTab === 'home' && (
                    <div className="max-w-full overflow-x-hidden pb-8">
                        <div className="mb-3 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{t?.home?.therapistsTitle || 'Home Service Therapists'}</h3>
                            <p className="text-gray-600">
                                {selectedCity === 'all' 
                                    ? (t?.home?.therapistsSubtitleAll || 'Find the best therapists across Indonesia')
                                    : (t?.home?.therapistsSubtitleCity?.replace('{city}', selectedCity) || `Find the best therapists in ${selectedCity}`)
                                }
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {t?.home?.browseRegionNote || 'Browse Region dropdown (distance still applies)'}
                            </p>
                        </div>
                        
                        <div className="space-y-3 max-w-full overflow-hidden">
                        {/* Build list with injected unique mainImage per view */}
                        {(() => {
                            const isOwner = (t: any) => (
                                loggedInProvider && loggedInProvider.type === 'therapist' && (
                                    String(t.id) === String(loggedInProvider.id) || String(t.$id) === String(loggedInProvider.id)
                                )
                            );

                            // 🌍 GPS-BASED INCLUSION: Get therapists within radius (or all if dev mode bypass enabled)
                            const currentUserLocation = (isDev && devLocationOverride) 
                                ? { lat: devLocationOverride.lat, lng: devLocationOverride.lng }
                                : (autoDetectedLocation || (userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null));

                            // 🔧 COORDINATE PARSER: Safely parse Appwrite JSON string coordinates
                            const getCoords = (t: any) => {
                                try {
                                    const c = typeof t.coordinates === "string"
                                        ? JSON.parse(t.coordinates)
                                        : t.coordinates;

                                    if (typeof c?.lat === "number" && typeof c?.lng === "number") {
                                        return c;
                                    }
                                } catch (e) {
                                    console.warn("Invalid coordinates for therapist", t.$id, ":", t.coordinates);
                                }
                                return null;
                            };

                            // Helper: Calculate distance using Haversine formula
                            const calculateHaversineDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) => {
                                const R = 6371; // Earth radius in km
                                const dLat = (point2.lat - point1.lat) * Math.PI / 180;
                                const dLon = (point2.lng - point1.lng) * Math.PI / 180;
                                const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                                         Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
                                         Math.sin(dLon/2) * Math.sin(dLon/2);
                                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                                return R * c;
                            };

console.log('🔧 [DEBUG] Therapist filtering analysis:', {
                totalTherapists: therapists?.length || 0,
                therapistsArray: therapists?.slice(0, 5).map((t: any) => ({
                    name: t.name,
                    isLive: t.isLive,
                    status: t.status,
                    id: t.$id || t.id
                })) || [],
                selectedCity: selectedCity,
                autoDetectedLocation: !!autoDetectedLocation,
                userLocation: !!userLocation
            });

            // TEMPORARY DEBUG: Show first therapist regardless of live status
            if (therapists && therapists.length > 0) {
                console.log('🔧 [DEBUG] First therapist raw data:', therapists[0]);
            }

            // Show all therapists - industry standard: once posted, always visible (like Facebook/Amazon)
            // 🌍 STEP 1: Calculate distances for all therapists with valid geopoints
            
            // 🔍 DEBUG: Log therapist data to understand filtering issues
            console.log(`🔍 [DEBUG] Total therapists received:`, therapists?.length || 0);
            if (therapists && therapists.length > 0) {
                console.log(`🔍 [DEBUG] First 3 therapists data:`, therapists.slice(0, 3).map((t: any) => ({
                    name: t.name,
                    id: t.$id || t.id,
                    hasCoordinates: !!t.coordinates,
                    hasGeopoint: !!t.geopoint,
                    coordinates: t.coordinates,
                    geopoint: t.geopoint,
                    location: t.location,
                    city: t.city,
                    isLive: t.isLive,
                    status: t.status,
                    availability: t.availability
                })));
            }
            
            let therapistsWithDistance = cityFilteredTherapists
                .map((t: any) => {
                    let distance: number | null = null;
                    let locationArea: string = t.city || t.location || 'Unknown';
                    
                    // 🌍 GPS DISTANCE: Calculate only if both user location and valid coordinates exist
                    if (currentUserLocation) {
                        const therapistCoords = getCoords(t) || (t.geopoint ? { lat: t.geopoint.latitude, lng: t.geopoint.longitude } : null);
                        
                        if (therapistCoords) {
                            distance = calculateHaversineDistance(currentUserLocation, therapistCoords);
                            
                            // 🔍 DEBUG: Log distance calculation for debugging
                            if (t.name === 'Budi' || t.name === 'Surtiningsih' || t.name === 'Wiwid') {
                                console.log(`🧮 [DISTANCE CALC] ${t.name}:`, {
                                    userLocation: currentUserLocation,
                                    therapistCoords: therapistCoords,
                                    rawCoordinates: t.coordinates,
                                    calculatedDistance: distance
                                });
                            }
                            
                            // Try to determine location area from coordinates
                            const matchedCity = matchProviderToCity(therapistCoords, 25);
                            if (matchedCity) {
                                locationArea = matchedCity.locationId;
                            }
                        }
                    }
                    
                    return { ...t, _distance: distance, _locationArea: locationArea };
                });

            // 🌍 STEP 2: GPS-BASED INCLUSION (10km radius or all if dev bypass enabled)
            let baseList = therapistsWithDistance
                .filter((t: any) => {
                    // 🔍 DETAILED FILTERING COMPARISON: Track each condition for Budi vs others
                    const isBudi = t.name?.toLowerCase().includes('budi');
                    
                    // CRITICAL: First check if therapist should be treated as live
                    const treatedAsLive = shouldTreatTherapistAsLive(t);
                    const isOwnerTherapist = isOwner(t);
                    const isFeatured = isFeaturedSample(t, 'therapist');
                    
                    // 🔍 LOG COMPARISON: Detailed logging for filtering decisions
                    if (isBudi || therapistsWithDistance.indexOf(t) < 3) { // Log Budi + first 3 others
                        console.log(`🔍 [FILTER CHECK] ${t.name} (${isBudi ? 'BUDI' : 'OTHER'}):`, {
                            name: t.name,
                            $id: t.$id,
                            treatedAsLive: treatedAsLive,
                            isOwnerTherapist: isOwnerTherapist,
                            isFeatured: isFeatured,
                            _distance: t._distance,
                            hasCoordinates: !!(t.coordinates || t.geopoint),
                            coordinates: t.coordinates,
                            geopoint: t.geopoint,
                            isLive: t.isLive,
                            status: t.status,
                            availability: t.availability
                        });
                    }
                    
                    // ✅ FIXED: Don't exclude therapists just because they lack isLive/status fields
                    // Allow all therapists with GPS coordinates - let GPS filtering be the primary filter
                    // Only exclude if explicitly marked as not live (isLive: false)
                    
                    // Always show featured sample therapists (Budi) in all cities
                    if (isFeatured) {
                        if (isBudi || therapistsWithDistance.indexOf(t) < 3) {
                            console.log(`✅ [FILTER PASS] ${t.name}: isFeatured=true, INCLUDED`);
                        }
                        return true;
                    }
                    
                    // ✅ NO DISTANCE FILTERING: Therapists serve their assigned city/location area
                    // Show therapists based purely on their city assignment, not GPS proximity
                    // Distance is only calculated for sorting (nearest first), not for filtering
                    if (isBudi || therapistsWithDistance.indexOf(t) < 3) {
                        console.log(`✅ [FILTER PASS] ${t.name}: Location-based filtering (no radius restriction)`);
                    }
                    
                    // 🔄 FALLBACK: Include therapists without valid coordinates (GPS-agnostic)
                    // Never exclude therapists just because they lack coordinates
                    if (t._distance === null) {
                        if (isBudi || therapistsWithDistance.indexOf(t) < 3) {
                            console.log(`✅ [FILTER PASS] ${t.name}: No coordinates, GPS-agnostic inclusion, INCLUDED`);
                        }
                        // Continue to other filters (live status, etc.) - don't return here
                    }
                    
                    // 🔐 ADMIN AREA VIEW: Special admin feature to view all therapists in specific area
                    if (selectedCity !== 'all' && adminViewArea && bypassRadiusForAdmin && hasAdminPrivileges) {
                        const areaMatch = t._locationArea === adminViewArea;
                        if (isBudi || therapistsWithDistance.indexOf(t) < 3) {
                            console.log(`${areaMatch ? '✅ [FILTER PASS]' : '❌ [FILTER FAIL]'} ${t.name}: Admin area view, area match=${areaMatch}`);
                        }
                        return areaMatch;
                    }
                    
                    // ✅ FIXED: GPS coordinates are source of truth for inclusion
                    // Location strings are for DISPLAY ONLY, not filtering
                    // This ensures all therapists with valid coordinates in range are shown
                    if (isBudi || therapistsWithDistance.indexOf(t) < 3) {
                        console.log(`✅ [FILTER PASS] ${t.name}: Final default inclusion, INCLUDED`);
                    }
                    return true;
                });

            // 🔍 FILTERING RESULTS SUMMARY
            console.log('🔍 [FILTERING SUMMARY]');
            console.log(`  📊 Input: ${therapistsWithDistance.length} therapists with distance calculated`);
            console.log(`  📊 Output: ${baseList.length} therapists after filtering`);
            
            const budiInBaseList = baseList.find(t => t.name?.toLowerCase().includes('budi'));
            const nonBudiInBaseList = baseList.filter(t => !t.name?.toLowerCase().includes('budi'));
            
            console.log(`  🎯 Budi in final list: ${!!budiInBaseList} (${budiInBaseList?.name || 'NOT FOUND'})`);
            console.log(`  🎯 Non-Budi in final list: ${nonBudiInBaseList.length} therapists`);
            
            if (nonBudiInBaseList.length > 0) {
                console.log(`  🎯 First 3 non-Budi therapists in final list:`, 
                    nonBudiInBaseList.slice(0, 3).map(t => ({ name: t.name, id: t.$id })));
            }
            
            if (baseList.length === 1 && budiInBaseList) {
                console.log('🚨 [CRITICAL ISSUE] Only Budi is in the final list - this is the bug!');
            }
            
            // 👩‍⚕️ FEMALE THERAPIST FILTER: Apply if showFemaleOnly is active
            if (showFemaleOnly) {
                baseList = baseList.filter((t: any) => {
                    // Check therapistGender field or clientPreferences for female-friendly options
                    const gender = String(t.therapistGender || t.gender || '').toLowerCase();
                    const clientPrefs = String(t.clientPreferences || '').toLowerCase();
                    
                    // Include if:
                    // 1. therapistGender is "female"
                    // 2. clientPreferences includes "female" or "woman"
                    // 3. therapistGender is "unisex" (serves all)
                    const isFemale = gender === 'female' || 
                                    clientPrefs.includes('female') || 
                                    clientPrefs.includes('woman') ||
                                    gender === 'unisex';
                    
                    return isFemale;
                });
                console.log(`👩‍⚕️ [FEMALE FILTER] Filtered to ${baseList.length} female/female-friendly therapists`);
            }

            // 🔍 ADVANCED FILTERS: Apply all advanced filter selections
            if (selectedTherapistGender || selectedServiceFor || selectedMassageType || selectedSpecialFeature || (priceRange[0] !== 100000 || priceRange[1] !== 450000)) {
                console.log('🔍 [ADVANCED FILTERS] Applying advanced filters:', {
                    therapistGender: selectedTherapistGender,
                    serviceFor: selectedServiceFor,
                    massageType: selectedMassageType,
                    specialFeature: selectedSpecialFeature,
                    priceRange: priceRange
                });

                baseList = baseList.filter((t: any) => {
                    // 1. Therapist Gender Filter
                    if (selectedTherapistGender) {
                        const gender = String(t.therapistGender || t.gender || '').toLowerCase();
                        if (gender !== selectedTherapistGender) {
                            return false;
                        }
                    }

                    // 2. Service For Filter (check clientPreferences)
                    if (selectedServiceFor) {
                        const clientPrefs = String(t.clientPreferences || '').toLowerCase();
                        const serviceFor = selectedServiceFor.toLowerCase();
                        
                        // Map serviceFor values to match data
                        const searchTerm = serviceFor === 'women' ? ['women', 'female', 'ladies'] :
                                          serviceFor === 'men' ? ['men', 'male', 'gentleman'] :
                                          serviceFor === 'children' ? ['children', 'kids', 'family'] : [];
                        
                        const matches = searchTerm.some(term => clientPrefs.includes(term));
                        if (!matches && clientPrefs !== 'all' && clientPrefs !== 'everyone') {
                            return false;
                        }
                    }

                    // 3. Massage Type Filter
                    if (selectedMassageType) {
                        const services = String(t.services || t.massageTypes || '').toLowerCase();
                        const specialties = String(t.specialties || '').toLowerCase();
                        const massageType = selectedMassageType.toLowerCase();
                        
                        // Check if the massage type exists in services or specialties
                        if (!services.includes(massageType) && !specialties.includes(massageType)) {
                            return false;
                        }
                    }

                    // 4. Special Feature Filter
                    if (selectedSpecialFeature) {
                        const feature = selectedSpecialFeature;
                        
                        switch (feature) {
                            case 'verified-only':
                                if (!t.isVerified && !t.hasIndustryStandards) return false;
                                break;
                            case 'with-facial':
                                const services = String(t.services || '').toLowerCase();
                                if (!services.includes('facial')) return false;
                                break;
                            case 'highly-rated':
                                const rating = parseFloat(t.averageRating || '0');
                                if (rating < 4.5) return false;
                                break;
                            case 'coin-rub':
                                const hasCoinRub = String(t.services || t.specialties || '').toLowerCase().includes('coin');
                                if (!hasCoinRub) return false;
                                break;
                            case 'body-scrub':
                                const hasScrub = String(t.services || t.specialties || '').toLowerCase().includes('scrub');
                                if (!hasScrub) return false;
                                break;
                            case 'hot-stones':
                                const hasHotStone = String(t.services || t.specialties || '').toLowerCase().includes('hot stone');
                                if (!hasHotStone) return false;
                                break;
                            case 'aromatherapy':
                                const hasAroma = String(t.services || t.specialties || '').toLowerCase().includes('aroma');
                                if (!hasAroma) return false;
                                break;
                            case 'deep-pressure':
                                const hasDeep = String(t.services || t.specialties || '').toLowerCase().includes('deep');
                                if (!hasDeep) return false;
                                break;
                            case 'home-service':
                                if (!t.homeService && !t.mobileService) return false;
                                break;
                        }
                    }

                    // 5. Price Range Filter
                    const price = parseInt(t.price || t.basePrice || t.hourlyRate || '0');
                    if (price > 0) {
                        if (price < priceRange[0] || price > priceRange[1]) {
                            return false;
                        }
                    }

                    return true;
                });

                console.log(`🔍 [ADVANCED FILTERS] Filtered to ${baseList.length} therapists matching criteria`);
            }

                            // Ensure owner's profile appears once
                            if (loggedInProvider && loggedInProvider.type === 'therapist') {
                                const alreadyIncluded = baseList.some((t: any) => String(t.id) === String(loggedInProvider.id) || String(t.$id) === String(loggedInProvider.id));
                                if (!alreadyIncluded) {
                                    const ownerDoc = therapists.find((t: any) => String(t.id) === String(loggedInProvider.id) || String(t.$id) === String(loggedInProvider.id));
                                    if (ownerDoc) {
                                        let includeOwner = selectedCity === 'all';
                                        if (!includeOwner && ownerDoc.coordinates && currentUserLocation) {
                                            // ✅ FIXED: Use GPS distance instead of string matching
                                            const ownerLocation = { lat: ownerDoc.coordinates.lat || 0, lng: ownerDoc.coordinates.lng || 0 };
                                            const distance = calculateHaversineDistance(currentUserLocation, ownerLocation);
                                            includeOwner = distance <= 10; // Same 10km radius as other therapists
                                        }
                                        
                                        if (includeOwner) {
                                            baseList = [ownerDoc, ...baseList];
                                        }
                                    }
                                }
                            }

                            // Add Yogyakarta showcase profiles ONLY to cities with no real therapists
                            if (selectedCity !== 'all') {
                                // Count real therapists in baseList (excluding featured Budi sample)
                                const realTherapistsInCity = baseList.filter((t: any) => !isFeaturedSample(t, 'therapist'));
                                
                                // Only add showcase profiles if city has NO real therapists
                                if (realTherapistsInCity.length === 0) {
                                    const showcaseProfiles = getYogyakartaShowcaseProfiles(therapists, selectedCity);
                                    if (showcaseProfiles.length > 0) {
                                        // Add showcase profiles (they appear as busy, can't be booked)
                                        baseList = [...baseList, ...showcaseProfiles];
                                        console.log(`🎭 Added ${showcaseProfiles.length} Yogyakarta showcase profiles to ${selectedCity} display (no real therapists)`);
                                    }
                                } else {
                                    console.log(`✅ ${selectedCity} has ${realTherapistsInCity.length} real therapist(s) in display, skipping showcase profiles`);
                                }
                            }

                            // Advanced priority sorting system
                            const getPriorityScore = (therapist: any) => {
                                let score = 0;

                                // 1. Status Priority (0-10000 points) - HIGHEST WEIGHT
                                const status = String(therapist.status || '').toLowerCase();
                                if (status === 'available' || status === 'online') {
                                    score += 10000; // Available first - HIGHEST priority
                                } else if (status === 'busy') {
                                    score += 5000;  // Busy second - Medium priority
                                } else {
                                    score += 0;     // Offline last - Lowest priority
                                }

                                // 2. Premium Account Boost (0-500 points)
                                if (therapist.isPremium || therapist.accountType === 'premium') {
                                    score += 500;
                                }

                                // 3. Industry Standards Boost (0-300 points)
                                if (therapist.isVerified || therapist.hasIndustryStandards || therapist.certifications?.length > 0) {
                                    score += 300;
                                }

                                // 4. Online Activity Priority (0-200 points)
                                const now = new Date();
                                if (therapist.lastSeen) {
                                    const lastSeen = new Date(therapist.lastSeen);
                                    const hoursAgo = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60);
                                    
                                    if (hoursAgo <= 1) score += 200;       // Online within 1 hour
                                    else if (hoursAgo <= 6) score += 150;  // Online within 6 hours
                                    else if (hoursAgo <= 24) score += 100; // Online within 24 hours
                                    else if (hoursAgo <= 72) score += 50;  // Online within 3 days
                                }

                                // 5. Rating Quality Bonus (0-100 points)
                                const rating = parseFloat(therapist.averageRating || '0');
                                if (rating >= 4.5) score += 100;
                                else if (rating >= 4.0) score += 75;
                                else if (rating >= 3.5) score += 50;

                                // 6. Order Count Boost (0-50 points)
                                const orders = parseInt(therapist.orderCount || '0');
                                if (orders >= 50) score += 50;
                                else if (orders >= 20) score += 30;
                                else if (orders >= 10) score += 20;

                                // 7. Featured samples (Budi) - NO SPECIAL BOOST
                                // Featured samples are randomized with other available therapists
                                // No longer pinned to top to avoid "stuck" appearance

                                return score;
                            };

                            // 🎭 VISUAL ENHANCEMENT: Transform 20% of offline therapists to display as "Busy"
                            // This gives the app a busier appearance while maintaining proper sorting order
                            const transformOfflineToBusy = (list: any[]) => {
                                // Separate offline therapists from others
                                const offlineTherapists = list.filter(t => {
                                    const status = String(t.status || '').toLowerCase();
                                    return status === 'offline' || status === '';
                                });
                                
                                // Calculate 20% of offline therapists to transform
                                const countToTransform = Math.ceil(offlineTherapists.length * 0.2);
                                
                                // Use deterministic selection based on therapist ID for consistency
                                // Sort offline therapists by their ID hash to get consistent "random" selection
                                const sortedByHash = offlineTherapists.slice().sort((a, b) => {
                                    const hashA = String(a.$id || a.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                                    const hashB = String(b.$id || b.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                                    return hashA - hashB;
                                });
                                
                                // Select the first 20% to display as busy
                                const idsToTransform = new Set(
                                    sortedByHash.slice(0, countToTransform).map(t => t.$id || t.id)
                                );
                                
                                console.log(`🎭 [VISUAL ENHANCEMENT] Transforming ${countToTransform}/${offlineTherapists.length} offline therapists to display as Busy`);
                                
                                // Transform the selected offline therapists to display as busy
                                return list.map(therapist => {
                                    const therapistId = therapist.$id || therapist.id;
                                    if (idsToTransform.has(therapistId)) {
                                        return {
                                            ...therapist,
                                            displayStatus: 'Busy', // Visual status for display
                                            _originalStatus: therapist.status, // Preserve original for debugging
                                            status: 'Busy' // Override status for sorting purposes
                                        };
                                    }
                                    return therapist;
                                });
                            };

                            // Apply offline-to-busy transformation before sorting
                            baseList = transformOfflineToBusy(baseList);

                            // Apply intelligent sorting: PRIMARY SORT BY STATUS, then distance
                            baseList = baseList
                                .slice()
                                .map(therapist => ({ 
                                    ...therapist, 
                                    priorityScore: getPriorityScore(therapist),
                                    randomSeed: Math.random() // For randomization within groups
                                }))
                                .sort((a: any, b: any) => {
                                    // 🎯 PRIMARY SORT: Status Priority (Available → Busy → Offline)
                                    if (b.priorityScore !== a.priorityScore) {
                                        return b.priorityScore - a.priorityScore;
                                    }
                                    
                                    // 🌍 SECONDARY SORT: Distance (nearest first) - ONLY if user location exists
                                    if (currentUserLocation && a._distance !== null && b._distance !== null) {
                                        if (a._distance !== b._distance) {
                                            return a._distance - b._distance; // Ascending (nearest first)
                                        }
                                    }
                                    
                                    // Tertiary sort by random seed for same-priority items
                                    return a.randomSeed - b.randomSeed;
                                });

                            // Removed sample therapist fallback: now show empty-state message below if none live

                            const preparedTherapists = baseList
                                .map((therapist: any, index: number) => {
                                    // Assign deterministic unique image from shuffled set; if more therapists than images, start second cycle
                                    const assignedImage = shuffledHomeImages.length > 0 
                                        ? shuffledHomeImages[index % shuffledHomeImages.length] 
                                        : undefined; // undefined triggers fallback logic inside TherapistCard
                                    
                                    // Override location for featured samples when shown in non-home cities
                                    let displayLocation = therapist.location;
                                    let displayCity = therapist.city;
                                    if (isFeaturedSample(therapist, 'therapist') && selectedCity !== 'all') {
                                        displayLocation = selectedCity;
                                        displayCity = selectedCity;
                                        console.log(`🎯 Overriding featured sample ${therapist.name} location to ${selectedCity}`);
                                    }
                                    
                                    return { 
                                        ...therapist, 
                                        mainImage: assignedImage || therapist.mainImage,
                                        location: displayLocation,
                                        city: displayCity
                                    };
                                });

                            console.log('🔧 [DEBUG] Final therapist list with priority scores:', {
                                originalCount: therapists?.length || 0,
                                afterFiltering: baseList.length,
                                finalCount: preparedTherapists.length,
                                priorityBreakdown: baseList.slice(0, 5).map(t => ({
                                    name: t.name,
                                    status: t.status,
                                    score: t.priorityScore,
                                    distance: t._distance,
                                    locationArea: t._locationArea,
                                    isPremium: t.isPremium || false,
                                    isVerified: t.isVerified || false,
                                    rating: t.averageRating || 'N/A',
                                    orders: t.orderCount || 0
                                }))
                            });

                            // 🏷️ GROUP BY LOCATION AREA for display (sorted by distance within each group)
                            const therapistsByLocation: { [key: string]: any[] } = {};
                            preparedTherapists.forEach((therapist: any) => {
                                const area = therapist._locationArea || 'Unknown';
                                if (!therapistsByLocation[area]) {
                                    therapistsByLocation[area] = [];
                                }
                                therapistsByLocation[area].push(therapist);
                            });

                            // Render grouped therapists with section headers
                            const locationAreas = Object.keys(therapistsByLocation).sort();
                            
                            console.log('🔍 [STAGE 6 - Render] About to render therapist cards:', preparedTherapists.length);
                            console.log('🔍 [STAGE 6] Location areas:', locationAreas);
                            console.log('🔍 [STAGE 6] Therapists by location:', Object.keys(therapistsByLocation).map(k => `${k}: ${therapistsByLocation[k].length}`));
                            
                            return (
                                <>
                                {locationAreas.map((area) => {
                                    const therapistsInArea = therapistsByLocation[area];
                                    console.log('🔍 [STAGE 6] Rendering area:', area, 'with', therapistsInArea.length, 'therapists');
                                    return (
                                        <div key={`area-${area}`} className="mb-8">
                                            {/* Location Area Header */}
                                            {locationAreas.length > 1 && (
                                                <h4 className="text-lg font-semibold text-gray-800 mb-3 px-1">
                                                    📍 Nearby in {area}
                                                </h4>
                                            )}
                                            
                                            {/* Therapist Cards in This Area */}
                                            {therapistsInArea.map((therapist: any, index: number) => {
                                                console.log('🔍 [STAGE 6] Rendering TherapistHomeCard for:', therapist.name);
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
                                    console.log(`🏠 HomePage → ${therapist.name}: languages=${therapist.languages}, isLive=${therapist.isLive}`);
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
                                    onClick={(selectedTherapist) => {
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
                                </>
                            );
                        })()}
                        {therapists.filter((t: any) => t.isLive === true || (loggedInProvider && loggedInProvider.type === 'therapist' && (String((t as any).id) === String(loggedInProvider.id) || String((t as any).$id) === String(loggedInProvider.id)))).length === 0 && (
                            <div className="text-center py-12 bg-white rounded-lg">
                                <p className="text-gray-500">{translationsObject?.home?.noTherapistsAvailable || 'No therapists available in your area at the moment.'}</p>
                                {autoDetectedLocation && (
                                    <p className="text-gray-400 text-sm mt-2">
                                        Showing providers within 15km of your location
                                    </p>
                                )}
                            </div>
                        )}
                        
                        {/* Testimonials Section - After therapist cards */}
                        <div className="mt-12 mb-8 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 shadow-lg">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {translationsObject?.home?.testimonials?.title || 'Trusted by Women Therapists & Clients'}
                                </h3>
                                <p className="text-gray-600">
                                    {translationsObject?.home?.testimonials?.subtitle || 'Real stories from our community'}
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(translationsObject?.home?.testimonials?.stories || [
                                    {
                                        name: 'Sarah M.',
                                        role: 'Therapist, Ubud',
                                        text: 'As a single mother, IndaStreet gave me flexibility to earn from home. I get 15-20 bookings weekly and clients feel safe because of the verification system.',
                                        avatar: '👩‍⚕️'
                                    },
                                    {
                                        name: 'Winda L.',
                                        role: 'Therapist, Seminyak',
                                        text: 'The platform is so easy - I just set my availability and clients book me directly. Women clients love that they can choose female therapists.',
                                        avatar: '👩‍💼'
                                    },
                                    {
                                        name: 'Ela K.',
                                        role: 'Therapist, Canggu',
                                        text: 'I was nervous about home service massage, but IndaStreet GPS tracking and client verification made me feel protected. Now I have 500+ bookings!',
                                        avatar: '🌸'
                                    },
                                    {
                                        name: 'Jessica T.',
                                        role: 'Client, Australia',
                                        text: 'Felt very safe booking a female therapist for prenatal massage. The reviews from other women helped me choose the perfect therapist.',
                                        avatar: '🤰'
                                    }
                                ]).map((story: any, index: number) => (
                                    <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="text-4xl">{story.avatar}</div>
                                            <div className="flex-1">
                                                <p className="text-gray-700 text-sm mb-2 italic">\"{story.text}\"</p>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{story.name}</p>
                                                    <p className="text-gray-500 text-xs">{story.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}</div>
                            
                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                                    <span className="text-green-600 font-semibold">✓</span> Verified Therapists
                                </div>
                                <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                                    <span className="text-green-600 font-semibold">✓</span> GPS Tracking
                                </div>
                                <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                                    <span className="text-green-600 font-semibold">✓</span> Real Reviews
                                </div>
                                <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                                    <span className="text-green-600 font-semibold">✓</span> Female Therapist Options
                                </div>
                            </div>
                        </div>
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
                    <div className="max-w-full overflow-x-hidden">
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
                                console.log(`🏨 Massage Places Tab → total: ${total}, live: ${live}`);
                            } catch {}
                            
                            const livePlaces = (places?.filter((place: any) => {
                                // Filter by live status first
                                if (!place.isLive) return false;
                                
                                // Always show featured sample places (Sample Massage Spa) in ALL cities
                                if (isFeaturedSample(place, 'place')) {
                                    console.log(`✅ Including featured place "${place.name}" in city "${selectedCity}" (Sample Massage Spa shows everywhere in Indonesia)`);
                                    return true;
                                }
                                
                                // Apply city filtering if not 'all'
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
                                        {autoDetectedLocation && (
                                            <p className="text-xs text-gray-300 mt-2">
                                                Showing places within 15km of your location
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-300 mt-4">Total places in DB: {places?.length || 0} | Nearby: {nearbyPlaces.length} | Live: {livePlaces.length}</p>
                                    </div>
                                );
                            }
                            
                            return (
                                <div className="space-y-4 max-w-full overflow-hidden">
                                    {livePlaces
                                        .slice(0, 9) // Show maximum 9 places
                                        .map((place, index) => {
                                            const placeId = place.id || (place as any).$id;
                                            
                                            return (
                                                <React.Fragment key={placeId}>
                                                <MassagePlaceHomeCard
                                                    place={place}
                                                    onClick={(p) => {
                                                        console.log('🟢 HOMEPAGE ONCLICK HANDLER:', {
                                                            placeId: p.id || p.$id,
                                                            placeName: p.name
                                                        });
                                                        // Set selected place first (for AppRouter to access)
                                                        onSelectPlace(p);
                                                        
                                                        // Build URL with ID and slug
                                                        const placeId = p.id || p.$id;
                                                        const slug = p.name?.toLowerCase().replace(/\s+/g, '-') || 'place';
                                                        const profileUrl = `/profile/place/${placeId}-${slug}`;
                                                        console.log('🔗 PUSHING URL:', profileUrl);
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

                {/* Facials Tab - Show facial places */}
                {activeTab === 'facials' && (
                    <div className="max-w-full overflow-x-hidden">
                        <div className="mb-3 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{t?.home?.facialClinics || 'Facial Clinics'}</h3>
                            <p className="text-gray-600">
                                {selectedCity === 'all' 
                                    ? (t?.home?.facialClinicsSubtitle || 'Find the best facial clinics across Indonesia')
                                    : (t?.home?.facialClinicsSubtitleCity?.replace('{city}', selectedCity) || `Premium facial treatments in ${selectedCity}`)
                                }
                            </p>
                        </div>
                        
                        {/* Show facial places from Appwrite */}
                        {(() => {
                            // Filter facial places by live status and city
                            const liveFacialPlaces = (facialPlaces?.filter((place: any) => {
                                // Always show featured sample places (Sample Massage Spa) in ALL cities
                                if (isFeaturedSample(place, 'place')) {
                                    console.log(`✅ Including featured place "${place.name}" in Facial Places tab for city "${selectedCity}"`);
                                    return true;
                                }
                                
                                // All facial places from the collection are assumed live
                                // Apply city filtering if not 'all'
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

                            // Sort facial places by status: Available/Open → Busy → Offline/Closed
                            const getFacialPlaceStatusScore = (p: any) => {
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
                            liveFacialPlaces.sort((a, b) => getFacialPlaceStatusScore(b) - getFacialPlaceStatusScore(a));

                            console.log('🔍 Facial Places on HomePage:', {
                                total: facialPlaces?.length || 0,
                                liveFacialPlaces: liveFacialPlaces.length,
                                selectedCity,
                                facialPlaceNames: liveFacialPlaces.map((p: any) => p.name)
                            });
                            
                            if (liveFacialPlaces.length === 0) {
                                return (
                                    <div className="text-center py-12">
                                        <div className="mb-4">
                                            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 mb-2 text-lg font-semibold">
                                            {t?.home?.noFacialClinicsAvailable || 'No facial clinics available'}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            {t?.home?.checkBackFacials || 'Check back soon for featured facial spas!'}
                                        </p>
                                        <p className="text-xs text-gray-300 mt-4">
                                            Total facial places in DB: {facialPlaces?.length || 0} | Filtered: {liveFacialPlaces.length}
                                        </p>
                                    </div>
                                );
                            }
                            
                            return (
                                <div className="space-y-4 max-w-full overflow-hidden">
                                    {liveFacialPlaces
                                        .slice(0, 9) // Show maximum 9 facial places
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
                    max-width: 100vw;
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

            {/* Women Reviews Modal */}
            {showWomenReviews && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setShowWomenReviews(false)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-slideUp"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 md:p-6">
                            <div className="flex justify-between items-center mb-4 md:mb-6">
                                <h3 className="text-lg md:text-2xl font-bold text-gray-900 flex items-center gap-3">
                                    <img 
                                        src="https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258" 
                                        alt="Indastreet Logo" 
                                        className="w-24 h-24 md:w-32 md:h-32 object-contain"
                                    />
                                    <span className="text-base md:text-2xl">{translationsObject?.home?.fabMenu?.womenReviews || 'Tops The Reviews'}</span>
                                </h3>
                                <button
                                    onClick={() => setShowWomenReviews(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl flex-shrink-0"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="space-y-4">
                                {/* Review 1 */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <div className="flex items-start gap-3 mb-3">
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/avatar%2016.png?updatedAt=1764959984734" 
                                            alt="Sarah M." 
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-gray-900">Sarah M.</h4>
                                                <span className="text-sm text-gray-500">2 days ago</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                                                <span className="text-sm text-gray-600 ml-2">Traditional Balinese</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">
                                        "Amazing experience! As a solo female traveler, I felt completely safe. The therapist was professional, arrived on time, and the massage was exactly what I needed after days of exploring Ubud. Highly recommend for women traveling alone!"
                                    </p>
                                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                                        <span className="bg-white px-3 py-1 rounded-full">Ubud</span>
                                        <span className="bg-white px-3 py-1 rounded-full">Female Therapist</span>
                                    </div>
                                </div>

                                {/* Review 2 */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <div className="flex items-start gap-3 mb-3">
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/avatar%204.png?updatedAt=1764959623724" 
                                            alt="Jessica L." 
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-gray-900">Jessica L.</h4>
                                                <span className="text-sm text-gray-500">5 days ago</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                                                <span className="text-sm text-gray-600 ml-2">Prenatal Massage</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">
                                        "I'm 7 months pregnant and was worried about finding a proper prenatal massage. The platform made it so easy to filter for certified prenatal therapists. She was gentle, knowledgeable, and made me feel so comfortable. Perfect!"
                                    </p>
                                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                                        <span className="bg-white px-3 py-1 rounded-full">Seminyak</span>
                                        <span className="bg-white px-3 py-1 rounded-full">Verified</span>
                                    </div>
                                </div>

                                {/* Review 3 */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <div className="flex items-start gap-3 mb-3">
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/avatar%209.png?updatedAt=1764959762087" 
                                            alt="Emma K." 
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-gray-900">Emma K.</h4>
                                                <span className="text-sm text-gray-500">1 week ago</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                                                <span className="text-sm text-gray-600 ml-2">Deep Tissue</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">
                                        "I work remotely and have terrible back pain from sitting all day. The therapist knew exactly where the tension was and worked it out perfectly. GPS tracking gave me peace of mind. Will definitely book again!"
                                    </p>
                                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                                        <span className="bg-white px-3 py-1 rounded-full">Canggu</span>
                                        <span className="bg-white px-3 py-1 rounded-full">3+ Bookings</span>
                                    </div>
                                </div>

                                {/* Review 4 */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <div className="flex items-start gap-3 mb-3">
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/avatar%202.png?updatedAt=1764959549336" 
                                            alt="Priya S." 
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-gray-900">Priya S.</h4>
                                                <span className="text-sm text-gray-500">1 week ago</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                                                <span className="text-sm text-gray-600 ml-2">Aromatherapy</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">
                                        "Best massage I've had in Bali! The aromatherapy oils were divine and the therapist was so professional. Being able to read reviews from other women made the decision easy. 100% recommend this platform!"
                                    </p>
                                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                                        <span className="bg-white px-3 py-1 rounded-full">Sanur</span>
                                        <span className="bg-white px-3 py-1 rounded-full">Female Therapist</span>
                                    </div>
                                </div>

                                {/* Review 5 */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <div className="flex items-start gap-3 mb-3">
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/avatar%2014.png?updatedAt=1764959919170" 
                                            alt="Mia T." 
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-gray-900">Mia T.</h4>
                                                <span className="text-sm text-gray-500">2 weeks ago</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                                                <span className="text-sm text-gray-600 ml-2">Hot Stone Massage</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">
                                        "Traveling with my girlfriends and we all booked massages together. The booking system was super easy, and the therapists arrived as a team. Everyone was professional and respectful. Great experience for our girls trip!"
                                    </p>
                                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                                        <span className="bg-white px-3 py-1 rounded-full">Nusa Dua</span>
                                        <span className="bg-white px-3 py-1 rounded-full">Group Booking</span>
                                    </div>
                                </div>

                                {/* Trust Badge */}
                                <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-4 text-center border border-pink-200">
                                    <p className="text-sm font-medium text-gray-700">
                                        ✓ All therapists verified • GPS tracked • Real reviews • Safe for women travelers
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Advanced Search Modal */}
            {showAdvancedSearch && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setShowAdvancedSearch(false)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-slideUp"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 md:p-6">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-4 md:mb-6">
                                <h3 className="text-lg md:text-2xl font-bold text-gray-900">
                                    🔍 {translationsObject?.home?.fabMenu?.advancedSearch || 'Advanced Filters'}
                                </h3>
                                <button
                                    onClick={() => setShowAdvancedSearch(false)}
                                    className="text-gray-400 hover:text-gray-600 text-3xl leading-none flex-shrink-0"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Therapist Gender Section */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <span>👤</span> Therapist Gender
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => {
                                                setSelectedTherapistGender(selectedTherapistGender === 'female' ? null : 'female');
                                                setShowFemaleOnly(selectedTherapistGender !== 'female');
                                            }}
                                            className={`px-4 py-3 rounded-xl font-medium text-sm transition-all text-white ${
                                                selectedTherapistGender === 'female'
                                                    ? 'bg-orange-500'
                                                    : 'bg-black'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center gap-1">
                                                <img 
                                                    src="https://ik.imagekit.io/7grri5v7d/male_icon-removebg-preview.png" 
                                                    alt="Female" 
                                                    className="w-10 h-10 object-contain"
                                                />
                                                <span>Female</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setSelectedTherapistGender(selectedTherapistGender === 'male' ? null : 'male')}
                                            className={`px-4 py-3 rounded-xl font-medium text-sm transition-all text-white ${
                                                selectedTherapistGender === 'male'
                                                    ? 'bg-orange-500'
                                                    : 'bg-black'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center gap-1">
                                                <img 
                                                    src="https://ik.imagekit.io/7grri5v7d/male_icon-removebg-preview.png" 
                                                    alt="Male" 
                                                    className="w-10 h-10 object-contain"
                                                />
                                                <span>Male</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-200"></div>

                                {/* Service For Section */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <span>⬤</span> Service For
                                    </h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => setSelectedServiceFor(selectedServiceFor === 'women' ? null : 'women')}
                                            className="p-2 rounded-xl font-medium text-sm transition-all h-32 bg-white"
                                        >
                                            <div className="relative w-full h-full">
                                                <img 
                                                    src="https://ik.imagekit.io/7grri5v7d/male_sss-removebg-preview.png?updatedAt=1767917134858" 
                                                    alt="Female" 
                                                    className="w-full h-full object-contain"
                                                />
                                                <span className={`absolute bottom-[20px] left-0 right-0 text-center font-semibold ${selectedServiceFor === 'women' ? 'text-orange-500' : 'text-white'}`}>Female</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setSelectedServiceFor(selectedServiceFor === 'men' ? null : 'men')}
                                            className="p-2 rounded-xl font-medium text-sm transition-all h-32 bg-white"
                                        >
                                            <div className="relative w-full h-full">
                                                <img 
                                                    src="https://ik.imagekit.io/7grri5v7d/male_ss-removebg-preview.png?updatedAt=1767916905973" 
                                                    alt="Men" 
                                                    className="w-full h-full object-contain"
                                                />
                                                <span className={`absolute bottom-[20px] left-0 right-0 text-center font-semibold ${selectedServiceFor === 'men' ? 'text-orange-500' : 'text-white'}`}>Men</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setSelectedServiceFor(selectedServiceFor === 'children' ? null : 'children')}
                                            className="p-2 rounded-xl font-medium text-sm transition-all h-32 bg-white"
                                        >
                                            <div className="relative w-full h-full">
                                                <img 
                                                    src="https://ik.imagekit.io/7grri5v7d/male_ssss-removebg-preview.png?updatedAt=1767917265176" 
                                                    alt="Children" 
                                                    className="w-full h-full object-contain"
                                                />
                                                <span className={`absolute bottom-[20px] left-0 right-0 text-center font-semibold ${selectedServiceFor === 'children' ? 'text-orange-500' : 'text-white'}`}>Children</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-200"></div>

                                {/* Massage Type Dropdown Section */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <span>⬤</span> Massage Type
                                    </h4>
                                    <select
                                        value={selectedMassageType}
                                        onChange={(e) => setSelectedMassageType(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl font-medium text-sm border-2 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-no-repeat bg-right pr-10"
                                        style={{
                                            backgroundColor: selectedMassageType ? '#fff7ed' : '#ffffff',
                                            borderColor: selectedMassageType ? '#f97316' : '#d1d5db',
                                            color: selectedMassageType ? '#ea580c' : '#6b7280',
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${selectedMassageType ? '%23f97316' : '%236b7280'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                            backgroundSize: '1.5rem',
                                            backgroundPosition: 'right 0.75rem center'
                                        }}
                                    >
                                        <option value="">Select massage type...</option>
                                        <option value="traditional-balinese">Traditional Balinese</option>
                                        <option value="deep-tissue">Deep Tissue</option>
                                        <option value="aromatherapy">Aromatherapy</option>
                                        <option value="hot-stone">Hot Stone</option>
                                        <option value="prenatal">Prenatal</option>
                                        <option value="sports-massage">Sports Massage</option>
                                        <option value="swedish">Swedish Massage</option>
                                        <option value="thai-massage">Thai Massage</option>
                                        <option value="reflexology">Reflexology</option>
                                        <option value="shiatsu">Shiatsu</option>
                                        <option value="couples-massage">Couples Massage</option>
                                        <option value="four-hands">Four Hands Massage</option>
                                    </select>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-200"></div>

                                {/* Special Features Section */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <span>⬤</span> Special Features
                                    </h4>
                                    <select
                                        value={selectedSpecialFeature}
                                        onChange={(e) => setSelectedSpecialFeature(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl font-medium text-sm border-2 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-no-repeat bg-right pr-10"
                                        style={{
                                            backgroundColor: selectedSpecialFeature ? '#fff7ed' : '#ffffff',
                                            borderColor: selectedSpecialFeature ? '#f97316' : '#d1d5db',
                                            color: selectedSpecialFeature ? '#ea580c' : '#6b7280',
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${selectedSpecialFeature ? '%23f97316' : '%236b7280'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                            backgroundSize: '1.5rem',
                                            backgroundPosition: 'right 0.75rem center'
                                        }}
                                    >
                                        <option value="">Select special feature...</option>
                                        <option value="verified-only">Verified Only</option>
                                        <option value="with-facial">With Facial</option>
                                        <option value="highly-rated">Highly Rated (4.5+)</option>
                                        <option value="coin-rub">Coin Rub Therapy</option>
                                        <option value="body-scrub">Body Scrub</option>
                                        <option value="hot-stones">Hot Stones</option>
                                        <option value="aromatherapy">Aromatherapy Oils</option>
                                        <option value="deep-pressure">Deep Pressure</option>
                                        <option value="home-service">Home Service Available</option>
                                    </select>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-200"></div>

                                {/* Price Range Section */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <span>⬤</span> Price Range
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-medium text-gray-600">IDR {priceRange[0].toLocaleString('id-ID')}</span>
                                            <span className="font-medium text-gray-600">IDR {priceRange[1].toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="range"
                                                min="100000"
                                                max="450000"
                                                step="10000"
                                                value={priceRange[0]}
                                                onChange={(e) => setPriceRange([Math.min(parseInt(e.target.value), priceRange[1] - 10000), priceRange[1]])}
                                                className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-10"
                                                style={{
                                                    background: 'transparent',
                                                }}
                                            />
                                            <input
                                                type="range"
                                                min="100000"
                                                max="450000"
                                                step="10000"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], Math.max(parseInt(e.target.value), priceRange[0] + 10000)])}
                                                className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-10"
                                                style={{
                                                    background: 'transparent',
                                                }}
                                            />
                                            <div className="relative h-2 bg-gray-200 rounded-full">
                                                <div 
                                                    className="absolute h-2 bg-orange-500 rounded-full"
                                                    style={{
                                                        left: `${((priceRange[0] - 100000) / 350000) * 100}%`,
                                                        right: `${100 - ((priceRange[1] - 100000) / 350000) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                        <style dangerouslySetInnerHTML={{__html: `
                                            input[type="range"]::-webkit-slider-thumb {
                                                appearance: none;
                                                width: 20px;
                                                height: 20px;
                                                border-radius: 50%;
                                                background: #f97316;
                                                cursor: pointer;
                                                pointer-events: all;
                                                border: 3px solid white;
                                                box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                                            }
                                            input[type="range"]::-moz-range-thumb {
                                                width: 20px;
                                                height: 20px;
                                                border-radius: 50%;
                                                background: #f97316;
                                                cursor: pointer;
                                                pointer-events: all;
                                                border: 3px solid white;
                                                box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                                            }
                                        `}} />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        // Reset all filters
                                        setSelectedTherapistGender(null);
                                        setSelectedServiceFor(null);
                                        setSelectedMassageType('');
                                        setSelectedSpecialFeature('');
                                        setPriceRange([100000, 450000]);
                                        setShowFemaleOnly(false);
                                    }}
                                    className="flex-1 px-6 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => setShowAdvancedSearch(false)}
                                    className="flex-1 px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md transition-all"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Help & FAQ Modal */}
            {showHelpFaq && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setShowHelpFaq(false)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-slideUp"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 md:p-6">
                            <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-gray-200 pb-4">
                                <h3 className="text-lg md:text-2xl font-bold text-gray-900">
                                    ❓ {translationsObject?.home?.fabMenu?.helpFaq || 'Help & FAQ'}
                                </h3>
                                <button
                                    onClick={() => setShowHelpFaq(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl flex-shrink-0"
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="space-y-6">
                                {/* Booking Section */}
                                <div className="space-y-3">
                                    <h4 className="text-lg font-bold text-orange-600 flex items-center gap-2">
                                        📅 Booking & Appointments
                                    </h4>
                                    <div className="space-y-3 pl-4">
                                        <div className="border-l-4 border-orange-200 pl-4 py-2">
                                            <p className="font-semibold text-gray-900">How do I book a therapist?</p>
                                            <p className="text-sm text-gray-600 mt-1">Click on any therapist card, view their profile, and click "Book Now". You can choose your preferred date, time, and location.</p>
                                        </div>
                                        <div className="border-l-4 border-orange-200 pl-4 py-2">
                                            <p className="font-semibold text-gray-900">Can I cancel or reschedule?</p>
                                            <p className="text-sm text-gray-600 mt-1">Yes! Use the live chat with your therapist to request changes before your appointment time. The chat window stays active until your scheduled booking date/time.</p>
                                        </div>
                                        <div className="border-l-4 border-orange-200 pl-4 py-2">
                                            <p className="font-semibold text-gray-900">How do I modify my booking time?</p>
                                            <p className="text-sm text-gray-600 mt-1">Contact your therapist through the live chat feature to discuss any time changes. They'll confirm the new schedule directly with you in the chat.</p>
                                        </div>
                                        <div className="border-l-4 border-orange-200 pl-4 py-2">
                                            <p className="font-semibold text-gray-900">What if therapist is busy?</p>
                                            <p className="text-sm text-gray-600 mt-1">You can still send a booking request! Busy therapists will respond when available, usually within 1-2 hours.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Section */}
                                <div className="space-y-3">
                                    <h4 className="text-lg font-bold text-orange-600 flex items-center gap-2">
                                        💳 Payment & Pricing
                                    </h4>
                                    <div className="space-y-3 pl-4">
                                        <div className="border-l-4 border-orange-200 pl-4 py-2">
                                            <p className="font-semibold text-gray-900">What payment methods are accepted?</p>
                                            <p className="text-sm text-gray-600 mt-1">Cash or bank transfer only. For bank transfer, the therapist's bank details will be displayed in the chat. Payment is made directly to the therapist after service.</p>
                                        </div>
                                        <div className="border-l-4 border-orange-200 pl-4 py-2">
                                            <p className="font-semibold text-gray-900">Are prices negotiable?</p>
                                            <p className="text-sm text-gray-600 mt-1">Prices shown are set by therapists. Some may offer discounts for longer sessions or regular clients - check their profile for special offers.</p>
                                        </div>
                                        <div className="border-l-4 border-orange-200 pl-4 py-2">
                                            <p className="font-semibold text-gray-900">Is there a booking fee?</p>
                                            <p className="text-sm text-gray-600 mt-1">No! Indastreet is free to use. You only pay the therapist's service price directly to them.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Safety Section */}
                                <div className="space-y-3">
                                    <h4 className="text-lg font-bold text-orange-600 flex items-center gap-2">
                                        🛡️ Safety & Verification
                                    </h4>
                                    <div className="space-y-3 pl-4">
                                        <div className="border-l-4 border-orange-200 pl-4 py-2">
                                            <p className="font-semibold text-gray-900">How are therapists verified?</p>
                                            <p className="text-sm text-gray-600 mt-1">Verified therapists have submitted ID, certifications, and passed background checks. Look for the bronze crest with checkmark before their name.</p>
                                        </div>
                                        <div className="border-l-4 border-orange-200 pl-4 py-2">
                                            <p className="font-semibold text-gray-900">Is GPS tracking available?</p>
                                            <p className="text-sm text-gray-600 mt-1">Yes! For home services, you can track your therapist's location in real-time. Your location is also shared with the therapist for safety.</p>
                                        </div>
                                        <div className="border-l-4 border-orange-200 pl-4 py-2">
                                            <p className="font-semibold text-gray-900">What if I have a problem?</p>
                                            <p className="text-sm text-gray-600 mt-1">Contact our 24/7 support team via chat or email support@indastreet.com. We'll resolve any issues immediately.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Services Section */}
                                <div className="space-y-3">
                                    <h4 className="text-lg font-bold text-orange-600 flex items-center gap-2">
                                        💆 Services & Locations
                                    </h4>
                                    <div className="space-y-3 pl-4">
                                        <div className="border-l-4 border-orange-200 pl-4 py-2">
                                            <p className="font-semibold text-gray-900">Do therapists come to my location?</p>
                                            <p className="text-sm text-gray-600 mt-1">Most therapists offer home service! Check their profile for "Home Service Available" badge. Some work at spas only.</p>
                                        </div>
                                        <div className="border-l-4 border-orange-200 pl-4 py-2">
                                            <p className="font-semibold text-gray-900">What cities are covered?</p>
                                            <p className="text-sm text-gray-600 mt-1">We operate in Bali (Ubud, Canggu, Seminyak), Jakarta, Yogyakarta, and expanding to all major Indonesian cities.</p>
                                        </div>
                                        <div className="border-l-4 border-orange-200 pl-4 py-2">
                                            <p className="font-semibold text-gray-900">What massage types are available?</p>
                                            <p className="text-sm text-gray-600 mt-1">Balinese, Deep Tissue, Aromatherapy, Hot Stone, Prenatal, Sports, Swedish, Thai, Reflexology, Shiatsu, and more. Use Advanced Filters to find your type.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Section */}
                                <div className="space-y-3">
                                    <h4 className="text-lg font-bold text-orange-600 flex items-center gap-2">
                                        👤 Account & Reviews
                                    </h4>
                                    <div className="space-y-3 pl-4">
                                        <div className="border-l-4 border-orange-200 pl-4 py-2">
                                            <p className="font-semibold text-gray-900">Do I need an account to book?</p>
                                            <p className="text-sm text-gray-600 mt-1">No account needed! Just provide your active WhatsApp number, name, and set your location. All bookings are monitored for safety.</p>
                                        </div>
                                        <div className="border-l-4 border-orange-200 pl-4 py-2">
                                            <p className="font-semibold text-gray-900">How do I leave a review?</p>
                                            <p className="text-sm text-gray-600 mt-1">After your appointment, you'll receive a notification to rate and review. Your feedback helps other customers and therapists improve.</p>
                                        </div>
                                        <div className="border-l-4 border-orange-200 pl-4 py-2">
                                            <p className="font-semibold text-gray-900">Can I become a therapist on Indastreet?</p>
                                            <p className="text-sm text-gray-600 mt-1">Yes! Click "Therapist Portal" in the menu and submit your application. We review all applications within 24 hours.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Section */}
                                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 mt-6">
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">📞 Still need help?</h4>
                                    <p className="text-sm text-gray-700 mb-3">For questions or concerns about service, we strongly advise contacting the member directly through chat.</p>
                                    <div className="space-y-2 text-sm">
                                        <p className="flex items-center gap-2">
                                            <span className="text-orange-600">📧</span>
                                            <span className="font-medium">Email:</span>
                                            <span className="text-orange-600">indastreet.id@gmail.com</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="text-orange-600">⏰</span>
                                            <span className="font-medium">Response Time:</span>
                                            <span className="text-gray-600">24-48 hours</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="text-orange-600">💡</span>
                                            <span className="font-medium">Best Option:</span>
                                            <span className="text-gray-600">Contact therapist directly via chat for service questions</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top 5 Therapists Modal */}
            {showTopTherapists && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setShowTopTherapists(false)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-slideUp"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 md:p-6">
                            <div className="flex justify-between items-center mb-4 md:mb-6">
                                <h3 className="text-lg md:text-2xl font-bold text-gray-900">
                                    🏆 {translationsObject?.home?.fabMenu?.topTherapists || 'Top 5 Therapists'}
                                </h3>
                                <button
                                    onClick={() => setShowTopTherapists(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl flex-shrink-0"
                                >
                                    ×
                                </button>
                            </div>
                            
                            {(() => {
                                // Calculate top 5 therapists based on bookings and rating
                                // ✅ IMPORTANT: Shows ALL therapists regardless of status (available, busy, or offline)
                                const calculateTop5 = () => {
                                    // Filter therapists by current location only - NO booking range restriction
                                    // NO status filtering - includes available, busy, and offline therapists
                                    let locationTherapists = cityFilteredTherapists.filter((t: any) => {
                                        // Check if therapist matches selected location
                                        const matchesLocation = selectedCity === 'all' || 
                                            t.city?.toLowerCase() === selectedCity.toLowerCase() ||
                                            t.location?.toLowerCase().includes(selectedCity.toLowerCase());
                                        
                                        // ✅ Always show therapist regardless of status (available/busy/offline)
                                        // ✅ No booking range restriction - shows therapists with any booking count
                                        return matchesLocation;
                                    });

                                    // Calculate score for each therapist
                                    const scoredTherapists = locationTherapists.map((t: any) => {
                                        let score = 0;
                                        
                                        // 1. Booking count (highest weight) - any booking count accepted
                                        const bookings = parseInt(t.orderCount || t.bookingCount || t.totalBookings || '0');
                                        score += bookings * 100;
                                        
                                        // 2. Online time in last 30 days
                                        if (t.lastSeen) {
                                            const now = new Date();
                                            const lastSeen = new Date(t.lastSeen);
                                            const daysAgo = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24);
                                            if (daysAgo <= 30) {
                                                score += (30 - daysAgo) * 10;
                                            }
                                        }
                                        
                                        // 3. Rating boost (must display actual rating)
                                        const rating = parseFloat(t.averageRating || t.rating || '0');
                                        score += rating * 20;
                                        
                                        // 4. Verified boost
                                        if (t.isVerified) score += 50;
                                        
                                        return { ...t, _score: score };
                                    });

                                    // Sort by score and take top 5 for this location
                                    return scoredTherapists
                                        .sort((a, b) => b._score - a._score)
                                        .slice(0, 5);
                                };

                                const top5 = calculateTop5();
                                const locationName = selectedCity === 'all' ? 'All Indonesia' : 
                                                    selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1);

                                return (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600 mb-4">
                                            📍 Top 5 therapists in <span className="font-semibold">{locationName}</span> based on bookings and ratings
                                        </p>
                                        
                                        {top5.length === 0 ? (
                                            <p className="text-gray-500 text-center py-12">
                                                No therapists available in this location yet
                                            </p>
                                        ) : (
                                            <div className="space-y-3">
                                                {top5.map((therapist: any, index: number) => {
                                                    // Get actual rating from Appwrite data
                                                    const rating = parseFloat(therapist.averageRating || therapist.rating || '0');
                                                    
                                                    // Generate consistent fake booking count for new therapists (18-26) - same logic as profile card
                                                    const getInitialBookingCount = (therapistId: string): number => {
                                                        let hash = 0;
                                                        for (let i = 0; i < therapistId.length; i++) {
                                                            hash = ((hash << 5) - hash) + therapistId.charCodeAt(i);
                                                            hash = hash & hash;
                                                        }
                                                        return 18 + (Math.abs(hash) % 9);
                                                    };
                                                    
                                                    // Get booking count - match profile card display logic
                                                    const rawBookings = parseInt(therapist.orderCount || therapist.bookingCount || therapist.totalBookings || '0');
                                                    const bookings = rawBookings === 0 ? getInitialBookingCount(String(therapist.$id || therapist.id || '')) : rawBookings;
                                                    
                                                    const services = String(therapist.services || therapist.massageTypes || therapist.specialties || '')
                                                        .replace(/[\[\]]/g, '') // Remove brackets
                                                        .split(',')
                                                        .slice(0, 3);
                                                    
                                                    // Get profile image from Appwrite data
                                                    const profileImageUrl = therapist.profileImage || 
                                                                          therapist.image || 
                                                                          therapist.profilePicture || 
                                                                          therapist.avatar ||
                                                                          therapist.photo ||
                                                                          'https://via.placeholder.com/100';
                                                    
                                                    return (
                                                        <div 
                                                            key={therapist.$id || index}
                                                            className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-white rounded-xl border-2 border-orange-100 hover:border-orange-300 transition-all shadow-sm hover:shadow-md"
                                                        >
                                                            {/* Rank Badge */}
                                                            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-xl rounded-full shadow-md">
                                                                {index + 1}
                                                            </div>
                                                            
                                                            {/* Profile Image from Appwrite */}
                                                            <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 relative">
                                                                <img 
                                                                    src={profileImageUrl}
                                                                    alt={therapist.name}
                                                                    className="w-full h-full object-cover rounded-xl shadow-md"
                                                                    loading="eager"
                                                                    decoding="async"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        if (!target.dataset.fallbackAttempted) {
                                                                            target.dataset.fallbackAttempted = 'true';
                                                                            target.src = 'https://via.placeholder.com/100?text=No+Image';
                                                                        }
                                                                    }}
                                                                />
                                                                {therapist.isVerified && (
                                                                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1 shadow-md" title="Verified">
                                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Info Section */}
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-bold text-lg text-gray-900 truncate">
                                                                    {therapist.name}
                                                                </h4>
                                                                
                                                                {/* Rating - Display actual star rating from Appwrite */}
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <div className="flex items-center">
                                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                                            <svg
                                                                                key={star}
                                                                                className={`w-4 h-4 ${star <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                                                fill="currentColor"
                                                                                viewBox="0 0 20 20"
                                                                            >
                                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                            </svg>
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-sm font-bold text-gray-900">{rating.toFixed(1)} ⭐</span>
                                                                    <span className="text-sm text-gray-500">• {bookings}+ Orders</span>
                                                                </div>
                                                                
                                                                {/* Services */}
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {services.filter(s => s.trim()).map((service: string, idx: number) => (
                                                                        <span 
                                                                            key={idx}
                                                                            className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full"
                                                                        >
                                                                            {service.trim()}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            
                                                            {/* View Profile Button */}
                                                            <div className="flex-shrink-0">
                                                                <button
                                                                    onClick={() => {
                                                                        setShowTopTherapists(false);
                                                                        if (onSelectTherapist) {
                                                                            onSelectTherapist(therapist);
                                                                        } else {
                                                                            window.location.href = `/therapist/${therapist.$id}`;
                                                                        }
                                                                    }}
                                                                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                                                                >
                                                                    View Profile
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Special Offers Modal */}
            {showSpecialOffers && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => {
                        setShowSpecialOffers(false);
                        setSelectedOffer(null);
                        setCopiedCode(null);
                    }}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-slideUp"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 md:p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <img 
                                        src="https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258" 
                                        alt="Indastreet Logo" 
                                        className="w-[113px] h-[113px] object-contain"
                                    />
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            {translationsObject?.home?.fabMenu?.specialOffers || 'Special Offers'}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Indastreet Welcomes all new customers with special booking discounts
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowSpecialOffers(false);
                                        setSelectedOffer(null);
                                        setCopiedCode(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Info Banner */}
                            <div className="bg-orange-50 border-l-4 border-orange-600 p-4 mb-6 rounded">
                                <p className="text-sm text-gray-700">
                                    🎁 <span className="font-semibold">One-time use per offer:</span> Each WhatsApp number can use each discount code once. Click any banner to view details and copy the code.
                                </p>
                            </div>

                            {/* Banners Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(() => {
                                    const offers = [
                                        {
                                            id: 1,
                                            code: 'Ids-120',
                                            discount: '7%',
                                            title: '120 Minute Booking',
                                            description: '7% off any 120-minute massage booking',
                                            condition: 'Valid for first-time use of this code',
                                            image: 'https://ik.imagekit.io/7grri5v7d/massage%20type%206.png'
                                        },
                                        {
                                            id: 2,
                                            code: 'Ids-710',
                                            discount: '10%',
                                            title: 'Scheduled Booking',
                                            description: '10% off any scheduled booking',
                                            condition: 'Valid for first-time use of this code',
                                            image: 'https://ik.imagekit.io/7grri5v7d/massage%20type%205.png'
                                        },
                                        {
                                            id: 3,
                                            code: 'Ids-808',
                                            discount: '8%',
                                            title: 'Hotel & Villa',
                                            description: '8% off first Hotel or Villa booking',
                                            condition: 'Valid for first-time use of this code',
                                            image: 'https://ik.imagekit.io/7grri5v7d/massage%20type%204.png'
                                        },
                                        {
                                            id: 4,
                                            code: 'Ids-505',
                                            discount: '5%',
                                            title: 'All Services',
                                            description: '5% off all service menu prices',
                                            condition: 'Valid for first-time use of this code',
                                            image: 'https://ik.imagekit.io/7grri5v7d/massage%20type%203.png'
                                        },
                                        {
                                            id: 5,
                                            code: 'Ids-305',
                                            discount: '5%',
                                            title: 'Coin Rub Massage',
                                            description: '5% off first Coin Rub massage',
                                            condition: 'Valid for first-time use of this code',
                                            image: 'https://ik.imagekit.io/7grri5v7d/massage%20type%202.png'
                                        },
                                        {
                                            id: 6,
                                            code: 'Ids-910',
                                            discount: '10%',
                                            title: 'Traditional Massage',
                                            description: '10% off first traditional massage',
                                            condition: 'Valid for first-time use of this code',
                                            image: 'https://ik.imagekit.io/7grri5v7d/massage%20type%201.png'
                                        }
                                    ];

                                    const handleCopyCode = (code: string) => {
                                        // Copy to clipboard
                                        navigator.clipboard.writeText(code).then(() => {
                                            setCopiedCode(code);
                                            setTimeout(() => setCopiedCode(null), 2000);
                                        });
                                    };

                                    return (
                                        <>
                                            {offers.map((offer) => (
                                                <div
                                                    key={offer.id}
                                                    className="relative bg-white rounded-lg border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer overflow-hidden group"
                                                    onClick={() => setSelectedOffer(offer)}
                                                >
                                                    {/* Banner Image */}
                                                    <div className="relative h-40 overflow-hidden">
                                                        <img
                                                            src={offer.image}
                                                            alt={offer.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            loading="lazy"
                                                        />
                                                        {/* Discount Badge */}
                                                        <div className="absolute top-2 right-2 bg-orange-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                                                            {offer.discount} OFF
                                                        </div>
                                                    </div>

                                                    {/* Offer Details */}
                                                    <div className="p-4">
                                                        <h4 className="font-bold text-gray-900 mb-1">{offer.title}</h4>
                                                        <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-orange-600 font-semibold">Code: {offer.code}</span>
                                                            <span className="text-xs text-gray-500">👆 Click to view</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Enlarged Offer Modal */}
                                            {selectedOffer && (
                                                <div 
                                                    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
                                                    onClick={() => setSelectedOffer(null)}
                                                >
                                                    <div 
                                                        className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slideUp"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {/* Enlarged Banner Image */}
                                                        <div className="relative h-64 overflow-hidden rounded-t-2xl">
                                                            <img
                                                                src={selectedOffer.image}
                                                                alt={selectedOffer.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute top-4 right-4 bg-orange-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                                                                {selectedOffer.discount} OFF
                                                            </div>
                                                            <button
                                                                onClick={() => setSelectedOffer(null)}
                                                                className="absolute top-4 left-4 bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-xl"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>

                                                        {/* Offer Details */}
                                                        <div className="p-6">
                                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedOffer.title}</h3>
                                                            <p className="text-gray-700 mb-4">{selectedOffer.description}</p>
                                                            <p className="text-sm text-gray-500 mb-6">
                                                                ℹ️ {selectedOffer.condition}
                                                            </p>

                                                            {/* Discount Code Display */}
                                                            <div className="bg-gray-100 border-2 border-dashed border-orange-400 rounded-lg p-4 mb-4">
                                                                <p className="text-xs text-gray-600 mb-1">Discount Code:</p>
                                                                <p className="text-2xl font-bold text-orange-600 tracking-wider text-center">
                                                                    {selectedOffer.code}
                                                                </p>
                                                            </div>

                                                            {/* Copy Button */}
                                                            <button
                                                                onClick={() => handleCopyCode(selectedOffer.code)}
                                                                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                                                                    copiedCode === selectedOffer.code
                                                                        ? 'bg-green-600 text-white'
                                                                        : 'bg-orange-600 text-white hover:bg-orange-700'
                                                                }`}
                                                            >
                                                                {copiedCode === selectedOffer.code ? '✓ Code Copied!' : '📋 Copy Code'}
                                                            </button>

                                                            {/* Share Buttons */}
                                                            <div className="mt-3">
                                                                <p className="text-xs text-gray-600 mb-2 text-center">Share this offer with friends:</p>
                                                                <div className="grid grid-cols-4 gap-2">
                                                                    {/* WhatsApp Share */}
                                                                    <button
                                                                        onClick={() => {
                                                                            const message = `🎁 Special Offer from Indastreet!\n\n${selectedOffer.discount} OFF - ${selectedOffer.title}\n${selectedOffer.description}\n\nUse code: ${selectedOffer.code}\n\nBook now: ${window.location.origin}`;
                                                                            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                                                                        }}
                                                                        className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg flex items-center justify-center transition-all"
                                                                        title="Share on WhatsApp"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                                        </svg>
                                                                    </button>

                                                                    {/* Facebook Share */}
                                                                    <button
                                                                        onClick={() => {
                                                                            const url = encodeURIComponent(window.location.origin);
                                                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                                                                        }}
                                                                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center transition-all"
                                                                        title="Share on Facebook"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                                                        </svg>
                                                                    </button>

                                                                    {/* Twitter/X Share */}
                                                                    <button
                                                                        onClick={() => {
                                                                            const text = `🎁 ${selectedOffer.discount} OFF ${selectedOffer.title} at Indastreet! Use code: ${selectedOffer.code}`;
                                                                            const url = encodeURIComponent(window.location.origin);
                                                                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`, '_blank');
                                                                        }}
                                                                        className="bg-black hover:bg-gray-800 text-white py-2 rounded-lg flex items-center justify-center transition-all"
                                                                        title="Share on X (Twitter)"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                                                        </svg>
                                                                    </button>

                                                                    {/* Copy Link */}
                                                                    <button
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(window.location.origin);
                                                                            // Show toast or feedback
                                                                            const btn = document.activeElement as HTMLButtonElement;
                                                                            const originalHTML = btn.innerHTML;
                                                                            btn.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>';
                                                                            setTimeout(() => btn.innerHTML = originalHTML, 1500);
                                                                        }}
                                                                        className="bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg flex items-center justify-center transition-all"
                                                                        title="Copy Link"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Instructions */}
                                                            <div className="mt-4 bg-orange-50 rounded-lg p-3">
                                                                <p className="text-xs text-gray-700">
                                                                    <span className="font-semibold">How to use:</span> Copy the code and enter it in the chat window when booking with your therapist. The discount will be calculated from the service price.
                                                                </p>
                                                            </div>

                                                            {/* Validation Note */}
                                                            <div className="mt-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                                                                <p className="text-xs text-gray-700">
                                                                    ⚠️ <span className="font-semibold">Important:</span> Each code can be used once per WhatsApp number. Ensure your WhatsApp number is correct when booking (10-13 digits).
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Footer Note */}
                            <div className="mt-6 text-center text-xs text-gray-500">
                                <p>💬 Codes are validated when you book through chat.</p>
                            </div>
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
                        <div className="fixed bottom-[140px] right-6 flex flex-col gap-3 z-[60] animate-slideUp">
                            {/* Advanced Search - Moved to top */}
                            <button
                                onClick={() => {
                                    setShowAdvancedSearch(true);
                                    setFabMenuOpen(false);
                                }}
                                className="bg-gray-100 hover:bg-gray-200 shadow-lg rounded-full px-4 py-3 flex items-center gap-2 transition-all duration-200 hover:scale-105"
                                title={translationsObject?.home?.fabMenu?.advancedSearch || 'Advanced Search'}
                            >
                                <span className="text-xl">🔍</span>
                                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                    {translationsObject?.home?.fabMenu?.advancedSearch || 'Advanced Search'}
                                </span>
                            </button>
                            
                            {/* Women Reviews */}
                            <button
                                onClick={() => {
                                    setShowWomenReviews(true);
                                    setFabMenuOpen(false);
                                }}
                                className="bg-gray-100 hover:bg-gray-200 shadow-lg rounded-full px-4 py-3 flex items-center gap-2 transition-all duration-200 hover:scale-105"
                                title={translationsObject?.home?.fabMenu?.womenReviews || 'Indastreet Reviews'}
                            >
                                <span className="text-xl">👩‍💼</span>
                                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                    {translationsObject?.home?.fabMenu?.womenReviews || 'Indastreet Reviews'}
                                </span>
                            </button>
                            
                            {/* Help & FAQ */}
                            <button
                                onClick={() => {
                                    setShowHelpFaq(true);
                                    setFabMenuOpen(false);
                                }}
                                className="bg-gray-100 hover:bg-gray-200 shadow-lg rounded-full px-4 py-3 flex items-center gap-2 transition-all duration-200 hover:scale-105"
                                title={translationsObject?.home?.fabMenu?.helpFaq || 'Help & FAQ'}
                            >
                                <span className="text-xl">❓</span>
                                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                    {translationsObject?.home?.fabMenu?.helpFaq || 'Help & FAQ'}
                                </span>
                            </button>
                            
                            {/* Top 5 Therapists */}
                            <button
                                onClick={() => {
                                    setShowTopTherapists(true);
                                    setFabMenuOpen(false);
                                }}
                                className="bg-gray-100 hover:bg-gray-200 shadow-lg rounded-full px-4 py-3 flex items-center gap-2 transition-all duration-200 hover:scale-105"
                                title={translationsObject?.home?.fabMenu?.topTherapists || 'Top 5 Therapists'}
                            >
                                <span className="text-xl">🏆</span>
                                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                    {translationsObject?.home?.fabMenu?.topTherapists || 'Top 5 Therapists'}
                                </span>
                            </button>
                            
                            {/* Special Offers */}
                            <button
                                onClick={() => {
                                    setShowSpecialOffers(true);
                                    setFabMenuOpen(false);
                                }}
                                className="bg-gray-100 hover:bg-gray-200 shadow-lg rounded-full px-4 py-3 flex items-center gap-2 transition-all duration-200 hover:scale-105"
                                title={translationsObject?.home?.fabMenu?.specialOffers || 'Special Offers'}
                            >
                                <span className="text-xl">⭐</span>
                                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                    {translationsObject?.home?.fabMenu?.specialOffers || 'Special Offers'}
                                </span>
                            </button>
                        </div>
                    )}
                    
                    {/* Main FAB Button */}
                    <div className="fixed bottom-20 right-6 z-[60]">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('FAB Button clicked, current state:', fabMenuOpen);
                            setFabMenuOpen(!fabMenuOpen);
                        }}
                        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
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

            {/* Floating Chat Window - Bottom Right - Always mounted, internally manages visibility */}
            <FloatingChatWindow
                userId={loggedInCustomer?.$id || loggedInCustomer?.id || user?.id || 'guest'}
                userName={loggedInCustomer?.name || loggedInCustomer?.username || user?.name || 'Guest User'}
                userRole="customer"
            />

            {/* PWA Install Banner */}
            <PWAInstallBanner />
        </div>
    );
};

export default HomePage;
