/**
 * 🔒 CRITICAL BOOKING FLOW – DO NOT MODIFY
 *
 * This file is part of a production-stable booking system.
 * Changes here have previously caused booking failures.
 *
 * AI RULE:
 * - DO NOT refactor
 * - DO NOT optimize
 * - DO NOT change routing or state logic
 *
 * Only allowed changes:
 * - Logging
 * - Comments
 * - E2E assertions
 *
 * Any behavior change requires human approval.
 */

/**
 * ⚠️ MOBILE RENDER STABILITY RULES ENFORCED ⚠️
 * 
 * CRITICAL: This component follows strict mobile render rules.
 * See: .mobile-render-rules.json for complete guidelines.
 * 
 * LOCKED PATTERNS:
 * ✅ Keys: ONLY use therapist.$id (NEVER index)
 * ✅ Images: aspect-ratio CSS required
 * ✅ Sizing: Fixed px with breakpoints (NO vw/vh)
 * ✅ Responsive: CSS-only (NO window.innerWidth)
 * ✅ Determinism: NO Math.random() or Date.now()
 * 
 * DO NOT MODIFY unless you understand React reconciliation.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Therapist, Analytics } from '../types';
import { AvailabilityStatus } from '../types';
import { logger } from '../utils/logger';
import { parsePricing, parseCoordinates } from '../utils/appwriteHelpers';
import { notificationService, reviewService, therapistMenusService, bookingService } from '../lib/appwriteService';
import { useTherapistDisplayImage } from '../utils/therapistImageUtils';
import { getSamplePricing, hasActualPricing } from '../utils/samplePriceUtils';
import { devLog, devWarn } from '../utils/devMode';
import { getDisplayRating, formatRating } from '../utils/ratingUtils';
import { generateShareableURL } from '../utils/seoSlugGenerator';
import { getOrCreateShareLink } from '../utils/shareLinkGenerator';
import { getAuthAppUrl, getDisplayStatus, isDiscountActive, getCheapestServiceByTotalPrice, getCombinedMenuForDisplay, getTherapistDisplayName } from '../utils/therapistCardHelpers';
import { shareLinkService } from '../lib/services/shareLinkService';
import { WhatsAppIcon, StarIcon } from './therapist/TherapistIcons';
import { statusStyles } from '../constants/therapistCardConstants';
import { APP_CONSTANTS } from '../constants/appConstants';
import { APP_CONFIG } from '../config';
import { enterpriseBookingFlowService } from '../services/enterpriseBookingFlowService';
import { useAuth } from '../context/AuthContext';
import {
  buildBookNowMessage,
  buildScheduledBookingMessage,
  buildWhatsAppUrl,
  getBookingWhatsAppNumber,
  getFirstMassageType,
  getDefaultDurationAndPrice,
} from '../utils/whatsappBookingMessages';
import { logWaClickEvent } from '../services/waClickEventService';
import TherapistBusyPopup from './TherapistBusyPopup';

/** Admin WhatsApp (used when therapist has no number). Never empty for Indonesia booking. */
const ADMIN_WHATSAPP = APP_CONSTANTS.DEFAULT_CONTACT_NUMBER ?? '';
const ADMIN_WHATSAPP_DIGITS = (ADMIN_WHATSAPP && String(ADMIN_WHATSAPP).replace(/\D/g, '')) || '6281392000050';
const IN_APP_BOOKING_DISABLED = APP_CONFIG.IN_APP_BOOKING_DISABLED === true;

import BookingPopup from './BookingPopup';
import ScheduleBookingPopup from './ScheduleBookingPopup';
import BusyCountdownTimer from './BusyCountdownTimer';
import AnonymousReviewModal from './AnonymousReviewModal';
import SocialSharePopup from './SocialSharePopup';
import TherapistJoinPopup from './TherapistJoinPopup';
import { useUIConfig } from '../hooks/useUIConfig';
import { MessageCircle, Clock, X, FileText } from 'lucide-react';
import { PricesButton } from './PricesButton';
import { ScheduledBookingButton } from './ScheduledBookingButton';
import { BookNowButton } from './BookNowButton';
import { chatTranslationService } from '../services/chatTranslationService';
import { useLanguageContext } from '../context/LanguageContext';
import { getClientPreferenceDisplay } from '../utils/clientPreferencesUtils';
import TherapistCardHeader from './therapist/TherapistCardHeader';
import TherapistPricingGrid from '../modules/therapist/TherapistPricingGrid';
import BeauticianTreatmentCards from './therapist/BeauticianTreatmentCards';
import BeauticianPriceListModal from '../modules/therapist/BeauticianPriceListModal';
import { therapistOffersService } from '../constants/serviceTypes';
import { SERVICE_TYPES } from '../constants/serviceTypes';
import { parseBeauticianTreatments, getCombinedBeauticianTreatmentsForDisplay, getSampleBeauticianTreatments } from '../constants/beauticianTreatments';
import TherapistModalsContainer from '../modules/therapist/TherapistModalsContainer';
import TherapistProfile from '../modules/therapist/TherapistProfile';
import TherapistSpecialties from '../modules/therapist/TherapistSpecialties';
import TherapistLanguages from '../modules/therapist/TherapistLanguages';
import BeauticianProfileSections from './therapist/BeauticianProfileSections';
import TherapistPriceListModal from '../modules/therapist/TherapistPriceListModal';
import SafePassModal from './modals/SafePassModal';
import { getDynamicSpacing, formatPrice, formatCountdownDisplay, getInitialBookingCount } from '../modules/therapist/therapistHelpers';
import { INDONESIAN_CITIES_CATEGORIZED } from '../constants/indonesianCities';

// Custom hooks for logic extraction
import { useTherapistCardModals } from '../hooks/useTherapistCardModals';
import { useTherapistCardState } from '../hooks/useTherapistCardState';
import { useTherapistCardCalculations } from '../hooks/useTherapistCardCalculations';

// 🔒 PERSISTENT CHAT - Facebook Messenger style
import { usePersistentChatIntegration } from '../hooks/usePersistentChatIntegration';

interface TherapistCardProps {
    therapist: Therapist;
    userLocation?: { lat: number; lng: number } | null; // User's current location for distance calculation
    onRate: (therapist: Therapist) => void;
    onBook: (therapist: Therapist) => void;
    onQuickBookWithChat?: () => void; // ✅ RESTORED: For shared profile booking
    onChatWithBusyTherapist?: (therapist: Therapist) => void; // Chat with busy therapist
    onIncrementAnalytics: (metric: keyof Analytics) => void;
    onShowRegisterPrompt?: () => void; // Show registration popup
    onNavigate?: (page: string) => void;
    onViewPriceList?: (therapist: Therapist) => void; // View price list for premium therapists
    isCustomerLoggedIn?: boolean; // Check if customer is logged in
    activeDiscount?: { percentage: number; expiresAt: Date } | null; // Active discount
    t: any;
    loggedInProviderId?: number | string; // To prevent self-notification
    hideJoinButton?: boolean; // Hide "Therapist Join Free" button (for shared profile pages)
    /** True when on shared profile page – ensures Book/Schedule pass source='share' for reliable booking */
    isSharedProfile?: boolean;
    customVerifiedBadge?: string; // Custom verified badge image URL (for shared profile pages)
    /** Times this profile was shared (shared profile page only; shown over main image) */
    shareCount?: number;
    avatarOffsetPx?: number; // Fine-tune avatar overlap in pixels
    selectedCity?: string; // Selected city for location display override
    /** Controlled selected price key (60/90/120) when parent owns selection state (e.g. profile page sticky bar) */
    selectedPriceKey?: '60' | '90' | '120' | null;
    /** Called when user selects a price container; use with selectedPriceKey for controlled mode */
    onSelectPriceKey?: (key: '60' | '90' | '120' | null) => void;
}

/**
 * Round Button Row Component - Modern booking interface
 * Features:
 * - Three round/pill-shaped buttons
 * - Active state management (only one active at a time)
 * - Color transitions: default orange → active green
 * - Scheduled Bookings default green
 * - Mobile-friendly touch targets
 */
interface RoundButtonRowProps {
    therapist: Therapist;
    onBookNow: () => void;
    onSchedule: () => void;
    onPriceSlider: () => void;
    hasScheduledBookings: boolean;
    /** Spec 6.2: true when user has one scheduled in progress – disable Book and Schedule until payment confirmed or expired */
    hasActiveScheduledBooking?: boolean;
    bookNowText: string;
    scheduleText: string;
    dynamicSpacing: string;
    /** When true, Book button gets a subtle flash animation (e.g. beautician treatment selected). */
    bookButtonFlash?: boolean;
}

/** Guard interval (ms) to avoid running the same action twice from pointer + click in one gesture */
const BUTTON_ACTION_GUARD_MS = 400;

const RoundButtonRow: React.FC<RoundButtonRowProps> = ({
    onBookNow,
    onSchedule,
    onPriceSlider,
    hasScheduledBookings,
    hasActiveScheduledBooking = false,
    bookNowText,
    scheduleText,
    dynamicSpacing,
    bookButtonFlash = false,
}) => {
    const [activeButton, setActiveButton] = useState<'book' | 'schedule' | 'price' | null>(null);
    const lastBookRun = useRef(0);
    const lastScheduleRun = useRef(0);
    const lastPriceRun = useRef(0);
    const bookScheduleDisabled = hasActiveScheduledBooking;
    const disabledTitle = bookScheduleDisabled
        ? 'Complete or cancel your current scheduled booking first'
        : undefined;

    const runBookNow = useCallback((e: React.MouseEvent | React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (bookScheduleDisabled) return;
        const now = Date.now();
        if (now - lastBookRun.current < BUTTON_ACTION_GUARD_MS) return;
        lastBookRun.current = now;
        setActiveButton('book');
        onBookNow();
    }, [bookScheduleDisabled, onBookNow]);

    const runSchedule = useCallback((e: React.MouseEvent | React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (bookScheduleDisabled) return;
        const now = Date.now();
        if (now - lastScheduleRun.current < BUTTON_ACTION_GUARD_MS) return;
        lastScheduleRun.current = now;
        setActiveButton('schedule');
        onSchedule();
    }, [bookScheduleDisabled, onSchedule]);

    const runPriceSlider = useCallback((e: React.MouseEvent | React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const now = Date.now();
        if (now - lastPriceRun.current < BUTTON_ACTION_GUARD_MS) return;
        lastPriceRun.current = now;
        setActiveButton('price');
        onPriceSlider();
    }, [onPriceSlider]);

    /* Same design as Massage City Places profile card: flex gap-2, Book Now + Scheduled filled amber, Menu prices outline amber */
    const filledClass = 'flex-1 py-2.5 rounded-lg font-semibold text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60';
    const outlineClass = 'flex-1 py-2.5 rounded-lg font-semibold text-sm bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 transition-colors';

    return (
        <div className={`relative z-10 flex gap-2 px-4 ${dynamicSpacing}`} style={{ touchAction: 'manipulation' }}>
            <button
                type="button"
                onClick={runBookNow}
                onPointerUp={runBookNow}
                disabled={bookScheduleDisabled}
                title={disabledTitle}
                className={`${filledClass} ${bookButtonFlash && !bookScheduleDisabled ? 'book-now-heartbeat' : ''}`}
                aria-label="Book Now"
            >
                Book Now
            </button>
            <ScheduledBookingButton
                onClick={runSchedule}
                onPointerUp={runSchedule}
                disabled={bookScheduleDisabled}
                title={disabledTitle}
                className={filledClass}
                ariaLabel="Scheduled bookings"
            />
            <PricesButton
                onClick={(e) => { runPriceSlider(e as any); }}
                className={outlineClass}
                ariaLabel="Menu prices"
            />
        </div>
    );
};

/** Single "Book via WhatsApp" + Prices row when in-app booking is disabled. */
interface BookViaWhatsAppRowProps {
    therapist: Therapist;
    locationAreaDisplayName: string;
    selectedCity?: string;
    onPriceSlider: () => void;
    dynamicSpacing: string;
    /** When true, Book button shows busy popup instead of opening WhatsApp */
    isBusy?: boolean;
    /** ISO string when therapist becomes available again */
    busyUntil?: string | null;
    /** When true, Book via WhatsApp button shows heartbeat animation (e.g. beautician treatment selected) */
    bookButtonFlash?: boolean;
    /** When user has selected a price container (60/90/120), use these for the WhatsApp message */
    selectedDuration?: number;
    selectedPrice?: number;
    selectedServiceName?: string;
}

function BookViaWhatsAppRow({ therapist, locationAreaDisplayName, selectedCity, onPriceSlider, dynamicSpacing, isBusy = false, busyUntil, bookButtonFlash = false, selectedDuration, selectedPrice, selectedServiceName }: BookViaWhatsAppRowProps) {
    const [showBusyPopup, setShowBusyPopup] = useState(false);
    const adminDigits = ADMIN_WHATSAPP_DIGITS;
    const phoneForUrl = getBookingWhatsAppNumber(therapist, ADMIN_WHATSAPP || undefined) || adminDigits;
    const defaultData = getDefaultDurationAndPrice(therapist);
    const durationMin = selectedDuration != null && selectedPrice != null && selectedServiceName ? selectedDuration : defaultData.durationMin;
    const price = selectedDuration != null && selectedPrice != null && selectedServiceName ? selectedPrice : defaultData.price;
    const massageType = selectedServiceName || getFirstMassageType(therapist);
    const message = buildBookNowMessage({
        therapistName: therapist.name || 'Therapist',
        therapistId: String(therapist.$id || therapist.id || 'N/A'),
        massageType,
        durationMin,
        price,
        priceFormatted: price >= 1000 ? `IDR ${(price / 1000).toFixed(0)}K` : `IDR ${price}`,
    });
    const whatsappHref = buildWhatsAppUrl(phoneForUrl, message) || `https://wa.me/${adminDigits}?text=${encodeURIComponent(message)}`;

    const handleBookClick = (e: React.MouseEvent) => {
        if (isBusy) {
            e.preventDefault();
            e.stopPropagation();
            setShowBusyPopup(true);
            return;
        }
        logWaClickEvent({
            profileId: String(therapist.$id || therapist.id || ''),
            therapistName: therapist.name || 'Therapist',
            city: locationAreaDisplayName || selectedCity || '',
            country: therapist.country || '',
            source: 'slider_booking',
        });
    };

    return (
        <div className={`relative z-10 flex gap-2 px-4 ${dynamicSpacing}`} style={{ touchAction: 'manipulation' }}>
            <TherapistBusyPopup
                isOpen={showBusyPopup}
                onClose={() => setShowBusyPopup(false)}
                busyUntil={busyUntil}
                providerName={therapist.name || undefined}
            />
            {isBusy ? (
                <BookNowButton
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowBusyPopup(true); }}
                    disabled
                    className="flex-1 flex items-center justify-center min-h-[48px] min-w-[44px] py-2 px-2 !rounded-lg touch-manipulation"
                    ariaLabel="Book via WhatsApp"
                />
            ) : (
                <BookNowButton
                    href={whatsappHref}
                    onClick={handleBookClick}
                    className={`flex-1 flex items-center justify-center min-h-[48px] min-w-[44px] py-2 px-2 !rounded-lg touch-manipulation ${bookButtonFlash ? 'book-now-heartbeat' : ''}`}
                    ariaLabel="Book via WhatsApp"
                />
            )}
            <PricesButton
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onPriceSlider();
                }}
                className="flex-1 flex items-center justify-center min-h-[48px] min-w-[44px] py-2 px-2 !rounded-lg touch-manipulation"
                ariaLabel="Menu Prices"
            />
        </div>
    );
}

const TherapistCard: React.FC<TherapistCardProps> = ({ 
    therapist, 
    userLocation,
    onRate, 
    // onBook, // Removed - using industry standard booking flow instead
    onQuickBookWithChat, // ✅ RESTORED: Use when provided (shared profile)
    onIncrementAnalytics,
    onShowRegisterPrompt,
    onNavigate,
    onViewPriceList,
    isCustomerLoggedIn = false,
    activeDiscount,
    t: _t,
    hideJoinButton = false,
    isSharedProfile = false,
    customVerifiedBadge,
    shareCount,
    loggedInProviderId,
    avatarOffsetPx = 0,
    selectedCity,
    selectedPriceKey: selectedPriceKeyProp,
    onSelectPriceKey: onSelectPriceKeyProp
}) => {
    // Use the translations prop
    const t = _t;
    
    // Debug custom verified badge
    logger.debug('🔍 TherapistCard Debug:', {
        therapistName: therapist.name,
        isVerified: therapist.isVerified,
        customVerifiedBadge: customVerifiedBadge,
        hasCustomBadge: !!customVerifiedBadge
    });
    
    // Load UI configuration from Appwrite
    const { settings: bookNowConfig } = useUIConfig('book_now_behavior');
    const { settings: scheduleConfig } = useUIConfig('schedule_behavior');
    
    // Custom hooks for state and calculations - ✅ FIXED: Proper destructuring + Modal Management
    const {
        showBusyModal,
        setShowBusyModal,
        showReferModal,
        setShowReferModal,
        showLoginRequiredModal,
        setShowLoginRequiredModal,
        showBookingPopup,
        setShowBookingPopup,
        showScheduleBookingPopup,
        setShowScheduleBookingPopup,
        showReviewModal,
        setShowReviewModal,
        showSharePopup,
        setShowSharePopup,
        showPriceListModal,
        setShowPriceListModal,
        showJoinPopup,
        setShowJoinPopup,
        termsAccepted,
        setTermsAccepted,
        // Enhanced modal management functions
        handleBookNowClick,
        closeAllModals
    } = useTherapistCardModals();
    
    // SafePass modal state
    const [showSafePassModal, setShowSafePassModal] = useState(false);
    // Beautician: when user selects a treatment container, Book button flashes
    const [selectedBeauticianTreatmentIndex, setSelectedBeauticianTreatmentIndex] = useState<number | null>(null);
    // Massage price container selection: fingerprint in container, Book Now heartbeat (same as massage city places)
    const [internalPriceKey, setInternalPriceKey] = useState<'60' | '90' | '120' | null>(null);
    const selectedPriceKey = selectedPriceKeyProp !== undefined ? selectedPriceKeyProp : internalPriceKey;
    const setSelectedPriceKey = onSelectPriceKeyProp ?? setInternalPriceKey;

    const {
        menuData,
        setMenuData,
        menuLoadAttempted,
        setMenuLoadAttempted,
        userReferralCode,
        setUserReferralCode,
        selectedServiceIndex,
        setSelectedServiceIndex,
        selectedDuration,
        setSelectedDuration,
        priceSliderBookingSource,
        setPriceSliderBookingSource,
        highlightedCell,
        setHighlightedCell,
        arrivalCountdown,
        setArrivalCountdown,
        shortShareUrl,
        setShortShareUrl,
        animatedPriceIndex,
        countdown,
        setCountdown,
        isOvertime,
        setIsOvertime,
        handleSelectService
    } = useTherapistCardState();
    
    const {
        bookingsCount,
        setBookingsCount,
        getInitialBookingCount,
        joinedDisplay,
        calculateDistance,
        formatCountdown,
        getDynamicSpacing
    } = useTherapistCardCalculations(therapist);
    
    // 🔒 PERSISTENT CHAT - Facebook Messenger style chat window
    const { openBookingChat, openScheduleChat, openPriceChat, openBookingWithService, hasActiveScheduledBooking } = usePersistentChatIntegration();

    /** When on shared profile, ensure all chat opens use source='share' so booking is never blocked by status */
    const openBookingWithServiceWithSource = useCallback(
        (t: Therapist, service: { serviceName: string; duration: number; price: number }, options?: { bookingType?: 'immediate' | 'scheduled'; source?: 'share' | 'profile' | 'search' | null }) => {
            openBookingWithService(t, service, { ...options, source: isSharedProfile ? 'share' : (options?.source ?? null) });
        },
        [openBookingWithService, isSharedProfile]
    );

    /** Open WhatsApp with prefilled Book Now message – user can press Send. No navigation. */
    const openWhatsAppBookNow = useCallback((opts?: { serviceName?: string; durationMin?: number; price?: number }) => {
        const therapistId = therapist.appwriteId || therapist.$id || therapist.id?.toString() || 'N/A';
        const therapistName = therapist.name || 'Therapist';
        const { durationMin, price } = opts ? { durationMin: opts.durationMin ?? 60, price: opts.price ?? getDefaultDurationAndPrice(therapist).price } : getDefaultDurationAndPrice(therapist);
        const massageType = opts?.serviceName || getFirstMassageType(therapist);
        const message = buildBookNowMessage({
            therapistName,
            therapistId,
            massageType,
            durationMin,
            price,
        });
        const adminDigits = ADMIN_WHATSAPP_DIGITS;
        const phone = getBookingWhatsAppNumber(therapist, ADMIN_WHATSAPP || undefined) || adminDigits;
        const url = buildWhatsAppUrl(phone, message) || `https://wa.me/${adminDigits}?text=${encodeURIComponent(message)}`;
        logWaClickEvent?.({ therapistId, type: 'book-now' });
        window.open(url, '_blank', 'noopener,noreferrer');
        onIncrementAnalytics('bookings');
        setBookingsCount(prev => prev + 1);
    }, [therapist, onIncrementAnalytics, setBookingsCount]);

    /** Open WhatsApp with prefilled Scheduled booking message – user can add date/time and press Send. No navigation. */
    const openWhatsAppSchedule = useCallback((opts?: { serviceName?: string; durationMin?: number; price?: number }) => {
        const therapistId = therapist.appwriteId || therapist.$id || therapist.id?.toString() || 'N/A';
        const therapistName = therapist.name || 'Therapist';
        const durationMin = opts?.durationMin ?? getDefaultDurationAndPrice(therapist).durationMin;
        const price = opts?.price ?? getDefaultDurationAndPrice(therapist).price;
        const massageType = opts?.serviceName || getFirstMassageType(therapist);
        const message = buildScheduledBookingMessage({
            therapistName,
            therapistId,
            date: 'To be confirmed',
            time: 'To be confirmed',
            durationMin,
            massageType,
            price,
        });
        const adminDigits = ADMIN_WHATSAPP_DIGITS;
        const phone = getBookingWhatsAppNumber(therapist, ADMIN_WHATSAPP || undefined) || adminDigits;
        const url = buildWhatsAppUrl(phone, message) || `https://wa.me/${adminDigits}?text=${encodeURIComponent(message)}`;
        logWaClickEvent?.({ therapistId, type: 'scheduled' });
        window.open(url, '_blank', 'noopener,noreferrer');
        onIncrementAnalytics('bookings');
        setBookingsCount(prev => prev + 1);
    }, [therapist, onIncrementAnalytics, setBookingsCount]);

    // Debug modal state changes
    useEffect(() => {
        logger.debug('🔄 MODAL STATE CHANGED:', showPriceListModal);
        if (showPriceListModal) {
            logger.debug('✅ Modal is now OPEN');
            logger.debug('🔍 Current location:', window.location.href);
            logger.debug('🔍 Session storage:', sessionStorage.getItem('has_entered_app'));
        }
    }, [showPriceListModal]);

    // LOCKED RULE: Only cleanup on actual unmount, not on re-renders
    // This prevents modal from closing when parent re-renders due to async data loading
    useEffect(() => {
        return () => {
            setShowPriceListModal(false);
        };
    }, []); // ✅ Empty deps = cleanup only fires on component unmount
    
    // Keep price cells stable (no auto-animating highlight)
    useEffect(() => {
        setHighlightedCell(null);
    }, [showPriceListModal]);

    // Remove duplicate - using hook version
    // const handleSelectService = (index: number, duration: '60' | '90' | '120') => {
    //     setSelectedServiceIndex(index);
    //     setSelectedDuration(duration);
    //     setHighlightedCell(null);
    // };
    
    // Countdown timer for booking arrival time (1 hour)
    useEffect(() => {
        if (!showPriceListModal) {
            setArrivalCountdown(3600); // Reset when modal closes
            return;
        }
        
        const interval = setInterval(() => {
            setArrivalCountdown(prev => {
                if (prev <= 0) return 3600; // Reset to 1 hour when it reaches 0
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(interval);
    }, [showPriceListModal]);
    
    // Listen for openPriceMenu event to reopen menu from chat
    useEffect(() => {
        const handleOpenPriceMenu = (event: CustomEvent) => {
            const therapistId = String(therapist.$id || therapist.id);
            if (event.detail?.therapistId === therapistId) {
                setShowPriceListModal(true);
            }
        };
        
        window.addEventListener('openPriceMenu', handleOpenPriceMenu as EventListener);
        return () => window.removeEventListener('openPriceMenu', handleOpenPriceMenu as EventListener);
    }, [therapist]);
    
    // ✅ REMOVED DUPLICATES - Using hook versions:
    // - formatCountdown (from useTherapistCardCalculations)
    // - countdown, setCountdown (from useTherapistCardState)
    // - isOvertime, setIsOvertime (from useTherapistCardState)
    // - bookingsCount, setBookingsCount (from useTherapistCardCalculations)
    // - getInitialBookingCount (from useTherapistCardCalculations)
    // - joinedDisplay (from useTherapistCardCalculations)
    // - getDynamicSpacing (from useTherapistCardCalculations)
    // - calculateDistance (from useTherapistCardCalculations)
    
    const [_discountTimeLeft, _setDiscountTimeLeft] = useState<string>('');

    // Get language context for chat translations
    const { language } = useLanguageContext();
    // Convert to chatTranslationService supported languages (Indonesian app only uses id and en)
    const chatLang: 'en' | 'id' = language === 'id' ? 'id' : 'en';
    
    // Get chat translations
    const bookNowText = chatTranslationService.getTranslation('book_now', chatLang);
    const scheduleText = chatTranslationService.getTranslation('schedule', chatLang);
    
    // Use language from context instead of detecting from translations
    const currentLanguage: 'en' | 'id' = language as 'en' | 'id';

    // Fetch or create short share link from Appwrite
    useEffect(() => {
        const fetchOrCreateShortLink = async () => {
            try {
                const therapistId = String(therapist.$id || therapist.id);
                logger.debug('🔍 Fetching/creating share link for therapist:', therapistId, therapist.name);
                
                // Try to get existing share link or create new one
                const result = await getOrCreateShareLink(
                    'therapist',
                    therapistId,
                    therapist.name,
                    therapist.location
                );
                
                logger.debug('✅ Share link obtained:', result.url);
                setShortShareUrl(result.url);
            } catch (error) {
                logger.error('❌ Failed to fetch/create share link:', error);
                devWarn('Failed to fetch/create share link:', error);
                // Fall back to old URL if share link creation fails
                setShortShareUrl(generateShareableURL(therapist));
            }
        };
        fetchOrCreateShortLink();
    }, [therapist]);

    // Get translated description based on current language
    const getTranslatedDescription = () => {
        const fallbackDesc = `Certified massage therapist with ${therapist.yearsOfExperience || 5}+ years experience. Specialized in therapeutic and relaxation techniques. Available for home, hotel, and villa services. Professional, licensed, and highly rated by clients for exceptional service quality.`;
        
        if (currentLanguage === 'id') {
            // Try Indonesian translation first, fallback to base description, then fallback text
            return therapist.description_id || therapist.description || fallbackDesc;
        } else {
            // Try English translation first, fallback to base description, then fallback text
            return therapist.description_en || therapist.description || fallbackDesc;
        }
    };

    const translatedDescription = getTranslatedDescription();

    // Location parsing for display (show city / first segment)
    const locationCity = therapist.location ? String(therapist.location).split(',')[0].trim() : '';
    
    // ✅ REMOVED DUPLICATE - Using calculateDistance from useTherapistCardCalculations hook
    
    // Extract therapist coordinates and calculate distance
    const therapistDistance = useMemo(() => {
        if (!userLocation) return null;
        
        let therapistCoords = null;
        try {
            if ((therapist as any).geopoint && (therapist as any).geopoint.lat && (therapist as any).geopoint.lng) {
                therapistCoords = (therapist as any).geopoint;
            } else if (therapist.coordinates) {
                if (Array.isArray(therapist.coordinates)) {
                    therapistCoords = ({ lat: therapist.coordinates[1], lng: therapist.coordinates[0] } as any);
                } else if (typeof therapist.coordinates === 'string') {
                    const parsed = JSON.parse(therapist.coordinates);
                    if (Array.isArray(parsed)) {
                        therapistCoords = ({ lat: parsed[1], lng: parsed[0] } as any);
                    } else if (parsed.lat && parsed.lng) {
                        therapistCoords = parsed;
                    }
                } else if ((therapist.coordinates as any)?.lat && (therapist.coordinates as any)?.lng) {
                    therapistCoords = therapist.coordinates;
                }
            }
        } catch (e) {
            logger.warn('Failed to parse therapist coordinates:', e);
        }
        
        if (!therapistCoords) return null;
        
        const distanceMeters = calculateDistance(userLocation, therapistCoords);
        const distanceKm = distanceMeters / 1000;
        
        if (distanceKm < 1) {
            return `${Math.round(distanceMeters)}m away`;
        } else {
            return `${distanceKm.toFixed(1)}km away`;
        }
    }, [userLocation, (therapist as any).geopoint, therapist.coordinates]);
    
    // Countdown timer for active discount
    useEffect(() => {
        if (!activeDiscount) return;
        
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = activeDiscount.expiresAt.getTime() - now;
            
            if (distance < 0) {
                _setDiscountTimeLeft('EXPIRED');
                clearInterval(interval);
                return;
            }
            
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            _setDiscountTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);
        
        return () => clearInterval(interval);
    }, [activeDiscount]);
    
    // Update countdown timer every second if therapist is booked
    useEffect(() => {
        const updateCountdown = () => {
            try {
                const bookedUntil: any = (therapist as any).bookedUntil;
                if (bookedUntil) {
                    const until = new Date(bookedUntil);
                    if (!isNaN(until.getTime())) {
                        const now = new Date();
                        const diff = until.getTime() - now.getTime();
                        
                        if (diff > 0) {
                            // Counting down to zero
                            setIsOvertime(false);
                            const hours = Math.floor(diff / (1000 * 60 * 60));
                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                            
                            if (hours > 0) {
                                setCountdown(`${hours}h ${minutes}m`);
                            } else if (minutes > 0) {
                                setCountdown(`${minutes}m ${seconds}s`);
                            } else {
                                setCountdown(`${seconds}s`);
                            }
                        } else {
                            // Counting up from zero (overtime)
                            setIsOvertime(true);
                            const overtimeDiff = Math.abs(diff);
                            const hours = Math.floor(overtimeDiff / (1000 * 60 * 60));
                            const minutes = Math.floor((overtimeDiff % (1000 * 60 * 60)) / (1000 * 60));
                            const seconds = Math.floor((overtimeDiff % (1000 * 60)) / 1000);
                            
                            if (hours > 0) {
                                setCountdown(`${hours}h ${minutes}m`);
                            } else if (minutes > 0) {
                                setCountdown(`${minutes}m ${seconds}s`);
                            } else {
                                setCountdown(`${seconds}s`);
                            }
                        }
                    }
                }
            } catch {
                setCountdown('');
                setIsOvertime(false);
            }
        };
        
        // Initial update
        updateCountdown();
        
        // Update every second
        const interval = setInterval(updateCountdown, 1000);
        
        return () => clearInterval(interval);
    }, [therapist]);
    
    // Debug Budi's raw data (only in development and reduced verbosity)
    if (process.env.NODE_ENV === 'development' && therapist.name && therapist.name.toLowerCase().includes('budi')) {
        devLog(`🔍 ${therapist.name} status: ${(therapist as any).availability || therapist.status}, busy until: ${therapist.busyUntil}`);
    }
    
    // Map any status value to valid AvailabilityStatus. No Offline in app: logout/app close sets Busy.
    let validStatus = AvailabilityStatus.Busy;
    const statusStr = String((therapist as any).availability || therapist.status || '');
    
    // Special handling for showcase profiles - they should always be busy outside of Yogyakarta
    if ((therapist as any).isShowcaseProfile) {
        validStatus = AvailabilityStatus.Busy;
        logger.debug(`🎭 Showcase profile ${therapist.name} forced to Busy status in ${(therapist as any).showcaseCity}`);
    } else if (statusStr === 'Available' || statusStr === AvailabilityStatus.Available) {
        validStatus = AvailabilityStatus.Available;
    } else if (statusStr === 'Busy' || statusStr === AvailabilityStatus.Busy || statusStr === 'busy') {
        validStatus = AvailabilityStatus.Busy;
    } else if (statusStr === 'Offline' || statusStr === AvailabilityStatus.Offline) {
        validStatus = AvailabilityStatus.Busy; // Display offline as Busy (no offline in app)
    }
    // Default to Busy for any other value (like 'active', null, undefined)
    
    // Ensure therapist has a valid status
    const therapistWithStatus = {
        ...therapist,
        status: validStatus
    };
    
    // Get the initial display status (prefers explicit status/busyUntil/bookedUntil)
    let displayStatus = getDisplayStatus(therapistWithStatus);

    // Fallback: derive status from new schema timestamp fields `available` / `busy`
    // If the explicit status would be Offline (or missing) but we have one of the new fields populated,
    // use those to infer a better display state for cards. (Offline is not used; displayed as Busy.)
    if (displayStatus === AvailabilityStatus.Offline) {
        const availableField = (therapist as any).available as string | undefined;
        const busyField = (therapist as any).busy as string | undefined;
        const hasAvailable = typeof availableField === 'string' && availableField.trim().length > 0;
        const hasBusy = typeof busyField === 'string' && busyField.trim().length > 0;

        // Prefer Busy if both somehow present (defensive). Otherwise choose the one that exists.
        if (hasBusy && !hasAvailable) {
            displayStatus = AvailabilityStatus.Busy;
        } else if (hasAvailable && !hasBusy) {
            displayStatus = AvailabilityStatus.Available;
        } else if (hasBusy && hasAvailable) {
            displayStatus = AvailabilityStatus.Busy; // ambiguous, choose Busy
        }
    }

    const style = statusStyles[displayStatus];
    
    // Note: User referral code initialization has been disabled (coin system removed)
    useEffect(() => {
        if (showReferModal && isCustomerLoggedIn) {
            // Referral code functionality removed
        }
    }, [showReferModal, isCustomerLoggedIn]);

    // Load menu data on component mount for service name display
    useEffect(() => {
        const loadMenu = async () => {
            try {
                // Always load menu data to determine service name for pricing display
                if (true) {
                    const therapistId = String(therapist.$id || therapist.id);
                    logger.debug('🍽️ Loading menu for therapist:', therapistId);
                    logger.debug('🔍 Therapist name:', therapist.name);
                    logger.debug('🔍 Therapist $id:', therapist.$id);
                    logger.debug('🔍 Therapist id:', therapist.id);
                    
                    try {
                        // 🛡️ MENU DATA LOADING - Depends on therapist_menus collection
                        // If collection ID has spaces, this will fail with 400/404 errors
                        // See THERAPIST_MENU_SYSTEM_SAFEGUARDS.md for requirements
                        const menuDoc = await therapistMenusService.getByTherapistId(therapistId);
                        logger.debug('📄 Menu document received:', menuDoc);
                        logger.debug('📄 Menu document ID:', menuDoc?.$id);
                        logger.debug('📄 Menu document therapistId:', menuDoc?.therapistId);
                        logger.debug('📄 Menu document menuData length:', menuDoc?.menuData?.length);
                        
                        if (menuDoc?.menuData) {
                            logger.debug('📄 Raw menuData:', menuDoc.menuData);
                            const parsed = JSON.parse(menuDoc.menuData);
                            logger.debug('📄 Parsed menuData:', parsed);
                            setMenuData(Array.isArray(parsed) ? parsed : []);
                            logger.info('✅ Menu items loaded:', parsed.length);
                        } else {
                            logger.info('ℹ️ No menu data found - using fallback pricing');
                            logger.debug('ℹ️ menuDoc is:', menuDoc);
                            setMenuData([]);
                        }
                    } catch (error: any) {
                        logger.info('ℹ️ Menu collection not available - using fallback pricing:', error.message);
                        logger.error('❌ Full error:', error);
                        logger.error('❌ Error stack:', error.stack);
                        logger.error('❌ Error code:', error.code);
                        logger.error('❌ Error type:', error.type);
                        logger.debug('🔍 Therapist details for debugging:');
                        logger.debug('   - Name:', therapist.name);
                        logger.debug('   - ID:', therapistId);
                        logger.debug('   - $id:', therapist.$id);
                        logger.debug('   - id:', therapist.id);
                        
                        // Don't treat this as an error - just use fallback pricing
                        setMenuData([]);
                    }
                }
            } catch (outerError) {
                logger.error('❌ Outer error in loadMenu:', outerError);
                setMenuData([]);
            } finally {
                setMenuLoadAttempted(true);
            }
        };
        
        loadMenu().catch(error => {
            logger.error('❌ Unhandled promise rejection:', error);
            logger.error('❌ Promise error stack:', error instanceof Error ? error.stack : 'No stack');
        });
    }, [therapist]); // Load menu data when therapist changes, not just when modal opens

    // Handle anonymous review submission
    const handleAnonymousReviewSubmit = async (reviewData: {
        name: string;
        whatsappNumber: string;
        rating: number;
        providerId: string | number;
        providerType: 'therapist' | 'place';
    }) => {
        try {
            await reviewService.createAnonymous({
                providerType: reviewData.providerType,
                providerId: String(reviewData.providerId),
                rating: reviewData.rating,
                reviewerName: reviewData.name,
                reviewContent: `Review by ${reviewData.name}`
            });
            
            setShowReviewModal(false);
            alert('Thank you for your review! 🌟');
            
            // Soft refresh to show updated rating without losing state
            setTimeout(async () => {
                try {
                    const { softRecover } = await import('../utils/softNavigation');
                    softRecover();
                } catch {
                    window.location.reload();
                }
            }, 1000);
        } catch (error) {
            logger.error('Error submitting review:', error);
            throw error;
        }
    };
    
    // Combined menu: real + Traditional from profile (if set) + sample fill to 5. Cheapest from this set for display (same as slider).
    const combinedMenu = getCombinedMenuForDisplay(menuData, therapist);

    // Beautician: combined treatments for slider (real 1–3 + sample fill to 4), same pattern as therapist menu.
    const therapistIdForBeautician = String((therapist as any)?.$id ?? (therapist as any)?.id ?? '');
    const therapistCountry = (therapist as any)?.country ?? (therapist as any)?.countryCode ?? '';
    const isPaidPlanForMenu = (() => {
        const p = String((therapist as any)?.plan ?? (therapist as any)?.membershipPlan ?? (therapist as any)?.membershipTier ?? '').toLowerCase();
        return p !== 'free' && p !== '';
    })();
    const isBeauticianWithTreatments = therapistOffersService(therapist, SERVICE_TYPES.BEAUTICIAN);
    /** Free plan: Menu Prices shows 4 sample treatments that fit category. Paid: dashboard menu (real + sample fill to 4). */
    const combinedBeauticianTreatments = !isBeauticianWithTreatments ? [] : isPaidPlanForMenu
        ? getCombinedBeauticianTreatmentsForDisplay((therapist as any)?.beauticianTreatments, therapistIdForBeautician, therapistCountry)
        : getSampleBeauticianTreatments(therapistIdForBeautician, therapistCountry);

    // Parse pricing - use combined menu so profile shows same cheapest as menu slider
    const getPricing = (): { "60": number; "90": number; "120": number } => {
        if (!menuLoadAttempted) return { "60": 0, "90": 0, "120": 0 };

        if (combinedMenu.length > 0) {
            const cheapest = getCheapestServiceByTotalPrice(combinedMenu);
            if (cheapest) {
                const menuPricing = {
                    "60": Number(cheapest.price60) * 1000,
                    "90": Number(cheapest.price90) * 1000,
                    "120": Number(cheapest.price120) * 1000
                };
                if (menuPricing["60"] > 0 && menuPricing["90"] > 0 && menuPricing["120"] > 0) {
                    devLog(`💰 Using lowest (combined menu) pricing for ${therapist.name}:`, {
                        serviceName: cheapest.name || cheapest.serviceName,
                        menuPricing
                    });
                    return menuPricing;
                }
            }
        }

        const hasAllThreePrices = (
            (therapist.price60 && parseInt(therapist.price60) > 0) &&
            (therapist.price90 && parseInt(therapist.price90) > 0) &&
            (therapist.price120 && parseInt(therapist.price120) > 0)
        );
        if (hasAllThreePrices) {
            return {
                "60": parseInt(therapist.price60!) * 1000,
                "90": parseInt(therapist.price90!) * 1000,
                "120": parseInt(therapist.price120!) * 1000
            };
        }
        const parsedPricing = parsePricing(therapist.pricing) || { "60": 0, "90": 0, "120": 0 };
        const fromJson = {
            "60": parsedPricing["60"] * 1000,
            "90": parsedPricing["90"] * 1000,
            "120": parsedPricing["120"] * 1000
        };
        if (fromJson["60"] > 0 && fromJson["90"] > 0 && fromJson["120"] > 0) return fromJson;
        if (!hasActualPricing(therapist)) {
            const therapistId = String((therapist as any).$id || therapist.id || '');
            if (therapistId) return getSamplePricing(therapistId);
        }
        return fromJson;
    };

    const pricing = getPricing();
    const cheapestService = combinedMenu.length > 0 ? getCheapestServiceByTotalPrice(combinedMenu) : null;
    const cheapestServiceName = cheapestService?.name || (cheapestService as any)?.serviceName || getFirstMassageType(therapist);

    const rawRating = getDisplayRating(therapist.rating, therapist.reviewCount);
    const effectiveRating = rawRating > 0 ? rawRating : 4.8;
    const displayRating = formatRating(effectiveRating);
    
    // Debug pricing for this specific therapist
    devLog(`💰 TherapistCard pricing for ${therapist.name}:`, {
        therapistId: therapist.$id || therapist.id,
        rawPrice60: therapist.price60,
        rawPrice90: therapist.price90,
        rawPrice120: therapist.price120,
        rawPricingJSON: therapist.pricing,
        calculatedPricing: pricing,
        discountPercentage: therapist.discountPercentage
    });
    
    // Debug logging for pricing issues (only when no pricing data)
    const hasAnyPricing = pricing["60"] > 0 || pricing["90"] > 0 || pricing["120"] > 0;
    if (!hasAnyPricing) {
        devWarn(`⚠️ TherapistCard - ${therapist.name} has no pricing data:`, {
            newFormat: {
                price60: therapist.price60,
                price90: therapist.price90,
                price120: therapist.price120
            },
            oldFormat: therapist.pricing,
            parsedPricing: pricing
        });
    }
    // Helper function to format price in 4-character format: "280k"
    const formatPrice = (price: number | string): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        
        if (!numPrice || numPrice === 0 || isNaN(numPrice)) {
            return "Contact"; // Show "Contact" instead of "0k" when no price is set
        }
        
        // Convert to thousands - allow any positive value (e.g. 50k, 75k, 100k+)
        let priceInThousands = Math.round(numPrice / 1000);

        if (priceInThousands < 1) {
            priceInThousands = 1; // Minimum 1k for display
        } else if (priceInThousands > 999) {
            priceInThousands = 999; // Maximum 999k for 4-char display
        }
        
        // Always return exactly 4 characters: 3 digits + "k"
        return `${priceInThousands}k`;
    };
    
    // Single source of truth: same image as profile page (home card + profile page must match exactly). Beautician: random per visit.
    const displayImage = useTherapistDisplayImage(therapist);
    
    const isSvgPlaceholder = typeof displayImage === 'string' && displayImage.startsWith('data:image/svg+xml');
    
    logger.debug('%c🖼️ [TherapistCard] Image Debug', 'background: #9C27B0; color: white; padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 14px;');
    logger.debug('Therapist:', therapist.name, 'displayImage:', displayImage?.slice?.(0, 60) + '...');
    
    if (isSvgPlaceholder) {
        logger.error('%c❌ SVG PLACEHOLDER DETECTED!', 'background: red; color: white; padding: 4px 8px; font-weight: bold;');
        logger.error('This will show as gray box with text/number');
        logger.error('mainImage should be Appwrite or ImageKit URL, not SVG data URL');
    }

    const openWhatsApp = () => {
        devLog('📱 Book Now clicked - showing booking form');
        
        // Pending booking check moved to Appwrite - sessionStorage removed
        // The BookingPopup component handles duplicate booking prevention via Appwrite queries
        
        // OBSOLETE: This function is no longer used
        // BookingPopup component handles all booking flows now
    };

    // Handle booking clicks from price list
    const handleBookingClick = (e: React.MouseEvent, status: 'available' | 'busy' | 'offline', pricing: any) => {
        e.preventDefault();
        e.stopPropagation();
        
        logger.debug('🎯 PRICE SLIDER → handleBookingClick triggered', {
            status,
            selectedDuration,
            selectedServiceIndex,
            pricing
        });
        
        if (status === 'available') {
            // Set booking source to track price slider bookings
            setPriceSliderBookingSource('price-slider');
            logger.debug('✅ Opening PERSISTENT CHAT with pre-selected duration:', selectedDuration);
            
            // 🔒 OPEN PERSISTENT CHAT - Facebook Messenger style
            // This chat window will NEVER disappear once opened
            openPriceChat(therapist, isSharedProfile ? 'share' : null);
        } else {
            // Busy or offline (offline displayed as busy; no offline in app)
            setShowBusyModal(true);
        }
    };

    // Removed handleConfirmBusyContact - chat system deactivated

    // Location display logic - matches TherapistHomeCard exactly
    const therapistLocationArea = (therapist as any)._locationArea || selectedCity;
    
    const getLocationAreaDisplayName = () => {
        // First check if we have a selected city
        if (selectedCity && selectedCity !== 'all') {
            // Get the list of all cities from categories
            const allCities = INDONESIAN_CITIES_CATEGORIZED.flatMap(cat => cat.cities);
            // Normalize selectedCity to lowercase for matching with locationId
            const normalizedSelectedCity = selectedCity.toLowerCase().trim();
            const selectedCityData = allCities.find(city => city.locationId === normalizedSelectedCity || city.name.toLowerCase() === normalizedSelectedCity);
            
            if (selectedCityData) {
                // Add service areas if available
                if (therapist.serviceAreas) {
                    try {
                        const areas = JSON.parse(therapist.serviceAreas);
                        if (Array.isArray(areas) && areas.length > 0) {
                            // Get readable area names (remove city prefix like "jakarta-")
                            const areaNames = areas.map((area: string) => {
                                const parts = area.split('-');
                                return parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
                            }).filter(Boolean);
                            
                            if (areaNames.length > 0) {
                                return `${selectedCityData.name} - ${areaNames.join(', ')}`;
                            }
                        }
                    } catch (e) {
                        // If parsing fails, just show city name
                    }
                }
                
                return selectedCityData.name;
            }
        }
        
        let cityName = '';
        
        if (!therapistLocationArea) {
            // Fallback: use city/locationId/location (never default to "Bali" — was causing Bali to show in Yogyakarta)
            const raw = (therapist as any).city || (therapist as any).locationId || therapist.location || '';
            cityName = (typeof raw === 'string' ? raw : '').split(',')[0].trim() || '—';
        } else {
            const allCities = INDONESIAN_CITIES_CATEGORIZED.flatMap(cat => cat.cities);
            const cityData = allCities.find(city => city.locationId === therapistLocationArea);
            cityName = cityData?.name || therapistLocationArea;
        }
        
        // Add service areas if available
        if (therapist.serviceAreas) {
            try {
                const areas = JSON.parse(therapist.serviceAreas);
                if (Array.isArray(areas) && areas.length > 0) {
                    // Get readable area names (remove city prefix like "jakarta-")
                    const areaNames = areas.map((area: string) => {
                        const parts = area.split('-');
                        return parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
                    }).filter(Boolean);
                    
                    if (areaNames.length > 0) {
                        return `${cityName} - ${areaNames.join(', ')}`;
                    }
                }
            } catch (e) {
                // If parsing fails, just show city name
            }
        }
        
        return cityName;
    };
    
    const locationAreaDisplayName = getLocationAreaDisplayName();

    return (
        <>
            {/* CSS Animations for Discount Effects */}
            <style>{`
                @keyframes cardFlash {
                    0%, 100% { 
                        box-shadow: 0 10px 40px rgba(239, 68, 68, 0.4), 0 0 20px rgba(251, 146, 60, 0.6);
                    }
                    50% { 
                        box-shadow: 0 20px 60px rgba(239, 68, 68, 0.6), 0 0 40px rgba(251, 146, 60, 0.8);
                    }
                }

                @keyframes discountFade {
                    0%, 100% { 
                        opacity: 1;
                    }
                    50% { 
                        opacity: 0.3;
                    }
                }

                .discount-fade {
                    background: linear-gradient(to right, rgb(249, 115, 22), rgb(234, 88, 12));
                    animation: discountFade 2s ease-in-out infinite;
                }

                @keyframes priceRimFade {
                    0%, 100% { 
                        border-color: rgb(251, 146, 60);
                        box-shadow: 0 0 0 2px rgba(251, 146, 60, 0.3), 0 4px 6px -1px rgba(251, 146, 60, 0.5);
                    }
                    50% { 
                        border-color: rgba(251, 146, 60, 0.3);
                        box-shadow: 0 0 0 2px rgba(251, 146, 60, 0.1), 0 4px 6px -1px rgba(251, 146, 60, 0.2);
                    }
                }

                .price-rim-fade {
                    animation: priceRimFade 2s ease-in-out infinite;
                }

                @keyframes book-now-heartbeat {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.5); }
                    50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0.25), 0 0 16px 4px rgba(245, 158, 11, 0.3); }
                }
                .book-now-heartbeat {
                    animation: book-now-heartbeat 1.2s ease-in-out infinite;
                }
            `}</style>
            
            {/* Main Image Banner wrapped in outer card rim (match MassagePlaceCard) */}
            <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 border-t-4 border-t-amber-400 overflow-visible relative active:shadow-xl transition-all touch-manipulation pb-8 shadow-md">
                <TherapistCardHeader
                    therapist={therapist}
                    displayImage={displayImage}
                    onShareClick={() => {
                        // Always open the share popup first
                        setShowSharePopup(true);
                    }}
                    customVerifiedBadge={customVerifiedBadge}
                    bookingsCount={bookingsCount === 0 ? getInitialBookingCount(String(therapist.id || therapist.$id || '')) : bookingsCount}
                    displayRating={displayRating}
                    shareCount={shareCount}
                    isBeautician={isBeauticianWithTreatments}
                />

            {/* Location display - right aligned with pin icon (capital letters on profile) */}
            <div className="px-4 mt-3 flex flex-col items-end">
                <div className="flex items-center gap-1 text-xs text-black font-medium uppercase">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {locationAreaDisplayName}
                </div>
                <div className="text-xs text-amber-500 mt-1 font-medium uppercase">
                    Serves {locationAreaDisplayName} area
                </div>
            </div>

            <TherapistProfile
                therapist={therapist}
                displayStatus={displayStatus}
                isOvertime={isOvertime}
                countdown={countdown}
                customVerifiedBadge={customVerifiedBadge}
            />
            
            {/* Client Preference Display - accepts males/females, no image on right */}
            <div className="mx-4 mb-2">
                <p className="text-xs text-gray-600 text-left">
                    <span className="font-bold">{chatTranslationService.getTranslation('accepts', chatLang)}:</span> {getClientPreferenceDisplay(therapist.clientPreferences, chatLang)}
                </p>
            </div>

            {/* Therapist Bio - Natural flow with proper margin */}
            <div className="therapist-bio-section bg-white/90 backdrop-blur-sm rounded-lg py-2 px-3 shadow-sm mx-4 mb-3">
                <p className="text-sm text-gray-700 leading-5 break-words whitespace-normal line-clamp-6">
                    {translatedDescription}
                </p>
            </div>

            <TherapistSpecialties therapist={therapist} t={t} />

            <TherapistLanguages 
                therapist={therapist}
                getDynamicSpacing={getDynamicSpacing}
                translatedDescriptionLength={translatedDescription.length}
            />

            {/* Beautician: treatments replace Swedish massage + 3 price containers (60/90/120). Slider = 4 items (real + sample). */}
            {isBeauticianWithTreatments ? (
                <div className="px-4 pb-4">
                    <p className="text-xs text-gray-600 mb-2">
                        {chatLang === 'id' ? 'Pilih perawatan di bawah atau buka menu lengkap, lalu Book now atau Schedule.' : 'Select a treatment below or open the full menu, then Book now or Schedule.'}
                    </p>
                    <BeauticianTreatmentCards
                        therapist={therapist}
                        onSelectionChange={(index) => setSelectedBeauticianTreatmentIndex(index)}
                    />
                </div>
            ) : pricing["60"] > 0 && pricing["90"] > 0 && pricing["120"] > 0 ? (
                <TherapistPricingGrid
                    pricing={pricing}
                    therapist={therapist}
                    displayRating={displayRating}
                    animatedPriceIndex={animatedPriceIndex}
                    formatPrice={formatPrice}
                    getDynamicSpacing={getDynamicSpacing}
                    translatedDescriptionLength={translatedDescription.length}
                    menuData={combinedMenu}
                    selectedPriceKey={selectedPriceKey}
                    onSelectPriceKey={setSelectedPriceKey}
                    onPriceClick={() => {
                        logger.debug('💰 Price grid clicked - opening price modal');
                        setShowPriceListModal(true);
                    }}
                />
            ) : null}

            {/* Booking row: when in-app booking disabled, single "Book via WhatsApp" + Prices only */}
            {IN_APP_BOOKING_DISABLED ? (
                <BookViaWhatsAppRow
                    therapist={therapist}
                    locationAreaDisplayName={locationAreaDisplayName}
                    selectedCity={selectedCity}
                    onPriceSlider={() => {
                        logger.debug('💰 [PRICE SLIDER] Opening price modal...');
                        setShowPriceListModal(true);
                    }}
                    dynamicSpacing={getDynamicSpacing('mt-4', 'mt-3', 'mt-3', translatedDescription.length)}
                    isBusy={displayStatus === AvailabilityStatus.Busy}
                    busyUntil={(therapist as any).busyUntil ?? (therapist as any).bookedUntil ?? undefined}
                    bookButtonFlash={isBeauticianWithTreatments && selectedBeauticianTreatmentIndex !== null || !!selectedPriceKey}
                    selectedDuration={selectedPriceKey ? Number(selectedPriceKey) : undefined}
                    selectedPrice={selectedPriceKey && pricing[selectedPriceKey] ? pricing[selectedPriceKey] : undefined}
                    selectedServiceName={selectedPriceKey ? cheapestServiceName : undefined}
                />
            ) : (
                <>
                    <RoundButtonRow
                        therapist={therapist}
                        onBookNow={() => {
                            logger.debug('📱 [BOOK NOW] Opening WhatsApp with prefilled message');
                            if (selectedPriceKey && pricing[selectedPriceKey]) {
                                openWhatsAppBookNow({ serviceName: cheapestServiceName, durationMin: Number(selectedPriceKey), price: pricing[selectedPriceKey] });
                            } else {
                                openWhatsAppBookNow();
                            }
                        }}
                        onSchedule={() => {
                            logger.debug('📱 [SCHEDULE] Opening WhatsApp with prefilled scheduled message');
                            openWhatsAppSchedule();
                        }}
                        onPriceSlider={() => {
                            logger.debug('💰 [PRICE SLIDER] Opening price modal...');
                            setShowPriceListModal(true);
                        }}
                        hasScheduledBookings={!!((therapist.bankName && therapist.accountNumber && therapist.accountName) || (therapist as any).bankCardDetails) && !!((therapist as any).ktpPhotoUrl)}
                        hasActiveScheduledBooking={hasActiveScheduledBooking}
                        bookNowText={bookNowText}
                        scheduleText={scheduleText}
                        dynamicSpacing={getDynamicSpacing('mt-4', 'mt-3', 'mt-3', translatedDescription.length)}
                        bookButtonFlash={isBeauticianWithTreatments && selectedBeauticianTreatmentIndex !== null || !!selectedPriceKey}
                    />
                </>
            )}

            {/* End Content Section wrapper */}
            </div>

            {/* Hotel/Villa Partner Link - Mobile optimized */}
            {(therapist as any).partneredHotelVilla && (
                <div className="mt-3 mb-2 px-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onNavigate) {
                                onNavigate('indastreet-partners');
                            }
                        }}
                        className="w-full bg-gradient-to-r from-amber-50 to-amber-50 border border-amber-200 rounded-lg p-2.5 hover:from-amber-100 hover:to-amber-100 transition-all"
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                                </svg>
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <p className="text-xs font-bold text-amber-900 truncate">
                                    Partnered with {(therapist as any).partneredHotelVilla}
                                </p>
                                <p className="text-[10px] text-amber-700">
                                    View partner hotels & villas →
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
            )}
            
            <TherapistModalsContainer
                therapist={therapist}
                showReviewModal={showReviewModal}
                setShowReviewModal={setShowReviewModal}
                showBusyModal={showBusyModal}
                setShowBusyModal={setShowBusyModal}
                showReferModal={showReferModal}
                setShowReferModal={setShowReferModal}
                showBookingPopup={showBookingPopup}
                setShowBookingPopup={setShowBookingPopup}
                showScheduleBookingPopup={showScheduleBookingPopup}
                setShowScheduleBookingPopup={setShowScheduleBookingPopup}
                showSharePopup={showSharePopup}
                setShowSharePopup={setShowSharePopup}
                showJoinPopup={showJoinPopup}
                setShowJoinPopup={setShowJoinPopup}
                pricing={pricing}
                displayRating={displayRating}
                effectiveRating={effectiveRating}
                displayStatus={displayStatus}
                selectedDuration={selectedDuration}
                priceSliderBookingSource={priceSliderBookingSource}
                setPriceSliderBookingSource={setPriceSliderBookingSource}
                userReferralCode={userReferralCode}
                shortShareUrl={shortShareUrl}
                handleAnonymousReviewSubmit={handleAnonymousReviewSubmit}
            />

            {/* Report Profile Section - Footer Area */}
            <div className="text-center mt-3 mb-2 px-4">
                <button 
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onNavigate) {
                            onNavigate('contact');
                        } else {
                            window.location.href = '/contact';
                        }
                    }}
                    className="inline-flex flex-col items-center cursor-pointer bg-transparent border-none p-0"
                >
                    <span className="text-xs font-semibold text-red-600 hover:text-red-700">Report Profile</span>
                    <span className="text-[10px] text-gray-500">Violates Stated Standards</span>
                </button>
            </div>

            {/* Beautician: Color & Design Chart (and Services I offer, disclaimers) – shown under Report Profile */}
            {isBeauticianWithTreatments && (
                <BeauticianProfileSections therapist={therapist} language={chatLang === 'id' ? 'id' : 'en'} />
            )}

            {isBeauticianWithTreatments ? (
                <BeauticianPriceListModal
                    showModal={showPriceListModal}
                    setShowModal={setShowPriceListModal}
                    therapist={therapist}
                    displayRating={displayRating}
                    treatments={combinedBeauticianTreatments}
                    chatLang={chatLang}
                />
            ) : (
                <TherapistPriceListModal
                    showPriceListModal={showPriceListModal}
                    setShowPriceListModal={setShowPriceListModal}
                    therapist={therapist}
                    displayRating={displayRating}
                    arrivalCountdown={arrivalCountdown.toString()}
                    formatCountdown={formatCountdownDisplay}
                    menuData={menuData}
                    selectedServiceIndex={selectedServiceIndex}
                    selectedDuration={selectedDuration}
                    handleSelectService={handleSelectService}
                    setSelectedServiceIndex={setSelectedServiceIndex}
                    setSelectedDuration={setSelectedDuration}
                    openBookingWithService={openBookingWithServiceWithSource}
                    chatLang={chatLang}
                    showBookingButtons={true}
                    handleBookNowClick={handleBookNowClick}
                    closeAllModals={closeAllModals}
                    onOpenWhatsAppBooking={(type, service) => {
                        if (type === 'immediate') {
                            openWhatsAppBookNow({ serviceName: service.serviceName, durationMin: service.duration, price: service.price });
                        } else {
                            openWhatsAppSchedule({ serviceName: service.serviceName, durationMin: service.duration, price: service.price });
                        }
                        setShowPriceListModal(false);
                    }}
                    bookingNumber={(getBookingWhatsAppNumber(therapist, ADMIN_WHATSAPP || undefined) || ADMIN_WHATSAPP_DIGITS).replace(/\D/g, '').replace(/^0/, '62')}
                    userCountryCode="ID"
                />
            )}
            
            <SafePassModal
                isOpen={showSafePassModal}
                onClose={() => setShowSafePassModal(false)}
                therapistName={getTherapistDisplayName(therapist.name)}
                therapistImage={(therapist as any).profilePicture || therapist.mainImage || (therapist as any).profileImage}
                safePassIssueDate="2025-01-15"
                chatLang={chatLang}
            />
        </>
    );
};

export default TherapistCard;

