import React, { useState, useEffect } from 'react';
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
    t 
}) => {
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
            if (isLocationDetecting || autoDetectedLocation) return;
            
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
                    // No coordinates available, show all therapists
                    setNearbyTherapists(therapists);
                    setNearbyPlaces(places);
                    return;
                }

                // Find nearby therapists and places (15km radius)
                const nearbyTherapistsResult = await findNearbyTherapists('0', coords, 15);
                const nearbyPlacesResult = await findNearbyPlaces('0', coords, 15);
                
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
                        <div className="relative flex-1 min-w-0">
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
                            className="ml-auto p-0 bg-transparent border-0 hover:opacity-90 transition-opacity cursor-pointer h-[108px] w-[216px] flex items-center justify-center flex-shrink-0"
                            type="button"
                            title="Click to go to Online Shop"
                        >
                            <img 
                                src="https://ik.imagekit.io/7grri5v7d/online%20shop.png"
                                alt="Online Shop"
                                className="h-full w-auto select-none"
                                loading="lazy"
                                draggable={false}
                            />
                        </button>
                    </div>
                    
                    {/* Massage Directory Button - Centered */}
                    <div className="flex justify-center mt-3">
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('📋 Massage Directory button clicked!');
                                console.log('onNavigate function exists:', !!onNavigate);
                                
                                if (onNavigate) {
                                    console.log('✅ Calling onNavigate with massageTypes');
                                    try {
                                        onNavigate('massageTypes');
                                        console.log('✅ Navigation to massageTypes called successfully');
                                    } catch (error) {
                                        console.error('❌ Error calling onNavigate:', error);
                                    }
                                } else {
                                    console.error('❌ onNavigate is not available!');
                                    alert('Navigation function not available. Please refresh the page.');
                                }
                            }}
                            className="text-orange-500 font-semibold text-sm hover:text-orange-600 transition-colors bg-orange-50 px-4 py-2 rounded border-2 border-orange-200 cursor-pointer"
                            type="button"
                            title="Click to go to Massage Directory"
                        >
                            Massage Directory
                        </button>
                    </div>
                </div>

                {/* Therapists and Places Display */}
                {activeTab === 'home' && (
                    <div>
                        <div className="mb-6 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Terapis Pijat Rumahan</h3>
                            <p className="text-gray-600">Temukan terapis pijat terbaik di Bali</p>
                        </div>
                        
                        <div className="space-y-4">
                        {nearbyTherapists
                            .filter((t: any) => t.isLive === true) // Only show activated therapists
                            .filter((t: any) => selectedMassageType === 'all' || (t.massageTypes && t.massageTypes.includes(selectedMassageType)))
                            .map((therapist: any, index: number) => {
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
                                        activeDiscount={realDiscount}
                                        t={t}
                                    />
                                );
                            })}
                        {nearbyTherapists.filter((t: any) => t.isLive === true).length === 0 && (
                            <div className="text-center py-12 bg-white rounded-lg">
                                <p className="text-gray-500">Tidak ada terapis tersedia di area Anda saat ini.</p>
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
            
            {/* Custom Orange Location Modal */}
            <OrangeLocationModal
                isVisible={isLocationModalOpen}
                onAllow={handleLocationAllow}
                onDeny={handleLocationDeny}
                language='id'
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
