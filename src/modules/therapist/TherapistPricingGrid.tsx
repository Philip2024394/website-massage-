import React from 'react';
import type { Therapist } from '../../types';
import { isDiscountActive, getCheapestServiceByTotalPrice } from '../../utils/therapistCardHelpers';

interface TherapistPricingGridProps {
    pricing: { '60': number; '90': number; '120': number };
    therapist: Therapist;
    displayRating: string;
    animatedPriceIndex: number | null;
    formatPrice: (price: number | string) => string;
    getDynamicSpacing: (large: string, medium: string, small: string, descLength: number) => string;
    translatedDescriptionLength: number;
    menuData?: any[]; // Menu data to determine service name
    onPriceClick?: () => void; // Callback to open price modal
}

const TherapistPricingGrid: React.FC<TherapistPricingGridProps> = ({
    pricing,
    therapist,
    displayRating,
    animatedPriceIndex,
    formatPrice,
    getDynamicSpacing,
    translatedDescriptionLength,
    menuData = [],
    onPriceClick
}) => {
    console.log('🧱 TherapistPricingGrid rendered');

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

    return (
        <>
            {/* Service Name Header */}
            <div className={`text-center mb-2 px-4 ${getDynamicSpacing('mt-4', 'mt-3', 'mt-2', translatedDescriptionLength)}`}>
                <h3 className="text-gray-800 font-bold text-base tracking-wide">
                    {serviceName}
                </h3>
            </div>

            {/* Discounted Prices Header */}
            {isDiscountActive(therapist) && (
                <div className={`text-center mb-[10px] px-4 ${getDynamicSpacing('mt-2', 'mt-2', 'mt-1', translatedDescriptionLength)}`}>
                    <p className="text-black font-semibold text-sm flex items-center justify-center gap-1">
                        🔥 Discounted Price's Displayed
                    </p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-center mt-4 px-4 min-w-0">
                {/* 60 min — same design as beauty profile price containers */}
                <div
                    role={onPriceClick ? 'button' : undefined}
                    onClick={onPriceClick}
                    className={`rounded-xl border-2 p-3 text-center min-w-0 flex flex-col justify-center transition-all duration-200 ${
                        isDiscountActive(therapist)
                            ? 'bg-amber-50/80 border-amber-400'
                            : animatedPriceIndex === 0
                                ? 'bg-amber-50/80 border-amber-400'
                                : 'border-gray-200 bg-gray-100 hover:border-gray-300 hover:bg-gray-50'
                    } ${onPriceClick ? 'cursor-pointer' : ''}`}
                >
                    <p className="text-xs text-gray-600 mb-1">60 min</p>
                    {Number(pricing["60"]) <= 0 ? (
                        <p className="text-sm font-bold text-gray-800">Contact</p>
                    ) : isDiscountActive(therapist) ? (
                        <>
                            <p className="text-[10px] text-gray-500 line-through mb-0.5">{formatPrice(Number(pricing["60"]))}</p>
                            <p className="text-sm font-bold text-gray-800">{formatPrice(Math.round(Number(pricing["60"]) * (1 - (therapist.discountPercentage || 0) / 100)))}</p>
                        </>
                    ) : (
                        <p className="text-sm font-bold text-gray-800">{formatPrice(Number(pricing["60"]))}</p>
                    )}
                </div>

                {/* 90 min */}
                <div
                    role={onPriceClick ? 'button' : undefined}
                    onClick={onPriceClick}
                    className={`rounded-xl border-2 p-3 text-center min-w-0 flex flex-col justify-center transition-all duration-200 ${
                        isDiscountActive(therapist)
                            ? 'bg-amber-50/80 border-amber-400'
                            : animatedPriceIndex === 1
                                ? 'bg-amber-50/80 border-amber-400'
                                : 'border-gray-200 bg-gray-100 hover:border-gray-300 hover:bg-gray-50'
                    } ${onPriceClick ? 'cursor-pointer' : ''}`}
                >
                    <p className="text-xs text-gray-600 mb-1">90 min</p>
                    {Number(pricing["90"]) <= 0 ? (
                        <p className="text-sm font-bold text-gray-800">Contact</p>
                    ) : isDiscountActive(therapist) ? (
                        <>
                            <p className="text-[10px] text-gray-500 line-through mb-0.5">{formatPrice(Number(pricing["90"]))}</p>
                            <p className="text-sm font-bold text-gray-800">{formatPrice(Math.round(Number(pricing["90"]) * (1 - (therapist.discountPercentage || 0) / 100)))}</p>
                        </>
                    ) : (
                        <p className="text-sm font-bold text-gray-800">{formatPrice(Number(pricing["90"]))}</p>
                    )}
                </div>

                {/* 120 min */}
                <div
                    role={onPriceClick ? 'button' : undefined}
                    onClick={onPriceClick}
                    className={`rounded-xl border-2 p-3 text-center min-w-0 flex flex-col justify-center transition-all duration-200 ${
                        isDiscountActive(therapist)
                            ? 'bg-amber-50/80 border-amber-400'
                            : animatedPriceIndex === 2
                                ? 'bg-amber-50/80 border-amber-400'
                                : 'border-gray-200 bg-gray-100 hover:border-gray-300 hover:bg-gray-50'
                    } ${onPriceClick ? 'cursor-pointer' : ''}`}
                >
                    <p className="text-xs text-gray-600 mb-1">120 min</p>
                    {Number(pricing["120"]) <= 0 ? (
                        <p className="text-sm font-bold text-gray-800">Contact</p>
                    ) : isDiscountActive(therapist) ? (
                        <>
                            <p className="text-[10px] text-gray-500 line-through mb-0.5">{formatPrice(Number(pricing["120"]))}</p>
                            <p className="text-sm font-bold text-gray-800">{formatPrice(Math.round(Number(pricing["120"]) * (1 - (therapist.discountPercentage || 0) / 100)))}</p>
                        </>
                    ) : (
                        <p className="text-sm font-bold text-gray-800">{formatPrice(Number(pricing["120"]))}</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default TherapistPricingGrid;
