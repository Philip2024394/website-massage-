import React, { useState, useEffect } from 'react';
import type { Place, Analytics } from '../types';
import { getDisplayRating, formatRating } from '../utils/ratingUtils';
import DistanceDisplay from './DistanceDisplay';
import { bookingService } from '../lib/bookingService';
import { isDiscountActive } from '../utils/therapistCardHelpers';
import SocialSharePopup from './SocialSharePopup';
import { generateShareableURL } from '../utils/seoSlugGenerator';
import { shareLinkService } from '../lib/services/shareLinkService';
import { Share2, Sparkles } from 'lucide-react';
import { logger } from '../utils/logger';
import { VERIFIED_BADGE_IMAGE_URL } from '../constants/appConstants';

interface FacialPlaceHomeCardProps {
    place: Place;
    onClick: (place: Place) => void;
    onIncrementAnalytics: (metric: keyof Analytics) => void;
    userLocation?: { lat: number; lng: number } | null;
    /** When true, card is shown as clinic (visit location); when false, as home service (they come to you). */
    showAsClinic?: boolean;
}

const StarIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20">
        <path fill="currentColor" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const DEFAULT_FACIAL_IMAGE = 'https://ik.imagekit.io/7grri5v7d/facial%202.png?updatedAt=1766551253328';

function getPlaceDisplayImage(place: any): string {
    return (
        place?.mainImage ||
        place?.profilePicture ||
        place?.image ||
        place?.main_image ||
        place?.profile_image ||
        DEFAULT_FACIAL_IMAGE
    );
}

const FacialPlaceHomeCard: React.FC<FacialPlaceHomeCardProps> = ({ 
    place, 
    onClick,
    onIncrementAnalytics,
    userLocation,
    showAsClinic = false,
}) => {
    const displayImage = getPlaceDisplayImage(place);
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
    const [showMenuSlider, setShowMenuSlider] = useState(false);

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
                // Silently fall back to default count (don't log error)
                // Bookings collection may not have facial place records yet
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
                const shareLink = await shareLinkService.getByEntity('facial', placeId);
                if (shareLink) {
                    const shortUrl = `https://www.indastreetmassage.com/share/${shareLink.shortId}`;
                    setShortShareUrl(shortUrl);
                } else {
                    // Fallback to regular URL
                    const fullUrl = `https://www.indastreetmassage.com/facial/${place.name?.replace(/\\s+/g, '-').toLowerCase()}`;
                    setShortShareUrl(fullUrl);
                }
            } catch (error) {
                logger.error('Error generating share URL:', error);
                // Fallback to regular URL
                const fullUrl = `https://www.indastreetmassage.com/facial/${place.name?.replace(/\\s+/g, '-').toLowerCase()}`;
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
    const effectiveRating = rawRating > 0 ? rawRating : 4.9; // Slightly higher for facial places
    const displayRating = formatRating(effectiveRating);

    const formatPrice = (price: number) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `${(price / 1000).toFixed(0)}K`;
        }
        return price.toLocaleString('id-ID');
    };

    // Get status - same as therapist: Available or Busy (no offline; default Busy)
    const getStatusStyles = () => {
        const statusStr = String((place as any).availability || place.status || 'Busy').trim();
        const lower = statusStr.toLowerCase();
        
        if (statusStr === 'Available' || lower === 'available') {
            return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Available', isAvailable: true };
        }
        return { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Busy', isAvailable: false };
    };

    const statusStyle = getStatusStyles();

    // Generate consistent fake booking count for new facial places (25-55)
    const getInitialBookingCount = (placeId: string): number => {
        let hash = 0;
        for (let i = 0; i < placeId.length; i++) {
            hash = ((hash << 5) - hash) + placeId.charCodeAt(i);
            hash = hash & hash;
        }
        return 25 + (Math.abs(hash) % 31); // 25-55 range for facial places
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
            {/* External meta bar (Joined Date / Beauty Portal / Orders) */}
            <div className="flex justify-between items-center mb-2 px-2">
                <span className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {joinedDisplay}
                </span>
                <span className="text-[11px] text-pink-600 font-semibold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Beauty Portal
                </span>
            </div>
            
            <div 
                onClick={() => {
                    if (typeof onClick === 'function') {
                        onClick(place);
                        onIncrementAnalytics('views');
                    }
                }}
                className="bg-white rounded-2xl overflow-visible border border-slate-200 hover:border-orange-200 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
            {/* Image Container – same height/ratio as therapist card */}
            <div className="relative h-56 overflow-visible bg-transparent rounded-t-2xl" style={{ minHeight: '224px' }}>
                <img
                    src={displayImage}
                    alt={place.name || "Facial Clinic"}
                    className="w-full h-full object-cover transition-transform duration-300 rounded-t-2xl group-hover:scale-105"
                    style={{ aspectRatio: '400/224', minHeight: '224px' }}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_FACIAL_IMAGE;
                    }}
                />

                {/* Star Rating Badge – same position as therapist: top left */}
                <div className="absolute top-3 left-3 shadow-lg flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <StarIcon className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-bold text-white">{displayRating}</span>
                </div>

                {/* Orders Badge – same position as therapist: top right */}
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {displayBookingsCount}+ {displayBookingsCount === 1 ? 'treatment' : 'treatments'}
                </div>

                {/* Share button – bottom right corner of main image */}
                <button
                    onClick={(e) => { e.stopPropagation(); handleShareClick(e); }}
                    className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-all z-10"
                    title="Share this clinic"
                    aria-label="Share this clinic"
                >
                    <Share2 className="w-4 h-4 text-white" strokeWidth={2.5} aria-hidden />
                </button>

                {/* Discount badge – bottom center like therapist */}
                {isDiscountActive(place as any) && (
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 backdrop-blur-sm animate-pulse">
                        <span className="text-xs font-bold text-white">{(place as any).discountPercentage}% OFF</span>
                    </div>
                )}

                {/* Facial & Skin Clinic badge – bottom left so it doesn’t cover star/orders */}
                <div className="absolute bottom-3 left-3 bg-orange-500/90 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-md">
                    {showAsClinic ? 'Facial clinic · Visit us' : 'Facial · Home service'}
                </div>
            </div>

            {/* Location display – same style as therapist card (right aligned, pin icon) */}
            <div className="px-4 mt-3 flex flex-col items-end">
                <div className="flex items-center gap-1 text-xs text-black font-medium">
                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate max-w-[200px] sm:max-w-none">
                        {place.address || place.location || (place as any).city || 'Clinic location'}
                    </span>
                </div>
                <div className="text-xs text-orange-500 mt-1 font-medium">
                    {(place as any).city ? `Serves ${(place as any).city} area` : (place.address || place.location) ? `Serves ${(place.address || place.location || '').split(',')[0].trim() || 'this'} area` : 'View profile for location'}
                </div>
            </div>

            {/* Profile Section – overlapping main image by ~30%, same as therapist */}
            <div className="px-4 -mt-[115px] pb-4 relative z-30 overflow-visible pointer-events-none">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 relative z-30">
                        <div className="w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] md:w-[120px] md:h-[120px] rounded-full overflow-hidden relative">
                            <img
                                className="w-full h-full object-cover pointer-events-auto border-4 border-white rounded-full"
                                src={displayImage}
                                alt={place.name || 'Clinic'}
                                loading="lazy"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = DEFAULT_FACIAL_IMAGE;
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Name and Status – below profile, same offset as therapist (ml-[75px]) */}
            <div className="px-4 mt-[2px] mb-3 relative z-40">
                <div className="mb-2 ml-[75px]">
                    <div className="flex items-center gap-2">
                        {(() => {
                            const hasVerifiedBadge = (place as any).verifiedBadge || (place as any).isVerified;
                            const hasBankDetails = place.bankName && place.accountName && place.accountNumber;
                            const hasKtpUploaded = place.ktpPhotoUrl;
                            const shouldShowBadge = hasVerifiedBadge || (hasBankDetails && hasKtpUploaded);
                            return shouldShowBadge && (
                                <img
                                    src={VERIFIED_BADGE_IMAGE_URL}
                                    alt="Verified"
                                    className="w-5 h-5 flex-shrink-0"
                                    title="Verified Place - Complete Profile"
                                />
                            );
                        })()}
                        <h3 className="text-lg font-bold text-gray-900 truncate">{place.name || "Facial Clinic"}</h3>
                    </div>
                </div>
                {/* Status badge – same style/position as therapist */}
                <div className="overflow-visible flex justify-start ml-[75px]">
                    <div className={`inline-flex items-center px-2.5 rounded-full font-medium whitespace-nowrap ${statusStyle.bg} ${statusStyle.text}`} style={{ paddingTop: '0px', paddingBottom: '0px', lineHeight: '1', fontSize: '10px', transform: 'scaleY(0.9)' }}>
                        <span className="relative inline-flex mr-1.5" style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px' }}>
                            <span className={`absolute rounded-full ${statusStyle.dot} ${statusStyle.isAvailable ? '' : 'animate-pulse'} z-10`} style={{ width: '8px', height: '8px', left: '12px', top: '12px' }} />
                            {statusStyle.isAvailable && (
                                <React.Fragment>
                                    <span className="absolute rounded-full bg-green-400 opacity-75 animate-ping" style={{ width: '20px', height: '20px', left: '6px', top: '6px' }} />
                                    <span className="absolute rounded-full bg-green-300 opacity-50 animate-ping" style={{ width: '28px', height: '28px', left: '2px', top: '2px', animationDuration: '1.5s' }} />
                                </React.Fragment>
                            )}
                        </span>
                        <span className="text-xs">{statusStyle.label}</span>
                    </div>
                </div>
            </div>

            {/* Focus note: clinic (visit) vs home service (we come to you) */}
            <div className="mx-4 mb-1">
                <p className="text-xs text-orange-600 font-medium">
                    {showAsClinic ? 'Facial & skin clinic · Visit our location' : 'Facial treatment & skin care · Home service'}
                </p>
            </div>

            {/* Clinic photos strip – home service: show up to 4 thumbnails when available */}
            {(() => {
                const main = displayImage;
                const extraImages: string[] = [];
                if (Array.isArray((place as any).images)) (place as any).images.forEach((u: string) => u && extraImages.push(u));
                const gallery = (place as any).galleryImages;
                if (Array.isArray(gallery)) gallery.forEach((g: any) => (g?.imageUrl || g?.url) && extraImages.push(g.imageUrl || g.url));
                const allPhotos = [main, ...extraImages].filter(Boolean) as string[];
                const unique = Array.from(new Set(allPhotos)).slice(0, 4);
                if (unique.length === 0) return null;
                return (
                    <div className="mx-4 mb-2">
                        <p className="text-[10px] font-semibold text-slate-600 mb-1.5">Clinic photos</p>
                        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
                            {unique.map((src, i) => (
                                <div key={i} className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                                    <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })()}

            {/* Client Preference - Services with Languages on same line (After profile section like profile card) */}
            <div className="mx-4 mb-2">
                <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-800 flex-shrink-0 font-medium">
                        <span className="font-bold text-gray-900">Treatments:</span> {(place as any).treatments || 'Facial & Beauty Services'}
                    </p>
                    {(() => {
                        const languagesValue = (place as any).languages;
                        const languages = languagesValue 
                            ? (typeof languagesValue === 'string' 
                                ? (languagesValue as string).split(',').map((l: string) => l.trim()) 
                                : languagesValue)
                            : [];
                        
                        // Debug logging
                        logger.debug('🏠 FacialPlaceHomeCard languages debug:', {
                            placeName: place.name,
                            languagesValue,
                            parsedLanguages: languages,
                            languagesType: typeof languagesValue
                        });
                        
                        if (!languages || !Array.isArray(languages) || languages.length === 0) {
                            // Fallback: show Indonesian and English flags if no languages specified
                            return (
                                <div className="flex items-center gap-1">
                                    <span className="flex items-center gap-0.5 text-xs">
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
                                        <span className="text-xs font-medium text-gray-700">ID</span>
                                    </span>
                                    <span className="flex items-center gap-0.5 text-xs">
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
                                        <span className="text-xs font-medium text-gray-700">EN</span>
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
                                {languages.slice(0, 2).map(lang => {
                                    const langKey = lang.toLowerCase();
                                    const langInfo = langMap[langKey] || {flag: '🌐', name: lang.slice(0, 2).toUpperCase()};
                                    return (
                                        <span key={lang} className="flex items-center gap-0.5 text-xs">
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
                                            <span className="text-xs font-medium text-gray-700">{langInfo.name}</span>
                                        </span>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Description (After Treatments like profile card) */}
            {place.description && (
                <div className="mx-4 mb-3">
                    <p className="text-sm text-gray-900 leading-5 break-words whitespace-normal line-clamp-2 text-left font-medium">
                        {place.description}
                    </p>
                </div>
            )}

            {/* Price containers – same design as beautician home service: Treatments Trending, fixed prices, list layout */}
            <div className="mx-4 mb-4">
                <style>{`
                    @keyframes beautician-glow-card {
                      0%, 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.35); }
                      50% { box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.2), 0 0 12px 2px rgba(249, 115, 22, 0.15); }
                    }
                    .beautician-card-container-highlight {
                      border-color: rgb(249 115 22);
                      box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.25), 0 0 16px 4px rgba(249, 115, 22, 0.12);
                      animation: beautician-glow-card 2.5s ease-in-out infinite;
                    }
                `}</style>
                <div className="text-center mb-3">
                    <h3 className="text-gray-800 font-bold text-sm tracking-wide inline-flex items-center gap-1.5 justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-orange-500" aria-hidden />
                        Treatments Trending
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">Fixed prices • View profile to book</p>
                </div>
                <div className="space-y-2">
                    {[
                        { label: '60 min', minutes: 60, key: '60' as const },
                        { label: '90 min', minutes: 90, key: '90' as const },
                        { label: '120 min', minutes: 120, key: '120' as const },
                    ].map(({ label, minutes, key }) => (
                        <div
                            key={key}
                            className="beautician-card-container-highlight w-full text-left rounded-xl border-2 overflow-hidden flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-orange-50/80 border-orange-400"
                            role="presentation"
                        >
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-gray-900 mb-0.5 line-clamp-2">{label}</h4>
                                <p className="text-[10px] text-gray-600">
                                    Estimated time: {minutes} minutes
                                </p>
                                <p className="text-xs font-semibold text-gray-800 mt-0.5">
                                    Price: {pricing[key] > 0 ? `IDR ${formatPrice(pricing[key])} (fixed)` : 'Call'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-center text-[10px] text-gray-500 mt-2">
                    Professional rates • Verified profile
                </p>
            </div>

            {/* View Profile + Menu prices — two buttons side by side under price containers */}
            <div className="mx-4 mb-3 flex gap-2">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (typeof onClick === 'function') onClick(place);
                    }}
                    className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                    aria-label="View profile"
                >
                    View Profile
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenuSlider(true);
                    }}
                    className="flex-1 py-2.5 rounded-lg font-semibold text-sm border-2 border-amber-500 text-amber-600 hover:bg-amber-50 transition-colors"
                    aria-label="Menu prices"
                >
                    Menu prices
                </button>
            </div>

            {/* Menu slider – slide-up panel to view place menu (60/90/120) */}
            {showMenuSlider && (
                <div className="fixed inset-0 z-[10001] flex flex-col justify-end" role="dialog" aria-modal="true" aria-label="Menu prices">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowMenuSlider(false)} aria-hidden />
                    <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-2xl z-10">
                            <h3 className="text-lg font-bold text-gray-900">{place.name} – Menu</h3>
                            <button type="button" onClick={() => setShowMenuSlider(false)} className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center" aria-label="Close">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                            <p className="text-sm text-gray-600">{(place as any).treatments || 'Facial & Beauty Services'}</p>
                            {[{ label: '60 min', key: '60' as const }, { label: '90 min', key: '90' as const }, { label: '120 min', key: '120' as const }].map(({ label, key }) => (
                                <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-orange-50 border border-orange-200">
                                    <span className="font-medium text-gray-900">{label}</span>
                                    <span className="text-sm font-semibold text-gray-800">{pricing[key] > 0 ? `IDR ${formatPrice(pricing[key])}` : 'Contact'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer: distance only */}
            <div className="mx-4 pb-4 flex items-center">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    {userLocation && (
                        <DistanceDisplay {...{} as any} userLocation={userLocation}
                            targetLocation={{
                                lat: parseFloat(String((place as any).lat || (place as any).latitude || 0)),
                                lng: parseFloat(String((place as any).lng || (place as any).longitude || 0))
                            }}
                            className="text-slate-600"
                        />
                    )}
                </div>
            </div>
        </div>

        {/* Share Popup */}
        <SocialSharePopup
            isOpen={showSharePopup}
            onClose={() => setShowSharePopup(false)}
            title={place.name || "Facial Clinic"}
            description={place.description || "Professional beauty and facial treatments"}
            url={shortShareUrl}
            type="facial"
        />
    </div>
    );
};

export default FacialPlaceHomeCard;