import React, { useState, useEffect } from 'react';
import type { Therapist, Analytics } from '../types';
import { AvailabilityStatus } from '../types';
import { parsePricing, parseMassageTypes, parseCoordinates, parseLanguages } from '../utils/appwriteHelpers';
import { notificationService, bookingService, reviewService } from '../lib/appwriteService';
import { getRandomTherapistImage } from '../utils/therapistImageUtils';
import { getDisplayRating, getDisplayReviewCount, formatRating } from '../utils/ratingUtils';
import DistanceDisplay from './DistanceDisplay';
import BookingConfirmationPopup from './BookingConfirmationPopup';
import BookingFormPopup, { BookingData } from './BookingFormPopup';
import BusyCountdownTimer from './BusyCountdownTimer';
import AnonymousReviewModal from './AnonymousReviewModal';
import SocialSharePopup from './SocialSharePopup';
import { useUIConfig } from '../hooks/useUIConfig';
import { MessageCircle } from 'lucide-react';
import { chatTranslationService } from '../services/chatTranslationService';
import { useLanguageContext } from '../context/LanguageContext';
import { getClientPreferenceDisplay } from '../utils/clientPreferencesUtils';

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
    isCustomerLoggedIn?: boolean; // Check if customer is logged in
    activeDiscount?: { percentage: number; expiresAt: Date } | null; // Active discount
    t: any;
    loggedInProviderId?: number | string; // To prevent self-notification
}

// Utility function to determine display status
const getDisplayStatus = (therapist: Therapist): AvailabilityStatus => {
    // Check if therapist has a busyUntil timestamp and is still busy
    if (therapist.busyUntil) {
        const busyUntil = new Date(therapist.busyUntil);
        if (!isNaN(busyUntil.getTime()) && busyUntil > new Date()) {
            return AvailabilityStatus.Busy;
        }
    }
    
    // Legacy: If therapist has an explicit bookedUntil timestamp in the future, show Busy
    try {
        const bookedUntil: any = (therapist as any).bookedUntil;
        if (bookedUntil) {
            const until = new Date(bookedUntil);
            if (!isNaN(until.getTime()) && until > new Date()) {
                return AvailabilityStatus.Busy;
            }
        }
    } catch {
        // ignore parsing errors
    }

    // Use availability field (has proper default) or status as fallback
    const currentStatus = (therapist as any).availability || therapist.status || AvailabilityStatus.Offline;
    
    // Debug status in development mode (reduced verbosity)
    if (process.env.NODE_ENV === 'development' && therapist.name && therapist.name.toLowerCase().includes('budi')) {
        console.log(`🔍 ${therapist.name} getDisplayStatus: ${currentStatus}`);
    }
    
    return currentStatus;
};

// Helper function to check if discount is currently active
const isDiscountActive = (therapist: Therapist): boolean => {
    const hasDiscountData = !!(
        therapist.discountPercentage && 
        therapist.discountPercentage > 0 && 
        therapist.discountEndTime &&
        therapist.isDiscountActive === true // Check the boolean flag
    );
    
    if (!hasDiscountData) return false;
    
    // Check if discount hasn't expired
    const now = new Date();
    const endTime = therapist.discountEndTime ? new Date(therapist.discountEndTime) : null;
    const notExpired = endTime && !isNaN(endTime.getTime()) && endTime > now;
    
    const result = Boolean(hasDiscountData && notExpired);
    
    // Debug logging for phil10 specifically
    if (therapist.name === 'phil10' || (therapist as any).$id === '6912d611003551067831') {
        console.log('🔍 DISCOUNT DEBUG - isDiscountActive check:', {
            therapistId: therapist.$id || therapist.id,
            therapistName: therapist.name,
            discountPercentage: therapist.discountPercentage,
            discountEndTime: therapist.discountEndTime,
            isDiscountActiveFlag: therapist.isDiscountActive,
            hasDiscountData,
            notExpired,
            finalResult: result,
            currentTime: now.toISOString(),
            endTimeObj: endTime ? endTime.toISOString() : null
        });
    }
    
    return result;
};

const WhatsAppIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.614-1.486L.057 24zM6.591 17.419c.404.652.812 1.272 1.242 1.85 1.58 2.116 3.663 3.22 5.953 3.218 5.55-.006 10.038-4.488 10.043-10.038.005-5.55-4.488-10.038-10.038-10.043-5.55.005-10.038 4.488-10.043 10.038.002 2.13.642 4.148 1.822 5.898l-1.03 3.766 3.844-1.025z"/>
    </svg>
);

const CalendarIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);



const StarIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20">
        <path fill="currentColor" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);


const statusStyles: { [key in AvailabilityStatus]: { text: string; bg: string; dot: string } } = {
    [AvailabilityStatus.Available]: { text: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500' },
    [AvailabilityStatus.Busy]: { text: 'text-yellow-700', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
    [AvailabilityStatus.Offline]: { text: 'text-red-700', bg: 'bg-red-100', dot: 'bg-red-500' },
};

const TherapistCard: React.FC<TherapistCardProps> = ({ 
    therapist, 
    userLocation,
    onRate, 
    // onBook, // Removed - using industry standard booking flow instead
    onQuickBookWithChat,
    onIncrementAnalytics,
    onShowRegisterPrompt,
    onNavigate,
    isCustomerLoggedIn = false,
    activeDiscount,
    t: _t,
    loggedInProviderId
}) => {
    // Use the translations prop
    const t = _t;
    
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
    const [userReferralCode, setUserReferralCode] = useState<string>('');
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
        console.log(`🔍 ${therapist.name} status: ${(therapist as any).availability || therapist.status}, busy until: ${therapist.busyUntil}`);
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
        // Try new separate fields first (preferred format)
        if (therapist.price60 !== undefined || therapist.price90 !== undefined || therapist.price120 !== undefined) {
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
    
    // Debug pricing for this specific therapist
    console.log(`💰 TherapistCard pricing for ${therapist.name}:`, {
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
        console.warn(`⚠️ TherapistCard - ${therapist.name} has no pricing data:`, {
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
        console.log('🔍 CARD DATA DEBUG:', {
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
        console.log('📱 Book Now clicked - showing booking form');
        
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
        console.log('✅ Booking submitted:', bookingData);
        
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
            
            console.log('🔒 Booking locked until:', deadline.toISOString());

            // Send notification to therapist
            await notificationService.create({
                providerId: therapistIdNum,
                message: `New booking request from ${bookingData.customerName} for ${bookingData.duration} minutes`,
                type: 'booking_request'
            });
            
            console.log('🔔 Booking notification sent to therapist with MP3 sound');

            // Open in-app chat window with booking message and lock indication
            if (onQuickBookWithChat) {
                setTimeout(() => {
                    console.log('💬 Opening in-app chat with booking details (locked until response)');
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
        console.log('✅ Booking confirmed - sending WhatsApp message and opening chat');
        
        // Send notification to therapist
        const therapistIdNum = typeof therapist.id === 'string' ? parseInt(therapist.id) : therapist.id;
        if (loggedInProviderId !== therapistIdNum) {
            notificationService.createWhatsAppContactNotification(
                therapistIdNum,
                therapist.name
            ).catch(err => console.log('Notification failed:', err));
        }

        // Play booking confirmation sound
        try {
            const audio = new Audio('/sounds/booking-notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(err => console.log('Sound play failed:', err));
        } catch (error) {
            console.log('Could not play confirmation sound:', error);
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
⭐ Rating: ${formatRating(getDisplayRating(therapist.rating, therapist.reviewCount))}/5

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
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onNavigate?.('therapistLogin');
                    }}
                    className="text-[11px] text-green-600 font-semibold flex items-center gap-1 hover:text-green-700 hover:underline transition-colors cursor-pointer"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Therapist Join Free
                </button>
                <span className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Orders: {bookingsCount}
                </span>
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-visible relative transition-all duration-300">
                {/* Removed Portal/Status overlay buttons from main image per UX request. Status now only shown below therapist name. */}
                
                {/* Main Image Banner */}
                <div className="h-48 w-full overflow-visible relative rounded-t-xl">
                <div className="absolute inset-0 rounded-t-xl overflow-hidden bg-gradient-to-r from-orange-400 to-orange-600">
                    <img 
                        src={displayImage} 
                        alt={`${therapist.name} cover`} 
                        className={`w-full h-full object-cover transition-all duration-500 ${
                            isDiscountActive(therapist) 
                                ? 'brightness-110 contrast-110 saturate-110' 
                                : ''
                        }`}
                        onError={(e) => {
                            console.error('🖼️ Main image failed to load:', displayImage);
                            // Fallback to a working ImageKit URL
                            (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/7grri5v7d/hotel%20massage%20indoniseas.png?updatedAt=1761154913720';
                        }}
                        onLoad={() => {
                            console.log('✅ Main image loaded successfully:', displayImage);
                        }}
                    />
                    
                    {/* Verified Badge - Top Left Corner - Only for Premium + KTP Verified */}
                    {(therapist as any).membershipTier === 'premium' && (therapist as any).ktpVerified && (
                        <div className="absolute top-2 left-2 z-30">
                            <img 
                                src="https://ik.imagekit.io/7grri5v7d/indastreet_verfied-removebg-preview.png?updatedAt=1764750953473" 
                                alt="Verified Member"
                                className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg"
                                style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
                            />
                        </div>
                    )}
                </div>

                {/* 🎯 ENHANCED DISCOUNT BADGE - Larger orange badge in top right corner with glow effect */}
                {isDiscountActive(therapist) && (
                    <div className="absolute top-3 right-3 z-30 flex flex-col items-end gap-2">
                        {/* Enhanced Orange Discount Badge with Subtle Fade Effect */}
                        <div className="relative">
                            {/* Main badge with subtle fade animation */}
                            <div className="relative text-white font-bold text-lg px-5 py-2 rounded-full shadow-lg discount-fade">
                                {therapist.discountPercentage}% OFF
                            </div>
                        </div>
                        
                        {/* Countdown Timer with Red Clock Icon */}
                        <div className="bg-black/80 text-white text-xs px-3 py-1 rounded-lg font-mono shadow-lg flex items-center gap-1">
                            {/* Red Clock Icon */}
                            <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {(() => {
                                if (!therapist.discountEndTime) return 'EXPIRED';
                                const now = new Date();
                                const endTime = new Date(therapist.discountEndTime);
                                const timeLeft = endTime.getTime() - now.getTime();
                                if (timeLeft <= 0) return 'EXPIRED';
                                
                                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                                
                                if (hours > 0) return `${hours}h ${minutes}m`;
                                if (minutes > 0) return `${minutes}m ${seconds}s`;
                                return `${seconds}s`;
                            })()}
                        </div>
                    </div>
                )}
                
                {/* Profile Image - 50% on banner, 50% on card overlay */}
                <div className="absolute top-36 left-4 z-20 overflow-visible">
                    <div className="w-24 h-24 bg-white rounded-full p-1 shadow-xl relative aspect-square overflow-visible">
                        {/* Verified Badge - Top Left Corner - Premium + KTP Verified */}
                        {(therapist as any).membershipTier === 'premium' && (therapist as any).ktpVerified && (
                            <div className="absolute -top-2 -left-2 z-30 w-10 h-10">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/indastreet_verfied-removebg-preview.png?updatedAt=1764750953473"
                                    alt="Verified Member"
                                    className="w-full h-full object-contain drop-shadow-lg"
                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                                />
                            </div>
                        )}
                        
                        {(therapist as any).profilePicture && (therapist as any).profilePicture.includes('appwrite.io') ? (
                            <img 
                                className="w-full h-full rounded-full object-cover aspect-square" 
                                src={(therapist as any).profilePicture} 
                                alt={`${therapist.name} profile`} 
                                onError={(e) => {
                                    console.error('👤 Profile image failed to load:', (therapist as any).profilePicture);
                                    // Replace with placeholder that matches the design
                                    const imgElement = e.target as HTMLImageElement;
                                    imgElement.style.display = 'none';
                                    const placeholder = imgElement.parentElement?.querySelector('.profile-placeholder') as HTMLElement;
                                    if (placeholder) {
                                        placeholder.style.display = 'flex';
                                    }
                                }}
                                onLoad={() => {
                                    console.log('✅ Profile image loaded successfully:', (therapist as any).profilePicture);
                                }}
                            />
                        ) : null}
                        
                        {/* Placeholder for therapists without profile pictures */}
                        <div 
                            className="w-full h-full rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-600"
                            style={{ 
                                display: (therapist as any).profilePicture && (therapist as any).profilePicture.includes('appwrite.io') ? 'none' : 'flex',
                                fontSize: '1.5rem',
                                fontWeight: 'bold'
                            }}
                        >
                            {therapist.name ? therapist.name.charAt(0).toUpperCase() : '👤'}
                        </div>
                        
                        {/* Qualified Therapist Badge - Small Icon on Profile Image Edge */}
                        {((() => {
                            const hasTimeRequirement = therapist.membershipStartDate ? 
                                new Date().getTime() - new Date(therapist.membershipStartDate).getTime() >= (3 * 30 * 24 * 60 * 60 * 1000) : false;
                            const hasPerformanceRequirement = (therapist.reviewCount ?? 0) >= 30 || (therapist.analytics && JSON.parse(therapist.analytics).bookings >= 90);
                            const hasRatingRequirement = getDisplayRating(therapist.rating, therapist.reviewCount) >= 4.0;
                            
                            return hasTimeRequirement && hasPerformanceRequirement && hasRatingRequirement;
                        })()) && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                            </div>
                        )}

                        {/* Verified Pro Rosette - Small golden rosette at bottom-right when isVerified */}
                        {therapist.isVerified && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-500">
                                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 1.5l2.19 4.44 4.9.71-3.54 3.45.83 4.86L10 12.9l-4.38 2.33.83-4.86L2.91 6.65l4.9-.71L10 1.5zm-1.2 9.09l-1.6-1.6a.75.75 0 10-1.06 1.06l2.13 2.13a.75.75 0 001.06 0l4.13-4.13a.75.75 0 10-1.06-1.06l-3.6 3.6z" clipRule="evenodd"/>
                                </svg>
                            </div>
                        )}
                        
                        {/* Star Rating Badge on bottom edge of profile image */}
                        <div 
                            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-white rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5 cursor-pointer z-30"
                            onClick={() => onRate(therapist)}
                            aria-label={`Rate ${therapist.name}`}
                            role="button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="#eab308">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-bold text-gray-900 text-base">{formatRating(getDisplayRating(therapist.rating, therapist.reviewCount))}</span>
                        </div>
                    </div>
                </div>
                
                {/* Share Button - Bottom Right Corner of image banner */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowSharePopup(true);
                    }}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-200 group z-30"
                    title="Share this therapist"
                    aria-label="Share this therapist"
                >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                </button>
            </div>

            {/* Profile Section - Flexbox layout for stable positioning */}
            <div className="px-4 -mt-12 relative z-10">
                <div className="flex items-start justify-between gap-4">
                    {/* Left side: Profile + Name + Status */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Profile Image */}
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-xl relative aspect-square overflow-visible">
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
                                
                                {/* Qualified Therapist Badge */}
                                {((() => {
                                    const hasTimeRequirement = therapist.membershipStartDate ? 
                                        new Date().getTime() - new Date(therapist.membershipStartDate).getTime() >= (3 * 30 * 24 * 60 * 60 * 1000) : false;
                                    const hasPerformanceRequirement = (therapist.reviewCount ?? 0) >= 30 || (therapist.analytics && JSON.parse(therapist.analytics).bookings >= 90);
                                    const hasRatingRequirement = getDisplayRating(therapist.rating, therapist.reviewCount) >= 4.0;
                                    return hasTimeRequirement && hasPerformanceRequirement && hasRatingRequirement;
                                })()) && (
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                )}

                                {/* Verified Pro Rosette */}
                                {therapist.isVerified && (
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-500">
                                        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 1.5l2.19 4.44 4.9.71-3.54 3.45.83 4.86L10 12.9l-4.38 2.33.83-4.86L2.91 6.65l4.9-.71L10 1.5zm-1.2 9.09l-1.6-1.6a.75.75 0 10-1.06 1.06l2.13 2.13a.75.75 0 001.06 0l4.13-4.13a.75.75 0 10-1.06-1.06l-3.6 3.6z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                )}
                                
                                {/* Star Rating Badge */}
                                <div 
                                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-white rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5 cursor-pointer z-30"
                                    onClick={() => onRate(therapist)}
                                    aria-label={`Rate ${therapist.name}`}
                                    role="button"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="#eab308">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="font-bold text-gray-900 text-base">{formatRating(getDisplayRating(therapist.rating, therapist.reviewCount))}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Name and Status Column */}
                        <div className="flex-1 pt-14 sm:pt-16 pb-4 overflow-visible">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate mb-2">{therapist.name}</h3>
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
                                                            console.log('Busy period ended – therapist should be available.');
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
                    <div className="flex-shrink-0 pb-4 pt-14 sm:pt-16">
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
            <div className="mx-4 mb-2">
                <p className="text-xs text-gray-600 text-left">
                    <span className="font-bold">{chatTranslationService.getTranslation('accepts', chatLang)}:</span> {getClientPreferenceDisplay(therapist.clientPreferences, chatLang)}
                </p>
            </div>

            {/* Therapist Bio - Natural flow with proper margin */}
            <div className="therapist-bio-section bg-white/90 backdrop-blur-sm rounded-lg py-2 px-3 shadow-sm mx-4">
                <p className="text-sm text-gray-700 leading-5 break-words whitespace-normal line-clamp-6">
                    {translatedDescription}
                </p>
            </div>

            
            {/* Content Section - Natural flow layout */}
            <div className="p-4 flex flex-col gap-4\">
                <div className="flex items-start gap-4">
                    <div className="flex-grow">
                        {/* Content starts below the positioned elements */}
                    </div>
                </div>

            {/* Massage Specializations - Above languages section - Dynamic spacing based on description length */}
            <div className={`border-t border-gray-100 pt-4 ${getDynamicSpacing('mt-6', 'mt-4', 'mt-2')}`}>
                <div className="mb-2">
                    <h4 className="text-xs font-semibold text-gray-700">
                        {_t.home?.therapistCard?.experiencedArea || 'Massage Specializations'}
                    </h4>
                </div>
                <div className="flex flex-wrap gap-1">
                    {massageTypes.slice(0, 5).map(type => (
                        <span key={type} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-200">{type}</span>
                    ))}
                    {massageTypes.length === 0 && (
                        <span className="text-xs text-gray-400">No specialties selected</span>
                    )}
                    {massageTypes.length > 5 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">+{massageTypes.length - 5}</span>
                    )}
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
                    console.log(`🌐 ${therapist.name} languages:`, languages);
                }
                
                return languages && Array.isArray(languages) && languages.length > 0 && (
                    <div className={`${getDynamicSpacing('mt-4', 'mt-3', 'mt-2')}`}>
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
            {/* Indastreet Therapist Standards Link */}
            <div className="text-center mb-2 mt-2">
                <button
                    onClick={() => onNavigate?.('mobileTherapistStandards')}
                    className="text-sm font-medium hover:underline"
                >
                    <span className="text-black">Inda</span><span className="text-orange-500">street</span><span className="text-black"> Therapist Standards</span>
                </button>
            </div>

            {/* Discounted Prices Header */}
            {isDiscountActive(therapist) && (
                <div className={`text-center mb-1 ${getDynamicSpacing('mt-3', 'mt-2', 'mt-1')}`}>
                    <p className="text-black font-semibold text-sm flex items-center justify-center gap-1">
                        🔥 Discounted Price's Displayed
                    </p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-center text-sm mt-1">
                {/* 60 min pricing */}
                <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-300 min-h-[75px] flex flex-col justify-center ${
                    isDiscountActive(therapist)
                        ? 'bg-red-50 border-orange-300 shadow-orange-400/50 ring-2 ring-orange-400/30 price-rim-fade' 
                        : 'bg-gray-100 border-gray-200'
                }`}>
                    {/* Star Rating - Top Right */}
                    {getDisplayRating(therapist.rating, therapist.reviewCount) > 0 && (
                        <div className="absolute top-1.5 right-1.5 text-yellow-400 text-xs font-bold">
                            ★{formatRating(getDisplayRating(therapist.rating, therapist.reviewCount))}
                        </div>
                    )}
                    <p className="text-gray-600 text-xs mb-1">60 min</p>
                    {isDiscountActive(therapist) ? (
                        <>
                            {/* Discounted price - what customer will actually pay */}
                            <p className="font-bold text-gray-800 text-sm leading-tight">
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
                <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-300 min-h-[75px] flex flex-col justify-center ${
                    isDiscountActive(therapist)
                        ? 'bg-red-50 border-orange-300 shadow-orange-400/50 ring-2 ring-orange-400/30 price-rim-fade' 
                        : 'bg-gray-100 border-gray-200'
                }`}>
                    {/* Star Rating - Top Right */}
                    {getDisplayRating(therapist.rating, therapist.reviewCount) > 0 && (
                        <div className="absolute top-1.5 right-1.5 text-yellow-400 text-xs font-bold">
                            ★{formatRating(getDisplayRating(therapist.rating, therapist.reviewCount))}
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
                        ? 'bg-red-50 border-orange-300 shadow-orange-400/50 ring-2 ring-orange-400/30 price-rim-fade' 
                        : 'bg-gray-100 border-gray-200'
                }`}>
                    {/* Star Rating - Top Right */}
                    {getDisplayRating(therapist.rating, therapist.reviewCount) > 0 && (
                        <div className="absolute top-1.5 right-1.5 text-yellow-400 text-xs font-bold">
                            ★{formatRating(getDisplayRating(therapist.rating, therapist.reviewCount))}
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

            <div className={`flex gap-2 ${getDynamicSpacing('mt-2', 'mt-1', 'mt-1')}`}>
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
                        
                        console.log('🟢 Book Now button clicked - opening chat window');
                        const pricing = getPricing();
                        console.log('👤 Therapist object:', { 
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
                                providerRating: getDisplayRating(therapist.rating, therapist.reviewCount),
                                discountPercentage: therapist.discountPercentage || 0,
                                discountActive: isDiscountActive(therapist),
                                mode: 'immediate'
                            }
                        }));
                    }}
                    className="w-1/2 flex items-center justify-center gap-1.5 bg-green-500 text-white font-bold py-4 px-3 rounded-lg hover:bg-green-600 active:bg-green-700 active:scale-95 transition-all duration-100 transform touch-manipulation min-h-[48px]"
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
                                providerRating: getDisplayRating(therapist.rating, therapist.reviewCount),
                                discountPercentage: therapist.discountPercentage || 0,
                                discountActive: isDiscountActive(therapist),
                                mode: 'scheduled'
                            }
                        }));
                        onIncrementAnalytics('bookings');
                    }} 
                    className="w-1/2 flex items-center justify-center gap-1.5 bg-orange-500 text-white font-bold py-4 px-3 rounded-lg hover:bg-orange-600 active:bg-orange-700 active:scale-95 transition-all duration-100 transform touch-manipulation min-h-[48px]"
                >
                    <CalendarIcon className="w-4 h-4"/>
                    <span className="text-sm">{scheduleText}</span>
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

            {/* Refer Friend and Leave Review Links */}
            <div className="flex flex-wrap justify-between items-center gap-2 mt-2 px-1">
                <button
                    onClick={() => setShowReferModal(true)}
                    className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                >
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    <span>Share</span>
                </button>
                {onNavigate && (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            onNavigate('massageTypes');
                        }}
                        title={t?.home?.massageDirectoryTitle || 'Go to Massage Directory'}
                        className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                    >
                        <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m0 0l-3.5 3.5M16 7l-3.5 3.5M5 12h14M5 16h14" />
                        </svg>
                        <span>{t?.home?.massageDirectory || 'Massage Directory'}</span>
                    </button>
                )}
                {onNavigate && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onNavigate(`reviews-therapist-${therapist.$id || therapist.id}`);
                        }}
                        className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                    >
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>Reviews</span>
                    </button>
                )}
            </div>
            </div>
            
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

            {/* Anonymous Review Modal */}
            {showReviewModal && (
                <AnonymousReviewModal
                    providerName={therapist.name}
                    providerId={therapist.$id || therapist.id}
                    providerType="therapist"
                    providerImage={therapist.profilePicture || (therapist as any).mainImage || getRandomTherapistImage(therapist.id.toString())}
                    onClose={() => setShowReviewModal(false)}
                    onSubmit={handleAnonymousReviewSubmit}
                />
            )}

            {/* Login Required Modal */}
            {showLoginRequiredModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowLoginRequiredModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Login Required</h3>
                            <p className="text-sm text-gray-600 mb-4">You must be logged into a registered account to leave a review.</p>
                            
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        setShowLoginRequiredModal(false);
                                        if (onShowRegisterPrompt) {
                                            onShowRegisterPrompt();
                                        }
                                    }}
                                    className="w-full px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors text-sm"
                                >
                                    Login / Sign Up
                                </button>
                                <button
                                    onClick={() => setShowLoginRequiredModal(false)}
                                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Confirmation Popup */}
            <BookingConfirmationPopup
                isOpen={showBookingConfirmation}
                onClose={() => setShowBookingConfirmation(false)}
                onOpenChat={() => {
                setShowBookingConfirmation(false);
                handleConfirmedBooking();
            }}
            providerName={therapist.name}
            language={currentLanguage}
            bookingAmount={typeof therapist.pricing?.[60] === 'string' ? parseInt(therapist.pricing[60]) : (therapist.pricing?.[60] || 300000)}
            duration={60}
            therapistBankDetails={{
                bankName: (therapist as any).bankName,
                bankAccountNumber: (therapist as any).bankAccountNumber,
                bankAccountName: (therapist as any).bankAccountName,
                mobilePaymentNumber: (therapist as any).mobilePaymentNumber,
                mobilePaymentType: (therapist as any).mobilePaymentType
            }}
        />

        {/* Booking Form Popup */}
        <BookingFormPopup
            isOpen={showBookingForm}
            onClose={() => setShowBookingForm(false)}
            onSubmit={handleBookingSubmit}
            therapistName={therapist.name}
            therapistId={String(therapist.id)}
            pricing={{
                price60: pricing['60'].toString(),
                price90: pricing['90'].toString(),
                price120: pricing['120'].toString()
            }}
            rating={therapist.rating}
            reviewCount={therapist.reviewCount}
            language={currentLanguage}
        />
        
        <style>{`
            @keyframes coin-fall-1 {
                0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                10% { opacity: 0.8; }
                90% { transform: translateY(85px) rotate(360deg); opacity: 0.8; }
                100% { transform: translateY(90px) rotate(360deg); opacity: 0.6; }
            }
            @keyframes coin-fall-2 {
                0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                10% { opacity: 0.8; }
                90% { transform: translateY(88px) rotate(360deg); opacity: 0.8; }
                100% { transform: translateY(93px) rotate(360deg); opacity: 0.6; }
            }
            @keyframes coin-fall-3 {
                0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                10% { opacity: 0.8; }
                90% { transform: translateY(82px) rotate(360deg); opacity: 0.8; }
                100% { transform: translateY(87px) rotate(360deg); opacity: 0.6; }
            }
            @keyframes coin-fall-4 {
                0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                10% { opacity: 0.8; }
                90% { transform: translateY(86px) rotate(360deg); opacity: 0.8; }
                100% { transform: translateY(91px) rotate(360deg); opacity: 0.6; }
            }
            @keyframes coin-fall-5 {
                0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                10% { opacity: 0.8; }
                90% { transform: translateY(84px) rotate(360deg); opacity: 0.8; }
                100% { transform: translateY(89px) rotate(360deg); opacity: 0.6; }
            }
            @keyframes coin-fall-6 {
                0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                10% { opacity: 0.8; }
                90% { transform: translateY(87px) rotate(360deg); opacity: 0.8; }
                100% { transform: translateY(92px) rotate(360deg); opacity: 0.6; }
            }
            @keyframes coin-float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-3px); }
            }
            .animate-coin-fall-1 { animation: coin-fall-1 4s ease-in forwards, coin-float 3s ease-in-out 4s infinite; }
            .animate-coin-fall-2 { animation: coin-fall-2 4s ease-in forwards, coin-float 3s ease-in-out 4.5s infinite; }
            .animate-coin-fall-3 { animation: coin-fall-3 4s ease-in forwards, coin-float 3s ease-in-out 5s infinite; }
            .animate-coin-fall-4 { animation: coin-fall-4 4s ease-in forwards, coin-float 3s ease-in-out 5.5s infinite; }
            .animate-coin-fall-5 { animation: coin-fall-5 4s ease-in forwards, coin-float 3s ease-in-out 6s infinite; }
            .animate-coin-fall-6 { animation: coin-fall-6 4s ease-in forwards, coin-float 3s ease-in-out 6.5s infinite; }
            
            /* Mobile-specific slower animations */
            @media (max-width: 768px) {
                .animate-coin-fall-1 { animation: coin-fall-1 5s ease-in forwards, coin-float 4s ease-in-out 5s infinite; }
                .animate-coin-fall-2 { animation: coin-fall-2 5s ease-in forwards, coin-float 4s ease-in-out 5.5s infinite; }
                .animate-coin-fall-3 { animation: coin-fall-3 5s ease-in forwards, coin-float 4s ease-in-out 6s infinite; }
                .animate-coin-fall-4 { animation: coin-fall-4 5s ease-in forwards, coin-float 4s ease-in-out 6.5s infinite; }
                .animate-coin-fall-5 { animation: coin-fall-5 5s ease-in forwards, coin-float 4s ease-in-out 7s infinite; }
                .animate-coin-fall-6 { animation: coin-fall-6 5s ease-in forwards, coin-float 4s ease-in-out 7.5s infinite; }
            }
        `}</style>
            </div>

            {/* Social Share Popup */}
            <SocialSharePopup
                isOpen={showSharePopup}
                onClose={() => setShowSharePopup(false)}
                title={therapist.name}
                description={`Check out ${therapist.name} on IndaStreet! Amazing massage therapist offering professional services.`}
                url={window.location.href}
                type="therapist"
            />
        </>
    );
};

export default TherapistCard;