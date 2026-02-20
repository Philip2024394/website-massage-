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

import React, { useState, useEffect, useCallback } from 'react';
import type { Therapist, Analytics } from '../types';
import { getDisplayRating, formatRating } from '../utils/ratingUtils';
import { useTherapistDisplayImage } from '../utils/therapistImageUtils';
import { bookingService } from '../lib/bookingService';
import { therapistMenusService } from '../lib/appwriteService';
import { isDiscountActive, getCheapestServiceByTotalPrice, getCombinedMenuForDisplay, getTherapistDisplayName } from '../utils/therapistCardHelpers';
import SocialSharePopup from './SocialSharePopup';
import { generateShareableURL } from '../utils/seoSlugGenerator';
import { shareLinkService } from '../lib/services/shareLinkService';
import TherapistJoinPopup from './TherapistJoinPopup';
import { INDONESIAN_CITIES_CATEGORIZED } from '../constants/indonesianCities';
import TherapistPriceListModal from '../modules/therapist/TherapistPriceListModal';
import { usePersistentChatIntegration } from '../hooks/usePersistentChatIntegration';
import { VERIFIED_BADGE_IMAGE_URL } from '../constants/appConstants';
import { Share2 } from 'lucide-react';
import { logger } from '../utils/logger';
import { getSamplePricing, hasActualPricing } from '../utils/samplePriceUtils';
import SafePassModal from './modals/SafePassModal';
import HomePageBookingSlider, { HomePageBookingType } from './HomePageBookingSlider';
import { therapistOffersService } from '../constants/serviceTypes';
import { SERVICE_TYPES } from '../constants/serviceTypes';
import { parseBeauticianTreatments } from '../constants/beauticianTreatments';
import type { BeauticianTreatment } from '../types';

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
    // 🚀 PERFORMANCE: Prefetched data to eliminate N+1 queries
    prefetchedMenu?: any; // Pre-loaded menu data from bulk fetch
    prefetchedShareLink?: any; // Pre-loaded share link from bulk fetch
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
    avatarOffsetPx = 0,
    // 🚀 PERFORMANCE: Prefetched data props
    prefetchedMenu,
    prefetchedShareLink
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
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [showSafePassModal, setShowSafePassModal] = useState(false);
    const [menuData, setMenuData] = useState<any[]>([]);
    const [selectedServiceIndex, setSelectedServiceIndex] = useState<number | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<'60' | '90' | '120' | null>(null);
    
    // Chat integration hook for menu harga bookings
    const { openBookingWithService } = usePersistentChatIntegration(therapist);

    // � LOCKED BEHAVIOR:
    // Menu slider may ONLY open from therapist profile page.
    // Home page and listing triggers are explicitly forbidden.
    // TherapistPriceListModal is rendered below but has NO triggers on home page.

    // Handle booking type selection from slider
    const handleBookingTypeSelect = useCallback((type: HomePageBookingType, selectedTherapist: Therapist) => {
        logger.debug('🏠 HomePageBookingSlider selection:', {
            type: type.id,
            therapist: selectedTherapist.name,
            requiresVerification: type.requiresVerification
        });

        if (type.id === 'book-now') {
            // Direct to therapist profile for immediate booking
            onClick(selectedTherapist);
        } else if (type.id === 'scheduled') {
            // For scheduled bookings, also go to therapist profile 
            // The profile page will handle verification requirements
            onClick(selectedTherapist);
        }
        
        // Track analytics
        onIncrementAnalytics(`${type.id}_bookings` as keyof Analytics);
    }, [onClick, onIncrementAnalytics]);

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

    // Handle service selection in price slider
    const handleSelectService = (index: number, duration: '60' | '90' | '120') => {
        logger.debug('💰 Service selected:', { index, duration });
        setSelectedServiceIndex(index);
        setSelectedDuration(duration);
    };
    
    // 🔒 MODAL STATE PROTECTION: Track if menu has been loaded to prevent re-renders from closing modal
    const [menuLoadedOnce, setMenuLoadedOnce] = useState(false);
    
    // Load menu data on component mount for service name display
    useEffect(() => {
        // 🛡️ CRITICAL: DO NOT tie menu data loading to modal open/close state
        // Menu data changes must NEVER affect modal visibility
        const loadMenu = async () => {
            // 🚀 PERFORMANCE: Use prefetched data if available
            if (prefetchedMenu !== undefined) {
                if (prefetchedMenu?.menuData) {
                    try {
                        const parsed = JSON.parse(prefetchedMenu.menuData);
                        setMenuData(Array.isArray(parsed) ? parsed : []);
                        setMenuLoadedOnce(true);
                        logger.debug('🚀 Using prefetched menu for', therapist.name, ':', parsed.length, 'items');
                    } catch (error) {
                        logger.warn('Failed to parse prefetched menu:', error);
                        setMenuData([]);
                        setMenuLoadedOnce(true);
                    }
                } else {
                    setMenuData([]);
                    setMenuLoadedOnce(true);
                }
                return; // Skip DB query
            }

            // Fallback: Fetch from DB if not prefetched
            try {
                const therapistId = String(therapist.$id || therapist.id);
                logger.debug('🏠 Loading menu data for TherapistHomeCard:', therapist.name, therapistId);
                
                try {
                    const menuDoc = await therapistMenusService.getByTherapistId(therapistId);
                    if (menuDoc?.menuData) {
                        const parsed = JSON.parse(menuDoc.menuData);
                        setMenuData(Array.isArray(parsed) ? parsed : []);
                        setMenuLoadedOnce(true);
                        logger.debug('🏠 Menu data loaded for', therapist.name, ':', parsed.length, 'items');
                    } else {
                        setMenuData([]);
                        setMenuLoadedOnce(true);
                    }
                } catch (error: any) {
                    logger.debug('🏠 Menu collection not available for', therapist.name, '- using default pricing');
                    setMenuData([]);
                    setMenuLoadedOnce(true);
                }
            } catch (outerError) {
                setMenuData([]);
                setMenuLoadedOnce(true);
            }
        };
        
        // 🛡️ PROTECTION: Only load menu once to prevent re-renders from affecting modal state
        if (!menuLoadedOnce) {
            loadMenu();
        }
    }, [therapist.$id, therapist.id, prefetchedMenu, menuLoadedOnce]);

    // Generate share URL
    useEffect(() => {
        const generateShareUrl = async () => {
            // 🚀 PERFORMANCE: Use prefetched share link if available
            if (prefetchedShareLink !== undefined) {
                if (prefetchedShareLink) {
                    const shortUrl = `https://www.indastreetmassage.com/share/${prefetchedShareLink.shortId}`;
                    setShortShareUrl(shortUrl);
                    logger.debug('🚀 Using prefetched share link for', therapist.name);
                } else {
                    // No share link exists - use fallback URL
                    const fullUrl = generateShareableURL(therapist);
                    setShortShareUrl(fullUrl);
                }
                return; // Skip DB query
            }

            // Fallback: Fetch from DB if not prefetched
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
                logger.error('Error generating share URL:', error);
                // Fallback to regular URL
                const fullUrl = generateShareableURL(therapist);
                setShortShareUrl(fullUrl);
            }
        };

        generateShareUrl();
    }, [therapist, prefetchedShareLink]);

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
        // Per-city view: no km distance – profiles listed only by GPS location city
        if (selectedCity && selectedCity !== 'all') return null;
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
            logger.warn('Failed to parse therapist coordinates:', e);
        }
        
        if (!therapistCoords) return null;
        
        const distanceMeters = calculateDistance(userLocation, therapistCoords);
        const distanceKm = distanceMeters / 1000;
        
        if (distanceKm < 1) {
            return `${Math.round(distanceMeters)}m away`;
        } else {
            return `${distanceKm.toFixed(1)}km away`;
        }
    }, [selectedCity, userLocation, (therapist as any).geopoint, therapist.coordinates]);

    // Get the location area from GPS-computed _locationArea (consistent with filtering)
    const therapistLocationArea = (therapist as any)._locationArea;
    
    // Get display name for the therapist's actual location area with service areas
    const getLocationAreaDisplayName = () => {
        logger.debug('🏠 TherapistHomeCard getLocationAreaDisplayName:', {
            therapistName: therapist.name,
            selectedCity,
            therapistLocation: therapist.location,
            therapistLocationArea
        });
        
        // Check if this is a custom location
        if (therapist.isCustomLocation && therapist.customCity) {
            const customDisplay = therapist.customCity;
            if (therapist.customArea) {
                return `${customDisplay} - ${therapist.customArea}`;
            }
            return `${customDisplay}`;
        }
        
        // PRIORITY FIX: If a specific city is selected, always show that city
        // This ensures when user selects "Kuta", all cards show "Kuta" as the service area
        if (selectedCity && selectedCity !== 'all') {
            const allCities = INDONESIAN_CITIES_CATEGORIZED.flatMap(cat => cat.cities);
            // Normalize selectedCity to lowercase for matching with locationId
            const normalizedSelectedCity = selectedCity.toLowerCase().trim();
            const selectedCityData = allCities.find(city => city.locationId === normalizedSelectedCity || city.name.toLowerCase() === normalizedSelectedCity);
            
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
            // Fallback: use city/locationId/location (never default to "Bali" — was causing Bali to show in Yogyakarta)
            const raw = (therapist as any).city || (therapist as any).locationId || therapist.location || '';
            cityName = (typeof raw === 'string' ? raw : '').split(',')[0].trim() || '—';
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

    // Combined menu: real saved items + Traditional from profile (if set) + sample fill to 5. Cheapest from this set for display.
    const combinedMenu = getCombinedMenuForDisplay(menuData, therapist);

    // Parse pricing - use combined menu (slider + traditional + sample) so cheapest is same as menu slider
    const getPricing = () => {
        if (combinedMenu.length > 0) {
            const cheapest = getCheapestServiceByTotalPrice(combinedMenu);
            if (cheapest) {
                const menuPricing = {
                    "60": Number(cheapest.price60) * 1000,
                    "90": Number(cheapest.price90) * 1000,
                    "120": Number(cheapest.price120) * 1000
                };
                if (menuPricing["60"] > 0 && menuPricing["90"] > 0 && menuPricing["120"] > 0) {
                    logger.debug('🏠 Using lowest (combined menu) pricing for', therapist.name, ':', menuPricing);
                    return menuPricing;
                }
            }
        }

        // Fallback to therapist doc when no combined items
        const hasAllThreePrices = (
            (therapist.price60 && parseInt(therapist.price60) > 0) &&
            (therapist.price90 && parseInt(therapist.price90) > 0) &&
            (therapist.price120 && parseInt(therapist.price120) > 0)
        );
        if (hasAllThreePrices) {
            return {
                "60": parseInt(therapist.price60!) * 1000,
                "90": parseInt(therapist.price90!) * 1000,
                "120": parseInt(therapist.price120!) * 1000
            };
        }
        if (!hasActualPricing(therapist)) {
            const therapistId = String((therapist as any).$id || therapist.id || '');
            if (therapistId) return getSamplePricing(therapistId);
        }
        return { "60": 0, "90": 0, "120": 0 };
    };

    const pricing = getPricing();

    // Service name = name of cheapest from combined menu (same as 3 containers)
    const getServiceName = (): string => {
        if (combinedMenu.length > 0) {
            const cheapest = getCheapestServiceByTotalPrice(combinedMenu);
            if (cheapest) {
                const name = cheapest.name || cheapest.serviceName || cheapest.title;
                if (name) {
                    logger.debug(`🏠 Service name for ${therapist.name}: "${name}"`);
                    return name;
                }
            }
        }
        return 'Traditional Massage';
    };

    const serviceName = getServiceName();

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

    const formatBeauticianPrice = (t: BeauticianTreatment): string => {
        const currency = t.currency ?? 'IDR';
        const p = t.fixed_price ?? 0;
        if (currency === 'IDR') return p >= 1000 ? `${(p / 1000).toFixed(0)}K` : String(p);
        return `€${p}`;
    };

    const beauticianTreatments = parseBeauticianTreatments((therapist as any).beauticianTreatments);
    const isBeauticianWithTreatments = therapistOffersService(therapist, SERVICE_TYPES.BEAUTICIAN) && beauticianTreatments.length > 0;
    const [selectedBeauticianIndex, setSelectedBeauticianIndex] = useState<number | null>(null);

    // Get status - display_status (per-location rotation) takes precedence; then availability/status
    const getStatusStyles = () => {
        const statusStr = String(
            (therapist as any).display_status
            || (therapist as any).availability
            || therapist.status
            || 'Busy'
        );
        if (statusStr === 'Available') {
            return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Available', isAvailable: true };
        }
        return { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Busy', isAvailable: false };
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

    const displayImage = useTherapistDisplayImage(therapist);

    // 🧱 MOBILE STABILITY CHECK - This should log identical values on every refresh
    if (process.env.NODE_ENV === 'development') {
        logger.debug('📱 TherapistHomeCard render:', {
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
                {/* Therapist Join Free button removed - only View Profile button should show on home cards */}
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
                    src={displayImage}
                    alt={getTherapistDisplayName(therapist.name)}
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

                {/* Share Button - bottom right corner, same style as facial main image badges */}
                <button
                    onClick={(e) => { e.stopPropagation(); handleShareClick(e); }}
                    className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-all z-10"
                    title="Share this therapist"
                    aria-label="Share this therapist"
                >
                    <Share2 className="w-4 h-4 text-white" strokeWidth={2.5} aria-hidden />
                </button>
            </div>

            {/* Location display - right aligned with pin icon */}
            <div className="px-4 mt-3 flex flex-col items-end">
                <div className="flex items-center gap-1 text-xs text-black font-medium">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {locationAreaDisplayName}
                </div>
                <div className="text-xs text-orange-500 mt-1 font-medium">
                    Serves {locationAreaDisplayName} area
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
                                src={(therapist as any).profilePicture || '/default-avatar.jpg'}
                                alt={`${getTherapistDisplayName(therapist.name)} profile`}
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
                            
                            <div className="flex items-center gap-2">
                                {/* Verified Badge - Show if therapist has both bank details and KTP */}
                                {(() => {
                                    const hasVerifiedBadge = (therapist as any).verifiedBadge || therapist.isVerified;
                                    const hasBankDetails = therapist.bankName && therapist.accountName && therapist.accountNumber;
                                    const hasKtpUploaded = therapist.ktpPhotoUrl;
                                    const shouldShowBadge = hasVerifiedBadge || (hasBankDetails && hasKtpUploaded);
                                    
                                    return shouldShowBadge && (
                                        <img 
                                            src={VERIFIED_BADGE_IMAGE_URL}
                                            alt="Verified"
                                            className="w-5 h-5 flex-shrink-0"
                                            title="Verified Therapist - Complete Profile"
                                        />
                                    );
                                })()}
                                
                                <h3 className="text-lg font-bold text-gray-900">
                                    {getTherapistDisplayName(therapist.name)}
                                </h3>
                            </div>
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
                    
                    {/* SafePass Button - Show for Active SafePass holders */}
                    {(therapist as any).hotelVillaSafePassStatus === 'active' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowSafePassModal(true);
                            }}
                            className="p-0 bg-transparent hover:opacity-80 transition-opacity duration-200"
                            title="View SafePass Certificate"
                        >
                            <img 
                                src="https://ik.imagekit.io/7grri5v7d/hotel%205.png?updatedAt=1770362023320" 
                                alt="SafePass"
                                className="w-14 h-14 object-contain"
                                loading="lazy"
                                decoding="async"
                            />
                        </button>
                    )}
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

            {/* Beautician: same design as profile – 3 stacked containers, selectable, orange glow when selected */}
            {isBeauticianWithTreatments ? (
                <div className="mx-4 mb-4">
                    <style>{`
                        @keyframes beautician-glow-card {
                          0%, 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.35); }
                          50% { box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.2), 0 0 12px 2px rgba(249, 115, 22, 0.15); }
                        }
                        .beautician-card-container-selected {
                          border-color: rgb(249 115 22);
                          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.25), 0 0 16px 4px rgba(249, 115, 22, 0.12);
                          animation: beautician-glow-card 2.5s ease-in-out infinite;
                        }
                    `}</style>
                    <div className="text-center mb-3">
                        <h3 className="text-gray-800 font-bold text-sm tracking-wide">Treatments</h3>
                        <p className="text-[10px] text-gray-500 mt-0.5">Select Container And Press Book Now</p>
                    </div>
                    <div className="space-y-2">
                        {beauticianTreatments.slice(0, 3).map((t, idx) => {
                            const isSelected = selectedBeauticianIndex === idx;
                            return (
                                <button
                                    type="button"
                                    key={therapist.$id || therapist.id || idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedBeauticianIndex((prev) => (prev === idx ? null : idx));
                                    }}
                                    className={`w-full text-left rounded-xl border-2 overflow-hidden flex flex-col sm:flex-row sm:items-center gap-2 p-3 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1 ${
                                        isSelected
                                            ? 'beautician-card-container-selected bg-orange-50/80 border-orange-400'
                                            : 'border-gray-200 bg-gray-100 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                    aria-pressed={isSelected}
                                    aria-label={`${t.treatment_name || `Treatment ${idx + 1}`}, ${t.estimated_duration_minutes} min, ${t.currency === 'IDR' ? 'IDR ' : ''}${formatBeauticianPrice(t)}. ${isSelected ? 'Selected' : 'Select'}`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-gray-900 mb-0.5 line-clamp-2">
                                            {t.treatment_name || `Treatment ${idx + 1}`}
                                        </h4>
                                        <p className="text-[10px] text-gray-600">
                                            Estimated time: {t.estimated_duration_minutes} minutes
                                        </p>
                                        <p className="text-xs font-semibold text-gray-800 mt-0.5">
                                            Price: {t.currency === 'IDR' ? 'IDR ' : ''}{formatBeauticianPrice(t)} (fixed)
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <span className="flex-shrink-0 text-orange-600 text-[10px] font-semibold uppercase tracking-wide">
                                            Selected
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : pricing["60"] > 0 && pricing["90"] > 0 && pricing["120"] > 0 ? (
                <div className="mx-4 mb-4">
                    <h3 className="text-gray-800 font-bold text-sm tracking-wide text-center mb-2">
                        {serviceName}
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 text-center">
                            <p className="text-gray-600 text-xs mb-1 font-medium">60 min</p>
                            <p className="font-bold text-slate-900 text-sm">
                                IDR {formatPrice(pricing["60"])}
                            </p>
                            <p className="text-[10px] text-slate-600 mt-1">Basic</p>
                        </div>
                        <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 text-center">
                            <p className="text-gray-600 text-xs mb-1 font-medium">90 min</p>
                            <p className="font-bold text-slate-900 text-sm">
                                IDR {formatPrice(pricing["90"])}
                            </p>
                            <p className="text-[10px] text-slate-600 mt-1">Premium</p>
                        </div>
                        <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 text-center">
                            <p className="text-gray-600 text-xs mb-1 font-medium">120 min</p>
                            <p className="font-bold text-slate-900 text-sm">
                                IDR {formatPrice(pricing["120"])}
                            </p>
                            <p className="text-[10px] text-slate-600 mt-1">Luxury</p>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* View Profile Button */}
            <div className="px-4 pb-4">
                {/* 🔒 LOCKED: NO price modal triggers allowed on home page cards */}
                <button 
                    onClick={() => onClick(therapist)}
                    disabled={readOnly}
                    className={`w-full py-3 font-semibold rounded-lg transition-all ${
                        readOnly 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg'
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
                    title={getTherapistDisplayName(therapist.name)}
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

            {/* 🔒 LOCKED BEHAVIOR: Price List Modal
                This modal component exists for technical reasons but has NO triggers on home page.
                Menu slider entry point = PROFILE PAGE ONLY.
                Home page cards, search results, and listings are FORBIDDEN from opening this modal. */}
            <TherapistPriceListModal
                showPriceListModal={showPriceModal}
                setShowPriceListModal={setShowPriceModal}
                therapist={therapist}
                displayRating={displayRating}
                arrivalCountdown="60"
                formatCountdown={(time: string) => time}
                menuData={menuData}
                selectedServiceIndex={selectedServiceIndex}
                selectedDuration={selectedDuration}
                handleSelectService={handleSelectService}
                setSelectedServiceIndex={setSelectedServiceIndex}
                setSelectedDuration={setSelectedDuration}
                openBookingWithService={openBookingWithService}
                chatLang={t?.locale || 'id'}
                showBookingButtons={false}
            />

            {/* SafePass Modal */}
            <SafePassModal
                isOpen={showSafePassModal}
                onClose={() => setShowSafePassModal(false)}
                therapist={therapist}
            />
        </div>
    );
};

export default TherapistHomeCard;

