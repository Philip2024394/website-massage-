// Helper functions for location and taxi booking
const getUserLocation = () => ({ lat: 0, lng: 0 });
const createTaxiBookingLink = (destination: any) => '#';
const openTaxiApp = (url: string) => window.open(url, '_blank');

import React, { useState, useEffect } from 'react';
import MassagePlaceCard from '../components/MassagePlaceCard';
import RotatingReviews from '../components/RotatingReviews';
import { AppDrawer } from '../components/AppDrawerClean';
import SocialMediaLinks from '../components/SocialMediaLinks';
import PageContainer from '../components/layout/PageContainer';
import { Building, Sparkles } from 'lucide-react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import HomeIcon from '../components/icons/HomeIcon';
import CityLocationDropdown from '../components/CityLocationDropdown';
import { customLinksService } from '../lib/appwrite/services/customLinks.service';
import { useChatProvider } from '../hooks/useChatProvider';
import UniversalHeader from '../components/shared/UniversalHeader';

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

    // Guard: Return early if place is null or undefined
    if (!place) {
        console.log('❌ MASSAGE PLACE PROFILE: No place provided!');
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Place not found</p>
                    <button 
                        onClick={onBack}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Header state
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'home' | 'places'>('places');
    const [cityState, setCityState] = useState<string>(selectedCity);
    
    // Custom links from Appwrite
    const [, setCustomLinks] = useState<any[]>([]); // Removed unused variable name
    
    // Review modal state
    const [showReviewModal, setShowReviewModal] = useState(false);
    
    // Chat provider for notifications
    const { addNotification } = useChatProvider();
    
    // Fetch custom links on mount
    useEffect(() => {
        customLinksService.getAll()
            .then(links => setCustomLinks(links))
            .catch(err => console.error('Failed to fetch custom links:', err));
    }, []);
    
    // Calculate distance between user and place
    const [calculatedDistance, setCalculatedDistance] = useState<number | undefined>(place.distance);
    
    // Check if place should be verified (3+ months membership)
    const isPlaceVerified = () => {
        // Already manually verified
        if (place.isVerified) return true;
        
        // Check if activeMembershipDate exists and is 3+ months old
        if (place.activeMembershipDate) {
            const membershipDate = new Date(place.activeMembershipDate);
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            
            // If membership is 3+ months old, auto-verify
            if (membershipDate <= threeMonthsAgo) {
                return true;
            }
        }
        
        return false;
    };
    
    React.useEffect(() => {
        if (userLocation && place && place.coordinates) {
            const coords = typeof place.coordinates === 'string' 
                ? JSON.parse(place.coordinates) 
                : place.coordinates;
            
            if (coords && coords.lat && coords.lng) {
                // Haversine formula to calculate distance
                const R = 6371; // Earth's radius in km
                const dLat = (coords.lat - userLocation.lat) * Math.PI / 180;
                const dLon = (coords.lng - userLocation.lng) * Math.PI / 180;
                const a = 
                    Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(coords.lat * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                const distance = R * c;
                setCalculatedDistance(distance);
            }
        }
    }, [userLocation, place, place?.coordinates]);

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

            if (result.success && result.deepLink) {
                // Show estimated price
                if (result.estimatedPrice) {
                    const confirmBooking = confirm(
                        `Estimated fare: IDR ${result.estimatedPrice.toLocaleString()}\n` +
                        `Estimated time: ${result.estimatedDuration} mins\n\n` +
                        `Open Gojek app to book bike ride?`
                    );
                    if (!confirmBooking) return;
                }
                
                // Open taxi app
                openTaxiApp(result.deepLink, 'bike');
            } else {
                alert(`Error: ${result.error || 'Unable to create booking link'}`);
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

            if (result.success && result.deepLink) {
                // Show estimated price
                if (result.estimatedPrice) {
                    const confirmBooking = confirm(
                        `Estimated fare: IDR ${result.estimatedPrice.toLocaleString()}\n` +
                        `Estimated time: ${result.estimatedDuration} mins\n\n` +
                        `Open Grab app to book car ride?`
                    );
                    if (!confirmBooking) return;
                }
                
                // Open taxi app
                openTaxiApp(result.deepLink, 'car');
            } else {
                alert(`Error: ${result.error || 'Unable to create booking link'}`);
            }
        } catch (error) {
            console.error('Car taxi booking error:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Please enable location access'}`);
        }
    };

    // Handle missing place
    if (!place) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Place not found</h2>
                    <button onClick={onBack} className="px-6 py-3 bg-orange-500 text-white rounded-lg">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full max-w-full">
            {/* Universal Header */}
            <UniversalHeader 
                language={language}
                onLanguageChange={onLanguageChange}
                onMenuClick={() => setIsMenuOpen(true)}
            />

            {/* Main Content Container */}
            <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-4">
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{place.name}</h1>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{place.location}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Controls - Keeping for functionality but visually removing */}
            <div className="hidden">
                <div className="px-3 sm:px-4 pt-3 pb-3 max-w-6xl mx-auto">
                    <div className="flex flex-row gap-2 items-center max-w-2xl mx-auto">
                        <div className="relative flex-1 min-w-0 max-w-[200px] sm:max-w-none z-20">
                            <CityLocationDropdown
                                selectedCity={cityState}
                                onCityChange={(city) => {
                                    setCityState(city);
                                    onCityChange?.(city);
                                }}
                                placeholder="🇮🇩 All Indonesia"
                                includeAll={true}
                                showLabel={false}
                                className="w-full"
                            />
                        </div>
                        
                        <div className="flex justify-end flex-shrink-0">
                            <button
                                onClick={() => onNavigate?.('facialProviders')}
                                className="px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-sm min-h-[44px] flex items-center justify-center gap-2 shadow-sm"
                                title="Facials Indonesia"
                            >
                                <Sparkles className="w-5 h-5" />
                                <span>Facial</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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

            {/* Main Content */}
            <main className="w-full max-w-full mx-auto px-4 py-6 pb-24 overflow-x-hidden">
                {/* Massage Place Card - Matching Therapist Card Design */}
                <div className="max-w-4xl mx-auto">
                    <MassagePlaceCard
                        place={{
                            ...place,
                            distance: calculatedDistance,
                            isVerified: isPlaceVerified()
                        }}
                        userLocation={userLocation}
                        onRate={() => {
                            console.log('Rate place:', place);
                        }}
                        onSelectPlace={(selectedPlace) => {
                            console.log('Place selected:', selectedPlace);
                        }}
                        onNavigate={onNavigate}
                        onIncrementAnalytics={(metric) => {
                            console.log('Analytics:', metric);
                        }}
                        onShowRegisterPrompt={() => {
                            console.log('Show register prompt');
                        }}
                        isCustomerLoggedIn={!!loggedInCustomer}
                        activeDiscount={(() => {
                            // Mock discount data for testing - same logic as HomePage
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
                        })()}
                        t={{}}
                    />

                    {/* Rotating Reviews Section */}
                    <div className="mt-8">
                        <RotatingReviews 
                            location={place.location || 'Bali'} 
                            limit={5}
                            providerId={(place as any).id || (place as any).$id}
                            providerName={(place as any).name}
                            providerType={'place'}
                            providerImage={(place as any).profilePicture || (place as any).mainImage}
                            onNavigate={onNavigate}
                        />
                    </div>

                    {/* Social Media Icons */}
                    <div className="mt-8">
                        <SocialMediaLinks />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MassagePlaceProfilePage;

