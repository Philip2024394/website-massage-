import React, { useState, useEffect } from 'react';
import { useMassagePlaceProfile } from '../hooks/useMassagePlaceProfile';
import { ProfileHeader } from '../components/features/profile/ProfileHeader';
import { HeroSection } from '../components/features/profile/HeroSection';
import { GalleryImageCard } from '../components/features/profile/GalleryImageCard';
import { ServiceItem } from '../components/features/profile/ServiceItem';
import { ExpandedImageModal } from '../components/features/profile/ExpandedImageModal';
import { AppDrawer } from '../components/AppDrawerClean';
import SocialMediaSection from '../components/features/profile/SocialMediaSection';
import { Bike, Car, Building, Sparkles } from 'lucide-react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import HomeIcon from '../components/icons/HomeIcon';
import CityLocationDropdown from '../components/CityLocationDropdown';
import { getUserLocation, createTaxiBookingLink, openTaxiApp } from '../services/taxiBookingService';
import { getAmenityIcon } from '../constants/amenityIcons';
import { customLinksService } from '../lib/appwriteService';
import PageNumberBadge from '../components/PageNumberBadge';
import AnonymousReviewModal from '../components/AnonymousReviewModal';

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
    // Guard: Return early if place is null or undefined
    if (!place) {
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
    const [activeTab, setActiveTab] = useState<'home' | 'places'>('home');
    const [cityState, setCityState] = useState<string>(selectedCity);
    
    // Custom links from Appwrite
    const [, setCustomLinks] = useState<any[]>([]); // Removed unused variable name
    
    // Review modal state
    const [showReviewModal, setShowReviewModal] = useState(false);
    
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
    
    // Use custom hook for all data and logic
    const {
        services,
        amenities,
        galleryImages,
        isFavorite: _isFavorite, // Keep for destructuring but marked as used
        expandedImage,
        setIsFavorite: _setIsFavorite, // Keep for destructuring but marked as used
        setExpandedImage
    } = useMassagePlaceProfile(place);

    // Suppress unused variable warnings for destructured values
    void _isFavorite;
    void _setIsFavorite;

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
        
        // Dispatch openChat event just like therapist bookings
        window.dispatchEvent(new CustomEvent('openChat', {
            detail: {
                therapistId: String(place.$id || place.id || ''),
                therapistName: place.name,
                therapistType: 'place',
                therapistStatus: 'available', // Places are considered available during business hours
                pricing: pricing,
                profilePicture: place.mainImage || place.profilePicture,
                providerRating: (place as any).rating || 0,
                discountPercentage: activeDiscountData?.percentage || 0,
                discountActive: !!activeDiscountData,
                mode: 'immediate'
            }
        }));
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
        
        // Dispatch openChat event in scheduled mode
        window.dispatchEvent(new CustomEvent('openChat', {
            detail: {
                therapistId: String(place.$id || place.id || ''),
                therapistName: place.name,
                therapistType: 'place',
                therapistStatus: 'available', // Places are considered available during business hours
                pricing: pricing,
                profilePicture: place.mainImage || place.profilePicture,
                providerRating: (place as any).rating || 0,
                discountPercentage: activeDiscountData?.percentage || 0,
                discountActive: !!activeDiscountData,
                mode: 'scheduled'
            }
        }));
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
            {/* Header with Brand, Language, and Menu */}
            <header className="sticky top-0 z-50 bg-white shadow-sm">
                <div className="px-4 py-3">
                    <div className="flex justify-between items-center max-w-7xl mx-auto">
                        {/* Brand Name with Back Button */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    if (onNavigate) {
                                        onNavigate('home');
                                    } else if (typeof window !== 'undefined') {
                                        window.location.href = '/';
                                    }
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                title="Back"
                            >
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-xl sm:text-2xl font-bold">
                                <span className="text-black">Inda</span>
                                <span className="text-orange-500">Street</span>
                            </h1>
                        </div>
                        
                        {/* Language & Menu */}
                        <div className="flex items-center gap-2 sm:gap-3 text-gray-600 flex-shrink-0">
                            {/* Language Selector */}
                            <button 
                                onClick={() => {
                                    const currentLang = language || 'id';
                                    const newLanguage = currentLang === 'id' ? 'en' : 'id';
                                    onLanguageChange?.(newLanguage);
                                }} 
                                className="flex items-center justify-center min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 hover:bg-orange-50 rounded-full transition-colors flex-shrink-0" 
                                title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
                            >
                                <span className="text-xl sm:text-2xl">
                                    {language === 'id' ? '🇮🇩' : '🇬🇧'}
                                </span>
                            </button>

                            <button 
                                onClick={() => setIsMenuOpen(true)} 
                                title="Menu" 
                                className="hover:bg-orange-50 rounded-full transition-colors text-orange-500 flex-shrink-0 min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center"
                            >
                               <BurgerMenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section with Location & Controls */}
            <div className="bg-white sticky top-[60px] z-10 border-b border-gray-100">
                <div className="px-3 sm:px-4 pt-3 pb-3 max-w-6xl mx-auto">
                    {/* Location Display */}
                    <div className="text-center mb-3">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">
                                {cityState === 'all' ? 'All Indonesia' : cityState}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Indonesia's Massage Therapist Hub</p>
                    </div>

                    {/* Toggle Buttons */}
                    <div className="flex bg-gray-200 rounded-full p-1 max-w-md mx-auto mb-3">
                        <button 
                            onClick={() => {
                                setActiveTab('home');
                                onNavigate?.('home');
                            }}
                            className={`w-1/2 py-2.5 px-3 sm:px-4 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-colors duration-300 min-h-[44px] ${activeTab === 'home' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                        >
                            <HomeIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">Home Service</span>
                        </button>
                        <button 
                            onClick={() => {
                                setActiveTab('places');
                                onNavigate?.('home');
                            }}
                            className={`w-1/2 py-2.5 px-3 sm:px-4 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-colors duration-300 min-h-[44px] ${activeTab === 'places' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                        >
                            <Building className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">Massage Places</span>
                        </button>
                    </div>

                    {/* City Dropdown + Facial Button */}
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
                <PageNumberBadge pageNumber={83} pageName="MassagePlaceProfile" isLocked={false} />
                
                {/* Hero Section with place info and actions */}
                <HeroSection
                    place={{ 
                        ...place, 
                        distance: calculatedDistance,
                        isVerified: isPlaceVerified() 
                    }}
                    onBookNowClick={handleBookNowClick}
                    onBookClick={handleBookingClick}
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
                    onRate={(place) => {
                        setShowReviewModal(true);
                    }}
                />

                {/* Gallery Section - 6 Images with Captions + Mobile Swipe Support */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 max-w-full overflow-hidden">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Our Establishment</h3>
                    
                    {/* Mobile: Swipeable Gallery */}
                    <div className="block md:hidden mb-4 overflow-hidden">
                        <div className="relative overflow-hidden">
                            <div 
                                className="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                <div className="flex gap-3 pb-4 px-1">
                                    {galleryImages.slice(0, 6).map((image, index) => (
                                        <div 
                                            key={index}
                                            className="flex-shrink-0 w-[80%] sm:w-[45%] md:w-[30%] snap-center"
                                            onClick={() => setExpandedImage(image)}
                                        >
                                            <div className="relative rounded-xl overflow-hidden shadow-md aspect-[4/3] bg-gray-100">
                                                <img
                                                    src={image.imageUrl || 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png'}
                                                    alt={image.caption || `Gallery ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png';
                                                    }}
                                                />
                                                {image.caption && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                                        <p className="text-white text-sm font-medium line-clamp-2">{image.caption}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Swipe Indicator */}
                            <div className="flex justify-center gap-1.5 mt-2">
                                {galleryImages.slice(0, 6).map((_, index) => (
                                    <div key={index} className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Desktop: Grid Gallery */}
                    <div className="hidden md:grid grid-cols-2 md:grid-cols-3 gap-4 pb-20">
                        {galleryImages.slice(0, 6).map((image, index) => (
                            <GalleryImageCard
                                key={index}
                                image={image}
                                onImageClick={setExpandedImage}
                            />
                        ))}
                    </div>
                </div>

                {/* Social Media Section (replaces Prices when social links present) or fallback to Prices */}
                {(() => {
                    const websiteUrl = (place as any).websiteUrl as string | undefined;
                    const igFromWebsite = websiteUrl && websiteUrl.includes('instagram.com') ? websiteUrl : undefined;
                    const fbFromWebsite = websiteUrl && websiteUrl.includes('facebook.com') ? websiteUrl : undefined;
                    const instagramUrl = (place as any).instagramUrl || (place as any).instagram || igFromWebsite;
                    const facebookPageUrl = (place as any).facebookPageUrl || (place as any).facebook || fbFromWebsite;
                    const instagramPosts = (place as any).instagramPosts;
                    const facebookPosts = (place as any).facebookPosts;

                    // 🎨 MOCK DATA FOR PREVIEW - Replace with real data from dashboard
                    const mockInstagramUrl = "https://www.instagram.com/dewave_jogja/?hl=en";
                    const mockFacebookPageUrl = "https://www.facebook.com/dewave.jogja";
                    const mockInstagramPosts = [
                        { image: "https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png", link: "https://www.instagram.com/p/DDAnRQ4Scjc/" },
                        { image: "https://ik.imagekit.io/7grri5v7d/massage%20oil.png?updatedAt=1760816872135", link: "https://www.instagram.com/p/DDAnP6WyA4s/" },
                        { image: "https://ik.imagekit.io/7grri5v7d/massage%20spa.png?updatedAt=1762514431664", link: "https://www.instagram.com/p/DDAnO0gSglB/" },
                        { image: "https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png", link: "https://www.instagram.com/p/DDAnNfPyB-x/" },
                        { image: "https://ik.imagekit.io/7grri5v7d/massage%20oil.png?updatedAt=1760816872135", link: "https://www.instagram.com/p/DDAnLt6yWZc/" },
                        { image: "https://ik.imagekit.io/7grri5v7d/massage%20spa.png?updatedAt=1762514431664", link: "https://www.instagram.com/p/DDAnKIlSoOY/" }
                    ];
                    const mockFacebookPosts = [
                        { image: "https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png", link: "https://www.facebook.com/dewave.jogja/posts/1" },
                        { image: "https://ik.imagekit.io/7grri5v7d/massage%20oil.png?updatedAt=1760816872135", link: "https://www.facebook.com/dewave.jogja/posts/2" },
                        { image: "https://ik.imagekit.io/7grri5v7d/massage%20spa.png?updatedAt=1762514431664", link: "https://www.facebook.com/dewave.jogja/posts/3" },
                        { image: "https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png", link: "https://www.facebook.com/dewave.jogja/posts/4" },
                        { image: "https://ik.imagekit.io/7grri5v7d/massage%20oil.png?updatedAt=1760816872135", link: "https://www.facebook.com/dewave.jogja/posts/5" },
                        { image: "https://ik.imagekit.io/7grri5v7d/massage%20spa.png?updatedAt=1762514431664", link: "https://www.facebook.com/dewave.jogja/posts/6" }
                    ];

                    // Use mock data to preview design (remove this after testing)
                    const previewInstagram = instagramUrl || mockInstagramUrl;
                    const previewFacebook = facebookPageUrl || mockFacebookPageUrl;
                    const previewInstagramPosts = instagramPosts || mockInstagramPosts;
                    const previewFacebookPosts = facebookPosts || mockFacebookPosts;

                    if (previewInstagram || previewFacebook) {
                        return (
                            <SocialMediaSection
                                instagramUrl={previewInstagram}
                                instagramPosts={previewInstagramPosts}
                                facebookPageUrl={previewFacebook}
                                facebookPosts={previewFacebookPosts}
                            />
                        );
                    }

                    // Fallback to original Massage Prices section if no social configured
                    return (
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 relative h-48 max-w-full">
                            <div className="absolute inset-0">
                                <img
                                    src="https://ik.imagekit.io/7grri5v7d/massage%20oil.png?updatedAt=1760816872135"
                                    alt="Massage Oil"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="relative z-10 p-6 max-w-full overflow-hidden">
                                <h3 className="text-3xl font-bold text-black mb-6 drop-shadow-2xl text-center">Massage Prices</h3>
                                <div className="space-y-4 max-w-full">
                                    {isDiscountActive(place) && (
                                        <div className="text-center mb-6">
                                            <p className="text-orange-600 font-bold text-lg flex items-center justify-center gap-2 drop-shadow-lg">
                                                🔥 Discounted Prices Displayed
                                            </p>
                                        </div>
                                    )}
                                    {services.length > 0 ? (
                                        services.map((service, index) => {
                                            const discountPercentage = isDiscountActive(place) ? (place as any).discountPercentage : 0;
                                            const originalPrice = typeof service.price === 'number' ? service.price : parseInt(String(service.price).replace(/\D/g, '')) || 0;
                                            const discountedPrice = discountPercentage > 0
                                                ? Math.round(originalPrice * (1 - discountPercentage / 100))
                                                : originalPrice;
                                            return (
                                                <div key={index} className="flex items-center justify-between py-3 px-4 backdrop-blur-sm bg-white/50 rounded-lg border-2 border-orange-500/40">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-orange-600 text-2xl drop-shadow-lg">{service.icon}</span>
                                                        <div>
                                                            <h4 className="text-orange-600 font-bold text-lg drop-shadow-lg">{service.name}</h4>
                                                            <p className="text-orange-700 text-sm drop-shadow-md">{service.duration}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {discountPercentage > 0 ? (
                                                            <>
                                                                <p className="text-gray-600 line-through text-sm drop-shadow-md">IDR {originalPrice.toLocaleString()}</p>
                                                                <p className="text-black font-bold text-xl drop-shadow-2xl">IDR {discountedPrice.toLocaleString()}</p>
                                                            </>
                                                        ) : (
                                                            <p className="text-black font-bold text-xl drop-shadow-2xl">IDR {originalPrice.toLocaleString()}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-orange-600 text-center text-lg drop-shadow-lg">Contact us for pricing details</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Amenities Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 relative min-h-[250px] max-w-full">
                    {/* Background Image - Full Coverage */}
                    <div className="absolute inset-0">
                        <img
                            src="https://ik.imagekit.io/7grri5v7d/massage%20spa.png?updatedAt=1762514431664"
                            alt="Massage Spa Background"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    
                    {/* Content - Text directly on background */}
                    <div className="relative z-10 p-4 max-w-full overflow-hidden">
                        <h3 className="text-2xl font-bold text-black mb-1 drop-shadow-2xl text-center">Amenities</h3>
                        <p className="text-xs text-gray-700 mb-4 text-center drop-shadow-lg">Additional services provided during your massage session</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-full">
                            {Array.isArray(amenities) && amenities.map((amenity, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 backdrop-blur-sm bg-white/50 rounded-lg border-2 border-orange-500/40 hover:border-orange-500/60 transition-all hover:shadow-lg">
                                    <span className="text-2xl drop-shadow-lg">{getAmenityIcon(amenity)}</span>
                                    <span className="font-semibold text-base text-orange-600 drop-shadow-lg">{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Visit Us Section with Location and Transport Options */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-24 max-w-full overflow-hidden">
                    {place.location && place.location.trim() !== '' && place.location !== 'Location pending setup' && (
                        <p className="text-gray-700 mb-6">{place.location}</p>
                    )}
                    
                    {/* Visit Us Transport Container */}
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-5 relative overflow-hidden">
                        {/* Background Image */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <img
                                src="https://ik.imagekit.io/7grri5v7d/car%20taxi.png?updatedAt=1761984176333"
                                alt="Transport"
                                className="w-full h-full object-contain opacity-20"
                            />
                        </div>
                        
                        {/* Content - Above Background */}
                        <div className="relative z-10">
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Visit Us</h3>
                                <p className="text-sm text-gray-600">Select Your Transport Choice</p>
                            </div>
                        
                        {/* Transport Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => alert('This feature is in development and coming soon.')}
                                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-yellow-500 text-white font-semibold text-sm rounded-lg hover:bg-yellow-600 transition-colors shadow-lg"
                            >
                                <Bike className="w-4 h-4" />
                                <span>Bike</span>
                            </button>
                            <button
                                onClick={() => alert('This feature is in development and coming soon.')}
                                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-yellow-500 text-white font-semibold text-sm rounded-lg hover:bg-yellow-600 transition-colors shadow-lg"
                            >
                                <Car className="w-4 h-4" />
                                <span>Car</span>
                            </button>
                        </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Expanded Image Modal */}
            {expandedImage && (
                <ExpandedImageModal
                    image={expandedImage}
                    onClose={() => setExpandedImage(null)}
                />
            )}

            {/* Anonymous Review Modal */}
            {showReviewModal && place && (
                <AnonymousReviewModal
                    providerName={place.name}
                    providerId={((place as any).$id || (place as any).id || '') as string}
                    providerType="place"
                    providerImage={(place as any).mainImage || 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382'}
                    onClose={() => setShowReviewModal(false)}
                    onSubmit={handleAnonymousReviewSubmit}
                />
            )}
        </div>
    );
};

export default MassagePlaceProfilePage;

