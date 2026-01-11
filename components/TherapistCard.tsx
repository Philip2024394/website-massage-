import { useState, useEffect, useMemo } from 'react';
import type { Therapist, Analytics } from '../types';
import { AvailabilityStatus } from '../types';
import { parsePricing, parseMassageTypes, parseCoordinates, parseLanguages } from '../utils/appwriteHelpers';
import { notificationService, reviewService, therapistMenusService, bookingService } from '../lib/appwriteService';
import { getRandomTherapistImage } from '../utils/therapistImageUtils';
import { devLog, devWarn } from '../utils/devMode';
import { getDisplayRating, formatRating } from '../utils/ratingUtils';
import { generateShareableURL } from '../utils/seoSlugGenerator';
import { getOrCreateShareLink } from '../utils/shareLinkGenerator';
import { getAuthAppUrl, getDisplayStatus, isDiscountActive } from '../utils/therapistCardHelpers';
import { shareLinkService } from '../lib/services/shareLinkService';
import { WhatsAppIcon, CalendarIcon, StarIcon } from './therapist/TherapistIcons';
import { statusStyles } from '../constants/therapistCardConstants';

import BookingPopup from './BookingPopup';
import ScheduleBookingPopup from './ScheduleBookingPopup';
import BusyCountdownTimer from './BusyCountdownTimer';
import AnonymousReviewModal from './AnonymousReviewModal';
import SocialSharePopup from './SocialSharePopup';
import TherapistJoinPopup from './TherapistJoinPopup';
import { useUIConfig } from '../hooks/useUIConfig';
import { MessageCircle, Clock, X, FileText } from 'lucide-react';
import { chatTranslationService } from '../services/chatTranslationService';
import { useLanguageContext } from '../context/LanguageContext';
import { getClientPreferenceDisplay } from '../utils/clientPreferencesUtils';
import TherapistCardHeader from './therapist/TherapistCardHeader';
import TherapistPricingGrid from './therapist/TherapistPricingGrid';
import TherapistModalsContainer from './therapist/TherapistModalsContainer';
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
    onQuickBookWithChat?: (therapist: Therapist) => void; // Quick book after WhatsApp
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
    customVerifiedBadge?: string; // Custom verified badge image URL (for shared profile pages)
    avatarOffsetPx?: number; // Fine-tune avatar overlap in pixels
}

const TherapistCard: React.FC<TherapistCardProps> = ({ 
    therapist, 
    userLocation,
    onRate, 
    // onBook, // Removed - using industry standard booking flow instead
    onQuickBookWithChat,
    onIncrementAnalytics,
    onShowRegisterPrompt,
    onNavigate,
    onViewPriceList,
    isCustomerLoggedIn = false,
    activeDiscount,
    t: _t,
    hideJoinButton = false,
    customVerifiedBadge,
    loggedInProviderId,
    avatarOffsetPx = 0
}) => {
    // Use the translations prop
    const t = _t;
    
    // Debug custom verified badge
    console.log('🔍 TherapistCard Debug:', {
        therapistName: therapist.name,
        isVerified: therapist.isVerified,
        customVerifiedBadge: customVerifiedBadge,
        hasCustomBadge: !!customVerifiedBadge
    });
    
    // Load UI configuration from Appwrite
    const { settings: bookNowConfig } = useUIConfig('book_now_behavior');
    const { settings: scheduleConfig } = useUIConfig('schedule_behavior');
    
    // Custom hooks for state and calculations - ✅ FIXED: Proper destructuring
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
        setTermsAccepted
    } = useTherapistCardModals();
    
    const {
        menuData,
        setMenuData,
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
    const { openBookingChat, openScheduleChat, openPriceChat, openBookingWithService } = usePersistentChatIntegration();
    
    // Debug modal state changes
    useEffect(() => {
        console.log('🔄 MODAL STATE CHANGED:', showPriceListModal);
        if (showPriceListModal) {
            console.log('✅ Modal is now OPEN');
            console.log('🔍 Current location:', window.location.href);
            console.log('🔍 Session storage:', sessionStorage.getItem('has_entered_app'));
        }
    }, [showPriceListModal]);

    // Clean up modal state when component unmounts
    useEffect(() => {
        return () => {
            setShowPriceListModal(false);
        };
    }, [setShowPriceListModal]);
    
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
    const chatLang = language === 'gb' ? 'en' : language;
    
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
                console.log('🔍 Fetching/creating share link for therapist:', therapistId, therapist.name);
                
                // Try to get existing share link or create new one
                const result = await getOrCreateShareLink(
                    'therapist',
                    therapistId,
                    therapist.name,
                    therapist.location
                );
                
                console.log('✅ Share link obtained:', result.url);
                setShortShareUrl(result.url);
            } catch (error) {
                console.error('❌ Failed to fetch/create share link:', error);
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
                    therapistCoords = { lat: therapist.coordinates[1], lng: therapist.coordinates[0] };
                } else if (typeof therapist.coordinates === 'string') {
                    const parsed = JSON.parse(therapist.coordinates);
                    if (Array.isArray(parsed)) {
                        therapistCoords = { lat: parsed[1], lng: parsed[0] };
                    } else if (parsed.lat && parsed.lng) {
                        therapistCoords = parsed;
                    }
                } else if ((therapist.coordinates as any)?.lat && (therapist.coordinates as any)?.lng) {
                    therapistCoords = therapist.coordinates;
                }
            }
        } catch (e) {
            console.warn('Failed to parse therapist coordinates:', e);
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
    
    // Map any status value to valid AvailabilityStatus - check availability field first
    let validStatus = AvailabilityStatus.Offline;
    const statusStr = String((therapist as any).availability || therapist.status || '');
    
    // Special handling for showcase profiles - they should always be busy outside of Yogyakarta
    if ((therapist as any).isShowcaseProfile) {
        validStatus = AvailabilityStatus.Busy;
        console.log(`🎭 Showcase profile ${therapist.name} forced to Busy status in ${(therapist as any).showcaseCity}`);
    } else if (statusStr === 'Available' || statusStr === AvailabilityStatus.Available) {
        validStatus = AvailabilityStatus.Available;
    } else if (statusStr === 'Busy' || statusStr === AvailabilityStatus.Busy || statusStr === 'busy') {
        validStatus = AvailabilityStatus.Busy;
    } else if (statusStr === 'Offline' || statusStr === AvailabilityStatus.Offline) {
        validStatus = AvailabilityStatus.Offline;
    }
    // Default to Offline for any other value (like 'active', null, undefined)
    
    // Ensure therapist has a valid status
    const therapistWithStatus = {
        ...therapist,
        status: validStatus
    };
    
    // Get the initial display status (prefers explicit status/busyUntil/bookedUntil)
    let displayStatus = getDisplayStatus(therapistWithStatus);

    // Fallback: derive status from new schema timestamp fields `available` / `busy`
    // If the explicit status is Offline (or missing) but we have one of the new fields populated,
    // use those to infer a better display state for cards.
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

    // Load menu data when price list modal opens
    useEffect(() => {
        const loadMenu = async () => {
            try {
                if (showPriceListModal) {
                    const therapistId = String(therapist.$id || therapist.id);
                    console.log('🍽️ Loading menu for therapist:', therapistId);
                    console.log('🔍 Therapist name:', therapist.name);
                    console.log('🔍 Therapist $id:', therapist.$id);
                    console.log('🔍 Therapist id:', therapist.id);
                    
                    try {
                        // 🛡️ MENU DATA LOADING - Depends on therapist_menus collection
                        // If collection ID has spaces, this will fail with 400/404 errors
                        // See THERAPIST_MENU_SYSTEM_SAFEGUARDS.md for requirements
                        const menuDoc = await therapistMenusService.getByTherapistId(therapistId);
                        console.log('📄 Menu document received:', menuDoc);
                        console.log('📄 Menu document ID:', menuDoc?.$id);
                        console.log('📄 Menu document therapistId:', menuDoc?.therapistId);
                        console.log('📄 Menu document menuData length:', menuDoc?.menuData?.length);
                        
                        if (menuDoc?.menuData) {
                            console.log('📄 Raw menuData:', menuDoc.menuData);
                            const parsed = JSON.parse(menuDoc.menuData);
                            console.log('📄 Parsed menuData:', parsed);
                            setMenuData(Array.isArray(parsed) ? parsed : []);
                            console.log('✅ Menu items loaded:', parsed.length);
                        } else {
                            console.log('ℹ️ No menu data found - using fallback pricing');
                            console.log('ℹ️ menuDoc is:', menuDoc);
                            setMenuData([]);
                        }
                    } catch (error: any) {
                        console.log('ℹ️ Menu collection not available - using fallback pricing:', error.message);
                        console.error('❌ Full error:', error);
                        console.error('❌ Error stack:', error.stack);
                        console.error('❌ Error code:', error.code);
                        console.error('❌ Error type:', error.type);
                        console.log('🔍 Therapist details for debugging:');
                        console.log('   - Name:', therapist.name);
                        console.log('   - ID:', therapistId);
                        console.log('   - $id:', therapist.$id);
                        console.log('   - id:', therapist.id);
                        
                        // Don't treat this as an error - just use fallback pricing
                        setMenuData([]);
                    }
                }
            } catch (outerError) {
                console.error('❌ Outer error in loadMenu:', outerError);
                setMenuData([]);
            }
        };
        
        loadMenu().catch(error => {
            console.error('❌ Unhandled promise rejection:', error);
            console.error('❌ Promise error stack:', error instanceof Error ? error.stack : 'No stack');
        });
    }, [showPriceListModal, therapist]);

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
            
            // Refresh page to show updated rating
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error('Error submitting review:', error);
            throw error;
        }
    };
    
    // Parse pricing - support both new separate fields and old JSON format
    const getPricing = () => {
        // Try new separate fields first (preferred format) - but only if they have valid values
        const hasValidSeparateFields = (
            (therapist.price60 && parseInt(therapist.price60) > 0) ||
            (therapist.price90 && parseInt(therapist.price90) > 0) ||
            (therapist.price120 && parseInt(therapist.price120) > 0)
        );

        if (hasValidSeparateFields) {
            return {
                "60": therapist.price60 ? parseInt(therapist.price60) * 1000 : 0,
                "90": therapist.price90 ? parseInt(therapist.price90) * 1000 : 0,
                "120": therapist.price120 ? parseInt(therapist.price120) * 1000 : 0
            };
        }
        
        // Fallback to old JSON format - multiply by 1000 to get full IDR amounts
        const parsedPricing = parsePricing(therapist.pricing) || { "60": 0, "90": 0, "120": 0 };
        return {
            "60": parsedPricing["60"] * 1000,
            "90": parsedPricing["90"] * 1000,
            "120": parsedPricing["120"] * 1000
        };
    };
    
    const pricing = getPricing();

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
    const massageTypes = parseMassageTypes(therapist.massageTypes) || [];
    
    // Debug logging for massage types and languages
    if (therapist.name === 'phil10' || (therapist as any).$id === '6912d611003551067831') {
        devLog('🔍 CARD DATA DEBUG:', {
            therapistId: therapist.$id || therapist.id,
            therapistName: therapist.name,
            rawMassageTypes: therapist.massageTypes,
            parsedMassageTypes: massageTypes,
            massageTypesCount: massageTypes.length,
            rawLanguages: therapist.languages,
            languagesType: typeof therapist.languages
        });
    }
    
    // Helper function to format price in 4-character format: "280k"
    const formatPrice = (price: number | string): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        
        if (!numPrice || numPrice === 0 || isNaN(numPrice)) {
            return "Contact"; // Show "Contact" instead of "0k" when no price is set
        }
        
        // Convert to thousands and ensure 3-digit format (100-999)
        let priceInThousands = Math.round(numPrice / 1000);
        
        // Ensure 3-digit display (100k-999k range)
        if (priceInThousands < 100) {
            priceInThousands = 100; // Minimum 100k
        } else if (priceInThousands > 999) {
            priceInThousands = 999; // Maximum 999k for 4-char display
        }
        
        // Always return exactly 4 characters: 3 digits + "k"
        return `${priceInThousands}k`;
    };
    
    // Get main image from therapist data - use mainImage for background, profilePicture for overlay
    const mainImage = (therapist as any).mainImage;
    
    // Check if therapist offers Mobile Corporate massage
    const isMobileCorporate = massageTypes.some(type => 
        type.toLowerCase().includes('mobile') || type.toLowerCase().includes('corporate')
    );
    
    // Use corporate image if mobile/corporate massage type exists, otherwise use therapist's mainImage or random fallback
    const displayImage = isMobileCorporate 
        ? 'https://ik.imagekit.io/7grri5v7d/massage%20villa%20service%20indonisea.png?updatedAt=1761583264188'
        : (mainImage || getRandomTherapistImage(therapist.id.toString()));

    const openWhatsApp = () => {
        devLog('📱 Book Now clicked - showing booking form');
        
        // Check if there's already a pending booking
        const pendingBooking = sessionStorage.getItem('pending_booking');
        if (pendingBooking) {
            const parsed = JSON.parse(pendingBooking);
            const deadline = new Date(parsed.deadline);
            if (deadline > new Date()) {
                const minutesLeft = Math.ceil((deadline.getTime() - new Date().getTime()) / 60000);
                alert(`⚠️ You have a pending ${parsed.type} booking with ${parsed.therapistName}.\n\nPlease wait for their response (${minutesLeft} min remaining) before booking with another therapist.`);
                return;
            } else {
                // Expired, clear it
                sessionStorage.removeItem('pending_booking');
            }
        }
        
        // OBSOLETE: This function is no longer used
        // BookingPopup component handles all booking flows now
    };

    // Handle booking clicks from price list
    const handleBookingClick = (e: React.MouseEvent, status: 'available' | 'busy' | 'offline', pricing: any) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🎯 PRICE SLIDER → handleBookingClick triggered', {
            status,
            selectedDuration,
            selectedServiceIndex,
            pricing
        });
        
        if (status === 'available') {
            // Set booking source to track price slider bookings
            setPriceSliderBookingSource('price-slider');
            console.log('✅ Opening PERSISTENT CHAT with pre-selected duration:', selectedDuration);
            
            // 🔒 OPEN PERSISTENT CHAT - Facebook Messenger style
            // This chat window will NEVER disappear once opened
            openPriceChat(therapist);
        } else if (status === 'busy') {
            setShowBusyModal(true);
        } else {
            // Offline - maybe show a different modal or message
            alert('Therapist is currently offline. Please try again later.');
        }
    };

    // Removed handleConfirmBusyContact - chat system deactivated


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

            `}</style>
            
            {/* External meta bar (Joined Date / Free / Orders) */}
            <div className="flex justify-between items-center mb-2 px-2">
                <span className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {joinedDisplay}
                </span>
                {!hideJoinButton && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowJoinPopup(true);
                    }}
                    className="text-[11px] text-green-600 font-semibold flex items-center gap-1 hover:text-green-700 hover:underline transition-colors cursor-pointer"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Therapist Join Free
                </button>
                )}
            </div>
            {/* Main Image Banner wrapped in outer card rim (match MassagePlaceCard) */}
            <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-visible relative active:shadow-xl transition-all touch-manipulation pb-8">
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
                />

            {/* ========================================
             * 🔒 UI DESIGN LOCKED - DO NOT MODIFY
             * Facebook Lock: This layout is finalized
             * Contact admin before making any changes
             * ======================================== */}
            <div className="px-4 mt-2 mb-1 text-right relative z-10">
                <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs font-medium text-gray-700">
                            {(() => {
                                const therapistLocationArea = (therapist as any)._locationArea;
                                if (!therapistLocationArea) {
                                    return (therapist.location || 'Bali').split(',')[0].trim();
                                }
                                const allCities = INDONESIAN_CITIES_CATEGORIZED.flatMap(cat => cat.cities);
                                const cityData = allCities.find(city => city.locationId === therapistLocationArea);
                                return cityData?.name || therapistLocationArea;
                            })()}
                        </span>
                    </div>
                    {/* Serves area - second line */}
                    <div className="text-xs text-orange-500 font-medium">
                        {(() => {
                            const therapistLocationArea = (therapist as any)._locationArea;
                            let name: string;
                            if (!therapistLocationArea) {
                                name = (therapist.location || 'Bali').split(',')[0].trim();
                            } else {
                                const allCities = INDONESIAN_CITIES_CATEGORIZED.flatMap(cat => cat.cities);
                                const cityData = allCities.find(city => city.locationId === therapistLocationArea);
                                name = cityData?.name || therapistLocationArea;
                            }
                            return `Serves ${name} area`;
                        })()}
                    </div>
                </div>
            </div>

            {/* ========================================
             * 🔒 UI DESIGN LOCKED - DO NOT MODIFY
             * Profile positioning and layout finalized
             * ======================================== */}
            {/* Profile Section - Overlapping main image by 30% */}
            <div className="px-4 -mt-24 pb-4 relative z-50 overflow-visible pointer-events-none">
                <div className="flex items-start gap-3">
                    {/* Profile Picture - 30% of card width */}
                    <div className="flex-shrink-0 relative z-50">
                        <div className="w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] md:w-[120px] md:h-[120px] rounded-full overflow-hidden relative">
                            <img 
                                className="w-full h-full object-cover pointer-events-auto border-4 border-white rounded-full" 
                                src={(therapist as any).profilePicture || (therapist as any).mainImage || '/default-avatar.jpg'}
                                alt={`${therapist.name} profile`}
                                loading="lazy"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/default-avatar.jpg';
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================
             * 🔒 UI DESIGN LOCKED - DO NOT MODIFY
             * Name and status positioning finalized
             * 75px offset from left is intentional
             * ======================================== */}
            {/* Name and Status - Below main image, left aligned with 75px offset */}
            <div className="px-4 mt-[2px] mb-3 relative z-40">
                <div className="flex-shrink-0">
                    {/* Name left aligned with offset */}
                    <div className="mb-2 ml-[75px]">
                        <div className="flex items-center gap-2">
                            {/* Verified Badge */}
                            {((therapist as any).verifiedBadge || therapist.isVerified) && (
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/verified-removebg-preview.png?updatedAt=1768015154565"
                                    alt="Verified"
                                    className="w-5 h-5 flex-shrink-0"
                                    title="Verified Therapist"
                                />
                            )}
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                                {therapist.name}
                            </h3>
                        </div>
                    </div>

                    {/* Status Badge - Left aligned with offset */}
                    <div className="overflow-visible flex justify-start ml-[75px]">
                        <div className={`inline-flex items-center px-2.5 rounded-full font-medium whitespace-nowrap ${isOvertime ? 'bg-red-100 text-red-800' : style.bg} ${isOvertime ? '' : style.text}`} style={{paddingTop: '0px', paddingBottom: '0px', lineHeight: '1', fontSize: '10px', transform: 'scaleY(0.9)'}}>
                            {/* Pulsing satellite broadcast ring for Available status */}
                            <span className="relative inline-flex mr-1.5" style={{width: '32px', height: '32px', minWidth: '32px', minHeight: '32px'}}>
                                <span key={`${therapist.$id || therapist.id}-dot`} className={`absolute rounded-full ${isOvertime ? 'bg-red-500' : style.dot} ${style.isAvailable && !isOvertime ? '' : 'animate-pulse'} z-10`} style={{width: '8px', height: '8px', left: '12px', top: '12px'}}></span>
                                {!isOvertime && displayStatus === AvailabilityStatus.Available && (
                                    <React.Fragment key={`${therapist.$id || therapist.id}-rings`}>
                                        <span key={`${therapist.$id || therapist.id}-ring1`} className="absolute rounded-full bg-green-400 opacity-75 animate-ping" style={{width: '20px', height: '20px', left: '6px', top: '6px'}}></span>
                                        <span key={`${therapist.$id || therapist.id}-ring2`} className="absolute rounded-full bg-green-300 opacity-50 animate-ping" style={{width: '28px', height: '28px', left: '2px', top: '2px', animationDuration: '1.5s'}}></span>
                                    </React.Fragment>
                                )}
                                {!isOvertime && displayStatus === AvailabilityStatus.Busy && (
                                    <span key={`${therapist.$id || therapist.id}-busy`} className="absolute inset-0 rounded-full animate-ping bg-yellow-400"></span>
                                )}
                            </span>
                            {displayStatus === AvailabilityStatus.Busy ? (
                                therapist.busyUntil ? (
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs">Busy</span>
                                        <BusyCountdownTimer
                                            endTime={therapist.busyUntil}
                                            onExpired={() => {
                                                devLog('Busy period ended – therapist should be available.');
                                            }}
                                        />
                                    </div>
                                ) : countdown ? (
                                    <span className="text-xs">
                                        {isOvertime ? 'Busy - Extra Time ' : 'Busy - Free in '} {countdown}
                                    </span>
                                ) : (
                                    <span className="text-xs">Busy</span>
                                )
                            ) : (
                                <span className="text-xs">{displayStatus}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Client Preference Display - Left aligned */}
            <div className="mx-4 mb-2 flex items-center justify-between">
                <p className="text-xs text-gray-600 text-left">
                    <span className="font-bold">{chatTranslationService.getTranslation('accepts', chatLang)}:</span> {getClientPreferenceDisplay(therapist.clientPreferences, chatLang)}
                </p>
                <button
                    type="button"
                    onClick={(e) => {
                        console.log('🔴 BUTTON CLICKED - Starting...');
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🍽️ Opening price list modal for:', therapist.name);
                        console.log('🔍 Therapist ID:', therapist.$id || therapist.id);
                        console.log('🔍 Current URL:', window.location.href);
                        console.log('🔍 Session storage has_entered_app:', sessionStorage.getItem('has_entered_app'));
                        try {
                            setShowPriceListModal(true);
                            console.log('✅ Modal state set to true');
                        } catch (error) {
                            console.error('❌ Error setting modal state:', error);
                        }
                    }}
                    className="flex items-center gap-1 text-xs font-medium transition-colors animate-flash-subtle cursor-pointer relative z-10"
                >
                    <style>{`
                        @keyframes flash-subtle {
                            0%, 100% { opacity: 1; }
                            50% { opacity: 0.6; }
                        }
                        .animate-flash-subtle {
                            animation: flash-subtle 2s ease-in-out infinite;
                        }
                    `}</style>
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/massage%20oil%20image.png" 
                        alt="Menu"
                        className="w-12 h-12 object-contain"
                        loading="lazy"
                        decoding="async"
                        width="48"
                        height="48"
                    />
                    <span className="font-bold text-black text-sm">{chatLang === 'id' ? 'Menu Harga' : 'Price Menu'}</span>
                </button>
            </div>

            {/* Therapist Bio - Natural flow with proper margin */}
            <div className="therapist-bio-section bg-white/90 backdrop-blur-sm rounded-lg py-2 px-3 shadow-sm mx-4 mb-3">
                <p className="text-sm text-gray-700 leading-5 break-words whitespace-normal line-clamp-6">
                    {translatedDescription}
                </p>
            </div>

            {/* Content Section - Compact layout */}
            <div className="px-4">
            {/* Massage Specializations - Centered */}
            <div className="border-t border-gray-100 pt-3">
                <div className="mb-2">
                    <h4 className="text-sm font-semibold text-gray-700 text-center">
                        {_t.home?.therapistCard?.experiencedArea || 'Areas of Expertise'}
                    </h4>
                </div>
                <div className="flex flex-wrap gap-1 justify-center">
                    {massageTypes.slice(0, 5).map(type => (
                        <span key={type} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-300">{type}</span>
                    ))}
                    {massageTypes.length === 0 && (
                        <span className="text-xs text-gray-400">No specialties selected</span>
                    )}
                    {massageTypes.length > 5 && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-300">+{massageTypes.length - 5}</span>
                    )}
                </div>
                </div>
            </div>

            {/* Languages Spoken - Compact */}
            {(() => {
                const languages = therapist.languages 
                    ? (typeof therapist.languages === 'string' 
                        ? parseLanguages(therapist.languages) 
                        : therapist.languages)
                    : [];
                
                // Debug in development mode (reduced verbosity)
                if (process.env.NODE_ENV === 'development' && therapist.name?.toLowerCase().includes('budi')) {
                    devLog(`🌐 ${therapist.name} languages:`, languages);
                }
                
                return languages && Array.isArray(languages) && languages.length > 0 && (
                    <div className={`px-4 ${getDynamicSpacing('mt-4', 'mt-3', 'mt-2', translatedDescription.length)}`}>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xs font-semibold text-gray-700">Languages</h4>
                            {therapist.yearsOfExperience && (
                                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    {therapist.yearsOfExperience} years experience
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {languages.slice(0, 3).map(lang => {
                                // Map full language names to flag and display info
                                const langMap: Record<string, {flag: string, name: string}> = {
                                    'english': {flag: '🇬🇧', name: 'EN'},
                                    'indonesian': {flag: '🇮🇩', name: 'ID'},
                                    'mandarin': {flag: '🇨🇳', name: 'ZH'},
                                    'japanese': {flag: '🇯🇵', name: 'JP'},
                                    'korean': {flag: '🇰🇷', name: 'KR'},
                                    'thai': {flag: '🇹🇭', name: 'TH'},
                                    'vietnamese': {flag: '🇻🇳', name: 'VI'},
                                    'french': {flag: '🇫🇷', name: 'FR'},
                                    'german': {flag: '🇩🇪', name: 'DE'},
                                    'spanish': {flag: '🇪🇸', name: 'ES'},
                                    'portuguese': {flag: '🇵🇹', name: 'PT'},
                                    'italian': {flag: '🇮🇹', name: 'IT'},
                                    'russian': {flag: '🇷🇺', name: 'RU'},
                                    'arabic': {flag: '🇸🇦', name: 'AR'},
                                    'hindi': {flag: '🇮🇳', name: 'HI'},
                                    // Also support language codes for backward compatibility
                                    'en': {flag: '🇬🇧', name: 'EN'},
                                    'id': {flag: '🇮🇩', name: 'ID'},
                                    'zh': {flag: '🇨🇳', name: 'ZH'},
                                    'ja': {flag: '🇯🇵', name: 'JP'},
                                    'ko': {flag: '🇰🇷', name: 'KR'},
                                    'th': {flag: '🇹🇭', name: 'TH'},
                                    'vi': {flag: '🇻🇳', name: 'VI'},
                                    'fr': {flag: '🇫🇷', name: 'FR'},
                                    'de': {flag: '🇩🇪', name: 'DE'},
                                    'es': {flag: '🇪🇸', name: 'ES'},
                                    'pt': {flag: '🇵🇹', name: 'PT'},
                                    'it': {flag: '🇮🇹', name: 'IT'},
                                    'ru': {flag: '🇷🇺', name: 'RU'},
                                    'ar': {flag: '🇸🇦', name: 'AR'},
                                    'hi': {flag: '🇮🇳', name: 'HI'}
                                };
                                const langKey = lang.toLowerCase();
                                const langInfo = langMap[langKey] || {flag: '🌐', name: lang.slice(0, 2).toUpperCase()};
                                return (
                                    <span key={lang} className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1">
                                        <span className="text-xs">{langInfo.flag}</span>
                                        <span className="text-xs font-semibold">{langInfo.name}</span>
                                    </span>
                                );
                            })}
                            {languages.length > 3 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">+{languages.length - 3}</span>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* Discount Notice - Shows when discount is active and not expired */}
            {/* Discounted Prices Header */}
            {isDiscountActive(therapist) && (
                <div className={`text-center mb-1 px-4 ${getDynamicSpacing('mt-3', 'mt-2', 'mt-1', translatedDescription.length)}`}>
                    <p className="text-black font-semibold text-sm flex items-center justify-center gap-1">
                        🔥 Discounted Price's Displayed
                    </p>
                </div>
            )}

            <div className="text-center mb-4 mt-2">
                <button
                    onClick={() => {
                        const isSharedProfile = window.location.pathname.includes('/share/');
                        if (isSharedProfile) {
                            // On shared profiles: navigate to mobile terms with custom context in same window
                            const baseUrl = window.location.origin;
                            const currentUrl = window.location.href;
                            window.location.href = `${baseUrl}/mobile-terms-and-conditions?returnTo=${encodeURIComponent(currentUrl)}&context=sharedProfile`;
                        } else {
                            // On home page: go to verification standards page  
                            onNavigate?.('verifiedProBadge');
                        }
                    }}
                    className="text-sm font-medium hover:underline"
                >
                    <span className="text-black">Massage Therapist </span><span className="text-orange-500">Standards</span>
                </button>
            </div>

            <TherapistPricingGrid
                pricing={pricing}
                therapist={therapist}
                displayRating={displayRating}
                animatedPriceIndex={animatedPriceIndex}
                formatPrice={formatPrice}
                getDynamicSpacing={getDynamicSpacing}
                translatedDescriptionLength={translatedDescription.length}
            />

            {/* End Content Section wrapper */}
            </div>

            <div className={`flex gap-2 px-4 ${getDynamicSpacing('mt-4', 'mt-3', 'mt-3', translatedDescription.length)}`}>
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
                        
                        devLog('🟢 Book Now button clicked - opening PERSISTENT CHAT');
                        
                        // 🔒 OPEN PERSISTENT CHAT - Facebook Messenger style
                        // This chat window will NEVER disappear once opened
                        openBookingChat(therapist);
                        
                        onIncrementAnalytics('bookings');
                        setBookingsCount(prev => prev + 1);
                    }}
                    className="w-1/2 flex items-center justify-center gap-1.5 font-bold py-4 px-3 rounded-lg transition-all duration-100 transform touch-manipulation min-h-[48px] bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 active:scale-95"
                >
                    <MessageCircle className="w-4 h-4"/>
                    <span className="text-sm">{bookNowText}</span>
                </button>
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
                        
                        console.log('📅 Schedule button clicked - opening PERSISTENT CHAT');
                        
                        // 🔒 OPEN PERSISTENT CHAT - Facebook Messenger style
                        // This chat window will NEVER disappear once opened
                        openScheduleChat(therapist);
                        
                        onIncrementAnalytics('bookings');
                        // Increment bookings count for UI display
                        setBookingsCount(prev => prev + 1);
                    }} 
                    className="w-1/2 flex items-center justify-center gap-1.5 font-bold py-4 px-3 rounded-lg transition-all duration-100 transform touch-manipulation min-h-[48px] bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 active:scale-95"
                >
                    <CalendarIcon className="w-4 h-4"/>
                    <span className="text-sm">{scheduleText}</span>
                </button>
            </div>

            {/* Terms and Conditions Link - Below booking buttons */}
            <div className="text-center mt-3 px-4">
                <button 
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const isSharedProfile = window.location.pathname.includes('/share/');
                        const baseUrl = window.location.origin;
                        if (isSharedProfile) {
                            const currentUrl = window.location.href;
                            window.open(`${baseUrl}/mobile-terms-and-conditions?returnTo=${encodeURIComponent(currentUrl)}`, '_blank');
                        } else {
                            window.open(`${baseUrl}/mobile-terms-and-conditions`, '_blank');
                        }
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 underline font-medium cursor-pointer bg-transparent border-none p-0"
                >
                    Terms And Conditions
                </button>
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
                        className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-lg p-2.5 hover:from-amber-100 hover:to-orange-100 transition-all"
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                                </svg>
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <p className="text-xs font-bold text-orange-900 truncate">
                                    Partnered with {(therapist as any).partneredHotelVilla}
                                </p>
                                <p className="text-[10px] text-orange-700">
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
            <div className="text-center mt-4 mb-4 px-4">
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
                    <span className="text-sm font-bold text-red-600 hover:text-red-700">Report Profile</span>
                    <span className="text-xs text-gray-500 mt-0.5">Violates Stated Standards</span>
                </button>
            </div>

            {/* Price List Bottom Sheet Slider */}
            {showPriceListModal && (
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
                                    {/* Table Header */}
                                    <div className="grid grid-cols-12 gap-2 bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-2 text-xs font-semibold text-orange-700 border-b border-orange-200">
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
                                                <div key={index} className={`grid grid-cols-12 gap-2 px-3 py-3 transition-colors items-center ${
                                                    isRowSelected ? 'bg-orange-50 border-l-4 border-orange-500' : 'hover:bg-orange-50'
                                                }`}>
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
            )}
        </>
    );
};

export default TherapistCard;