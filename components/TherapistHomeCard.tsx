/**
 * ⚠️ MOBILE RENDER STABILITY RULES ENFORCED ⚠️
 * 
 * CRITICAL: This component follows strict mobile render rules.
 * See: .mobile-render-rules.json for complete guidelines.
 * 
 * LOCKED PATTERNS:
 * ✅ Keys: ONLY use therapist.$id (NEVER index)
 * ✅ Images: aspect-ratio CSS required
 * ✅ Sizing: Fixed px with breakpoints (NO vw/vh)
 * ✅ Responsive: CSS-only (NO window.innerWidth)
 * ✅ Determinism: NO Math.random() or Date.now()
 * 
 * DO NOT MODIFY unless you understand React reconciliation.
 */

import React, { useState, useEffect } from 'react';
import type { Therapist, Analytics } from '../types';
import { getDisplayRating, formatRating } from '../utils/ratingUtils';
import { bookingService } from '../lib/bookingService';
import { isDiscountActive } from '../utils/therapistCardHelpers';
import SocialSharePopup from './SocialSharePopup';
import { generateShareableURL } from '../utils/seoSlugGenerator';
import { shareLinkService } from '../lib/services/shareLinkService';
import TherapistJoinPopup from './TherapistJoinPopup';
import { INDONESIAN_CITIES_CATEGORIZED } from '../constants/indonesianCities';

interface TherapistHomeCardProps {
    therapist: Therapist;
    onClick: (therapist: Therapist) => void;
    onIncrementAnalytics: (metric: keyof Analytics) => void;
    userLocation?: { lat: number; lng: number } | null;
    readOnly?: boolean; // Lock card to read-only mode
    onNavigate?: (page: string) => void; // Add navigation prop
    selectedCity?: string; // Add selectedCity prop for area display
    t?: any; // Add translations prop
    avatarOffsetPx?: number; // Fine-tune avatar overlap in pixels
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
    userLocation,
    readOnly = false, // Default to editable unless specified
    onNavigate, // Add navigation prop
    selectedCity, // Add selectedCity prop
    t, // Add translations prop
    avatarOffsetPx = 0
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

    // Share functionality state
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [shortShareUrl, setShortShareUrl] = useState<string>('');
    const [showJoinPopup, setShowJoinPopup] = useState(false);

    // Handle share functionality
    const handleShareClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowSharePopup(true);
    };

    useEffect(() => {
        const loadBookingsCount = async () => {
            try {
                const providerId = String((therapist as any).id || (therapist as any).$id || '');
                if (!providerId) return;
                
                const count = await bookingService.getBookingsCount(providerId, 'therapist');
                setBookingsCount(count);
            } catch (error) {
                // Silent fail - bookings collection may be disabled
            }
        };

        loadBookingsCount();
    }, [therapist]);

    // Generate share URL
    useEffect(() => {
        const generateShareUrl = async () => {
            try {
                const therapistId = String((therapist as any).id || (therapist as any).$id || '');
                if (!therapistId) return;
                
                // Try to get existing share link
                const shareLink = await shareLinkService.getByEntity('therapist', therapistId);
                if (shareLink) {
                    const shortUrl = `https://www.indastreetmassage.com/share/${shareLink.shortId}`;
                    setShortShareUrl(shortUrl);
                } else {
                    // Fallback to regular URL
                    const fullUrl = generateShareableURL(therapist);
                    setShortShareUrl(fullUrl);
                }
            } catch (error) {
                console.error('Error generating share URL:', error);
                // Fallback to regular URL
                const fullUrl = generateShareableURL(therapist);
                setShortShareUrl(fullUrl);
            }
        };

        generateShareUrl();
    }, [therapist]);

    // 🌍 DISTANCE CALCULATION for display
    const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) => {
        const R = 6371000; // Earth's radius in meters
        const φ1 = point1.lat * Math.PI/180;
        const φ2 = point2.lat * Math.PI/180;
        const Δφ = (point2.lat-point1.lat) * Math.PI/180;
        const Δλ = (point2.lng-point1.lng) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // Distance in meters
    };
    
    const therapistDistance = React.useMemo(() => {
        if (!userLocation) return null;
        
        let therapistCoords = null;
        try {
            if ((therapist as any).geopoint && (therapist as any).geopoint.lat && (therapist as any).geopoint.lng) {
                therapistCoords = (therapist as any).geopoint;
            } else if (therapist.coordinates) {
                if (Array.isArray(therapist.coordinates)) {
                    therapistCoords = ({ lat: therapist.coordinates[1], lng: therapist.coordinates[0] } as any);
                } else if (typeof therapist.coordinates === 'string') {
                    const parsed = JSON.parse(therapist.coordinates);
                    if (Array.isArray(parsed)) {
                        therapistCoords = ({ lat: parsed[1], lng: parsed[0] } as any);
                    } else if (parsed.lat && parsed.lng) {
                        therapistCoords = parsed;
                    }
                } else if ((therapist.coordinates as any)?.lat && (therapist.coordinates as any)?.lng) {
                    therapistCoords = therapist.coordinates;
                }
            }
        } catch (e) {
            console.warn('Failed to parse therapist coordinates:', e);
        }
        
        if (!therapistCoords) return null;
        
        const distanceMeters = calculateDistance(userLocation, therapistCoords);
        const distanceKm = distanceMeters / 1000;
        
        if (distanceKm < 1) {
            return `${Math.round(distanceMeters)}m away`;
        } else {
            return `${distanceKm.toFixed(1)}km away`;
        }
    }, [userLocation, (therapist as any).geopoint, therapist.coordinates]);

    // Get the location area from GPS-computed _locationArea (consistent with filtering)
    const therapistLocationArea = (therapist as any)._locationArea;
    
    // Get display name for the therapist's actual location area with service areas
    const getLocationAreaDisplayName = () => {
        // Check if this is a custom location
        if (therapist.isCustomLocation && therapist.customCity) {
            const customDisplay = therapist.customCity;
            if (therapist.customArea) {
                return `📍 ${customDisplay} - ${therapist.customArea}`;
            }
            return `📍 ${customDisplay}`;
        }
        
        // PRIORITY FIX: If a specific city is selected, always show that city
        // This ensures when user selects "Kuta", all cards show "Kuta" as the service area
        if (selectedCity && selectedCity !== 'all') {
            const allCities = INDONESIAN_CITIES_CATEGORIZED.flatMap(cat => cat.cities);
            const selectedCityData = allCities.find(city => city.locationId === selectedCity);
            
            if (selectedCityData) {
                // Add service areas if available
                if (therapist.serviceAreas) {
                    try {
                        const areas = JSON.parse(therapist.serviceAreas);
                        if (Array.isArray(areas) && areas.length > 0) {
                            // Get readable area names (remove city prefix like "jakarta-")
                            const areaNames = areas.map((area: string) => {
                                const parts = area.split('-');
                                return parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
                            }).filter(Boolean);
                            
                            if (areaNames.length > 0) {
                                return `${selectedCityData.name} - ${areaNames.join(', ')}`;
                            }
                        }
                    } catch (e) {
                        // If parsing fails, just show city name
                    }
                }
                
                return selectedCityData.name;
            }
        }
        
        let cityName = '';
        
        if (!therapistLocationArea) {
            // Fallback to database location field if no GPS-computed area
            cityName = (therapist.location || 'Bali').split(',')[0].trim();
        } else {
            const allCities = INDONESIAN_CITIES_CATEGORIZED.flatMap(cat => cat.cities);
            const cityData = allCities.find(city => city.locationId === therapistLocationArea);
            cityName = cityData?.name || therapistLocationArea;
        }
        
        // Add service areas if available
        if (therapist.serviceAreas) {
            try {
                const areas = JSON.parse(therapist.serviceAreas);
                if (Array.isArray(areas) && areas.length > 0) {
                    // Get readable area names (remove city prefix like "jakarta-")
                    const areaNames = areas.map((area: string) => {
                        const parts = area.split('-');
                        return parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
                    }).filter(Boolean);
                    
                    if (areaNames.length > 0) {
                        return `${cityName} - ${areaNames.join(', ')}`;
                    }
                }
            } catch (e) {
                // If parsing fails, just show city name
            }
        }
        
        return cityName;
    };
    
    const locationAreaDisplayName = getLocationAreaDisplayName();

    // Determine if we should show "Serves [Area] area" instead of distance
    const getLocationDisplay = () => {
        // If no specific city selected (showing "All Indonesia"), show distance if available
        if (!selectedCity || selectedCity === 'all') {
            return therapistDistance;
        }

        // If same city/area is selected, show "Serves [Area] area"
        if (therapistLocationArea === selectedCity) {
            return `Serves ${locationAreaDisplayName} area`;
        }

        // Different city/area selected, show distance if available
        return therapistDistance;
    };

    const locationDisplay = getLocationDisplay();

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
            return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Available', isAvailable: true };
        } else if (statusStr === 'Busy') {
            return { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Busy', isAvailable: false };
        }
        return { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', label: 'Offline', isAvailable: false };
    };

    const statusStyle = getStatusStyles();

    // Generate consistent booking count for therapists (23-40)
    const getInitialBookingCount = (therapistId: string): number => {
        let hash = 0;
        for (let i = 0; i < therapistId.length; i++) {
            hash = ((hash << 5) - hash) + therapistId.charCodeAt(i);
            hash = hash & hash;
        }
        return 23 + (Math.abs(hash) % 18);
    };

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

    const displayBookingsCount = bookingsCount === 0 ? getInitialBookingCount(String(therapist.id || therapist.$id || '')) : bookingsCount;

    // 🧱 MOBILE STABILITY CHECK - This should log identical values on every refresh
    if (process.env.NODE_ENV === 'development') {
        console.log('📱 TherapistHomeCard render:', {
            id: therapist.$id || therapist.id,
            name: therapist.name,
            status: statusStyle.label,
            bookings: displayBookingsCount,
            timestamp: new Date().toISOString()
        });
    }

    return (
        <div className="relative">
            {/* External meta bar (Joined Date / Free / Orders) */}
            <div className="flex justify-between items-center mb-2 px-2">
                <span className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {joinedDisplay}
                </span>
                {!readOnly && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowJoinPopup(true);
                        }}
                        className="text-[11px] text-green-600 font-semibold flex items-center gap-1 hover:text-green-700 hover:underline transition-colors cursor-pointer"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Therapist Join Free
                    </button>
                )}
                {readOnly && (
                    <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Read Only
                    </span>
                )}
            </div>
            
            <div 
                onClick={readOnly ? undefined : () => {
                    onClick(therapist);
                    onIncrementAnalytics('views');
                }}
                className={`bg-white rounded-2xl overflow-visible border border-gray-200 transition-all duration-300 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:shadow-xl'} group ${readOnly ? 'opacity-90' : ''} relative`}
            >
            {/* Image Container - Fixed height for mobile stability */}
            <div className="relative h-56 overflow-visible bg-transparent rounded-t-2xl" style={{ minHeight: '224px' }}>
                <img
                    src={(therapist as any).mainImage || (therapist as any).profilePicture || '/default-avatar.jpg'}
                    alt={therapist.name}
                    className="w-full h-full object-cover transition-transform duration-500 rounded-t-2xl"
                    style={{ aspectRatio: '400/224', minHeight: '224px' }}
                    loading="lazy"
                    width="400"
                    height="224"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.jpg';
                    }}
                />

                {/* Star Rating Badge - Top Left */}
                <div className="absolute top-3 left-3 shadow-lg flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <StarIcon className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-bold text-white">{displayRating}</span>
                </div>

                {/* Orders Badge - Top Right */}
                {displayBookingsCount > 0 && (
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                        {displayBookingsCount}+ Orders
                    </div>
                )}

                {/* Discount Badge - Bottom Center */}
                {isDiscountActive(therapist) && (
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 backdrop-blur-sm animate-pulse">
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                            🔥 Discount Active
                        </span>
                    </div>
                )}

                {/* Share Button - Bottom Right with stable positioning */}
                {!readOnly && (
                    <button
                        onClick={handleShareClick}
                        className="absolute bottom-3 right-3 w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-30"
                        title="Share this therapist"
                        aria-label="Share this therapist"
                        style={{ position: 'absolute', bottom: '12px', right: '12px' }}
                    >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </button>
                )}
            </div>

            {/* ========================================
             * 🔒 UI DESIGN LOCKED - DO NOT MODIFY
             * Facebook Lock: This layout is finalized
             * Contact admin before making any changes
             * ======================================== */}

            {/* Location info - Right side, positioned above profile section with stable height */}
            <div className="px-4 mt-3 mb-0 text-right relative z-10" style={{ minHeight: '48px' }}>
                <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs font-medium text-gray-700">
                            {locationAreaDisplayName}
                        </span>
                    </div>
                    {/* Serves area - second line */}
                    <div className="text-xs text-orange-500 font-medium">
                        Serves {locationAreaDisplayName} area
                    </div>
                </div>
            </div>

            {/* ========================================
             * 🔒 UI DESIGN LOCKED - DO NOT MODIFY
             * Profile positioning and layout finalized
             * ======================================== */}
            {/* Profile Section - Overlapping main image by 30% */}
            <div className="px-4 -mt-[115px] pb-4 relative z-30 overflow-visible pointer-events-none">
                <div className="flex items-start gap-3">
                    {/* Profile Picture - 30% of card width */}
                    <div className="flex-shrink-0 relative z-30">
                        <div className="w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] md:w-[120px] md:h-[120px] rounded-full overflow-hidden relative">
                            <img 
                                className="w-full h-full object-cover pointer-events-auto border-4 border-white rounded-full" 
                                src={(therapist as any).profilePicture || (therapist as any).mainImage || '/default-avatar.jpg'}
                                alt={`${therapist.name} profile`}
                                style={{ aspectRatio: '1/1' }}
                                loading="lazy"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/default-avatar.jpg';
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================
             * 🔒 UI DESIGN LOCKED - DO NOT MODIFY
             * Name and status positioning finalized
             * 75px offset from left is intentional
             * ======================================== */}
            {/* Name and Status - Below main image, left aligned with 75px offset */}
            <div className="px-4 mt-[2px] mb-3 relative z-40">
                <div className="flex-shrink-0">
                    {/* Name left aligned with offset */}
                    <div className="mb-2 ml-[75px]">
                        <div className="flex items-center gap-2">
                            {/* Verified Badge */}
                            {((therapist as any).verifiedBadge || therapist.isVerified) && (
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/verified-removebg-preview.png?updatedAt=1768015154565"
                                    alt="Verified"
                                    className="w-5 h-5 flex-shrink-0"
                                    title="Verified Therapist"
                                />
                            )}
                            
                            {/* Hotel/Villa Safe Pass Badge */}
                            {(therapist as any).hotelVillaSafePassStatus === 'active' && (
                                <div 
                                    className="w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center flex-shrink-0"
                                    title="Hotel & Villa Safe Pass Certified"
                                >
                                    <span className="text-white text-xs font-bold">🏨</span>
                                </div>
                            )}
                            
                            {/* Preferred by Women Badge - Show if therapist accepts female clients */}
                            {(() => {
                                const clientPrefs = String((therapist as any).clientPreferences || (therapist as any).clientPreference || '').toLowerCase();
                                const therapistGender = String((therapist as any).therapistGender || '').toLowerCase();
                                const showBadge = clientPrefs.includes('female') || 
                                                 clientPrefs.includes('woman') || 
                                                 clientPrefs.includes('wanita') ||
                                                 therapistGender === 'female' ||
                                                 therapistGender === 'unisex';
                                
                                return showBadge && (
                                    <span 
                                        className="px-2 py-0.5 bg-pink-100 text-pink-700 text-[10px] font-semibold rounded-full flex items-center gap-1"
                                        title="Preferred by Women Clients"
                                    >
                                        <span>👩‍⚕️</span>
                                        <span>Women-Friendly</span>
                                    </span>
                                );
                            })()}
                            
                            <h3 className="text-lg font-bold text-gray-900">
                                {therapist.name}
                            </h3>
                        </div>
                    </div>

                    {/* Status Badge - Left aligned with offset */}
                    <div className="overflow-visible flex justify-start ml-[75px]">
                        <div className={`inline-flex items-center px-2.5 rounded-full font-medium whitespace-nowrap ${statusStyle.bg} ${statusStyle.text}`} style={{paddingTop: '0px', paddingBottom: '0px', lineHeight: '1', fontSize: '10px', transform: 'scaleY(0.9)'}}>
                            <span className="relative inline-flex mr-1.5" style={{width: '32px', height: '32px', minWidth: '32px', minHeight: '32px'}}>
                                <span key={`${therapist.$id || therapist.id}-dot`} className={`absolute rounded-full ${statusStyle.dot} ${statusStyle.isAvailable ? '' : 'animate-pulse'} z-10`} style={{width: '8px', height: '8px', left: '12px', top: '12px'}}></span>
                                {statusStyle.isAvailable && (
                                    <React.Fragment key={`${therapist.$id || therapist.id}-rings`}>
                                        <span key={`${therapist.$id || therapist.id}-ring1`} className="absolute rounded-full bg-green-400 opacity-75 animate-ping" style={{width: '20px', height: '20px', left: '6px', top: '6px'}}></span>
                                        <span key={`${therapist.$id || therapist.id}-ring2`} className="absolute rounded-full bg-green-300 opacity-50 animate-ping" style={{width: '28px', height: '28px', left: '2px', top: '2px', animationDuration: '1.5s'}}></span>
                                    </React.Fragment>
                                )}
                            </span>
                            <span className="text-xs">{statusStyle.label}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Client Preference - Menerima with Languages on same line (After profile section like profile card) */}
            <div className="mx-4 mb-7">
                <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-600 flex-shrink-0">
                        <span className="font-bold">Menerima:</span> {(therapist as any).clientPreference || 'Pria / Wanita'}
                    </p>
                    {(() => {
                        const languagesValue = (therapist as any).languages;
                        const languages = languagesValue 
                            ? (typeof languagesValue === 'string' 
                                ? (languagesValue as string).split(',').map((l: string) => l.trim()) 
                                : languagesValue)
                            : [];
                        
                        // Languages parsed successfully
                        
                        if (!languages || !Array.isArray(languages) || languages.length === 0) {
                            // Fallback: show Indonesian and English flags if no languages specified
                            return (
                                <div className="flex items-center gap-1.5">
                                    <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1">
                                        <span 
                                            className="text-sm" 
                                            style={{
                                                fontFamily: '"Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", sans-serif',
                                                fontSize: '14px',
                                                lineHeight: '1'
                                            }}
                                        >
                                            🇮🇩
                                        </span>
                                        <span className="text-xs font-semibold">ID</span>
                                    </span>
                                    <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1">
                                        <span 
                                            className="text-sm" 
                                            style={{
                                                fontFamily: '"Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", sans-serif',
                                                fontSize: '14px',
                                                lineHeight: '1'
                                            }}
                                        >
                                            🇬🇧
                                        </span>
                                        <span className="text-xs font-semibold">EN</span>
                                    </span>
                                </div>
                            );
                        }
                        
                        // Language mapping with flags - using CSS flag icons for better mobile compatibility
                        const langMap: Record<string, {flag: string, name: string, flagClass?: string}> = {
                            'english': {flag: '🇬🇧', name: 'EN', flagClass: 'fi fi-gb'},
                            'indonesian': {flag: '🇮🇩', name: 'ID', flagClass: 'fi fi-id'},
                            'mandarin': {flag: '🇨🇳', name: 'ZH', flagClass: 'fi fi-cn'},
                            'japanese': {flag: '🇯🇵', name: 'JP', flagClass: 'fi fi-jp'},
                            'korean': {flag: '🇰🇷', name: 'KR', flagClass: 'fi fi-kr'},
                            'thai': {flag: '🇹🇭', name: 'TH', flagClass: 'fi fi-th'},
                            'vietnamese': {flag: '🇻🇳', name: 'VI', flagClass: 'fi fi-vn'},
                            'french': {flag: '🇫🇷', name: 'FR', flagClass: 'fi fi-fr'},
                            'german': {flag: '🇩🇪', name: 'DE', flagClass: 'fi fi-de'},
                            'spanish': {flag: '🇪🇸', name: 'ES', flagClass: 'fi fi-es'},
                            'portuguese': {flag: '🇵🇹', name: 'PT', flagClass: 'fi fi-pt'},
                            'italian': {flag: '🇮🇹', name: 'IT', flagClass: 'fi fi-it'},
                            'russian': {flag: '🇷🇺', name: 'RU', flagClass: 'fi fi-ru'},
                            'arabic': {flag: '🇸🇦', name: 'AR', flagClass: 'fi fi-sa'},
                            'hindi': {flag: '🇮🇳', name: 'HI', flagClass: 'fi fi-in'},
                            // Language codes for backward compatibility
                            'en': {flag: '🇬🇧', name: 'EN', flagClass: 'fi fi-gb'},
                            'id': {flag: '🇮🇩', name: 'ID', flagClass: 'fi fi-id'},
                            'zh': {flag: '🇨🇳', name: 'ZH', flagClass: 'fi fi-cn'},
                            'ja': {flag: '🇯🇵', name: 'JP', flagClass: 'fi fi-jp'},
                            'ko': {flag: '🇰🇷', name: 'KR', flagClass: 'fi fi-kr'},
                            'th': {flag: '🇹🇭', name: 'TH', flagClass: 'fi fi-th'},
                            'vi': {flag: '🇻🇳', name: 'VI', flagClass: 'fi fi-vn'},
                            'fr': {flag: '🇫🇷', name: 'FR', flagClass: 'fi fi-fr'},
                            'de': {flag: '🇩🇪', name: 'DE', flagClass: 'fi fi-de'},
                            'es': {flag: '🇪🇸', name: 'ES', flagClass: 'fi fi-es'},
                            'pt': {flag: '🇵🇹', name: 'PT', flagClass: 'fi fi-pt'},
                            'it': {flag: '🇮🇹', name: 'IT', flagClass: 'fi fi-it'},
                            'ru': {flag: '🇷🇺', name: 'RU', flagClass: 'fi fi-ru'},
                            'ar': {flag: '🇸🇦', name: 'AR', flagClass: 'fi fi-sa'},
                            'hi': {flag: '🇮🇳', name: 'HI', flagClass: 'fi fi-in'}
                        };
                        
                        return (
                            <div className="flex items-center gap-1">
                                {languages.slice(0, 2).map((lang, index, array) => {
                                    const langKey = lang.toLowerCase();
                                    // Default to Indonesian flag if language not recognized
                                    const langInfo = langMap[langKey] || {flag: '🇮🇩', name: 'ID'};
                                    
                                    // Skip duplicate language codes
                                    const isDuplicate = array.slice(0, index).some(prevLang => {
                                        const prevKey = prevLang.toLowerCase();
                                        const prevInfo = langMap[prevKey] || {flag: '🇮🇩', name: 'ID'};
                                        return prevInfo.name === langInfo.name;
                                    });
                                    
                                    if (isDuplicate) return null;
                                    
                                    return (
                                        <span key={lang} className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1">
                                            {/* Use emoji flag with proper font family to ensure display */}
                                            <span 
                                                className="text-sm" 
                                                style={{
                                                    fontFamily: '"Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", sans-serif',
                                                    fontSize: '14px',
                                                    lineHeight: '1'
                                                }}
                                            >
                                                {langInfo.flag}
                                            </span>
                                            <span className="text-xs font-semibold">{langInfo.name}</span>
                                        </span>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Description (After Menerima like profile card) */}
            {therapist.description && (
                <div className="mx-4 mb-3">
                    <p className="text-sm text-gray-700 leading-5 break-words whitespace-normal line-clamp-2 text-left">
                        {therapist.description}
                    </p>
                </div>
            )}

            {/* Content */}
            <div className="px-4 pb-4">
                {/* Pricing */}
                <div className="grid grid-cols-3 gap-2 mb-7">
                    {pricing["60"] > 0 && (
                        <div className="text-center p-2 bg-gray-200 rounded-lg min-w-0">
                            <div className="text-xs text-gray-600 mb-1">60 min</div>
                            <div className="text-sm font-bold text-gray-900 break-words">Rp {formatPrice(pricing["60"])}</div>
                        </div>
                    )}
                    {pricing["90"] > 0 && (
                        <div className="text-center p-2 bg-gray-200 rounded-lg min-w-0">
                            <div className="text-xs text-gray-600 mb-1">90 min</div>
                            <div className="text-sm font-bold text-gray-900 break-words">Rp {formatPrice(pricing["90"])}</div>
                        </div>
                    )}
                    {pricing["120"] > 0 && (
                        <div className="text-center p-2 bg-gray-200 rounded-lg min-w-0">
                            <div className="text-xs text-gray-600 mb-1">120 min</div>
                            <div className="text-sm font-bold text-gray-900 break-words">Rp {formatPrice(pricing["120"])}</div>
                        </div>
                    )}
                </div>

                {/* View Profile Button */}
                <button 
                    onClick={() => onClick(therapist)}
                    disabled={readOnly}
                    className={`w-full py-2.5 font-semibold rounded-lg transition-all ${
                        readOnly 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                    }`}
                >
                    {readOnly ? (t?.home?.viewOnly || 'View Only') : (t?.home?.viewProfile || 'View Profile')}
                </button>
            </div>
            </div>

            {/* Social Share Popup */}
            {showSharePopup && (
                <SocialSharePopup
                    isOpen={showSharePopup}
                    onClose={() => setShowSharePopup(false)}
                    title={therapist.name}
                    description={`Professional massage therapist in Bali`}
                    url={shortShareUrl || generateShareableURL(therapist)}
                    type="therapist"
                />
            )}

            {/* Therapist Join Popup */}
            <TherapistJoinPopup
                isOpen={showJoinPopup}
                onClose={() => setShowJoinPopup(false)}
                onNavigate={onNavigate}
            />
        </div>
    );
};

export default TherapistHomeCard;

