// 🎯 AUTO-FIXED: Mobile scroll architecture violations (5 fixes)
import React, { useState, useEffect } from 'react';
import CityPlaceCard from '../components/CityPlaceCard';
import { FloatingChatWindow } from '../chat';
import { AppDrawer } from '../components/AppDrawerClean';
import { Globe } from 'lucide-react';
import { customLinksService } from '../lib/appwrite/services/customLinks.service';
import { useChatProviderOptional } from '../hooks/useChatProvider';
import UniversalHeader from '../components/shared/UniversalHeader';
import { VERIFIED_BADGE_IMAGE_URL } from '../constants/appConstants';

// Helper functions for location and taxi booking
const getUserLocation = () => ({ lat: 0, lng: 0 });
const createTaxiBookingLink = (destination: any) => '#';
const openTaxiApp = (url: string) => window.open(url, '_blank');

// Helper function to check if discount is active and not expired
const isDiscountActive = (place: Place): boolean => {
    const placeData = place as any;
    return (
        placeData.isDiscountActive && 
        placeData.discountPercentage && 
        placeData.discountPercentage > 0 &&
        placeData.discountEndTime && 
        new Date(placeData.discountEndTime) > new Date()
    );
};

interface Place {
    id?: string | number;
    $id?: string;
    name: string;
    description?: string;
    mainImage?: string;
    profilePicture?: string;
    location: string;
    whatsappNumber?: string;
    email?: string;
    pricing?: any;
    operatingHours?: string;
    rating?: number;
    reviewCount?: number;
    massageTypes?: any;
    status?: string;
    isLive?: boolean;
    distance?: number;
    coordinates?: { lat: number; lng: number } | string;
    isVerified?: boolean;
    verifiedAt?: string;
    activeMembershipDate?: string;
    languages?: string[];
    galleryImages?: Array<{ imageUrl: string; caption: string }>;
    discountPercentage?: number;
    discountDuration?: number;
    isDiscountActive?: boolean;
    discountEndTime?: string;
}

interface MassagePlaceProfilePageProps {
    place: Place;
    onBack: () => void;
    onBook?: () => void;
    userLocation?: { lat: number; lng: number } | null;
    loggedInCustomer?: any; // Customer user object
    // Header controls
    onLanguageChange?: (lang: string) => void;
    language?: string;
    selectedCity?: string;
    onCityChange?: (city: string) => void;
    
    // Navigation callbacks for AppDrawer
    onMassageJobsClick?: () => void;
    onTherapistJobsClick?: () => void;

    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onNavigate?: (page: string) => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    therapists?: any[];
    places?: any[];
}

/**
 * Massage Place Profile Page
 * Displays detailed information about a massage place
 * Refactored using custom hook and modular components
 */
const MassagePlaceProfilePage: React.FC<MassagePlaceProfilePageProps> = ({ 
    place, 
    onBack, 
    onBook, 
    userLocation, 
    loggedInCustomer,
    onLanguageChange,
    language = 'id',
    selectedCity = 'all',
    onCityChange,
    onMassageJobsClick,
    onTherapistJobsClick: _onTherapistJobsClick,

    onVillaPortalClick,
    onTherapistPortalClick: _onTherapistPortalClick,
    onMassagePlacePortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onNavigate,
    onTermsClick,
    onPrivacyClick,
    therapists = [],
    places = []
}) => {
    console.log('🏨 MASSAGE PLACE PROFILE PAGE RENDERING:', {
        hasPlace: !!place,
        placeId: place?.id || place?.$id,
        placeName: place?.name,
        urlPath: window.location.pathname
    });

    // All hooks must run before any early return (Rules of Hooks)
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'home' | 'places'>('places');
    const [cityState, setCityState] = useState<string>(selectedCity);
    const [, setCustomLinks] = useState<any[]>([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [calculatedDistance, setCalculatedDistance] = useState<number | undefined>(place?.distance);

    const { addNotification } = useChatProviderOptional();

    useEffect(() => {
        customLinksService.getAll()
            .then(links => setCustomLinks(links))
            .catch(err => console.error('Failed to fetch custom links:', err));
    }, []);

    useEffect(() => {
        if (!userLocation || !place?.coordinates) return;
        let coords: { lat?: number; lng?: number } | null = null;
        try {
            coords = typeof place.coordinates === 'string'
                ? JSON.parse(place.coordinates)
                : place.coordinates;
        } catch {
            return;
        }
        if (!coords?.lat || !coords?.lng) return;
        const R = 6371;
        const dLat = (coords.lat - userLocation.lat) * Math.PI / 180;
        const dLon = (coords.lng - userLocation.lng) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(coords.lat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        setCalculatedDistance(R * c);
    }, [userLocation, place, place?.coordinates]);

    const isPlaceVerified = () => {
        if (!place) return false;
        if (place.isVerified) return true;
        if (place.activeMembershipDate) {
            const membershipDate = new Date(place.activeMembershipDate);
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            if (membershipDate <= threeMonthsAgo) return true;
        }
        return false;
    };

    // Guard: Return early if place is null or undefined (after all hooks)
    if (!place) {
        console.log('❌ MASSAGE PLACE PROFILE: No place provided!');
        return (
            <>
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Place not found</p>
                    <button 
                        onClick={onBack}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
            <FloatingChatWindow userId={"guest"} userName={"Guest User"} userRole="customer" />
            </>
        );
    }

    // Handle anonymous review submission
    const handleAnonymousReviewSubmit = async (reviewData: any) => {
        try {
            console.log('Review submitted for massage place:', reviewData);
            // Review is handled by AnonymousReviewModal component
            setShowReviewModal(false);
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    // Handle Book Now - open chat window in immediate mode (same as therapist booking)
    const handleBookNowClick = () => {
        console.log('📱 Massage Place Profile Book Now clicked - opening chat window');
        
        // Parse pricing from place data - same structure as therapist pricing
        const parsePricing = (pricingData: any) => {
            if (!pricingData) return { "60": 200000, "90": 300000, "120": 400000 };
            if (typeof pricingData === 'object' && pricingData !== null) return pricingData;
            try {
                const parsed = JSON.parse(pricingData);
                // Convert to proper format if needed (assuming place pricing might be in different units)
                return {
                    "60": parsed["60"] && parsed["60"] < 1000 ? parsed["60"] * 1000 : parsed["60"] || 200000,
                    "90": parsed["90"] && parsed["90"] < 1000 ? parsed["90"] * 1000 : parsed["90"] || 300000,
                    "120": parsed["120"] && parsed["120"] < 1000 ? parsed["120"] * 1000 : parsed["120"] || 400000
                };
            } catch {
                return { "60": 200000, "90": 300000, "120": 400000 };
            }
        };
        
        const pricing = parsePricing(place.pricing);
        console.log('💰 Place pricing for chat:', pricing);
        
        // Calculate active discount for chat window
        const activeDiscountData = (() => {
            // Mock discount data for testing - same logic as HeroSection
            const hasDiscount = place && ((place.id === '1' || place.$id === '1') || (place.name && place.name.toLowerCase().includes('relax')));
            if (!hasDiscount) return null;
            
            // Match HomePage discount logic based on place ID/index
            let percentage = 20; // Default to 20% (first place)
            if (place.id === '2' || place.$id === '2') percentage = 15;
            else if (place.id === '3' || place.$id === '3') percentage = 10;
            else if (place.id === '4' || place.$id === '4') percentage = 5;
            
            return {
                percentage: percentage,
                expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000) // Expires in 3 hours
            };
        })();
        
        // Show notification instead of dispatching event
        addNotification(
            'info',
            'Instant Booking',
            `Please complete booking with ${place.name} to start chatting`,
            { duration: 4000 }
        );
    };
    
    // Handle Schedule booking - open chat window in scheduled mode (same as therapist booking)
    const handleBookingClick = () => {
        console.log('📅 Massage Place Profile Schedule clicked - opening chat in scheduled mode');
        
        // Parse pricing from place data - same structure as therapist pricing
        const parsePricing = (pricingData: any) => {
            if (!pricingData) return { "60": 200000, "90": 300000, "120": 400000 };
            if (typeof pricingData === 'object' && pricingData !== null) return pricingData;
            try {
                const parsed = JSON.parse(pricingData);
                // Convert to proper format if needed (assuming place pricing might be in different units)
                return {
                    "60": parsed["60"] && parsed["60"] < 1000 ? parsed["60"] * 1000 : parsed["60"] || 200000,
                    "90": parsed["90"] && parsed["90"] < 1000 ? parsed["90"] * 1000 : parsed["90"] || 300000,
                    "120": parsed["120"] && parsed["120"] < 1000 ? parsed["120"] * 1000 : parsed["120"] || 400000
                };
            } catch {
                return { "60": 200000, "90": 300000, "120": 400000 };
            }
        };
        
        const pricing = parsePricing(place.pricing);
        console.log('💰 Place pricing for scheduled chat:', pricing);
        
        // Calculate active discount for chat window
        const activeDiscountData = (() => {
            // Mock discount data for testing - same logic as HeroSection
            const hasDiscount = place && ((place.id === '1' || place.$id === '1') || (place.name && place.name.toLowerCase().includes('relax')));
            if (!hasDiscount) return null;
            
            // Match HomePage discount logic based on place ID/index
            let percentage = 20; // Default to 20% (first place)
            if (place.id === '2' || place.$id === '2') percentage = 15;
            else if (place.id === '3' || place.$id === '3') percentage = 10;
            else if (place.id === '4' || place.$id === '4') percentage = 5;
            
            return {
                percentage: percentage,
                expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000) // Expires in 3 hours
            };
        })();
        
        // Show notification instead of dispatching event
        addNotification(
            'info',
            'Scheduled Booking',
            `Please complete booking with ${place.name} to start chatting`,
            { duration: 4000 }
        );
    };

    // Handle Bike Taxi booking
    const handleBikeTaxi = async () => {
        try {
            // Get place coordinates
            let placeCoords = { lat: 0, lng: 0 };
            if (place.coordinates) {
                if (typeof place.coordinates === 'string') {
                    placeCoords = JSON.parse(place.coordinates);
                } else {
                    placeCoords = place.coordinates;
                }
            }

            if (!placeCoords.lat || !placeCoords.lng) {
                alert('Place location not available. Please contact the massage place.');
                return;
            }

            // Get user location
            const userLoc = await getUserLocation();
            
            // Create booking link via Appwrite
            const result = await createTaxiBookingLink({
                userLocation: userLoc,
                placeLocation: placeCoords,
                taxiType: 'bike',
                placeName: place.name,
                userId: loggedInCustomer?.$id || loggedInCustomer?.id
            });

            if ((result as any).success && (result as any).deepLink) {
                // Show estimated price
                if ((result as any).estimatedPrice) {
                    const confirmBooking = confirm(
                        `Estimated fare: IDR ${(result as any).estimatedPrice.toLocaleString()}\n` +
                        `Estimated time: ${(result as any).estimatedDuration} mins\n\n` +
                        `Open Gojek app to book bike ride?`
                    );
                    if (!confirmBooking) return;
                }
                
                // Open taxi app
                openTaxiApp((result as any).deepLink);
            } else {
                alert(`Error: ${(result as any).error || 'Unable to create booking link'}`);
            }
        } catch (error) {
            console.error('Bike taxi booking error:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Please enable location access'}`);
        }
    };

    // Handle Car Taxi booking
    const handleCarTaxi = async () => {
        try {
            // Get place coordinates
            let placeCoords = { lat: 0, lng: 0 };
            if (place.coordinates) {
                if (typeof place.coordinates === 'string') {
                    placeCoords = JSON.parse(place.coordinates);
                } else {
                    placeCoords = place.coordinates;
                }
            }

            if (!placeCoords.lat || !placeCoords.lng) {
                alert('Place location not available. Please contact the massage place.');
                return;
            }

            // Get user location
            const userLoc = await getUserLocation();
            
            // Create booking link via Appwrite
            const result = await createTaxiBookingLink({
                userLocation: userLoc,
                placeLocation: placeCoords,
                taxiType: 'car',
                placeName: place.name,
                userId: loggedInCustomer?.$id || loggedInCustomer?.id
            });

            if ((result as any).success && (result as any).deepLink) {
                // Show estimated price
                if ((result as any).estimatedPrice) {
                    const confirmBooking = confirm(
                        `Estimated fare: IDR ${(result as any).estimatedPrice.toLocaleString()}\n` +
                        `Estimated time: ${(result as any).estimatedDuration} mins\n\n` +
                        `Open Grab app to book car ride?`
                    );
                    if (!confirmBooking) return;
                }
                
                // Open taxi app
                openTaxiApp((result as any).deepLink);
            } else {
                alert(`Error: ${(result as any).error || 'Unable to create booking link'}`);
            }
        } catch (error) {
            console.error('Car taxi booking error:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Please enable location access'}`);
        }
    };

    // Handle missing place
    if (!place) {
        return (
            <>
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Place not found</h2>
                    <button onClick={onBack} className="px-6 py-3 bg-amber-500 text-white rounded-lg">
                        Go Back
                    </button>
                </div>
            </div>
            {/* Floating Chat Window */}
            <FloatingChatWindow userId={"guest"} userName={"Guest User"} userRole="customer" />
            </>

        );
    }

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 w-full max-w-full">
            {/* Universal Header */}
            <UniversalHeader 
                language={language}
                onLanguageChange={onLanguageChange}
                onMenuClick={() => setIsMenuOpen(true)}
            />

            {/* Content below fixed header: top padding = header height so hero/location are not hidden */}
            <div className="pt-[60px] sm:pt-[64px]">
            {/* Hero area – full-width banner with place image, name, location */}
            <section className="w-full max-w-full overflow-hidden bg-gray-200">
                <div className="relative w-full aspect-[21/9] min-h-[160px] max-h-[280px]">
                    <img
                        src={(place as any).mainImage || (place as any).image || (place as any).profilePicture || 'https://ik.imagekit.io/7grri5v7d/ma%201.png'}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/7grri5v7d/ma%201.png';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    {isPlaceVerified() && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                            <img
                                src={VERIFIED_BADGE_IMAGE_URL}
                                alt="Verified"
                                className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md"
                                title="Verified"
                            />
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h1 className="text-xl sm:text-2xl font-bold drop-shadow-sm">{place.name}</h1>
                        <p className="text-sm text-white/95 mt-0.5 flex items-center gap-1.5">
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span>{(place as any).location || (place as any).address || (place as any).city || 'Indonesia'}</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* Global App Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onMassageJobsClick={onMassageJobsClick}
                onTherapistPortalClick={_onTherapistPortalClick || (() => {})}
                onVillaPortalClick={onVillaPortalClick || (() => {})}
                onMassagePlacePortalClick={onMassagePlacePortalClick || (() => {})}
                onAgentPortalClick={onAgentPortalClick || (() => {})}
                onCustomerPortalClick={onCustomerPortalClick}
                onAdminPortalClick={onAdminPortalClick || (() => {})}
                onNavigate={onNavigate}
                onTermsClick={onTermsClick}
                onPrivacyClick={onPrivacyClick}
                therapists={therapists}
                places={places}
            />

            {/* Main Content - same layout as massage city places home */}
            <main className="w-full max-w-full mx-auto px-4 py-6 pb-24 ">
                <div className="max-w-full">
                    <div className="mb-3 text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Featured Massage Spas</h3>
                        <p className="text-gray-600">
                            {cityState && cityState !== 'all' ? `Find the best massage places in ${cityState}` : 'Find the best massage places across Indonesia'}
                        </p>
                    </div>
                    <div className="space-y-4">
                        <CityPlaceCard
                            place={{
                                ...place,
                                distance: calculatedDistance ?? 0,
                                isVerified: isPlaceVerified()
                            }}
                            category="massage"
                            onClick={() => {}}
                            onIncrementAnalytics={() => {}}
                            userLocation={userLocation ?? undefined}
                        />
                        <a
                            href="https://www.indastreet.com/social"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                            <Globe className="w-5 h-5 text-amber-500" />
                            <span>IndaStreet Social</span>
                        </a>
                    </div>
                </div>
            </main>
            </div>
            <FloatingChatWindow userId="guest" userName="Guest User" userRole="customer" />
        </div>
    );
};

export default MassagePlaceProfilePage;








