import React, { useState, useEffect, useRef } from 'react';
import type { User, UserLocation, Agent, Place, Therapist, Analytics, UserCoins } from '../types';
import TherapistCard from '../components/TherapistCard';
import OrangeLocationModal from '../components/OrangeLocationModal';
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
import { useLanguageContext } from '../context/LanguageContext';
import { COUNTRIES, COUNTRY_DEFAULT_COORDS } from '../countries';
import FlagIcon from '../components/FlagIcon';


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
    onAgentPortalClick: () => void;
    onCustomerPortalClick?: () => void; // Add customer portal callback
    onHotelPortalClick: () => void;
    onVillaPortalClick: () => void;
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
    isLoading: boolean;
    t: any;
    language?: import('../types/pageTypes').Language;
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
    t,
    language
}) => {
    const { language: globalLanguage, setLanguage: setGlobalLanguage } = useLanguageContext();
    console.log('🏠 HomePage: Component is being called!');
    // Enhanced debug logging for translations
    console.log('🏠 HomePage received translations:', {
        tExists: !!t,
        tType: typeof t,
        tIsFunction: typeof t === 'function',
        tKeys: t && typeof t === 'object' ? Object.keys(t) : 'not an object',
    });
    
    // Create a safe translation function
    const safeT = typeof t === 'function' ? t : (key: string) => {
        console.warn(`Translation function not available for key: ${key}`);
        return key;
    };

    // Adapter: Convert translation function to object structure for HomePage compatibility
    if (t && typeof t === 'function') {
        console.log('🔄 Converting translation function to object structure for HomePage');
        const homeTranslations = {
            homeServiceTab: t('home.homeServiceTab'),
            massagePlacesTab: t('home.massagePlacesTab'),
            loading: t('home.loading'),
            loginSignUp: t('home.loginSignUp'), 
            noMoreTherapists: t('home.noMoreTherapists'),
            setLocation: t('home.setLocation'),
            updateLocation: t('home.updateLocation'),
            massageType: t('home.massageType'),
            therapistsOnline: t('home.therapistsOnline'),
            searchPlaceholder: t('home.searchPlaceholder'),
            noResults: t('home.noResults')
        };
        
        // Create object structure that HomePage expects
        t = {
            home: homeTranslations,
            detail: {},

            common: {}
        };
        console.log('✅ Converted function-based translations to object structure for HomePage');
    }

    // Safety check for translations - use fallback if needed
    if (!t || !t.home) {
        console.warn('HomePage: Missing translations object or t.home, using fallback', { 
            t, 
            hasT: !!t, 
            tKeys: t ? Object.keys(t) : [],
            hasHome: t ? !!t.home : false 
        });
        
        // Use proper translation system - no hardcoded fallbacks
        const fallbackHome = {
            homeServiceTab: t('home.homeServiceTab'),
            massagePlacesTab: t('home.massagePlacesTab'),
            loading: t('home.loading'),
            loginSignup: t('home.loginSignUp'),
            locationLabel: t('home.locationLabel'),
            selectLocation: t('home.selectLocation'),
            setLocation: t('home.setLocation'),
            nearbyTherapists: t('home.nearbyTherapists'),
            nearbyMassagePlaces: t('home.nearbyMassagePlaces'),
            noTherapists: t('home.noTherapists'),
            noMassagePlaces: t('home.noMassagePlaces'),
            distanceAway: t('home.distanceAway'),
            bookNow: t('home.bookNow'),
            viewProfile: t('home.viewProfile'),
            whatsapp: t('home.whatsapp'),
            rating: t('home.rating'),
            priceFrom: t('home.priceFrom'),
            priceSession: t('home.priceSession'),
            locationRequired: t('home.locationRequired'),
            locationRequiredDesc: t('home.locationRequiredDesc'),
            getAllServices: t('home.getAllServices'),
            filterByMassageType: t('home.filterByMassageType'),
            allMassageTypes: t('home.allMassageTypes'),
            requestLocation: t('home.requestLocation'),
            therapistsOnline: t('home.therapistsOnline'),
            footer: {
                agentLink: t('home.footer.agentLink'),
                termsLink: t('home.footer.termsLink'), 
                privacyLink: t('home.footer.privacyLink')
            }
        };
        
        // Create a temporary t object with fallback
        const fallbackT = { 
            home: fallbackHome,
            ...(t || {})
        };
        
        console.log('✅ Using fallback translations for HomePage');
        // Continue with fallback instead of showing error
        t = fallbackT;
    }

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
    const locationDetectedRef = useRef(false);
    const filteringRef = useRef(false);
    const SEARCH_RADIUS_KM = 20;
    // Shuffled unique home page therapist images (no repeats until all 17 used)
    const [shuffledHomeImages, setShuffledHomeImages] = useState<string[]>([]);
    const [showLanguagePrompt, setShowLanguagePrompt] = useState(false);
    const [promptLang, setPromptLang] = useState<import('../types/pageTypes').Language>(globalLanguage || 'en');
    const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');

    const handleSelectCountry = (code: string, name: string) => {
        const prev = userLocation || undefined;
        const def = COUNTRY_DEFAULT_COORDS[code];
        const lat = def?.lat ?? prev?.lat ?? -6.2088;
        const lng = def?.lng ?? prev?.lng ?? 106.8456;
        const address = def ? `${def.city}, ${name}` : (prev?.address || name);
        onSetUserLocation({ address, lat, lng, countryCode: code, country: name });
        try {
            // Persist immediately for currency/utils that read localStorage directly
            localStorage.setItem('app_user_location', JSON.stringify({ address, lat, lng, countryCode: code, country: name }));
        } catch {}
        setIsCountrySelectorOpen(false);
        setCountrySearch('');
    };

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

    // One-time language prompt when arriving from Landing
    useEffect(() => {
        try {
            const flag = sessionStorage.getItem('show_language_prompt');
            if (flag === '1') {
                const suggestedRaw = sessionStorage.getItem('suggested_language');
                const supported: Array<import('../types/pageTypes').Language> = ['en','id','zh-CN','ru','ja','ko'];
                const suggested = (supported.includes(suggestedRaw as any) ? (suggestedRaw as any) : null) as import('../types/pageTypes').Language | null;
                if (suggested) {
                    setPromptLang(suggested);
                } else {
                    setPromptLang(globalLanguage || 'en');
                }
                setShowLanguagePrompt(true);
                sessionStorage.removeItem('show_language_prompt');
            }
        } catch {}
    }, [globalLanguage]);

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
            
            // Update the app's user location
            if (onSetUserLocation) {
                onSetUserLocation({
                    address: 'Current location',
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
            if (locationDetectedRef.current || isLocationDetecting || autoDetectedLocation) return;
            
            locationDetectedRef.current = true;
            setIsLocationDetecting(true);
            try {
                console.log('🌍 Automatically detecting user location...');
                const location = await getCustomerLocation();
                setAutoDetectedLocation(location);
                
                console.log('✅ Location detected:', location);
                
                // Automatically update the app's user location if not set
                if (!userLocation && onSetUserLocation) {
                    onSetUserLocation({
                        address: 'Auto-detected location',
                        lat: location.lat,
                        lng: location.lng
                    });
                }
                
            } catch (error) {
                console.log('📍 Auto location detection failed (silent fallback):', error);
                // Silent fallback - no error shown to user
                locationDetectedRef.current = false;
            } finally {
                setIsLocationDetecting(false);
            }
        };

        // Only auto-detect for regular users, not providers/agents
        if (!loggedInProvider && !_loggedInAgent && !locationDetectedRef.current) {
            detectLocationAutomatically();
        }
    }, [loggedInProvider, _loggedInAgent]);

    // Filter therapists and places by location automatically
    useEffect(() => {
        const filterByLocation = async () => {
            if (filteringRef.current) return;
            
            const locationToUse = autoDetectedLocation || userLocation;
            if (!locationToUse) {
                // No location available, show all therapists
                setNearbyTherapists(therapists);
                setNearbyPlaces(places);
                return;
            }

            filteringRef.current = true;
            try {
                console.log('🔍 Filtering providers by location:', locationToUse);
                
                // Get location coordinates
                const coords = 'lat' in locationToUse 
                    ? { lat: locationToUse.lat, lng: locationToUse.lng }
                    : autoDetectedLocation;

                if (!coords) {
                    // No coordinates available, show all therapists
                    setNearbyTherapists(therapists);
                    setNearbyPlaces(places);
                    filteringRef.current = false;
                    return;
                }

                // Find nearby therapists and places (20km radius)
                const nearbyTherapistsResult = await findNearbyTherapists('0', coords, SEARCH_RADIUS_KM);
                const nearbyPlacesResult = await findNearbyPlaces('0', coords, SEARCH_RADIUS_KM);
                
                console.log(`📍 Found ${nearbyTherapistsResult.length} nearby therapists`);
                console.log(`📍 Found ${nearbyPlacesResult.length} nearby places`);
                
                // If no nearby providers found, fallback to all therapists
                setNearbyTherapists(nearbyTherapistsResult.length > 0 ? nearbyTherapistsResult : therapists);
                setNearbyPlaces(nearbyPlacesResult.length > 0 ? nearbyPlacesResult : places);
                
            } catch (error) {
                console.log('📍 Location filtering failed (silent fallback):', error);
                // Silent fallback to all providers
                setNearbyTherapists(therapists);
                setNearbyPlaces(places);
            } finally {
                filteringRef.current = false;
            }
        };

        filterByLocation();
    }, [therapists, places, autoDetectedLocation, userLocation]);

    // Log therapist display info with location filtering
    useEffect(() => {
        const liveTherapists = nearbyTherapists.filter((t: any) => t.isLive === true);
        const filteredTherapists = liveTherapists.filter((t: any) => 
            selectedMassageType === 'all' || (t.massageTypes && t.massageTypes.includes(selectedMassageType))
        );
        
        console.log('🏠 HomePage Therapist Display Debug (Location-Filtered):');
        console.log('  📊 Total therapists prop:', therapists.length);
        console.log('  � Nearby therapists (location-filtered):', nearbyTherapists.length);
        console.log('  🔴 Live nearby therapists (isLive=true):', liveTherapists.length);
        console.log('  🎯 Final filtered therapists (massage type + location):', filteredTherapists.length);
        console.log('  📍 Auto-detected location:', autoDetectedLocation);
        console.log('  🎨 Selected massage type:', selectedMassageType);
        
        // Also log places
        const livePlaces = nearbyPlaces.filter((p: any) => p.isLive === true);
        console.log('  🏢 Total places prop:', places.length);
        console.log('  📍 Nearby places (location-filtered):', nearbyPlaces.length);
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

    // Count of online therapists (example: status === 'online')
    const onlineTherapistsCount = 0;

    // Rating modal handlers removed for design mock

    // ...existing code...

    // Removed unused renderTherapists

    // Removed unused renderPlaces

    return (
        <div className="min-h-screen bg-gray-50">
            <PageNumberBadge pageNumber={2} pageName="HomePage" isLocked={false} />
            {/* Flying Butterfly Animation */}
            <FlyingButterfly />
            
            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '80px' }}>
                <header className="bg-white p-4 shadow-md sticky top-0 z-[9997]">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {/* Simplified brand markup to prevent production clipping of last letter */}
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        {/* Location Update Button - Orange Color */}
                        <button 
                            onClick={handleLocationRequest} 
                            className="p-2 hover:bg-orange-50 rounded-full transition-colors text-orange-500" 
                            title="Update Location"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>

                        {/* Country switcher - small round flag near burger */}
                        <button
                            onClick={() => setIsCountrySelectorOpen(true)}
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:bg-orange-50"
                            title={userLocation?.country || userLocation?.countryCode || 'Choose country'}
                            aria-label="Choose country"
                        >
                            <FlagIcon code={(userLocation?.countryCode || 'ID')} className="text-lg" />
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

            {/* Country Selector Hero Overlay */}
            {isCountrySelectorOpen && (
                <div className="fixed inset-0 z-[9998] flex items-start sm:items-center justify-center bg-black/60">
                    <div className="w-full max-w-2xl bg-white rounded-none sm:rounded-2xl shadow-2xl overflow-hidden mt-0 sm:mt-8">
                        {/* Hero Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold">Choose your country</h2>
                                    <p className="text-white/80 text-sm">See therapists and places in your selected country</p>
                                </div>
                                <button
                                    onClick={() => setIsCountrySelectorOpen(false)}
                                    className="p-2 rounded-full hover:bg-white/10"
                                    aria-label="Close"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                            </div>
                            <div className="mt-3">
                                <input
                                    value={countrySearch}
                                    onChange={(e) => setCountrySearch(e.target.value)}
                                    placeholder="Search country..."
                                    className="w-full rounded-md px-3 py-2 text-gray-900 placeholder:text-gray-400 bg-white/95 focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-transparent"
                                />
                            </div>
                        </div>
                        {/* List */}
                        <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {COUNTRIES
                                    .filter(c => (c.name || '').toLowerCase().includes(countrySearch.toLowerCase()))
                                    .map(c => (
                                        <button
                                            key={c.code}
                                            onClick={() => handleSelectCountry(c.code, c.name)}
                                            className={`flex items-center gap-3 border rounded-xl p-3 hover:border-orange-400 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400/50 ${userLocation?.countryCode === c.code ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}
                                        >
                                            <FlagIcon code={c.code} className="text-2xl" />
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-500">Indastreet Massage</div>
                                                <div className="font-semibold text-gray-900">{c.name}</div>
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Global App Drawer - Chrome Safe Rendering */}
            <React19SafeWrapper condition={isMenuOpen}>
                <AppDrawer
                    isHome={true}
                    isOpen={isMenuOpen}
                    onClose={() => {
                        console.log('🍔 AppDrawer onClose called');
                        setIsMenuOpen(false);
                    }}
                    t={safeT}
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
                    therapists={therapists}
                    places={places}
                />
            </React19SafeWrapper>


            <main className="p-4 pb-24">
                <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
                    <Users className="w-5 h-5"/>
                    <span className="font-medium">{(t.home.therapistsOnline || "{count} of {total} therapists online")
                            .replace('{count}', onlineTherapistsCount.toString())
                            .replace('{total}', therapists.length.toString())}
                    </span>
                </div>

                {/* Subtle location info line */}
                <div className="text-center text-sm text-gray-600 mb-4">
                    {(() => {
                        const addr = userLocation?.address;
                        const country = userLocation?.country;
                        let label: string | null = null;
                        if (addr && typeof addr === 'string') {
                            // Try to display "City/Region, Country" if address contains Indonesia
                            if (addr.includes('Indonesia')) {
                                const parts = addr.split(',').map(p => p.trim());
                                const idx = parts.findIndex(p => p.toLowerCase() === 'indonesia');
                                if (idx > 0) {
                                    const cityOrRegion = parts[idx - 1];
                                    label = `${cityOrRegion}, Indonesia`;
                                }
                            }
                        }
                        if (!label && country) {
                            label = country;
                        }
                        return (
                            <>
                                Showing therapists within {SEARCH_RADIUS_KM} km of {label || 'your location'}.{' '}
                                <button onClick={handleLocationRequest} className="text-orange-600 hover:underline">
                                    Change location
                                </button>
                            </>
                        );
                    })()}
                </div>

                <div className="flex bg-gray-200 rounded-full p-1 mb-4">
                    <button 
                        onClick={() => setActiveTab('home')} 
                        className={`w-1/2 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-300 ${activeTab === 'home' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                    >
                        <HomeIcon className="w-4 h-4" />
                        {t.home.homeServiceTab}
                    </button>
                    <button 
                        onClick={() => setActiveTab('places')} 
                        className={`w-1/2 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-300 ${activeTab === 'places' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                    >
                        <Building className="w-4 h-4" />
                        {t.home.massagePlacesTab}
                    </button>
                </div>


                <div className="space-y-3 mb-6">
                    <div className="flex items-center w-full gap-3">
                        <div className="relative flex-1 min-w-0 basis-0">
                            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                            <select 
                                className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-green-600"
                                value={selectedMassageType}
                                onChange={e => setSelectedMassageType(e.target.value)}
                            >
                                <option value="all">{t.home.massageType}</option>
                                {MASSAGE_TYPES_CATEGORIZED.map(category => (
                                    <optgroup label={category.category} key={category.category}>
                                        {category.types.map((type, index) => (
                                            <option key={`${category.category}-${type}-${index}`} value={type}>{type}</option>
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
                                console.log('🛒 Online Shop button clicked!');
                                console.log('onNavigate function exists:', !!onNavigate);
                                
                                if (onNavigate) {
                                    console.log('✅ Calling onNavigate with coin-shop');
                                    try {
                                        onNavigate('coin-shop');
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
                            title="Click to go to Online Shop"
                        >
                            <img 
                                src="https://ik.imagekit.io/7grri5v7d/online%20shop.png"
                                alt="Online Shop"
                                className="select-none transition-opacity hover:opacity-90 h-10 w-auto sm:h-16 md:h-[88px] lg:h-[108px]"
                                loading="lazy"
                                draggable={false}
                            />
                        </button>
                    </div>
                    
                    {/* Massage Directory hero button removed as requested */}
                </div>

                {/* Therapists and Places Display */}
                {activeTab === 'home' && (
                    <div>
                        <div className="mb-6 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Terapis Pijat Rumahan</h3>
                            <p className="text-gray-600">Temukan terapis pijat terbaik di Bali</p>
                        </div>
                        
                        <div className="space-y-4">
                        {/* Build list with injected unique mainImage per view */}
                        {(() => {
                            const preparedTherapists = nearbyTherapists
                                .filter((t: any) => t.isLive === true)
                                .filter((t: any) => selectedMassageType === 'all' || (t.massageTypes && t.massageTypes.includes(selectedMassageType)))
                                .map((therapist: any, index: number) => {
                                    // Assign deterministic unique image from shuffled set; if more therapists than images, start second cycle
                                    const assignedImage = shuffledHomeImages.length > 0 
                                        ? shuffledHomeImages[index % shuffledHomeImages.length] 
                                        : undefined; // undefined triggers fallback logic inside TherapistCard
                                    return { ...therapist, mainImage: assignedImage || therapist.mainImage };
                                });
                            return preparedTherapists.map((therapist: any, index: number) => {
                                // 🌐 Enhanced Debug: Comprehensive therapist data analysis
                                console.log('🏠 HomePage passing to TherapistCard:', {
                                    id: therapist.$id || therapist.id,
                                    name: therapist.name,
                                    languages: therapist.languages,
                                    languagesType: typeof therapist.languages,
                                    languagesLength: therapist.languages ? therapist.languages.length : 0,
                                    languagesEmpty: therapist.languages === '',
                                    languagesNull: therapist.languages === null,
                                    languagesUndefined: therapist.languages === undefined,
                                    languagesParsed: therapist.languages ? JSON.parse(therapist.languages || '[]') : [],
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
                                    t={t}
                                />
                                );
                            });
                        })()}
                        {nearbyTherapists.filter((t: any) => t.isLive === true).length === 0 && (
                            <div className="text-center py-12 bg-white rounded-lg">
                                <p className="text-gray-500">Tidak ada terapis tersedia di area Anda saat ini.</p>
                                {autoDetectedLocation && (
                                    <p className="text-gray-400 text-sm mt-2">
                                        Showing providers within {SEARCH_RADIUS_KM}km of your location
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
                            title: t.ratingModal?.title || 'Rate {itemName}',
                            prompt: t.ratingModal?.prompt || 'How was your experience?',
                            whatsappLabel: t.ratingModal?.whatsappLabel || 'WhatsApp Number',
                            whatsappPlaceholder: t.ratingModal?.whatsappPlaceholder || 'Enter your WhatsApp number',
                            submitButton: t.ratingModal?.submitButton || 'Submit Review',
                            selectRatingError: t.ratingModal?.selectRatingError || 'Please select a rating',
                            whatsappRequiredError: t.ratingModal?.whatsappRequiredError || 'WhatsApp number is required',
                            confirmationV2: t.ratingModal?.confirmationV2 || 'Thank you for your review! It will be visible once approved by admin.'
                        }}
                    />
                )}

                {activeTab === 'places' && (
                    <div>
                        <div className="mb-6 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Spa Pijat Unggulan</h3>
                            <p className="text-gray-600">Temukan tempat pijat terbaik di Bali</p>
                        </div>
                        
                        {/* Show places from Appwrite */}
                        {(() => {
                            console.log('🏨 Massage Places Tab:', {
                                totalPlaces: places?.length,
                                livePlaces: places?.filter(p => p.isLive).length,
                                places: places
                            });
                            
                            const livePlaces = nearbyPlaces?.filter(place => place.isLive) || [];
                            
                            if (livePlaces.length === 0) {
                                return (
                                    <div className="text-center py-12">
                                        <div className="mb-4">
                                            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 mb-2 text-lg font-semibold">Tidak ada tempat pijat tersedia di area Anda</p>
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
                                <div className="space-y-4">
                                    {livePlaces
                                        .slice(0, 9) // Show maximum 9 places
                                        .map((place, index) => {
                                            const placeId = place.id || (place as any).$id;
                                            
                                            // Mock discount data - show all 4 discount levels (20%, 15%, 10%, 5%) on first 4 places
                                            const hasDiscount = index < 4;
                                            const mockDiscount = hasDiscount ? {
                                                percentage: index === 0 ? 20 : index === 1 ? 15 : index === 2 ? 10 : 5,
                                                expiresAt: new Date(Date.now() + (index + 2) * 60 * 60 * 1000) // Expires in 2-5 hours
                                            } : null;
                                            
                                            return (
                                                <MassagePlaceCard
                                                    key={placeId}
                                                    place={place}
                                                    onRate={() => handleOpenRatingModal(place, 'place')}
                                                    onSelectPlace={onSelectPlace}
                                                    onNavigate={onNavigate}
                                                    onIncrementAnalytics={(metric) => onIncrementAnalytics(placeId, 'place', metric)}
                                                    onShowRegisterPrompt={onShowRegisterPrompt}
                                                    isCustomerLoggedIn={!!loggedInCustomer}
                                                    activeDiscount={mockDiscount}
                                                    t={t}
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
            </main>

            {/* Language Prompt Modal */}
            {showLanguagePrompt && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white w-full max-w-sm rounded-xl shadow-lg p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Language</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            We set your app language to{' '}
                            <span className="font-medium">
                                {(() => {
                                    const names: Record<string, string> = {
                                        'en': 'English',
                                        'id': 'Bahasa Indonesia',
                                        'zh-CN': '简体中文',
                                        'ru': 'Русский',
                                        'ja': '日本語',
                                        'ko': '한국어'
                                    };
                                    return names[promptLang] || 'English';
                                })()}
                            </span>{' '}based on your location. You can change it below.
                        </p>
                        <div className="mb-4">
                            <div className="text-xs font-medium text-gray-500 mb-2">Recommended Languages</div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    className={`px-3 py-1.5 text-sm rounded-full border ${promptLang === 'en' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-white text-gray-700 border-gray-200'} hover:border-orange-300`}
                                    onClick={() => setPromptLang('en')}
                                >
                                    EN • English
                                </button>
                                <button
                                    type="button"
                                    className={`px-3 py-1.5 text-sm rounded-full border ${promptLang === 'id' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-white text-gray-700 border-gray-200'} hover:border-orange-300`}
                                    onClick={() => setPromptLang('id')}
                                >
                                    ID • Bahasa Indonesia
                                </button>
                                <button
                                    type="button"
                                    className={`px-3 py-1.5 text-sm rounded-full border ${promptLang === 'zh-CN' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-white text-gray-700 border-gray-200'} hover:border-orange-300`}
                                    onClick={() => setPromptLang('zh-CN' as any)}
                                >
                                    ZH • 简体中文
                                </button>
                                <button
                                    type="button"
                                    className={`px-3 py-1.5 text-sm rounded-full border ${promptLang === 'ru' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-white text-gray-700 border-gray-200'} hover:border-orange-300`}
                                    onClick={() => setPromptLang('ru' as any)}
                                >
                                    RU • Русский
                                </button>
                                <button
                                    type="button"
                                    className={`px-3 py-1.5 text-sm rounded-full border ${promptLang === 'ja' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-white text-gray-700 border-gray-200'} hover:border-orange-300`}
                                    onClick={() => setPromptLang('ja' as any)}
                                >
                                    JA • 日本語
                                </button>
                                <button
                                    type="button"
                                    className={`px-3 py-1.5 text-sm rounded-full border ${promptLang === 'ko' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-white text-gray-700 border-gray-200'} hover:border-orange-300`}
                                    onClick={() => setPromptLang('ko' as any)}
                                >
                                    KO • 한국어
                                </button>
                            </div>
                        </div>
                        <label className="block text-xs text-gray-500 mb-1" htmlFor="prompt-lang">Select language</label>
                        <select
                            id="prompt-lang"
                            value={promptLang}
                            onChange={(e) => setPromptLang(e.target.value as any)}
                            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
                        >
                            <option value="en">English</option>
                            <option value="id">Bahasa Indonesia</option>
                            <option value="zh-CN">简体中文</option>
                            <option value="ru">Русский</option>
                            <option value="ja">日本語</option>
                            <option value="ko">한국어</option>
                        </select>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                                onClick={() => setShowLanguagePrompt(false)}
                            >
                                Not now
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600"
                                onClick={() => {
                                    try { setGlobalLanguage(promptLang as any); } catch {}
                                    setShowLanguagePrompt(false);
                                }}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Custom Orange Location Modal */}
            <OrangeLocationModal
                isVisible={isLocationModalOpen}
                onAllow={handleLocationAllow}
                onDeny={handleLocationDeny}
                language={language === 'id' ? 'id' : 'en'}
                size="compact"
            />
            
            {/* Rating modal removed for design mock */}
            
            </div> {/* End scrollable content container */}

            {/* Footer - Fixed at bottom */}
            <footer 
                className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 z-50" 
                style={{ 
                    position: 'fixed', 
                    bottom: '0px', 
                    left: '0px', 
                    right: '0px', 
                    zIndex: '50'
                }}
            >
                <div className="px-4 py-3 max-w-[430px] sm:max-w-5xl mx-auto">
                    <p className="text-xs text-gray-500 text-center">
                        &copy; 2025 <span className="text-black font-semibold">Inda</span><span className="text-orange-500 font-semibold">street</span> Massage Platform
                    </p>
                </div>
            </footer>
            
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
