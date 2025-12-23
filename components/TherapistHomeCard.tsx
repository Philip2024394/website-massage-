import React, { useState, useEffect } from 'react';
import type { Therapist, Analytics } from '../types';
import { getDisplayRating, getDisplayReviewCount, formatRating } from '../utils/ratingUtils';
import DistanceDisplay from './DistanceDisplay';
import { bookingService } from '../lib/appwriteService';

interface TherapistHomeCardProps {
    therapist: Therapist;
    onClick: (therapist: Therapist) => void;
    onIncrementAnalytics: (metric: keyof Analytics) => void;
    userLocation?: { lat: number; lng: number } | null;
}

const StarIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20">
        <path fill="currentColor" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const TherapistHomeCard: React.FC<TherapistHomeCardProps> = ({ 
    therapist, 
    onClick,
    onIncrementAnalytics,
    userLocation
}) => {
    const [bookingsCount, setBookingsCount] = useState<number>(() => {
        try {
            if ((therapist as any).analytics) {
                const parsed = JSON.parse((therapist as any).analytics);
                if (parsed && typeof parsed.bookings === 'number') return parsed.bookings;
            }
        } catch {}
        return 0;
    });

    useEffect(() => {
        const loadBookingsCount = async () => {
            try {
                const providerId = String((therapist as any).id || (therapist as any).$id || '');
                if (!providerId) return;
                
                const count = await bookingService.getBookingsCount(providerId, 'therapist');
                setBookingsCount(count);
            } catch (error) {
                console.error('Failed to load bookings count:', error);
            }
        };

        loadBookingsCount();
    }, [therapist]);

    // Parse pricing
    const getPricing = () => {
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
        
        return { "60": 0, "90": 0, "120": 0 };
    };

    const pricing = getPricing();

    const rawRating = getDisplayRating(therapist.rating, therapist.reviewCount);
    const effectiveRating = rawRating > 0 ? rawRating : 4.8;
    const displayRating = formatRating(effectiveRating);
    const displayReviewCount = getDisplayReviewCount(therapist.reviewCount);

    const formatPrice = (price: number) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `${(price / 1000).toFixed(0)}K`;
        }
        return price.toLocaleString('id-ID');
    };

    // Get status - map any status value to valid AvailabilityStatus
    const getStatusStyles = () => {
        const statusStr = String((therapist as any).availability || therapist.status || 'Offline');
        
        if (statusStr === 'Available') {
            return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Available' };
        } else if (statusStr === 'Busy') {
            return { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Busy' };
        }
        return { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', label: 'Offline' };
    };

    const statusStyle = getStatusStyles();

    return (
        <div 
            onClick={() => {
                onClick(therapist);
                onIncrementAnalytics('detailViews');
            }}
            className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer group"
        >
            {/* Image Container */}
            <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                    src={(therapist as any).profilePicture || (therapist as any).mainImage || '/default-avatar.jpg'}
                    alt={therapist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.jpg';
                    }}
                />
                
                {/* Status Badge - Top Right */}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full ${statusStyle.bg} backdrop-blur-sm flex items-center gap-2`}>
                    <span className={`w-2 h-2 rounded-full ${statusStyle.dot} animate-pulse`}></span>
                    <span className={`text-xs font-semibold ${statusStyle.text}`}>{statusStyle.label}</span>
                </div>

                {/* Orders Badge - Top Left */}
                {bookingsCount > 0 && (
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm">
                        <span className="text-xs font-bold text-white">{bookingsCount}+ Orders</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Name & Rating Row */}
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {therapist.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg ml-2">
                        <StarIcon className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-bold text-gray-900">{displayRating}</span>
                        <span className="text-xs text-gray-500">({displayReviewCount})</span>
                    </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 text-gray-600 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{therapist.city || therapist.location || 'Bali'}</span>
                    {userLocation && therapist.coordinates && (
                        <DistanceDisplay
                            userLocation={userLocation}
                            providerCoordinates={therapist.coordinates}
                            className="text-xs text-gray-500 ml-1"
                        />
                    )}
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {pricing["60"] > 0 && (
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">60 min</div>
                            <div className="text-sm font-bold text-gray-900">Rp {formatPrice(pricing["60"])}</div>
                        </div>
                    )}
                    {pricing["90"] > 0 && (
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">90 min</div>
                            <div className="text-sm font-bold text-gray-900">Rp {formatPrice(pricing["90"])}</div>
                        </div>
                    )}
                    {pricing["120"] > 0 && (
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">120 min</div>
                            <div className="text-sm font-bold text-gray-900">Rp {formatPrice(pricing["120"])}</div>
                        </div>
                    )}
                </div>

                {/* View Profile Button */}
                <button className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all">
                    View Profile
                </button>
            </div>
        </div>
    );
};

export default TherapistHomeCard;
