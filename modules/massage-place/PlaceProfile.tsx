/**
 * PlaceProfile Component
 * 
 * Extracted from MassagePlaceCard.tsx as part of Phase 3 modularization.
 * Handles the profile section with place image, name, status, and distance display.
 * 
 * Features:
 * - Profile picture with verified badge
 * - Place name and status with animated indicators
 * - Distance display with travel time
 * - Flexbox layout matching original design
 */

import React from 'react';
import DistanceDisplay from '../../components/DistanceDisplay';
import { parseCoordinates } from '../../utils/appwriteHelpers';

interface PlaceProfileProps {
    place: any;
    mainImage: string;
    userLocation?: { lat: number; lng: number } | null;
}

const PlaceProfile: React.FC<PlaceProfileProps> = ({
    place,
    mainImage,
    userLocation
}) => {
    return (
        <>
            {/* Location - Below image on the right side */}
            <div className="px-4 mt-2 mb-1 flex justify-end">
                <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-700">{(place.location || 'Bali').split(',')[0].trim()}</span>
                </div>
            </div>
            
            {/* Profile Section - Flexbox layout for stable positioning */}
            <div className="px-4 -mt-8 sm:-mt-12 pb-6 relative z-10 overflow-visible">
                <div className="flex items-start justify-between gap-4">
                    {/* Left side: Profile + Name + Status */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                            <div className="relative w-16 sm:w-20 h-16 sm:h-20 aspect-square">
                                <img 
                                    className="w-16 sm:w-20 h-16 sm:h-20 aspect-square rounded-full object-cover border-4 border-white shadow-lg bg-gray-100" 
                                    src={(place as any).profilePicture || (place as any).logo || mainImage}
                                    alt={place.name}
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382';
                                    }}
                                />
                                {/* Verified Pro Rosette */}
                                {(place as any).isVerified && (
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-500">
                                        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 1.5l2.19 4.44 4.9.71-3.54 3.45.83 4.86L10 12.9l-4.38 2.33.83-4.86L2.91 6.65l4.9-.71L10 1.5zm-1.2 9.09l-1.6-1.6a.75.75 0 10-1.06 1.06l2.13 2.13a.75.75 0 001.06 0l4.13-4.13a.75.75 0 10-1.06-1.06l-3.6 3.6z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Name and Status Column */}
                        <div className="flex-1 min-w-0 pt-10 sm:pt-14 pb-2">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{place.name}</h3>
                            {(() => {
                                const statusStr = String((place as any).availability || place.status || 'Open');
                                const isOpen = statusStr === 'Open' || statusStr === 'Available';
                                const isClosed = statusStr === 'Closed';
                                const bgColor = isOpen ? 'bg-green-100' : isClosed ? 'bg-red-100' : 'bg-orange-100';
                                const textColor = isOpen ? 'text-green-700' : isClosed ? 'text-red-700' : 'text-orange-700';
                                const dotColor = isOpen ? 'bg-green-500' : isClosed ? 'bg-red-500' : 'bg-orange-500';
                                const ringColor1 = isOpen ? 'bg-green-300' : isClosed ? 'bg-red-300' : 'bg-orange-300';
                                const ringColor2 = isOpen ? 'bg-green-400' : isClosed ? 'bg-red-400' : 'bg-orange-400';
                                const label = isOpen ? 'Open Now' : isClosed ? 'Closed' : statusStr;
                                
                                return (
                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} mt-1`}>
                                        <span className="relative mr-1.5">
                                            {/* Static ring glow effect */}
                                            <span className={`absolute inset-0 w-4 h-4 -left-1 -top-1 rounded-full ${ringColor1} opacity-40`}></span>
                                            <span className={`absolute inset-0 w-3 h-3 -left-0.5 -top-0.5 rounded-full ${ringColor2} opacity-30`}></span>
                                            <span className={`w-2 h-2 rounded-full block ${dotColor}`}></span>
                                        </span>
                                        {label}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                    
                    {/* Right side: Distance */}
                    <div className="flex-shrink-0 pb-2 mt-10 sm:mt-14">
                        <DistanceDisplay
                            userLocation={userLocation}
                            providerLocation={parseCoordinates(place.coordinates) || { lat: 0, lng: 0 }}
                            className="text-sm"
                            showTravelTime={true}
                            showIcon={true}
                            size="sm"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlaceProfile;