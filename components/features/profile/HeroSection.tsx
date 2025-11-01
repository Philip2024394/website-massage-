import React, { useState } from 'react';
import { Star, MapPin, Clock, Calendar, Globe, ShieldCheck } from 'lucide-react';

// Language display mapping
const LANGUAGE_MAP: Record<string, { flag: string; name: string }> = {
    'en': { flag: '🇬🇧', name: 'English' },
    'id': { flag: '🇮🇩', name: 'Indonesian' },
    'zh': { flag: '🇨🇳', name: 'Chinese' },
    'ja': { flag: '🇯🇵', name: 'Japanese' },
    'ko': { flag: '🇰🇷', name: 'Korean' },
    'ru': { flag: '🇷🇺', name: 'Russian' },
    'fr': { flag: '🇫🇷', name: 'French' },
    'de': { flag: '🇩🇪', name: 'German' },
    'es': { flag: '🇪🇸', name: 'Spanish' }
};

interface Place {
    name: string;
    mainImage?: string;
    profilePicture?: string;
    rating?: number;
    reviewCount?: number;
    location: string;
    operatingHours?: string;
    description?: string;
    distance?: number;
    languages?: string[];
    massageTypes?: any;
    isVerified?: boolean;
    verifiedAt?: string;
    activeMembershipDate?: string;
    pricing?: any;
    discountPercentage?: number;
}

interface HeroSectionProps {
    place: Place;
    onBookNowClick: () => void;
    onBookClick: () => void;
    onRate?: (place: Place) => void; // For Leave Review
    isCustomerLoggedIn?: boolean; // Check if customer is logged in
}

/**
 * Reusable Hero Section component
 * Displays the main image, place info, and action buttons
 */
export const HeroSection: React.FC<HeroSectionProps> = ({ 
    place, 
    onBookNowClick, 
    onBookClick,
    onRate,
    isCustomerLoggedIn = false
}) => {
    const [showReferModal, setShowReferModal] = useState(false);
    const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            {/* Main Banner Image - Increased height by 10% */}
            <div className="relative h-48 md:h-72">
                <img
                    src={place.mainImage || 'https://ik.imagekit.io/7grri5v7d/massage%20indonsea.png?updatedAt=1761973275491'}
                    alt={place.name}
                    className="w-full h-full object-cover"
                />
                
                {/* Discount Badge - Top Right Corner (when discount is set) */}
                {place.discountPercentage && place.discountPercentage > 0 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
                        <span className="font-bold text-lg">-{place.discountPercentage}% OFF</span>
                    </div>
                )}
                
                {/* Operating Hours Badge - Left side */}
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-sm">{place.operatingHours || 'Daily 9:00 AM - 9:00 PM'}</span>
                </div>
                
                {/* Distance Badge - Right side, bottom of image */}
                {place.distance !== undefined && (
                    <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                        <MapPin className="w-4 h-4 text-orange-400" />
                        <span className="font-semibold text-sm">{place.distance.toFixed(1)} km</span>
                    </div>
                )}
                
                {/* Social Share Buttons - Left Side Vertical */}
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* Instagram */}
                    <a
                        href={`https://www.instagram.com/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        aria-label="Share on Instagram"
                    >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                    </a>
                    
                    {/* WhatsApp */}
                    <a
                        href={`https://wa.me/?text=Check out ${place.name} on IndaStreet!`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
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
                        className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
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
                        className="w-9 h-9 bg-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        aria-label="Share on TikTok"
                    >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                    </a>
                </div>
                
                {/* Circular Profile Image - LEFT side, 20% LARGER than before */}
                <div className="absolute bottom-0 left-6 md:left-8 transform translate-y-1/2">
                    <div className="relative">
                        {/* Star Rating - Professionally positioned on lower edge */}
                        <div className="absolute bottom-0 -right-1 bg-yellow-400 rounded-full w-10 h-10 flex items-center justify-center shadow-lg z-10 border-2 border-white">
                            <div className="flex flex-col items-center">
                                <Star className="w-3.5 h-3.5 fill-white text-white mb-0.5" />
                                <span className="font-bold text-xs text-white leading-none">{place.rating || 5.0}</span>
                            </div>
                        </div>
                        
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                            <img
                                src={place.profilePicture || place.mainImage || 'https://via.placeholder.com/150?text=Logo'}
                                alt={`${place.name} logo`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section with padding adjustments */}
            <div className="p-6 pt-16 md:pt-16 relative">
                {/* Verified Badge - Below main image on right side, no container */}
                {place.isVerified && (
                    <div className="absolute -top-8 right-6 flex items-center gap-1.5 text-blue-600">
                        <ShieldCheck className="w-5 h-5 fill-blue-600" />
                        <span className="font-semibold text-sm">Verified</span>
                    </div>
                )}
                
                {/* Place Name - Positioned higher */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{place.name || 'Relax Massage Jogja'}</h2>
                
                {/* Location without icon */}
                <div className="mb-4">
                    <span className="text-sm md:text-base text-gray-600">{place.location}</span>
                </div>

                {/* Bio Text - Improved styling */}
                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">
                    {place.description || 'Experience authentic relaxation in Yogyakarta with expert hands targeting deep tension and promoting total body recovery.'}
                </p>

                {/* Massage Types Offered Section - Positioned after bio */}
                {place.massageTypes && (() => {
                    const types = typeof place.massageTypes === 'string' 
                        ? JSON.parse(place.massageTypes) 
                        : place.massageTypes;
                    return Array.isArray(types) && types.length > 0 ? (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Star className="w-5 h-5 text-orange-500" />
                                <h4 className="text-sm font-semibold text-gray-900">Massage Types Offered</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {types.map((type: string, index: number) => (
                                    <div
                                        key={index}
                                        className="px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-full text-sm font-medium text-orange-900"
                                    >
                                        {type}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null;
                })()}

                {/* Languages Spoken Section */}
                {place.languages && place.languages.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Globe className="w-5 h-5 text-orange-500" />
                            <h4 className="text-sm font-semibold text-gray-900">Languages Spoken</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {place.languages.map((langCode) => {
                                const lang = LANGUAGE_MAP[langCode];
                                if (!lang) return null;
                                return (
                                    <div
                                        key={langCode}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full text-sm"
                                    >
                                        <span className="text-base">{lang.flag}</span>
                                        <span className="font-medium text-blue-900">{lang.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Pricing Grid - Same as Therapist Card */}
                {place.pricing && (() => {
                    const pricing = typeof place.pricing === 'string' ? JSON.parse(place.pricing) : place.pricing;
                    return (
                        <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
                            {/* 60 min pricing */}
                            <div className="bg-gray-100 p-2 rounded-lg border border-gray-200 shadow-md relative">
                                <p className="text-gray-600">60 min</p>
                                {place.discountPercentage && place.discountPercentage > 0 ? (
                                    <>
                                        <p className="font-bold text-gray-800">
                                            Rp {Math.round(Number(pricing["60"]) * (1 - place.discountPercentage / 100)).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K
                                        </p>
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg animate-bounce">
                                            -{place.discountPercentage}%
                                        </span>
                                    </>
                                ) : (
                                    <p className="font-bold text-gray-800">Rp {Number(pricing["60"]).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K</p>
                                )}
                            </div>
                            
                            {/* 90 min pricing */}
                            <div className="bg-gray-100 p-2 rounded-lg border border-gray-200 shadow-md relative">
                                <p className="text-gray-600">90 min</p>
                                {place.discountPercentage && place.discountPercentage > 0 ? (
                                    <>
                                        <p className="font-bold text-gray-800">
                                            Rp {Math.round(Number(pricing["90"]) * (1 - place.discountPercentage / 100)).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K
                                        </p>
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg animate-bounce">
                                            -{place.discountPercentage}%
                                        </span>
                                    </>
                                ) : (
                                    <p className="font-bold text-gray-800">Rp {Number(pricing["90"]).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K</p>
                                )}
                            </div>
                            
                            {/* 120 min pricing */}
                            <div className="bg-gray-100 p-2 rounded-lg border border-gray-200 shadow-md relative">
                                <p className="text-gray-600">120 min</p>
                                {place.discountPercentage && place.discountPercentage > 0 ? (
                                    <>
                                        <p className="font-bold text-gray-800">
                                            Rp {Math.round(Number(pricing["120"]) * (1 - place.discountPercentage / 100)).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K
                                        </p>
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg animate-bounce">
                                            -{place.discountPercentage}%
                                        </span>
                                    </>
                                ) : (
                                    <p className="font-bold text-gray-800">Rp {Number(pricing["120"]).toLocaleString('en-US', {minimumIntegerDigits: 3, useGrouping: false})}K</p>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* Booking Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onBookNowClick}
                        className="flex items-center justify-center gap-2 py-2.5 px-4 bg-green-500 text-white font-semibold text-sm rounded-lg hover:bg-green-600 transition-colors shadow-lg"
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Book Now</span>
                    </button>
                    <button
                        onClick={onBookClick}
                        className="flex items-center justify-center gap-2 py-2.5 px-4 bg-orange-500 text-white font-semibold text-sm rounded-lg hover:bg-orange-600 transition-colors shadow-lg"
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Book Massage</span>
                    </button>
                </div>

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
                            } else if (onRate) {
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
                                    onClick={() => setShowLoginRequiredModal(false)}
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
        </div>
    );
};
