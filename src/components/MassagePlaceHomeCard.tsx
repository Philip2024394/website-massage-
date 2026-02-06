import React, { useState, useEffect } from 'react';
import type { Place, Analytics } from '../types';
import { getDisplayRating, formatRating } from '../utils/ratingUtils';
import DistanceDisplay from './DistanceDisplay';
import { bookingService } from '../lib/bookingService';
import { isDiscountActive } from '../utils/therapistCardHelpers';
import SocialSharePopup from './SocialSharePopup';
import { generateShareableURL } from '../utils/seoSlugGenerator';
import { shareLinkService } from '../lib/services/shareLinkService';
import { Share2 } from 'lucide-react';

interface MassagePlaceHomeCardProps {
    place: Place;
    onClick: (place: Place) => void;
    onIncrementAnalytics: (metric: keyof Analytics) => void;
    userLocation?: { lat: number; lng: number } | null;
    readOnly?: boolean; // Lock card to read-only mode
}

const StarIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20">
        <path fill="currentColor" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const MassagePlaceHomeCard: React.FC<MassagePlaceHomeCardProps> = ({ 
    place, 
    onClick,
    onIncrementAnalytics,
    userLocation,
    readOnly = false // Default to editable unless specified
}) => {
    const [bookingsCount, setBookingsCount] = useState<number>(() => {
        try {
            if ((place as any).analytics) {
                const parsed = JSON.parse((place as any).analytics);
                if (parsed && typeof parsed.bookings === 'number') return parsed.bookings;
            }
        } catch {}
        return 0;
    });

    // Share functionality state
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [shortShareUrl, setShortShareUrl] = useState<string>('');

    // Handle share functionality
    const handleShareClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowSharePopup(true);
    };

    useEffect(() => {
        const loadBookingsCount = async () => {
            try {
                const placeId = String((place as any).id || (place as any).$id || '');
                if (!placeId) return;
                
                const count = await bookingService.getBookingsCount(placeId, 'place');
                setBookingsCount(count);
            } catch (error) {
                console.error('Failed to load bookings count:', error);
            }
        };

        loadBookingsCount();
    }, [place]);

    // Generate share URL
    useEffect(() => {
        const generateShareUrl = async () => {
            try {
                const placeId = String((place as any).id || (place as any).$id || '');
                if (!placeId) return;
                
                // Try to get existing share link
                const shareLink = await shareLinkService.getByEntity('place', placeId);
                if (shareLink) {
                    const shortUrl = `https://www.indastreetmassage.com/share/${shareLink.shortId}`;
                    setShortShareUrl(shortUrl);
                } else {
                    // Fallback to regular URL
                    const fullUrl = `https://www.indastreetmassage.com/place/${place.name?.replace(/\\s+/g, '-').toLowerCase()}`;
                    setShortShareUrl(fullUrl);
                }
            } catch (error) {
                console.error('Error generating share URL:', error);
                // Fallback to regular URL
                const fullUrl = `https://www.indastreetmassage.com/place/${place.name?.replace(/\\s+/g, '-').toLowerCase()}`;
                setShortShareUrl(fullUrl);
            }
        };

        generateShareUrl();
    }, [place]);

    // Parse pricing
    const getPricing = () => {
        const hasValidSeparateFields = (
            (place.price60 && parseInt(place.price60) > 0) ||
            (place.price90 && parseInt(place.price90) > 0) ||
            (place.price120 && parseInt(place.price120) > 0)
        );

        if (hasValidSeparateFields) {
            return {
                "60": place.price60 ? parseInt(place.price60) * 1000 : 0,
                "90": place.price90 ? parseInt(place.price90) * 1000 : 0,
                "120": place.price120 ? parseInt(place.price120) * 1000 : 0
            };
        }
        
        return { "60": 0, "90": 0, "120": 0 };
    };

    const pricing = getPricing();

    const rawRating = getDisplayRating(place.rating, place.reviewCount);
    const effectiveRating = rawRating > 0 ? rawRating : 4.8;
    const displayRating = formatRating(effectiveRating);

    const formatPrice = (price: number) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `${(price / 1000).toFixed(0)}K`;
        }
        return price.toLocaleString('id-ID');
    };

    // Get status - map any status value to valid status
    const getStatusStyles = () => {
        const statusStr = String((place as any).availability || place.status || 'Open');
        
        if (statusStr === 'Open' || statusStr === 'Available') {
            return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Open' };
        } else if (statusStr === 'Busy') {
            return { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Busy' };
        }
        return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Closed' };
    };

    const statusStyle = getStatusStyles();

    // Generate consistent fake booking count for new places (35-65)
    const getInitialBookingCount = (placeId: string): number => {
        let hash = 0;
        for (let i = 0; i < placeId.length; i++) {
            hash = ((hash << 5) - hash) + placeId.charCodeAt(i);
            hash = hash & hash;
        }
        return 35 + (Math.abs(hash) % 31); // 35-65 range for massage places
    };

    const joinedDateRaw = place.membershipStartDate || place.activeMembershipDate || (place as any).$createdAt;
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

    const displayBookingsCount = bookingsCount === 0 ? getInitialBookingCount(String(place.id || place.$id || '')) : bookingsCount;

    return (
        <div className="relative">
            {/* External meta bar (Joined Date) */}
            <div className="flex justify-between items-center mb-2 px-2">
                <span className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {joinedDisplay}
                </span>
                <div className="flex items-center gap-2">
                    {!readOnly && (
                        <span className="text-[11px] text-green-600 font-semibold">
                            Massage Spa Join Free
                        </span>
                    )}
                    {readOnly && (
                        <span className="text-[11px] text-gray-500 font-medium bg-gray-200 px-2 py-0.5 rounded-full">
                            Read Only
                        </span>
                    )}
                </div>
            </div>
            
            <div 
                onClick={readOnly ? undefined : () => {
                    onClick(place);
                    onIncrementAnalytics('views');
                }}
                className={`bg-white rounded-2xl overflow-hidden border border-gray-200 transition-all duration-300 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:shadow-xl'} group ${readOnly ? 'opacity-90' : ''}`}
            >
            {/* Image Container */}
            <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                    src={(place as any).mainImage || (place as any).profilePicture || (place as any).image || '/default-place.jpg'}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-place.jpg';
                    }}
                />

                {/* Star Rating Badge - Top Left */}
                <div className="absolute top-3 left-3 shadow-lg flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <StarIcon className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-bold text-white">{displayRating}</span>
                </div>

                {/* Premium Verified Badge - Left side, between star rating and profile */}


                {/* Status badge removed from main image */}

                {/* Orders Badge - Top Right */}
                {displayBookingsCount > 0 && (
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                        {displayBookingsCount}+ Orders
                    </div>
                )}

                {/* Discount Badge - Bottom Center */}
                {isDiscountActive(place as any) && (
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 backdrop-blur-sm animate-pulse">
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                            🔥 Discount Active
                        </span>
                    </div>
                )}

                {/* Share Button - Bottom Right Corner of image */}
                {!readOnly && (
                    <button
                        onClick={handleShareClick}
                        className="absolute bottom-2 right-2 w-11 h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-30"
                        title="Share this place"
                        aria-label="Share profile"
                        style={{ minWidth: '44px', minHeight: '44px' }}
                    >
                        <Share2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </button>
                )}
            </div>

            {/* Location & Distance - Below image on the right side (matching TherapistHomeCard) */}
            <div className="px-4 mt-2 mb-1 flex justify-end">
                <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs font-medium text-gray-700">{(place.location || 'Bali').split(',')[0].trim()}</span>
                    </div>
                    {userLocation && (
                        <div className="text-xs text-orange-500 font-medium">
                            <DistanceDisplay
                                userLocation={userLocation}
                                targetLocation={{
                                    lat: parseFloat(String((place as any).lat || (place as any).latitude || 0)),
                                    lng: parseFloat(String((place as any).lng || (place as any).longitude || 0))
                                }}
                                className="text-xs text-orange-500 font-medium"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Section - Similar to TherapistHomeCard */}
            <div className="px-4 -mt-10 sm:-mt-16 pb-4 relative z-20 overflow-visible">
                <div className="flex items-start gap-3">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0 relative z-20">
                        <div className="w-24 h-24 bg-white rounded-full p-1 relative aspect-square ring-2 ring-orange-100 overflow-visible">
                            <img 
                                className="w-full h-full rounded-full object-cover aspect-square" 
                                src={(place as any).profilePicture || (place as any).mainImage || (place as any).image || '/default-place.jpg'}
                                alt={place.name}
                                loading="lazy"
                                width="96"
                                height="96"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/default-place.jpg';
                                }}
                            />
                        </div>
                    </div>
                    
                    {/* Name and Status Column - Match TherapistCard padding */}
                    <div className="flex-1 pt-12 sm:pt-14 pb-3 overflow-visible">
                        {/* Name Only */}
                        <div className="mb-1">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {/* Verified Badge - Show if place has both bank details and KTP */}
                                    {(() => {
                                        const hasVerifiedBadge = (place as any).verifiedBadge || (place as any).isVerified;
                                        const hasBankDetails = place.bankName && place.accountName && place.accountNumber;
                                        const hasKtpUploaded = place.ktpPhotoUrl;
                                        const shouldShowBadge = hasVerifiedBadge || (hasBankDetails && hasKtpUploaded);
                                        
                                        return shouldShowBadge && (
                                            <img 
                                                src="https://ik.imagekit.io/7grri5v7d/verified-removebg-preview.png?updatedAt=1768015154565"
                                                alt="Verified"
                                                className="w-5 h-5 flex-shrink-0"
                                                title="Verified Place - Complete Profile"
                                            />
                                        );
                                    })()}
                                    
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                                        {place.name || "Massage Place"}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Status Badge - Under name like profile card */}
                        <div className="overflow-visible">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusStyle.bg} ${statusStyle.text}`}>
                                <span className={`w-2 h-2 rounded-full ${statusStyle.dot} animate-pulse mr-1.5`}></span>
                                <span className="text-xs">{statusStyle.label}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Area of Service - Services with Languages on same line (After profile section like profile card) */}
            <div className="mx-4 mb-2">
                <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-600 flex-shrink-0">
                        <span className="font-bold">Area of Service:</span> {(place as any).services || 'All Massage Types'}
                    </p>
                    {(() => {
                        const languagesValue = (place as any).languages;
                        const languages = languagesValue 
                            ? (typeof languagesValue === 'string' 
                                ? (languagesValue as string).split(',').map((l: string) => l.trim()) 
                                : languagesValue)
                            : [];
                        
                        // Debug logging
                        console.log('🏠 MassagePlaceHomeCard languages debug:', {
                            placeName: place.name,
                            languagesValue,
                            parsedLanguages: languages,
                            languagesType: typeof languagesValue
                        });
                        
                        if (!languages || !Array.isArray(languages) || languages.length === 0) {
                            // Fallback: show Indonesian and English flags if no languages specified
                            return (
                                <div className="flex items-center gap-1.5">
                                    <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1">
                                        <span 
                                            className="text-sm" 
                                            style={{
                                                fontFamily: '"Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", sans-serif',
                                                fontSize: '14px',
                                                lineHeight: '1'
                                            }}
                                        >
                                            🇮🇩
                                        </span>
                                        <span className="text-xs font-semibold">ID</span>
                                    </span>
                                    <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1">
                                        <span 
                                            className="text-sm" 
                                            style={{
                                                fontFamily: '"Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", sans-serif',
                                                fontSize: '14px',
                                                lineHeight: '1'
                                            }}
                                        >
                                            🇬🇧
                                        </span>
                                        <span className="text-xs font-semibold">EN</span>
                                    </span>
                                </div>
                            );
                        }
                        
                        // Language mapping with flags - using CSS flag icons for better mobile compatibility
                        const langMap: Record<string, {flag: string, name: string, flagClass?: string}> = {
                            'english': {flag: '🇬🇧', name: 'EN', flagClass: 'fi fi-gb'},
                            'indonesian': {flag: '🇮🇩', name: 'ID', flagClass: 'fi fi-id'},
                            'mandarin': {flag: '🇨🇳', name: 'ZH', flagClass: 'fi fi-cn'},
                            'japanese': {flag: '🇯🇵', name: 'JP', flagClass: 'fi fi-jp'},
                            'korean': {flag: '🇰🇷', name: 'KR', flagClass: 'fi fi-kr'},
                            'thai': {flag: '🇹🇭', name: 'TH', flagClass: 'fi fi-th'},
                            'vietnamese': {flag: '🇻🇳', name: 'VI', flagClass: 'fi fi-vn'},
                            'french': {flag: '🇫🇷', name: 'FR', flagClass: 'fi fi-fr'},
                            'german': {flag: '🇩🇪', name: 'DE', flagClass: 'fi fi-de'},
                            'spanish': {flag: '🇪🇸', name: 'ES', flagClass: 'fi fi-es'},
                            'portuguese': {flag: '🇵🇹', name: 'PT', flagClass: 'fi fi-pt'},
                            'italian': {flag: '🇮🇹', name: 'IT', flagClass: 'fi fi-it'},
                            'russian': {flag: '🇷🇺', name: 'RU', flagClass: 'fi fi-ru'},
                            'arabic': {flag: '🇸🇦', name: 'AR', flagClass: 'fi fi-sa'},
                            'hindi': {flag: '🇮🇳', name: 'HI', flagClass: 'fi fi-in'},
                            // Language codes for backward compatibility
                            'en': {flag: '🇬🇧', name: 'EN', flagClass: 'fi fi-gb'},
                            'id': {flag: '🇮🇩', name: 'ID', flagClass: 'fi fi-id'},
                            'zh': {flag: '🇨🇳', name: 'ZH', flagClass: 'fi fi-cn'},
                            'ja': {flag: '🇯🇵', name: 'JP', flagClass: 'fi fi-jp'},
                            'ko': {flag: '🇰🇷', name: 'KR', flagClass: 'fi fi-kr'},
                            'th': {flag: '🇹🇭', name: 'TH', flagClass: 'fi fi-th'},
                            'vi': {flag: '🇻🇳', name: 'VI', flagClass: 'fi fi-vn'},
                            'fr': {flag: '🇫🇷', name: 'FR', flagClass: 'fi fi-fr'},
                            'de': {flag: '🇩🇪', name: 'DE', flagClass: 'fi fi-de'},
                            'es': {flag: '🇪🇸', name: 'ES', flagClass: 'fi fi-es'},
                            'pt': {flag: '🇵🇹', name: 'PT', flagClass: 'fi fi-pt'},
                            'it': {flag: '🇮🇹', name: 'IT', flagClass: 'fi fi-it'},
                            'ru': {flag: '🇷🇺', name: 'RU', flagClass: 'fi fi-ru'},
                            'ar': {flag: '🇸🇦', name: 'AR', flagClass: 'fi fi-sa'},
                            'hi': {flag: '🇮🇳', name: 'HI', flagClass: 'fi fi-in'}
                        };
                        
                        return (
                            <div className="flex items-center gap-1">
                                {languages.slice(0, 2).map((lang, index, array) => {
                                    const langKey = lang.toLowerCase();
                                    // Default to Indonesian flag if language not recognized
                                    const langInfo = langMap[langKey] || {flag: '🇮🇩', name: 'ID'};
                                    
                                    // Skip duplicate language codes
                                    const isDuplicate = array.slice(0, index).some(prevLang => {
                                        const prevKey = prevLang.toLowerCase();
                                        const prevInfo = langMap[prevKey] || {flag: '🇮🇩', name: 'ID'};
                                        return prevInfo.name === langInfo.name;
                                    });
                                    
                                    if (isDuplicate) return null;
                                    
                                    return (
                                        <span key={lang} className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1">
                                            {/* Use emoji flag with proper font family to ensure display */}
                                            <span 
                                                className="text-sm" 
                                                style={{
                                                    fontFamily: '"Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", sans-serif',
                                                    fontSize: '14px',
                                                    lineHeight: '1'
                                                }}
                                            >
                                                {langInfo.flag}
                                            </span>
                                            <span className="text-xs font-semibold">{langInfo.name}</span>
                                        </span>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Description (After Services like profile card) */}
            {place.description && (
                <div className="mx-4 mb-3">
                    <p className="text-sm text-gray-700 leading-5 break-words whitespace-normal line-clamp-2 text-left">
                        {place.description}
                    </p>
                </div>
            )}

            {/* Content */}
            <div className="px-4 pb-4">
                {/* Pricing - Always show all 3 containers */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 bg-gray-200 rounded-lg min-w-0">
                        <div className="text-xs text-gray-600 mb-1">60 min</div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900 break-words">
                            {pricing["60"] > 0 ? `Rp ${formatPrice(pricing["60"])}` : 'Contact'}
                        </div>
                    </div>
                    <div className="text-center p-2 bg-gray-200 rounded-lg min-w-0">
                        <div className="text-xs text-gray-600 mb-1">90 min</div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900 break-words">
                            {pricing["90"] > 0 ? `Rp ${formatPrice(pricing["90"])}` : 'Contact'}
                        </div>
                    </div>
                    <div className="text-center p-2 bg-gray-200 rounded-lg min-w-0">
                        <div className="text-xs text-gray-600 mb-1">120 min</div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900 break-words">
                            {pricing["120"] > 0 ? `Rp ${formatPrice(pricing["120"])}` : 'Contact'}
                        </div>
                    </div>
                </div>

                {/* View Profile Button */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent card onClick from firing
                        console.log('🔵 MASSAGE PLACE VIEW PROFILE CLICKED:', {
                            placeId: place.id || place.$id,
                            placeName: place.name,
                            readOnly
                        });
                        if (!readOnly) {
                            onClick(place);
                            onIncrementAnalytics('views');
                        }
                    }}
                    disabled={readOnly}
                    className={`w-full py-2.5 font-semibold rounded-lg transition-all ${
                        readOnly 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                    }`}
                >
                    {readOnly ? 'View Only' : 'View Profile'}
                </button>
            </div>
            </div>

            {/* Social Share Popup */}
            {showSharePopup && (
                <SocialSharePopup
                    isOpen={showSharePopup}
                    onClose={() => setShowSharePopup(false)}
                    title={place.name}
                    description={place.description || "Professional massage services"}
                    url={shortShareUrl}
                    type="place"
                />
            )}
        </div>
    );
};

export default MassagePlaceHomeCard;