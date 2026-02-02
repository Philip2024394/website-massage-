import React, { useState, useEffect } from 'react';
import type { Place } from '../types';
import SocialSharePopup from './SocialSharePopup';
import { getDisplayRating, formatRating } from '../utils/ratingUtils';
import { useLanguageContext } from '../context/LanguageContext';
import { usePersistentChatIntegration } from '../hooks/usePersistentChatIntegration';

interface PlaceCardProps {
    place: Place;
    onClick?: () => void; // Made optional since we're handling booking internally
    onRate: (place: Place) => void;
    activeDiscount?: { percentage: number; expiresAt: Date } | null; // Active discount
    _t?: any; // Translation object for detecting language
}

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


function PlaceCard({ place, onClick, onRate, activeDiscount, _t }: PlaceCardProps) {
    const { language } = useLanguageContext();
    const [discountTimeLeft, setDiscountTimeLeft] = useState<string>('');
    const [showSharePopup, setShowSharePopup] = useState(false);
    
    // 🔒 PERSISTENT CHAT - Facebook Messenger style booking integration
    const { openBookingChat } = usePersistentChatIntegration();
    
    // Use language from context instead of detecting from translations
    const currentLanguage: 'en' | 'id' = language as 'en' | 'id';
    
    // Get translated description based on current language
    const getTranslatedDescription = () => {
        if (currentLanguage === 'id') {
            // Try Indonesian translation first, fallback to base description
            return (place as any).description_id || place.description || ("" as string);
        } else {
            // Try English translation first, fallback to base description
            return (place as any).description_en || place.description || ("" as string);
        }
    };
    
    const translatedDescription = getTranslatedDescription();
    
    // Parse pricing for booking
    const getParsedPricing = () => {
        try {
            return typeof place.pricing === 'string' 
                ? JSON.parse(place.pricing) 
                : place.pricing || {"60": 0, "90": 0, "120": 0};
        } catch {
            return {"60": 0, "90": 0, "120": 0};
        }
    };
    
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
    
    const handleRateClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRate(place);
    };
    
    // Handle booking - opens persistent chat with place details
    const handleBooking = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        console.log('🏢 Opening booking for place:', place.name);
        
        // 🔒 CRITICAL: Use appwriteId (Appwrite document ID), not id
        openBookingChat({
            appwriteId: place.$id,  // ✅ REQUIRED: Appwrite document ID
            name: place.name,
            image: place.profilePicture || place.mainImage,
            pricing: getParsedPricing(),
            whatsapp: (place as any).whatsapp || (place as any).phoneNumber,
            status: 'AVAILABLE', // Places are always available (no BUSY status)
            availabilityStatus: 'AVAILABLE',
            duration: 60, // Default duration
            clientPreferences: undefined, // Places don't have client preferences
        });
    };

    return (
        <>
        <div 
            className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer" 
            onClick={handleBooking}
            role="button"
            aria-label={`Book massage at ${place.name}`}
        >
            <div className="h-40 w-full relative">
                <img className="h-40 w-full object-cover" src={place.mainImage || ("1" as string)} alt={place.name} />
                
                {/* Star Rating - Top Right Corner with higher z-index */}
                <div 
                    className="absolute top-2 right-2 z-30 flex items-center gap-1 bg-black/70 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg cursor-pointer"
                    onClick={handleRateClick}
                    aria-label={`Rate ${place.name}`}
                    role="button"
                >
                    <StarIcon className="w-5 h-5 text-yellow-400"/>
                    <span className="font-bold text-white text-sm">{place.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-300">({place.reviewCount})</span>
                </div>
                


                {/* Active Discount Badge - Top Right Corner */}
                {activeDiscount && discountTimeLeft !== 'EXPIRED' && (
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1" onClick={(e) => e.stopPropagation()}>
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
                
                {/* Qualified Business Badge - Top Right Corner */}
                {/* Badge requirements: */}
                {/* 1. 3+ consecutive months of paid membership */}
                {/* 2. 4.0+ star rating */}
                {/* 3. Max 5-day grace period between renewals */}
                {(((place as any).totalActiveMembershipMonths ?? 0) >= 3 && 
                  (place.rating ?? 0) >= 4.0 && 
                  ((place as any).badgeEligible ?? false)) && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full px-3 py-1.5 shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span className="font-semibold text-white text-xs">Qualified</span>
                    </div>
                )}
                
                {/* Share Button - Bottom Right Corner */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowSharePopup(true);
                    }}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-30"
                    aria-label="Share this place"
                >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                </button>
            </div>
            
            {/* Profile and Content Section - Flexbox layout */}
            <div className="px-4 -mt-8 relative z-10">
                <div className="flex items-end justify-between gap-3">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white aspect-square">
                            <img 
                                src={place.profilePicture || place.mainImage || ("1" as string)} 
                                alt={`${place.name} logo`}
                                className="w-full h-full rounded-full object-cover aspect-square"
                            />
                        </div>
                    </div>
                    
                    {/* Name and Distance */}
                    <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-center gap-2">
                            {/* Verified Badge - Show if place has both bank details and KTP */}
                            {(() => {
                                // 🏆 VERIFICATION CRITERIA: Bank details + KTP upload required
                                const hasVerifiedBadge = (place as any).verifiedBadge || place.isVerified;
                                const hasBankDetails = place.bankName && place.accountName && place.accountNumber;
                                const hasKtpUploaded = place.ktpPhotoUrl;
                                const shouldShowBadge = hasVerifiedBadge || (hasBankDetails && hasKtpUploaded);
                                
                                return shouldShowBadge && (
                                    <img 
                                        src="https://ik.imagekit.io/7grri5v7d/verified-removebg-preview.png?updatedAt=1768015154565"
                                        alt="Verified"
                                        className="w-5 h-5 flex-shrink-0"
                                        title="Verified Place - Bank Details & KTP Complete"
                                    />
                                );
                            })()}
                            
                            <h3 className="text-lg font-bold text-gray-900 truncate">{place.name}</h3>
                        </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 gap-1 pb-1 flex-shrink-0">
                        <span>{place.distance}km</span>
                    </div>
                </div>
            </div>
            
            {/* Content Section with natural flow */}
            <div className="p-4 pt-2">
                <p className="mt-1 text-gray-500 text-sm truncate">{translatedDescription}</p>

                {/* Languages Spoken */}
                {place.languages && Array.isArray(place.languages) && place.languages.length > 0 && (
                    <div className="mt-3">
                        <h4 className="text-xs font-semibold text-gray-700 mb-1.5">Languages</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {place.languages.map(lang => {
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
                                    <span key={lang} className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1">
                                        <span className="text-sm">{langInfo.flag}</span>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Massage Types Offered */}
                {place.massageTypes && (() => {
                    let massageTypes: string[] = [];
                    try {
                        massageTypes = typeof place.massageTypes === 'string' 
                            ? JSON.parse(place.massageTypes) 
                            : place.massageTypes;
                    } catch {
                        massageTypes = [];
                    }
                    return Array.isArray(massageTypes) && massageTypes.length > 0 ? (
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-1.5">
                                <h4 className="text-xs font-semibold text-gray-700">Areas of Expertise</h4>
                                {place.yearsEstablished && (
                                    <span className="px-2 py-0.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-full">
                                        {place.yearsEstablished} {place.yearsEstablished === 1 ? 'Year' : 'Years'} Est.
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {massageTypes.slice(0, 5).map((type, index) => (
                                    <span key={index} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-200">
                                        {type}
                                    </span>
                                ))}
                                {massageTypes.length > 5 && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                        +{massageTypes.length - 5} more
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : null;
                })()}

                {/* Price structure for 60, 90, 120 min */}
                                {place.pricing && (
                                    (() => {
                                        let pricing = {"60":0,"90":0,"120":0};
                                        try { pricing = JSON.parse(place.pricing); } catch { /* ignore parsing errors */ }
                                        return (
                                            <div className="grid grid-cols-3 gap-2 text-center text-sm mt-3">
                                                <div className="bg-gray-100 p-2 rounded-lg border border-gray-200 shadow-md relative">
                                                    {/* Star Rating - Top Right */}
                                                    {getDisplayRating(place.rating, place.reviewCount) > 0 && (
                                                        <div className="absolute top-1 right-1 text-yellow-400 text-xs font-bold">
                                                            ★{formatRating(getDisplayRating(place.rating, place.reviewCount))}
                                                        </div>
                                                    )}
                                                    <p className="text-gray-600">60 min</p>
                                                    <p className="font-bold text-gray-800">Rp {String(pricing["60"]).padStart(3, '0')}k</p>
                                                </div>
                                                <div className="bg-gray-100 p-2 rounded-lg border border-gray-200 shadow-md relative">
                                                    {/* Star Rating - Top Right */}
                                                    {getDisplayRating(place.rating, place.reviewCount) > 0 && (
                                                        <div className="absolute top-1 right-1 text-yellow-400 text-xs font-bold">
                                                            ★{formatRating(getDisplayRating(place.rating, place.reviewCount))}
                                                        </div>
                                                    )}
                                                    <p className="text-gray-600">90 min</p>
                                                    <p className="font-bold text-gray-800">Rp {String(pricing["90"]).padStart(3, '0')}k</p>
                                                </div>
                                                <div className="bg-gray-100 p-2 rounded-lg border border-gray-200 shadow-md relative">
                                                    {/* Star Rating - Top Right */}
                                                    {getDisplayRating(place.rating, place.reviewCount) > 0 && (
                                                        <div className="absolute top-1 right-1 text-yellow-400 text-xs font-bold">
                                                            ★{formatRating(getDisplayRating(place.rating, place.reviewCount))}
                                                        </div>
                                                    )}
                                                    <p className="text-gray-600">120 min</p>
                                                    <p className="font-bold text-gray-800">Rp {String(pricing["120"]).padStart(3, '0')}k</p>
                                                </div>
                                            </div>
                                        );
                                    })()
                                )}
                        </div>
        </div>

        {/* Social Share Popup */}
        <SocialSharePopup
            isOpen={showSharePopup}
            onClose={() => setShowSharePopup(false)}
            title={place.name}
            description={`Discover ${place.name} on IndaStreet! ${place.description || ("." as string)}`}
            url={window.location.href}
            type="place"
        />
    </>
    );
};

export default React.memo(PlaceCard);




