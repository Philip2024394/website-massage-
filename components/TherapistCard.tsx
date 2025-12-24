import { useState, useEffect } from 'react';
import type { Therapist, Analytics } from '../types';
import { AvailabilityStatus } from '../types';
import { parsePricing, parseMassageTypes, parseCoordinates, parseLanguages } from '../utils/appwriteHelpers';
import { notificationService, bookingService, reviewService, therapistMenusService } from '../lib/appwriteService';
import { getRandomTherapistImage } from '../utils/therapistImageUtils';
import { devLog, devWarn } from '../utils/devMode';
import { getDisplayRating, formatRating } from '../utils/ratingUtils';
import { generateShareableURL } from '../utils/seoSlugGenerator';
import { getAuthAppUrl, getDisplayStatus, isDiscountActive } from '../utils/therapistCardHelpers';
import { shareLinkService } from '../lib/services/shareLinkService';
import { WhatsAppIcon, CalendarIcon, StarIcon } from './therapist/TherapistIcons';
import { statusStyles } from '../constants/therapistCardConstants';
import DistanceDisplay from './DistanceDisplay';
import BookingConfirmationPopup from './BookingConfirmationPopup';
import BookingFormPopup, { BookingData } from './BookingFormPopup';
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
    loggedInProviderId
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
    
    const [showBusyModal, setShowBusyModal] = useState(false);
    const [showReferModal, setShowReferModal] = useState(false);
    const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
    const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [showPriceListModal, setShowPriceListModal] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [menuData, setMenuData] = useState<any[]>([]);
    const [userReferralCode, setUserReferralCode] = useState<string>('');
    const [selectedServiceIndex, setSelectedServiceIndex] = useState<number | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<'60' | '90' | '120' | null>(null);
    const [highlightedCell, setHighlightedCell] = useState<{serviceIndex: number, duration: '60' | '90' | '120'} | null>(null);
    const [arrivalCountdown, setArrivalCountdown] = useState<number>(3600); // 1 hour in seconds
    const [shortShareUrl, setShortShareUrl] = useState<string>(''); // Short link from share_links collection
    const [showJoinPopup, setShowJoinPopup] = useState(false);
    
    // Debug modal state changes
    useEffect(() => {
        console.log('🔄 MODAL STATE CHANGED:', showPriceListModal);
        if (showPriceListModal) {
            console.log('✅ Modal is now OPEN');
            console.log('🔍 Current location:', window.location.href);
            console.log('🔍 Session storage:', sessionStorage.getItem('has_entered_app'));
        }
    }, [showPriceListModal]);
    
    // Keep price cells stable (no auto-animating highlight)
    useEffect(() => {
        setHighlightedCell(null);
    }, [showPriceListModal]);

    const handleSelectService = (index: number, duration: '60' | '90' | '120') => {
        setSelectedServiceIndex(index);
        setSelectedDuration(duration);
        setHighlightedCell(null);
    };
    
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
    
    // Format countdown as HH:MM:SS
    const formatCountdown = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const [countdown, setCountdown] = useState<string>('');
    const [isOvertime, setIsOvertime] = useState(false);
    const [_discountTimeLeft, _setDiscountTimeLeft] = useState<string>('');
    // Orders count sourced from persisted analytics JSON or actual bookings
    const [bookingsCount, setBookingsCount] = useState<number>(() => {
        try {
            if (therapist.analytics) {
                const parsed = JSON.parse(therapist.analytics);
                if (parsed && typeof parsed.bookings === 'number') return parsed.bookings;
            }
        } catch {}
        return 0;
    });

    // Fallback: derive bookings count from bookings collection if analytics not populated
    useEffect(() => {
        const loadBookingsCount = async () => {
            try {
                const providerId = String((therapist as any).id || (therapist as any).$id || '');
                if (!providerId) return;
                const bookingDocs = await bookingService.getByProvider(providerId, 'therapist');
                if (Array.isArray(bookingDocs)) {
                    setBookingsCount(bookingDocs.length);
                }
            } catch (e) {
                // Silent fallback
            }
        };
        loadBookingsCount();
    }, [therapist]);

    // Generate consistent fake booking count for new therapists (18-26)
    const getInitialBookingCount = (therapistId: string): number => {
        // Create a simple hash from therapist ID for consistent random number
        let hash = 0;
        for (let i = 0; i < therapistId.length; i++) {
            hash = ((hash << 5) - hash) + therapistId.charCodeAt(i);
            hash = hash & hash; // Convert to 32bit integer
        }
        // Generate number between 18-26 based on hash
        return 18 + (Math.abs(hash) % 9);
    };

    const joinedDateRaw = therapist.membershipStartDate || therapist.activeMembershipDate || (therapist as any).$createdAt;
    const joinedDisplay = (() => {
        if (!joinedDateRaw) return '—';
        try {
            const d = new Date(joinedDateRaw);
            if (isNaN(d.getTime())) return '—';
            return d.toLocaleDateString('en-GB');
        } catch {
            return '—';
        }
    })();
    
    // Helper function to calculate dynamic spacing based on description length
    const getDynamicSpacing = (longSpacing: string, mediumSpacing: string, shortSpacing: string) => {
        const descriptionLength = translatedDescription.length;
        
        // If description is short (less than 200 chars), use minimum spacing  
        if (descriptionLength < 200) return shortSpacing;
        // If description is medium (200-300 chars), use reduced spacing
        if (descriptionLength < 300) return mediumSpacing;
        // If description is long (300+ chars), use standard spacing
        return longSpacing;
    };

    // Get language context for chat translations
    const { language } = useLanguageContext();
    const chatLang = language === 'gb' ? 'en' : language;
    
    // Get chat translations
    const bookNowText = chatTranslationService.getTranslation('book_now', chatLang);
    const scheduleText = chatTranslationService.getTranslation('schedule', chatLang);
    
    // Use language from context instead of detecting from translations
    const currentLanguage: 'en' | 'id' = language as 'en' | 'id';

    // Fetch short share link from Appwrite (if exists)
    useEffect(() => {
        const fetchShortLink = async () => {
            try {
                const therapistId = String(therapist.$id || therapist.id);
                console.log('🔍 Fetching short link for therapist:', therapistId, therapist.name);
                const shareLink = await shareLinkService.getByEntity('therapist', therapistId);
                console.log('📦 Share link result:', shareLink);
                if (shareLink) {
                    const shortUrl = `https://www.indastreetmassage.com/share/${shareLink.shortId}`;
                    console.log('✅ Setting short URL:', shortUrl);
                    setShortShareUrl(shortUrl);
                } else {
                    console.log('⚠️ No share link found, using fallback');
                    setShortShareUrl(generateShareableURL(therapist));
                }
            } catch (error) {
                console.error('❌ Failed to fetch short link:', error);
                devWarn('Failed to fetch short link:', error);
                // Fall back to old URL if short link not found
                setShortShareUrl(generateShareableURL(therapist));
            }
        };
        fetchShortLink();
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
    
    if (statusStr === 'Available' || statusStr === AvailabilityStatus.Available) {
        validStatus = AvailabilityStatus.Available;
    } else if (statusStr === 'Busy' || statusStr === AvailabilityStatus.Busy) {
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
                providerName: therapist.name,
                rating: reviewData.rating,
                reviewerName: reviewData.name,
                whatsappNumber: reviewData.whatsappNumber
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
        
        // Check if therapist is busy
        if (displayStatus === AvailabilityStatus.Busy) {
            setShowBusyModal(true);
        } else {
            // Show booking form popup
            setShowBookingForm(true);
        }
    };

    const handleBookingSubmit = async (bookingData: BookingData) => {
        devLog('✅ Booking submitted:', bookingData);
        
        // Check if there's already a pending booking
        const pendingBooking = sessionStorage.getItem('pending_booking');
        if (pendingBooking) {
            const parsed = JSON.parse(pendingBooking);
            const deadline = new Date(parsed.deadline);
            if (deadline > new Date()) {
                alert(`⚠️ You have a pending booking with ${parsed.therapistName}. Please wait for their response before booking with another therapist.`);
                setShowBookingForm(false);
                return;
            } else {
                // Expired, clear it
                sessionStorage.removeItem('pending_booking');
            }
        }
        
        // Close booking form
        setShowBookingForm(false);

        // Create booking message with all details
        const locationInfo = bookingData.locationType === 'hotel'
            ? `🏨 Hotel/Villa: ${bookingData.address}\n🚪 Room: ${bookingData.roomNumber}`
            : `🏠 Home Address: ${bookingData.address}`;

        const coordinatesInfo = bookingData.coordinates
            ? `\n📍 GPS: ${bookingData.coordinates.lat.toFixed(6)}, ${bookingData.coordinates.lng.toFixed(6)}`
            : '';

        const bookingMessage = `🎯 NEW BOOKING REQUEST

👤 Customer: ${bookingData.customerName}
⏱️ Duration: ${bookingData.duration} minutes
💰 Price: ${bookingData.price}

📍 Location:
${locationInfo}${coordinatesInfo}

📝 Please confirm availability and arrival time.`;

        try {
            // Send notification to therapist with sound
            const therapistIdNum = typeof therapist.id === 'string' ? parseInt(therapist.id) : therapist.id;
            
            // Set 15-minute deadline
            const deadline = new Date();
            deadline.setMinutes(deadline.getMinutes() + 15);
            
            // Create booking in database
            const booking = await bookingService.create({
                providerId: therapistIdNum.toString(),
                providerType: 'therapist' as const,
                providerName: therapist.name,
                userId: loggedInProviderId?.toString(),
                userName: bookingData.customerName,
                service: bookingData.duration.toString() as '60' | '90' | '120',
                startTime: new Date().toISOString(),
                duration: bookingData.duration,
                totalCost: parseFloat(bookingData.price),
                paymentMethod: 'Unpaid'
            });

            // Lock booking - store pending booking info
            sessionStorage.setItem('pending_booking', JSON.stringify({
                bookingId: booking.$id || booking.id,
                therapistId: therapistIdNum,
                therapistName: therapist.name,
                deadline: deadline.toISOString(),
                type: 'immediate'
            }));
            
            devLog('🔒 Booking locked until:', deadline.toISOString());

            // Increment bookings count for UI display
            setBookingsCount(prev => prev + 1);

            // Send notification to therapist
            await notificationService.create({
                providerId: therapistIdNum,
                message: `New booking request from ${bookingData.customerName} for ${bookingData.duration} minutes`,
                type: 'booking_request'
            });
            
            devLog('🔔 Booking notification sent to therapist with MP3 sound');

            // Open in-app chat window with booking message and lock indication
            if (onQuickBookWithChat) {
                setTimeout(() => {
                    devLog('💬 Opening in-app chat with booking details (locked until response)');
                    onQuickBookWithChat(therapist);
                }, 300);
            } else {
                // Fallback: dispatch event to open chat
                const normalizedStatus = displayStatus.toLowerCase() as 'available' | 'busy' | 'offline';
                window.dispatchEvent(new CustomEvent('openChat', {
                    detail: {
                        therapistId: therapistIdNum,
                        therapistName: therapist.name,
                        therapistStatus: normalizedStatus,
                        initialMessage: bookingMessage,
                        profilePicture: (therapist as any).profilePicture || (therapist as any).mainImage,
                        pricing: pricing
                    }
                }));
            }

        } catch (error) {
            console.error('❌ Error creating booking:', error);
            alert('Failed to create booking. Please try again.');
        }
    };

    // Handle confirmed booking - called after BookingConfirmationPopup
    const handleConfirmedBooking = () => {
        devLog('✅ Booking confirmed - sending WhatsApp message and opening chat');
        
        // Send notification to therapist
        const therapistIdNum = typeof therapist.id === 'string' ? parseInt(therapist.id) : therapist.id;
        if (loggedInProviderId !== therapistIdNum) {
            notificationService.createWhatsAppContactNotification(
                therapistIdNum
            ).catch(err => devLog('Notification failed:', err));
        }

        // Play booking confirmation sound
        try {
            const audio = new Audio('/sounds/booking-notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(err => devLog('Sound play failed:', err));
        } catch (error) {
            devLog('Could not play confirmation sound:', error);
        }

        // Increment analytics
        onIncrementAnalytics('whatsapp_clicks');
        
        // Create structured WhatsApp message with booking details
        const currentTime = new Date().toLocaleString();
        const message = `🎯 BOOKING REQUEST - INDASTREET

👤 Customer: [Customer will provide name in chat]
📱 Contact: [Customer WhatsApp]
⏰ Requested Time: ${currentTime}
💼 Service: Professional Massage
🏆 Provider: ${therapist.name}
⭐ Rating: ${displayRating}/5

💬 NEXT STEP: Customer will confirm details in this chat.

📞 INDASTREET SUPPORT: +62-XXX-XXXX`;

        // Open WhatsApp with structured message
        window.open(`https://wa.me/${therapist.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
        
        // Open chat window for real-time communication
        if (onQuickBookWithChat) {
            setTimeout(() => {
                onQuickBookWithChat(therapist);
            }, 500);
        }
    };

    // Handle booking clicks from price list
    const handleBookingClick = (e: React.MouseEvent, status: 'available' | 'busy' | 'offline', pricing: any) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (status === 'available') {
            if (!isCustomerLoggedIn) {
                onShowRegisterPrompt?.();
                return;
            }
            setShowBookingConfirmation(true);
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

            {/* Profile Section - Flexbox layout aligned to MassagePlaceCard */}
            <div className="px-6 -mt-10 sm:-mt-16 pb-6 relative z-10 overflow-visible">
                <div className="flex items-start justify-between gap-4">
                    {/* Left side: Profile + Name + Status */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Profile Image */}
                        <div className="flex-shrink-0 relative z-20 p-2">
                            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-sm relative aspect-square overflow-visible ring-2 ring-orange-100">
                                {(therapist as any).profilePicture && (therapist as any).profilePicture.includes('appwrite.io') ? (
                                    <img 
                                        className="w-full h-full rounded-full object-cover aspect-square" 
                                        src={(therapist as any).profilePicture} 
                                        alt={`${therapist.name} profile`} 
                                        onError={(e) => {
                                            const imgElement = e.target as HTMLImageElement;
                                            imgElement.style.display = 'none';
                                            const placeholder = imgElement.parentElement?.querySelector('.profile-placeholder') as HTMLElement;
                                            if (placeholder) placeholder.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                
                                <div 
                                    className="profile-placeholder w-full h-full rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-600"
                                    style={{ 
                                        display: (therapist as any).profilePicture && (therapist as any).profilePicture.includes('appwrite.io') ? 'none' : 'flex',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {therapist.name ? therapist.name.charAt(0).toUpperCase() : '👤'}
                                </div>
                            </div>
                        </div>
                        
                        {/* Name and Status Column */}
                        <div className="flex-1 pt-12 sm:pt-14 pb-3 overflow-visible">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate mb-1 mt-4">{therapist.name}</h3>
                            <div className="overflow-visible">
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${isOvertime ? 'bg-red-100 text-red-800' : style.bg} ${isOvertime ? '' : style.text}`}>
                    <span className="relative mr-1.5">
                        {displayStatus === AvailabilityStatus.Available && (
                            <>
                                {/* Static ring glow effect for Available status */}
                                <span className="absolute inset-0 w-4 h-4 -left-1 -top-1 rounded-full bg-green-300 opacity-40"></span>
                                <span className="absolute inset-0 w-3 h-3 -left-0.5 -top-0.5 rounded-full bg-green-400 opacity-30"></span>
                            </>
                        )}
                        <span className={`w-2 h-2 rounded-full block status-indicator relative ${isOvertime ? 'bg-red-500' : style.dot}`}>
                            {!isOvertime && (displayStatus === AvailabilityStatus.Available || displayStatus === AvailabilityStatus.Busy) && (
                                <span className={`absolute inset-0 rounded-full animate-ping ${
                                    displayStatus === AvailabilityStatus.Available ? 'bg-green-400' : 'bg-yellow-400'
                                }`}></span>
                            )}
                        </span>
                    </span>
                                        {displayStatus === AvailabilityStatus.Busy ? (
                                            therapist.busyUntil ? (
                                                <div className="flex items-center gap-1">
                                                    <span>Busy</span>
                                                    <BusyCountdownTimer
                                                        endTime={therapist.busyUntil}
                                                        onExpired={() => {
                                                            devLog('Busy period ended – therapist should be available.');
                                                        }}
                                                    />
                                                </div>
                                            ) : countdown ? (
                                                <span>
                                                    {isOvertime ? 'Busy - Extra Time ' : 'Busy - Free in '} {countdown}
                                                </span>
                                            ) : (
                                                <span>Busy</span>
                                            )
                                        ) : (
                                            displayStatus
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right side: Distance */}
                    <div className="flex-shrink-0 pb-3 pt-12 sm:pt-14 mt-6">
                        <DistanceDisplay
                            userLocation={userLocation}
                            providerLocation={parseCoordinates(therapist.coordinates) || { lat: 0, lng: 0 }}
                            className="text-gray-700"
                            showTravelTime={false}
                            showIcon={true}
                            size="sm"
                        />
                    </div>
                </div>
            </div>
            
            {/* Client Preference Display - Left aligned */}
            <div className="mx-4 mb-2 flex items-center justify-between">
                <p className="text-xs text-gray-600 text-left">
                    <span className="font-bold">{chatTranslationService.getTranslation('accepts', chatLang)}:</span> {getClientPreferenceDisplay(therapist.clientPreferences, chatLang)}
                </p>
                <button
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
                    className="flex items-center gap-1 text-xs font-medium transition-colors animate-flash-subtle"
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
                    <h4 className="text-xs font-semibold text-gray-700 text-center">
                        {_t.home?.therapistCard?.experiencedArea || 'Areas of Expertise'}
                    </h4>
                </div>
                <div className="flex flex-wrap gap-1 justify-center">
                    {massageTypes.slice(0, 5).map(type => (
                        <span key={type} className="px-2 py-0.5 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-gray-700/50">{type}</span>
                    ))}
                    {massageTypes.length === 0 && (
                        <span className="text-xs text-gray-400">No specialties selected</span>
                    )}
                    {massageTypes.length > 5 && (
                        <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full">+{massageTypes.length - 5}</span>
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
                    <div className={`px-4 ${getDynamicSpacing('mt-4', 'mt-3', 'mt-2')}`}>
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
            {/* Massage Therapist Standards Link - Different targets for shared profiles vs home page */}
            <div className="text-center mb-2 mt-2">
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

            {/* Discounted Prices Header */}
            {isDiscountActive(therapist) && (
                <div className={`text-center mb-1 px-4 ${getDynamicSpacing('mt-3', 'mt-2', 'mt-1')}`}>
                    <p className="text-black font-semibold text-sm flex items-center justify-center gap-1">
                        🔥 Discounted Price's Displayed
                    </p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-center text-sm mt-1 px-4">
                {/* 60 min pricing */}
                <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-300 min-h-[75px] flex flex-col justify-center ${
                    isDiscountActive(therapist)
                        ? 'bg-gray-100 border-orange-500 border-2 price-rim-fade' 
                        : 'bg-gray-100 border-gray-200'
                }`}>
                    {/* Star Rating - Top Right */}
                    {displayRating && (
                        <div className="absolute top-1.5 right-1.5 bg-yellow-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {displayRating}
                        </div>
                    )}
                    <p className="text-gray-600 text-xs mb-1">60 min</p>
                    {isDiscountActive(therapist) ? (
                        <>
                            <p className="font-bold text-gray-800 text-sm leading-tight">
                                IDR {formatPrice(Math.round(Number(pricing["60"]) * (1 - (therapist.discountPercentage || 0) / 100)))}
                            </p>
                            <p className="text-[11px] text-gray-500 line-through">
                                IDR {formatPrice(Number(pricing["60"]))}
                            </p>
                        </>
                    ) : (
                        <p className="font-bold text-gray-800 text-sm leading-tight">
                            IDR {formatPrice(Number(pricing["60"]))}
                        </p>
                    )}
                </div>

                {/* 90 min pricing */}
                <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-300 min-h-[75px] flex flex-col justify-center ${
                    isDiscountActive(therapist)
                        ? 'bg-gray-100 border-orange-500 border-2 price-rim-fade' 
                        : 'bg-gray-100 border-gray-200'
                }`}>
                    {/* Star Rating - Top Right */}
                    {displayRating && (
                        <div className="absolute top-1.5 right-1.5 bg-yellow-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {displayRating}
                        </div>
                    )}
                    <p className="text-gray-600 text-xs mb-1">90 min</p>
                    {isDiscountActive(therapist) ? (
                        <p className="font-bold text-gray-800 text-sm leading-tight">
                            IDR {formatPrice(Math.round(Number(pricing["90"]) * (1 - (therapist.discountPercentage || 0) / 100)))}
                        </p>
                    ) : (
                        <p className="font-bold text-gray-800 text-sm leading-tight">
                            IDR {formatPrice(Number(pricing["90"]))}
                        </p>
                    )}
                </div>
                
                {/* 120 min pricing */}
                <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-300 min-h-[75px] flex flex-col justify-center ${
                    isDiscountActive(therapist)
                        ? 'bg-gray-100 border-orange-500 border-2 price-rim-fade' 
                        : 'bg-gray-100 border-gray-200'
                }`}>
                    {/* Star Rating - Top Right */}
                    {displayRating && (
                        <div className="absolute top-1.5 right-1.5 bg-yellow-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {displayRating}
                        </div>
                    )}
                    <p className="text-gray-600 text-xs mb-1">120 min</p>
                    {isDiscountActive(therapist) ? (
                        <p className="font-bold text-gray-800 text-sm leading-tight">
                            IDR {formatPrice(Math.round(Number(pricing["120"]) * (1 - (therapist.discountPercentage || 0) / 100)))}
                        </p>
                    ) : (
                        <p className="font-bold text-gray-800 text-sm leading-tight">
                            IDR {formatPrice(Number(pricing["120"]))}
                        </p>
                    )}
                </div>
            </div>

            <div className={`flex gap-2 px-4 ${getDynamicSpacing('mt-4', 'mt-3', 'mt-3')}`}>
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
                        
                        devLog('🟢 Book Now button clicked - opening chat window');
                        const pricing = getPricing();
                        devLog('👤 Therapist object:', { 
                            id: therapist.id, 
                            name: therapist.name, 
                            status: therapist.status,
                            pricing: pricing,
                            fullObject: therapist 
                        });
                        
        // Final status debugging for Budi
        if (therapist.name && (therapist.name.toLowerCase().includes('budi') || therapist.name === 'Budi')) {
            console.log('🎯 BUDI STATUS DEBUG:');
            console.log('  Raw Appwrite availability:', (therapist as any).availability);
            console.log('  Raw Appwrite status:', therapist.status);
            console.log('  Card calculates and shows:', displayStatus);
            console.log('  ✅ FIXED: Converting', displayStatus, '→', displayStatus.toLowerCase(), 'for ChatWindow');
        }                        // Open chat window directly with registration flow
                        console.log('🔵 TherapistCard dispatching openChat:', { 
                            therapistName: therapist.name, 
                            displayStatus: displayStatus,
                            availability: (therapist as any).availability,
                            status: therapist.status 
                        });
                        // Convert displayStatus to lowercase format expected by ChatWindow
                        const normalizedStatus = displayStatus.toLowerCase() as 'available' | 'busy' | 'offline';
                        
                        window.dispatchEvent(new CustomEvent('openChat', {
                            detail: {
                                therapistId: typeof therapist.id === 'string' ? therapist.id : therapist.id?.toString(),
                                therapistName: therapist.name,
                                therapistType: 'therapist',
                                therapistStatus: normalizedStatus, // Use normalized lowercase status
                                pricing: pricing,
                                profilePicture: (therapist as any).profilePicture || (therapist as any).mainImage,
                                providerRating: effectiveRating,
                                discountPercentage: therapist.discountPercentage || 0,
                                discountActive: isDiscountActive(therapist),
                                mode: 'immediate'
                            }
                        }));
                    }}
                    className="w-1/2 flex items-center justify-center gap-1.5 font-bold py-4 px-3 rounded-lg transition-all duration-100 transform touch-manipulation min-h-[48px] bg-green-500 text-white hover:bg-green-600 active:bg-green-700 active:scale-95"
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
                        
                        console.log('📅 Schedule button clicked - opening popup');
                        
                        // Open ChatWindow directly in scheduled mode
                        console.log('📅 Schedule button clicked - opening chat in scheduled mode');
                        window.dispatchEvent(new CustomEvent('openChat', {
                            detail: {
                                therapistId: typeof therapist.id === 'string' ? therapist.id : therapist.id?.toString(),
                                therapistName: therapist.name,
                                therapistType: 'therapist',
                                therapistStatus: displayStatus.toLowerCase(),
                                pricing: pricing,
                                profilePicture: therapist.profilePicture || therapist.mainImage,
                                providerRating: effectiveRating,
                                discountPercentage: therapist.discountPercentage || 0,
                                discountActive: isDiscountActive(therapist),
                                mode: 'scheduled'
                            }
                        }));
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
                    Terms and Conditions
                </button>
            </div>

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
            
            {/* Busy Therapist Confirmation Modal */}
            {showBusyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fadeIn">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">⏳</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Therapist Currently Busy</h3>
                            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                This therapist is currently booked and unavailable. Please try booking another available therapist or check back later.
                            </p>
                            <p className="text-sm font-semibold text-orange-600 mb-6">- <span className="text-black">Inda</span><span className="text-orange-500">street</span> Admin</p>
                            
                            <button
                                onClick={() => setShowBusyModal(false)}
                                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Refer Friend Modal */}
            {showReferModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowReferModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-[88vw] max-h-[80vh] sm:max-w-xs md:max-w-sm p-3 sm:p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3 sm:mb-4">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/refer%20a%20friend.png"
                                    alt="Refer a Friend"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Refer a Friend</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Share IndaStreet with friends! 🎁</p>
                            
                            <div className="space-y-2 mb-3 sm:mb-4">
                                <p className="text-xs text-gray-600 text-left">
                                    📱 Share your referral link:
                                </p>
                                <div className="flex gap-1">
                                    <input 
                                        type="text" 
                                        value={userReferralCode ? `https://www.indastreetmassage.com/ref/${userReferralCode}` : 'Loading...'} 
                                        readOnly 
                                        className="flex-1 px-2 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-gray-50 text-xs"
                                        placeholder="Your referral link"
                                        title="Your referral link to share with friends"
                                        aria-label="Referral link"
                                    />
                                    <button
                                        onClick={() => {
                                            const link = userReferralCode ? `https://www.indastreetmassage.com/ref/${userReferralCode}` : 'https://www.indastreetmassage.com';
                                            navigator.clipboard.writeText(link);
                                            alert('Link copied to clipboard!');
                                        }}
                                        className="px-3 py-1.5 sm:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-xs whitespace-nowrap"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-2 mb-3 sm:mb-4">
                                <p className="text-xs text-gray-600 mb-2">Share via:</p>
                                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                                    <button
                                        onClick={() => {
                                            const referralLink = userReferralCode ? `https://www.indastreetmassage.com/ref/${userReferralCode}` : 'https://www.indastreetmassage.com';
                                            const message = `Check out IndaStreet - Book amazing massages! 💆‍♀️ Use my referral link and we both earn coins! ${referralLink}`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                                        }}
                                        className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/whats%20app%20icon.png?updatedAt=1761844859402" 
                                            alt="WhatsApp"
                                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                        />
                                        <span className="text-xs font-medium text-gray-700">WhatsApp</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const referralLink = userReferralCode ? `https://www.indastreetmassage.com/ref/${userReferralCode}` : 'https://www.indastreetmassage.com';
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
                                        }}
                                        className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/facebook.png?updatedAt=1761844676576" 
                                            alt="Facebook"
                                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                        />
                                        <span className="text-xs font-medium text-gray-700">Facebook</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const referralLink = userReferralCode ? `https://www.indastreetmassage.com/ref/${userReferralCode}` : 'https://www.indastreetmassage.com';
                                            const message = `Check out IndaStreet - Book amazing massages! 💆‍♀️ ${referralLink}`;
                                            navigator.clipboard.writeText(message);
                                            alert('Instagram message copied! Open Instagram and paste to share.');
                                        }}
                                        className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/insta.png?updatedAt=1761845305146" 
                                            alt="Instagram"
                                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                        />
                                        <span className="text-xs font-medium text-gray-700">Instagram</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const referralLink = userReferralCode ? `https://www.indastreetmassage.com/ref/${userReferralCode}` : 'https://www.indastreetmassage.com';
                                            const message = `Check out IndaStreet - Book amazing massages! 💆‍♀️ ${referralLink}`;
                                            navigator.clipboard.writeText(message);
                                            alert('TikTok message copied! Open TikTok and paste to share.');
                                        }}
                                        className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/tiktok.png?updatedAt=1761845101981" 
                                            alt="TikTok"
                                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                        />
                                        <span className="text-xs font-medium text-gray-700">TikTok</span>
                                    </button>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setShowReferModal(false)}
                                className="w-full px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showReviewModal && (
                <AnonymousReviewModal
                    providerName={therapist.name}
                    providerId={therapist.$id || therapist.id}
                    providerType="therapist"
                    providerImage={(therapist as any).profilePicture || (therapist as any).mainImage}
                    onClose={() => setShowReviewModal(false)}
                    onSubmit={handleAnonymousReviewSubmit}
                />
            )}

            {showBookingConfirmation && (
                <BookingConfirmationPopup
                    isOpen={showBookingConfirmation}
                    onClose={() => setShowBookingConfirmation(false)}
                    onOpenChat={() => {
                        setShowBookingConfirmation(false);
                        handleConfirmedBooking();
                    }}
                    providerName={therapist.name}
                    language={currentLanguage}
                />
            )}

            {showBookingForm && (
                <BookingFormPopup
                    isOpen={showBookingForm}
                    onClose={() => setShowBookingForm(false)}
                    onSubmit={handleBookingSubmit}
                    therapistName={therapist.name}
                    therapistId={String(therapist.id)}
                    pricing={{
                        price60: String(pricing["60"]),
                        price90: String(pricing["90"]),
                        price120: String(pricing["120"])
                    }}
                    language={currentLanguage}
                />
            )}

            {showSharePopup && (
                <SocialSharePopup
                    isOpen={showSharePopup}
                    onClose={() => setShowSharePopup(false)}
                    title={`Book ${therapist.name} - IndaStreet Massage`}
                    description={`${therapist.name} - Professional massage therapist in ${therapist.city || therapist.location}. Book now on IndaStreet!`}
                    url={userReferralCode && shortShareUrl ? 
                        `${shortShareUrl}?ref=${userReferralCode}` : 
                        (shortShareUrl || generateShareableURL(therapist))
                    }
                    type="therapist"
                />
            )}

            {/* Therapist Join Popup */}
            <TherapistJoinPopup
                isOpen={showJoinPopup}
                onClose={() => setShowJoinPopup(false)}
            />

            {/* Price List Bottom Sheet Slider */}
            {showPriceListModal && (
                <div
                    className="fixed inset-0 z-[9999] bg-black bg-opacity-50 transition-opacity duration-300"
                    onClick={() => setShowPriceListModal(false)}
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
                                    src={(therapist as any).profilePicture || (therapist as any).mainImage || '/default-avatar.jpg'}
                                    alt={therapist.name}
                                    className="w-11 h-11 rounded-full border-2 border-white object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.jpg'; }}
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

                        {/* Price List Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4" style={{ height: 'calc(100vh - 180px)' }}>
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
                                                            className={`w-full px-2 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                                                isRowSelected && selectedDuration
                                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 cursor-pointer'
                                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            }`}
                                                            onClick={(e) => {
                                                                const availableDurations = [];
                                                                if (service.price60) availableDurations.push('60');
                                                                if (service.price90) availableDurations.push('90');
                                                                if (service.price120) availableDurations.push('120');
                                                                
                                                                if (availableDurations.length > 0) {
                                                                    handleSelectService(index, availableDurations[0] as '60' | '90' | '120');
                                                                    
                                                                    // Close the price list modal
                                                                    setShowPriceListModal(false);

                                                                    // Get pricing info
                                                                    const pricing = getPricing();
                                                                    const normalizedStatus = displayStatus.toLowerCase() as 'available' | 'busy' | 'offline';
                                                                    
                                                                    // Handle booking based on status
                                                                    handleBookingClick(e, normalizedStatus, pricing);
                                                                }
                                                            }}
                                                            disabled={!isRowSelected || !selectedDuration}
                                                        >
                                                            {chatLang === 'id' ? 'Pesan Sekarang' : 'Book Now'}
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
                                                    className={`w-full px-2 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                                        selectedServiceIndex === 0 && selectedDuration
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 cursor-pointer'
                                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                                    onClick={(e) => {
                                                        if (selectedServiceIndex === 0 && selectedDuration) {
                                                            // Close the price list modal
                                                            setShowPriceListModal(false);

                                                            // Get pricing info
                                                            const pricing = getPricing();
                                                            const normalizedStatus = displayStatus.toLowerCase() as 'available' | 'busy' | 'offline';
                                                            
                                                            // Handle booking
                                                            handleBookingClick(e, normalizedStatus, pricing);
                                                        }
                                                    }}
                                                    disabled={selectedServiceIndex !== 0 || !selectedDuration}
                                                >
                                                    {chatLang === 'id' ? 'Pesan Sekarang' : 'Book Now'}
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