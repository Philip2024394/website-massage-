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

import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useCompatibleMenuData } from '../../hooks/useEnhancedMenuData';
import { getUniqueMenuItemsByName, getTherapistDisplayName } from '../../utils/therapistCardHelpers';
import { isBookingUseAdminCountry } from '../../config/whatsappCountryPrefix';

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
    /** When set, Book Now / Schedule open WhatsApp with prefilled message instead of in-app chat. */
    onOpenWhatsAppBooking?: (type: 'immediate' | 'scheduled', service: { serviceName: string; duration: number; price: number }) => void;
    // Enhanced badge system
    showBadges?: boolean;
    badgesRefreshKey?: string; // For dynamic badge updates per session
    /** Resolved booking WhatsApp number (admin or therapist) for opening wa.me in slider. */
    bookingNumber?: string;
    /** User country code for deposit notice (e.g. 'ID' for Indonesia). */
    userCountryCode?: string;
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
    onOpenWhatsAppBooking,
    showBadges = true,
    badgesRefreshKey = '',
    bookingNumber,
    userCountryCode = 'ID',
}) => {
    const [menuSliderStep, setMenuSliderStep] = useState<'menu' | 'scheduled'>('menu');
    const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [scheduledTime, setScheduledTime] = useState('12:00');
    const [showDepositNotice, setShowDepositNotice] = useState(false);
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

    // Pricing for 60/90/120 – same layout as massage city places slider (first menu item or therapist.pricing)
    const pricing = useMemo(() => {
        const first = activeMenuData[0];
        if (first) {
            const toNum = (v: any) => (v != null && Number(v) > 0 ? Number(v) * 1000 : 0);
            return {
                60: toNum(first.price60 ?? first.price_60),
                90: toNum(first.price90 ?? first.price_90),
                120: toNum(first.price120 ?? first.price_120),
            };
        }
        const p = therapist as any;
        const parse = (v: any) => (v != null && Number(v) > 0 ? (Number(v) < 1000 ? Number(v) * 1000 : Number(v)) : 0);
        const raw = p?.pricing;
        if (typeof raw === 'object' && raw !== null) {
            return { 60: parse(raw['60']), 90: parse(raw['90']), 120: parse(raw['120']) };
        }
        if (typeof raw === 'string') {
            try {
                const o = JSON.parse(raw);
                return { 60: parse(o['60']), 90: parse(o['90']), 120: parse(o['120']) };
            } catch (_) {}
        }
        return { 60: 0, 90: 0, 120: 0 };
    }, [activeMenuData, therapist]);

    const formatPrice = (price: number) => {
        if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
        if (price >= 1000) return `${(price / 1000).toFixed(0)}K`;
        return price.toLocaleString('id-ID');
    };

    const treatmentsLabel = (therapist as any)?.services || (chatLang === 'id' ? 'Semua jenis pijat' : 'All Massage Types');
    
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

    const closeSlider = () => {
        setShowPriceListModal(false);
        setMenuSliderStep('menu');
        setShowDepositNotice(false);
    };

    if (!showPriceListModal) return null;

    return (
        <div
            className="fixed inset-0 z-[10001] flex flex-col justify-end"
            role="dialog"
            aria-modal="true"
            aria-label="Menu prices"
        >
            <div className="absolute inset-0 bg-black/50" onClick={closeSlider} aria-hidden />
            <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-2xl z-10">
                    <h3 className="text-lg font-bold text-gray-900">
                        {menuSliderStep === 'scheduled' ? (chatLang === 'id' ? 'Pilih tanggal & waktu' : 'Select date & time') : `${getTherapistDisplayName(therapist.name)} – Menu`}
                    </h3>
                    <button
                        type="button"
                        onClick={closeSlider}
                        className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-4 space-y-3">
                    {menuSliderStep === 'scheduled' ? (
                        <>
                            <p className="text-sm text-gray-600">
                                {chatLang === 'id' ? 'Pilih tanggal dan waktu yang Anda inginkan untuk pijat.' : 'Choose your preferred date and time for the massage.'}
                            </p>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{chatLang === 'id' ? 'Tanggal' : 'Date'}</label>
                                    <input
                                        type="date"
                                        value={scheduledDate}
                                        min={new Date().toISOString().slice(0, 10)}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{chatLang === 'id' ? 'Waktu' : 'Time'}</label>
                                    <input
                                        type="time"
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            {isBookingUseAdminCountry(userCountryCode) && (
                                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-amber-900">⚠️ 30% deposit required</p>
                                    <p className="text-xs text-amber-800 mt-1">
                                        {chatLang === 'id' ? 'Deposit 30% diperlukan untuk booking pijat terjadwal. Dibayar ke admin untuk konfirmasi. (Indonesia)' : 'A 30% deposit is required for all scheduled massage. Payable to admin for confirmation of booking. (Indonesia only)'}
                                    </p>
                                </div>
                            )}
                            {showDepositNotice && isBookingUseAdminCountry(userCountryCode) && (
                                <div className="bg-amber-100 border-2 border-amber-400 rounded-xl p-4">
                                    <p className="text-sm font-bold text-amber-900">
                                        {chatLang === 'id' ? 'Deposit 30% diperlukan. Dibayar ke admin untuk konfirmasi.' : '30% deposit is required for all scheduled massage. Payable to admin for confirmation of booking.'}
                                    </p>
                                    <p className="text-xs text-amber-800 mt-2">
                                        {chatLang === 'id' ? 'Anda akan diarahkan ke WhatsApp untuk konfirmasi.' : 'You will be redirected to WhatsApp to confirm your booking.'}
                                    </p>
                                </div>
                            )}
                            <div className="flex gap-2 pt-2">
                                {!showDepositNotice && isBookingUseAdminCountry(userCountryCode) ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowDepositNotice(true)}
                                        className="flex-1 py-3 rounded-lg font-semibold bg-amber-500 hover:bg-amber-600 text-white"
                                    >
                                        {chatLang === 'id' ? 'Saya mengerti, lanjutkan' : 'I understand, continue'}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!bookingNumber) {
                                                if (onOpenWhatsAppBooking) {
                                                    const first = activeMenuData[0];
                                                    const dur = first ? 60 : 60;
                                                    const pr = first ? (Number(first.price60 ?? first.price_60 ?? 0) * 1000) : pricing[60];
                                                    onOpenWhatsAppBooking('scheduled', { serviceName: 'Massage', duration: dur, price: pr });
                                                    closeSlider();
                                                }
                                                return;
                                            }
                                            const digits = bookingNumber.replace(/\D/g, '').replace(/^0/, '62');
                                            const dateStr = new Date(scheduledDate + 'T00:00:00').toLocaleDateString(chatLang === 'id' ? 'id-ID' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                            const name = getTherapistDisplayName(therapist.name);
                                            const text = isBookingUseAdminCountry(userCountryCode)
                                                ? (chatLang === 'id'
                                                    ? `Halo Admin IndaStreet, saya ingin menjadwalkan pijat dengan ${name} pada ${dateStr} pukul ${scheduledTime}. Saya mengerti deposit 30% diperlukan, dibayar ke admin untuk konfirmasi. Terima kasih.`
                                                    : `Hi IndaStreet Admin, I would like to schedule a massage with ${name} on ${dateStr} at ${scheduledTime}. I understand 30% deposit is required, payable to admin for confirmation of booking. Thank you.`)
                                                : (chatLang === 'id'
                                                    ? `Halo, saya ingin menjadwalkan pijat dengan ${name} pada ${dateStr} pukul ${scheduledTime}. Terima kasih.`
                                                    : `Hi, I would like to schedule a massage with ${name} on ${dateStr} at ${scheduledTime}. Thank you.`);
                                            window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, '_blank');
                                            closeSlider();
                                        }}
                                        className="flex-1 py-3 rounded-lg font-semibold bg-amber-500 hover:bg-amber-600 text-white"
                                    >
                                        {chatLang === 'id' ? 'Konfirmasi & buka WhatsApp' : 'Confirm & open WhatsApp'}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => { setMenuSliderStep('menu'); setShowDepositNotice(false); }}
                                    className="py-3 px-4 rounded-lg font-semibold border-2 border-gray-300 text-gray-700"
                                >
                                    {chatLang === 'id' ? 'Kembali' : 'Back'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Scheduled + Book Now – same grid and styles as CityPlaceCard */}
                            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setMenuSliderStep('scheduled')}
                                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-800 font-semibold hover:bg-amber-100"
                                >
                                    <Calendar className="w-5 h-5" />
                                    {chatLang === 'id' ? 'Terjadwal' : 'Scheduled'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const first = activeMenuData[0];
                                        const serviceName = first?.serviceName || first?.name || 'Massage';
                                        const dur = 60;
                                        const pr = pricing[60] || (first ? Number(first.price60 ?? first.price_60 ?? 0) * 1000 : 0);
                                        if (onOpenWhatsAppBooking) {
                                            onOpenWhatsAppBooking('immediate', { serviceName, duration: dur, price: pr });
                                            closeSlider();
                                            return;
                                        }
                                        if (bookingNumber) {
                                            const digits = bookingNumber.replace(/\D/g, '').replace(/^0/, '62');
                                            const name = getTherapistDisplayName(therapist.name);
                                            const text = chatLang === 'id'
                                                ? `Halo, saya ingin memesan pijat di ${name}. Mohon koordinasi kunjungan saya. Terima kasih.`
                                                : `Hi, I would like to book at ${name}. Please coordinate my visit. Thank you.`;
                                            window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, '_blank');
                                        }
                                        closeSlider();
                                    }}
                                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                                >
                                    <Clock className="w-5 h-5" />
                                    {chatLang === 'id' ? 'Pesan Sekarang' : 'Book Now'}
                                </button>
                            </div>
                            <p className="text-sm text-gray-600">{treatmentsLabel}</p>
                            {/* 60 / 90 / 120 rows – same style as CityPlaceCard */}
                            {[
                                { label: '60 min', key: '60' as const },
                                { label: '90 min', key: '90' as const },
                                { label: '120 min', key: '120' as const },
                            ].map(({ label, key }) => (
                                <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-orange-50 border border-orange-200">
                                    <span className="font-medium text-gray-900">Massage · {label}</span>
                                    <span className="text-sm font-semibold text-gray-800">{pricing[key] > 0 ? `IDR ${formatPrice(pricing[key])}` : (chatLang === 'id' ? 'Hubungi' : 'Contact')}</span>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TherapistPriceListModal;