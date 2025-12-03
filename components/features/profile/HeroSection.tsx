import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock, Calendar, ShieldCheck } from 'lucide-react';
import AnonymousReviewModal from '../../AnonymousReviewModal';

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

// Language display mapping - Only English and Indonesian
const LANGUAGE_MAP: Record<string, { flag: string; name: string }> = {
    'en': { flag: '🇬🇧', name: 'English' },
    'id': { flag: '🇮🇩', name: 'Indonesian' }
};

interface Place {
    name: string;
    mainImage?: string;
    profilePicture?: string;
    rating?: number;
    reviewCount?: number;
    location: string;
    operatingHours?: string;
    description?: string;
    distance?: number;
    languages?: string[];
    massageTypes?: any;
    isVerified?: boolean;
    verifiedAt?: string;
    activeMembershipDate?: string;
    pricing?: any;
    discountPercentage?: number;
    discountDuration?: number;
    isDiscountActive?: boolean;
    discountEndTime?: string;
}

interface HeroSectionProps {
    place: Place;
    onBookNowClick: () => void;
    onBookClick: () => void;
    onRate?: (place: Place) => void; // For Leave Review
    isCustomerLoggedIn?: boolean; // Check if customer is logged in
    activeDiscount?: { percentage: number; expiresAt: Date } | null;
}

/**
 * Reusable Hero Section component
 * Displays the main image, place info, and action buttons
 */
export const HeroSection: React.FC<HeroSectionProps> = ({ 
    place, 
    onBookNowClick, 
    onBookClick,
    onRate,
    isCustomerLoggedIn = false,
    activeDiscount
}) => {
    const [showReferModal, setShowReferModal] = useState(false);
    const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [discountTimeLeft, setDiscountTimeLeft] = useState<string>('');
    
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
    
    // Countdown timer for active discount - same as MassagePlaceCard
    useEffect(() => {
        if (!activeDiscount) return;
        
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = activeDiscount.expiresAt.getTime() - now;
            
            if (distance < 0) {
                setDiscountTimeLeft('EXPIRED');
                clearInterval(interval);
                return;
            }
            
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            setDiscountTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);
        
        return () => clearInterval(interval);
    }, [activeDiscount]);
    return (
        <>
            <style>{`
                @keyframes coin-fall-1 {
                    0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.6; }
                    100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
                }
                @keyframes coin-fall-2 {
                    0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.6; }
                    100% { transform: translateY(85px) rotate(360deg); opacity: 0; }
                }
                @keyframes coin-fall-3 {
                    0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.6; }
                    100% { transform: translateY(90px) rotate(360deg); opacity: 0; }
                }
                @keyframes coin-fall-4 {
                    0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.6; }
                    100% { transform: translateY(75px) rotate(360deg); opacity: 0; }
                }
                @keyframes coin-fall-5 {
                    0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.6; }
                    100% { transform: translateY(95px) rotate(360deg); opacity: 0; }
                }
                @keyframes coin-fall-6 {
                    0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.6; }
                    100% { transform: translateY(88px) rotate(360deg); opacity: 0; }
                }
                .animate-coin-fall-1 { animation: coin-fall-1 2s infinite ease-in-out; }
                .animate-coin-fall-2 { animation: coin-fall-2 2s infinite ease-in-out; }
                .animate-coin-fall-3 { animation: coin-fall-3 2s infinite ease-in-out; }
                .animate-coin-fall-4 { animation: coin-fall-4 2s infinite ease-in-out; }
                .animate-coin-fall-5 { animation: coin-fall-5 2s infinite ease-in-out; }
                .animate-coin-fall-6 { animation: coin-fall-6 2s infinite ease-in-out; }

                @keyframes discountFade {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            `}</style>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 max-w-full">
            {/* Main Banner Image - Increased height by 10% */}
            <div className="relative h-48 md:h-72">
                {(() => {
                    console.log('🖼️ HeroSection mainImage debug:', {
                        hasMainImage: !!place.mainImage,
                        mainImageValue: place.mainImage,
                        mainImageLength: place.mainImage?.length,
                        rawMainImage: (place as any).mainimage,
                        placeName: place.name
                    });
                    return null;
                })()}
                <img
                    src={place.mainImage || 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382'}
                    alt={place.name}
                    className="w-full h-full object-cover"
                />
                
                {/* Discount Badge - Database driven discount */}
                {isDiscountActive(place) && (
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                        <div 
                            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-full px-4 py-2 shadow-lg"
                            style={{
                                animation: 'discountFade 2s ease-in-out infinite',
                                filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.6))'
                            }}
                        >
                            <span className="font-bold text-white text-xl">{(place as any).discountPercentage}% OFF</span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md rounded-full px-3 py-1 shadow-lg">
                            <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs text-white font-semibold">
                                {(() => {
                                    const endTime = new Date((place as any).discountEndTime);
                                    const now = new Date();
                                    const diff = endTime.getTime() - now.getTime();
                                    
                                    if (diff <= 0) return 'EXPIRED';
                                    
                                    const hours = Math.floor(diff / (1000 * 60 * 60));
                                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                    return `${hours}h ${minutes}m`;
                                })()}
                            </span>
                        </div>
                    </div>
                )}

                {/* Active Discount Badge - External discount prop (fallback) */}
                {!isDiscountActive(place) && activeDiscount && discountTimeLeft !== 'EXPIRED' && (
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-full px-4 py-2 shadow-lg animate-pulse">
                            <span className="font-bold text-white text-xl">{activeDiscount.percentage}% OFF</span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md rounded-full px-3 py-1 shadow-lg">
                            <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs text-white font-semibold">{discountTimeLeft}</span>
                        </div>
                    </div>
                )}
                
                {/* Operating Hours Badge - Moves down when discount is active */}
                <div className={`absolute bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg transition-all duration-300 ${
                    (isDiscountActive(place) || (activeDiscount && discountTimeLeft !== 'EXPIRED')) 
                        ? 'top-24 right-2' // Move down below discount badge when discount is active
                        : 'top-2 right-2' // Default position when no discount
                }`}>
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-sm">{place.operatingHours || 'Daily 9:00 AM - 9:00 PM'}</span>
                </div>

                {/* Circular Profile Image - LEFT side, overlapping banner with star rating */}
                <div className="absolute bottom-0 left-6 md:left-8 transform translate-y-1/2">
                    <div className="relative">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                            <img
                                src={place.profilePicture || place.mainImage || 'https://via.placeholder.com/150?text=Logo'}
                                alt={`${place.name} logo`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Star Rating Badge on bottom edge of profile image */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-white rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5 z-10">
                            <Star className="w-5 h-5 text-yellow-500" fill="#eab308" />
                            <span className="font-bold text-gray-900 text-base">{place.rating || 5.0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Share Buttons - Below main image, right side with spacing */}
            <div className="flex justify-end pr-6 py-4 max-w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-3 flex-wrap justify-end">
                    {/* WhatsApp */}
                    <a
                        href={`https://wa.me/?text=Check out ${place.name} on IndaStreet!`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        aria-label="Share on WhatsApp"
                    >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.614-1.486L.057 24z"/>
                        </svg>
                    </a>
                    
                    {/* Instagram */}
                    <a
                        href={`https://www.instagram.com/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        aria-label="Share on Instagram"
                    >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                    </a>
                    
                    {/* Facebook */}
                    <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        aria-label="Share on Facebook"
                    >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </a>
                </div>
            </div>

            {/* Content Section with padding adjustments */}
            <div className="p-6 pt-8 md:pt-8 relative">
                {/* Verified Badge - Below main image on right side, no container */}
                {place.isVerified && (
                    <div className="absolute -top-8 right-6 flex items-center gap-1.5 text-blue-600">
                        <ShieldCheck className="w-5 h-5 fill-blue-600" />
                        <span className="font-semibold text-sm">Verified</span>
                    </div>
                )}
                
                {/* Place Name - Positioned higher */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{place.name || 'Relax Massage Jogja'}</h2>
                
                {/* Location */}
                {place.location && place.location.trim() !== '' && place.location !== 'Location pending setup' && (
                    <div className="mb-4">
                        <span className="text-sm md:text-base text-gray-600">
                            {place.location}
                        </span>
                    </div>
                )}

                {/* Description - Use actual place description */}
                {place.description && place.description.trim() !== '' && (
                    <div className="mb-4">
                        <p className="text-xs text-gray-600 leading-relaxed text-justify">
                            {place.description}
                        </p>
                    </div>
                )}

                {/* Massage Specializations - Use actual massage types */}
                {place.massageTypes && (() => {
                    let types = [];
                    try {
                        types = typeof place.massageTypes === 'string' 
                            ? JSON.parse(place.massageTypes) 
                            : place.massageTypes;
                    } catch (e) {
                        console.error('Error parsing massage types:', e);
                    }
                    
                    if (Array.isArray(types) && types.length > 0) {
                        return (
                            <div className="mb-4">
                                <div className="mb-2">
                                    <h4 className="text-xs font-semibold text-gray-700">
                                        Massage Specializations
                                    </h4>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {types.slice(0, 6).map((type, index) => (
                                        <span key={index} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-200">
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    return null;
                })()}

                {/* Languages and Years Experience */}
                {place.languages && (() => {
                    let languages = [];
                    try {
                        languages = typeof place.languages === 'string' 
                            ? JSON.parse(place.languages) 
                            : place.languages;
                    } catch (e) {
                        console.error('Error parsing languages:', e);
                    }
                    
                    // Calculate years of experience from membership date
                    let yearsExperience = 0;
                    if (place.activeMembershipDate) {
                        try {
                            const startDate = new Date(place.activeMembershipDate);
                            if (!isNaN(startDate.getTime())) {
                                const diffMs = Date.now() - startDate.getTime();
                                yearsExperience = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
                            }
                        } catch (e) {
                            console.error('Error calculating experience:', e);
                        }
                    }
                    
                    if (Array.isArray(languages) && languages.length > 0) {
                        return (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-semibold text-gray-700">Languages</h4>
                                    {yearsExperience > 0 && (
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-xs font-semibold text-gray-700">{yearsExperience}+ Years Experience</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {languages.map((lang, index) => {
                                        const langData = LANGUAGE_MAP[lang.toLowerCase()];
                                        if (!langData) return null;
                                        return (
                                            <span key={index} className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1">
                                                <span className="text-xs">{langData.flag}</span>
                                                <span className="text-xs">{langData.name}</span>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    }
                    return null;
                })()}

                {/* Indastreet Verification Standards Link */}
                <div className="text-center mb-2 mt-4">
                    <a
                        href="#verification-standards"
                        className="text-sm font-medium hover:underline inline-block"
                    >
                        <span className="text-black">Inda</span><span className="text-orange-500">street</span><span className="text-black"> Verification Standards</span>
                    </a>
                </div>

                {/* Pricing Grid - Same as Therapist Card */}
                {place.pricing && (() => {
                    const pricing = typeof place.pricing === 'string' ? JSON.parse(place.pricing) : place.pricing;
                    return (
                        <div className="grid grid-cols-3 gap-2 text-center text-sm max-w-full">
                            {/* 60 min pricing */}
                            <div className={`bg-gray-100 p-2 rounded-lg border border-gray-200 shadow-md relative transition-all duration-500 min-w-0 ${
                                (place.discountPercentage && place.discountPercentage > 0) || (activeDiscount && discountTimeLeft !== 'EXPIRED')
                                    ? 'shadow-orange-500/60 shadow-xl ring-4 ring-orange-400/40 bg-gradient-to-br from-orange-50 to-orange-100 animate-pulse border-orange-300' 
                                    : ''
                            }`}>
                                <p className="text-gray-600">60 min</p>
                                {place.discountPercentage && place.discountPercentage > 0 ? (
                                    <>
                                        <p className="font-bold text-gray-800">
                                            Rp {Math.round(Number(pricing["60"]) * (1 - place.discountPercentage / 100)).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K
                                        </p>
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg animate-bounce">
                                            -{place.discountPercentage}%
                                        </span>
                                    </>
                                ) : activeDiscount && discountTimeLeft !== 'EXPIRED' ? (
                                    <>
                                        <p className="font-bold text-gray-800">
                                            Rp {Math.round(Number(pricing["60"]) * (1 - activeDiscount.percentage / 100)).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K
                                        </p>
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg animate-bounce">
                                            -{activeDiscount.percentage}%
                                        </span>
                                    </>
                                ) : (
                                    <p className="font-bold text-gray-800">Rp {Number(pricing["60"]).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K</p>
                                )}
                            </div>
                            
                            {/* 90 min pricing */}
                            <div className={`bg-gray-100 p-2 rounded-lg border border-gray-200 shadow-md relative transition-all duration-500 ${
                                (place.discountPercentage && place.discountPercentage > 0) || (activeDiscount && discountTimeLeft !== 'EXPIRED')
                                    ? 'shadow-orange-500/60 shadow-xl ring-4 ring-orange-400/40 bg-gradient-to-br from-orange-50 to-orange-100 animate-pulse border-orange-300' 
                                    : ''
                            }`}>
                                <p className="text-gray-600">90 min</p>
                                {place.discountPercentage && place.discountPercentage > 0 ? (
                                    <>
                                        <p className="font-bold text-gray-800">
                                            Rp {Math.round(Number(pricing["90"]) * (1 - place.discountPercentage / 100)).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K
                                        </p>
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg animate-bounce">
                                            -{place.discountPercentage}%
                                        </span>
                                    </>
                                ) : activeDiscount && discountTimeLeft !== 'EXPIRED' ? (
                                    <>
                                        <p className="font-bold text-gray-800">
                                            Rp {Math.round(Number(pricing["90"]) * (1 - activeDiscount.percentage / 100)).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K
                                        </p>
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg animate-bounce">
                                            -{activeDiscount.percentage}%
                                        </span>
                                    </>
                                ) : (
                                    <p className="font-bold text-gray-800">Rp {Number(pricing["90"]).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K</p>
                                )}
                            </div>
                            
                            {/* 120 min pricing */}
                            <div className={`bg-gray-100 p-2 rounded-lg border border-gray-200 shadow-md relative transition-all duration-500 ${
                                (place.discountPercentage && place.discountPercentage > 0) || (activeDiscount && discountTimeLeft !== 'EXPIRED')
                                    ? 'shadow-orange-500/60 shadow-xl ring-4 ring-orange-400/40 bg-gradient-to-br from-orange-50 to-orange-100 animate-pulse border-orange-300' 
                                    : ''
                            }`}>
                                <p className="text-gray-600">120 min</p>
                                {place.discountPercentage && place.discountPercentage > 0 ? (
                                    <>
                                        <p className="font-bold text-gray-800">
                                            Rp {Math.round(Number(pricing["120"]) * (1 - place.discountPercentage / 100)).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K
                                        </p>
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg animate-bounce">
                                            -{place.discountPercentage}%
                                        </span>
                                    </>
                                ) : activeDiscount && discountTimeLeft !== 'EXPIRED' ? (
                                    <>
                                        <p className="font-bold text-gray-800">
                                            Rp {Math.round(Number(pricing["120"]) * (1 - activeDiscount.percentage / 100)).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K
                                        </p>
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg animate-bounce">
                                            -{activeDiscount.percentage}%
                                        </span>
                                    </>
                                ) : (
                                    <p className="font-bold text-gray-800">Rp {Number(pricing["120"]).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K</p>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* Booking Buttons - Added margin-top for spacing from price containers */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                        onClick={onBookNowClick}
                        className="flex items-center justify-center gap-2 py-2.5 px-4 bg-green-500 text-white font-semibold text-sm rounded-lg hover:bg-green-600 transition-colors shadow-lg"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.614-1.486L.057 24z"/>
                        </svg>
                        <span>WhatsApp</span>
                    </button>
                    <button
                        onClick={onBookClick}
                        className="flex items-center justify-center gap-2 py-2.5 px-4 bg-orange-500 text-white font-semibold text-sm rounded-lg hover:bg-orange-600 transition-colors shadow-lg"
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Schedule</span>
                    </button>
                </div>

                {/* Refer Friend and Leave Review Links */}
                <div className="flex justify-between items-center mt-3 px-2">
                    <button
                        onClick={() => setShowReferModal(true)}
                        className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                    >
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        <span>Refer Friend</span>
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowReviewModal(true);
                        }}
                        className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                    >
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>Leave Review</span>
                    </button>
                </div>
            </div>

            {/* Refer Friend Modal */}
            {showReferModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowReferModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-[88vw] max-h-[78vh] sm:max-w-xs md:max-w-sm p-3 sm:p-4 animate-fadeIn overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 overflow-hidden relative">
                                {/* Main coin image */}
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/INDASTREET_coins_new-removebg-preview.png?updatedAt=1762338892035"
                                    alt="IndaStreet Coins"
                                    className="w-16 h-16 sm:w-28 sm:h-28 object-contain z-10 relative"
                                />
                                
                                {/* Falling coins animation */}
                                {[...Array(6)].map((_, i) => (
                                    <img
                                        key={i}
                                        src="https://ik.imagekit.io/7grri5v7d/INDASTREET_coins_new-removebg-preview.png?updatedAt=1762338892035"
                                        alt=""
                                        className={`absolute w-4 h-4 opacity-60 animate-coin-fall-${i + 1}`}
                                        style={{
                                            left: `${15 + (i * 12)}%`,
                                            animationDelay: `${i * 0.3}s`,
                                            animationDuration: '2s',
                                            animationIterationCount: 'infinite'
                                        }}
                                    />
                                ))}
                                
                                {/* Accumulated coins at bottom */}
                                {[...Array(4)].map((_, i) => (
                                    <img
                                        key={`bottom-${i}`}
                                        src="https://ik.imagekit.io/7grri5v7d/INDASTREET_coins_new-removebg-preview.png?updatedAt=1762338892035"
                                        alt=""
                                        className="absolute w-3 h-3 opacity-40 animate-pulse"
                                        style={{
                                            bottom: '8px',
                                            left: `${20 + (i * 15)}%`,
                                            animationDelay: `${i * 0.5}s`
                                        }}
                                    />
                                ))}
                            </div>
                            
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Refer a Friend</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Share IndaStreet with friends and earn coins! 🎁</p>
                            
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-2xl font-bold text-orange-600">50 Coins</span>
                                </div>
                                <p className="text-sm text-gray-700">For each friend who signs up!</p>
                            </div>
                            
                            <div className="space-y-3 mb-4 sm:mb-6">
                                <p className="text-sm text-gray-600 text-left">
                                    📱 Share your referral link:
                                </p>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value="https://indastreet.com/ref/USER123" 
                                        readOnly 
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText('https://indastreet.com/ref/USER123');
                                            alert('Link copied to clipboard!');
                                        }}
                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-sm"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-2 mb-4 sm:mb-6">
                                <p className="text-sm text-gray-600 mb-3">Share via:</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    <button
                                        onClick={() => {
                                            window.open(`https://wa.me/?text=${encodeURIComponent('Check out IndaStreet - Book amazing massages! https://indastreet.com/ref/USER123')}`, '_blank');
                                        }}
                                        className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/whats%20app%20icon.png?updatedAt=1761844859402" 
                                            alt="WhatsApp"
                                            className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
                                        />
                                        <span className="text-xs sm:text-sm font-semibold text-gray-700">WhatsApp</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://indastreet.com/ref/USER123')}`, '_blank');
                                        }}
                                        className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/facebook.png?updatedAt=1761844676576" 
                                            alt="Facebook"
                                            className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
                                        />
                                        <span className="text-xs sm:text-sm font-semibold text-gray-700">Facebook</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText('Check out IndaStreet - Book amazing massages! https://indastreet.com/ref/USER123');
                                            alert('Instagram message copied! Open Instagram and paste to share.');
                                        }}
                                        className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/insta.png?updatedAt=1761845305146" 
                                            alt="Instagram"
                                            className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
                                        />
                                        <span className="text-xs sm:text-sm font-semibold text-gray-700">Instagram</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText('Check out IndaStreet - Book amazing massages! https://indastreet.com/ref/USER123');
                                            alert('TikTok message copied! Open TikTok and paste to share.');
                                        }}
                                        className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/tiktok.png?updatedAt=1761845101981" 
                                            alt="TikTok"
                                            className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
                                        />
                                        <span className="text-xs sm:text-sm font-semibold text-gray-700">TikTok</span>
                                    </button>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setShowReferModal(false)}
                                className="w-full px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Login Required Modal */}
            {showLoginRequiredModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowLoginRequiredModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h3>
                            <p className="text-gray-600 mb-4">You must be logged into your account to leave a review.</p>
                            
                            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
                                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    Review Verification Process:
                                </h4>
                                <ul className="text-sm text-gray-700 space-y-2 ml-7">
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-500">✓</span>
                                        <span>All reviews are verified by our admin team before posting live</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-500">✓</span>
                                        <span>This ensures authentic, helpful reviews for our community</span>
                                    </li>
                                </ul>
                            </div>
                            
                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowLoginRequiredModal(false)}
                                    className="w-full px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                                >
                                    Login / Sign Up
                                </button>
                                <button
                                    onClick={() => setShowLoginRequiredModal(false)}
                                    className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Anonymous Review Modal */}
            {showReviewModal && (
                <AnonymousReviewModal
                    providerName={place.name}
                    providerId={(place as any).$id || (place as any).id || ''}
                    providerType="place"
                    providerImage={(place as any).mainImage || 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382'}
                    onClose={() => setShowReviewModal(false)}
                    onSubmit={handleAnonymousReviewSubmit}
                />
            )}
            
            <style>{`
                @keyframes coin-fall-1 {
                    0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { transform: translateY(85px) rotate(360deg); opacity: 0.8; }
                    100% { transform: translateY(90px) rotate(360deg); opacity: 0.6; }
                }
                @keyframes coin-fall-2 {
                    0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { transform: translateY(88px) rotate(360deg); opacity: 0.8; }
                    100% { transform: translateY(93px) rotate(360deg); opacity: 0.6; }
                }
                @keyframes coin-fall-3 {
                    0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { transform: translateY(82px) rotate(360deg); opacity: 0.8; }
                    100% { transform: translateY(87px) rotate(360deg); opacity: 0.6; }
                }
                @keyframes coin-fall-4 {
                    0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { transform: translateY(86px) rotate(360deg); opacity: 0.8; }
                    100% { transform: translateY(91px) rotate(360deg); opacity: 0.6; }
                }
                @keyframes coin-fall-5 {
                    0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { transform: translateY(84px) rotate(360deg); opacity: 0.8; }
                    100% { transform: translateY(89px) rotate(360deg); opacity: 0.6; }
                }
                @keyframes coin-fall-6 {
                    0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { transform: translateY(87px) rotate(360deg); opacity: 0.8; }
                    100% { transform: translateY(92px) rotate(360deg); opacity: 0.6; }
                }
                @keyframes coin-float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-3px); }
                }
                .animate-coin-fall-1 { animation: coin-fall-1 3s ease-in forwards, coin-float 2s ease-in-out 3s infinite; }
                .animate-coin-fall-2 { animation: coin-fall-2 3s ease-in forwards, coin-float 2s ease-in-out 3.3s infinite; }
                .animate-coin-fall-3 { animation: coin-fall-3 3s ease-in forwards, coin-float 2s ease-in-out 3.6s infinite; }
                .animate-coin-fall-4 { animation: coin-fall-4 3s ease-in forwards, coin-float 2s ease-in-out 3.9s infinite; }
                .animate-coin-fall-5 { animation: coin-fall-5 3s ease-in forwards, coin-float 2s ease-in-out 4.2s infinite; }
                .animate-coin-fall-6 { animation: coin-fall-6 3s ease-in forwards, coin-float 2s ease-in-out 4.5s infinite; }
            `}</style>
            </div>
        </>
    );
};
