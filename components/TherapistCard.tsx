import React, { useState, useEffect } from 'react';
import type { Therapist, Analytics } from '../types';
import { AvailabilityStatus } from '../types';
import { parsePricing, parseMassageTypes } from '../utils/appwriteHelpers';
import { notificationService } from '../lib/appwriteService';

interface TherapistCardProps {
    therapist: Therapist;
    onRate: (therapist: Therapist) => void;
    onBook: (therapist: Therapist) => void;
    onQuickBookWithChat?: (therapist: Therapist) => void; // Quick book after WhatsApp
    onChatWithBusyTherapist?: (therapist: Therapist) => void; // Chat with busy therapist
    onIncrementAnalytics: (metric: keyof Analytics) => void;
    onShowRegisterPrompt?: () => void; // Show registration popup
    isCustomerLoggedIn?: boolean; // Check if customer is logged in
    t: any;
    loggedInProviderId?: number; // To prevent self-notification
}

// Utility function to determine display status
// 80% of offline therapists will display as busy
const getDisplayStatus = (therapist: Therapist): AvailabilityStatus => {
    // If therapist has an explicit bookedUntil timestamp in the future, show Busy
    try {
        const bookedUntil: any = (therapist as any).bookedUntil;
        if (bookedUntil) {
            const until = new Date(bookedUntil);
            if (!isNaN(until.getTime()) && until > new Date()) {
                return AvailabilityStatus.Busy;
            }
        }
    } catch (e) {
        // ignore parsing errors
    }

    if (therapist.status === AvailabilityStatus.Available) {
        return AvailabilityStatus.Available;
    }
    
    if (therapist.status === AvailabilityStatus.Busy) {
        return AvailabilityStatus.Busy;
    }
    
    // Offline status: 80% chance to display as Busy
    if (therapist.status === AvailabilityStatus.Offline) {
        // Use therapist ID to create consistent randomization
        const hash = String(therapist.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const shouldShowBusy = (hash % 100) < 80; // 80% will be < 80
        return shouldShowBusy ? AvailabilityStatus.Busy : AvailabilityStatus.Offline;
    }
    
    return therapist.status;
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

const LocationPinIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
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
    [AvailabilityStatus.Offline]: { text: 'text-gray-700', bg: 'bg-gray-100', dot: 'bg-gray-500' },
};

const TherapistCard: React.FC<TherapistCardProps> = ({ 
    therapist, 
    onRate, 
    onBook, 
    onQuickBookWithChat,
    onChatWithBusyTherapist,
    onIncrementAnalytics,
    onShowRegisterPrompt,
    isCustomerLoggedIn = false,
    t: _t,
    loggedInProviderId
}) => {
    const [showBusyModal, setShowBusyModal] = useState(false);
    const [countdown, setCountdown] = useState<string>('');
    const [isOvertime, setIsOvertime] = useState(false);
    
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
            } catch (e) {
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
    
    // Get the display status (may differ from actual status)
    const displayStatus = getDisplayStatus(therapistWithStatus);
    const style = statusStyles[displayStatus];
    
    // Parse Appwrite string fields with fallbacks
    const pricing = parsePricing(therapist.pricing) || { "60": 0, "90": 0, "120": 0 };
    const massageTypes = parseMassageTypes(therapist.massageTypes) || [];
    
    // Get main image from therapist data
    const mainImage = (therapist as any).mainImage;
    
    // Check if therapist offers Mobile Corporate massage
    const isMobileCorporate = massageTypes.some(type => 
        type.toLowerCase().includes('mobile') || type.toLowerCase().includes('corporate')
    );
    
    // Use corporate image if mobile/corporate massage type exists, otherwise use therapist's mainImage or fallback
    const displayImage = isMobileCorporate 
        ? 'https://ik.imagekit.io/7grri5v7d/massage%20villa%20service%20indonisea.png?updatedAt=1761583264188'
        : (mainImage || 'https://ik.imagekit.io/7grri5v7d/massage%20image%201.png?updatedAt=1760186885261');

    const openWhatsApp = () => {
        // Play click sound
        const audio = new Audio('/sounds/success-notification.mp3');
        audio.volume = 0.3; // Quiet click sound
        audio.play().catch(err => console.log('Sound play failed:', err));

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

        // If displaying as Busy, show confirmation modal OR registration prompt
        if (displayStatus === AvailabilityStatus.Busy) {
            // If customer is not logged in, show registration prompt instead of busy modal
            if (!isCustomerLoggedIn && onShowRegisterPrompt) {
                onShowRegisterPrompt();
            } else {
                // Customer is logged in, show the busy modal
                setShowBusyModal(true);
            }
        } else {
            // Available or Offline (the 20% that show as offline)
            onIncrementAnalytics('whatsappClicks');
            window.open(`https://wa.me/${therapist.whatsappNumber}`, '_blank');
            
            // After opening WhatsApp, also open the chat window
            if (onQuickBookWithChat) {
                setTimeout(() => {
                    onQuickBookWithChat(therapist);
                }, 500); // Small delay to ensure WhatsApp opens first
            }
        }
    };
    
    const handleConfirmBusyContact = () => {
        // Play click sound
        const audio = new Audio('/sounds/success-notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(err => console.log('Sound play failed:', err));

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

        onIncrementAnalytics('whatsappClicks');
        setShowBusyModal(false);
        
        // Open chat with automated welcome message (removed WhatsApp)
        if (onChatWithBusyTherapist) {
            onChatWithBusyTherapist(therapist);
        }
    };


    return (
        <div className="bg-white rounded-xl shadow-md overflow-visible relative">
            {/* Main Image Banner */}
            <div className="h-48 w-full bg-gradient-to-r from-orange-400 to-orange-600 overflow-hidden relative rounded-t-xl">
                <img 
                    src={displayImage} 
                    alt={`${therapist.name} cover`} 
                    className="w-full h-full object-cover"
                />
                {/* Star Rating - Top Left Corner */}
                <div 
                    className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg cursor-pointer"
                    onClick={() => onRate(therapist)}
                    aria-label={`Rate ${therapist.name}`}
                    role="button"
                >
                    <StarIcon className="w-4 h-4 text-yellow-400"/>
                    <span className="font-bold text-white text-sm">{(therapist.rating || 0).toFixed(1)}</span>
                    <span className="text-xs text-gray-300">({therapist.reviewCount || 0})</span>
                </div>
                
                {/* Share Buttons - Lower Right Corner */}
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    {/* Instagram */}
                    <a
                        href={`https://www.instagram.com/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        aria-label="Share on Instagram"
                    >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                    </a>
                    
                    {/* WhatsApp */}
                    <a
                        href={`https://wa.me/?text=Check out ${therapist.name} on IndaStreet!`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        aria-label="Share on WhatsApp"
                    >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.614-1.486L.057 24z"/>
                        </svg>
                    </a>
                    
                    {/* Facebook */}
                    <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        aria-label="Share on Facebook"
                    >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </a>
                    
                    {/* TikTok */}
                    <a
                        href={`https://www.tiktok.com/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 bg-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        aria-label="Share on TikTok"
                    >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                    </a>
                </div>
                
                {/* Qualified Therapist Badge - Top Right Corner */}
                {/* Badge requirements: */}
                {/* 1. 3+ consecutive months of paid membership */}
                {/* 2. 4.0+ star rating */}
                {/* 3. Max 5-day grace period between renewals */}
                {((therapist.totalActiveMembershipMonths ?? 0) >= 3 && 
                  (therapist.rating ?? 0) >= 4.0 && 
                  (therapist.badgeEligible ?? false)) && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full px-3 py-1.5 shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span className="font-semibold text-white text-xs">Qualified</span>
                    </div>
                )}
            </div>
            
            {/* Profile Picture - Positioned below banner, overlapping */}
            <div className="absolute top-40 left-4 z-10">
                <img 
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg bg-gray-100" 
                    src={(therapist.profilePicture && therapist.profilePicture.startsWith('http')) ? therapist.profilePicture : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e5e7eb" width="80" height="80"/%3E%3Cpath fill="%239ca3af" d="M40 20c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10zm0 26c6.7 0 20 3.4 20 10v4H20v-4c0-6.6 13.3-10 20-10z"/%3E%3C/svg%3E'} 
                    alt={therapist.name}
                    onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e5e7eb" width="80" height="80"/%3E%3Cpath fill="%239ca3af" d="M40 20c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10zm0 26c6.7 0 20 3.4 20 10v4H20v-4c0-6.6 13.3-10 20-10z"/%3E%3C/svg%3E';
                    }}
                />
            </div>
            
            {/* Therapist Name and Distance - Positioned to the right of profile picture */}
            <div className="absolute top-52 left-28 right-4 z-10">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">{therapist.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 gap-1">
                        <LocationPinIcon className="w-4 h-4 text-red-500"/>
                        <span>{therapist.distance}km</span>
                    </div>
                </div>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isOvertime ? 'bg-red-100 text-red-800' : style.bg} ${isOvertime ? '' : style.text} mt-1`}>
                    <span className="relative mr-1.5">
                        {displayStatus === AvailabilityStatus.Available && (
                            <span className="absolute inset-0 w-4 h-4 -left-1 -top-1 rounded-full bg-white opacity-60"></span>
                        )}
                        <span className={`w-2 h-2 rounded-full block ${isOvertime ? 'bg-red-500' : style.dot}`}></span>
                    </span>
                    {displayStatus === AvailabilityStatus.Busy && countdown ? (
                        <span>
                            {isOvertime ? 'Busy - Extra Time ' : 'Busy - Free in '}
                            {countdown}
                        </span>
                    ) : (
                        displayStatus
                    )}
                </div>
                {/* Show booked-until info if present - removed as countdown is now in badge */}
            </div>
            
            {/* Content */}
            <div className="p-4 pt-12 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    <div className="flex-grow">
                        <div className="flex justify-between items-start">
                            <div className="flex-grow">
                            </div>
                        </div>
                         <p className="text-sm text-gray-600 mt-10">{therapist.description}</p>
                    </div>
                </div>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Massage Types</h4>
                    {therapist.yearsOfExperience && (
                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {therapist.yearsOfExperience} Years Experience
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {massageTypes.map(type => (
                        <span key={type} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">{type}</span>
                    ))}
                </div>
            </div>

            {/* Languages Spoken */}
            {therapist.languages && Array.isArray(therapist.languages) && therapist.languages.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Therapist Speaks</h4>
                    <div className="flex flex-wrap gap-2">
                        {therapist.languages.map(lang => {
                            const langMap: Record<string, {flag: string, name: string}> = {
                                'en': {flag: '🇬🇧', name: 'English'},
                                'id': {flag: '🇮🇩', name: 'Indonesian'},
                                'zh': {flag: '🇨🇳', name: 'Chinese'},
                                'ja': {flag: '🇯🇵', name: 'Japanese'},
                                'ko': {flag: '🇰🇷', name: 'Korean'},
                                'ru': {flag: '🇷🇺', name: 'Russian'},
                                'fr': {flag: '🇫🇷', name: 'French'},
                                'de': {flag: '🇩🇪', name: 'German'},
                                'es': {flag: '🇪🇸', name: 'Spanish'}
                            };
                            const langInfo = langMap[lang] || {flag: '🌐', name: lang};
                            return (
                                <span key={lang} className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1">
                                    <span className="text-base">{langInfo.flag}</span>
                                    <span>{langInfo.name}</span>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-center text-sm text-gray-600">
                <div className="bg-brand-orange-light p-2 rounded-lg">
                    <p>60 min</p>
                    <p className="font-bold text-brand-orange-dark">Rp {Number(pricing["60"]).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K</p>
                </div>
                <div className="bg-brand-orange-light p-2 rounded-lg">
                    <p>90 min</p>
                    <p className="font-bold text-brand-orange-dark">Rp {Number(pricing["90"]).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K</p>
                </div>
                <div className="bg-brand-orange-light p-2 rounded-lg">
                    <p>120 min</p>
                    <p className="font-bold text-brand-orange-dark">Rp {Number(pricing["120"]).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K</p>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={openWhatsApp}
                    className="w-1/2 flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300"
                >
                    <WhatsAppIcon className="w-5 h-5"/>
                    <span>Book Now</span>
                </button>
                 <button 
                    onClick={() => onBook(therapist)} 
                    className="w-1/2 flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-300"
                >
                    <CalendarIcon className="w-5 h-5"/>
                    <span>Schedule</span>
                </button>
            </div>

            {/* Leave Review Link */}
            <div className="text-center mt-3">
                <button
                    onClick={() => onRate(therapist)}
                    className="text-sm text-orange-600 hover:text-orange-700 font-semibold underline"
                >
                    Reviews Help The Community
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
                                This therapist is booked at present and we cannot ensure how many hours they will be busy. 
                                Please send a message and when the therapist is available, they will reply.
                            </p>
                            <p className="text-sm font-semibold text-orange-600 mb-6">- <span className="text-black">Inda</span>Street Admin</p>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowBusyModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmBusyContact}
                                    className="flex-1 px-4 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Chat Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TherapistCard;