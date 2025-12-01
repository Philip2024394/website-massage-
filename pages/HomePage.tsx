import React, { useState, useEffect, useRef } from 'react';
import type { User, UserLocation, Agent, Place, Therapist, Analytics, UserCoins } from '../types';
import TherapistCard from '../components/TherapistCard';
import MassagePlaceCard from '../components/MassagePlaceCard';
import RatingModal from '../components/RatingModal';
import { MASSAGE_TYPES_CATEGORIZED } from '../constants/rootConstants';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { customLinksService, reviewService } from '../lib/appwriteService';
import { AppDrawer } from '../components/AppDrawer';
import { Users, Building, Sparkles } from 'lucide-react';
import HomeIcon from '../components/icons/HomeIcon';
import FlyingButterfly from '../components/FlyingButterfly';
import { getCustomerLocation, findNearbyTherapists, findNearbyPlaces } from '../lib/nearbyProvidersService';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import PageNumberBadge from '../components/PageNumberBadge';
import { THERAPIST_MAIN_IMAGES } from '../lib/services/imageService';
import { loadGoogleMapsScript } from '../constants/appConstants';
import { getStoredGoogleMapsApiKey } from '../utils/appConfig';


interface HomePageProps {
    user: User | null;
    loggedInAgent: Agent | null;
    loggedInProvider?: { id: number | string; type: 'therapist' | 'place' } | null; // Add logged in provider
    loggedInCustomer?: any | null; // Add customer login state
    userCoins?: UserCoins | null; // Add user coins
    therapists: any[];
    places: any[];
    userLocation: UserLocation | null;
    selectedMassageType?: string; // Add optional prop for external control
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
    loggedInAgent: _loggedInAgent,
    loggedInProvider,
    loggedInCustomer,
    therapists,
    places,
    userLocation,
    selectedMassageType: propSelectedMassageType, // Get from prop
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
                massageType: 'Massage Type',
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
                    massageType: t('home.massageType') || defaultTranslations.home.massageType,
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
    const [selectedMassageType, setSelectedMassageType] = useState(propSelectedMassageType || 'all');
    const [, setCustomLinks] = useState<any[]>([]);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [, setSelectedTherapist] = useState<Therapist | null>(null);
    const [selectedRatingItem, setSelectedRatingItem] = useState<{item: any, type: 'therapist' | 'place'} | null>(null);
    
    // Location-based filtering state (automatic, no UI)
    const [autoDetectedLocation, setAutoDetectedLocation] = useState<{lat: number, lng: number} | null>(null);
    const [nearbyTherapists, setNearbyTherapists] = useState<Therapist[]>([]);
    const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
    const [isLocationDetecting, setIsLocationDetecting] = useState(false);
    // Shuffled unique home page therapist images (no repeats until all 17 used)
    const [shuffledHomeImages, setShuffledHomeImages] = useState<string[]>([]);
    
    // Google Maps Autocomplete
    const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
    const locationInputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);

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

    // Update selectedMassageType when prop changes - React 19 safe
    useEffect(() => {
        try {
            if (propSelectedMassageType) {
                setSelectedMassageType(propSelectedMassageType);
            }
        } catch (error) {
            console.warn('HomePage effect warning (safe to ignore in React 19):', error);
        }
    }, [propSelectedMassageType]);

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

    // Filter therapists and places by location automatically
    useEffect(() => {
        const filterByLocation = async () => {
            const locationToUse = autoDetectedLocation || userLocation;
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
        };

        filterByLocation();
    }, [therapists, places, autoDetectedLocation, userLocation]);

    // Log therapist display info with location filtering
    useEffect(() => {
        const liveTherapists = nearbyTherapists.filter((t: any) => {
            const isOwner = loggedInProvider && loggedInProvider.type === 'therapist' && (
                String(t.id) === String(loggedInProvider.id) || String(t.$id) === String(loggedInProvider.id)
            );
            return t.isLive === true || isOwner; // Always include own profile preview
        });
        const filteredTherapists = liveTherapists.filter((t: any) => 
            selectedMassageType === 'all' || (t.massageTypes && t.massageTypes.includes(selectedMassageType))
        );
        
        console.log('🏠 [HomePage RENDER] Therapist Display Debug (Location-Filtered 50km radius):');
        console.log('  📊 Total therapists prop:', therapists.length, therapists.map((t: any) => ({ id: t.$id || t.id, name: t.name, isLive: t.isLive })));
        console.log('  📍 Nearby therapists (location-filtered):', nearbyTherapists.length);
        console.log('  🔴 Live nearby therapists (isLive=true):', liveTherapists.length);
        console.log('  🎯 Final filtered therapists (massage type + location):', filteredTherapists.length);
        console.log('  📍 Auto-detected location:', autoDetectedLocation);
        console.log('  🎨 Selected massage type:', selectedMassageType);
        const missingCoords = therapists.filter((t: any)=>!t.coordinates).length;
        console.log('  ⚠️ Therapists missing coordinates:', missingCoords);
        
        // Also log places
        const livePlaces = nearbyPlaces.filter((p: any) => p.isLive === true);
        console.log('  🏢 Total places prop:', places.length);
        console.log('  📍 Nearby places (location-filtered):', nearbyPlaces.length);
        const missingPlaceCoords = places.filter((p: any)=>!p.coordinates).length;
        console.log('  ⚠️ Places missing coordinates:', missingPlaceCoords);
        console.log('  🔴 Live nearby places:', livePlaces.length);
    }, [therapists, nearbyTherapists, places, nearbyPlaces, selectedMassageType, autoDetectedLocation]);

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
        <div className="min-h-screen bg-gray-50 max-w-full overflow-x-hidden">
            <PageNumberBadge pageNumber={2} pageName="HomePage" isLocked={false} />
            {/* Flying Butterfly Animation */}
            <FlyingButterfly />
            
            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden max-w-full" style={{ paddingBottom: '80px' }}>
                <header className="bg-white p-4 shadow-md sticky top-0 z-[9997] max-w-full">
                <div className="flex justify-between items-center max-w-full">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {/* Simplified brand markup to prevent production clipping of last letter */}
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
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
                            className="flex items-center justify-center w-9 h-9 hover:bg-orange-50 rounded-full transition-colors" 
                            title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
                        >
                            <span className="text-2xl">
                                {language === 'id' ? '🇮🇩' : '🇬🇧'}
                            </span>
                        </button>

                        <button onClick={() => {
                            console.log('🍔 Burger menu clicked! Current isMenuOpen:', isMenuOpen);
                            console.log('🍔 Setting isMenuOpen to true');
                            setIsMenuOpen(true);
                            console.log('🍔 After setting - isMenuOpen should be true');
                        }} title="Menu" className="p-2 hover:bg-orange-50 rounded-full transition-colors text-orange-500">
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
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

            <main className="px-4 pb-24">
                {/* Location Display & Search */}
                <div className="mb-4">
                    {userLocation ? (
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center justify-center gap-2">
                                <svg 
                                    className="w-5 h-5 text-orange-500" 
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
                                            // Extract only the last part (city/area name)
                                            const parts = String(userLocation.address).split(',').map(p => p.trim());
                                            // Return last 2 parts (e.g., "Jakarta, Indonesia")
                                            return parts.slice(-2).join(', ');
                                        } catch (e) {
                                            return `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
                                        }
                                    })()}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 font-medium">Indonesia's Massage Therapist Hub</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 max-w-md mx-auto">
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
                <div className="flex bg-gray-200 rounded-full p-1 mb-4">
                    <button 
                        onClick={() => setActiveTab('home')} 
                        className={`w-1/2 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-300 ${activeTab === 'home' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                    >
                        <HomeIcon className="w-4 h-4" />
                        {translationsObject?.home?.homeServiceTab || 'Home Service'}
                    </button>
                    <button 
                        onClick={() => setActiveTab('places')} 
                        className={`w-1/2 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-300 ${activeTab === 'places' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                    >
                        <Building className="w-4 h-4" />
                        {translationsObject?.home?.massagePlacesTab || 'Massage Places'}
                    </button>
                </div>


                <div className="space-y-3 mb-6 max-w-full">
                    <div className="flex items-center w-full gap-3 max-w-full">
                        <div className="relative flex-1 min-w-0 basis-0">
                            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                            <select 
                                className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-green-600"
                                value={selectedMassageType}
                                onChange={e => setSelectedMassageType(e.target.value)}
                                style={{ backgroundColor: 'white' } as React.CSSProperties}
                            >
                                <option value="all" style={{ backgroundColor: 'white' } as React.CSSProperties}>{translationsObject?.home?.massageType || 'Massage Type'}</option>
                                {MASSAGE_TYPES_CATEGORIZED.map(category => (
                                    <optgroup label={category.category} key={category.category} style={{ backgroundColor: 'white' } as React.CSSProperties}>
                                        {category.types.map((type, index) => (
                                            <option key={`${category.category}-${type}-${index}`} value={type} style={{ backgroundColor: 'white' } as React.CSSProperties}>{type}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🚀 Join Indastreet button clicked!');
                                console.log('onNavigate function exists:', !!onNavigate);
                                
                                if (onNavigate) {
                                    console.log('✅ Calling onNavigate with joinIndastreet');
                                    try {
                                        onNavigate('joinIndastreet');
                                        console.log('✅ Navigation called successfully');
                                    } catch (error) {
                                        console.error('❌ Error calling onNavigate:', error);
                                    }
                                } else {
                                    console.error('❌ onNavigate is not available!');
                                    alert('Navigation function not available. Please refresh the page.');
                                }
                            }} 
                            className="ml-auto inline-flex p-0 bg-transparent border-0 outline-none focus:outline-none active:outline-none ring-0 focus:ring-0 cursor-pointer items-center justify-center flex-shrink-0"
                            style={{ WebkitTapHighlightColor: 'transparent' } as React.CSSProperties}
                            type="button"
                            title="Join Indastreet"
                        >
                            <img 
                                src="https://ik.imagekit.io/7grri5v7d/indastreet_button-removebg-preview.png"
                                alt="Join Indastreet"
                                className="select-none transition-opacity hover:opacity-90 h-10 w-auto"
                                loading="lazy"
                                draggable={false}
                            />
                        </button>
                    </div>
                    
                    {/* Massage Directory hero button removed as requested */}
                </div>

                {/* Therapists and Places Display */}
                {activeTab === 'home' && (
                    <div className="max-w-full overflow-x-hidden">
                        <div className="mb-6 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t?.home?.therapistsTitle || 'Terapis Pijat Rumahan'}</h3>
                            <p className="text-gray-600">{t?.home?.therapistsSubtitle || 'Temukan terapis pijat terbaik di Bali'}</p>
                        </div>
                        
                        <div className="space-y-4 max-w-full overflow-hidden">
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
                                .filter((t: any) => selectedMassageType === 'all' || (t.massageTypes && t.massageTypes.includes(selectedMassageType)));

                            // Ensure owner's profile appears once
                            if (loggedInProvider && loggedInProvider.type === 'therapist') {
                                const alreadyIncluded = baseList.some((t: any) => String(t.id) === String(loggedInProvider.id) || String(t.$id) === String(loggedInProvider.id));
                                if (!alreadyIncluded) {
                                    const ownerDoc = therapists.find((t: any) => String(t.id) === String(loggedInProvider.id) || String(t.$id) === String(loggedInProvider.id));
                                    if (ownerDoc && (selectedMassageType === 'all' || (ownerDoc.massageTypes && ownerDoc.massageTypes.includes(selectedMassageType)))) {
                                        baseList = [ownerDoc, ...baseList];
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
                                
                                console.log('🏠 HomePage passing to TherapistCard:', {
                                    id: therapist.$id || therapist.id,
                                    name: therapist.name,
                                    languages: therapist.languages,
                                    languagesType: typeof therapist.languages,
                                    languagesLength: therapist.languages ? therapist.languages.length : 0,
                                    languagesEmpty: therapist.languages === '',
                                    languagesNull: therapist.languages === null,
                                    languagesUndefined: therapist.languages === undefined,
                                    languagesParsed: languagesParsed,
                                    isLive: therapist.isLive,
                                    massageTypes: therapist.massageTypes,
                                    allFields: Object.keys(therapist)
                                });
                                
                                // Real discount data - check if therapist has active discount
                                const realDiscount = (therapist.discountPercentage && therapist.discountPercentage > 0 && therapist.discountEndTime) ? {
                                    percentage: therapist.discountPercentage,
                                    expiresAt: new Date(therapist.discountEndTime)
                                } : null;
                                
                                return (
                                <>
                                <TherapistCard
                                    key={therapist.$id || `therapist-${therapist.id}-${index}`}
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
                                <div className="mt-2 mb-4 text-center">
                                    <button
                                        onClick={() => onNavigate?.('indastreet-partners')}
                                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        <span className="font-medium">Accommodation With Massage Service</span>
                                    </button>
                                </div>
                                </>
                                );
                            });
                        })()}
                        {therapists.filter((t: any) => t.isLive === true || (loggedInProvider && loggedInProvider.type === 'therapist' && (String((t as any).id) === String(loggedInProvider.id) || String((t as any).$id) === String(loggedInProvider.id)))).length === 0 && (
                            <div className="text-center py-12 bg-white rounded-lg">
                                <p className="text-gray-500">{translationsObject?.home?.noTherapistsAvailable || 'Tidak ada terapis tersedia di area Anda saat ini.'}</p>
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
                        <div className="mb-6 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t?.home?.massagePlacesTitle || 'Spa Pijat Unggulan'}</h3>
                            <p className="text-gray-600">{t?.home?.massagePlacesSubtitle || 'Temukan tempat pijat terbaik di Bali'}</p>
                        </div>
                        
                        {/* Show places from Appwrite */}
                        {(() => {
                            console.log('🏨 Massage Places Tab:', {
                                totalPlaces: places?.length,
                                livePlaces: places?.filter(p => p.isLive).length,
                                places: places
                            });
                            
                            const livePlaces = (places?.filter(place => place.isLive) || []).slice();

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
                                                        <span className="font-medium">Accommodation With Massage Service</span>
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

                {/* ...existing code for therapists/places rendering, modals, etc. should follow here... */}
            </main>
            
            {/* Rating modal removed for design mock */}
            
            </div> {/* End scrollable content container */}

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
            `}</style>
        </div>
    );
};

export default HomePage;
