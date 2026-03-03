import React, { useState } from 'react';
import { Sparkles, Eye, FingerprintPattern } from 'lucide-react';
import type { Therapist } from '../../types';
import { isDiscountActive, getCheapestServiceByTotalPrice } from '../../utils/therapistCardHelpers';
import PriceCardInfoPopover from '../../components/PriceCardInfoPopover';
import { useTherapistDisplayImage } from '../../utils/therapistImageUtils';
import { getPriceCardTitle } from '../../utils/priceCardTitle';

export type PricingService = {
    serviceName: string;
    pricing: { '60': number; '90': number; '120': number };
};

interface TherapistPricingGridProps {
    pricing: { '60': number; '90': number; '120': number };
    therapist: Therapist;
    displayRating: string;
    animatedPriceIndex: number | null;
    formatPrice: (price: number | string) => string;
    getDynamicSpacing: (large: string, medium: string, small: string, descLength: number) => string;
    translatedDescriptionLength: number;
    menuData?: any[];
    /** Up to 3 services (different massage types) to show as separate price cards. */
    services?: PricingService[];
    selectedServiceIndex?: number | null;
    onSelectServiceIndex?: (index: number | null) => void;
    selectedPriceKey?: '60' | '90' | '120' | null;
    onSelectPriceKey?: (key: '60' | '90' | '120' | null) => void;
    onPriceClick?: () => void;
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
    services: servicesProp,
    selectedServiceIndex = null,
    onSelectServiceIndex,
    selectedPriceKey = null,
    onSelectPriceKey,
    onPriceClick,
    language = 'en'
}) => {
    const displayImage = useTherapistDisplayImage(therapist);

    const getFallbackServiceName = (): string => {
        if (!menuData || menuData.length === 0) return 'Traditional Massage';
        const withFull = menuData.filter((item: any) => {
            const p60 = Number(item.price60) > 0;
            const p90 = Number(item.price90) > 0;
            const p120 = Number(item.price120) > 0;
            return p60 && p90 && p120;
        });
        if (withFull.length === 0) return 'Traditional Massage';
        const cheapest = getCheapestServiceByTotalPrice(withFull);
        if (!cheapest) return 'Traditional Massage';
        return (cheapest as any).name || (cheapest as any).serviceName || (cheapest as any).title || 'Traditional Massage';
    };

    const servicesToShow: PricingService[] =
        servicesProp && servicesProp.length > 0
            ? servicesProp.slice(0, 3)
            : [{ serviceName: getFallbackServiceName(), pricing }];

    const [infoPopup, setInfoPopup] = useState<{ cardIndex: number; duration: '60' | '90' | '120' } | null>(null);
    const isId = language === 'id';

    const badgeLabel = isId ? 'Pilihan Populer' : 'Popular Choice';
    const ROWS: { label: string; key: '60' | '90' | '120' }[] = [
        { label: '60min', key: '60' },
        { label: '90min', key: '90' },
        { label: '120min', key: '120' },
    ];

    const renderPrice = (pricingMap: { '60': number; '90': number; '120': number }, key: '60' | '90' | '120') => {
        const val = Number(pricingMap[key]);
        if (val <= 0) return (isId ? 'Hubungi' : 'Contact');
        if (isDiscountActive(therapist)) {
            const discounted = Math.round(val * (1 - (therapist.discountPercentage || 0) / 100));
            return (
                <span className="inline-flex flex-col items-center leading-tight whitespace-nowrap">
                    <span>{formatPrice(discounted)}</span>
                    <span className="text-[10px] text-gray-500 line-through">{formatPrice(val)}</span>
                </span>
            );
        }
        return <span className="whitespace-nowrap">{formatPrice(val)}</span>;
    };

    const isSelectable = (onSelectServiceIndex != null && servicesToShow.length > 1) || onSelectPriceKey != null;

    return (
        <>
            <div className={`px-2 sm:px-4 overflow-visible ${getDynamicSpacing('mt-4', 'mt-3', 'mt-2', translatedDescriptionLength)}`}>
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
                        Trending Sessions
                    </h3>
                    <p className="text-[9px] text-gray-500 mt-0.5">Select window below and Book Now</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                        {servicesToShow.length <= 1 ? (
                            <>
                                {getPriceCardTitle(servicesToShow[0]?.serviceName, 'Service')}
                                {isDiscountActive(therapist) && (
                                    <span className="block mt-1 text-orange-600 font-semibold">🔥 Discounted prices displayed</span>
                                )}
                            </>
                        ) : (
                            isDiscountActive(therapist) && (
                                <span className="block text-orange-600 font-semibold">🔥 Discounted prices displayed</span>
                            )
                        )}
                    </p>
                </div>
                <div className="space-y-2">
                    {servicesToShow.map((svc, index) => {
                        const isSelected = servicesToShow.length > 1 ? selectedServiceIndex === index : selectedPriceKey != null;
                        const handleCardClick = () => {
                            if (!isSelectable) return;
                            if (servicesToShow.length > 1 && onSelectServiceIndex) {
                                onSelectServiceIndex(isSelected ? null : index);
                                return;
                            }
                            if (onSelectPriceKey) onSelectPriceKey(selectedPriceKey ? null : '90');
                        };
                        return (
                            <div
                                key={`price-card-${index}-${svc.serviceName}`}
                                role={isSelectable ? 'button' : undefined}
                                tabIndex={isSelectable ? 0 : undefined}
                                onClick={(e) => {
                                    if (isSelectable && !(e.target as HTMLElement).closest('button')) {
                                        e.stopPropagation();
                                        handleCardClick();
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (isSelectable && (e.key === 'Enter' || e.key === ' ')) {
                                        e.preventDefault();
                                        handleCardClick();
                                    }
                                }}
                                className={`beautician-card-container-highlight w-full text-left rounded-xl border-2 p-3 relative bg-orange-50/80 border-amber-400 ${isSelectable ? 'cursor-pointer select-none' : ''} ${isSelected ? 'price-container-heartbeat' : ''}`}
                            >
                                <div className="flex items-start gap-4 w-full">
                                    <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 border-2 border-amber-200">
                                        <img
                                            src={(displayImage || (therapist as any).mainImage || (therapist as any).profilePicture || DEFAULT_PRICE_IMAGE).trim() || DEFAULT_PRICE_IMAGE}
                                            alt=""
                                            className="w-full h-full object-cover rounded-lg"
                                            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PRICE_IMAGE; }}
                                        />
                                        {isSelected && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg" aria-hidden>
                                                <FingerprintPattern className="w-8 h-8 sm:w-9 sm:h-9 text-white" strokeWidth={1.8} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-[180px] overflow-visible">
                                        <div className="flex items-center gap-2 mb-2 flex-nowrap">
                                            <h4 className="text-base font-bold text-gray-800 truncate" title={getPriceCardTitle(svc.serviceName, 'Service')}>{getPriceCardTitle(svc.serviceName, 'Service')}</h4>
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold flex-shrink-0">
                                                <Sparkles className="w-2.5 h-2.5" />
                                                {badgeLabel}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-[auto_auto_auto] gap-x-2 justify-items-center text-center mb-1">
                                            {ROWS.map(({ label, key }) => (
                                                <span key={`label-${key}`} className="text-[10px] sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                                                    {label}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-[auto_auto_auto] gap-x-2 justify-items-center text-center">
                                            {ROWS.map(({ key }) => (
                                                <p key={`price-${key}`} className="text-xs sm:text-sm text-gray-800 font-semibold whitespace-nowrap">
                                                    {renderPrice(svc.pricing, key)}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setInfoPopup(infoPopup?.cardIndex === index ? null : { cardIndex: index, duration: '90' });
                                    }}
                                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors shadow-sm"
                                    aria-label={isId ? 'Info sesi' : 'Session info'}
                                    title={isId ? 'Apa yang bisa Anda harapkan' : 'What to expect'}
                                >
                                    <Eye className="w-3 h-3" strokeWidth={2} />
                                </button>
                            </div>
                        );
                    })}
                </div>
                {infoPopup != null && servicesToShow[infoPopup.cardIndex] && (
                    <PriceCardInfoPopover
                        isOpen={true}
                        onClose={() => setInfoPopup(null)}
                        duration={infoPopup.duration === '60' ? 60 : infoPopup.duration === '90' ? 90 : 120}
                        serviceName={getPriceCardTitle(servicesToShow[infoPopup.cardIndex].serviceName, 'Service')}
                        isId={isId}
                        thumbnailImageUrl={(displayImage || (therapist as any).mainImage || (therapist as any).profilePicture || DEFAULT_PRICE_IMAGE).trim() || DEFAULT_PRICE_IMAGE}
                    />
                )}
                <p className="text-center text-[10px] text-gray-500 mt-2">
                    Professional rates • Verified profile
                </p>
            </div>
        </>
    );
};

export default TherapistPricingGrid;
