import React, { useState } from 'react';
import { ArrowLeft, MapPin, Star, Clock, MessageCircle, Phone, Share2, Heart } from 'lucide-react';
import { AppDrawer } from '../components/AppDrawer';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { getDisplayRating, getDisplayReviewCount, formatRating } from '../utils/ratingUtils';
import { Therapist, Place } from '../types';

interface TherapistProfilePageProps {
    therapist: Therapist;
    onBack: () => void;
    onBook?: () => void;
    onQuickBookWithChat?: (therapist: Therapist) => void;
    userLocation?: { lat: number; lng: number } | null;
    loggedInCustomer?: any;
    
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
    therapists?: Therapist[];
    places?: Place[];
}

const ProfileHeader: React.FC<{ onMenuClick: () => void; onBack: () => void }> = ({ onMenuClick, onBack }) => (
    <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Go back"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">
                    <span className="text-black">Inda</span>
                    <span className="text-orange-500">Street</span>
                </h1>
            </div>
            <button
                onClick={onMenuClick}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Open menu"
            >
                <BurgerMenuIcon className="w-6 h-6" />
            </button>
        </div>
    </header>
);

const TherapistProfilePage: React.FC<TherapistProfilePageProps> = ({
    therapist,
    onBack,
    onQuickBookWithChat,
    userLocation,
    onMassageJobsClick,
    onTherapistJobsClick,
    onVillaPortalClick,
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);

    // Calculate distance if user location is available
    const distance = userLocation && therapist.coordinates ? 
        (() => {
            try {
                const coords = typeof therapist.coordinates === 'string' 
                    ? JSON.parse(therapist.coordinates) 
                    : therapist.coordinates;
                return calculateDistance(
                    userLocation.lat, 
                    userLocation.lng, 
                    coords.lat, 
                    coords.lng
                );
            } catch {
                return null;
            }
        })() : null;

    // Format pricing for display
    const formatPrice = (price: number): string => {
        if (price >= 1000) {
            return `${Math.floor(price / 1000)}k`;
        }
        return price.toString();
    };

    // Get therapist availability status
    const getAvailabilityStatus = () => {
        // Add your availability logic here
        return 'Available'; // Default for now
    };

    // Handle WhatsApp contact
    const handleWhatsAppContact = () => {
        if (therapist.whatsappNumber) {
            const message = encodeURIComponent(
                `Hi ${therapist.name}, I found your profile on IndaStreet and I'm interested in booking a massage session.`
            );
            window.open(`https://wa.me/${therapist.whatsappNumber}?text=${message}`, '_blank');
        }
    };

    // Handle share profile
    const handleShareProfile = () => {
        if (navigator.share) {
            navigator.share({
                title: `${therapist.name} - Professional Massage Therapist`,
                text: `Check out ${therapist.name} on IndaStreet - Professional massage therapy services`,
                url: window.location.href,
            });
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Profile link copied to clipboard!');
        }
    };

    if (!therapist) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Therapist not found</h2>
                    <button onClick={onBack} className="px-6 py-3 bg-orange-500 text-white rounded-lg">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ProfileHeader
                onMenuClick={() => setIsMenuOpen(true)}
                onBack={onBack}
            />

            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onMassageJobsClick={onMassageJobsClick}
                onTherapistPortalClick={onTherapistJobsClick || (() => {})}
                onVillaPortalClick={onVillaPortalClick || (() => {})}
                onMassagePlacePortalClick={onMassagePlacePortalClick || (() => {})}
                onAgentPortalClick={onAgentPortalClick || (() => {})}
                onCustomerPortalClick={onCustomerPortalClick || (() => {})}
                onAdminPortalClick={onAdminPortalClick || (() => {})}
                onNavigate={onNavigate}
                onTermsClick={onTermsClick || (() => {})}
                onPrivacyClick={onPrivacyClick || (() => {})}
                therapists={therapists}
                places={places}
            />

            <div className="p-4 pb-20">
                {/* Hero Section */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                    {/* Cover Image */}
                    <div className="h-48 bg-gradient-to-r from-orange-400 to-orange-600 relative">
                        <img 
                            src={(therapist as any).mainImage || 'https://ik.imagekit.io/7grri5v7d/massage%20villa%20service%20indonisea.png?updatedAt=1761583264188'}
                            alt={`${therapist.name} cover`}
                            className="w-full h-full object-cover"
                        />
                        
                        {/* Action Buttons */}
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button
                                onClick={() => setIsFavorited(!isFavorited)}
                                className={`p-3 rounded-full shadow-lg transition-colors ${
                                    isFavorited ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
                                }`}
                            >
                                <Heart className="w-5 h-5" fill={isFavorited ? 'currentColor' : 'none'} />
                            </button>
                            <button
                                onClick={handleShareProfile}
                                className="p-3 bg-white text-gray-600 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                            {/* Profile Picture */}
                            <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg -mt-10 relative z-10">
                                <img
                                    src={(therapist as any).profilePicture || `https://via.placeholder.com/150/FFB366/FFFFFF?text=${encodeURIComponent(therapist.name.charAt(0))}`}
                                    alt={`${therapist.name} profile`}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h1 className="text-2xl font-bold text-gray-900">{therapist.name}</h1>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                        <span className="font-semibold">{formatRating(getDisplayRating(therapist.rating, therapist.reviewCount))}</span>
                                        <span className="text-gray-500">({getDisplayReviewCount(therapist.reviewCount)})</span>
                                    </div>
                                </div>
                                
                                {distance && (
                                    <div className="flex items-center gap-1 text-gray-600 mt-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{distance.toFixed(1)} km away</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mt-2">
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        getAvailabilityStatus() === 'Available' ? 'bg-green-100 text-green-700' : 
                                        getAvailabilityStatus() === 'Busy' ? 'bg-yellow-100 text-yellow-700' : 
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {getAvailabilityStatus()}
                                    </div>
                                    {therapist.yearsOfExperience && (
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span>{therapist.yearsOfExperience} years exp.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Pricing</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {Object.entries(therapist.pricing || {}).map(([duration, price]) => (
                            <div key={duration} className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-600">{duration} min</div>
                                <div className="text-xl font-bold text-orange-600">
                                    Rp {formatPrice(Number(price))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* About */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">About</h2>
                    <p className="text-gray-700 leading-relaxed">
                        {therapist.description || 'Professional massage therapist providing high-quality therapeutic services.'}
                    </p>
                </div>

                {/* Massage Types */}
                {(() => {
                    try {
                        const massageTypes = typeof therapist.massageTypes === 'string' 
                            ? JSON.parse(therapist.massageTypes) 
                            : therapist.massageTypes;
                        return massageTypes && Array.isArray(massageTypes) && massageTypes.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Specialties</h2>
                                <div className="flex flex-wrap gap-2">
                                    {massageTypes.map((type: string, index: number) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                                        >
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    } catch {
                        return null;
                    }
                })()}

                {/* Languages */}
                {(() => {
                    try {
                        const languages = typeof therapist.languages === 'string' 
                            ? JSON.parse(therapist.languages) 
                            : therapist.languages;
                        return languages && Array.isArray(languages) && languages.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Languages</h2>
                                <div className="flex flex-wrap gap-2">
                                    {languages.map((language: string, index: number) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                                        >
                                            {language}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    } catch {
                        return null;
                    }
                })()}

                {/* Action Buttons */}
                <div className="fixed bottom-4 left-4 right-4 z-10">
                    <div className="bg-white rounded-xl shadow-lg p-4 border">
                        <div className="flex gap-3">
                            <button
                                onClick={handleWhatsAppContact}
                                className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                                WhatsApp
                            </button>
                            
                            {onQuickBookWithChat && (
                                <button
                                    onClick={() => onQuickBookWithChat(therapist)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                                >
                                    <Phone className="w-5 h-5" />
                                    Book Now
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper function to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in kilometers
    return d;
}

export default TherapistProfilePage;