import React, { useState, useEffect } from 'react';
import type { Place } from '../types';

interface PlaceCardProps {
    place: Place;
    onClick: () => void;
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


const PlaceCard: React.FC<PlaceCardProps> = ({ place, onClick, onRate, activeDiscount, _t }) => {
    const [discountTimeLeft, setDiscountTimeLeft] = useState<string>('');
    
    // Detect language from translations object
    const currentLanguage: 'en' | 'id' = _t?.schedule === 'Schedule' ? 'en' : 'id';
    
    // Get translated description based on current language
    const getTranslatedDescription = () => {
        if (currentLanguage === 'id') {
            // Try Indonesian translation first, fallback to base description
            return (place as any).description_id || place.description || '';
        } else {
            // Try English translation first, fallback to base description
            return (place as any).description_en || place.description || '';
        }
    };
    
    const translatedDescription = getTranslatedDescription();
    
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

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300" onClick={onClick}>
            <div className="h-40 w-full relative">
                <img className="h-40 w-full object-cover" src={place.mainImage || 'https://ik.imagekit.io/7grri5v7d/massage%20indonsea.png?updatedAt=1761973275491'} alt={place.name} />
                
                {/* Verified Badge - Inside main image at top-left */}
                {(place as any).isVerified && (
                    <div className="absolute top-2 left-2 z-20">
                        <img 
                            src="https://ik.imagekit.io/7grri5v7d/indastreet_verfied-removebg-preview.png" 
                            alt="Verified"
                            className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                        />
                    </div>
                )}
                
                {/* Star Rating - Top Left Corner */}
                <div 
                    className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg cursor-pointer"
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
                
                {/* Share Buttons - Lower Right Corner */}
                <div className="absolute bottom-2 right-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* Instagram */}
                    <a
                        href={`https://www.instagram.com/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        aria-label="Share on Instagram"
                    >
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                    </a>
                    
                    {/* WhatsApp */}
                    <a
                        href={`https://wa.me/?text=Check out ${place.name} on IndaStreet!`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        aria-label="Share on WhatsApp"
                    >
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.614-1.486L.057 24z"/>
                        </svg>
                    </a>
                    
                    {/* Facebook */}
                    <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        aria-label="Share on Facebook"
                    >
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </a>
                    
                    {/* TikTok */}
                    <a
                        href={`https://www.tiktok.com/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 bg-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        aria-label="Share on TikTok"
                    >
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                    </a>
                </div>
                
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
            </div>
            
            {/* Circular Profile Picture - Overlapping main image */}
            <div className="absolute top-32 left-4 w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white aspect-square">
                <img 
                    src={place.profilePicture || place.mainImage || 'https://ik.imagekit.io/7grri5v7d/massage%20indonsea.png?updatedAt=1761973275491'} 
                    alt={`${place.name} logo`}
                    className="w-full h-full rounded-full object-cover aspect-square"
                />
            </div>
            
            {/* Content Section with padding-top and padding-left to account for overlapping profile image */}
            <div className="p-4 pt-16">
                {/* Name and Distance - Positioned to the right of profile picture */}
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 pl-12">{place.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 gap-1">
                        <LocationPinIcon className="w-4 h-4 text-red-500"/>
                        <span>{place.distance}km</span>
                    </div>
                </div>
                <p className="mt-1 text-gray-500 text-sm truncate pl-12">{translatedDescription}</p>

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
                                <h4 className="text-xs font-semibold text-gray-700">Massage Specializations</h4>
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
                                                <div className="bg-gray-100 p-2 rounded-lg border border-gray-200 shadow-md">
                                                    <p className="text-gray-600">60 min</p>
                                                    <p className="font-bold text-gray-800">Rp {String(pricing["60"]).padStart(3, '0')}k</p>
                                                </div>
                                                <div className="bg-gray-100 p-2 rounded-lg border border-gray-200 shadow-md">
                                                    <p className="text-gray-600">90 min</p>
                                                    <p className="font-bold text-gray-800">Rp {String(pricing["90"]).padStart(3, '0')}k</p>
                                                </div>
                                                <div className="bg-gray-100 p-2 rounded-lg border border-gray-200 shadow-md">
                                                    <p className="text-gray-600">120 min</p>
                                                    <p className="font-bold text-gray-800">Rp {String(pricing["120"]).padStart(3, '0')}k</p>
                                                </div>
                                            </div>
                                        );
                                    })()
                                )}
                        </div>
        </div>
    );
};

export default PlaceCard;