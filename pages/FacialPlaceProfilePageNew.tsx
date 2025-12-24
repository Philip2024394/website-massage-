import React, { useState, useEffect } from 'react';
import { 
    Clock, MapPin, Phone, Mail, Star, ChevronLeft, ChevronRight, 
    Award, Users, Sparkles, CheckCircle, X, Heart, Calendar,
    Image as ImageIcon
} from 'lucide-react';
import { AppDrawer } from '../components/AppDrawerClean';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import HomeIcon from '../components/icons/HomeIcon';

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

            {/* Fixed Header */}
            <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white sticky top-0 z-40 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold truncate max-w-[200px]">{place.name}</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onNavigate?.('home')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <HomeIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <BurgerMenuIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative h-[400px] overflow-hidden">
                <img 
                    src={place.mainImage || place.profilePicture || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200'} 
                    alt={place.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="max-w-7xl mx-auto">
                        {place.isDiscountActive && place.discountPercentage && (
                            <div className="inline-flex items-center gap-2 bg-orange-500 px-4 py-2 rounded-full text-sm font-semibold mb-3 animate-pulse">
                                <Sparkles className="w-4 h-4" />
                                <span>{place.discountPercentage}% OFF - Limited Time!</span>
                            </div>
                        )}
                        
                        <h2 className="text-4xl font-bold mb-2">{place.name}</h2>
                        <p className="text-xl mb-4 text-orange-100">Professional Facial & Beauty Services</p>
                        
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <span className="font-bold">{(place.rating || 4.8).toFixed(1)}</span>
                                <span className="text-sm">({place.reviewCount || 0} reviews)</span>
                            </div>
                            
                            {place.isVerified && (
                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                    <Award className="w-5 h-5" />
                                    <span className="font-semibold">Verified</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <a
                        href={`tel:${place.whatsappNumber}`}
                        className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <Phone className="w-6 h-6 text-orange-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Call</span>
                    </a>
                    
                    <a
                        href={`https://wa.me/${place.whatsappNumber?.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Phone className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">WhatsApp</span>
                    </a>
                    
                    <button
                        onClick={() => window.location.href = `https://maps.google.com/?q=${place.location}`}
                        className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Directions</span>
                    </button>
                </div>

                {/* Treatment Pricing Section */}
                <section className="mb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Treatments</h3>
                    
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="relative h-80">
                            <img
                                src={treatments[0].image}
                                alt={treatments[0].name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                <h4 className="text-2xl font-bold mb-2">{treatments[0].name}</h4>
                                <p className="text-sm text-gray-200 mb-4">
                                    {treatments[0].description}
                                </p>
                            </div>
                        </div>

                        {/* Pricing Grid */}
                        <div className="p-6 bg-gradient-to-br from-orange-50 to-white">
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {pricing.min60 > 0 && (
                                    <div className="text-center p-4 bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-orange-500 transition-all cursor-pointer">
                                        <div className="text-sm text-gray-600 mb-1">60 Min</div>
                                        <div className="text-xl font-bold text-orange-600">
                                            Rp {pricing.min60.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Basic</div>
                                    </div>
                                )}
                                
                                {pricing.min90 > 0 && (
                                    <div className="text-center p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md text-white transform scale-105">
                                        <div className="text-sm mb-1 opacity-90">90 Min</div>
                                        <div className="text-2xl font-bold">
                                            Rp {pricing.min90.toLocaleString()}
                                        </div>
                                        <div className="text-xs mt-1 bg-white/20 px-2 py-0.5 rounded-full inline-block">
                                            Most Popular
                                        </div>
                                    </div>
                                )}
                                
                                {pricing.min120 > 0 && (
                                    <div className="text-center p-4 bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-orange-500 transition-all cursor-pointer">
                                        <div className="text-sm text-gray-600 mb-1">120 Min</div>
                                        <div className="text-xl font-bold text-orange-600">
                                            Rp {pricing.min120.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Luxury</div>
                                    </div>
                                )}
                            </div>

                            {/* Book Now Button */}
                            <button
                                onClick={onBook}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Book This Treatment
                            </button>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="mb-12 bg-white rounded-2xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-orange-500" />
                        About {place.name}
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        {place.description || 'Professional facial and beauty services with experienced aestheticians.'}
                    </p>
                    
                    {/* Certifications */}
                    {place.certifications && place.certifications.length > 0 && (
                        <div className="mb-6">
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Award className="w-5 h-5 text-orange-500" />
                                Certifications & Awards
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {place.certifications.map((cert, index) => (
                                    <span
                                        key={index}
                                        className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        {cert}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Amenities */}
                    {place.amenities && place.amenities.length > 0 && (
                        <div>
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-orange-500" />
                                Amenities & Facilities
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {place.amenities.map((amenity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 text-gray-700"
                                    >
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        <span className="text-sm">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* Image Gallery */}
                {gallery.length > 0 && (
                    <section className="mb-12">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <ImageIcon className="w-6 h-6 text-orange-500" />
                            Gallery
                        </h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {gallery.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(image)}
                                    className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                                >
                                    <img
                                        src={image.imageUrl}
                                        alt={image.caption}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Heart className="w-12 h-12 text-white" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                        <span className="text-white text-sm font-semibold">
                                            {image.caption}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Contact & Hours */}
                <section className="grid md:grid-cols-2 gap-6 mb-12">
                    {/* Operating Hours */}
                    {place.operatingHours && (
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="w-6 h-6 text-orange-500" />
                                Operating Hours
                            </h3>
                            <div className="p-3 bg-orange-50 rounded-lg">
                                <span className="text-orange-600 font-bold">{place.operatingHours}</span>
                            </div>
                        </div>
                    )}

                    {/* Contact Info */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Mail className="w-6 h-6 text-orange-500" />
                            Contact Us
                        </h3>
                        <div className="space-y-3">
                            {place.whatsappNumber && (
                                <a
                                    href={`tel:${place.whatsappNumber}`}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors"
                                >
                                    <Phone className="w-5 h-5 text-orange-500" />
                                    <span className="text-gray-700">{place.whatsappNumber}</span>
                                </a>
                            )}
                            {place.email && (
                                <a
                                    href={`mailto:${place.email}`}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors"
                                >
                                    <Mail className="w-5 h-5 text-orange-500" />
                                    <span className="text-gray-700">{place.email}</span>
                                </a>
                            )}
                            <a
                                href={`https://maps.google.com/?q=${place.location}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors"
                            >
                                <MapPin className="w-5 h-5 text-orange-500" />
                                <span className="text-gray-700">{place.location}</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-lg p-12">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        Ready to Transform Your Skin?
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        Book your appointment today and experience professional facial treatments!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={onBook}
                            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <Calendar className="w-5 h-5 inline mr-2" />
                            Book Now
                        </button>
                        <a
                            href={`https://wa.me/${place.whatsappNumber?.replace(/[^0-9]/g, '')}?text=Hi! I'd like to inquire about your facial treatments.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <Phone className="w-5 h-5 inline mr-2" />
                            WhatsApp Us
                        </a>
                    </div>
                </section>
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
