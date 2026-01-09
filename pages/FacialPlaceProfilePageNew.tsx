import React, { useState, useEffect } from 'react';
import { 
    Clock, MapPin, Phone, Mail, Star, ChevronLeft, ChevronRight, 
    Award, Users, Sparkles, CheckCircle, X, Heart, Calendar,
    Image as ImageIcon
} from 'lucide-react';
import { AppDrawer } from '../components/AppDrawerClean';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import HomeIcon from '../components/icons/HomeIcon';
import UniversalHeader from '../components/shared/UniversalHeader';

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
    price60?: string;
    price90?: string;
    price120?: string;
    operatingHours?: string;
    rating?: number;
    reviewCount?: number;
    facialTypes?: any;
    status?: string;
    isVerified?: boolean;
    languages?: string[];
    galleryImages?: Array<{ imageUrl: string; caption: string }>;
    discountPercentage?: number;
    isDiscountActive?: boolean;
    discountEndTime?: string;
    amenities?: string[];
    certifications?: string[];
    teamMembers?: any[];
}

interface FacialPlaceProfilePageNewProps {
    place: Place;
    onBack: () => void;
    onBook?: () => void;
    userLocation?: { lat: number; lng: number } | null;
    loggedInCustomer?: any;
    language?: 'en' | 'id';
    onLanguageChange?: (lang: string) => void;
    onMassageJobsClick?: () => void;
    onTherapistJobsClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onFacialPlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onNavigate?: (page: string) => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    therapists?: any[];
    places?: any[];
}

const FacialPlaceProfilePageNew: React.FC<FacialPlaceProfilePageNewProps> = ({
    place,
    onBack,
    onBook,
    onNavigate,
    onMassageJobsClick,
    onVillaPortalClick,
    onTherapistPortalClick,
    onFacialPlacePortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onTermsClick,
    onPrivacyClick,
    therapists = [],
    places = []
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [selectedDuration, setSelectedDuration] = useState<60 | 90 | 120>(90);

    // Parse pricing
    const pricing = {
        min60: parseInt(place.price60 || '0'),
        min90: parseInt(place.price90 || '0'),
        min120: parseInt(place.price120 || '0')
    };

    // Default treatments based on facial types
    const treatments = [
        {
            id: '1',
            name: 'Facial Treatment',
            description: place.description || 'Professional facial treatment for healthy, glowing skin',
            image: place.mainImage || place.profilePicture || 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800',
            prices: pricing
        }
    ];

    // Gallery images
    const gallery = place.galleryImages || [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Universal Header */}
            <UniversalHeader 
                language={(place as any).language || 'id'}
                onLanguageChange={(lang) => console.log('Language changed:', lang)}
                onMenuClick={() => setIsMenuOpen(true)}
            />

            {/* App Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onMassageJobsClick={onMassageJobsClick}
                onVillaPortalClick={onVillaPortalClick}
                onTherapistPortalClick={onTherapistPortalClick}
                onFacialPortalClick={onFacialPlacePortalClick}
                onAgentPortalClick={onAgentPortalClick}
                onCustomerPortalClick={onCustomerPortalClick}
                onAdminPortalClick={onAdminPortalClick}
                onTermsClick={onTermsClick}
                onPrivacyClick={onPrivacyClick}
                therapists={therapists}
                places={places}
            />

            {/* Compact Hero Image */}
            <div className="relative h-48 overflow-hidden bg-gray-200">
                <img 
                    src={place.mainImage || place.profilePicture || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800'} 
                    alt={place.name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 py-4">
                {/* Clinic Name & Rating */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{place.name}</h2>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                            <span className="font-semibold">{(place.rating || 4.8).toFixed(1)}</span>
                            <span className="text-gray-500">({place.reviewCount || 0})</span>
                        </div>
                        {place.isVerified && (
                            <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="font-medium">Verified</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pricing */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">Pricing</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {pricing.min60 > 0 && (
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-600 mb-1">60 Min</div>
                                <div className="text-lg font-bold text-orange-600">
                                    {(pricing.min60 / 1000).toFixed(0)}K
                                </div>
                            </div>
                        )}
                        {pricing.min90 > 0 && (
                            <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="text-xs text-gray-600 mb-1">90 Min</div>
                                <div className="text-lg font-bold text-orange-600">
                                    {(pricing.min90 / 1000).toFixed(0)}K
                                </div>
                            </div>
                        )}
                        {pricing.min120 > 0 && (
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-600 mb-1">120 Min</div>
                                <div className="text-lg font-bold text-orange-600">
                                    {(pricing.min120 / 1000).toFixed(0)}K
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                {place.description && (
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm">About</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {place.description}
                        </p>
                    </div>
                )}

                {/* Location & Hours */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">Details</h3>
                    <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{place.location}</span>
                        </div>
                        {place.operatingHours && (
                            <div className="flex items-start gap-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600">{place.operatingHours}</span>
                            </div>
                        )}
                        {place.whatsappNumber && (
                            <div className="flex items-start gap-2 text-sm">
                                <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600">{place.whatsappNumber}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Gallery */}
                {gallery.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Gallery</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {gallery.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(image)}
                                    className="relative aspect-square rounded-lg overflow-hidden"
                                >
                                    <img
                                        src={image.imageUrl}
                                        alt={image.caption}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Amenities */}
                {place.amenities && place.amenities.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Amenities</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {place.amenities.map((amenity, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span>{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Certifications */}
                {place.certifications && place.certifications.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Certifications</h3>
                        <div className="flex flex-wrap gap-2">
                            {place.certifications.map((cert, index) => (
                                <span
                                    key={index}
                                    className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-medium"
                                >
                                    {cert}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Fixed Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
                <div className="max-w-5xl mx-auto flex gap-2">
                    <a
                        href={`https://wa.me/${place.whatsappNumber?.replace(/[^0-9]/g, '')}?text=Hi! I'd like to inquire about ${place.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold text-center hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Phone className="w-5 h-5" />
                        WhatsApp
                    </a>
                    <button
                        onClick={onBook}
                        className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-semibold text-center hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Calendar className="w-5 h-5" />
                        Book Now
                    </button>
                </div>
            </div>

            {/* Image Lightbox */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                    <div className="max-w-4xl w-full">
                        <img
                            src={selectedImage.imageUrl}
                            alt={selectedImage.caption}
                            className="w-full h-auto rounded-xl"
                        />
                        <p className="text-white text-center mt-4 text-lg">
                            {selectedImage.caption}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacialPlaceProfilePageNew;
