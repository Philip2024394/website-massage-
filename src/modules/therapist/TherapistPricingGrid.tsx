import React from 'react';
import type { Therapist } from '../../types';
import { isDiscountActive } from '../../utils/therapistCardHelpers';

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

        // Find the cheapest service (based on 60-minute price)
        const cheapestService = servicesWithFullPricing.reduce((cheapest, current) => {
            const cheapestPrice = parseFloat(cheapest.price60 || '999999');
            const currentPrice = parseFloat(current.price60 || '999999');
            return currentPrice < cheapestPrice ? current : cheapest;
        });

        console.log(`🏷️ Cheapest service for ${therapist.name}:`, cheapestService);

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

            <div className="grid grid-cols-3 gap-2 text-center text-sm mt-4 px-4">
                {/* 60 min pricing */}
                <div 
                    onClick={onPriceClick}
                    className={`p-2 rounded-lg border shadow-md relative transition-all duration-500 ${
                    isDiscountActive(therapist) ? 'min-h-[95px]' : 'min-h-[75px]'
                } flex flex-col justify-center ${
                    animatedPriceIndex === 0
                        ? 'bg-gray-100 border-orange-500 border-[3px] shadow-lg scale-[1.02]'
                        : isDiscountActive(therapist)
                        ? 'bg-gray-100 border-orange-500 border-2 price-rim-fade' 
                        : 'bg-gray-100 border-gray-200'
                } ${onPriceClick ? 'cursor-pointer hover:shadow-xl hover:scale-105 active:scale-95' : ''}`}>
                    <p className="text-gray-600 text-xs mb-1 font-semibold">60 min</p>
                    {isDiscountActive(therapist) ? (
                        <>
                            <p className="text-[11px] text-gray-500 line-through mb-0.5">
                                IDR {formatPrice(Number(pricing["60"]))}
                            </p>
                            <p className="font-bold text-orange-600 text-sm leading-tight animate-pulse">
                                IDR {formatPrice(Math.round(Number(pricing["60"]) * (1 - (therapist.discountPercentage || 0) / 100)))}
                            </p>
                        </>
                    ) : (
                        <p className="font-bold text-gray-800 text-sm leading-tight">
                            IDR {formatPrice(Number(pricing["60"]))}
                        </p>
                    )}
                </div>

                {/* 90 min pricing */}
                <div 
                    onClick={onPriceClick}
                    className={`p-2 rounded-lg border shadow-md relative transition-all duration-500 ${
                    isDiscountActive(therapist) ? 'min-h-[95px]' : 'min-h-[75px]'
                } flex flex-col justify-center ${
                    animatedPriceIndex === 1
                        ? 'bg-gray-100 border-orange-500 border-[3px] shadow-lg scale-[1.02]'
                        : isDiscountActive(therapist)
                        ? 'bg-gray-100 border-orange-500 border-2 price-rim-fade' 
                        : 'bg-gray-100 border-gray-200'
                } ${onPriceClick ? 'cursor-pointer hover:shadow-xl hover:scale-105 active:scale-95' : ''}`}>
                    <p className="text-gray-600 text-xs mb-1 font-semibold">90 min</p>
                    {isDiscountActive(therapist) ? (
                        <>
                            <p className="text-[11px] text-gray-500 line-through mb-0.5">
                                IDR {formatPrice(Number(pricing["90"]))}
                            </p>
                            <p className="font-bold text-orange-600 text-sm leading-tight animate-pulse">
                                IDR {formatPrice(Math.round(Number(pricing["90"]) * (1 - (therapist.discountPercentage || 0) / 100)))}
                            </p>
                        </>
                    ) : (
                        <p className="font-bold text-gray-800 text-sm leading-tight">
                            IDR {formatPrice(Number(pricing["90"]))}
                        </p>
                    )}
                </div>
                
                {/* 120 min pricing */}
                <div 
                    onClick={onPriceClick}
                    className={`p-2 rounded-lg border shadow-md relative transition-all duration-500 ${
                    isDiscountActive(therapist) ? 'min-h-[95px]' : 'min-h-[75px]'
                } flex flex-col justify-center ${
                    animatedPriceIndex === 2
                        ? 'bg-gray-100 border-orange-500 border-[3px] shadow-lg scale-[1.02]'
                        : isDiscountActive(therapist)
                        ? 'bg-gray-100 border-orange-500 border-2 price-rim-fade' 
                        : 'bg-gray-100 border-gray-200'
                } ${onPriceClick ? 'cursor-pointer hover:shadow-xl hover:scale-105 active:scale-95' : ''}`}>
                    <p className="text-gray-600 text-xs mb-1 font-semibold">120 min</p>
                    {isDiscountActive(therapist) ? (
                        <>
                            <p className="text-[11px] text-gray-500 line-through mb-0.5">
                                IDR {formatPrice(Number(pricing["120"]))}
                            </p>
                            <p className="font-bold text-orange-600 text-sm leading-tight animate-pulse">
                                IDR {formatPrice(Math.round(Number(pricing["120"]) * (1 - (therapist.discountPercentage || 0) / 100)))}
                            </p>
                        </>
                    ) : (
                        <p className="font-bold text-gray-800 text-sm leading-tight">
                            IDR {formatPrice(Number(pricing["120"]))}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};

export default TherapistPricingGrid;
