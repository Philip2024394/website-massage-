// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
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
    openBookingWithService: (therapist: any, service: any, options?: { bookingType?: 'immediate' | 'scheduled' }) => void;
    chatLang: string;
    showBookingButtons?: boolean; // Control whether to show booking buttons (profile) or just prices (home)
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
    chatLang,
    showBookingButtons = true // Default true for profile page, false for home page
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
                <div className="flex-1 p-4 max-h-[70vh] ">
                    {menuData.length > 0 ? (
                        <div className="bg-white rounded-lg border border-orange-200 overflow-hidden shadow-lg">
                            {/* Header - Clean & Simple */}
                            <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Massage Menu</h2>
                                <p className="text-gray-600">Select service and duration, then choose your booking option</p>
                            </div>

                            {/* Service Cards - Clean UI Structure */}
                            <div className="space-y-6">
                                {menuData.map((service: any, index: number) => {
                                    const isRowSelected = selectedServiceIndex === index;
                                    const availableDurations = ['60', '90', '120'].filter(duration => service[`price${duration}`]);

                                    return (
                                        <div key={index} className={`bg-white rounded-xl border-2 p-4 transition-all ${
                                            isRowSelected ? 'border-orange-400 shadow-lg bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                                        }`}>
                                            {/* 1️⃣ MAIN MENU NAME (MANDATORY, ALWAYS FIRST) */}
                                            <div className="mb-4 text-center">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                    {service.serviceName || service.name || 'Service'}
                                                </h3>
                                                {service.description && (
                                                    <p className="text-sm text-gray-600">
                                                        {service.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* 2️⃣ PRICE OPTIONS CONTAINER (UNDER MENU NAME) */}
                                            <div className="mb-6">
                                                <div className="flex flex-wrap justify-center gap-3">
                                                    {availableDurations.map((duration) => {
                                                        const price = service[`price${duration}`];
                                                        const isSelected = isRowSelected && selectedDuration === duration;
                                                        
                                                        return (
                                                            <button
                                                                key={duration}
                                                                onClick={() => showBookingButtons && handleSelectService(index, duration as '60' | '90' | '120')}
                                                                disabled={!showBookingButtons}
                                                                className={`flex-1 min-w-[100px] max-w-[140px] px-4 py-3 rounded-xl border-2 transition-all ${
                                                                    isSelected
                                                                        ? 'border-orange-500 bg-orange-500 text-white shadow-lg transform scale-105'
                                                                        : 'border-orange-200 bg-white text-gray-800 hover:border-orange-400 hover:bg-orange-50'
                                                                }`}
                                                            >
                                                                <div className="text-center">
                                                                    <div className="text-sm font-semibold mb-1">
                                                                        {duration} min
                                                                    </div>
                                                                    <div className="text-sm font-bold">
                                                                        Rp {(Number(price) * 1000).toLocaleString('id-ID')}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* 3️⃣ ACTION AREA (BOTTOM, CLEAR & SEPARATE) */}
                                            {showBookingButtons && (
                                                <div className="border-t border-gray-200 pt-4">
                                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                                        <button
                                                            className={`px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
                                                                isRowSelected && selectedDuration
                                                                    ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg'
                                                                    : 'bg-orange-500 text-white hover:bg-orange-600'
                                                            }`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                
                                                                if (isRowSelected && selectedDuration) {
                                                                    const priceNum = Number(service[`price${selectedDuration}`]);
                                                                    
                                                                    if (!isNaN(priceNum) && priceNum > 0) {
                                                                        console.log('🚀 PRICE SLIDER → Book Now with service:', {
                                                                            serviceName: service.serviceName,
                                                                            duration: selectedDuration,
                                                                            price: priceNum * 1000
                                                                        });

                                                                        openBookingWithService(therapist, {
                                                                            serviceName: service.serviceName,
                                                                            duration: parseInt(selectedDuration),
                                                                            price: priceNum * 1000
                                                                        });

                                                                        setShowPriceListModal(false);
                                                                        setSelectedServiceIndex(null);
                                                                        setSelectedDuration(null);
                                                                    }
                                                                } else if (availableDurations.length > 0) {
                                                                    // Auto-select first available duration
                                                                    const firstDuration = availableDurations[0] as '60' | '90' | '120';
                                                                    handleSelectService(index, firstDuration);
                                                                }
                                                            }}
                                                        >
                                                            {isRowSelected && selectedDuration 
                                                                ? (chatLang === 'id' ? '✓ Book Now' : '✓ Book Now')
                                                                : (chatLang === 'id' ? 'Book Now' : 'Book Now')
                                                            }
                                                        </button>
                                                        
                                                        <button
                                                            className={`px-6 py-3 font-semibold rounded-lg border-2 transition-all duration-200 ${
                                                                isRowSelected && selectedDuration
                                                                    ? 'border-blue-500 bg-blue-500 text-white hover:bg-blue-600 shadow-lg'
                                                                    : 'border-blue-500 bg-white text-blue-600 hover:bg-blue-50'
                                                            }`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                
                                                                if (isRowSelected && selectedDuration) {
                                                                    const priceNum = Number(service[`price${selectedDuration}`]);
                                                                    
                                                                    if (!isNaN(priceNum) && priceNum > 0) {
                                                                        console.log('📅 PRICE SLIDER → Schedule with service:', {
                                                                            serviceName: service.serviceName,
                                                                            duration: selectedDuration,
                                                                            price: priceNum * 1000
                                                                        });

                                                                        openBookingWithService(therapist, {
                                                                            serviceName: service.serviceName,
                                                                            duration: parseInt(selectedDuration),
                                                                            price: priceNum * 1000
                                                                        }, { 
                                                                            bookingType: 'scheduled',
                                                                            requireDeposit: true,
                                                                            depositPercentage: 30
                                                                        });

                                                                        setShowPriceListModal(false);
                                                                        setSelectedServiceIndex(null);
                                                                        setSelectedDuration(null);
                                                                    }
                                                                } else if (availableDurations.length > 0) {
                                                                    // Auto-select first available duration
                                                                    const firstDuration = availableDurations[0] as '60' | '90' | '120';
                                                                    handleSelectService(index, firstDuration);
                                                                }
                                                            }}
                                                        >
                                                            {isRowSelected && selectedDuration 
                                                                ? (chatLang === 'id' ? '📅 Schedule' : '📅 Schedule')
                                                                : (chatLang === 'id' ? 'Schedule' : 'Schedule')
                                                            }
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
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
                                                                onClick={() => showBookingButtons && handleSelectService(index, duration as '60' | '90' | '120')}
                                                                disabled={!showBookingButtons}
                                                                className={`w-full px-1 py-1 rounded text-xs transition-all border-2 min-w-0 ${
                                                                    showBookingButtons && isRowSelected && selectedDuration === duration
                                                                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold border-transparent shadow-lg'
                                                                        : showBookingButtons
                                                                        ? 'bg-white text-gray-800 border-orange-200 hover:border-orange-400 hover:bg-orange-50'
                                                                        : 'bg-white text-gray-800 border-gray-200 cursor-default'
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

                                                {/* Action Buttons - Both Immediate & Scheduled - Only show on profile page */}
                                                {showBookingButtons && (
                                                <div className="col-span-2 space-y-1">
                                                    {/* Book Now Button */}
                                                    <button
                                                        className={`w-full px-1 py-1 text-xs font-semibold rounded transition-all duration-200 ${
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
                                                            
                                                            console.log('🎯 IMMEDIATE BOOKING (Menu): User clicked "Book Now"', {
                                                                serviceName: service.name || service.serviceName,
                                                                serviceIndex: index,
                                                                isRowSelected,
                                                                selectedDuration,
                                                                availableDurations,
                                                                therapistId: therapist.id,
                                                                therapistName: therapist.name
                                                            });
                                                            
                                                            if (availableDurations.length > 0) {
                                                                // If this row is already selected with a duration, proceed to immediate booking
                                                                if (isRowSelected && selectedDuration) {
                                                                    const serviceName = service.name || service.serviceName || 'Massage Service';
                                                                    const servicePrice = Number(service[`price${selectedDuration}`]) * 1000;
                                                                    const serviceDuration = parseInt(selectedDuration);
                                                                    
                                                                    console.log('🚀 IMMEDIATE BOOKING → Opening booking chat (No Deposit)');
                                                                    
                                                                    // Close the price list modal
                                                                    setShowPriceListModal(false);
                                                                    
                                                                    // Open chat with immediate booking - NO DEPOSIT
                                                                    openBookingWithService(therapist, {
                                                                        serviceName,
                                                                        duration: serviceDuration,
                                                                        price: servicePrice
                                                                    });
                                                                } else {
                                                                    // Auto-select first available duration for this service
                                                                    const firstDuration = availableDurations[0] as '60' | '90' | '120';
                                                                    handleSelectService(index, firstDuration);
                                                                    console.log('🎯 Auto-selected (Immediate):', { serviceIndex: index, duration: firstDuration });
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        {isRowSelected && selectedDuration 
                                                            ? (chatLang === 'id' ? '✓ Pesan' : '✓ Book')
                                                            : (chatLang === 'id' ? 'Pesan' : 'Book')
                                                        }
                                                    </button>

                                                    {/* Schedule Button */}
                                                    <button
                                                        className={`w-full px-1 py-1 text-xs font-semibold rounded transition-all duration-200 border ${
                                                            isRowSelected && selectedDuration
                                                                ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-lg scale-105'
                                                                : 'bg-white border-blue-500 text-blue-600 hover:bg-blue-50 cursor-pointer'
                                                        }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            
                                                            // If no selection yet, auto-select first available duration for this service
                                                            const availableDurations: string[] = [];
                                                            if (service.price60) availableDurations.push('60');
                                                            if (service.price90) availableDurations.push('90');
                                                            if (service.price120) availableDurations.push('120');
                                                            
                                                            console.log('📅 SCHEDULED BOOKING (Menu): User clicked "Schedule"', {
                                                                serviceName: service.name || service.serviceName,
                                                                serviceIndex: index,
                                                                isRowSelected,
                                                                selectedDuration,
                                                                availableDurations,
                                                                therapistId: therapist.id,
                                                                therapistName: therapist.name
                                                            });
                                                            
                                                            if (availableDurations.length > 0) {
                                                                // If this row is already selected with a duration, proceed to scheduled booking
                                                                if (isRowSelected && selectedDuration) {
                                                                    const serviceName = service.name || service.serviceName || 'Massage Service';
                                                                    const servicePrice = Number(service[`price${selectedDuration}`]) * 1000;
                                                                    const serviceDuration = parseInt(selectedDuration);
                                                                    
                                                                    console.log('🚀 SCHEDULED BOOKING → Opening booking chat (Deposit after therapist accepts)');
                                                                    
                                                                    // Close the price list modal
                                                                    setShowPriceListModal(false);
                                                                    
                                                                    // Open chat with scheduled booking - deposit AFTER therapist accepts
                                                                    openBookingWithService(therapist, {
                                                                        serviceName,
                                                                        duration: serviceDuration,
                                                                        price: servicePrice
                                                                    }, { 
                                                                        bookingType: 'scheduled'
                                                                    });
                                                                } else {
                                                                    // Auto-select first available duration for this service
                                                                    const firstDuration = availableDurations[0] as '60' | '90' | '120';
                                                                    handleSelectService(index, firstDuration);
                                                                    console.log('🎯 Auto-selected (Scheduled):', { serviceIndex: index, duration: firstDuration });
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        {isRowSelected && selectedDuration 
                                                            ? (chatLang === 'id' ? '📅 Jadwal' : '📅 Schedule')
                                                            : (chatLang === 'id' ? '📅 Jadwal' : '📅 Schedule')
                                                        }
                                                    </button>
                                                </div>
                                                )}\n                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        // Fallback pricing when menu data fails to load - use therapist's built-in pricing
                        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                            {/* 1️⃣ MAIN MENU NAME (MANDATORY, ALWAYS FIRST) */}
                            <div className="mb-4 text-center">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    Traditional Massage
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Traditional therapeutic massage
                                </p>
                            </div>

                            {/* 2️⃣ PRICE OPTIONS CONTAINER (UNDER MENU NAME) */}
                            <div className="mb-6">
                                <div className="flex flex-wrap justify-center gap-3">
                                    {['60', '90', '120'].map((duration) => {
                                        const priceKey = `price${duration}` as keyof typeof therapist;
                                        const price = therapist[priceKey];
                                        const isSelected = selectedServiceIndex === 0 && selectedDuration === duration;
                                        
                                        if (!price) return null;
                                        
                                        return (
                                            <button
                                                key={duration}
                                                onClick={() => {
                                                    setSelectedServiceIndex(0);
                                                    setSelectedDuration(duration as '60' | '90' | '120');
                                                }}
                                                className={`flex-1 min-w-[100px] max-w-[140px] px-4 py-3 rounded-xl border-2 transition-all ${
                                                    isSelected
                                                        ? 'border-orange-500 bg-orange-500 text-white shadow-lg transform scale-105'
                                                        : 'border-orange-200 bg-white text-gray-800 hover:border-orange-400 hover:bg-orange-50'
                                                }`}
                                            >
                                                <div className="text-center">
                                                    <div className="text-sm font-semibold mb-1">
                                                        {duration} min
                                                    </div>
                                                    <div className="text-sm font-bold">
                                                        Rp {(Number(price) * 1000).toLocaleString('id-ID')}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 3️⃣ ACTION AREA (BOTTOM, CLEAR & SEPARATE) */}
                            {showBookingButtons && (
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <button
                                            className={`px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
                                                selectedServiceIndex === 0 && selectedDuration
                                                    ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg'
                                                    : 'bg-orange-500 text-white hover:bg-orange-600'
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                
                                                // Get available durations from therapist pricing
                                                const availableDurations: string[] = [];
                                                if (therapist.price60) availableDurations.push('60');
                                                if (therapist.price90) availableDurations.push('90');
                                                if (therapist.price120) availableDurations.push('120');
                                                
                                                if (selectedServiceIndex === 0 && selectedDuration) {
                                                    const priceKey = `price${selectedDuration}` as keyof typeof therapist;
                                                    const servicePrice = Number(therapist[priceKey]) * 1000;
                                                    const serviceDuration = parseInt(selectedDuration);
                                                    
                                                    console.log('🚀 IMMEDIATE BOOKING → Opening booking chat (No Deposit Required)');
                                                    
                                                    // Close the price list modal
                                                    setShowPriceListModal(false);
                                                    
                                                    // Open chat with immediate booking - NO DEPOSIT
                                                    openBookingWithService(therapist, {
                                                        serviceName: 'Traditional Massage',
                                                        duration: serviceDuration,
                                                        price: servicePrice
                                                    });
                                                } else if (availableDurations.length > 0) {
                                                    // Auto-select first available duration
                                                    const firstDuration = availableDurations[0] as '60' | '90' | '120';
                                                    setSelectedServiceIndex(0);
                                                    setSelectedDuration(firstDuration);
                                                }
                                            }}
                                        >
                                            {selectedServiceIndex === 0 && selectedDuration 
                                                ? (chatLang === 'id' ? '✓ Book Now' : '✓ Book Now')
                                                : (chatLang === 'id' ? 'Book Now' : 'Book Now')
                                            }
                                        </button>
                                        
                                        <button
                                            className={`px-6 py-3 font-semibold rounded-lg border-2 transition-all duration-200 ${
                                                selectedServiceIndex === 0 && selectedDuration
                                                    ? 'border-blue-500 bg-blue-500 text-white hover:bg-blue-600 shadow-lg'
                                                    : 'border-blue-500 bg-white text-blue-600 hover:bg-blue-50'
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                
                                                // Get available durations from therapist pricing
                                                const availableDurations: string[] = [];
                                                if (therapist.price60) availableDurations.push('60');
                                                if (therapist.price90) availableDurations.push('90');
                                                if (therapist.price120) availableDurations.push('120');
                                                
                                                if (selectedServiceIndex === 0 && selectedDuration) {
                                                    const priceKey = `price${selectedDuration}` as keyof typeof therapist;
                                                    const servicePrice = Number(therapist[priceKey]) * 1000;
                                                    const serviceDuration = parseInt(selectedDuration);
                                                    
                                                    console.log('🚀 SCHEDULED BOOKING → Opening booking chat with deposit requirement');
                                                    
                                                    // Close the price list modal
                                                    setShowPriceListModal(false);
                                                    
                                                    // Open chat with scheduled booking requiring 30% deposit
                                                    openBookingWithService(therapist, {
                                                        serviceName: 'Traditional Massage',
                                                        duration: serviceDuration,
                                                        price: servicePrice
                                                    }, { 
                                                        bookingType: 'scheduled',
                                                        requireDeposit: true,
                                                        depositPercentage: 30
                                                    });
                                                } else if (availableDurations.length > 0) {
                                                    // Auto-select first available duration
                                                    const firstDuration = availableDurations[0] as '60' | '90' | '120';
                                                    setSelectedServiceIndex(0);
                                                    setSelectedDuration(firstDuration);
                                                }
                                            }}
                                        >
                                            {selectedServiceIndex === 0 && selectedDuration 
                                                ? (chatLang === 'id' ? '📅 Schedule' : '📅 Schedule')
                                                : (chatLang === 'id' ? 'Schedule' : 'Schedule')
                                            }
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TherapistPriceListModal;