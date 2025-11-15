import React, { useState } from 'react';
import { Star, Heart, Share2, MapPin, MessageCircle, Phone, Clock } from 'lucide-react';
// Drawer is restricted to HomePage; not used here

interface TherapistProfilePageProps {
    therapist: any;
    onBack: () => void;
    distance?: number;
    onQuickBookWithChat?: (therapist: any) => void;
    userLocation?: { lat: number; lng: number } | null;
    loggedInCustomer?: any;
    onMassageJobsClick?: () => void;
    onTherapistJobsClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onNavigate?: (route: string) => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    therapists: any[];
    places: any[];
}

const TherapistProfilePage: React.FC<TherapistProfilePageProps> = ({
    therapist,
    onBack,
    distance,
    onQuickBookWithChat,
    loggedInCustomer: _loggedInCustomer,
    onMassageJobsClick: _onMassageJobsClick,
    onTherapistJobsClick: _onTherapistJobsClick,
    onVillaPortalClick: _onVillaPortalClick,
    onTherapistPortalClick: _onTherapistPortalClick,
    onMassagePlacePortalClick: _onMassagePlacePortalClick,
    onAgentPortalClick: _onAgentPortalClick,
    onCustomerPortalClick: _onCustomerPortalClick,
    onAdminPortalClick: _onAdminPortalClick,
    onNavigate: _onNavigate,
    onTermsClick: _onTermsClick,
    onPrivacyClick: _onPrivacyClick,
    therapists: _therapists,
    places: _places
}) => {
    const [isFavorited, setIsFavorited] = useState(false);
    // No local drawer state; drawer is home-only
    const [selectedMassageTypes, setSelectedMassageTypes] = useState<Set<string>>(new Set());

    const formatPrice = (price: number) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `${(price / 1000).toFixed(0)}K`;
        }
        return price.toLocaleString('id-ID');
    };

    const formatRating = (rating: number) => {
        if (!rating || rating === 0) return '5.0';
        return Math.max(4.0, Math.min(5.0, rating)).toFixed(1);
    };

    const getDisplayRating = (rating: number, reviewCount: number) => {
        if (!rating || rating === 0) {
            return reviewCount > 0 ? 4.5 + (reviewCount * 0.1) : 5.0;
        }
        return Math.max(4.0, Math.min(5.0, rating));
    };

    const getDisplayReviewCount = (count: number) => {
        if (!count || count === 0) return Math.floor(Math.random() * 50) + 10;
        return count;
    };

    const getAvailabilityStatus = () => {
        const hour = new Date().getHours();
        if (hour >= 8 && hour < 22) {
            return Math.random() > 0.3 ? 'Available' : 'Busy';
        }
        return 'Offline';
    };

    const toggleMassageType = (type: string) => {
        setSelectedMassageTypes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(type)) {
                newSet.delete(type);
            } else {
                newSet.add(type);
            }
            return newSet;
        });
    };

    const handleWhatsAppContact = () => {
        if (therapist.whatsappNumber) {
            const message = encodeURIComponent(`Hi ${therapist.name}, I'm interested in booking a massage session.`);
            window.open(`https://wa.me/${therapist.whatsappNumber}?text=${message}`, '_blank');
        }
    };

    const handleShareProfile = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${therapist.name} - Professional Massage Therapist`,
                    text: `Check out ${therapist.name}'s massage services`,
                    url: window.location.href
                });
            } catch {
                console.log('Share canceled');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Profile link copied to clipboard!');
        }
    };

    if (!therapist) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-medium text-black mb-4">Therapist not found</h2>
                    <button onClick={onBack} className="px-6 py-3 border border-black text-black">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* No AppDrawer here; drawer access is home-only */}

            <div className="w-full max-w-6xl mx-auto px-4 py-6 pb-4">
                {/* Hero Section - Clean Text */}
                <div className="mb-6">
                    <div className="flex items-center justify-between pb-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsFavorited(!isFavorited)}
                                className="p-2 text-black"
                            >
                                <Heart className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} />
                            </button>
                            <button
                                onClick={handleShareProfile}
                                className="p-2 text-black"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="py-4">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16">
                                <img
                                    src={(therapist as any).profilePicture || `https://via.placeholder.com/150/CCCCCC/000000?text=${encodeURIComponent(therapist.name.charAt(0))}`}
                                    alt={`${therapist.name} profile`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-medium text-black mb-1">{therapist.name}</h1>
                                <p className="text-black">Professional Massage Therapist</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Star className="w-4 h-4 text-black" />
                                    <span className="font-normal text-black">{formatRating(getDisplayRating(therapist.rating, therapist.reviewCount))}</span>
                                    <span className="text-black text-sm">({getDisplayReviewCount(therapist.reviewCount)})</span>
                                </div>
                            </div>
                            <div className="px-3 py-1 text-sm font-normal text-black">
                                {getAvailabilityStatus()}
                            </div>
                        </div>
                        
                        {distance && (
                            <div className="flex items-center gap-2 text-black mb-2">
                                <MapPin className="w-4 h-4 text-black" />
                                <span>{distance.toFixed(1)} km away • {therapist.location || 'Bali, Indonesia'}</span>
                            </div>
                        )}
                        
                        {/* Professional Details Container */}
                        <div className="mb-6 space-y-4">
                            <h2 className="text-xl font-medium text-black mb-4">Professional Details</h2>
                            
                            {/* Years of Experience - Read Only */}
                            <div className="flex items-center gap-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
                                <div className="flex items-center gap-2 flex-1">
                                    <Clock className="w-5 h-5 text-gray-600" />
                                    <span className="text-gray-800 font-medium">Years of Experience:</span>
                                </div>
                                <div className="px-3 py-1 bg-blue-100 rounded-full">
                                    <span className="text-blue-800 font-bold">{therapist.yearsOfExperience || 1} years</span>
                                </div>
                            </div>

                            {/* Age Display with Color Shading */}
                            {(() => {
                                // Calculate age based on experience if not provided
                                const displayAge = therapist.age || (therapist.yearsOfExperience ? Math.min(Math.max(23 + (therapist.yearsOfExperience || 1), 23), 55) : null);
                                
                                if (!displayAge) return null;
                                
                                return (
                                    <div className="flex items-center gap-4 p-4 border border-gray-300 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100">
                                        <div className="flex items-center gap-2 flex-1">
                                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span className="text-orange-800 font-medium">Age:</span>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full font-bold shadow-sm ${
                                            displayAge >= 18 && displayAge <= 25 ? 'bg-gradient-to-r from-green-200 to-green-300 text-green-800' :
                                            displayAge >= 26 && displayAge <= 35 ? 'bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800' :
                                            displayAge >= 36 && displayAge <= 45 ? 'bg-gradient-to-r from-purple-200 to-purple-300 text-purple-800' :
                                            displayAge >= 46 ? 'bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800' :
                                            'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800'
                                        }`}>
                                            <span>{displayAge} years old</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        <p className="text-black text-sm leading-relaxed">
                            {therapist.description || 'Certified massage therapist with professional training. Specialized in therapeutic and relaxation techniques. Available for home, hotel, and villa services.'}
                        </p>
                    </div>
                </div>

                {/* Massage Specialties */}
                {(() => {
                    try {
                        const massageTypes = typeof therapist.massageTypes === 'string' 
                            ? JSON.parse(therapist.massageTypes) 
                            : therapist.massageTypes;
                        return massageTypes && Array.isArray(massageTypes) && massageTypes.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-xl font-medium text-black mb-4">Massage Specialties</h2>
                                <div className="flex flex-wrap gap-2">
                                    {massageTypes.map((type: string, index: number) => {
                                        const isSelected = selectedMassageTypes.has(type);
                                        return (
                                            <div key={index} className="px-3 py-2 text-sm">
                                                <label className="flex items-center cursor-pointer gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleMassageType(type)}
                                                        className="w-3 h-3 focus:ring-0"
                                                    />
                                                    <span className="text-black">{type}</span>
                                                </label>
                                            </div>
                                        );
                                    })}
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
                            <div className="mb-6">
                                <h2 className="text-xl font-medium text-black mb-4">Languages Spoken</h2>
                                <div className="flex flex-wrap gap-2">
                                    {languages.map((language: string, index: number) => (
                                        <div key={index} className="flex items-center gap-2 px-3 py-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={true}
                                                readOnly
                                                className="w-3 h-3 focus:ring-0"
                                            />
                                            <span className="text-black">{language}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    } catch {
                        return null;
                    }
                })()}

                {/* Direct Pricing */}
                <div className="mb-6">
                    <h2 className="text-xl font-medium text-black mb-4">Direct Booking Prices (100% to Therapist)</h2>
                    <div className="space-y-2 mb-4">
                        {Object.entries(therapist.pricing || {}).map(([duration, price]) => (
                            <div key={duration} className="p-3 flex justify-between">
                                <span className="text-black">{duration} Minutes</span>
                                <span className="text-black font-medium">Rp {formatPrice(Number(price))}</span>
                            </div>
                        ))}
                    </div>
                    <div className="p-3">
                        <p className="text-sm text-black">
                            <strong>100% Direct Payment:</strong> Full amount goes to {therapist.name} - No platform commission
                        </p>
                    </div>
                </div>

                {/* Hotel & Villa Pricing */}
                <div className="mb-6">
                    <h2 className="text-xl font-medium text-black mb-4">Hotel & Villa Menu Prices</h2>
                    <div className="space-y-2 mb-4">
                        {Object.entries(therapist.pricing || {}).map(([duration, price]) => {
                            const hotelPrice = Math.round(Number(price) / 0.8);
                            return (
                                <div key={duration} className="p-3 flex justify-between">
                                    <span className="text-black">{duration} Minutes</span>
                                    <span className="text-black font-medium">Rp {formatPrice(hotelPrice)}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="p-3">
                        <p className="text-sm text-black">
                            <strong>20% Commission Deducted:</strong> Hotel/Villa takes 20% commission from these menu prices
                        </p>
                    </div>
                </div>

                {/* Professional Services */}
                <div className="mb-6">
                    <h2 className="text-xl font-medium text-black mb-4">Professional Services</h2>
                    <div className="flex flex-wrap gap-2">
                        {[
                            'Home Service - Massage at your location',
                            'Hotel Service - Available for hotel guests', 
                            'Villa Service - Private villa treatments',
                            'Therapeutic - Medical massage therapy',
                            'Relaxation - Stress relief treatments',
                            'Flexible Hours - Available when you need'
                        ].map((service, index) => (
                            <div key={index} className="flex items-center gap-2 px-3 py-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={true}
                                    readOnly
                                    className="w-3 h-3 focus:ring-0"
                                />
                                <span className="text-black">{service}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="mb-6">
                    <h2 className="text-xl font-medium text-black mb-4">Contact & Location</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-black" />
                            <div>
                                <p className="font-medium text-black">Service Area</p>
                                <p className="text-black">{therapist.location || 'Bali, Indonesia'}</p>
                                {distance && (
                                    <p className="text-sm text-black">{distance.toFixed(1)} km from your location</p>
                                )}
                            </div>
                        </div>
                        
                        {therapist.whatsappNumber && (
                            <div className="flex items-center gap-3">
                                <MessageCircle className="w-5 h-5 text-black" />
                                <div>
                                    <p className="font-medium text-black">WhatsApp Contact</p>
                                    <p className="text-black">+{therapist.whatsappNumber}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Booking Actions */}
                <div className="mb-6">
                    <h2 className="text-xl font-medium text-black mb-4">Book Your Session</h2>
                    <p className="text-black mb-4 text-center">Contact {therapist.name} directly for your massage session</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleWhatsAppContact}
                            className="flex-1 flex items-center justify-center gap-3 text-black py-3 px-4 font-medium"
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span>WhatsApp Now</span>
                        </button>
                        
                        {onQuickBookWithChat && (
                            <button
                                onClick={() => onQuickBookWithChat(therapist)}
                                className="flex-1 flex items-center justify-center gap-3 text-black py-3 px-4 font-medium"
                            >
                                <Phone className="w-5 h-5" />
                                <span>Quick Book</span>
                            </button>
                        )}
                    </div>
                    
                    <div className="mt-4 p-3">
                        <p className="text-sm text-black text-center">
                            ⚡ <strong>Fast Response</strong> • Professional service • Certified therapist
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TherapistProfilePage;