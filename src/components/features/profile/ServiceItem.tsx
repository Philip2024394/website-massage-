import React from 'react';

interface Service {
    name: string;
    duration: string;
    price: string;
    originalPrice?: string; // For showing discounted vs original price
}

interface ServiceItemProps {
    service: Service;
    isDiscountActive?: boolean;
    discountPercentage?: number;
}

// Add CSS animations for discount effects
const discountStyles = `
@keyframes priceGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.6); }
    50% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3); }
}
`;

// Inject styles if they don't exist
if (typeof document !== 'undefined' && !document.getElementById('service-item-discount-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'service-item-discount-styles';
    styleSheet.textContent = discountStyles;
    document.head.appendChild(styleSheet);
}

/**
 * Reusable Service Item component
 * Displays a single service with duration and pricing
 * Enhanced with discount support and glow effects
 */
export const ServiceItem: React.FC<ServiceItemProps> = ({ 
    service, 
    isDiscountActive = false,
    discountPercentage = 0
}) => {
    return (
        <div className={`flex items-center justify-between py-4 px-3 border-b border-gray-200 last:border-0 rounded-lg transition-all duration-300 ${
            isDiscountActive ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300' : 'bg-white'
        }`}
        style={isDiscountActive ? {
            animation: 'priceGlow 3s ease-in-out infinite',
            boxShadow: '0 0 20px rgba(249, 115, 22, 0.6)'
        } : {}}>
            <div>
                <h4 className="font-bold text-gray-900">{service.name}</h4>
                <p className="text-sm text-gray-600">{service.duration}</p>
                {isDiscountActive && (
                    <div className="text-xs text-black font-semibold flex items-center gap-1 mt-1">
                        🔥 Discounted Price
                    </div>
                )}
            </div>
            <div className="flex flex-col items-end">
                {isDiscountActive && service.originalPrice ? (
                    <>
                        <div className="text-sm text-gray-800 line-through opacity-60">
                            {service.originalPrice}
                        </div>
                        <div className="text-amber-600 font-bold text-lg">
                            {service.price}
                        </div>
                    </>
                ) : (
                    <div className={`font-bold text-lg ${isDiscountActive ? 'text-amber-600' : 'text-amber-600'}`}>
                        {service.price}
                    </div>
                )}
            </div>
        </div>
    );
};
