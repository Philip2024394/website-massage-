import React, { useState } from 'react';
import { Sparkles, FingerprintPattern, Info } from 'lucide-react';
import type { Therapist } from '../../types';
import { isDiscountActive, getCheapestServiceByTotalPrice } from '../../utils/therapistCardHelpers';
import PriceCardInfoPopover from '../../components/PriceCardInfoPopover';
import { useTherapistDisplayImage } from '../../utils/therapistImageUtils';

interface TherapistPricingGridProps {
    pricing: { '60': number; '90': number; '120': number };
    therapist: Therapist;
    displayRating: string;
    animatedPriceIndex: number | null;
    formatPrice: (price: number | string) => string;
    getDynamicSpacing: (large: string, medium: string, small: string, descLength: number) => string;
    translatedDescriptionLength: number;
    menuData?: any[]; // Menu data to determine service name
    /** When set, price containers are selectable; selected key shows fingerprint and drives Book Now heartbeat (same as massage city places). */
    selectedPriceKey?: '60' | '90' | '120' | null;
    onSelectPriceKey?: (key: '60' | '90' | '120' | null) => void;
    onPriceClick?: () => void; // Callback to open price modal (legacy: when no onSelectPriceKey)
    /** Language for info popover (what to expect). */
    language?: 'en' | 'id';
}

const DEFAULT_PRICE_IMAGE = 'https://ik.imagekit.io/7grri5v7d/hotel%20massage%20indoniseas.png?updatedAt=1761154913720';

const TherapistPricingGrid: React.FC<TherapistPricingGridProps> = ({
    pricing,
    therapist,
    displayRating,
    animatedPriceIndex,
    formatPrice,
    getDynamicSpacing,
    translatedDescriptionLength,
    menuData = [],
    selectedPriceKey = null,
    onSelectPriceKey,
    onPriceClick,
    language = 'en'
}) => {
    console.log('🧱 TherapistPricingGrid rendered');

    const displayImage = useTherapistDisplayImage(therapist);

    // Determine service name based on menu data
    const getServiceName = (): string => {
        console.log(`🏷️ Determining service name for ${therapist.name}:`, { 
            hasMenuData: !!menuData, 
            menuLength: menuData?.length || 0,
            menuItems: menuData?.map(item => ({ 
                name: item.name || item.serviceName || item.title,
                price60: item.price60,
                hasPricing: !!(item.price60 && item.price90 && item.price120)
            }))
        });

        // If no menu data or empty menu, default to "Traditional Massage"
        if (!menuData || menuData.length === 0) {
            console.log(`🏷️ No menu data found for ${therapist.name}, using Traditional Massage`);
            return 'Traditional Massage';
        }

        // Only use menu items with complete 3-duration pricing (60/90/120)
        const servicesWithFullPricing = menuData.filter(item => {
            const hasAll = item.price60 && item.price90 && item.price120;
            const valid60 = Number(item.price60) > 0;
            const valid90 = Number(item.price90) > 0;
            const valid120 = Number(item.price120) > 0;
            return hasAll && valid60 && valid90 && valid120;
        });

        console.log(`🏷️ Found ${servicesWithFullPricing.length} services with full pricing for ${therapist.name}`);

        if (servicesWithFullPricing.length === 0) {
            // No services with complete pricing found, use default
            console.log(`🏷️ No services with complete pricing found for ${therapist.name}, using Traditional Massage`);
            return 'Traditional Massage';
        }

        // Same as card: service with lowest total (60+90+120) so name matches the 3 containers
        const cheapestService = getCheapestServiceByTotalPrice(servicesWithFullPricing);
        if (!cheapestService) {
            console.log(`🏷️ No cheapest service for ${therapist.name}, using Traditional Massage fallback`);
            return 'Traditional Massage';
        }

        console.log(`🏷️ Lowest-total service for ${therapist.name}:`, cheapestService);

        // Use full massage type name
        if (cheapestService.name || cheapestService.serviceName || cheapestService.title) {
            const serviceName = cheapestService.name || cheapestService.serviceName || cheapestService.title;
            console.log(`🏷️ Service name for ${therapist.name}: "${serviceName}"`);
            return serviceName;
        }

        // Fallback to traditional
        console.log(`🏷️ No service name found for ${therapist.name}, using Traditional Massage fallback`);
        return 'Traditional Massage';
    };

    const serviceName = getServiceName();

    const [infoPopupKey, setInfoPopupKey] = useState<'60' | '90' | '120' | null>(null);
    const isId = language === 'id';

    type BadgeId = 'trending_now' | 'popular_choice' | 'most_viewed' | 'most_booked';
    const badgeLabels: Record<BadgeId, { en: string; id: string }> = {
        trending_now: { en: 'Trending Now', id: 'Tren Saat Ini' },
        popular_choice: { en: 'Popular Choice', id: 'Pilihan Populer' },
        most_viewed: { en: 'Most Viewed', id: 'Paling Banyak Dilihat' },
        most_booked: { en: 'Most Booked', id: 'Paling Banyak Dipesan' },
    };
    /** Only one badge per therapist — show on the 90 min (most popular) container. */
    const rows: { label: string; minutes: number; key: '60' | '90' | '120'; isMostPopular: boolean; badge: BadgeId; showBadge: boolean }[] = [
        { label: '60 min', minutes: 60, key: '60', isMostPopular: false, badge: 'trending_now', showBadge: false },
        { label: '90 min', minutes: 90, key: '90', isMostPopular: true, badge: 'popular_choice', showBadge: true },
        { label: '120 min', minutes: 120, key: '120', isMostPopular: false, badge: 'most_viewed', showBadge: false },
    ];

    const isSelectable = typeof onSelectPriceKey === 'function';

    const renderPrice = (key: '60' | '90' | '120') => {
        const val = Number(pricing[key]);
        if (val <= 0) return 'Contact';
        if (isDiscountActive(therapist)) {
            const discounted = Math.round(val * (1 - (therapist.discountPercentage || 0) / 100));
            return (
                <>
                    <span className="text-[10px] text-gray-500 line-through mr-1">{formatPrice(val)}</span>
                    <span>{formatPrice(discounted)}</span>
                </>
            );
        }
        return formatPrice(val);
    };

    return (
        <>
            <div className={`px-4 ${getDynamicSpacing('mt-4', 'mt-3', 'mt-2', translatedDescriptionLength)}`}>
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
                    @keyframes book-now-heartbeat {
                      0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.5); }
                      50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0.25), 0 0 16px 4px rgba(245, 158, 11, 0.3); }
                    }
                    .price-container-heartbeat {
                      animation: book-now-heartbeat 1.2s ease-in-out infinite;
                    }
                `}</style>
                <div className="text-center mb-3">
                    <h3 className="text-gray-800 font-bold text-sm tracking-wide inline-flex items-center gap-1.5 justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-orange-500" aria-hidden />
                        Treatments Trending
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                        {isSelectable ? 'Fixed prices • Select container and press Book Now' : serviceName}
                        {!isSelectable && isDiscountActive(therapist) && (
                            <span className="block mt-1 text-orange-600 font-semibold">🔥 Discounted prices displayed</span>
                        )}
                    </p>
                </div>
                <div className="space-y-2">
                    {rows.map(({ label, minutes, key, isMostPopular, badge, showBadge }) => {
                        const isSelected = isSelectable && selectedPriceKey === key;
                        const handleClick = (e: React.MouseEvent) => {
                            if (isSelectable && onSelectPriceKey) {
                                e.stopPropagation();
                                onSelectPriceKey(isSelected ? null : key);
                            } else if (onPriceClick) {
                                onPriceClick();
                            }
                        };
                        const handleKeyDown = (e: React.KeyboardEvent) => {
                            if (isSelectable && onSelectPriceKey && (e.key === 'Enter' || e.key === ' ')) {
                                e.preventDefault();
                                onSelectPriceKey(isSelected ? null : key);
                            }
                        };
                        return (
                            <div
                                key={key}
                                role={isSelectable ? 'button' : undefined}
                                tabIndex={isSelectable ? 0 : undefined}
                                onClick={handleClick}
                                onKeyDown={handleKeyDown}
                                className={`beautician-card-container-highlight w-full text-left rounded-xl border-2 overflow-hidden flex flex-row items-center gap-3 p-3 relative ${isMostPopular ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-500 ring-1 ring-amber-200' : 'bg-orange-50/80 border-amber-400'} ${isSelectable ? 'cursor-pointer select-none' : ''} ${isSelected ? 'price-container-heartbeat' : ''}`}
                            >
                                {/* 1) Thumbnail on left (starts the container) — same image shown in description popup when user taps (i) */}
                                <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 min-w-[3.5rem] min-h-[3.5rem] sm:min-w-16 sm:min-h-16 rounded-xl overflow-hidden bg-gray-100 border-2 border-amber-200">
                                    <img
                                        src={(displayImage || (therapist as any).mainImage || (therapist as any).profilePicture || DEFAULT_PRICE_IMAGE).trim() || DEFAULT_PRICE_IMAGE}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PRICE_IMAGE; }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    {/* One badge per therapist — only on the container that has showBadge (e.g. 90 min) */}
                                    {showBadge && (
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold flex-shrink-0">
                                            <Sparkles className="w-2.5 h-2.5" />
                                            {isId ? badgeLabels[badge].id : badgeLabels[badge].en}
                                        </span>
                                    </div>
                                    )}
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h4 className="text-xs font-bold text-gray-900 line-clamp-2">{serviceName} · {label}</h4>
                                    </div>
                                    <p className="text-[10px] text-gray-600">
                                        Estimated time: {minutes} minutes
                                    </p>
                                    <p className="text-xs font-semibold text-gray-800 mt-0.5 flex items-center gap-2">
                                        Price: {Number(pricing[key]) <= 0 ? 'Contact' : <>IDR {renderPrice(key)} (fixed)</>}
                                    </p>
                                </div>
                                {/* Fingerprint under the price area (lower left of container when selected) */}
                                {isSelected && (
                                    <span className="absolute bottom-2 left-2 flex items-center justify-center text-amber-600" aria-hidden>
                                        <FingerprintPattern className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.8} />
                                    </span>
                                )}
                                {/* Description popup button — smaller, lower right corner */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setInfoPopupKey(key === infoPopupKey ? null : key);
                                    }}
                                    className="absolute bottom-2 right-2 w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center hover:bg-amber-300 transition-colors shadow-sm"
                                    aria-label={isId ? 'Info sesi' : 'Session info'}
                                    title={isId ? 'Apa yang bisa Anda harapkan' : 'What to expect'}
                                >
                                    <Info className="w-3 h-3 sm:w-2.5 sm:h-2.5" strokeWidth={2.5} />
                                </button>
                            </div>
                        );
                    })}
                </div>
                <PriceCardInfoPopover
                    isOpen={infoPopupKey !== null}
                    onClose={() => setInfoPopupKey(null)}
                    duration={infoPopupKey === '60' ? 60 : infoPopupKey === '90' ? 90 : 120}
                    serviceName={serviceName}
                    isId={isId}
                    thumbnailImageUrl={(displayImage || (therapist as any).mainImage || (therapist as any).profilePicture || DEFAULT_PRICE_IMAGE).trim() || DEFAULT_PRICE_IMAGE}
                />
                <p className="text-center text-[10px] text-gray-500 mt-2">
                    Professional rates • Verified profile
                </p>
            </div>
        </>
    );
};

export default TherapistPricingGrid;
