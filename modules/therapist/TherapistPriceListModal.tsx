/**
 * TherapistPriceListModal Component
 * 
 * Extracted from TherapistCard.tsx as part of Phase 2 modularization.
 * Handles the full-screen price list modal with service selection and booking.
 * 
 * Features:
 * - Full-screen slide-up modal
 * - Service grid with pricing for 60/90/120 minute sessions
 * - Service selection and booking integration
 * - Fallback pricing when menu data fails to load
 * - Mobile-optimized responsive design
 */

import React from 'react';
import { StarIcon } from '../../components/therapist/TherapistIcons';

interface TherapistPriceListModalProps {
    showPriceListModal: boolean;
    setShowPriceListModal: (show: boolean) => void;
    therapist: any;
    displayRating: string;
    arrivalCountdown: string;
    formatCountdown: (time: string) => string;
    menuData: any[];
    selectedServiceIndex: number | null;
    selectedDuration: '60' | '90' | '120' | null;
    handleSelectService: (index: number, duration: '60' | '90' | '120') => void;
    setSelectedServiceIndex: (index: number) => void;
    setSelectedDuration: (duration: '60' | '90' | '120') => void;
    openBookingWithService: (therapist: any, service: any) => void;
    chatLang: string;
}

const TherapistPriceListModal: React.FC<TherapistPriceListModalProps> = ({
    showPriceListModal,
    setShowPriceListModal,
    therapist,
    displayRating,
    arrivalCountdown,
    formatCountdown,
    menuData,
    selectedServiceIndex,
    selectedDuration,
    handleSelectService,
    setSelectedServiceIndex,
    setSelectedDuration,
    openBookingWithService,
    chatLang
}) => {
    if (!showPriceListModal) return null;

    return (
        <div
            className="fixed inset-0 z-[10000] bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => {
                console.log('🔴 Modal backdrop clicked - closing');
                setShowPriceListModal(false);
            }}
        >
            <style>{`
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
            `}</style>
            <div
                className="absolute bottom-0 left-0 right-0 h-full w-full bg-white transform transition-transform duration-300 ease-out"
                style={{ animation: 'slideUp 0.3s ease-out forwards' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Orange gradient with profile & rating */}
                <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 sticky top-0">
                    <div className="flex items-center gap-3 flex-1">
                        <img
                            key={(therapist as any).profilePicture || (therapist as any).mainImage}
                            src={(therapist as any).profilePicture || (therapist as any).mainImage || '/default-avatar.jpg'}
                            alt={therapist.name}
                            className="w-11 h-11 rounded-full border-2 border-white object-cover"
                            loading="lazy"
                            decoding="async"
                            width="44"
                            height="44"
                            onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                if (!img.src.includes('default-avatar.jpg')) {
                                    console.warn(`⚠️ Failed to load modal profile image for ${therapist.name}, using fallback`);
                                    img.src = '/default-avatar.jpg';
                                }
                            }}
                        />
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">{therapist.name}</h2>
                            <div className="flex items-center gap-2 text-xs">
                                <StarIcon className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                                <span className="font-bold text-black bg-white/90 rounded px-1.5 py-0.5 shadow-sm">{displayRating}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowPriceListModal(false)}
                        className="flex items-center justify-center w-8 h-8 bg-black/70 hover:bg-black rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Pricing Header Row */}
                <div className="px-4 py-2 flex items-center justify-between">
                    <div className="text-sm sm:text-base font-bold text-gray-900">Service Prices</div>
                    <div className="flex items-center gap-2 text-[11px] sm:text-xs text-orange-800 font-semibold">
                        <span className="hidden sm:inline">Estimated Arrival • ~1 hour</span>
                        <span className="sm:hidden">Estimated Arrival • ~1h</span>
                        <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                            {formatCountdown(arrivalCountdown)}
                        </span>
                    </div>
                </div>

                {/* Price List Content - Natural scrolling */}
                <div className="flex-1 p-4 max-h-[70vh] overflow-y-auto">
                    {menuData.length > 0 ? (
                        <div className="bg-white rounded-lg border border-orange-200 overflow-hidden shadow-lg">
                            {/* Table Header - Hidden on mobile */}
                            <div className="hidden sm:grid grid-cols-12 gap-2 bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-2 text-xs font-semibold text-orange-700 border-b border-orange-200">
                                <div className="col-span-4">Service</div>
                                <div className="col-span-2 text-center">60 Min</div>
                                <div className="col-span-2 text-center">90 Min</div>
                                <div className="col-span-2 text-center">120 Min</div>
                                <div className="col-span-2 text-center">Action</div>
                            </div>

                            {/* Table Rows */}
                            <div className="divide-y divide-orange-100">
                                {menuData.map((service: any, index: number) => {
                                    const isRowSelected = selectedServiceIndex === index;

                                    return (
                                        <div key={index} className={`transition-colors ${
                                            isRowSelected ? 'bg-orange-50 border-l-4 border-orange-500' : 'hover:bg-orange-50'
                                        }`}>
                                            {/* Mobile Layout: Service name on top, prices below */}
                                            <div className="sm:hidden px-3 py-3">
                                                {/* Service Name */}
                                                <div className="mb-3">
                                                    <div className="font-medium text-sm text-gray-900">{service.serviceName || service.name || 'Service'}</div>
                                                    {service.description && (
                                                        <div className="text-xs text-gray-500 mt-1">{service.description}</div>
                                                    )}
                                                </div>

                                                {/* Price buttons in row */}
                                                <div className="grid grid-cols-8 gap-2 items-end">
                                                    {['60', '90', '120'].map((duration) => (
                                                        <div key={duration} className="col-span-2">
                                                            <div className="text-[10px] text-gray-600 text-center mb-1 font-semibold">{duration}m</div>
                                                            {service[`price${duration}`] ? (
                                                                <button
                                                                    onClick={() => handleSelectService(index, duration as '60' | '90' | '120')}
                                                                    className={`w-full px-1 py-1.5 rounded text-[10px] transition-all border-2 ${
                                                                        isRowSelected && selectedDuration === duration
                                                                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold border-transparent shadow-lg'
                                                                            : 'bg-white text-gray-800 border-orange-200 hover:border-orange-400 hover:bg-orange-50'
                                                                    }`}
                                                                >
                                                                    <span className="block truncate">
                                                                        Rp {(Number(service[`price${duration}`]) * 1000).toLocaleString('id-ID')}
                                                                    </span>
                                                                </button>
                                                            ) : (
                                                                <span className="text-xs text-gray-400 text-center block">-</span>
                                                            )}
                                                        </div>
                                                    ))}

                                                    {/* Action Button */}
                                                    <div className="col-span-2">
                                                        <div className="text-[10px] text-transparent text-center mb-1">-</div>
                                                        <button
                                                            className={`w-full px-1 py-1.5 text-[10px] font-semibold rounded-lg transition-all duration-200 ${
                                                                isRowSelected && selectedDuration
                                                                    ? 'bg-orange-600 text-white hover:bg-orange-700 cursor-pointer shadow-lg scale-105'
                                                                    : 'bg-orange-500 text-white hover:bg-orange-600 cursor-pointer'
                                                            }`}
                                                            onClick={(e) => {
                                                                if (isRowSelected && selectedDuration) {
                                                                    e.stopPropagation();
                                                                    console.log('🎯 PRICE SLIDER: User clicked "Pesan Sekarang"', {
                                                                        service: service.serviceName,
                                                                        duration: selectedDuration,
                                                                        price: service[`price${selectedDuration}`]
                                                                    });

                                                                    const priceNum = Number(service[`price${selectedDuration}`]);
                                                                    if (!isNaN(priceNum) && priceNum > 0) {
                                                                        const formattedPrice = priceNum >= 1000 
                                                                            ? `${Math.round(priceNum)}K` 
                                                                            : `${priceNum * 1000}`;

                                                                        console.log('🚀 PRICE SLIDER → Opening booking chat with pre-selected service:', {
                                                                            serviceName: service.serviceName,
                                                                            duration: selectedDuration,
                                                                            formattedPrice
                                                                        });

                                                                        openBookingWithService(
                                                                            service.serviceName,
                                                                            selectedDuration as '60' | '90' | '120',
                                                                            formattedPrice
                                                                        );

                                                                        setShowPriceListModal(false);
                                                                        setSelectedServiceIndex(null);
                                                                        setSelectedDuration(null);
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            {chatLang === 'id' ? 'Pesan' : 'Book'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Desktop/Tablet Layout: Original grid */}
                                            <div className="hidden sm:grid grid-cols-12 gap-2 px-3 py-3 items-center">
                                                {/* Service Name */}
                                                <div className="col-span-4">
                                                    <div className="font-medium text-sm text-gray-900">{service.serviceName || service.name || 'Service'}</div>
                                                    {service.description && (
                                                        <div className="text-xs text-gray-500 mt-1 truncate">{service.description}</div>
                                                    )}
                                                </div>

                                                {/* Price buttons - improved mobile width */}
                                                {['60', '90', '120'].map((duration) => (
                                                    <div key={duration} className="col-span-2 flex flex-col items-center gap-1">
                                                        {service[`price${duration}`] ? (
                                                            <button
                                                                onClick={() => handleSelectService(index, duration as '60' | '90' | '120')}
                                                                className={`w-full px-1 py-1 rounded text-xs transition-all border-2 min-w-0 ${
                                                                    isRowSelected && selectedDuration === duration
                                                                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold border-transparent shadow-lg'
                                                                        : 'bg-white text-gray-800 border-orange-200 hover:border-orange-400 hover:bg-orange-50'
                                                                }`}
                                                            >
                                                                <span className="block truncate text-xs">
                                                                    Rp {(Number(service[`price${duration}`]) * 1000).toLocaleString('id-ID')}
                                                                </span>
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">-</span>
                                                        )}
                                                    </div>
                                                ))}

                                                {/* Action Buttons */}
                                                <div className="col-span-2 text-center">
                                                <button
                                                    className={`w-full px-2 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
                                                        isRowSelected && selectedDuration
                                                            ? 'bg-orange-600 text-white hover:bg-orange-700 cursor-pointer shadow-lg scale-105'
                                                            : 'bg-orange-500 text-white hover:bg-orange-600 cursor-pointer'
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        
                                                        // If no selection yet, auto-select first available duration for this service
                                                        const availableDurations: string[] = [];
                                                        if (service.price60) availableDurations.push('60');
                                                        if (service.price90) availableDurations.push('90');
                                                        if (service.price120) availableDurations.push('120');
                                                        
                                                        console.log('🎯 PRICE SLIDER: User clicked "Pesan Sekarang"', {
                                                            serviceName: service.name || service.serviceName,
                                                            serviceIndex: index,
                                                            isRowSelected,
                                                            selectedDuration,
                                                            availableDurations,
                                                            therapistId: therapist.id,
                                                            therapistName: therapist.name
                                                        });
                                                        
                                                        if (availableDurations.length > 0) {
                                                            // If this row is already selected with a duration, proceed to booking
                                                            if (isRowSelected && selectedDuration) {
                                                                const serviceName = service.name || service.serviceName || 'Massage Service';
                                                                const servicePrice = Number(service[`price${selectedDuration}`]) * 1000;
                                                                const serviceDuration = parseInt(selectedDuration);
                                                                
                                                                console.log('🚀 PRICE SLIDER → Opening booking chat with pre-selected service:', {
                                                                    serviceName,
                                                                    duration: serviceDuration,
                                                                    price: servicePrice
                                                                });
                                                                
                                                                // Close the price list modal
                                                                setShowPriceListModal(false);
                                                                
                                                                // Open chat with pre-selected service details (skips duration selection)
                                                                openBookingWithService(therapist, {
                                                                    serviceName,
                                                                    duration: serviceDuration,
                                                                    price: servicePrice
                                                                });
                                                            } else {
                                                                // Auto-select first available duration for this service
                                                                const firstDuration = availableDurations[0] as '60' | '90' | '120';
                                                                handleSelectService(index, firstDuration);
                                                                console.log('🎯 Auto-selected:', { serviceIndex: index, duration: firstDuration });
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {isRowSelected && selectedDuration 
                                                        ? (chatLang === 'id' ? '✓ Pesan Sekarang' : '✓ Book Now')
                                                        : (chatLang === 'id' ? 'Pilih' : 'Select')
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        // Fallback pricing when menu data fails to load - use therapist's built-in pricing
                        <div className="bg-white rounded-lg border border-orange-200 overflow-hidden shadow-lg">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-2 bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-2 text-xs font-semibold text-orange-700 border-b border-orange-200">
                                <div className="col-span-4">Service</div>
                                <div className="col-span-2 text-center">60 Min</div>
                                <div className="col-span-2 text-center">90 Min</div>
                                <div className="col-span-2 text-center">120 Min</div>
                                <div className="col-span-2 text-center">Action</div>
                            </div>

                            {/* Fallback Service Row */}
                            <div className="divide-y divide-orange-100">
                                <div className="grid grid-cols-12 gap-2 px-3 py-3 hover:bg-orange-50 items-center">
                                    {/* Service Name */}
                                    <div className="col-span-4">
                                        <div className="font-medium text-sm text-gray-900">Traditional Massage</div>
                                        <div className="text-xs text-gray-500 mt-1">Traditional therapeutic massage</div>
                                    </div>

                                    {/* Price buttons using therapist's pricing */}
                                    {['60', '90', '120'].map((duration) => {
                                        const priceKey = `price${duration}` as keyof typeof therapist;
                                        const price = therapist[priceKey];
                                        return (
                                            <div key={duration} className="col-span-2 flex flex-col items-center gap-1">
                                                {price ? (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedServiceIndex(0);
                                                            setSelectedDuration(duration as '60' | '90' | '120');
                                                        }}
                                                        className={`px-2 py-1 rounded text-xs transition-all border-2 ${
                                                            selectedServiceIndex === 0 && selectedDuration === duration
                                                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold border-transparent shadow-lg'
                                                                : 'bg-white text-gray-800 border-orange-200 hover:border-orange-400 hover:bg-orange-50'
                                                        }`}
                                                    >
                                                        Rp {(Number(price) * 1000).toLocaleString('id-ID')}
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Action Button */}
                                    <div className="col-span-2 text-center">
                                        <button
                                            className={`w-full px-2 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
                                                selectedServiceIndex === 0 && selectedDuration
                                                    ? 'bg-orange-600 text-white hover:bg-orange-700 cursor-pointer shadow-lg scale-105'
                                                    : 'bg-orange-500 text-white hover:bg-orange-600 cursor-pointer'
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                
                                                // Get available durations from therapist pricing
                                                const availableDurations: string[] = [];
                                                if (therapist.price60) availableDurations.push('60');
                                                if (therapist.price90) availableDurations.push('90');
                                                if (therapist.price120) availableDurations.push('120');
                                                
                                                console.log('🎯 PRICE SLIDER (Fallback): User clicked "Pesan Sekarang"', {
                                                    selectedServiceIndex,
                                                    selectedDuration,
                                                    availableDurations,
                                                    therapistId: therapist.id,
                                                    therapistName: therapist.name
                                                });
                                                
                                                if (availableDurations.length > 0) {
                                                    // If already selected, proceed to booking
                                                    if (selectedServiceIndex === 0 && selectedDuration) {
                                                        const priceKey = `price${selectedDuration}` as keyof typeof therapist;
                                                        const servicePrice = Number(therapist[priceKey]) * 1000;
                                                        const serviceDuration = parseInt(selectedDuration);
                                                        
                                                        console.log('🚀 PRICE SLIDER (Fallback) → Opening booking chat with pre-selected service');
                                                        
                                                        // Close the price list modal
                                                        setShowPriceListModal(false);
                                                        
                                                        // Open chat with pre-selected service details
                                                        openBookingWithService(therapist, {
                                                            serviceName: 'Traditional Massage',
                                                            duration: serviceDuration,
                                                            price: servicePrice
                                                        });
                                                    } else {
                                                        // Auto-select first available duration
                                                        const firstDuration = availableDurations[0] as '60' | '90' | '120';
                                                        setSelectedServiceIndex(0);
                                                        setSelectedDuration(firstDuration);
                                                        console.log('🎯 Auto-selected (Fallback):', { duration: firstDuration });
                                                    }
                                                }
                                            }}
                                        >
                                            {selectedServiceIndex === 0 && selectedDuration 
                                                ? (chatLang === 'id' ? '✓ Pesan Sekarang' : '✓ Book Now')
                                                : (chatLang === 'id' ? 'Pilih' : 'Select')
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TherapistPriceListModal;