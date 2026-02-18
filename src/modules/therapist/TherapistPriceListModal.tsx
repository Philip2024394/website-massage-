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

import React, { useEffect, useMemo } from 'react';
import { StarIcon } from '../../components/therapist/TherapistIcons';
import { useCompatibleMenuData } from '../../hooks/useEnhancedMenuData';
import { getUniqueMenuItemsByName, getTherapistDisplayName } from '../../utils/therapistCardHelpers';

interface TherapistPriceListModalProps {
    showPriceListModal: boolean;
    setShowPriceListModal: (show: boolean) => void;
    therapist: any;
    displayRating: string;
    arrivalCountdown: string;
    formatCountdown: (time: string) => string;
    // Legacy menuData prop - now optional as we load from enhanced service  
    menuData?: any[];
    selectedServiceIndex: number | null;
    selectedDuration: '60' | '90' | '120' | null;
    handleSelectService: (index: number, duration: '60' | '90' | '120') => void;
    setSelectedServiceIndex: (index: number) => void;
    setSelectedDuration: (duration: '60' | '90' | '120') => void;
    openBookingWithService: (therapist: any, service: any, options?: { bookingType?: 'immediate' | 'scheduled' }) => void;
    chatLang: string;
    showBookingButtons?: boolean;
    // Enhanced modal management
    handleBookNowClick?: (options?: { modalType?: any; onAfterClose?: () => void }) => Promise<void>;
    closeAllModals?: () => Promise<void>;
    // Enhanced badge system
    showBadges?: boolean;
    badgesRefreshKey?: string; // For dynamic badge updates per session
}

const TherapistPriceListModal: React.FC<TherapistPriceListModalProps> = ({
    showPriceListModal,
    setShowPriceListModal,
    therapist,
    displayRating,
    arrivalCountdown,
    formatCountdown,
    menuData: legacyMenuData, // Legacy prop, now optional
    selectedServiceIndex,
    selectedDuration,
    handleSelectService,
    setSelectedServiceIndex,
    setSelectedDuration,
    openBookingWithService,
    chatLang,
    showBookingButtons = true,
    handleBookNowClick,
    closeAllModals,
    showBadges = true,
    badgesRefreshKey = '' // Stable default; pass a value only when badges need refresh
}) => {
    // 🎯 GOLD STANDARD: Stabilize therapist ID with useMemo to prevent cascading re-renders
    const therapistDocumentId = useMemo(() => 
        therapist?.appwriteId || therapist?.$id || therapist?.id?.toString() || '',
        [therapist?.appwriteId, therapist?.$id, therapist?.id]
    );

    // 🎯 ENHANCED MENU DATA INTEGRATION (pass therapist so dashboard 3 prices → "Traditional Massage" in slider)
    const {
        menuData: enhancedMenuData,
        enhancedMenuData: enhancedMenu,
        isDefaultMenu,
        hasAnyMenu
    } = useCompatibleMenuData(therapistDocumentId, therapist);

    // Use enhanced menu data if available, fallback to legacy prop
    const rawMenuData = hasAnyMenu ? enhancedMenuData : (legacyMenuData || []);
    // Deduplicate by service name so the same massage type is not shown twice (e.g. "Traditional Massage")
    const activeMenuData = useMemo(() => getUniqueMenuItemsByName(rawMenuData), [rawMenuData]);
    
    // Scheduled booking requires KTP upload + bank details (same as TherapistCard)
    const hasScheduledBookings = !!((
      (therapist?.bankName && therapist?.accountNumber && therapist?.accountName) ||
      (therapist as any)?.bankCardDetails
    ) && (therapist as any)?.ktpPhotoUrl);
    
    // Track booking events for badge updates
    const handleServiceBooking = async (service: any, bookingType: 'immediate' | 'scheduled') => {
        try {
            // 🔒 CRITICAL: Ensure therapist has at least one valid ID field
            const therapistDocumentId = therapist?.appwriteId || therapist?.$id || therapist?.id?.toString();
            
            if (!therapistDocumentId) {
                const errorMsg = '❌ BLOCKED: Therapist has no valid ID field. Cannot proceed with booking.';
                console.error(errorMsg, therapist);
                alert('⚠️ Unable to create booking: Therapist data is incomplete. Please refresh the page and try again.');
                return;
            }

            // Track the booking for badge system
            if (enhancedMenu?.markServiceBooked && service.id) {
                await enhancedMenu.markServiceBooked(service.id);
            }
            
            // Continue with original booking flow
            openBookingWithService(therapist, service, { bookingType });
        } catch (error) {
            console.error('❌ Error in handleServiceBooking:', error);
            // Show user-friendly error
            alert('⚠️ Unable to create booking. Please try again or refresh the page.');
        }
    };

    // 🎯 GOLD STANDARD: Log modal state changes without causing re-render cascades
    // Only depend on modal visibility to prevent excessive re-renders during menu loading
    useEffect(() => {
        if (showPriceListModal) {
            console.log('═'.repeat(80));
            console.log(`📋 Price Modal opened for therapist ${therapist?.name}:`);
            console.log('🔍 THERAPIST ID FIELDS:', {
                id: therapist?.id,
                appwriteId: therapist?.appwriteId,
                $id: therapist?.$id,
                name: therapist?.name,
                resolvedId: therapistDocumentId
            });
            console.log('📋 INITIAL MENU STATE:', {
                hasEnhancedMenu: hasAnyMenu,
                isDefaultMenu,
                serviceCount: activeMenuData.length,
                services: activeMenuData.map((s: any) => ({
                    name: s.serviceName || s.name,
                    has60: !!s.price60,
                    has90: !!s.price90,
                    has120: !!s.price120
                }))
            });
            console.log('═'.repeat(80));
        } else {
            console.log('🔴 Price Modal CLOSED (showPriceListModal = false)');
        }
    }, [showPriceListModal]); // ✅ Only depend on modal state to prevent re-render loops

    console.log('🔍 [PriceListModal] Render check:', {
        showPriceListModal,
        willRender: showPriceListModal ? 'YES' : 'NO (returning null)'
    });

    if (!showPriceListModal) return null;

    return (
        <div
            className="fixed inset-0 z-[10000] bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => {
                console.trace('🔴 [PriceListModal] CLOSING - Backdrop clicked');
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
                            alt={getTherapistDisplayName(therapist.name)}
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
                            <h2 className="text-lg font-bold text-white leading-tight">{getTherapistDisplayName(therapist.name)}</h2>
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
                        <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2"/>
                            </svg>
                            {formatCountdown(arrivalCountdown)}
                        </span>
                    </div>
                </div>

                {/* Price List Content - Natural scrolling */}
                <div className="flex-1 p-4 max-h-[70vh] overflow-y-auto">
                    {activeMenuData.length > 0 ? (
                        <div className="bg-white rounded-lg border border-orange-200 overflow-hidden shadow-lg">
                            {/* Header */}
                            <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    Massage Menu
                                </h2>
                                <p className="text-gray-600">
                                    Select service and duration, then choose your booking option
                                </p>
                            </div>

                            {/* Service Cards - Enhanced with badge integration */}
                            <div className="space-y-6">
                                {activeMenuData.map((service: any, index: number) => {
                                    const isRowSelected = selectedServiceIndex === index;
                                    const availableDurations = ['60', '90', '120'].filter(duration => service[`price${duration}`]);

                                    return (
                                        <div key={service.id || index} className={`relative bg-white rounded-xl border-2 p-4 transition-all ${
                                            isRowSelected ? 'border-orange-400 shadow-lg bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                                        }`}>
                                            {/* 1️⃣ MAIN MENU NAME */}
                                            <div className="mb-4 text-center">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                    {service.serviceName || service.name || 'Service'}
                                                </h3>
                                                {service.description && (
                                                    <p className="text-sm text-gray-600">
                                                        {service.description}
                                                    </p>
                                                )}
                                                {/* Enhanced service info */}
                                                {enhancedMenu?.menuLoadResult && (
                                                    <div className="text-xs text-gray-500 mt-2">
                                                        Category: {service.category?.replace('_', ' ') || 'General'}
                                                        {service.popularity && (
                                                            <span className="ml-2">
                                                                • {'★'.repeat(service.popularity)}
                                                            </span>
                                                        )}
                                                    </div>
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
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                
                                                                if (isRowSelected && selectedDuration) {
                                                                    const priceNum = Number(service[`price${selectedDuration}`]);
                                                                    
                                                                    if (!isNaN(priceNum) && priceNum > 0) {
                                                                        console.log('🚀 PRICE SLIDER → Book Now with service (Enhanced):', {
                                                                            serviceName: service.serviceName,
                                                                            duration: selectedDuration,
                                                                            price: priceNum * 1000,
                                                                            serviceId: service.id,
                                                                            isDefault: isDefaultMenu
                                                                        });

                                                                        const serviceData = {
                                                                            id: service.id,
                                                                            serviceName: service.serviceName || service.name,
                                                                            duration: parseInt(selectedDuration),
                                                                            price: priceNum * 1000
                                                                        };

                                                                        // 🎯 ENHANCED MODAL MANAGEMENT WITH BOOKING TRACKING
                                                                        // Close price list and any other modals before opening booking
                                                                        if (handleBookNowClick) {
                                                                            await handleBookNowClick({
                                                                                onAfterClose: async () => {
                                                                                    // Execute booking with enhanced tracking after modals are closed
                                                                                    await handleServiceBooking(serviceData, 'immediate');
                                                                                    
                                                                                    // Reset selection state
                                                                                    setSelectedServiceIndex(null);
                                                                                    setSelectedDuration(null);
                                                                                }
                                                                            });
                                                                        } else {
                                                                            // Fallback to legacy behavior with enhanced tracking
                                                                            await handleServiceBooking(serviceData, 'immediate');

                                                                            setShowPriceListModal(false);
                                                                            setSelectedServiceIndex(null);
                                                                            setSelectedDuration(null);
                                                                        }
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
                                                        
                                                        {/* Schedule button: active for all members; user can always select to book scheduled menu item */}
                                                        <button
                                                            title={!hasScheduledBookings ? (chatLang === 'id' ? 'Penyedia mungkin perlu melengkapi verifikasi untuk menerima booking' : 'Provider may need to complete verification to accept') : (chatLang === 'id' ? 'Jadwalkan layanan ini' : 'Schedule this service')}
                                                            className={`px-6 py-3 font-semibold rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                                                                isRowSelected && selectedDuration
                                                                    ? 'border-orange-500 bg-orange-500 text-white hover:bg-orange-600 shadow-lg'
                                                                    : 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100'
                                                            }`}
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (isRowSelected && selectedDuration) {
                                                    const priceNum = Number(service[`price${selectedDuration}`]);
                                                    
                                                    if (!isNaN(priceNum) && priceNum > 0) {
                                                        console.log('📅 PRICE SLIDER → Schedule with service:', {
                                                            serviceName: service.serviceName,
                                                            duration: selectedDuration,
                                                            price: priceNum * 1000,
                                                            serviceId: service.id,
                                                            isDefault: isDefaultMenu
                                                        });

                                                        const serviceData = {
                                                            id: service.id,
                                                            serviceName: service.serviceName || service.name,
                                                            duration: parseInt(selectedDuration),
                                                            price: priceNum * 1000
                                                        };

                                                        await handleServiceBooking(serviceData, 'scheduled');

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
                                                            {isRowSelected && selectedDuration ? (
                                                                <>
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                    {chatLang === 'id' ? 'Schedule' : 'Schedule'}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={2}/>
                                                                        <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2}/>
                                                                        <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2}/>
                                                                        <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2}/>
                                                                    </svg>
                                                                    {chatLang === 'id' ? 'Schedule' : 'Schedule'}
                                                                </>
                                                            )}
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
                        // Fallback when no menu data available (should be rare with default menu system)
                        <div className="relative bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🍃</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Setting Up Your Menu
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {enhancedMenu?.isLoading 
                                        ? 'Loading your personalized service menu...'
                                        : 'We\'re preparing a customized menu of massage services for you.'
                                    }
                                </p>
                                {enhancedMenu?.error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                        <p className="text-red-700 text-sm">{enhancedMenu.error}</p>
                                    </div>
                                )}
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => enhancedMenu?.refreshMenu?.()}
                                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                    >
                                        {enhancedMenu?.isLoading ? 'Loading...' : 'Refresh Menu'}
                                    </button>
                                    <button
                                        onClick={() => setShowPriceListModal(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                                
                                {/* Show loading spinner */}
                                {enhancedMenu?.isLoading && (
                                    <div className="mt-6">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
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