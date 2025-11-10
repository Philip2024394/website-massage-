import React, { useState, useEffect } from 'react';
import type { Therapist, Analytics } from '../types';
import { AvailabilityStatus } from '../types';
import { parsePricing, parseMassageTypes, parseCoordinates, parseLanguages } from '../utils/appwriteHelpers';
import { notificationService } from '../lib/appwriteService';
import { getRandomTherapistImage } from '../utils/therapistImageUtils';
import { getDisplayRating, getDisplayReviewCount, formatRating } from '../utils/ratingUtils';
import DistanceDisplay from './DistanceDisplay';
import BookingConfirmationPopup from './BookingConfirmationPopup';
import BusyCountdownTimer from './BusyCountdownTimer';

interface TherapistCardProps {
    therapist: Therapist;
    userLocation?: { lat: number; lng: number } | null; // User's current location for distance calculation
    onRate: (therapist: Therapist) => void;
    onBook: (therapist: Therapist) => void;
    onQuickBookWithChat?: (therapist: Therapist) => void; // Quick book after WhatsApp
    onChatWithBusyTherapist?: (therapist: Therapist) => void; // Chat with busy therapist
    onIncrementAnalytics: (metric: keyof Analytics) => void;
    onShowRegisterPrompt?: () => void; // Show registration popup
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

    // Return the actual therapist status
    return therapist.status || AvailabilityStatus.Offline;
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
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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
    isCustomerLoggedIn = false,
    activeDiscount,
    t: _t,
    loggedInProviderId
}) => {
    const [showBusyModal, setShowBusyModal] = useState(false);
    const [showReferModal, setShowReferModal] = useState(false);
    const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
    const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
    const [countdown, setCountdown] = useState<string>('');
    const [isOvertime, setIsOvertime] = useState(false);
    const [discountTimeLeft, setDiscountTimeLeft] = useState<string>('');
    
    // Detect language from translations object
    const currentLanguage: 'en' | 'id' = _t?.schedule === 'Schedule' ? 'en' : 'id';
    
    // Countdown timer for active discount
    useEffect(() => {
        if (!activeDiscount) return;
        
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = activeDiscount.expiresAt.getTime() - now;
            
            if (distance < 0) {
                setDiscountTimeLeft('EXPIRED');
                clearInterval(interval);
                return;
            }
            
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            setDiscountTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
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
    
    // Map any status value to valid AvailabilityStatus
    let validStatus = AvailabilityStatus.Offline;
    const statusStr = String(therapist.status || '');
    
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
    
    // Get the display status (now always shows actual status)
    const displayStatus = getDisplayStatus(therapistWithStatus);
    const style = statusStyles[displayStatus];
    
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
        
        // Fallback to old JSON format
        return parsePricing(therapist.pricing) || { "60": 0, "90": 0, "120": 0 };
    };
    
    const pricing = getPricing();
    
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
        // No login required for WhatsApp booking - direct contact allowed
        
        // Send notification to therapist ONLY if it's not them clicking their own button
        const therapistIdNum = typeof therapist.id === 'string' ? parseInt(therapist.id) : therapist.id;
        if (loggedInProviderId !== therapistIdNum) {
            notificationService.createWhatsAppContactNotification(
                therapistIdNum,
                therapist.name
            ).catch(err => console.log('Notification failed:', err));
        } else {
            console.log('🔇 Skipping self-notification (you clicked your own button)');
        }

        // If displaying as Busy, show confirmation modal
        if (displayStatus === AvailabilityStatus.Busy) {
            // Customer is logged in, show the busy modal
            setShowBusyModal(true);
        } else {
            // Available or Offline (the 20% that show as offline)
            onIncrementAnalytics('whatsapp_clicks');
            window.open(`https://wa.me/${therapist.whatsappNumber}`, '_blank');
            
            // After opening WhatsApp, also open the chat window
            if (onQuickBookWithChat) {
                setTimeout(() => {
                    onQuickBookWithChat(therapist);
                }, 500); // Small delay to ensure WhatsApp opens first
            }
        }
    };

    // Removed handleConfirmBusyContact - chat system deactivated


    return (
        <div className="bg-white rounded-xl shadow-md overflow-visible relative">
            {/* Main Image Banner */}
            <div className={`h-48 w-full bg-gradient-to-r from-orange-400 to-orange-600 overflow-visible relative rounded-t-xl transition-all duration-500 ${
                (therapist.discountPercentage && therapist.discountPercentage > 0) 
                    ? 'shadow-2xl shadow-red-500/60 ring-4 ring-red-400/40 animate-pulse' 
                    : ''
            }`}>
                <img 
                    src={displayImage} 
                    alt={`${therapist.name} cover`} 
                    className={`w-full h-full object-cover transition-all duration-500 ${
                        (therapist.discountPercentage && therapist.discountPercentage > 0) 
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

                {/* 🎯 DISCOUNT BADGE ON MAIN IMAGE */}
                {therapist.discountPercentage && therapist.discountPercentage > 0 && (
                    <div className="absolute top-4 right-4 z-30">
                        <div className="relative">
                            {/* Glow Effect Background */}
                            <div className="absolute -inset-2 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
                            
                            {/* Main Discount Badge */}
                            <div className="relative bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg px-4 py-2 rounded-full shadow-2xl border-2 border-white flex items-center gap-1 animate-bounce">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd"/>
                                </svg>
                                {therapist.discountPercentage}% OFF
                            </div>
                            
                            {/* Sparkle Effects */}
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                    </div>
                )}

                {/* 🎯 DISCOUNT TIMER (if discount is active and time-limited) */}
                {therapist.discountPercentage && therapist.discountPercentage > 0 && therapist.discountEndTime && (
                    <div className="absolute top-4 left-4 z-30">
                        <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg font-mono">
                            ⏰ {(() => {
                                const now = new Date();
                                const endTime = new Date(therapist.discountEndTime);
                                const timeLeft = endTime.getTime() - now.getTime();
                                if (timeLeft <= 0) return 'EXPIRED';
                                
                                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                                return `${hours}h ${minutes}m`;
                            })()}
                        </div>
                    </div>
                )}
                
                {/* Profile Image - 50% on banner, 50% on card overlay */}
                <div className="absolute top-36 left-4 z-20">
                    <div className="w-24 h-24 bg-white rounded-full p-1 shadow-xl relative">
                        <img 
                            className="w-full h-full rounded-full object-cover aspect-square" 
                            src={(therapist as any).profilePicture || getRandomTherapistImage(therapist.id.toString())} 
                            alt={`${therapist.name} profile`} 
                            onError={(e) => {
                                const profileImageUrl = (therapist as any).profilePicture || getRandomTherapistImage(therapist.id.toString());
                                console.error('👤 Profile image failed to load:', profileImageUrl);
                                // Fallback to a working profile placeholder
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150/FFB366/FFFFFF?text=' + encodeURIComponent(therapist.name.charAt(0));
                            }}
                            onLoad={() => {
                                const profileImageUrl = (therapist as any).profilePicture || getRandomTherapistImage(therapist.id.toString());
                                console.log('✅ Profile image loaded successfully:', profileImageUrl);
                            }}
                        />
                        
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
                    </div>
                </div>

                
                {/* Star Rating - Top Left Corner */}
                <div 
                    className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg cursor-pointer z-30"
                    onClick={() => onRate(therapist)}
                    aria-label={`Rate ${therapist.name}`}
                    role="button"
                >
                    <StarIcon className="w-4 h-4 text-yellow-400"/>
                    <span className="font-bold text-white text-sm">{formatRating(getDisplayRating(therapist.rating, therapist.reviewCount))}</span>
                    <span className="text-xs text-gray-300">({getDisplayReviewCount(therapist.reviewCount)})</span>
                </div>

                {/* Active Discount Badge - Top Right Corner */}
                {activeDiscount && discountTimeLeft !== 'EXPIRED' && (
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-full px-4 py-2 shadow-lg animate-pulse">
                            <span className="font-bold text-white text-xl">{activeDiscount.percentage}% OFF</span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md rounded-full px-3 py-1 shadow-lg">
                            <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs text-white font-semibold">{discountTimeLeft}</span>
                        </div>
                    </div>
                )}
                


                {/* Social Share Buttons - Bottom Right Corner */}
                <div className="absolute bottom-2 right-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* WhatsApp */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const text = `Check out ${therapist.name} on IndaStreet - Amazing massage therapist!`;
                            const url = window.location.href;
                            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                        }}
                        className="w-7 h-7 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                        title="Share on WhatsApp"
                        aria-label="Share on WhatsApp"
                    >
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.614-1.486L.057 24z"/>
                        </svg>
                    </button>
                    
                    {/* Facebook */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const url = window.location.href;
                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                        }}
                        className="w-7 h-7 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                        title="Share on Facebook"
                        aria-label="Share on Facebook"
                    >
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </button>
                    
                    {/* Instagram */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(`Check out ${therapist.name} on IndaStreet - Amazing massage therapist! ${window.location.href}`);
                            alert('Instagram message copied! Open Instagram and paste to share.');
                        }}
                        className="w-7 h-7 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                        title="Share on Instagram"
                        aria-label="Share on Instagram"
                    >
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                    </button>
                    
                    {/* TikTok */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(`Check out ${therapist.name} on IndaStreet - Amazing massage therapist! ${window.location.href}`);
                            alert('TikTok message copied! Open TikTok and paste to share.');
                        }}
                        className="w-7 h-7 bg-black hover:bg-gray-900 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                        title="Share on TikTok"
                        aria-label="Share on TikTok"
                    >
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            {/* Distance Display - Positioned at top right */}
            <div className="absolute top-52 right-4 z-10">
                <DistanceDisplay
                    userLocation={userLocation}
                    providerLocation={parseCoordinates(therapist.coordinates) || { lat: 0, lng: 0 }}
                    className="text-gray-700"
                    showTravelTime={true}
                    showIcon={true}
                    size="sm"
                />
            </div>
            
            {/* Therapist Name - Positioned in new line below distance */}
            <div className="absolute top-56 left-32 right-4 z-10">
                <h3 className="text-xl font-bold text-gray-900">{therapist.name}</h3>
            </div>
            
            {/* Online Status - Positioned below name on same left alignment */}
            <div className="absolute top-60 left-32 z-10">
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isOvertime ? 'bg-red-100 text-red-800' : style.bg} ${isOvertime ? '' : style.text} mt-3`}>
                    <span className="relative mr-1.5">
                        {displayStatus === AvailabilityStatus.Available && (
                            <>
                                {/* Satellite ring animation for Available status */}
                                <span className="absolute inset-0 w-6 h-6 -left-2 -top-2 rounded-full border-2 border-green-300 animate-ping opacity-75"></span>
                                <span className="absolute inset-0 w-5 h-5 -left-1.5 -top-1.5 rounded-full border border-green-400 animate-pulse"></span>
                            </>
                        )}
                        <span className={`w-2 h-2 rounded-full block status-indicator ${isOvertime ? 'bg-red-500' : style.dot} ${displayStatus === AvailabilityStatus.Available ? 'animate-pulse' : ''}`}></span>
                    </span>
                    {displayStatus === AvailabilityStatus.Busy && therapist.busyUntil ? (
                        <div className="flex items-center gap-1">
                            <span>Busy</span>
                            <BusyCountdownTimer 
                                endTime={therapist.busyUntil}
                                onExpired={() => {
                                    // Optionally refresh the therapist status or trigger a re-render
                                    console.log('Therapist should be available again');
                                }}
                            />
                        </div>
                    ) : displayStatus === AvailabilityStatus.Busy && countdown ? (
                        <span>
                            {isOvertime ? 'Busy - Extra Time ' : 'Busy - Free in '}
                            {countdown}
                        </span>
                    ) : (
                        displayStatus
                    )}
                </div>
            </div>
            
            {/* Therapist Bio - Use actual therapist description or fallback - Expanded for 350 characters */}
            <div className="absolute top-72 left-6 right-6 z-10 therapist-bio-section max-h-40 overflow-hidden bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-700 leading-5 break-words whitespace-normal line-clamp-8">
                    {therapist.description || 
                     `Certified massage therapist with ${therapist.yearsOfExperience || 5}+ years experience. Specialized in therapeutic and relaxation techniques. Available for home, hotel, and villa services. Professional, licensed, and highly rated by clients for exceptional service quality.`}
                </p>
            </div>

            
            {/* Content Section - Layout adjusted for expanded bio section */}
            <div className="p-4 pt-52 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    <div className="flex-grow">
                        {/* Content starts below the positioned elements */}
                    </div>
                </div>

            {/* Massage Specializations - Above languages section - Moved down for bio space */}
            <div className="mt-6 border-t border-gray-100 pt-4">
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
                
                return languages && Array.isArray(languages) && languages.length > 0 && (
                    <div className="mt-4">
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
                                const langMap: Record<string, {flag: string, name: string}> = {
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
                                    'it': {flag: '🇮�', name: 'IT'},
                                    'ru': {flag: '🇷🇺', name: 'RU'},
                                    'ar': {flag: '🇸🇦', name: 'AR'},
                                    'hi': {flag: '🇮🇳', name: 'HI'}
                                };
                                const langInfo = langMap[lang.toLowerCase()] || {flag: '🌐', name: lang.toUpperCase().slice(0, 2)};
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

            {/* Discount Notice - Shows when discount is active */}
            {therapist.discountPercentage && therapist.discountPercentage > 0 && (
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-3 rounded-lg shadow-md my-4">
                    <div className="text-center">
                        <p className="font-bold text-sm mb-0.5 animate-pulse">
                            🔥 {therapist.discountPercentage}% OFF! 🔥
                        </p>
                        <p className="text-xs">
                            Final prices shown below!
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-center text-sm mt-4">
                {/* 60 min pricing */}
                <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-500 min-h-[60px] flex flex-col justify-center ${
                    (therapist.discountPercentage && therapist.discountPercentage > 0)
                        ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300 shadow-red-500/60 shadow-2xl ring-4 ring-red-400/40 animate-pulse' 
                        : 'bg-gray-100 border-gray-200'
                }`}>
                    <p className="text-gray-600 text-xs mb-1">60 min</p>
                    {therapist.discountPercentage && therapist.discountPercentage > 0 ? (
                        <>
                            {/* Discounted price - what customer will actually pay */}
                            <p className="font-bold text-gray-800 text-sm leading-tight">
                                Rp {formatPrice(Math.round(Number(pricing["60"]) * (1 - therapist.discountPercentage / 100)))}
                            </p>
                            {/* Discount badge to show they're getting a deal */}
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg notification-badge animate-bounce">
                                -{therapist.discountPercentage}%
                            </span>
                        </>
                    ) : (
                        <p className="font-bold text-gray-800 text-sm leading-tight">
                            Rp {formatPrice(Number(pricing["60"]))}
                        </p>
                    )}
                </div>
                
                {/* 90 min pricing */}
                <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-500 min-h-[60px] flex flex-col justify-center ${
                    (therapist.discountPercentage && therapist.discountPercentage > 0)
                        ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300 shadow-red-500/60 shadow-2xl ring-4 ring-red-400/40 animate-pulse' 
                        : 'bg-gray-100 border-gray-200'
                }`}>
                    <p className="text-gray-600 text-xs mb-1">90 min</p>
                    {therapist.discountPercentage && therapist.discountPercentage > 0 ? (
                        <>
                            <p className="font-bold text-gray-800 text-sm leading-tight">
                                Rp {formatPrice(Math.round(Number(pricing["90"]) * (1 - therapist.discountPercentage / 100)))}
                            </p>
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-bounce">
                                -{therapist.discountPercentage}%
                            </span>
                        </>
                    ) : (
                        <p className="font-bold text-gray-800 text-sm leading-tight">
                            Rp {formatPrice(Number(pricing["90"]))}
                        </p>
                    )}
                </div>
                
                {/* 120 min pricing */}
                <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-500 min-h-[60px] flex flex-col justify-center ${
                    (therapist.discountPercentage && therapist.discountPercentage > 0)
                        ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300 shadow-red-500/60 shadow-2xl ring-4 ring-red-400/40 animate-pulse' 
                        : 'bg-gray-100 border-gray-200'
                }`}>
                    <p className="text-gray-600 text-xs mb-1">120 min</p>
                    {therapist.discountPercentage && therapist.discountPercentage > 0 ? (
                        <>
                            <p className="font-bold text-gray-800 text-sm leading-tight">
                                Rp {formatPrice(Math.round(Number(pricing["120"]) * (1 - therapist.discountPercentage / 100)))}
                            </p>
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-bounce">
                                -{therapist.discountPercentage}%
                            </span>
                        </>
                    ) : (
                        <p className="font-bold text-gray-800 text-sm leading-tight">
                            Rp {formatPrice(Number(pricing["120"]))}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex gap-2 mt-2">
                <button
                    onClick={openWhatsApp}
                    className="w-1/2 flex items-center justify-center gap-1.5 bg-green-500 text-white font-bold py-2.5 px-3 rounded-lg hover:bg-green-600 transition-colors duration-300"
                >
                    <WhatsAppIcon className="w-4 h-4"/>
                    <span className="text-sm">{_t.home?.therapistCard?.orderNow || 'Pesan'}</span>
                </button>
                 <button 
                    onClick={() => {
                        console.log('Schedule button clicked - using scheduled booking system');
                        
                        // Open scheduled booking popup with time slot selection
                        const openScheduleBookingPopup = (window as any).openScheduleBookingPopup;
                        if (openScheduleBookingPopup) {
                            openScheduleBookingPopup({
                                therapistId: typeof therapist.id === 'string' ? therapist.id : therapist.id?.toString(),
                                therapistName: therapist.name,
                                therapistType: 'therapist'
                            });
                        } else {
                            console.error('Schedule booking popup not available');
                        }
                    }} 
                    className="w-1/2 flex items-center justify-center gap-1.5 bg-orange-500 text-white font-bold py-2.5 px-3 rounded-lg hover:bg-orange-600 transition-colors duration-300"
                >
                    <CalendarIcon className="w-4 h-4"/>
                    <span className="text-sm">{_t.home?.therapistCard?.schedule || 'Jadwal'}</span>
                </button>
            </div>

            {/* Refer Friend and Leave Review Links */}
            <div className="flex justify-between items-center mt-2 px-1">
                <button
                    onClick={() => setShowReferModal(true)}
                    className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                >
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    <span>Refer Friend</span>
                </button>
                <button
                    onClick={() => {
                        if (!isCustomerLoggedIn) {
                            setShowLoginRequiredModal(true);
                        } else {
                            onRate(therapist);
                        }
                    }}
                    className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                >
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>Leave Review</span>
                </button>
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
                            <p className="text-sm font-semibold text-orange-600 mb-6">- <span className="text-black">Inda</span>Street Admin</p>
                            
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowReferModal(false)}>
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[95vw] max-h-[90vh] sm:max-w-sm md:max-w-md p-3 sm:p-4 md:p-5 animate-fadeIn overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 overflow-hidden relative">
                                {/* Main coin image */}
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/INDASTREET_coins_new-removebg-preview.png?updatedAt=1762338892035"
                                    alt="IndaStreet Coins"
                                    className="w-20 h-20 sm:w-28 sm:h-28 object-contain z-10 relative"
                                />
                                
                                {/* Falling coins animation */}
                                {[...Array(6)].map((_, i) => (
                                    <img
                                        key={i}
                                        src="https://ik.imagekit.io/7grri5v7d/INDASTREET_coins_new-removebg-preview.png?updatedAt=1762338892035"
                                        alt=""
                                        className={`absolute w-4 h-4 opacity-60 animate-coin-fall-${i + 1}`}
                                        style={{
                                            left: `${15 + (i * 12)}%`,
                                            animationDelay: `${i * 0.3}s`,
                                            animationDuration: '2s',
                                            animationIterationCount: 'infinite'
                                        }}
                                    />
                                ))}
                                
                                {/* Accumulated coins at bottom */}
                                {[...Array(4)].map((_, i) => (
                                    <img
                                        key={`bottom-${i}`}
                                        src="https://ik.imagekit.io/7grri5v7d/INDASTREET_coins_new-removebg-preview.png?updatedAt=1762338892035"
                                        alt=""
                                        className="absolute w-3 h-3 opacity-40 animate-pulse"
                                        style={{
                                            bottom: '8px',
                                            left: `${20 + (i * 15)}%`,
                                            animationDelay: `${i * 0.5}s`
                                        }}
                                    />
                                ))}
                            </div>
                            
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Refer a Friend</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Share IndaStreet with friends and earn coins! 🎁</p>
                            
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                                <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-xl sm:text-2xl font-bold text-orange-600">50 Coins</span>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-700">For each friend who signs up!</p>
                            </div>
                            
                            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                                <p className="text-xs sm:text-sm text-gray-600 text-left">
                                    📱 Share your referral link:
                                </p>
                                <div className="flex gap-1 sm:gap-2">
                                    <input 
                                        type="text" 
                                        value="https://indastreet.com/ref/USER123" 
                                        readOnly 
                                        className="flex-1 px-2 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-xs sm:text-sm"
                                        placeholder="Your referral link"
                                        title="Your referral link to share with friends"
                                        aria-label="Referral link"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText('https://indastreet.com/ref/USER123');
                                            alert('Link copied to clipboard!');
                                        }}
                                        className="px-2 sm:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-xs sm:text-sm whitespace-nowrap"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-2 mb-4 sm:mb-6">
                                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Share via:</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                    <button
                                        onClick={() => {
                                            window.open(`https://wa.me/?text=${encodeURIComponent('Check out IndaStreet - Book amazing massages! https://indastreet.com/ref/USER123')}`, '_blank');
                                        }}
                                        className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/whats%20app%20icon.png?updatedAt=1761844859402" 
                                            alt="WhatsApp"
                                            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain"
                                        />
                                        <span className="text-xs font-semibold text-gray-700">WhatsApp</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://indastreet.com/ref/USER123')}`, '_blank');
                                        }}
                                        className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/facebook.png?updatedAt=1761844676576" 
                                            alt="Facebook"
                                            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain"
                                        />
                                        <span className="text-xs font-semibold text-gray-700">Facebook</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText('Check out IndaStreet - Book amazing massages! https://indastreet.com/ref/USER123');
                                            alert('Instagram message copied! Open Instagram and paste to share.');
                                        }}
                                        className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/insta.png?updatedAt=1761845305146" 
                                            alt="Instagram"
                                            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain"
                                        />
                                        <span className="text-xs font-semibold text-gray-700">Instagram</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText('Check out IndaStreet - Book amazing massages! https://indastreet.com/ref/USER123');
                                            alert('TikTok message copied! Open TikTok and paste to share.');
                                        }}
                                        className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/tiktok.png?updatedAt=1761845101981" 
                                            alt="TikTok"
                                            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain"
                                        />
                                        <span className="text-xs font-semibold text-gray-700">TikTok</span>
                                    </button>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setShowReferModal(false)}
                                className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Login Required Modal */}
            {showLoginRequiredModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowLoginRequiredModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h3>
                            <p className="text-gray-600 mb-4">You must be logged into your account to leave a review.</p>
                            
                            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
                                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    Review Verification Process:
                                </h4>
                                <ul className="text-sm text-gray-700 space-y-2 ml-7">
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-500">✓</span>
                                        <span>All reviews are verified by our admin team before posting live</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-500">✓</span>
                                        <span>This ensures authentic, helpful reviews for our community</span>
                                    </li>
                                </ul>
                            </div>
                            
                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        setShowLoginRequiredModal(false);
                                        if (onShowRegisterPrompt) {
                                            onShowRegisterPrompt();
                                        }
                                    }}
                                    className="w-full px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                                >
                                    Login / Sign Up
                                </button>
                                <button
                                    onClick={() => setShowLoginRequiredModal(false)}
                                    className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
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
                onQuickBookWithChat?.(therapist);
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
    );
};export default TherapistCard;