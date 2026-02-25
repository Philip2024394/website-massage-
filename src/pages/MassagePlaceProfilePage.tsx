import React, { useState, useEffect, useContext, lazy, Suspense } from 'react';
import CityPlaceCard from '../components/CityPlaceCard';
import { AppDrawer } from '../components/AppDrawerClean';
import { Globe, LayoutGrid, Users, Star } from 'lucide-react';
import { customLinksService } from '../lib/appwrite/services/customLinks.service';
import { useChatProviderOptional } from '../hooks/useChatProvider';
import { ChatContext } from '../context/ChatProvider';
import UniversalHeader from '../components/shared/UniversalHeader';
import SocialMediaLinks from '../components/SocialMediaLinks';

const FloatingChatWindowLazy = lazy(() =>
    import('../chat').then((m) => ({ default: m.FloatingChatWindow }))
);
import AdditionalServiceCard, { type AdditionalService } from '../components/AdditionalServiceCard';
import { VERIFIED_BADGE_IMAGE_URL, ADDITIONAL_SERVICES_TIERS, type AdditionalServicesTierLimit } from '../constants/appConstants';
import { OTHER_SERVICES_DEFAULT_IMAGES } from '../constants/otherServicesOffered';
import VisitUsElite from '../components/VisitUsElite';
import ElitePremiumFeatures from '../components/ElitePremiumFeatures';
import EliteFloatingActions from '../components/EliteFloatingActions';
import EliteBookingSheet from '../components/EliteBookingSheet';
import GiftVoucherSlider from '../components/GiftVoucherSlider';

/** Profile image for Dewi Sari / Sari Dewi in Therapist Trending Now (massage city places profile). */
const DEWI_SARI_PROFILE_IMAGE = 'https://ik.imagekit.io/7grri5v7d/therapist.png';

/** Profile image for Putu Ayu in Therapist Trending Now (massage city places profile). */
const PUTU_AYU_PROFILE_IMAGE = 'https://ik.imagekit.io/7grri5v7d/therapists.png';

/** Profile image for Wayan Sinta in Therapist Trending Now (massage city places profile). */
const WAYAN_SINTA_PROFILE_IMAGE = 'https://ik.imagekit.io/7grri5v7d/therapistss.png';

/** Normalized name for "Dewi Sari" / "Sari Dewi" / "Sar Dewi" – any of these use the shared profile image. */
function isDewiSari(name: string): boolean {
  const n = (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return n === 'dewi sari' || n === 'sari dewi' || n === 'sar dewi';
}

/** Normalized name for "Putu Ayu" – uses the therapists.png profile image. */
function isPutuAyu(name: string): boolean {
  return (name || '').trim().toLowerCase().replace(/\s+/g, ' ') === 'putu ayu';
}

/** Normalized name for "Wayan Sinta" – uses the therapistss.png profile image. */
function isWayanSinta(name: string): boolean {
  return (name || '').trim().toLowerCase().replace(/\s+/g, ' ') === 'wayan sinta';
}

// Helper functions for location and taxi booking
const getUserLocation = () => ({ lat: 0, lng: 0 });
const createTaxiBookingLink = (destination: any) => '#';
const openTaxiApp = (url: string) => window.open(url, '_blank');

// Helper function to check if discount is active and not expired
const isDiscountActive = (place: Place): boolean => {
    const placeData = place as any;
    return (
        placeData.isDiscountActive && 
        placeData.discountPercentage && 
        placeData.discountPercentage > 0 &&
        placeData.discountEndTime && 
        new Date(placeData.discountEndTime) > new Date()
    );
};

interface Place {
    id?: string | number;
    $id?: string;
    name: string;
    description?: string;
    mainImage?: string;
    profilePicture?: string;
    location?: string;
    whatsappNumber?: string;
    email?: string;
    pricing?: any;
    operatingHours?: string;
    rating?: number;
    reviewCount?: number;
    massageTypes?: any;
    status?: string;
    isLive?: boolean;
    distance?: number;
    coordinates?: { lat: number; lng: number } | string;
    isVerified?: boolean;
    verifiedAt?: string;
    activeMembershipDate?: string;
    languages?: string[];
    galleryImages?: Array<{ imageUrl: string; caption: string }>;
    discountPercentage?: number;
    discountDuration?: number;
    isDiscountActive?: boolean;
    discountEndTime?: string;
}

interface MassagePlaceProfilePageProps {
    place: Place | null;
    onBack?: () => void;
    onBook?: () => void;
    /** When user selects another place (e.g. from "Nearby spas"), open that profile. */
    onSelectPlace?: (place: Place | Record<string, unknown>) => void;
    userLocation?: { lat: number; lng: number } | null;
    loggedInCustomer?: any; // Customer user object
    // Header controls
    onLanguageChange?: (lang: string) => void;
    language?: string;
    selectedCity?: string;
    onCityChange?: (city: string) => void;
    
    // Navigation callbacks for AppDrawer
    onMassageJobsClick?: () => void;
    onTherapistJobsClick?: () => void;

    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onNavigate?: (page: string) => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    therapists?: any[];
    places?: any[];
}

/**
 * Massage Place Profile Page
 * Displays detailed information about a massage place
 * Refactored using custom hook and modular components
 */
const MassagePlaceProfilePage: React.FC<MassagePlaceProfilePageProps> = ({ 
    place, 
    onBack, 
    onBook, 
    onSelectPlace,
    userLocation, 
    loggedInCustomer,
    onLanguageChange,
    language = 'id',
    selectedCity = 'all',
    onCityChange,
    onMassageJobsClick,
    onTherapistJobsClick: _onTherapistJobsClick,

    onVillaPortalClick,
    onTherapistPortalClick: _onTherapistPortalClick,
    onMassagePlacePortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onNavigate,
    onTermsClick,
    onPrivacyClick,
    therapists = [],
    places = []
}) => {
    console.log('🏨 MASSAGE PLACE PROFILE PAGE RENDERING:', {
        hasPlace: !!place,
        placeId: place?.id || place?.$id,
        placeName: place?.name,
        urlPath: typeof window !== 'undefined' ? window.location.pathname : ''
    });

    // All hooks must run before any early return (Rules of Hooks)
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'home' | 'places'>('places');
    const [cityState, setCityState] = useState<string>(selectedCity);
    const [, setCustomLinks] = useState<any[]>([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [calculatedDistance, setCalculatedDistance] = useState<number | undefined>(place?.distance);
    const [showBookingSheet, setShowBookingSheet] = useState(false);
    const [showGiftVoucherSlider, setShowGiftVoucherSlider] = useState(false);

    const { addNotification } = useChatProviderOptional();
    const hasChatContext = useContext(ChatContext) != null;

    useEffect(() => {
        customLinksService.getAll()
            .then(links => setCustomLinks(links))
            .catch(err => console.error('Failed to fetch custom links:', err));
    }, []);

    /* Lock body scroll when side drawer is open so it opens reliably on profile page */
    useEffect(() => {
        if (typeof document === 'undefined') return;
        if (isMenuOpen) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = prev; };
        }
    }, [isMenuOpen]);

    useEffect(() => {
        if (!userLocation || !place?.coordinates) return;
        let coords: { lat?: number; lng?: number } | null = null;
        try {
            coords = typeof place.coordinates === 'string'
                ? JSON.parse(place.coordinates)
                : place.coordinates;
        } catch {
            return;
        }
        if (!coords?.lat || !coords?.lng) return;
        const R = 6371;
        const dLat = (coords.lat - userLocation.lat) * Math.PI / 180;
        const dLon = (coords.lng - userLocation.lng) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(coords.lat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        setCalculatedDistance(R * c);
    }, [userLocation, place, place?.coordinates]);

    /** Build gift voucher treatments from place pricing + additional services for GiftVoucherSlider */
    const giftVoucherData = React.useMemo(() => {
        const p = place as any;
        const parsePricing = (pricingData: any) => {
            if (!pricingData) return { 60: 200000, 90: 300000, 120: 400000 };
            if (typeof pricingData === 'object' && pricingData !== null) return pricingData;
            try {
                const parsed = JSON.parse(pricingData);
                return {
                    60: (parsed['60'] && parsed['60'] < 1000 ? parsed['60'] * 1000 : parsed['60']) || 200000,
                    90: (parsed['90'] && parsed['90'] < 1000 ? parsed['90'] * 1000 : parsed['90']) || 300000,
                    120: (parsed['120'] && parsed['120'] < 1000 ? parsed['120'] * 1000 : parsed['120']) || 400000,
                };
            } catch {
                return { 60: 200000, 90: 300000, 120: 400000 };
            }
        };
        const pricing = parsePricing(p?.pricing);
        const treatments = [
            { id: '60', name: language === 'id' ? 'Pijat Relaksasi 60 menit' : '60 min Relaxation Massage', duration: 60, price: pricing[60] },
            { id: '90', name: language === 'id' ? 'Pijat Balinese 90 menit' : '90 min Balinese Massage', duration: 90, price: pricing[90] },
            { id: '120', name: language === 'id' ? 'Pijat Deep Tissue 120 menit' : '120 min Deep Tissue', duration: 120, price: pricing[120] },
        ];
        const raw = p?.additionalServices;
        const list = Array.isArray(raw) ? raw.filter((s: any) => s && (s.name || s.id)) : [];
        const additionalServices = list.map((s: any) => ({
            id: String(s.id ?? s.name ?? ''),
            name: s.name || 'Service',
            details: Array.isArray(s.details) ? s.details.map((d: any) => ({ label: d.label || d.name, price: d.price })) : [],
        }));
        return { treatments, additionalServices };
    }, [place, language]);

    const isPlaceVerified = () => {
        if (!place) return false;
        if (place.isVerified) return true;
        if (place.activeMembershipDate) {
            const membershipDate = new Date(place.activeMembershipDate);
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            if (membershipDate <= threeMonthsAgo) return true;
        }
        return false;
    };

    // Guard: Return early if place is null or undefined (after all hooks)
    if (!place) {
        console.log('❌ MASSAGE PLACE PROFILE: No place provided!');
        const goBack = () => { onBack?.(); onNavigate?.('home'); };
        return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Place not found</p>
                    <button 
                        onClick={goBack}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Handle anonymous review submission
    const handleAnonymousReviewSubmit = async (reviewData: any) => {
        try {
            console.log('Review submitted for massage place:', reviewData);
            // Review is handled by AnonymousReviewModal component
            setShowReviewModal(false);
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    // Handle Book Now - open chat window in immediate mode (same as therapist booking)
    const handleBookNowClick = () => {
        console.log('📱 Massage Place Profile Book Now clicked - opening chat window');
        
        // Parse pricing from place data - same structure as therapist pricing
        const parsePricing = (pricingData: any) => {
            if (!pricingData) return { "60": 200000, "90": 300000, "120": 400000 };
            if (typeof pricingData === 'object' && pricingData !== null) return pricingData;
            try {
                const parsed = JSON.parse(pricingData);
                // Convert to proper format if needed (assuming place pricing might be in different units)
                return {
                    "60": parsed["60"] && parsed["60"] < 1000 ? parsed["60"] * 1000 : parsed["60"] || 200000,
                    "90": parsed["90"] && parsed["90"] < 1000 ? parsed["90"] * 1000 : parsed["90"] || 300000,
                    "120": parsed["120"] && parsed["120"] < 1000 ? parsed["120"] * 1000 : parsed["120"] || 400000
                };
            } catch {
                return { "60": 200000, "90": 300000, "120": 400000 };
            }
        };
        
        const pricing = parsePricing(place.pricing);
        console.log('💰 Place pricing for chat:', pricing);
        
        // Calculate active discount for chat window
        const activeDiscountData = (() => {
            // Mock discount data for testing - same logic as HeroSection
            const hasDiscount = place && ((place.id === '1' || place.$id === '1') || (place.name && place.name.toLowerCase().includes('relax')));
            if (!hasDiscount) return null;
            
            // Match HomePage discount logic based on place ID/index
            let percentage = 20; // Default to 20% (first place)
            if (place.id === '2' || place.$id === '2') percentage = 15;
            else if (place.id === '3' || place.$id === '3') percentage = 10;
            else if (place.id === '4' || place.$id === '4') percentage = 5;
            
            return {
                percentage: percentage,
                expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000) // Expires in 3 hours
            };
        })();
        
        // Show notification instead of dispatching event
        addNotification(
            'info',
            'Instant Booking',
            `Please complete booking with ${place.name} to start chatting`,
            { duration: 4000 }
        );
    };
    
    // Handle Schedule booking - open chat window in scheduled mode (same as therapist booking)
    const handleBookingClick = () => {
        console.log('📅 Massage Place Profile Schedule clicked - opening chat in scheduled mode');
        
        // Parse pricing from place data - same structure as therapist pricing
        const parsePricing = (pricingData: any) => {
            if (!pricingData) return { "60": 200000, "90": 300000, "120": 400000 };
            if (typeof pricingData === 'object' && pricingData !== null) return pricingData;
            try {
                const parsed = JSON.parse(pricingData);
                // Convert to proper format if needed (assuming place pricing might be in different units)
                return {
                    "60": parsed["60"] && parsed["60"] < 1000 ? parsed["60"] * 1000 : parsed["60"] || 200000,
                    "90": parsed["90"] && parsed["90"] < 1000 ? parsed["90"] * 1000 : parsed["90"] || 300000,
                    "120": parsed["120"] && parsed["120"] < 1000 ? parsed["120"] * 1000 : parsed["120"] || 400000
                };
            } catch {
                return { "60": 200000, "90": 300000, "120": 400000 };
            }
        };
        
        const pricing = parsePricing(place.pricing);
        console.log('💰 Place pricing for scheduled chat:', pricing);
        
        // Calculate active discount for chat window
        const activeDiscountData = (() => {
            // Mock discount data for testing - same logic as HeroSection
            const hasDiscount = place && ((place.id === '1' || place.$id === '1') || (place.name && place.name.toLowerCase().includes('relax')));
            if (!hasDiscount) return null;
            
            // Match HomePage discount logic based on place ID/index
            let percentage = 20; // Default to 20% (first place)
            if (place.id === '2' || place.$id === '2') percentage = 15;
            else if (place.id === '3' || place.$id === '3') percentage = 10;
            else if (place.id === '4' || place.$id === '4') percentage = 5;
            
            return {
                percentage: percentage,
                expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000) // Expires in 3 hours
            };
        })();
        
        // Show notification instead of dispatching event
        addNotification(
            'info',
            'Scheduled Booking',
            `Please complete booking with ${place.name} to start chatting`,
            { duration: 4000 }
        );
    };

    // Handle Bike Taxi booking
    const handleBikeTaxi = async () => {
        try {
            // Get place coordinates
            let placeCoords = { lat: 0, lng: 0 };
            if (place.coordinates) {
                if (typeof place.coordinates === 'string') {
                    placeCoords = JSON.parse(place.coordinates);
                } else {
                    placeCoords = place.coordinates;
                }
            }

            if (!placeCoords.lat || !placeCoords.lng) {
                alert('Place location not available. Please contact the massage place.');
                return;
            }

            // Get user location
            const userLoc = await getUserLocation();
            
            // Create booking link via Appwrite
            const result = await createTaxiBookingLink({
                userLocation: userLoc,
                placeLocation: placeCoords,
                taxiType: 'bike',
                placeName: place.name,
                userId: loggedInCustomer?.$id || loggedInCustomer?.id
            });

            if ((result as any).success && (result as any).deepLink) {
                // Show estimated price
                if ((result as any).estimatedPrice) {
                    const confirmBooking = confirm(
                        `Estimated fare: IDR ${(result as any).estimatedPrice.toLocaleString()}\n` +
                        `Estimated time: ${(result as any).estimatedDuration} mins\n\n` +
                        `Open Gojek app to book bike ride?`
                    );
                    if (!confirmBooking) return;
                }
                
                // Open taxi app
                openTaxiApp((result as any).deepLink);
            } else {
                alert(`Error: ${(result as any).error || 'Unable to create booking link'}`);
            }
        } catch (error) {
            console.error('Bike taxi booking error:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Please enable location access'}`);
        }
    };

    // Handle Car Taxi booking
    const handleCarTaxi = async () => {
        try {
            // Get place coordinates
            let placeCoords = { lat: 0, lng: 0 };
            if (place.coordinates) {
                if (typeof place.coordinates === 'string') {
                    placeCoords = JSON.parse(place.coordinates);
                } else {
                    placeCoords = place.coordinates;
                }
            }

            if (!placeCoords.lat || !placeCoords.lng) {
                alert('Place location not available. Please contact the massage place.');
                return;
            }

            // Get user location
            const userLoc = await getUserLocation();
            
            // Create booking link via Appwrite
            const result = await createTaxiBookingLink({
                userLocation: userLoc,
                placeLocation: placeCoords,
                taxiType: 'car',
                placeName: place.name,
                userId: loggedInCustomer?.$id || loggedInCustomer?.id
            });

            if ((result as any).success && (result as any).deepLink) {
                // Show estimated price
                if ((result as any).estimatedPrice) {
                    const confirmBooking = confirm(
                        `Estimated fare: IDR ${(result as any).estimatedPrice.toLocaleString()}\n` +
                        `Estimated time: ${(result as any).estimatedDuration} mins\n\n` +
                        `Open Grab app to book car ride?`
                    );
                    if (!confirmBooking) return;
                }
                
                // Open taxi app
                openTaxiApp((result as any).deepLink);
            } else {
                alert(`Error: ${(result as any).error || 'Unable to create booking link'}`);
            }
        } catch (error) {
            console.error('Car taxi booking error:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Please enable location access'}`);
        }
    };

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 w-full max-w-full">
            {/* Global App Drawer – render at root so it opens reliably when burger is clicked */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onMassageJobsClick={onMassageJobsClick}
                onTherapistPortalClick={_onTherapistPortalClick || (() => {})}
                onVillaPortalClick={onVillaPortalClick || (() => {})}
                onMassagePlacePortalClick={onMassagePlacePortalClick || (() => {})}
                onAgentPortalClick={onAgentPortalClick || (() => {})}
                onCustomerPortalClick={onCustomerPortalClick}
                onAdminPortalClick={onAdminPortalClick || (() => {})}
                onNavigate={onNavigate}
                onTermsClick={onTermsClick}
                onPrivacyClick={onPrivacyClick}
                therapists={therapists}
                places={places}
                language={language as 'en' | 'id' | 'gb'}
            />

            {/* Universal Header */}
            <UniversalHeader
                language={language}
                onLanguageChange={onLanguageChange}
                onMenuClick={() => setIsMenuOpen(true)}
                onHomeClick={() => onNavigate?.('home')}
                showHomeButton={true}
            />

            {/* Content below fixed header: top padding = header height so hero/location are not hidden */}
            <div className="pt-[60px] sm:pt-[64px]">
            {/* Hero + main image: one image from place dashboard (mainImage). Same image used for hero and for the card below; editable in massage city place dashboard. */}
            <section className="w-full max-w-full overflow-visible bg-gray-200 rounded-t-2xl">
                <div className="relative w-full pt-2 bg-gray-200 rounded-t-2xl overflow-visible">
                    {/* Top amber line – same as home page massage city places card (CityPlaceCard): rounded-t-2xl to match container */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 opacity-90 pointer-events-none rounded-t-2xl" />
                    <div className="relative w-full aspect-[21/9] min-h-[160px] max-h-[280px] overflow-visible">
                    <img
                        src={(place as any).mainImage || (place as any).image || (place as any).profilePicture || 'https://ik.imagekit.io/7grri5v7d/ma%201.png'}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover z-0"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/7grri5v7d/ma%201.png';
                        }}
                    />
                    <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                    {/* Amber line over main image – same as massage city home card */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-amber-500 pointer-events-none z-[1]" />
                    {/* Urgency over main image – no badge, plain text: left and right */}
                    <div className="absolute top-4 left-0 right-0 flex justify-between items-start px-4 z-[2] pointer-events-none">
                        <p className="text-white text-sm font-medium" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.6)' }}>
                            {(place as any).viewingNow ?? 4} {language === 'id' ? 'orang melihat sekarang' : 'people viewing now'}
                        </p>
                        <p className="text-white text-sm font-medium text-right" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.6)' }}>
                            {language === 'id' ? `Terakhir dipesan ${(place as any).lastBookedMinutesAgo ?? 12} menit lalu` : `Last booked ${(place as any).lastBookedMinutesAgo ?? 12} min ago`}
                        </p>
                    </div>
                    {isPlaceVerified() && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[2] flex flex-col items-center gap-1.5">
                            <img
                                src={VERIFIED_BADGE_IMAGE_URL}
                                alt="Verified"
                                className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md"
                                title="Verified"
                            />
                            <span className="text-white text-xs sm:text-sm font-semibold drop-shadow-lg bg-black/30 px-2 py-0.5 rounded">Verified</span>
                        </div>
                    )}
                    {/* Name + address: above gradient so text stays sharp (z-[2]), no blur */}
                    <div className="absolute bottom-0 left-0 right-0 z-[2]">
                        {/* Subtle dark bar behind text so name/address stay readable and crisp */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        <div className="relative p-4 text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.5)' }}>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight antialiased">{place.name}</h1>
                            <p className="text-sm text-white/95 mt-0.5 flex items-center gap-1.5 antialiased">
                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span>{(place as any).location || (place as any).address || (place as any).city || 'Indonesia'}</span>
                            </p>
                        </div>
                    </div>
                    </div>
                </div>
            </section>

            {/* Main Content - same layout as massage city places home */}
            <main className="w-full max-w-full mx-auto px-4 py-6 pb-24 ">
                <div className="max-w-full">
                    <div className="mb-3 text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Welcome to {place.name}</h3>
                        <p className="text-sm text-gray-600 animate-in slide-in-from-right duration-500 delay-200">
                            Please Reach Out For Services Not Listed
                        </p>
                    </div>
                    <div className="space-y-4">
                        <CityPlaceCard
                            place={{
                                ...place,
                                distance: calculatedDistance ?? 0,
                                isVerified: isPlaceVerified()
                            }}
                            category="massage"
                            onClick={() => {}}
                            onIncrementAnalytics={() => {}}
                            userLocation={userLocation ?? undefined}
                            variant="profile"
                            userCountryCode={language === 'id' ? 'ID' : undefined}
                        />

                        {/* Services & Therapist Trending Now – therapists carousel first, then additional services dropdowns */}
                        {(() => {
                            const raw = (place as any).additionalServices;
                            const tierLimit = ((): AdditionalServicesTierLimit => {
                                const v = (place as any).additionalServicesLimit;
                                if (v === 10 || v === 15) return v;
                                return ADDITIONAL_SERVICES_TIERS.DEFAULT_LIMIT;
                            })();
                            let list: AdditionalService[] = Array.isArray(raw)
                                ? raw.filter((s: any) => s && (s.name || s.id))
                                : [];
                            list = list.map((s: any) => ({
                                id: String(s.id ?? s.name ?? ''),
                                name: s.name || 'Service',
                                description: s.description || '',
                                imageUrl: s.imageUrl,
                                details: Array.isArray(s.details)
                                    ? s.details.map((d: any) => ({
                                        label: d.label || d.name || 'Option',
                                        price: d.price || 'Contact for price',
                                        duration: d.duration,
                                    }))
                                    : [],
                                bookLabel: s.bookLabel === 'Schedule' ? 'Schedule' as const : 'Book' as const,
                            }));
                            if (list.length === 0) {
                                const mockImage = 'https://ik.imagekit.io/7grri5v7d/facial%202.png?updatedAt=1766551253328';
                                list = [
                                    { id: 'mock-hair', name: 'Hair Salon', description: 'Professional haircut, styling and treatments at our in-house salon. Our stylists are trained in the latest trends and use quality products.', imageUrl: OTHER_SERVICES_DEFAULT_IMAGES.hair_salon, details: [{ label: 'Haircut & styling', price: 'IDR 150K', duration: '45 min' }], bookLabel: 'Book' as const },
                                    { id: 'mock-eyelashes', name: 'Eye Lashes', description: 'Eyelash extensions, lifts and tints. Classic, volume and hybrid styles available. Professional application for a natural or dramatic look.', imageUrl: mockImage, details: [{ label: 'Lash extensions', price: 'IDR 200K', duration: '60 min' }], bookLabel: 'Book' as const },
                                    { id: 'mock-nailart', name: 'Nail Art', description: 'Creative nail art, gel manicure, pedicure and nail care. Custom designs and long-lasting finishes.', imageUrl: mockImage, details: [{ label: 'Gel manicure & nail art', price: 'IDR 180K', duration: '45 min' }], bookLabel: 'Book' as const },
                                ];
                            }
                            const displayList = list.slice(0, tierLimit);
                            const therapists = (place as any).therapists;
                            const hasTherapists = Array.isArray(therapists) && therapists.length > 0;
                            // Default featured therapist when place has none (so shared URL always shows "Services & Therapist Trending Now" with Dewi Sari)
                            const defaultTherapists = [
                                { id: 'dewi-sari', name: 'Dewi Sari', photo: DEWI_SARI_PROFILE_IMAGE, specialty: 'Traditional & Wellness', yearsExperience: 6, rating: 4.9 },
                            ];
                            const displayTherapists = hasTherapists ? therapists.slice(0, 3) : defaultTherapists;
                            const hasAnyServices = displayList.length > 0;
                            if (displayTherapists.length === 0 && !hasAnyServices) return null;
                            const isId = language === 'id';
                            const isBeautyPlace = (place as any)?.category === 'beauty';
                            const sectionTitle = isBeautyPlace
                                ? (isId ? "Layanan & Beautician's Tren Saat Ini" : "Services & Beautician's Trending Now")
                                : (isId ? 'Layanan & Terapis Tren Saat Ini' : 'Services & Therapist Trending Now');
                            const sectionSubtitle = isBeautyPlace
                                ? (isId ? 'Kenali beautician dan layanan mereka' : 'Meet Beauticians and explore their services')
                                : (isId ? 'Kenali terapis kami dan layanan tambahan' : 'Meet our therapists and explore add-on services');
                            return (
                                <div className="mt-6">
                                    <div className="text-center mb-4">
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <LayoutGrid className="w-3.5 h-3.5 text-orange-500" aria-hidden />
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {sectionTitle}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {sectionSubtitle}
                                        </p>
                                    </div>

                                    {/* Featured Therapists carousel – first */}
                                    {(hasTherapists || displayTherapists.length > 0) && (
                                        <div className="mb-6">
                                            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
                                                {displayTherapists.map((t: { id: string; name: string; photo: string; specialty: string; yearsExperience: number; rating?: number }) => {
                                                    const displayPhoto = isDewiSari(t.name)
                                                        ? DEWI_SARI_PROFILE_IMAGE
                                                        : isPutuAyu(t.name)
                                                            ? PUTU_AYU_PROFILE_IMAGE
                                                            : isWayanSinta(t.name)
                                                                ? WAYAN_SINTA_PROFILE_IMAGE
                                                                : (t.photo || '');
                                                    return (
                                                    <div
                                                        key={t.id}
                                                        className="flex-shrink-0 w-32 snap-start rounded-xl border-2 bg-orange-50/60 border-orange-300 p-4 text-center"
                                                    >
                                                        <div className="w-16 h-16 mx-auto rounded-full bg-white border-2 border-amber-200 overflow-hidden mb-2">
                                                            <img
                                                                src={displayPhoto}
                                                                alt={t.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/7grri5v7d/default-avatar.png'; }}
                                                            />
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-900 truncate">{t.name}</p>
                                                        <p className="text-[10px] text-gray-600 truncate leading-tight">{t.specialty}</p>
                                                        <div className="flex items-center justify-center gap-1 mt-2">
                                                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                            <span className="text-xs font-semibold text-gray-800">{t.rating ?? '—'}</span>
                                                            <span className="text-[10px] text-gray-500">• {t.yearsExperience}y</span>
                                                        </div>
                                                    </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Additional services – dropdown containers below */}
                                    {hasAnyServices && (
                                        <div className="space-y-3">
                                            {displayList.map((svc) => (
                                                <AdditionalServiceCard
                                                    key={svc.id}
                                                    service={svc}
                                                    placeName={place.name || 'Massage Place'}
                                                    placeWhatsApp={(place as any).whatsappNumber ?? (place as any).whatsappnumber}
                                                    userCountryCode={language === 'id' ? 'ID' : undefined}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* ELITE "Visit Us" – only for membershipPlan === 'elite' */}
                        <VisitUsElite place={place} language={language} userLocation={userLocation} />

                        {/* ELITE Premium Features – all premium sections */}
                        <ElitePremiumFeatures
                            place={place}
                            language={language}
                            onGiftCardClick={() => setShowGiftVoucherSlider(true)}
                        />

                        {/* Nearby spas / More like this – discovery row */}
                        {Array.isArray(places) && places.length > 1 && onSelectPlace && (
                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <LayoutGrid className="w-5 h-5 text-amber-500" aria-hidden />
                                    {language === 'id' ? 'Spa serupa & terdekat' : 'Nearby & similar spas'}
                                </h3>
                                <p className="text-sm text-gray-500 mb-3">
                                    {language === 'id' ? 'Jelajahi tempat pijat lain' : 'Explore more massage places'}
                                </p>
                                <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 snap-x snap-mandatory">
                                    {places
                                        .filter((p: any) => (p.$id || p.id) !== (place.$id || place.id))
                                        .slice(0, 8)
                                        .map((p: any) => (
                                            <button
                                                key={p.$id || p.id}
                                                type="button"
                                                onClick={() => onSelectPlace(p)}
                                                className="flex-shrink-0 w-40 snap-start rounded-xl border-2 border-gray-100 bg-white overflow-hidden text-left hover:border-amber-300 hover:shadow-md transition-all"
                                            >
                                                <div className="aspect-[4/3] bg-gray-100">
                                                    <img
                                                        src={p.mainImage || p.profilePicture || p.image || 'https://ik.imagekit.io/7grri5v7d/ma%201.png'}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="p-2">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                                                    {p.location && (
                                                        <p className="text-xs text-gray-500 truncate">{p.location}</p>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* ELITE Floating Actions – WhatsApp & Save to Favorites */}
            {(place as any).membershipPlan === 'elite' || (place as any).plan === 'elite' ? (
            <EliteFloatingActions
                    placeId={String(place.$id || place.id)}
                    placeName={place.name}
                    whatsappNumber={(place as any).whatsappNumber || (place as any).whatsappnumber}
                    language={language}
                    placeImageUrl={place.mainImage || (place as any).profilePicture || (place as any).image}
                    description={place.description}
                    location={place.location}
                    starRating={place.rating}
                    reviewCount={place.reviewCount}
                    bookedThisMonth={(place as any).bookedThisMonth}
                />
            ) : null}

            {/* ELITE Booking Sheet */}
            <EliteBookingSheet
                isOpen={showBookingSheet}
                onClose={() => setShowBookingSheet(false)}
                placeName={place.name}
                placeId={String(place.$id || place.id)}
                whatsappNumber={(place as any).whatsappNumber || (place as any).whatsappnumber}
                language={language}
            />

            {/* Super Elite Gift Voucher Slider */}
            <GiftVoucherSlider
                isOpen={showGiftVoucherSlider}
                onClose={() => setShowGiftVoucherSlider(false)}
                placeName={place.name}
                placeId={String(place.$id || place.id)}
                whatsappNumber={(place as any).whatsappNumber || (place as any).whatsappnumber}
                treatments={giftVoucherData.treatments}
                additionalServices={giftVoucherData.additionalServices}
                language={language}
            />

            {/* Footer: social text then icons */}
            <footer className="w-full mt-8 py-6 px-4 border-t border-gray-200 bg-gray-50/80">
                <div className="max-w-full flex flex-col items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onNavigate?.('indonesia')}
                        className="inline-flex flex-col items-center gap-1.5 text-gray-700 hover:text-orange-600 transition-colors"
                    >
                        <Globe className="w-6 h-6 text-orange-500" aria-hidden />
                        <span className="text-sm text-gray-700">Social – Connecting wellness communities across the globe – Indastreet Social</span>
                    </button>
                    <SocialMediaLinks className="mt-2" />
                </div>
            </footer>
            </div>
            {hasChatContext && (
                <Suspense fallback={null}>
                    <FloatingChatWindowLazy userId="guest" userName="Guest User" userRole="customer" />
                </Suspense>
            )}
        </div>
    );
};

export default MassagePlaceProfilePage;








