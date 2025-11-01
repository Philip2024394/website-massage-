import React, { useState, useEffect } from 'react';
import type { Place, Analytics } from '../types';
import { parsePricing } from '../utils/appwriteHelpers';

interface MassagePlaceCardProps {
    place: Place;
    onRate: (place: Place) => void;
    onSelectPlace: (place: Place) => void;
    onNavigate?: (page: string) => void;
    onIncrementAnalytics: (metric: keyof Analytics) => void;
    onShowRegisterPrompt?: () => void;
    isCustomerLoggedIn?: boolean;
    activeDiscount?: { percentage: number; expiresAt: Date } | null;
    t: any;
    userLocation?: { lat: number; lng: number } | null;
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

const MassagePlaceCard: React.FC<MassagePlaceCardProps> = ({ 
    place, 
    onRate, 
    onSelectPlace,
    onNavigate,
    onIncrementAnalytics,
    onShowRegisterPrompt,
    isCustomerLoggedIn = false,
    activeDiscount,
    t: _t,
    userLocation
}) => {
    const [showReferModal, setShowReferModal] = useState(false);
    const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
    const [discountTimeLeft, setDiscountTimeLeft] = useState<string>('');
    
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
    
    // Parse pricing
    const pricing = parsePricing(place.pricing) || { "60": 0, "90": 0, "120": 0 };
    
    // Get main image
    const mainImage = (place as any).mainImage || 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382';
    
    // Get amenities if available
    const amenities = (place as any).amenities || [];
    const displayAmenities = Array.isArray(amenities) ? amenities.slice(0, 3) : [];

    // Calculate distance (mock for now)
    const distance = place.distance || '2.5';

    const handleViewDetails = () => {
        console.log('🏨 MassagePlaceCard - View Details clicked:', {
            place: place,
            placeName: place.name,
            placeId: place.id || (place as any).$id,
            onNavigate: !!onNavigate,
            onSelectPlace: !!onSelectPlace
        });
        
        onIncrementAnalytics('views');
        onSelectPlace(place);
        
        if (onNavigate) {
            console.log('🏨 Navigating to massagePlaceProfile');
            onNavigate('massagePlaceProfile');
        } else {
            console.error('❌ onNavigate is not defined!');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-visible relative">
            {/* Main Image Banner */}
            <div className="h-48 w-full bg-gradient-to-r from-orange-400 to-orange-600 overflow-hidden relative rounded-t-xl">
                <img 
                    src={mainImage} 
                    alt={`${place.name} cover`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382';
                    }}
                />
                {/* Star Rating - Top Left Corner */}
                <div 
                    className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg cursor-pointer"
                    onClick={() => onRate(place)}
                    aria-label={`Rate ${place.name}`}
                    role="button"
                >
                    <StarIcon className="w-4 h-4 text-yellow-400"/>
                    <span className="font-bold text-white text-sm">{(place.rating || 0).toFixed(1)}</span>
                    <span className="text-xs text-gray-300">({place.reviewCount || 0})</span>
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
                            const text = `Check out ${place.name} on IndaStreet - Amazing massage place!`;
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
                            navigator.clipboard.writeText(`Check out ${place.name} on IndaStreet - Amazing massage place! ${window.location.href}`);
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
                            navigator.clipboard.writeText(`Check out ${place.name} on IndaStreet - Amazing massage place! ${window.location.href}`);
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
            
            {/* Logo/Profile Picture - Positioned below banner, overlapping */}
            <div className="absolute top-40 left-4 z-10">
                <img 
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg bg-gray-100" 
                    src={(place as any).logo || mainImage}
                    alt={place.name}
                    onError={(e) => {
                        e.currentTarget.src = 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382';
                    }}
                />
            </div>
            
            {/* Distance - Positioned above place name */}
            <div className="absolute top-52 right-4 z-10">
                <div className="flex items-center text-sm text-gray-500 gap-1">
                    <LocationPinIcon className="w-4 h-4 text-red-500"/>
                    <span>{distance}km</span>
                </div>
            </div>
            
            {/* Place Name and Status - Positioned to the right of logo */}
            <div className="absolute top-56 left-28 right-4 z-10">
                <h3 className="text-lg font-bold text-gray-900">{place.name}</h3>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 mt-1">
                    <span className="relative mr-1.5">
                        <span className="absolute inset-0 w-4 h-4 -left-1 -top-1 rounded-full bg-white opacity-60"></span>
                        <span className="w-2 h-2 rounded-full block bg-green-500"></span>
                    </span>
                    Open Now
                </div>
            </div>
            
            {/* Content */}
            <div className="p-4 pt-16 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    <div className="flex-grow">
                        <p className="text-sm text-gray-600 mt-10">{place.description || 'Experience authentic relaxation with expert massage services.'}</p>
                    </div>
                </div>

                {/* Amenities */}
                {displayAmenities.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                            {displayAmenities.map((amenity: string) => (
                                <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                                    {amenity}
                                </span>
                            ))}
                            {amenities.length > 3 && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                                    +{amenities.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Discount Notice - Shows when discount is active */}
                {(place as any).discountPercentage && (place as any).discountPercentage > 0 && (
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg shadow-md mb-2">
                        <div className="text-center">
                            <p className="font-bold text-base mb-1 animate-pulse">
                                🔥 {(place as any).discountPercentage}% OFF - PRICES ARE DISCOUNTED! 🔥
                            </p>
                            <p className="text-xs font-semibold">
                                The prices shown below are FINAL DISCOUNTED PRICES - this is what you'll pay!
                            </p>
                        </div>
                    </div>
                )}

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    {/* 60 min pricing */}
                    <div className="bg-gray-100 p-2 rounded-lg border border-gray-200 shadow-md relative">
                        <p className="text-gray-600">60 min</p>
                        {(place as any).discountPercentage && (place as any).discountPercentage > 0 ? (
                            <>
                                <p className="font-bold text-gray-800">
                                    Rp {Math.round(Number(pricing["60"]) * (1 - (place as any).discountPercentage / 100)).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K
                                </p>
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg animate-bounce">
                                    -{(place as any).discountPercentage}%
                                </span>
                            </>
                        ) : (
                            <p className="font-bold text-gray-800">Rp {Number(pricing["60"]).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K</p>
                        )}
                    </div>
                    
                    {/* 90 min pricing */}
                    <div className="bg-gray-100 p-2 rounded-lg border border-gray-200 shadow-md relative">
                        <p className="text-gray-600">90 min</p>
                        {(place as any).discountPercentage && (place as any).discountPercentage > 0 ? (
                            <>
                                <p className="font-bold text-gray-800">
                                    Rp {Math.round(Number(pricing["90"]) * (1 - (place as any).discountPercentage / 100)).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K
                                </p>
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg animate-bounce">
                                    -{(place as any).discountPercentage}%
                                </span>
                            </>
                        ) : (
                            <p className="font-bold text-gray-800">Rp {Number(pricing["90"]).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K</p>
                        )}
                    </div>
                    
                    {/* 120 min pricing */}
                    <div className="bg-gray-100 p-2 rounded-lg border border-gray-200 shadow-md relative">
                        <p className="text-gray-600">120 min</p>
                        {(place as any).discountPercentage && (place as any).discountPercentage > 0 ? (
                            <>
                                <p className="font-bold text-gray-800">
                                    Rp {Math.round(Number(pricing["120"]) * (1 - (place as any).discountPercentage / 100)).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K
                                </p>
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg animate-bounce">
                                    -{(place as any).discountPercentage}%
                                </span>
                            </>
                        ) : (
                            <p className="font-bold text-gray-800">Rp {Number(pricing["120"]).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K</p>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleViewDetails}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-300"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>View Details & Chat</span>
                </button>

                {/* Refer Friend and Leave Review Links */}
                <div className="flex justify-between items-center mt-3 px-2">
                    <button
                        onClick={() => setShowReferModal(true)}
                        className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                    >
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
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
                                onRate(place);
                            }
                        }}
                        className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                    >
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>Leave Review</span>
                    </button>
                </div>
            </div>
            
            {/* Refer Friend Modal */}
            {showReferModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowReferModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[90vw] sm:max-w-md p-3 sm:p-5 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Refer a Friend</h3>
                            <p className="text-gray-600 mb-6">Share IndaStreet with friends and earn coins! 🎁</p>
                            
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-2xl font-bold text-orange-600">50 Coins</span>
                                </div>
                                <p className="text-sm text-gray-700">For each friend who signs up!</p>
                            </div>
                            
                            <div className="space-y-3 mb-6">
                                <p className="text-sm text-gray-600 text-left">
                                    📱 Share your referral link:
                                </p>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value="https://indastreet.com/ref/USER123" 
                                        readOnly 
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText('https://indastreet.com/ref/USER123');
                                            alert('Link copied to clipboard!');
                                        }}
                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-sm"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-2 mb-6">
                                <p className="text-sm text-gray-600 mb-3">Share via:</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    <button
                                        onClick={() => {
                                            window.open(`https://wa.me/?text=${encodeURIComponent('Check out IndaStreet - Book amazing massages! https://indastreet.com/ref/USER123')}`, '_blank');
                                        }}
                                        className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/whats%20app%20icon.png?updatedAt=1761844859402" 
                                            alt="WhatsApp"
                                            className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                                        />
                                        <span className="text-xs sm:text-sm font-semibold text-gray-700">WhatsApp</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://indastreet.com/ref/USER123')}`, '_blank');
                                        }}
                                        className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/facebook.png?updatedAt=1761844676576" 
                                            alt="Facebook"
                                            className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                                        />
                                        <span className="text-xs sm:text-sm font-semibold text-gray-700">Facebook</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText('Check out IndaStreet - Book amazing massages! https://indastreet.com/ref/USER123');
                                            alert('Instagram message copied! Open Instagram and paste to share.');
                                        }}
                                        className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/insta.png?updatedAt=1761845305146" 
                                            alt="Instagram"
                                            className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                                        />
                                        <span className="text-xs sm:text-sm font-semibold text-gray-700">Instagram</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText('Check out IndaStreet - Book amazing massages! https://indastreet.com/ref/USER123');
                                            alert('TikTok message copied! Open TikTok and paste to share.');
                                        }}
                                        className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/tiktok.png?updatedAt=1761845101981" 
                                            alt="TikTok"
                                            className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                                        />
                                        <span className="text-xs sm:text-sm font-semibold text-gray-700">TikTok</span>
                                    </button>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setShowReferModal(false)}
                                className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
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
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
                            <p className="text-gray-600 mb-6">Please register or login to leave a review.</p>
                            <button
                                onClick={() => {
                                    setShowLoginRequiredModal(false);
                                    onShowRegisterPrompt?.();
                                }}
                                className="w-full px-4 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                Register / Login
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MassagePlaceCard;
