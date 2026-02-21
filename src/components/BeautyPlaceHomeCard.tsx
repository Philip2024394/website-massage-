import React, { useState, useEffect } from 'react';
import type { Place, Analytics } from '../types';
import { getDisplayRating, formatRating } from '../utils/ratingUtils';
import DistanceDisplay from './DistanceDisplay';
import { bookingService } from '../lib/bookingService';
import { isDiscountActive } from '../utils/therapistCardHelpers';
import SocialSharePopup from './SocialSharePopup';
import { shareLinkService } from '../lib/services/shareLinkService';
import { Share2 } from 'lucide-react';
import { logger } from '../utils/logger';
import { VERIFIED_BADGE_IMAGE_URL } from '../constants/appConstants';
import { ViewProfileButton } from './ViewProfileButton';

const DEFAULT_BEAUTY_IMG = 'https://ik.imagekit.io/7grri5v7d/hait%20styles%20browns.png';

interface BeautyPlaceHomeCardProps {
    place: Place;
    onClick: (place: Place) => void;
    onIncrementAnalytics: (metric: keyof Analytics) => void;
    userLocation?: { lat: number; lng: number } | null;
}

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20">
        <path fill="currentColor" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const BeautyPlaceHomeCard: React.FC<BeautyPlaceHomeCardProps> = ({
    place,
    onClick,
    onIncrementAnalytics,
    userLocation,
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

    const [showSharePopup, setShowSharePopup] = useState(false);
    const [shortShareUrl, setShortShareUrl] = useState<string>('');

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
            } catch {}
        };
        loadBookingsCount();
    }, [place]);

    useEffect(() => {
        const generateShareUrl = async () => {
            try {
                const placeId = String((place as any).id || (place as any).$id || '');
                if (!placeId) return;
                const shareLink = await shareLinkService.getByEntity('beauty', placeId);
                if (shareLink) {
                    setShortShareUrl(`https://www.indastreetmassage.com/share/${shareLink.shortId}`);
                } else {
                    setShortShareUrl(`https://www.indastreetmassage.com/beauty/${(place.name || '').replace(/\s+/g, '-').toLowerCase()}`);
                }
            } catch {
                setShortShareUrl(`https://www.indastreetmassage.com/beauty/${(place.name || '').replace(/\s+/g, '-').toLowerCase()}`);
            }
        };
        generateShareUrl();
    }, [place]);

    const getPricing = () => {
        const hasValid = (place.price60 && parseInt(String(place.price60)) > 0) || (place.price90 && parseInt(String(place.price90)) > 0) || (place.price120 && parseInt(String(place.price120)) > 0);
        if (hasValid) {
            return {
                "60": place.price60 ? parseInt(String(place.price60)) * 1000 : 0,
                "90": place.price90 ? parseInt(String(place.price90)) * 1000 : 0,
                "120": place.price120 ? parseInt(String(place.price120)) * 1000 : 0,
            };
        }
        return { "60": 0, "90": 0, "120": 0 };
    };

    const pricing = getPricing();
    const rawRating = getDisplayRating(place.rating, place.reviewCount);
    const effectiveRating = rawRating > 0 ? rawRating : 4.8;
    const displayRating = formatRating(effectiveRating);

    const formatPrice = (price: number) => {
        if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
        if (price >= 1000) return `${(price / 1000).toFixed(0)}K`;
        return price.toLocaleString('id-ID');
    };

    const statusStr = String((place as any).availability || place.status || 'Busy').trim().toLowerCase();
    const statusStyle = statusStr === 'available'
        ? { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Available', isAvailable: true }
        : { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Busy', isAvailable: false };

    const getInitialBookingCount = (placeId: string): number => {
        let hash = 0;
        for (let i = 0; i < placeId.length; i++) {
            hash = ((hash << 5) - hash) + placeId.charCodeAt(i);
            hash = hash & hash;
        }
        return 20 + (Math.abs(hash) % 31);
    };

    const joinedDateRaw = place.membershipStartDate || place.activeMembershipDate || (place as any).$createdAt;
    const joinedDisplay = (() => {
        if (!joinedDateRaw) return '—';
        try {
            const d = new Date(joinedDateRaw);
            return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB');
        } catch {
            return '—';
        }
    })();

    const displayBookingsCount = bookingsCount === 0 ? getInitialBookingCount(String(place.id || place.$id || '')) : bookingsCount;

    const mainImg = (place as any).mainImage || (place as any).profilePicture || (place as any).image || DEFAULT_BEAUTY_IMG;
    const treatmentsLabel = (place as any).treatments || (place as any).beautyServices || 'Nails, Hair & Beauty';

    return (
        <div className="relative">
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
                className="bg-white rounded-2xl overflow-visible border border-slate-200 hover:border-pink-200 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
                <div className="relative h-56 overflow-visible bg-transparent rounded-t-2xl" style={{ minHeight: '224px' }}>
                    <img
                        src={mainImg}
                        alt={place.name || 'Beauty Salon'}
                        className="w-full h-full object-cover transition-transform duration-300 rounded-t-2xl group-hover:scale-105"
                        style={{ aspectRatio: '400/224', minHeight: '224px' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_BEAUTY_IMG; }}
                    />
                    <div className="absolute top-3 left-3 shadow-lg flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5">
                        <StarIcon className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-bold text-white">{displayRating}</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                        {displayBookingsCount}+ {displayBookingsCount === 1 ? 'booking' : 'bookings'}
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleShareClick(e); }}
                        className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-all z-10"
                        title="Share this salon"
                        aria-label="Share this salon"
                    >
                        <Share2 className="w-4 h-4 text-white" strokeWidth={2.5} aria-hidden />
                    </button>
                    {isDiscountActive(place as any) && (
                        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 backdrop-blur-sm animate-pulse">
                            <span className="text-xs font-bold text-white">{(place as any).discountPercentage}% OFF</span>
                        </div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-pink-500/90 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-md">
                        Beauty salon · Nails, Hair, Makeup
                    </div>
                </div>

                <div className="px-4 mt-3 flex flex-col items-end">
                    <div className="flex items-center gap-1 text-xs text-black font-medium">
                        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate max-w-[200px] sm:max-w-none">
                            {place.address || place.location || (place as any).city || 'Salon location'}
                        </span>
                    </div>
                    <div className="text-xs text-pink-500 mt-1 font-medium">
                        {(place as any).city ? `Serves ${(place as any).city} area` : (place.address || place.location) ? `Serves ${(place.address || place.location || '').split(',')[0].trim() || 'this'} area` : 'View profile for location'}
                    </div>
                </div>

                <div className="px-4 -mt-[115px] pb-4 relative z-30 overflow-visible pointer-events-none">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 relative z-30">
                            <div className="w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] md:w-[120px] md:h-[120px] rounded-full overflow-hidden relative">
                                <img
                                    className="w-full h-full object-cover pointer-events-auto border-4 border-white rounded-full"
                                    src={mainImg}
                                    alt={place.name || 'Salon'}
                                    loading="lazy"
                                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_BEAUTY_IMG; }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 mt-[2px] mb-3 relative z-40">
                    <div className="mb-2 ml-[75px]">
                        <div className="flex items-center gap-2">
                            {((place as any).verifiedBadge || (place as any).isVerified || (place.bankName && place.accountName && place.accountNumber && place.ktpPhotoUrl)) && (
                                <img src={VERIFIED_BADGE_IMAGE_URL} alt="Verified" className="w-5 h-5 flex-shrink-0" title="Verified Salon" />
                            )}
                            <h3 className="text-lg font-bold text-gray-900 truncate">{place.name || 'Beauty Salon'}</h3>
                        </div>
                    </div>
                    <div className="overflow-visible flex justify-start ml-[75px]">
                        <div className={`inline-flex items-center px-2.5 rounded-full font-medium whitespace-nowrap ${statusStyle.bg} ${statusStyle.text}`} style={{ paddingTop: 0, paddingBottom: 0, lineHeight: '1', fontSize: '10px', transform: 'scaleY(0.9)' }}>
                            <span className="relative inline-flex mr-1.5" style={{ width: 32, height: 32, minWidth: 32, minHeight: 32 }}>
                                <span className={`absolute rounded-full ${statusStyle.dot} ${statusStyle.isAvailable ? '' : 'animate-pulse'} z-10`} style={{ width: 8, height: 8, left: 12, top: 12 }} />
                                {statusStyle.isAvailable && (
                                    <>
                                        <span className="absolute rounded-full bg-green-400 opacity-75 animate-ping" style={{ width: 20, height: 20, left: 6, top: 6 }} />
                                        <span className="absolute rounded-full bg-green-300 opacity-50 animate-ping" style={{ width: 28, height: 28, left: 2, top: 2, animationDuration: '1.5s' }} />
                                    </>
                                )}
                            </span>
                            <span className="text-xs">{statusStyle.label}</span>
                        </div>
                    </div>
                </div>

                <div className="mx-4 mb-1">
                    <p className="text-xs text-pink-600 font-medium">
                        Nails, hair & beauty · Visit our salon
                    </p>
                </div>

                {(() => {
                    const main = (place as any).mainImage || (place as any).profilePicture || (place as any).image;
                    const extraImages: string[] = [];
                    if (Array.isArray((place as any).images)) (place as any).images.forEach((u: string) => u && extraImages.push(u));
                    const gallery = (place as any).galleryImages;
                    if (Array.isArray(gallery)) gallery.forEach((g: any) => (g?.imageUrl || g?.url) && extraImages.push(g.imageUrl || g.url));
                    const unique = Array.from(new Set([main, ...extraImages].filter(Boolean) as string[])).slice(0, 4);
                    if (unique.length === 0) return null;
                    return (
                        <div className="mx-4 mb-2">
                            <p className="text-[10px] font-semibold text-slate-600 mb-1.5">Salon photos</p>
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

                <div className="mx-4 mb-2">
                    <p className="text-xs text-gray-600 flex-shrink-0">
                        <span className="font-bold">Services:</span> {Array.isArray(treatmentsLabel) ? treatmentsLabel.join(', ') : treatmentsLabel}
                    </p>
                </div>

                {place.description && (
                    <div className="mx-4 mb-3">
                        <p className="text-sm text-gray-700 leading-5 break-words whitespace-normal line-clamp-2 text-left">
                            {place.description}
                        </p>
                    </div>
                )}

                <div className="mx-4 mb-4">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3">Service packages</h4>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 text-center">
                            <div className="text-xs font-medium text-pink-700 mb-1">60 min</div>
                            <div className="text-sm font-bold text-slate-900">{pricing["60"] > 0 ? formatPrice(pricing["60"]) : 'Call'}</div>
                            <div className="text-[10px] text-slate-600 mt-1">Basic</div>
                        </div>
                        <div className="bg-pink-50 border border-pink-300 rounded-lg p-3 text-center">
                            <div className="text-xs font-medium text-pink-700 mb-1">90 min</div>
                            <div className="text-sm font-bold text-slate-900">{pricing["90"] > 0 ? formatPrice(pricing["90"]) : 'Call'}</div>
                            <div className="text-[10px] text-slate-600 mt-1">Premium</div>
                        </div>
                        <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 text-center">
                            <div className="text-xs font-medium text-pink-700 mb-1">120 min</div>
                            <div className="text-sm font-bold text-slate-900">{pricing["120"] > 0 ? formatPrice(pricing["120"]) : 'Call'}</div>
                            <div className="text-[10px] text-slate-600 mt-1">Full</div>
                        </div>
                    </div>
                </div>

                <div className="mx-4 mb-3">
                    <ViewProfileButton
                        onClick={(e) => { e.stopPropagation(); onClick(place); }}
                        className="w-full px-4 py-2.5 rounded-lg"
                        ariaLabel="View profile"
                    />
                </div>

                <div className="mx-4 pb-4 flex items-center">
                    {userLocation && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <DistanceDisplay
                                {...{} as any}
                                userLocation={userLocation}
                                targetLocation={{
                                    lat: parseFloat(String((place as any).lat || (place as any).latitude || 0)),
                                    lng: parseFloat(String((place as any).lng || (place as any).longitude || 0)),
                                }}
                                className="text-slate-600"
                            />
                        </div>
                    )}
                </div>
            </div>

            <SocialSharePopup
                isOpen={showSharePopup}
                onClose={() => setShowSharePopup(false)}
                title={place.name || 'Beauty Salon'}
                description={place.description || 'Nails, hair & beauty services'}
                url={shortShareUrl}
                type="facial"
            />
        </div>
    );
};

export default BeautyPlaceHomeCard;
