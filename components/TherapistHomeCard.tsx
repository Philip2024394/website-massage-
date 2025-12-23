import React, { useState, useEffect } from 'react';
import type { Therapist, Analytics } from '../types';
import { getDisplayRating, getDisplayReviewCount, formatRating } from '../utils/ratingUtils';
import DistanceDisplay from './DistanceDisplay';
import { bookingService } from '../lib/appwriteService';
import { isDiscountActive } from '../utils/therapistCardHelpers';

interface TherapistHomeCardProps {
    therapist: Therapist;
    onClick: (therapist: Therapist) => void;
    onIncrementAnalytics: (metric: keyof Analytics) => void;
    userLocation?: { lat: number; lng: number } | null;
}

const StarIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20">
        <path fill="currentColor" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const TherapistHomeCard: React.FC<TherapistHomeCardProps> = ({ 
    therapist, 
    onClick,
    onIncrementAnalytics,
    userLocation
}) => {
    const [bookingsCount, setBookingsCount] = useState<number>(() => {
        try {
            if ((therapist as any).analytics) {
                const parsed = JSON.parse((therapist as any).analytics);
                if (parsed && typeof parsed.bookings === 'number') return parsed.bookings;
            }
        } catch {}
        return 0;
    });

    useEffect(() => {
        const loadBookingsCount = async () => {
            try {
                const providerId = String((therapist as any).id || (therapist as any).$id || '');
                if (!providerId) return;
                
                const count = await bookingService.getBookingsCount(providerId, 'therapist');
                setBookingsCount(count);
            } catch (error) {
                console.error('Failed to load bookings count:', error);
            }
        };

        loadBookingsCount();
    }, [therapist]);

    // Parse pricing
    const getPricing = () => {
        const hasValidSeparateFields = (
            (therapist.price60 && parseInt(therapist.price60) > 0) ||
            (therapist.price90 && parseInt(therapist.price90) > 0) ||
            (therapist.price120 && parseInt(therapist.price120) > 0)
        );

        if (hasValidSeparateFields) {
            return {
                "60": therapist.price60 ? parseInt(therapist.price60) * 1000 : 0,
                "90": therapist.price90 ? parseInt(therapist.price90) * 1000 : 0,
                "120": therapist.price120 ? parseInt(therapist.price120) * 1000 : 0
            };
        }
        
        return { "60": 0, "90": 0, "120": 0 };
    };

    const pricing = getPricing();

    const rawRating = getDisplayRating(therapist.rating, therapist.reviewCount);
    const effectiveRating = rawRating > 0 ? rawRating : 4.8;
    const displayRating = formatRating(effectiveRating);
    const displayReviewCount = getDisplayReviewCount(therapist.reviewCount);

    const formatPrice = (price: number) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `${(price / 1000).toFixed(0)}K`;
        }
        return price.toLocaleString('id-ID');
    };

    // Get status - map any status value to valid AvailabilityStatus
    const getStatusStyles = () => {
        const statusStr = String((therapist as any).availability || therapist.status || 'Offline');
        
        if (statusStr === 'Available') {
            return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Available' };
        } else if (statusStr === 'Busy') {
            return { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Busy' };
        }
        return { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', label: 'Offline' };
    };

    const statusStyle = getStatusStyles();

    // Generate consistent fake booking count for new therapists (18-26)
    const getInitialBookingCount = (therapistId: string): number => {
        let hash = 0;
        for (let i = 0; i < therapistId.length; i++) {
            hash = ((hash << 5) - hash) + therapistId.charCodeAt(i);
            hash = hash & hash;
        }
        return 18 + (Math.abs(hash) % 9);
    };

    const joinedDateRaw = therapist.membershipStartDate || therapist.activeMembershipDate || (therapist as any).$createdAt;
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

    const displayBookingsCount = bookingsCount === 0 ? getInitialBookingCount(String(therapist.id || therapist.$id || '')) : bookingsCount;

    return (
        <div className="relative">
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
                        localStorage.setItem('selectedPortalType', 'massage_therapist');
                        localStorage.setItem('selected_membership_plan', 'pro');
                        window.location.href = '/therapist-portal';
                    }}
                    className="text-[11px] text-green-600 font-semibold flex items-center gap-1 hover:text-green-700 hover:underline transition-colors cursor-pointer"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Therapist Join Free
                </button>
                <span className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Orders: {displayBookingsCount}
                </span>
            </div>
            
            <div 
                onClick={() => {
                    onClick(therapist);
                    onIncrementAnalytics('detailViews');
                }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
            {/* Image Container */}
            <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                    src={(therapist as any).mainImage || (therapist as any).profilePicture || '/default-avatar.jpg'}
                    alt={therapist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.jpg';
                    }}
                />

                {/* Star Rating Badge - Top Left */}
                <div className="absolute top-3 left-3 shadow-lg flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <StarIcon className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-bold text-white">{displayRating}</span>
                    <span className="text-xs text-gray-300">({displayReviewCount})</span>
                </div>

                {/* Premium Verified Badge - Left side under star rating */}
                {(() => {
                    // Check if premium member or verified
                    const isPremium = therapist.membershipTier === 'premium' || 
                                    therapist.isVerified || 
                                    (therapist as any).verified || 
                                    (therapist as any).verificationBadge === 'verified';
                    
                    return isPremium && (
                        <div className="absolute top-16 left-3 z-20">
                            <img 
                                src="https://ik.imagekit.io/7grri5v7d/indastreet_verfied-removebg-preview.png?updatedAt=1764750953473"
                                alt="Verified Badge"
                                className="w-8 h-8 drop-shadow-lg"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    );
                })()}

                {/* Orders Badge - Top Right */}
                {bookingsCount > 0 && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm">
                        <span className="text-xs font-bold text-white">{bookingsCount}+ Orders</span>
                    </div>
                )}

                {/* Discount Badge - Bottom Center */}
                {isDiscountActive(therapist) && (
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 backdrop-blur-sm animate-pulse">
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                            🔥 Discount Active
                        </span>
                    </div>
                )}
            </div>

            {/* Profile Section - Similar to MassagePlaceCard */}
            <div className="px-4 -mt-8 sm:-mt-12 pb-4 relative z-10">
                <div className="flex items-start gap-3">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                        <div className="relative w-24 h-24">
                            <img 
                                className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg bg-gray-100 aspect-square" 
                                src={(therapist as any).profilePicture || (therapist as any).mainImage || '/default-avatar.jpg'}
                                alt={therapist.name}
                                style={{ width: '96px', height: '96px' }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/default-avatar.jpg';
                                }}
                            />
                        </div>
                    </div>
                    
                    {/* Name and Status Column */}
                    <div className="flex-1 pt-12 sm:pt-14 pb-3 overflow-visible">
                        {/* Name and Location - Same line with name on left, location on right */}
                        <div className="mb-1">
                            <div className="flex items-center justify-between gap-2 mb-1 mt-4">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate flex-shrink-0">
                                    {therapist.name}
                                </h3>
                                <div className="flex items-center gap-1 text-gray-600 flex-shrink-0">
                                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-xs sm:text-xs truncate">{(therapist.city || therapist.location || 'Bali').split(',')[0].trim()}</span>
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

            {/* Client Preference - Menerima with Languages on same line (After profile section like profile card) */}
            <div className="mx-4 mb-2">
                <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-600 flex-shrink-0">
                        <span className="font-bold">Menerima:</span> {(therapist as any).clientPreference || 'Pria / Wanita'}
                    </p>
                    {(() => {
                        const languages = therapist.languages 
                            ? (typeof therapist.languages === 'string' 
                                ? therapist.languages.split(',').map(l => l.trim()) 
                                : therapist.languages)
                            : [];
                        
                        if (!languages || !Array.isArray(languages) || languages.length === 0) return null;
                        
                        // Language mapping with flags
                        const langMap: Record<string, {flag: string, name: string}> = {
                            'english': {flag: '🇬🇧', name: 'EN'},
                            'indonesian': {flag: '🇮🇩', name: 'ID'},
                            'mandarin': {flag: '🇨🇳', name: 'ZH'},
                            'japanese': {flag: '🇯🇵', name: 'JP'},
                            'korean': {flag: '🇰🇷', name: 'KR'},
                            'thai': {flag: '🇹🇭', name: 'TH'},
                            'vietnamese': {flag: '🇻🇳', name: 'VI'},
                            'french': {flag: '🇫🇷', name: 'FR'},
                            'german': {flag: '🇩🇪', name: 'DE'},
                            'spanish': {flag: '🇪🇸', name: 'ES'},
                            'portuguese': {flag: '🇵🇹', name: 'PT'},
                            'italian': {flag: '🇮🇹', name: 'IT'},
                            'russian': {flag: '🇷🇺', name: 'RU'},
                            'arabic': {flag: '🇸🇦', name: 'AR'},
                            'hindi': {flag: '🇮🇳', name: 'HI'},
                            // Language codes for backward compatibility
                            'en': {flag: '🇬🇧', name: 'EN'},
                            'id': {flag: '🇮🇩', name: 'ID'},
                            'zh': {flag: '🇨🇳', name: 'ZH'},
                            'ja': {flag: '🇯🇵', name: 'JP'},
                            'ko': {flag: '🇰🇷', name: 'KR'},
                            'th': {flag: '🇹🇭', name: 'TH'},
                            'vi': {flag: '🇻🇳', name: 'VI'},
                            'fr': {flag: '🇫🇷', name: 'FR'},
                            'de': {flag: '🇩🇪', name: 'DE'},
                            'es': {flag: '🇪🇸', name: 'ES'},
                            'pt': {flag: '🇵🇹', name: 'PT'},
                            'it': {flag: '🇮🇹', name: 'IT'},
                            'ru': {flag: '🇷🇺', name: 'RU'},
                            'ar': {flag: '🇸🇦', name: 'AR'},
                            'hi': {flag: '🇮🇳', name: 'HI'}
                        };
                        
                        return (
                            <div className="flex items-center gap-1">
                                {languages.slice(0, 2).map(lang => {
                                    const langKey = lang.toLowerCase();
                                    const langInfo = langMap[langKey] || {flag: '🌐', name: lang.slice(0, 2).toUpperCase()};
                                    return (
                                        <span key={lang} className="flex items-center gap-0.5 text-xs">
                                            <span className="text-xs">{langInfo.flag}</span>
                                            <span className="text-xs font-medium text-gray-700">{langInfo.name}</span>
                                        </span>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Description (After Menerima like profile card) */}
            {therapist.description && (
                <div className="mx-4 mb-3">
                    <p className="text-sm text-gray-700 leading-5 break-words whitespace-normal line-clamp-2 text-left">
                        {therapist.description}
                    </p>
                </div>
            )}

            {/* Content */}
            <div className="px-4 pb-4">
                {/* Pricing */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {pricing["60"] > 0 && (
                        <div className="text-center p-2 bg-gray-200 rounded-lg min-w-0">
                            <div className="text-xs text-gray-600 mb-1">60 min</div>
                            <div className="text-xs sm:text-sm font-bold text-gray-900 break-words">Rp {formatPrice(pricing["60"])}</div>
                        </div>
                    )}
                    {pricing["90"] > 0 && (
                        <div className="text-center p-2 bg-gray-200 rounded-lg min-w-0">
                            <div className="text-xs text-gray-600 mb-1">90 min</div>
                            <div className="text-xs sm:text-sm font-bold text-gray-900 break-words">Rp {formatPrice(pricing["90"])}</div>
                        </div>
                    )}
                    {pricing["120"] > 0 && (
                        <div className="text-center p-2 bg-gray-200 rounded-lg min-w-0">
                            <div className="text-xs text-gray-600 mb-1">120 min</div>
                            <div className="text-xs sm:text-sm font-bold text-gray-900 break-words">Rp {formatPrice(pricing["120"])}</div>
                        </div>
                    )}
                </div>

                {/* View Profile Button */}
                <button className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all">
                    View Profile
                </button>
            </div>
            </div>
        </div>
    );
};

export default TherapistHomeCard;
