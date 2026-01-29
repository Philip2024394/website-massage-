import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck } from 'lucide-react';
import { useChatProvider } from '../../hooks/useChatProvider';
import MusicPlayer from '../MusicPlayer';
import type { UserLocation } from '../../types';

/**
 * 🔒 GOLD STANDARD UI COMPONENT – DO NOT DUPLICATE
 *
 * UnifiedHero is the SINGLE source of truth for all hero sections.
 *
 * Rules:
 * - This component MUST NOT be duplicated, copied, or reimplemented.
 * - Pages may import it using `mode="home"` or `mode="profile"` ONLY.
 * - Layouts MUST NOT render any hero.
 *
 * Allowed changes:
 * - Styling
 * - Text content
 * - Responsive layout
 *
 * Forbidden changes:
 * - Creating additional hero components
 * - Rendering hero outside of this file
 * - Conditional hero logic outside this component
 *
 * Owner: Platform UI Core
 * Status: STABLE
 */

interface Place {
    id?: string | number;
    $id?: string;
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
    discountDuration?: number;
    isDiscountActive?: boolean;
    discountEndTime?: string;
}

interface UnifiedHeroSectionProps {
    mode: 'home' | 'profile';
    
    // Home mode props
    userLocation?: UserLocation;
    contextCity?: string;
    
    // Profile mode props
    place?: Place;
    onBookNowClick?: () => void;
    onBookClick?: () => void;
    onRate?: (place: Place) => void;
    isCustomerLoggedIn?: boolean;
    activeDiscount?: { percentage: number; expiresAt: Date } | null;
    
    // Common props
    className?: string;
    isSticky?: boolean;
}

export const UnifiedHeroSection: React.FC<UnifiedHeroSectionProps> = ({
    mode,
    userLocation,
    contextCity,
    place,
    onBookNowClick,
    onBookClick,
    onRate,
    isCustomerLoggedIn,
    activeDiscount,
    className = '',
    isSticky = false
}) => {
    console.log("🎯 GOLD STANDARD HERO - Mode:", mode);
    
    const [showShareActions, setShowShareActions] = useState(false);
    const [discountTimeLeft, setDiscountTimeLeft] = useState('');
    const { addNotification } = useChatProvider();

    // Discount timer logic
    useEffect(() => {
        if (!place || !isDiscountActive(place)) return;
        
        const updateTimer = () => {
            const timeLeft = calculateDiscountTimeLeft(place);
            setDiscountTimeLeft(timeLeft);
        };
        
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [place]);

    const isDiscountActive = (place: Place): boolean => {
        if (!place?.isDiscountActive || !place?.discountEndTime) return false;
        
        try {
            const endTime = new Date(place.discountEndTime);
            return endTime > new Date();
        } catch (error) {
            console.warn('Invalid discount end time:', place.discountEndTime);
            return false;
        }
    };

    const calculateDiscountTimeLeft = (place: Place): string => {
        if (!place?.discountEndTime) return 'EXPIRED';
        
        try {
            const now = new Date().getTime();
            const endTime = new Date(place.discountEndTime).getTime();
            const timeDiff = endTime - now;
            
            if (timeDiff <= 0) return 'EXPIRED';
            
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            if (hours > 0) {
                return `${hours}h ${minutes}m ${seconds}s`;
            }
            return `${minutes}m ${seconds}s`;
        } catch (error) {
            console.warn('Error calculating time left:', error);
            return 'EXPIRED';
        }
    };

    const containerClasses = `
        ${isSticky ? 'sticky top-[60px] z-10' : ''}
        ${className}
    `;

    // Get display data based on mode
    const getDisplayData = () => {
        if (mode === 'home') {
            return {
                name: contextCity || (userLocation ? (() => {
                    if (!userLocation.address || userLocation.address.trim() === '') {
                        return `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
                    }
                    try {
                        const parts = String(userLocation.address).split(',').map(p => p.trim());
                        return parts.slice(-2).join(', ');
                    } catch (e) {
                        return `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
                    }
                })() : 'Detecting location...'),
                location: 'Indonesia\'s Massage Therapist Hub',
                mainImage: 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382',
                profilePicture: 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382',
                operatingHours: 'Daily 9:00 AM - 9:00 PM',
                isVerified: false,
                rating: null,
                showButtons: false,
                showMusicPlayer: true
            };
        } else if (mode === 'profile' && place) {
            return {
                name: place.name || 'Relax Massage Jogja',
                location: place.location && place.location.trim() !== '' && place.location !== 'Location pending setup' 
                    ? place.location 
                    : 'Indonesia\'s Massage Therapist Hub',
                mainImage: place.mainImage || 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382',
                profilePicture: place.profilePicture || place.mainImage || 'https://via.placeholder.com/150?text=Logo',
                operatingHours: place.operatingHours || 'Daily 9:00 AM - 9:00 PM',
                isVerified: place.isVerified || false,
                rating: place.rating,
                showButtons: !!(onBookNowClick || onBookClick),
                showMusicPlayer: false,
                discountPercentage: place.discountPercentage,
                isDiscountActive: isDiscountActive(place)
            };
        }
        return null;
    };

    const displayData = getDisplayData();
    if (!displayData) return null;

    // Unified hero design using profile layout for both modes
    return (
        <div className={`bg-white ${containerClasses}`.trim()}>
            {/* Main Image Section */}
            <div className="relative h-48 md:h-72">
                <img
                    src={displayData.mainImage}
                    alt={displayData.name}
                    className="w-full h-full object-cover"
                />
                
                {/* Music Player for Home Mode */}
                {displayData.showMusicPlayer && (
                    <div className="absolute top-2 left-2">
                        <MusicPlayer autoPlay={true} />
                    </div>
                )}
                
                {/* Discount Badge - Profile Mode Only */}
                {displayData.isDiscountActive && displayData.discountPercentage && (
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-full px-4 py-2 shadow-lg">
                            <div className="flex items-center gap-2 text-white">
                                <span className="text-xl font-bold">{displayData.discountPercentage}% OFF</span>
                            </div>
                            <div className="text-center">
                                <div className="text-xs font-medium text-orange-100">
                                    Ends in: {discountTimeLeft}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Operating Hours */}
                <div className={`absolute flex items-center gap-1 px-3 py-1.5 bg-black/70 text-white rounded-full text-xs ${
                    displayData.isDiscountActive && displayData.discountPercentage
                        ? 'top-24 right-2'
                        : 'top-2 right-2'
                }`}>
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-sm">{displayData.operatingHours}</span>
                </div>

                {/* Profile Image */}
                <div className="absolute bottom-0 left-6 md:left-8 transform translate-y-1/2">
                    <div className="relative">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                            <img
                                src={displayData.profilePicture}
                                alt={`${displayData.name} logo`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        {/* Rating Badge - Profile Mode Only */}
                        {displayData.rating && displayData.rating > 0 && (
                            <div className="absolute -bottom-2 -right-2 bg-yellow-500 rounded-full px-2 py-1 shadow-lg">
                                <div className="flex items-center gap-1">
                                    <span className="text-white text-xs font-bold">
                                        {typeof displayData.rating === 'string' ? parseFloat(displayData.rating).toFixed(1) : displayData.rating.toFixed(1)}
                                    </span>
                                    <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.95-.69l1.07-3.292z"/>
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Share Button - Profile Mode Only */}
                {mode === 'profile' && (
                    <div className="absolute bottom-4 right-4">
                        <button
                            onClick={() => setShowShareActions(true)}
                            className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-colors"
                            aria-label="Share place"
                        >
                            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-6 pt-8 md:pt-8 relative">
                {/* Verified Badge - Profile Mode Only */}
                {mode === 'profile' && displayData.isVerified && (
                    <div className="absolute -top-8 right-6 flex items-center gap-1.5 text-blue-600">
                        <ShieldCheck className="w-6 h-6 fill-blue-600" />
                        <span className="font-semibold text-sm">Verified</span>
                    </div>
                )}
                
                {/* Place/Location Name */}
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 ml-16 md:ml-20">{displayData.name}</h2>
                
                {/* Location Display */}
                <div className="mb-4 flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <svg 
                            className="w-4 h-4 text-gray-700" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor" 
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                        </svg>
                        <span className="text-lg font-bold text-gray-900">
                            {displayData.location}
                        </span>
                    </div>
                    <p className="text-base font-semibold text-gray-600">Indonesia's Massage Therapist Hub</p>
                </div>

                {/* Description - Profile Mode Only */}
                {mode === 'profile' && place && place.description && place.description.trim() !== '' && (
                    <div className="mb-4">
                        <p className="text-xs text-gray-600 leading-relaxed text-justify">
                            {place.description}
                        </p>
                    </div>
                )}

                {/* Action Buttons - Profile Mode Only */}
                {displayData.showButtons && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        {onBookNowClick && (
                            <button
                                onClick={onBookNowClick}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-orange-500 text-white font-semibold text-sm rounded-lg hover:bg-orange-600 transition-colors shadow-lg"
                            >
                                Book Now
                            </button>
                        )}
                        
                        {onBookClick && (
                            <button
                                onClick={onBookClick}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-green-500 text-white font-semibold text-sm rounded-lg hover:bg-green-600 transition-colors shadow-lg"
                            >
                                Instant Booking
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Share Modal - Profile Mode Only */}
            {mode === 'profile' && showShareActions && place && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowShareActions(false)}>
                    <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4">Share {place.name}</h3>
                        <div className="space-y-2">
                            <button 
                                onClick={() => {
                                    navigator.share?.({ title: place.name, url: window.location.href });
                                    setShowShareActions(false);
                                }}
                                className="w-full text-left p-2 hover:bg-gray-100 rounded"
                            >
                                📱 Native Share
                            </button>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    addNotification('success', 'Link copied!', '', { duration: 2000 });
                                    setShowShareActions(false);
                                }}
                                className="w-full text-left p-2 hover:bg-gray-100 rounded"
                            >
                                📋 Copy Link
                            </button>
                        </div>
                        <button 
                            onClick={() => setShowShareActions(false)}
                            className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnifiedHeroSection;