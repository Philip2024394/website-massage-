import React, { useState, useEffect } from 'react';
import { useMassagePlaceProfile } from '../hooks/useMassagePlaceProfile';
import { ProfileHeader } from '../components/features/profile/ProfileHeader';
import { HeroSection } from '../components/features/profile/HeroSection';
import { GalleryImageCard } from '../components/features/profile/GalleryImageCard';
import { ServiceItem } from '../components/features/profile/ServiceItem';
import { ExpandedImageModal } from '../components/features/profile/ExpandedImageModal';
import { AppDrawer } from '../components/AppDrawer';
import { Bike, Car } from 'lucide-react';
import { getUserLocation, createTaxiBookingLink, openTaxiApp } from '../services/taxiBookingService';
import { getAmenityIcon } from '../constants/amenityIcons';
import { customLinksService } from '../lib/appwriteService';

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
}

interface MassagePlaceProfilePageProps {
    place: Place;
    onBack: () => void;
    onBook?: () => void;
    userLocation?: { lat: number; lng: number } | null;
    loggedInCustomer?: any; // Customer user object
    
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
    onMassageJobsClick,
    onTherapistJobsClick,

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
    // Side menu drawer state
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Custom links from Appwrite
    const [_customLinks, setCustomLinks] = useState<any[]>([]);
    
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
        if (userLocation && place.coordinates) {
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
    }, [userLocation, place.coordinates]);
    
    // Use custom hook for all data and logic
    const {
        services,
        amenities,
        galleryImages,
        isFavorite: _isFavorite,
        expandedImage,
        setIsFavorite: _setIsFavorite,
        setExpandedImage
    } = useMassagePlaceProfile(place);

    // Handle booking - same as therapist book now
    const handleBookNowClick = () => {
        if (onBook) {
            onBook();
        }
    };
    
    // Handle booking calendar
    const handleBookingClick = () => {
        if (onBook) {
            onBook();
        }
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
        <div className="min-h-screen bg-gray-50">
            {/* Header with brand and menu burger */}
            <ProfileHeader
                onMenuClick={() => setIsMenuOpen(true)}
            />

            {/* Global App Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onMassageJobsClick={onMassageJobsClick}
                onTherapistPortalClick={onTherapistJobsClick || (() => {})}
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
            <main className="w-full max-w-6xl mx-auto px-4 py-6 pb-4">
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
                    onRate={(place) => {
                        // TODO: Implement review modal for places
                        console.log('Rate place:', place);
                    }}
                />

                {/* Gallery Section - 6 Images with Captions */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Establishment</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {galleryImages.slice(0, 6).map((image, index) => (
                            <GalleryImageCard
                                key={index}
                                image={image}
                                onImageClick={setExpandedImage}
                            />
                        ))}
                    </div>
                </div>

                {/* Massage Prices Section with Background Image */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 relative">
                    {/* Background Image - Centered behind text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <img
                            src="https://ik.imagekit.io/7grri5v7d/massage%20oil.png?updatedAt=1760816872135"
                            alt="Massage Oil"
                            className="w-48 h-48 md:w-64 md:h-64 object-contain opacity-100"
                        />
                    </div>
                    
                    {/* Content - Above Background */}
                    <div className="relative z-10 p-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Massage Prices</h3>
                        <div className="space-y-3">
                            {services.length > 0 ? (
                                services.map((service, index) => (
                                    <ServiceItem key={index} service={service} />
                                ))
                            ) : (
                                <p className="text-gray-500">Contact us for pricing details</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Amenities Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.isArray(amenities) && amenities.map((amenity, index) => (
                            <div key={index} className="flex items-center gap-3 text-gray-700 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors shadow-sm">
                                {getAmenityIcon(amenity)}
                                <span className="font-medium">{amenity}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Visit Us Section with Location and Transport Options */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-0">
                    <p className="text-gray-700 mb-6">{place.location}</p>
                    
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
                                onClick={handleBikeTaxi}
                                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-yellow-500 text-white font-semibold text-sm rounded-lg hover:bg-yellow-600 transition-colors shadow-lg"
                            >
                                <Bike className="w-4 h-4" />
                                <span>Bike Ride</span>
                            </button>
                            <button
                                onClick={handleCarTaxi}
                                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-yellow-500 text-white font-semibold text-sm rounded-lg hover:bg-yellow-600 transition-colors shadow-lg"
                            >
                                <Car className="w-4 h-4" />
                                <span>Car Taxi</span>
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
        </div>
    );
};

export default MassagePlaceProfilePage;
