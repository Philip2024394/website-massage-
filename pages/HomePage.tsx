import React, { useState, useEffect, useRef } from 'react';
import type { User, UserLocation, Agent, Place, Therapist, Analytics, UserCoins } from '../types';
import TherapistCard from '../components/TherapistCard';
import MassagePlaceCard from '../components/MassagePlaceCard';
import FacialPlaceCard from '../components/FacialPlaceCard';
import RatingModal from '../components/RatingModal';
// Removed MASSAGE_TYPES_CATEGORIZED import - now using city-based filtering
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import PageContainer from '../components/layout/PageContainer';
import { customLinksService, reviewService } from '../lib/appwriteService';
import { AppDrawer } from '../components/AppDrawerClean';
import { Users, Building, Sparkles } from 'lucide-react';
import HomeIcon from '../components/icons/HomeIcon';
import FlyingButterfly from '../components/FlyingButterfly';
import { getCustomerLocation, findNearbyTherapists, findNearbyPlaces } from '../lib/nearbyProvidersService';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import CityLocationDropdown from '../components/CityLocationDropdown';
import PageNumberBadge from '../components/PageNumberBadge';
import { THERAPIST_MAIN_IMAGES } from '../lib/services/imageService';
import { loadGoogleMapsScript } from '../constants/appConstants';
import { getStoredGoogleMapsApiKey } from '../utils/appConfig';
import { INDONESIAN_CITIES_CATEGORIZED, findCityByName, matchProviderToCity, findCityByCoordinates } from '../constants/indonesianCities';
import { initializeGoogleMaps, isGoogleMapsLoaded } from '../lib/appwrite.config';


interface HomePageProps {
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
    onSetUserLocation: (location: UserLocation) => void;
    onSelectPlace: (place: Place) => void;
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



// Coordinate parsing utility to handle different formats
const parseCoordinates = (coordinates: any): { lat: number; lng: number } | null => {
    if (!coordinates) return null;
    
    // Handle Point format [lng, lat] - Appwrite GeoJSON standard
    if (Array.isArray(coordinates) && coordinates.length === 2) {
        return { lat: coordinates[1], lng: coordinates[0] };
    }
    
    // Handle JSON string format
    if (typeof coordinates === 'string') {
        try {
            const parsed = JSON.parse(coordinates);
            if (parsed.lat && parsed.lng) {
                return { lat: parsed.lat, lng: parsed.lng };
            }
        } catch {}
    }
    
    // Handle object format
    if (coordinates.lat && coordinates.lng) {
        return { lat: coordinates.lat, lng: coordinates.lng };
    }
    
    return null;
};

// Icon used in massage type filter
const ChevronDownIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const HomePage: React.FC<HomePageProps> = ({ 
    loggedInAgent: _loggedInAgent,
    loggedInProvider,
    loggedInCustomer,
    therapists,
    places,
    facialPlaces,
    hotels,
    userLocation,
    selectedCity: propSelectedCity, // Get from prop
    onSetUserLocation, 
    onSelectPlace,
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
    t,
    language
}) => {
    console.log('🏠 HomePage: Component is being called!');
    // Enhanced debug logging for translations
    // Memoize translation conversion to prevent re-renders
    // SAFE: Always returns valid object structure, never undefined
    const translationsObject = React.useMemo(() => {
        console.log('🏠 HomePage received translations:', {
            tExists: !!t,
            tType: typeof t,
            tIsFunction: typeof t === 'function',
            tKeys: t && typeof t === 'object' ? Object.keys(t) : 'not an object',
        });

        // SAFE: Provide default fallback translations
        const defaultTranslations = {
            home: {
                homeServiceTab: 'Home Service',
                massagePlacesTab: 'Massage Places',
                loading: 'Loading...',
                loginSignUp: 'Login / Sign Up',
                noMoreTherapists: 'No more therapists available',
                setLocation: 'Set Location',
                updateLocation: 'Update Location',
                cityLocation: 'City / Location',
                therapistsOnline: 'Therapists Online',
                searchPlaceholder: 'Search...',
                noResults: 'No results found',
                massageDirectory: 'Massage Directory',
                massageDirectoryTitle: 'Browse All Massage Types',
                noTherapistsAvailable: 'No therapists available in your area',
                therapistsTitle: 'Home Massage Therapists',
                therapistsSubtitle: 'Find the best massage therapists',
                massagePlacesTitle: 'Featured Massage Spas',
                massagePlacesSubtitle: 'Find the best massage places',
                noPlacesAvailable: 'No massage places available in your area'
            },
            detail: {},
            common: {}
        };

        // SAFE: Return default if t is missing
        if (!t) {
            console.warn('⚠️ HomePage: No translations provided, using defaults');
            return defaultTranslations;
        }

        // Adapter: Convert translation function to object structure for HomePage compatibility
        if (typeof t === 'function') {
            console.log('🔄 Converting translation function to object structure for HomePage');
            try {
                const homeTranslations = {
                    homeServiceTab: t('home.homeServiceTab') || defaultTranslations.home.homeServiceTab,
                    massagePlacesTab: t('home.massagePlacesTab') || defaultTranslations.home.massagePlacesTab,
                    loading: t('home.loading') || defaultTranslations.home.loading,
                    loginSignUp: t('home.loginSignUp') || defaultTranslations.home.loginSignUp,
                    noMoreTherapists: t('home.noMoreTherapists') || defaultTranslations.home.noMoreTherapists,
                    setLocation: t('home.setLocation') || defaultTranslations.home.setLocation,
                    updateLocation: t('home.updateLocation') || defaultTranslations.home.updateLocation,
                    cityLocation: t('cityLocation') || defaultTranslations.home.cityLocation,
                    therapistsOnline: t('home.therapistsOnline') || defaultTranslations.home.therapistsOnline,
                    searchPlaceholder: t('home.searchPlaceholder') || defaultTranslations.home.searchPlaceholder,
                    noResults: t('home.noResults') || defaultTranslations.home.noResults,
                    massageDirectory: t('home.massageDirectory') || defaultTranslations.home.massageDirectory,
                    massageDirectoryTitle: t('home.massageDirectoryTitle') || defaultTranslations.home.massageDirectoryTitle,
                    noTherapistsAvailable: t('home.noTherapistsAvailable') || defaultTranslations.home.noTherapistsAvailable,
                    therapistsTitle: t('home.therapistsTitle') || defaultTranslations.home.therapistsTitle,
                    therapistsSubtitle: t('home.therapistsSubtitle') || defaultTranslations.home.therapistsSubtitle,
                    massagePlacesTitle: t('home.massagePlacesTitle') || defaultTranslations.home.massagePlacesTitle,
                    massagePlacesSubtitle: t('home.massagePlacesSubtitle') || defaultTranslations.home.massagePlacesSubtitle,
                    noPlacesAvailable: t('home.noPlacesAvailable') || defaultTranslations.home.noPlacesAvailable
                };
                
                console.log('✅ Converted function-based translations to object structure for HomePage');
                return {
                    home: homeTranslations,
                    detail: {},
                    common: {}
                };
            } catch (error) {
                console.error('❌ Error converting translations:', error);
                return defaultTranslations;
            }
        }
        
        // SAFE: If t is object but missing home property, merge with defaults
        if (typeof t === 'object' && !t.home) {
            console.warn('⚠️ HomePage: Translations object missing home property, using defaults');
            return defaultTranslations;
        }
        
        return t;
    }, [t]);

    // Debug data received
    console.log('🏠 HomePage Data Debug:', {
        therapistsCount: therapists?.length || 0,
        placesCount: places?.length || 0,
        therapistsLive: therapists?.filter((t: any) => t.isLive)?.length || 0,
        placesLive: places?.filter((p: any) => p.isLive)?.length || 0,
        hasTherapists: !!therapists && therapists.length > 0,
        hasPlaces: !!places && places.length > 0,
        therapistsSample: therapists?.slice(0, 2),
        placesSample: places?.slice(0, 2)
    });

    const [activeTab, setActiveTab] = useState('home');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState<string>('all');
    const [, setCustomLinks] = useState<any[]>([]);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [, setSelectedTherapist] = useState<Therapist | null>(null);
    const [selectedRatingItem, setSelectedRatingItem] = useState<{item: any, type: 'therapist' | 'place'} | null>(null);
    
    // Location-based filtering state (automatic, no UI)
    const [autoDetectedLocation, setAutoDetectedLocation] = useState<{lat: number, lng: number} | null>(null);
    const [nearbyTherapists, setNearbyTherapists] = useState<Therapist[]>([]);
    const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
    const [nearbyHotels, setNearbyHotels] = useState<any[]>([]);
    const [isLocationDetecting, setIsLocationDetecting] = useState(false);
    // Shuffled unique home page therapist images (no repeats until all 17 used)
    const [shuffledHomeImages, setShuffledHomeImages] = useState<string[]>([]);
    
    // Google Maps Autocomplete
    const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
    const locationInputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);
    
    // Initialize Google Maps for city location functionality
    useEffect(() => {
        const initGoogleMaps = async () => {
            try {
                console.log('🗺️ Initializing Google Maps for city location system...');
                await initializeGoogleMaps();
                setMapsApiLoaded(true);
                console.log('✅ Google Maps initialized successfully for city filtering');
            } catch (error) {
                console.warn('⚠️ Google Maps failed to load, using fallback location matching:', error);
                // City filtering will work with coordinate-based matching without Google Maps
            }
        };
        
        initGoogleMaps();
    }, []);

    // Fisher-Yates shuffle to randomize array order
    const shuffleArray = (arr: string[]) => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    // Reshuffle images whenever user views the Home tab (requirement: random change each time)
    useEffect(() => {
        if (activeTab === 'home') {
            // Take first 17 (spec requirement) then shuffle for unique cycle
            const baseImages = [...THERAPIST_MAIN_IMAGES.slice(0, 17)];
            const shuffled = shuffleArray(baseImages);
            setShuffledHomeImages(shuffled);
            console.log('🎲 HomePage shuffled therapist images for this view:', shuffled);
        }
    }, [activeTab]);

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
            loadGoogleMapsScript(
                apiKey,
                () => {
                    console.log('✅ Google Maps API loaded for HomePage');
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
                providerId: Number(itemId),
                providerType: selectedRatingItem.type,
                providerName: selectedRatingItem.item.name,
                rating: 0, // Will be set by RatingModal
                whatsapp: '', // Will be set by RatingModal
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
            // Find the closest Indonesian city to user's location
            const detectedCity = findCityByCoordinates(userLocation.lat, userLocation.lng);
            if (detectedCity) {
                console.log('🎯 Auto-detected city from user location:', detectedCity.name);
                // DON'T auto-change selectedCity - let user manually select
                // This was causing Budi to be hidden in Chrome but not Firefox
                // setSelectedCity(detectedCity.name);
            }
        }
    }, [userLocation]);

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
            
            setNearbyTherapists(therapistsWithCoords);
            setNearbyPlaces(placesWithCoords);
            setNearbyHotels(hotelsWithCoords);
            
            /* ORIGINAL LOCATION FILTERING CODE - Re-enable after adding coordinates to therapists
            if (!locationToUse) {
                // No location available, show all therapists
                setNearbyTherapists(therapists);
                setNearbyPlaces(places);
                return;
            }

            try {
                console.log('🔍 Filtering providers by location:', locationToUse);
                
                // Get location coordinates
                const coords = 'lat' in locationToUse 
                    ? { lat: locationToUse.lat, lng: locationToUse.lng }
                    : autoDetectedLocation;

                if (!coords) {
                    console.warn('⚠️ No valid coordinates found, showing all providers');
                    // No coordinates available, show all therapists
                    setNearbyTherapists(therapists);
                    setNearbyPlaces(places);
                    return;
                }

                console.log('📍 Using coordinates:', coords);

                // Find nearby therapists and places (50km radius)
                const nearbyTherapistsResult = await findNearbyTherapists('0', coords, 50);
                const nearbyPlacesResult = await findNearbyPlaces('0', coords, 50);
                
                console.log(`✅ Found ${nearbyTherapistsResult.length} nearby therapists within 50km`);
                console.log(`✅ Found ${nearbyPlacesResult.length} nearby places within 50km`);
                
                // If no nearby providers found, fallback to all therapists
                setNearbyTherapists(nearbyTherapistsResult.length > 0 ? nearbyTherapistsResult : therapists);
                setNearbyPlaces(nearbyPlacesResult.length > 0 ? nearbyPlacesResult : places);
                
            } catch (error) {
                console.error('❌ Location filtering error:', error);
                // Silent fallback to all providers
                setNearbyTherapists(therapists);
                setNearbyPlaces(places);
            }
            */
        };

        filterByLocation();
    }, [therapists, places, hotels, autoDetectedLocation, userLocation]);

    // Log therapist display info with location filtering
    useEffect(() => {
        const liveTherapists = nearbyTherapists.filter((t: any) => {
            const isOwner = loggedInProvider && loggedInProvider.type === 'therapist' && (
                String(t.id) === String(loggedInProvider.id) || String(t.$id) === String(loggedInProvider.id)
            );
            return t.isLive === true || isOwner; // Always include own profile preview
        });
        const filteredTherapists = liveTherapists.filter((t: any) => {
            if (selectedCity === 'all') return true;
            
            // Try multiple matching strategies for city filtering
            
            // 1. Direct location name match
            if (t.location && t.location.toLowerCase().includes(selectedCity.toLowerCase())) {
                return true;
            }
            
            // 2. Coordinate-based matching
            if (t.coordinates) {
                const parsedCoords = parseCoordinates(t.coordinates);
                if (parsedCoords) {
                    const matchedCity = matchProviderToCity(parsedCoords, 25);
                    if (matchedCity && matchedCity.name === selectedCity) {
                        return true;
                    }
                }
            }
            
            // 3. Check aliases for common name variations (Yogya, Jogja for Yogyakarta)
            const selectedCityLower = selectedCity.toLowerCase();
            if (selectedCityLower === 'yogyakarta' && 
                t.location && (t.location.toLowerCase().includes('yogya') || t.location.toLowerCase().includes('jogja'))) {
                return true;
            }
            
            return false;
        });
        
        // Filter hotels by selected city (similar logic to therapists)
        const liveHotels = nearbyHotels.filter((h: any) => h.isLive === true);
        const filteredHotels = liveHotels.filter((h: any) => {
            if (selectedCity === 'all') return true;
            
            // Try multiple matching strategies for city filtering
            
            // 1. Direct location name match
            if (h.location && h.location.toLowerCase().includes(selectedCity.toLowerCase())) {
                return true;
            }
            
            // 2. Coordinate-based matching
            if (h.coordinates) {
                const parsedCoords = parseCoordinates(h.coordinates);
                if (parsedCoords) {
                    const matchedCity = matchProviderToCity(parsedCoords, 25);
                    if (matchedCity && matchedCity.name === selectedCity) {
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
        console.log('  📊 Total therapists prop:', therapists.length, therapists.map((t: any) => ({ id: t.$id || t.id, name: t.name, isLive: t.isLive })));
        console.log('  📍 Nearby therapists (location-filtered):', nearbyTherapists.length);
        console.log('  🔴 Live nearby therapists (isLive=true):', liveTherapists.length);
        console.log('  🎯 Final filtered therapists (massage type + location):', filteredTherapists.length);
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
    }, [therapists, nearbyTherapists, places, nearbyPlaces, hotels, nearbyHotels, selectedCity, autoDetectedLocation]);

    useEffect(() => {
        // Fetch custom drawer links
        const fetchCustomLinks = async () => {
            try {
                const links = await customLinksService.getAll();
                setCustomLinks(links);
            } catch (error) {
                console.error('Error fetching custom links:', error);
            }
        };
        fetchCustomLinks();

        // Listen for drawer toggle events from footer - React 19 concurrent rendering safe
        const handleToggleDrawer = () => {
            setIsMenuOpen(prev => !prev);
        };
        
        // Add event listener with defensive checks for React 19 concurrent rendering
        let listenerAdded = false;
        try {
            if (typeof window !== 'undefined' && window.addEventListener) {
                window.addEventListener('toggleDrawer', handleToggleDrawer);
                listenerAdded = true;
            }
        } catch (error) {
            console.warn('Event listener setup warning (safe to ignore):', error);
        }
        
        return () => {
            // React 19 concurrent rendering safe cleanup - only remove if actually added
            if (listenerAdded) {
                try {
                    if (typeof window !== 'undefined' && window.removeEventListener) {
                        window.removeEventListener('toggleDrawer', handleToggleDrawer);
                    }
                } catch (error) {
                    // Suppress DOM manipulation errors during React 19 concurrent rendering
                    console.warn('Event listener cleanup warning (safe to ignore in React 19):', error);
                }
            }
        };
    }, []);

    // Removed unused processedTherapists and processedPlaces

    // Count of online therapists (status === 'online')
    const onlineTherapistsCount = therapists.filter(t => t.status === 'online').length;

    // Rating modal handlers removed for design mock

    // ...existing code...

    // Removed unused renderTherapists

    // Removed unused renderPlaces

    return (
        <div className="min-h-screen bg-gray-50 w-full max-w-[100vw] overflow-x-hidden">
            <PageNumberBadge pageNumber={2} pageName="HomePage" isLocked={false} />
            {/* Flying Butterfly Animation */}
            <FlyingButterfly />
            
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-[9997] w-full max-w-full">
                <PageContainer className="py-2 sm:py-3 max-w-full">
                <div className="flex justify-between items-center max-w-full">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex-shrink-0">
                        {/* Simplified brand markup to prevent production clipping of last letter */}
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-2 sm:gap-3 text-gray-600 flex-shrink-0">
                        {/* Language Selector - Flag Icon */}
                        <button 
                            onClick={() => {
                                const currentLang = language || 'id';
                                const newLanguage = currentLang === 'id' ? 'en' : 'id';
                                console.log('🌐 Language Toggle:');
                                console.log('  - Current:', currentLang);
                                console.log('  - New:', newLanguage);
                                
                                // Call the language change handler from parent
                                if (onLanguageChange) {
                                    onLanguageChange(newLanguage);
                                    console.log('✅ Language change handler called');
                                } else {
                                    console.error('❌ No language change handler provided');
                                }
                            }} 
                            className="flex items-center justify-center min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 hover:bg-orange-50 rounded-full transition-colors flex-shrink-0" 
                            title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
                        >
                            <span className="text-xl sm:text-2xl">
                                {language === 'id' ? '🇮🇩' : '🇬🇧'}
                            </span>
                        </button>

                        <button onClick={() => {
                            console.log('🍔 Burger menu clicked! Current isMenuOpen:', isMenuOpen);
                            console.log('🍔 Setting isMenuOpen to true');
                            setIsMenuOpen(true);
                            console.log('🍔 After setting - isMenuOpen should be true');
                        }} title="Menu" className="hover:bg-orange-50 rounded-full transition-colors text-orange-500 flex-shrink-0 min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center">
                           <BurgerMenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>
                </PageContainer>
            </header>

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
                            className={`w-1/2 py-2.5 px-3 sm:px-4 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-colors duration-300 min-h-[44px] ${activeTab === 'places' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                        >
                            <Building className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">{translationsObject?.home?.massagePlacesTab || 'Massage Places'}</span>
                        </button>
                    </div>

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
                                className="px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-sm min-h-[44px] flex items-center justify-center gap-2 shadow-sm"
                                title="Facials Indonesia"
                                aria-label="Browse Facial Spas"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{language === 'id' ? 'Facial' : 'Facials'}</span>
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
                                    ? 'Find the best therapists across Indonesia'
                                    : `Find the best therapists in ${selectedCity}`
                                }
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

                            // Show all therapists (live) plus include owner even if not live
                            let baseList = therapists
                                .filter((t: any) => t.isLive === true || isOwner(t))
                                .filter((t: any) => {
                                    if (selectedCity === 'all') return true;
                                    
                                    // Try to match therapist location to selected city
                                    if (t.coordinates) {
                                        const parsedCoords = parseCoordinates(t.coordinates);
                                        if (parsedCoords) {
                                            const matchedCity = matchProviderToCity(parsedCoords, 25);
                                            return matchedCity?.name === selectedCity;
                                        }
                                    }
                                    
                                    return false;
                                });

                            // Ensure owner's profile appears once
                            if (loggedInProvider && loggedInProvider.type === 'therapist') {
                                const alreadyIncluded = baseList.some((t: any) => String(t.id) === String(loggedInProvider.id) || String(t.$id) === String(loggedInProvider.id));
                                if (!alreadyIncluded) {
                                    const ownerDoc = therapists.find((t: any) => String(t.id) === String(loggedInProvider.id) || String(t.$id) === String(loggedInProvider.id));
                                    if (ownerDoc) {
                                        let includeOwner = selectedCity === 'all';
                                        if (!includeOwner && ownerDoc.coordinates) {
                                            const ownerLocation = { lat: ownerDoc.coordinates.lat || 0, lng: ownerDoc.coordinates.lng || 0 };
                                            const matchedCity = matchProviderToCity(ownerLocation, 25);
                                            includeOwner = matchedCity?.name === selectedCity;
                                        }
                                        
                                        if (includeOwner) {
                                            baseList = [ownerDoc, ...baseList];
                                        }
                                    }
                                }
                            }

                            // Sort by status: Available -> Busy -> Offline
                            const statusRank = (s: any) => {
                                const val = String(s || '').toLowerCase();
                                if (val === 'available' || val === 'online') return 0;
                                if (val === 'busy') return 1;
                                if (val === 'offline') return 2;
                                return 1;
                            };
                            baseList = baseList.slice().sort((a: any, b: any) => statusRank(a.status) - statusRank(b.status));

                            // Removed sample therapist fallback: now show empty-state message below if none live

                            const preparedTherapists = baseList
                                .map((therapist: any, index: number) => {
                                    // Assign deterministic unique image from shuffled set; if more therapists than images, start second cycle
                                    const assignedImage = shuffledHomeImages.length > 0 
                                        ? shuffledHomeImages[index % shuffledHomeImages.length] 
                                        : undefined; // undefined triggers fallback logic inside TherapistCard
                                    return { ...therapist, mainImage: assignedImage || therapist.mainImage };
                                });
                            return preparedTherapists.map((therapist: any, index: number) => {
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
                                
                                return (
                                <div key={therapist.$id || `therapist-wrapper-${therapist.id}-${index}`}>
                                <TherapistCard
                                    therapist={therapist}
                                    userLocation={autoDetectedLocation || (userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null)}
                                    onRate={() => handleOpenRatingModal(therapist)}
                                    onBook={() => onBook(therapist, 'therapist')}
                                    onQuickBookWithChat={onQuickBookWithChat ? () => onQuickBookWithChat(therapist, 'therapist') : undefined}
                                    onChatWithBusyTherapist={onChatWithBusyTherapist}
                                    onShowRegisterPrompt={onShowRegisterPrompt}
                                    isCustomerLoggedIn={!!loggedInCustomer}
                                    onIncrementAnalytics={(metric) => onIncrementAnalytics(therapist.id || therapist.$id, 'therapist', metric)}
                                    loggedInProviderId={loggedInProvider?.id}
                                    onNavigate={onNavigate}
                                    activeDiscount={realDiscount}
                                    t={translationsObject}
                                />
                                {/* Accommodation Massage Service Link */}
                                <div className="mt-2 mb-8 text-center">
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
                            });
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
                                
                                // Apply city filtering if not 'all'
                                if (selectedCity === 'all') return true;
                                
                                // Try to match place location to selected city
                                if (place.coordinates) {
                                    // Handle both array [lng, lat] and object {lat, lng} formats
                                    const placeLocation = Array.isArray(place.coordinates)
                                        ? { lat: place.coordinates[1], lng: place.coordinates[0] }
                                        : { lat: place.coordinates.lat || 0, lng: place.coordinates.lng || 0 };
                                    const matchedCity = matchProviderToCity(placeLocation, 25);
                                    return matchedCity?.name === selectedCity;
                                }
                                
                                return false;
                            }) || []).slice();

                            // Determine open/closed now and sort open first
                            const isOpenNow = (p: any) => {
                                try {
                                    if (!p.openingTime || !p.closingTime) return false;
                                    const now = new Date();
                                    const [oh, om] = String(p.openingTime).split(':').map(Number);
                                    const [ch, cm] = String(p.closingTime).split(':').map(Number);
                                    const current = now.getHours() * 60 + now.getMinutes();
                                    const openM = (oh || 0) * 60 + (om || 0);
                                    const closeM = (ch || 0) * 60 + (cm || 0);
                                    if (closeM >= openM) {
                                        return current >= openM && current <= closeM;
                                    } else {
                                        // Handles overnight hours (e.g., 20:00 - 02:00)
                                        return current >= openM || current <= closeM;
                                    }
                                } catch {
                                    return false;
                                }
                            };
                            livePlaces.sort((a, b) => Number(isOpenNow(b)) - Number(isOpenNow(a)));
                            
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
                                                <>
                                                <MassagePlaceCard
                                                    key={placeId}
                                                    place={place}
                                                    onRate={() => handleOpenRatingModal(place, 'place')}
                                                    onSelectPlace={onSelectPlace}
                                                    onNavigate={onNavigate}
                                                    onIncrementAnalytics={(metric) => onIncrementAnalytics(placeId, 'place', metric)}
                                                    onShowRegisterPrompt={onShowRegisterPrompt}
                                                    isCustomerLoggedIn={!!loggedInCustomer}
                                                    t={translationsObject}
                                                    userLocation={autoDetectedLocation || (userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null)}
                                                />
                                                {/* Accommodation Massage Service Link */}
                                                <div className="mt-2 mb-4 text-center">
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
                                                </>
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
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{language === 'id' ? 'Klinik Facial' : 'Facial Clinics'}</h3>
                            <p className="text-gray-600">
                                {selectedCity === 'all' 
                                    ? (language === 'id' ? 'Temukan klinik facial terbaik di seluruh Indonesia' : 'Find the best facial clinics across Indonesia')
                                    : (language === 'id' ? `Perawatan facial premium di ${selectedCity}` : `Premium facial treatments in ${selectedCity}`)
                                }
                            </p>
                        </div>
                        
                        {/* Show facial places from Appwrite */}
                        {(() => {
                            // Filter facial places by live status and city
                            const liveFacialPlaces = (facialPlaces?.filter((place: any) => {
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
                                    return matchedCity?.name === selectedCity;
                                }
                                
                                return false;
                            }) || []).slice();

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
                                            {language === 'id' ? 'Tidak ada klinik facial tersedia' : 'No facial clinics available'}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            {language === 'id' ? 'Periksa kembali untuk spa facial unggulan!' : 'Check back soon for featured facial spas!'}
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
                                                <FacialPlaceCard
                                                    key={placeId}
                                                    place={place}
                                                    onRate={() => handleOpenRatingModal(place, 'place')}
                                                    onSelectPlace={onSelectPlace}
                                                    onNavigate={onNavigate}
                                                    onIncrementAnalytics={(metric) => onIncrementAnalytics(placeId, 'place', metric)}
                                                    onShowRegisterPrompt={onShowRegisterPrompt}
                                                    isCustomerLoggedIn={!!loggedInCustomer}
                                                    t={translationsObject}
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
            {/* Directory footer: Terms & Privacy with brand */}
            <div className="mt-12 mb-6 flex flex-col items-center gap-2">
                <div className="font-bold text-lg">
                    <span className="text-black">Inda</span>
                    <span className="text-orange-500">Street</span>
                </div>
                <div className="flex justify-center gap-4">
                    <button onClick={() => onTermsClick && onTermsClick()} className="text-sm text-orange-500 hover:text-orange-600 font-semibold">
                        Terms
                    </button>
                    <span className="text-sm text-gray-400">•</span>
                    <button onClick={() => onPrivacyClick && onPrivacyClick()} className="text-sm text-orange-500 hover:text-orange-600 font-semibold">
                        Privacy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
