/**
 * PlacePricing Component
 * 
 * Extracted from MassagePlaceCard.tsx as part of Phase 3 modularization.
 * Handles the pricing grid display and booking action buttons.
 * 
 * Features:
 * - 3-column pricing grid (60/90/120 min)
 * - Discount pricing with strikethrough
 * - Star rating badges on price cells
 * - Book Now and Schedule buttons
 * - Animated price rim effects for discounts
 */

import React, { useState } from 'react';
import { BookNowButton } from '../../components/BookNowButton';
import { isDiscountActive, getDynamicSpacing } from '../../constants/cardConstants';
import type { Analytics } from '../../types';
import PriceCardInfoPopover from '../../components/PriceCardInfoPopover';
import { Info, Sparkles } from 'lucide-react';
import { getPriceCardTitle } from '../../utils/priceCardTitle';

interface PlacePricingProps {
    place: any;
    pricing: {
        "60": number;
        "90": number;
        "120": number;
    };
    displayRating: number;
    formatPrice: (price: number) => string;
    t: any;
    addNotification: (type: string, title: string, message: string, options?: any) => void;
    onIncrementAnalytics: (metric: keyof Analytics) => void;
    /** Language for info popover (what to expect). */
    language?: 'en' | 'id';
    /** Optional menu data: when 3+ items with full 60/90/120 pricing, show 3 price containers (different massage types). */
    menuData?: any[];
}

const PlacePricing: React.FC<PlacePricingProps> = ({
    place,
    pricing,
    displayRating,
    formatPrice,
    t,
    addNotification,
    onIncrementAnalytics,
    language = 'en',
    menuData = [],
}) => {
    const [infoPopup, setInfoPopup] = useState<{ cardIndex: number; duration: '60' | '90' | '120' } | null>(null);
    const isId = language === 'id';
    const defaultServiceName = (place as any)?.serviceType || 'Service';
    const DEFAULT_PRICE_IMAGE = 'https://ik.imagekit.io/7grri5v7d/hotel%20massage%20indoniseas.png?updatedAt=1761154913720';
    const thumbnailUrl = (place as any)?.mainImage ?? (place as any)?.profilePicture ?? (place as any)?.imageUrl ?? DEFAULT_PRICE_IMAGE;
    const badgeLabel = isId ? 'Pilihan Populer' : 'Popular Choice';

    type ServiceItem = { serviceName: string; pricing: { '60': number; '90': number; '120': number } };
    const servicesToShow: ServiceItem[] = (() => {
        const withFull = (menuData || []).filter((item: any) => {
            const p60 = Number(item.price60 ?? item.price_60) > 0;
            const p90 = Number(item.price90 ?? item.price_90) > 0;
            const p120 = Number(item.price120 ?? item.price_120) > 0;
            return p60 && p90 && p120;
        });
        if (withFull.length >= 1) {
            return withFull.slice(0, 3).map((item: any) => {
                const raw60 = Number(item.price60 ?? item.price_60 ?? 0);
                const raw90 = Number(item.price90 ?? item.price_90 ?? 0);
                const raw120 = Number(item.price120 ?? item.price_120 ?? 0);
                const mult = (raw60 > 0 && raw60 < 100000) ? 1000 : 1;
                return {
                    serviceName: (item.name ?? item.serviceName ?? item.title ?? defaultServiceName)?.trim() || defaultServiceName,
                    pricing: { '60': raw60 * mult, '90': raw90 * mult, '120': raw120 * mult },
                };
            });
        }
        return [{ serviceName: defaultServiceName, pricing }];
    })();

    const displayName = (name: string) => getPriceCardTitle(name, getPriceCardTitle(defaultServiceName, 'Service'));

    return (
        <>
            {/* Discounted Prices Header */}
            {isDiscountActive(place) && (
                <div className={`text-center mb-1 ${getDynamicSpacing('mt-3', 'mt-2', 'mt-1')}`}>
                    <p className="text-black font-semibold text-sm flex items-center justify-center gap-1">
                        🔥 Discounted Price's Displayed
                    </p>
                </div>
            )}

            {/* Pricing — unified layout: same as therapist. Thumbnail left, 3-col grid for times/prices so all cards align. */}
            <div className="mb-3 px-0 sm:px-1 space-y-2">
                {servicesToShow.map((svc, cardIndex) => (
                <div
                    key={`place-pricing-${cardIndex}-${String(svc.serviceName || defaultServiceName).trim()}`}
                    className={`rounded-xl border-2 py-3 pr-3 pl-1 relative transition-all duration-200 flex flex-row items-start gap-3 ${
                        isDiscountActive(place)
                            ? 'bg-amber-50/80 border-amber-400 price-rim-fade'
                            : 'border-gray-200 bg-gray-100 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setInfoPopup(infoPopup?.cardIndex === cardIndex ? null : { cardIndex, duration: '90' }); }}
                        className="absolute bottom-2 right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center hover:bg-amber-300 transition-colors shadow-sm"
                        aria-label={isId ? 'Info sesi' : 'Session info'}
                        title={isId ? 'Apa yang bisa Anda harapkan' : 'What to expect'}
                    >
                        <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2.5} />
                    </button>
                    <div className="-ml-2 sm:ml-0 flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 border-2 border-amber-200">
                        <img src={thumbnailUrl || DEFAULT_PRICE_IMAGE} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PRICE_IMAGE; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        {displayRating && cardIndex === 0 ? (
                            <div className="absolute -top-2.5 left-[3.75rem] sm:left-[4.5rem] bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md z-10">
                                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {displayRating}
                            </div>
                        ) : null}
                        <div className="flex items-center gap-2 mb-1 flex-nowrap">
                            <h4 className="text-xs font-bold text-gray-900 truncate" title={displayName(svc.serviceName)}>{displayName(svc.serviceName)}</h4>
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold flex-shrink-0">
                                <Sparkles className="w-2.5 h-2.5" />
                                {badgeLabel}
                            </span>
                        </div>
                        <div className="grid min-w-0 w-full grid-cols-3 grid-rows-2 gap-x-1 gap-y-0 items-start justify-items-center text-center">
                            <span className="text-[10px] font-semibold text-gray-700 whitespace-nowrap">60min</span>
                            <span className="text-[10px] font-semibold text-gray-700 whitespace-nowrap">90min</span>
                            <span className="text-[10px] font-semibold text-gray-700 whitespace-nowrap">120min</span>
                            {(['60', '90', '120'] as const).map((key) => (
                                <div key={key} className="text-[10px] sm:text-xs font-bold text-gray-800 whitespace-nowrap min-w-0">
                                    {svc.pricing[key] > 0 ? (isDiscountActive(place) ? (
                                        <span className="inline-flex flex-col items-center leading-tight whitespace-nowrap">
                                            <span>Rp {formatPrice(Math.round(svc.pricing[key] * (1 - (place as any).discountPercentage / 100)))}</span>
                                            <span className="text-gray-500 line-through font-normal">Rp {formatPrice(svc.pricing[key])}</span>
                                        </span>
                                    ) : (
                                        <span className="whitespace-nowrap">Rp {formatPrice(svc.pricing[key])}</span>
                                    )) : <span className="text-gray-400 font-normal">—</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                ))}
            </div>

            {infoPopup != null && servicesToShow[infoPopup.cardIndex] && (
                <PriceCardInfoPopover
                    isOpen={true}
                    onClose={() => setInfoPopup(null)}
                    duration={infoPopup.duration === '60' ? 60 : infoPopup.duration === '90' ? 90 : 120}
                    serviceName={displayName(servicesToShow[infoPopup.cardIndex].serviceName)}
                    isId={isId}
                    thumbnailImageUrl={thumbnailUrl || DEFAULT_PRICE_IMAGE}
                />
            )}

            {/* Action Buttons - Book Now & Schedule Booking (matching therapist card) */}
            <div className="flex gap-2 px-4 mt-4">
                <BookNowButton
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if ((e.target as HTMLElement).hasAttribute('data-clicking')) return;
                        (e.target as HTMLElement).setAttribute('data-clicking', 'true');
                        requestAnimationFrame(() => (e.target as HTMLElement).removeAttribute('data-clicking'));
                        console.log('🟢 Book Now button clicked - opening chat window for massage place');
                        addNotification(
                            'info',
                            'Instant Booking',
                            `Please complete booking with ${place.name} to start chatting`,
                            { duration: 4000 }
                        );
                        onIncrementAnalytics('bookings');
                    }}
                    className="w-1/2 flex items-center justify-center min-h-[48px] py-2 px-3 rounded-lg touch-manipulation"
                    ariaLabel={t?.home?.bookNow || 'Book Now'}
                />
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Prevent multiple rapid clicks
                        if ((e.target as HTMLElement).hasAttribute('data-clicking')) {
                            return;
                        }
                        (e.target as HTMLElement).setAttribute('data-clicking', 'true');
                        requestAnimationFrame(() => {
                            (e.target as HTMLElement).removeAttribute('data-clicking');
                        });
                        
                        console.log('📅 Schedule button clicked - showing notification for massage place');
                        
                        addNotification(
                            'info',
                            'Schedule Booking',
                            `Please complete booking with ${place.name} to schedule session`,
                            { duration: 4000 }
                        );
                        
                        onIncrementAnalytics('bookings');
                    }} 
                    className="w-1/2 flex items-center justify-center gap-1.5 font-bold py-4 px-3 rounded-lg transition-all duration-100 transform touch-manipulation min-h-[48px] bg-green-500 text-white hover:bg-green-600 active:bg-green-700 active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">{t?.home?.schedule || 'Schedule'}</span>
                </button>
            </div>
        </>
    );
}

export default PlacePricing;