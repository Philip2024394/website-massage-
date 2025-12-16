import React, { useState, useEffect } from 'react';
import type { Place, Analytics } from '../types';
import { parsePricing, parseCoordinates, parseMassageTypes, parseLanguages } from '../utils/appwriteHelpers';
import { getDisplayRating, getDisplayReviewCount, formatRating } from '../utils/ratingUtils';
import { bookingService, reviewService } from '../lib/appwriteService';
import DistanceDisplay from './DistanceDisplay';
import AnonymousReviewModal from './AnonymousReviewModal';
import SocialSharePopup from './SocialSharePopup';

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

// Helper function for dynamic spacing based on description length
const getDynamicSpacing = (longDesc: string, mediumDesc: string, shortDesc: string) => {
    // This is a simple implementation - you can customize based on actual description length
    return shortDesc; // Default to short spacing for Facial Places
};

interface FacialPlaceCardProps {
    place: Place;
    onRate: (place: Place) => void;
    onSelectPlace: (place: Place) => void;
    onNavigate?: (page: string) => void;
    onIncrementAnalytics: (metric: keyof Analytics) => void;
    onShowRegisterPrompt?: () => void;
    isCustomerLoggedIn?: boolean;
    activeDiscount?: { percentage: number; expiresAt: Date } | null;
    t: any;
    userLocation?: { lat: number; lng: number } | null;
}


const StarIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20">
        <path fill="currentColor" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

// Add CSS animations for discount effects
const discountStyles = `
@keyframes discountFade {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

@keyframes priceRimFade {
    0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.6); }
    50% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3); }
}
`;

// Inject styles if they don't exist
if (typeof document !== 'undefined' && !document.getElementById('facial-place-discount-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'facial-place-discount-styles';
    styleSheet.textContent = discountStyles;
    document.head.appendChild(styleSheet);
}

const FacialPlaceCard: React.FC<FacialPlaceCardProps> = ({ 
    place, 
    onRate, 
    onSelectPlace,
    onNavigate,
    onIncrementAnalytics,
    onShowRegisterPrompt,
    isCustomerLoggedIn = false,
    activeDiscount,
    t: _t,
    userLocation
}) => {
    const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [discountTimeLeft, setDiscountTimeLeft] = useState<string>('');
    // Orders count derived from persisted analytics JSON or actual bookings
    const [bookingsCount, setBookingsCount] = useState<number>(() => {
        try {
            if ((place as any).analytics) {
                const parsed = JSON.parse((place as any).analytics);
                if (parsed && typeof parsed.bookings === 'number') return parsed.bookings;
            }
        } catch {}
        return 0;
    });

    useEffect(() => {
        const loadBookingsCount = async () => {
            try {
                const providerId = String((place as any).id || (place as any).$id || '');
                if (!providerId) return;
                const docs = await bookingService.getByProvider(providerId, 'place');
                if (Array.isArray(docs)) {
                    setBookingsCount(docs.length);
                }
            } catch (e) {
                // silent
            }
        };
        loadBookingsCount();
    }, [place]);
    const joinedDateRaw = (place as any).activeMembershipDate || (place as any).membershipStartDate || (place as any).$createdAt;
    const joinedDisplay = (() => {
        if (!joinedDateRaw) return '—';
        try {
            const d = new Date(joinedDateRaw);
            if (isNaN(d.getTime())) return '—';
            return d.toLocaleDateString('en-GB');
        } catch {
            return '—';
        }
    })();
    
    // Countdown timer for active discount
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
    


    // Handle anonymous review submission
    const handleAnonymousReviewSubmit = async (reviewData: {
        name: string;
        whatsappNumber: string;
        rating: number;
        providerId: string | number;
        providerType: 'therapist' | 'place';
    }) => {
        try {
            await reviewService.createAnonymous({
                providerType: reviewData.providerType,
                providerId: String(reviewData.providerId),
                providerName: place.name,
                rating: reviewData.rating,
                reviewerName: reviewData.name,
                whatsappNumber: reviewData.whatsappNumber
            });
            
            setShowReviewModal(false);
            alert('Thank you for your review! 🌟');
            
            // Refresh page to show updated rating
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error('Error submitting review:', error);
            throw error;
        }
    };
    
    // Parse pricing - multiply by 1000 to get full IDR amounts for consistent display
    const parsedPricing = parsePricing(place.pricing) || { "60": 0, "90": 0, "120": 0 };
    const pricing = {
        "60": parsedPricing["60"] * 1000,
        "90": parsedPricing["90"] * 1000,
        "120": parsedPricing["120"] * 1000
    };
    
    // Price formatting function matching TherapistCard format (XXXk)
    const formatPrice = (price: number | string): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        
        if (!numPrice || numPrice === 0 || isNaN(numPrice)) {
            return "Contact"; // Show "Contact" instead of "0k" when no price is set
        }
        
        // Convert to thousands and ensure 3-digit format (100-999)
        let priceInThousands = Math.round(numPrice / 1000);
        
        // Ensure 3-digit display (100k-999k range)
        if (priceInThousands < 100) {
            priceInThousands = 100; // Minimum 100k
        } else if (priceInThousands > 999) {
            priceInThousands = 999; // Maximum 999k for 4-char display
        }
        
        // Always return exactly 4 characters: 3 digits + "k"
        return `${priceInThousands}k`;
    };
    
    // Get main image - check mainImage first, then images array, then fallback
    const getMainImage = () => {
        // Priority 1: mainImage property
        if ((place as any).mainImage) {
            return (place as any).mainImage;
        }
        
        // Priority 2: First image from images array
        const images = (place as any).images;
        if (Array.isArray(images) && images.length > 0) {
            return images[0];
        }
        
        // Priority 3: Fallback
        return 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382';
    };
    
    const mainImage = getMainImage();
    
    // Get amenities if available
    const amenities = (place as any).amenities || [];
    const displayAmenities = Array.isArray(amenities) ? amenities.slice(0, 3) : [];

    // Dynamic data sourcing for description & specializations
    const rawDescription = (place as any).description || '';
    const description = rawDescription && rawDescription.trim().length > 0
        ? rawDescription.trim()
        : `Professional Facial Place. Create or update your profile description to help customers understand your services.`;

    const parsedfacialTypes = parseMassageTypes((place as any).facialTypes) || [];
    const facialTypesDisplay = Array.isArray(parsedfacialTypes) ? parsedfacialTypes.slice(0, 6) : [];

    const parsedLanguages = parseLanguages((place as any).languages) || [];
    const languagesDisplay = Array.isArray(parsedLanguages) ? parsedLanguages.slice(0, 5) : [];

    // Years of experience: prefer explicit yearsOfExperience, fallback to membership duration
    const yearsOfExperience = (() => {
        const direct = (place as any).yearsOfExperience;
        if (typeof direct === 'number' && direct > 0) return direct;
        try {
            const startRaw = (place as any).activeMembershipDate || (place as any).membershipStartDate;
            if (!startRaw) return undefined;
            const startDate = new Date(startRaw);
            if (isNaN(startDate.getTime())) return undefined;
            const diffMs = Date.now() - startDate.getTime();
            const years = diffMs / (1000 * 60 * 60 * 24 * 365);
            return years >= 1 ? Math.floor(years) : undefined;
        } catch { return undefined; }
    })();



    const handleViewDetails = () => {
        console.log('🏨 FacialPlaceCard - View Details clicked:', {
            place: place,
            placeName: place.name,
            placeId: place.id || (place as any).$id,
            onNavigate: !!onNavigate,
            onSelectPlace: !!onSelectPlace
        });
        
        onIncrementAnalytics('views');
        onSelectPlace(place);
        
        if (onNavigate) {
            console.log('🏨 Navigating to facialPlaceProfile');
            onNavigate('facialPlaceProfile');
        } else {
            console.error('❌ onNavigate is not defined!');
        }
    };

    return (
        <>
            {/* External meta bar (Joined Date / Free / Orders) */}
            <div className="flex justify-between items-center mb-2 px-2">
                <span className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {joinedDisplay}
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onNavigate?.('joinIndastreet');
                    }}
                    className="text-[11px] text-green-600 font-semibold flex items-center gap-1 hover:text-green-700 hover:underline transition-colors cursor-pointer"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Facial Spa Join Free
                </button>
                <span className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Orders: {bookingsCount}
                </span>
            </div>
            <div className="w-full bg-white rounded-xl shadow-md overflow-visible relative active:shadow-lg transition-shadow touch-manipulation pb-8">
                {/* Main Image Banner + Lazy Loading (full-width cover) */}
                <div className="h-48 w-full bg-gradient-to-r from-orange-400 to-orange-600 overflow-visible relative rounded-t-xl">
                    <img 
                        src={mainImage} 
                        alt={`${place.name} cover`} 
                        className="w-full h-full object-cover rounded-t-xl"
                        loading="lazy"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382';
                        }}
                    />
                    
                    {/* Verified Badge - Top Left Corner - Premium + KTP Verified */}
                    {(place as any).membershipTier === 'premium' && (place as any).ktpVerified && (
                        <div className="absolute top-2 left-2 z-30">
                            <img 
                                src="https://ik.imagekit.io/7grri5v7d/indastreet_verfied-removebg-preview.png?updatedAt=1764750953473" 
                                alt="Verified Place"
                                className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg"
                                style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
                            />
                        </div>
                    )}

                {/* Discount Badge - Database driven discount */}
                {isDiscountActive(place) && (
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                        <div 
                            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-full px-4 py-2 shadow-lg animate-bounce"
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

                {/* Opening/Closing Time Badge - Shows when NO discount is active */}
                {!isDiscountActive(place) && !activeDiscount && place.openingTime && place.closingTime && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/80 backdrop-blur-md rounded-full px-3 py-2 shadow-lg">
                        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs text-white font-semibold">
                            {place.openingTime} - {place.closingTime}
                        </span>
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
                
                {/* Share Button - Bottom Right Corner */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowSharePopup(true);
                    }}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-30"
                    title="Share this facial place"
                    aria-label="Share this facial place"
                >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                </button>
            </div>
            
            {/* Profile Section - Flexbox layout for stable positioning */}
            <div className="px-4 -mt-10 pb-6 relative z-[2000] overflow-visible">
                <div className="flex items-start justify-between gap-4">
                    {/* Left side: Profile + Name + Status */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                            <div className="relative w-20 h-20 aspect-square">
                                <img 
                                    className="w-20 h-20 aspect-square rounded-full object-cover border-4 border-white shadow-lg bg-gray-100" 
                                    src={(place as any).profilePicture || (place as any).logo || mainImage}
                                    alt={place.name}
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382';
                                    }}
                                />
                                {/* Verified Pro Rosette */}
                                {(place as any).isVerified && (
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-500">
                                        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 1.5l2.19 4.44 4.9.71-3.54 3.45.83 4.86L10 12.9l-4.38 2.33.83-4.86L2.91 6.65l4.9-.71L10 1.5zm-1.2 9.09l-1.6-1.6a.75.75 0 10-1.06 1.06l2.13 2.13a.75.75 0 001.06 0l4.13-4.13a.75.75 0 10-1.06-1.06l-3.6 3.6z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                )}
                                
                                {/* Star Rating Badge */}
                                <button
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 bg-white/95 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5 z-[2000]"
                                    onClick={() => onRate(place)}
                                    aria-label={`Rate ${place.name}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="#eab308">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="font-bold text-gray-900 text-base">{formatRating(getDisplayRating(place.rating, place.reviewCount))}</span>
                                </button>
                            </div>
                        </div>
                        
                        {/* Name and Status Column */}
                        <div className="flex-1 min-w-0 pt-12 pb-2">
                            <h3 className="text-lg font-bold text-gray-900 truncate">{place.name}</h3>
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 mt-1">
                                <span className="relative mr-1.5">
                                    {/* Static ring glow effect */}
                                    <span className="absolute inset-0 w-4 h-4 -left-1 -top-1 rounded-full bg-green-300 opacity-40"></span>
                                    <span className="absolute inset-0 w-3 h-3 -left-0.5 -top-0.5 rounded-full bg-green-400 opacity-30"></span>
                                    <span className="w-2 h-2 rounded-full block bg-green-500"></span>
                                </span>
                                Open Now
                            </div>
                        </div>
                    </div>
                    
                    {/* Right side: Distance */}
                    <div className="flex-shrink-0 pb-2 mt-12">
                        <DistanceDisplay
                            userLocation={userLocation}
                            providerLocation={parseCoordinates(place.coordinates) || { lat: 0, lng: 0 }}
                            className="text-sm"
                            showTravelTime={true}
                            showIcon={true}
                            size="sm"
                        />
                    </div>
                </div>
            </div>

            {/* Facial Place Bio - Natural flow with proper margin (increased for star badge clearance) */}
            <div className="mt-12 facial-place-bio-section mx-4 relative z-0">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-xs text-gray-600 leading-relaxed text-justify line-clamp-4 flex-1">
                        {description}
                    </p>
                    {/* Opening/Closing Time Text - Shows when discount IS active */}
                    {(isDiscountActive(place) || activeDiscount) && place.openingTime && place.closingTime && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                            <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">{place.openingTime}-{place.closingTime}</span>
                        </div>
                    )}
                </div>
                {/* Website Link */}
                {(place as any).websiteUrl && (
                    <a
                        href={(place as any).websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 mt-2 text-xs text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        Visit Website
                    </a>
                )}
            </div>
            
            {/* Content */}
            <div className="p-4 flex flex-col gap-4 w-full">
                <div className="flex items-start gap-4 w-full">
                    <div className="flex-grow">
                        {/* Content starts below the positioned elements */}
                    </div>
                </div>

                {/* Facial Treatments - dynamic */}
                {facialTypesDisplay.length > 0 && (
                    <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <h4 className="text-xs font-semibold text-gray-700 whitespace-nowrap">Facial Treatments</h4>
                            {(place as any).therapistGender && (place as any).therapistGender !== 'Unisex' && (
                                <span className="text-xs font-medium text-orange-600 flex items-center gap-1 whitespace-nowrap">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                    </svg>
                                    Bookings: {(place as any).therapistGender} Only
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {facialTypesDisplay.map((mt: string) => (
                                <span key={mt} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-200">{mt}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Languages & Experience - dynamic */}
                {(languagesDisplay.length > 0 || yearsOfExperience) && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold text-gray-700">Languages</h4>
                            {yearsOfExperience && (
                                <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-xs font-semibold text-gray-700">{yearsOfExperience}+ Years Experience</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {languagesDisplay.map((lang: string) => (
                                <span key={lang} className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1">
                                    <span className="text-xs">🌐</span>
                                    <span className="text-xs">{lang}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}



                {/* Amenities */}
                {displayAmenities.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Amenities</h4>
                        <p className="text-xs text-gray-500 mb-2">Additional services provided during your massage session</p>
                        <div className="flex flex-wrap gap-2">
                            {displayAmenities.map((amenity: string) => (
                                <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                                    {amenity}
                                </span>
                            ))}
                            {amenities.length > 3 && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                                    +{amenities.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

            {/* Indastreet Verification Standards Link */}
            <div className="text-center mb-2 mt-2">
                <button
                    onClick={() => onNavigate?.('verifiedProBadge')}
                    className="text-sm font-medium hover:underline"
                >
                    <span className="text-black">Inda</span><span className="text-orange-500">street</span><span className="text-black"> Verification Standards</span>
                </button>
            </div>

            {/* Discounted Prices Header */}
            {isDiscountActive(place) && (
                <div className={`text-center mb-1 ${getDynamicSpacing('mt-3', 'mt-2', 'mt-1')}`}>
                    <p className="text-black font-semibold text-sm flex items-center justify-center gap-1">
                        🔥 Discounted Price's Displayed
                    </p>
                </div>
            )}

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-2 text-center text-sm mt-1 w-full">
                {/* 60 min pricing */}
                <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-300 min-h-[60px] flex flex-col justify-center min-w-0 ${
                    isDiscountActive(place) ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300' : 'bg-gray-50 border-gray-200'
                }`} 
                style={isDiscountActive(place) ? {
                    animation: 'priceRimFade 3s ease-in-out infinite',
                    boxShadow: '0 0 20px rgba(249, 115, 22, 0.6)'
                } : {}}>
                    <p className="text-gray-600 text-xs">120 min</p>
                    {isDiscountActive(place) ? (
                        <>
                            <p className="font-bold text-gray-800 text-sm line-through opacity-60">
                                IDR {formatPrice(Number(pricing["120"]))}
                            </p>
                            <p className="font-bold text-orange-600 text-sm sm:text-lg">
                                IDR {formatPrice(Math.round(Number(pricing["120"]) * (1 - (place as any).discountPercentage / 100)))}
                            </p>
                        </>
                    ) : (
                        <p className="font-bold text-gray-800 text-sm sm:text-lg">IDR {formatPrice(Number(pricing["120"]))}</p>
                    )}
                </div>
                    
                {/* 90 min pricing */}
                <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-300 min-h-[60px] flex flex-col justify-center min-w-0 ${
                    isDiscountActive(place) ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300' : 'bg-gray-50 border-gray-200'
                }`} 
                style={isDiscountActive(place) ? {
                    animation: 'priceRimFade 3s ease-in-out infinite',
                    boxShadow: '0 0 20px rgba(249, 115, 22, 0.6)'
                } : {}}>
                    <p className="text-gray-600 text-xs">60 min</p>
                    {isDiscountActive(place) ? (
                        <>
                            <p className="font-bold text-gray-800 text-sm line-through opacity-60">
                                IDR {formatPrice(Number(pricing["60"]))}
                            </p>
                            <p className="font-bold text-orange-600 text-sm sm:text-lg">
                                IDR {formatPrice(Math.round(Number(pricing["60"]) * (1 - (place as any).discountPercentage / 100)))}
                            </p>
                        </>
                    ) : (
                        <p className="font-bold text-gray-800 text-sm sm:text-lg">IDR {formatPrice(Number(pricing["60"]))}</p>
                    )}
                </div>
                    
                {/* 120 min pricing */}
                <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-300 min-h-[60px] flex flex-col justify-center min-w-0 ${
                    isDiscountActive(place) ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300' : 'bg-gray-50 border-gray-200'
                }`} 
                style={isDiscountActive(place) ? {
                    animation: 'priceRimFade 3s ease-in-out infinite',
                    boxShadow: '0 0 20px rgba(249, 115, 22, 0.6)'
                } : {}}>
                    <p className="text-gray-600 text-xs">90 min</p>
                    {isDiscountActive(place) ? (
                        <>
                            <p className="font-bold text-gray-800 text-sm line-through opacity-60">
                                IDR {formatPrice(Number(pricing["90"]))}
                            </p>
                            <p className="font-bold text-orange-600 text-sm sm:text-lg">
                                IDR {formatPrice(Math.round(Number(pricing["90"]) * (1 - (place as any).discountPercentage / 100)))}
                            </p>
                        </>
                    ) : (
                        <p className="font-bold text-gray-800 text-sm sm:text-lg">IDR {formatPrice(Number(pricing["90"]))}</p>
                    )}
                </div>
            </div>

                {/* Action Button - View Details Only */}
                <button
                    onClick={handleViewDetails}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-300"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View Facial Clinic</span>
                </button>

                {/* Refer Friend, Massage Directory and Leave Review Links */}
                <div className="flex flex-wrap justify-between items-center gap-2 mt-3 px-1">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Placeholder for refer friend functionality
                            alert('Share feature coming soon!');
                        }}
                        className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                    >
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        <span>Share</span>
                    </button>
                    {onNavigate && (
                        <button
                            type="button"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                onNavigate('facialTypes');
                            }}
                            title={_t?.home?.facialDirectoryTitle || 'Go to Facial Types Directory'}
                            className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                        >
                            <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m0 0l-3.5 3.5M16 7l-3.5 3.5M5 12h14M5 16h14" />
                            </svg>
                            <span>{_t?.home?.facialDirectory || 'Facial Types'}</span>
                        </button>
                    )}
                    {onNavigate && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onNavigate(`reviews-place-${place.$id || place.id}`);
                            }}
                            className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                        >
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>Reviews</span>
                        </button>
                    )}
                </div>
            </div>
            
            {/* Anonymous Review Modal */}
            {showReviewModal && (
                <AnonymousReviewModal
                    providerName={place.name}
                    providerId={place.$id || place.id}
                    providerType="place"
                    providerImage={(place as any).mainImage || 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382'}
                    onClose={() => setShowReviewModal(false)}
                    onSubmit={handleAnonymousReviewSubmit}
                />
            )}

            {/* Login Required Modal */}
            {showLoginRequiredModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowLoginRequiredModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
                            <p className="text-gray-600 mb-6">Please register or login to leave a review.</p>
                            <button
                                onClick={() => {
                                    setShowLoginRequiredModal(false);
                                    onShowRegisterPrompt?.();
                                }}
                                className="w-full px-4 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors min-h-[44px] touch-manipulation active:bg-orange-700"
                            >
                                Register / Login
                            </button>
                        </div>
                    </div>
                </div>
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

        {/* Social Share Popup */}
        <SocialSharePopup
            isOpen={showSharePopup}
            onClose={() => setShowSharePopup(false)}
            title={place.name}
            description={`Discover ${place.name} on IndaStreet! ${place.description || 'Professional facial and beauty services.'}`}
            url={window.location.href}
            type="facial"
        />
        </>
    );
};

export default FacialPlaceCard;
// Force rebuild



