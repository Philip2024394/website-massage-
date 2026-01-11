import React, { useState, useEffect } from 'react';
import type { Place, Analytics } from '../types';
import { parsePricing, parseCoordinates, parseMassageTypes, parseLanguages } from '../utils/appwriteHelpers';
import { getDisplayRating, getDisplayReviewCount, formatRating } from '../utils/ratingUtils';
import { bookingService, reviewService } from '../lib/appwriteService';
// import { placesMenusService } from '../lib/appwrite/services/placesMenus.service'; // TODO: Service doesn't exist yet
import DistanceDisplay from './DistanceDisplay';
import AnonymousReviewModal from './AnonymousReviewModal';
import SocialSharePopup from './SocialSharePopup';
import MassagePlaceJoinPopup from './MassagePlaceJoinPopup';
import { getAuthAppUrl } from '../utils/therapistCardHelpers';
import { StarIcon, discountStyles, isDiscountActive, getDynamicSpacing, generatePlaceShareableURL } from '../constants/cardConstants.tsx';
import { useChatProvider } from '../hooks/useChatProvider';

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

// Inject styles if they don't exist
if (typeof document !== 'undefined' && !document.getElementById('massage-place-discount-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'massage-place-discount-styles';
    styleSheet.textContent = discountStyles;
    document.head.appendChild(styleSheet);
}

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
    // Chat provider for notifications
    const { addNotification } = useChatProvider();
    
    const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [showJoinPopup, setShowJoinPopup] = useState(false);
    const [discountTimeLeft, setDiscountTimeLeft] = useState<string>('');
    const [showPriceListModal, setShowPriceListModal] = useState(false);
    const [menuData, setMenuData] = useState<any[]>([]);
    const [selectedServiceIndex, setSelectedServiceIndex] = useState<number | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<'60' | '90' | '120' | null>(null);
    const [arrivalCountdown, setArrivalCountdown] = useState<number>(3600); // 1 hour in seconds
    const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<{url: string; title: string; description: string} | null>(null);
    // Orders count derived from persisted analytics JSON or actual bookings
    const [bookingsCount, setBookingsCount] = useState<number>(() => {
        try {
            if ((place as any).analytics) {
                const parsed = JSON.parse((place as any).analytics);
                if (parsed && typeof parsed.bookings === 'number') return parsed.bookings;
            }
        } catch {}
        return 0;
    });

    useEffect(() => {
        const loadBookingsCount = async () => {
            try {
                const providerId = String((place as any).id || (place as any).$id || '');
                if (!providerId) return;
                const docs = await bookingService.getByProvider(providerId, 'place');
                if (Array.isArray(docs)) {
                    setBookingsCount(docs.length);
                }
            } catch (e) {
                // silent
            }
        };
        loadBookingsCount();
    }, [place]);

    // Load menu data when price list modal opens
    // TODO: Re-enable when placesMenusService is created
    /*
    useEffect(() => {
        const loadMenu = async () => {
            try {
                if (showPriceListModal) {
                    const placeId = String(place.$id || place.id);
                    console.log('🍽️ Loading menu for place:', placeId);
                    
                    try {
                        const menuDoc = await placesMenusService.getByPlaceId(placeId);
                        console.log('📄 Menu document received:', menuDoc);
                        
                        if (menuDoc?.menuData) {
                            console.log('📄 Raw menuData:', menuDoc.menuData);
                            const parsed = JSON.parse(menuDoc.menuData);
                            console.log('📄 Parsed menuData:', parsed);
                            setMenuData(Array.isArray(parsed) ? parsed : []);
                            console.log('✅ Menu items loaded:', parsed.length);
                        } else {
                            console.log('ℹ️ No menu data found - using fallback pricing');
                            setMenuData([]);
                        }
                    } catch (error: any) {
                        console.log('ℹ️ Menu collection not available - using fallback pricing:', error.message);
                        setMenuData([]);
                    }
                }
            } catch (outerError) {
                console.error('❌ Outer error in loadMenu:', outerError);
                setMenuData([]);
            }
        };
        
        loadMenu().catch(error => {
            console.error('❌ Unhandled promise rejection:', error);
        });
    }, [showPriceListModal, place]);
    */

    // Countdown timer for price list modal
    useEffect(() => {
        if (!showPriceListModal) {
            setArrivalCountdown(3600); // Reset when modal closes
            return;
        }
        const interval = setInterval(() => {
            setArrivalCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [showPriceListModal]);

    const formatCountdown = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    const joinedDateRaw = (place as any).activeMembershipDate || (place as any).membershipStartDate || (place as any).$createdAt;
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
    


    // Handle anonymous review submission
    const handleAnonymousReviewSubmit = async (reviewData: {
        name: string;
        whatsappNumber: string;
        rating: number;
        providerId: string | number;
        providerType: 'therapist' | 'place';
    }) => {
        try {
            await reviewService.createAnonymous({
                providerType: reviewData.providerType,
                providerId: String(reviewData.providerId),
                providerName: place.name,
                rating: reviewData.rating,
                reviewerName: reviewData.name,
                whatsappNumber: reviewData.whatsappNumber
            });
            
            setShowReviewModal(false);
            alert('Thank you for your review! 🌟');
            
            // Refresh page to show updated rating
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error('Error submitting review:', error);
            throw error;
        }
    };
    
    // Parse pricing - multiply by 1000 to get full IDR amounts for consistent display
    const parsedPricing = parsePricing(place.pricing) || { "60": 0, "90": 0, "120": 0 };
    const pricing = {
        "60": parsedPricing["60"] * 1000,
        "90": parsedPricing["90"] * 1000,
        "120": parsedPricing["120"] * 1000
    };
    
    // Price formatting function matching TherapistCard format (XXXk)
    const formatPrice = (price: number | string): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        
        if (!numPrice || numPrice === 0 || isNaN(numPrice)) {
            return "Contact"; // Show "Contact" instead of "0k" when no price is set
        }
        
        // Convert to thousands and ensure 3-digit format (100-999)
        let priceInThousands = Math.round(numPrice / 1000);
        
        // Ensure 3-digit display (100k-999k range)
        if (priceInThousands < 100) {
            priceInThousands = 100; // Minimum 100k
        } else if (priceInThousands > 999) {
            priceInThousands = 999; // Maximum 999k for 4-char display
        }
        
        // Always return exactly 4 characters: 3 digits + "k"
        return `${priceInThousands}k`;
    };
    
    // Get main image
    const mainImage = (place as any).mainImage || 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382';
    
    // Get amenities if available
    const amenities = (place as any).amenities || [];
    const displayAmenities = Array.isArray(amenities) ? amenities.slice(0, 3) : [];

    // Dynamic data sourcing for description & specializations
    const rawDescription = (place as any).description || '';
    const description = rawDescription && rawDescription.trim().length > 0
        ? rawDescription.trim()
        : `Professional massage place. Create or update your profile description to help customers understand your services.`;

    const parsedMassageTypes = parseMassageTypes((place as any).massageTypes) || [];
    const massageTypesDisplay = Array.isArray(parsedMassageTypes) && parsedMassageTypes.length > 0 
        ? parsedMassageTypes.slice(0, 6) 
        : ['Traditional Balinese', 'Deep Tissue', 'Swedish', 'Aromatherapy', 'Hot Stone']; // Mock data

    const parsedLanguages = parseLanguages((place as any).languages) || [];
    const languagesDisplay = Array.isArray(parsedLanguages) && parsedLanguages.length > 0 
        ? parsedLanguages.slice(0, 5) 
        : ['English', 'Indonesian', 'Mandarin']; // Mock data

    // Gallery photos - parse from place data with mock data for demonstration
    const galleryPhotos = (() => {
        try {
            const photos = (place as any).galleryPhotos || (place as any).photos || [];
            let parsedPhotos = [];
            
            if (typeof photos === 'string') {
                const parsed = JSON.parse(photos);
                parsedPhotos = Array.isArray(parsed) ? parsed.slice(0, 4) : [];
            } else {
                parsedPhotos = Array.isArray(photos) ? photos.slice(0, 4) : [];
            }
            
            // Add mock data if no photos exist (for demonstration)
            if (parsedPhotos.length === 0) {
                parsedPhotos = [
                    {
                        url: 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382',
                        title: 'Relaxing Treatment Room',
                        description: 'Our peaceful treatment rooms are designed with your comfort in mind. Each room features ambient lighting, comfortable massage beds, and a serene atmosphere perfect for your relaxation journey. We maintain the highest standards of cleanliness and hygiene.'
                    },
                    {
                        url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500',
                        title: 'Professional Massage Therapists',
                        description: 'Our team of certified massage therapists brings years of experience and expertise. Each therapist is trained in various massage techniques including traditional Balinese, Swedish, deep tissue, and aromatherapy massage to provide you with the best experience.'
                    },
                    {
                        url: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=500',
                        title: 'Reception & Waiting Area',
                        description: 'Welcome to our modern reception area where our friendly staff will greet you. Enjoy complimentary herbal tea while you wait in our comfortable lounge. We ensure your visit starts with a warm welcome and ends with complete satisfaction.'
                    },
                    {
                        url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500',
                        title: 'Premium Spa Amenities',
                        description: 'We provide premium spa amenities including luxurious towels, aromatic oils, and shower facilities. Our commitment to quality extends to every detail of your spa experience, ensuring you leave feeling refreshed and rejuvenated.'
                    }
                ];
            }
            
            return parsedPhotos;
        } catch {
            // Return mock data on error
            return [
                {
                    url: 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382',
                    title: 'Relaxing Treatment Room',
                    description: 'Our peaceful treatment rooms are designed with your comfort in mind. Each room features ambient lighting, comfortable massage beds, and a serene atmosphere perfect for your relaxation journey.'
                },
                {
                    url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500',
                    title: 'Professional Massage Therapists',
                    description: 'Our team of certified massage therapists brings years of experience and expertise. Each therapist is trained in various massage techniques to provide you with the best experience.'
                },
                {
                    url: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=500',
                    title: 'Reception & Waiting Area',
                    description: 'Welcome to our modern reception area where our friendly staff will greet you. Enjoy complimentary herbal tea while you wait in our comfortable lounge.'
                },
                {
                    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500',
                    title: 'Premium Spa Amenities',
                    description: 'We provide premium spa amenities including luxurious towels, aromatic oils, and shower facilities for your complete relaxation.'
                }
            ];
        }
    })();

    // Years of experience: prefer explicit yearsOfExperience, fallback to membership duration, then mock data
    const yearsOfExperience = (() => {
        const direct = (place as any).yearsOfExperience;
        if (typeof direct === 'number' && direct > 0) return direct;
        try {
            const startRaw = (place as any).activeMembershipDate || (place as any).membershipStartDate;
            if (!startRaw) return 5; // Mock data: 5 years
            const startDate = new Date(startRaw);
            if (isNaN(startDate.getTime())) return 5; // Mock data: 5 years
            const diffMs = Date.now() - startDate.getTime();
            const years = diffMs / (1000 * 60 * 60 * 24 * 365);
            return years >= 1 ? Math.floor(years) : 5; // Mock data: 5 years
        } catch { return 5; } // Mock data: 5 years
    })();



    const handleViewDetails = () => {
        console.log('🏨 MassagePlaceCard - View Details clicked:', {
            place: place,
            placeName: place.name,
            placeId: place.id || (place as any).$id,
            onNavigate: !!onNavigate,
            onSelectPlace: !!onSelectPlace
        });
        
        onIncrementAnalytics('views');
        
        // Set selected place first
        onSelectPlace(place);
        
        // Update URL using SEO-optimized shareable link
        const profileUrl = generatePlaceShareableURL(place);
        const path = new URL(profileUrl).pathname;
        window.history.pushState({}, '', path);
        
        // Use setTimeout to ensure state update completes before navigation
        if (onNavigate) {
            console.log('🏨 Navigating to massage-place-profile');
            setTimeout(() => {
                onNavigate('massage-place-profile');
            }, 0);
        } else {
            console.error('❌ onNavigate is not defined!');
        }
    };

    // Calculate display rating (same as therapist card)
    const displayRating = place.averageRating > 0 
        ? Number(place.averageRating.toFixed(1)) 
        : (place.staticRating || 4.8);

    return (
        <>
            {/* CSS Animation Styles */}
            <style>{`
                @keyframes priceRimFade {
                    0%, 100% { 
                        border-color: rgb(251, 146, 60);
                        box-shadow: 0 0 0 2px rgba(251, 146, 60, 0.3), 0 4px 6px -1px rgba(251, 146, 60, 0.5);
                    }
                    50% { 
                        border-color: rgba(251, 146, 60, 0.3);
                        box-shadow: 0 0 0 2px rgba(251, 146, 60, 0.1), 0 4px 6px -1px rgba(251, 146, 60, 0.2);
                    }
                }

                .price-rim-fade {
                    animation: priceRimFade 2s ease-in-out infinite;
                }
            `}</style>
        
            {/* External meta bar (Joined Date / Free) */}
            <div className="flex justify-between items-center mb-2 px-2">
                <span className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {joinedDisplay}
                </span>
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
                    Massage Spa Join Free
                </button>
            </div>
            <div 
                onClick={handleViewDetails}
                className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative active:shadow-xl transition-all touch-manipulation pb-8 cursor-pointer hover:shadow-xl"
            >
                {/* Main Image Banner + Lazy Loading (full-width cover) */}
                <div className="h-48 w-full overflow-visible relative rounded-t-xl">
                <div className="absolute inset-0 rounded-t-xl overflow-hidden bg-gradient-to-r from-orange-400 to-orange-600">
                    <img 
                        src={mainImage} 
                        alt={`${place.name} cover`} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382';
                        }}
                    />
                    


                    {/* Star Rating Badge - Top Left (below verified badge) */}
                    {getDisplayRating(place.rating, place.reviewCount) > 0 && (
                        <button
                            className="absolute top-3 left-3 z-30 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5"
                            onClick={(e) => {
                                e.stopPropagation();
                                // Navigate to reviews page like RotatingReviews does
                                if (onNavigate) {
                                    const params: Record<string, string> = {};
                                    params.providerId = String(place.$id || place.id);
                                    params.providerName = place.name;
                                    params.providerType = 'place';
                                    params.providerImage = (place as any).profilePicture || (place as any).mainImage || mainImage;
                                    params.returnUrl = window.location.pathname;
                                    
                                    // Store params for reviews page
                                    sessionStorage.setItem('reviewParams', JSON.stringify(params));
                                    onNavigate('reviews');
                                } else {
                                    // Fallback to direct URL navigation
                                    try {
                                        const url = new URL(window.location.origin + '/reviews');
                                        url.searchParams.set('providerId', String(place.$id || place.id));
                                        url.searchParams.set('providerName', place.name);
                                        url.searchParams.set('providerType', 'place');
                                        url.searchParams.set('providerImage', (place as any).profilePicture || (place as any).mainImage || mainImage);
                                        url.searchParams.set('returnUrl', window.location.href);
                                        window.location.href = url.toString();
                                    } catch {
                                        window.location.href = '/reviews';
                                    }
                                }
                            }}
                            aria-label={`Rate ${place.name}`}
                        >
                            <svg className="w-4 h-4 fill-current text-yellow-400" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-bold text-white">{formatRating(getDisplayRating(place.rating, place.reviewCount))}</span>
                        </button>
                    )}

                {/* Discount Badge - Database driven discount */}
                {isDiscountActive(place) && (
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                        <div 
                            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-full px-4 py-2 shadow-lg animate-bounce"
                            style={{
                                animation: 'discountFade 2s ease-in-out infinite',
                                filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.6))'
                            }}
                        >
                            <span className="font-bold text-white text-xl">{(place as any).discountPercentage}% OFF</span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md rounded-full px-3 py-1 shadow-lg">
                            <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs text-white font-semibold">
                                {(() => {
                                    const endTime = new Date((place as any).discountEndTime);
                                    const now = new Date();
                                    const diff = endTime.getTime() - now.getTime();
                                    
                                    if (diff <= 0) return 'EXPIRED';
                                    
                                    const hours = Math.floor(diff / (1000 * 60 * 60));
                                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                    return `${hours}h ${minutes}m`;
                                })()}
                            </span>
                        </div>
                    </div>
                )}

                {/* Opening/Closing Time Badge - Shows when NO discount is active */}
                {!isDiscountActive(place) && !activeDiscount && place.openingTime && place.closingTime && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/80 backdrop-blur-md rounded-full px-3 py-2 shadow-lg">
                        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs text-white font-semibold">
                            {place.openingTime} - {place.closingTime}
                        </span>
                    </div>
                )}

                {/* Active Discount Badge - External discount prop (fallback) */}
                {!isDiscountActive(place) && activeDiscount && discountTimeLeft !== 'EXPIRED' && (
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

                {/* Share Button - Bottom Right Corner */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowSharePopup(true);
                    }}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-30"
                    title="Share this place"
                    aria-label="Share this place"
                >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                </button>
            </div>
            </div>
            
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

            {/* Client Preference Display - Left aligned, matching therapist card */}
            <div className="mx-4 mb-2 mt-4 flex items-center justify-between">
                <p className="text-xs text-gray-600 text-left">
                    <span className="font-bold">Menerima:</span> {(place as any).therapistGender && (place as any).therapistGender !== 'Unisex' ? `${(place as any).therapistGender} Only` : 'Pria / Wanita'}
                </p>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPriceListModal(true);
                    }}
                    className="flex items-center gap-1 text-xs font-medium transition-colors animate-flash-subtle"
                >
                    <style>{`
                        @keyframes flash-subtle {
                            0%, 100% { opacity: 1; }
                            50% { opacity: 0.6; }
                        }
                        .animate-flash-subtle {
                            animation: flash-subtle 2s ease-in-out infinite;
                        }
                    `}</style>
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/massage%20table.png" 
                        alt="Menu"
                        className="w-12 h-12 object-contain"
                    />
                    <span className="font-bold text-black text-sm">{_t?.home?.priceMenu || 'Menu Harga'}</span>
                </button>
            </div>

            {/* Massage Place Bio - Natural flow with proper margin */}
            <div className="massage-place-bio-section bg-white/90 backdrop-blur-sm rounded-lg py-2 px-3 shadow-sm mx-4 mb-3">
                <p className="text-sm text-gray-700 leading-5 break-words whitespace-normal line-clamp-6">
                    {description}
                </p>
                {/* Opening/Closing Time Text - Shows when discount IS active */}
                {(isDiscountActive(place) || activeDiscount) && place.openingTime && place.closingTime && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap mt-2">
                        <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{place.openingTime}-{place.closingTime}</span>
                    </div>
                )}
                {/* Website Link */}
                {(place as any).websiteUrl && (
                    <a
                        href={(place as any).websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 mt-2 text-xs text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        Visit Website
                    </a>
                )}
            </div>

            {/* Photo Gallery - 4 Thumbnails */}
            {galleryPhotos.length > 0 && (
                <div className="px-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Gallery</h4>
                    <div className="grid grid-cols-4 gap-2">
                        {galleryPhotos.map((photo: any, index: number) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedGalleryPhoto({
                                        url: typeof photo === 'string' ? photo : photo.url || photo.imageUrl || '',
                                        title: typeof photo === 'object' ? (photo.title || photo.name || `Photo ${index + 1}`) : `Photo ${index + 1}`,
                                        description: typeof photo === 'object' ? (photo.description || '') : ''
                                    });
                                }}
                                className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-orange-500 transition-all hover:scale-105 active:scale-95"
                            >
                                <img
                                    src={typeof photo === 'string' ? photo : photo.url || photo.imageUrl || ''}
                                    alt={typeof photo === 'object' ? (photo.title || `Gallery photo ${index + 1}`) : `Gallery photo ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382';
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Content Section - Compact layout */}
            <div className="px-4">
            {/* Massage Specializations - Centered */}
            <div className="border-t border-gray-100 pt-3">
                <div className="mb-2">
                    <h4 className="text-sm font-semibold text-gray-700 text-center">
                        Areas of Expertise
                    </h4>
                </div>
                <div className="flex flex-wrap gap-1 justify-center">
                    {massageTypesDisplay.slice(0, 5).map((mt: string) => (
                        <span key={mt} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-300">{mt}</span>
                    ))}
                    {massageTypesDisplay.length === 0 && (
                        <span className="text-xs text-gray-400">No specialties selected</span>
                    )}
                    {massageTypesDisplay.length > 5 && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-300">+{massageTypesDisplay.length - 5}</span>
                    )}
                </div>
                </div>
            </div>

            {/* Languages Spoken - Compact */}
            {(languagesDisplay.length > 0 || yearsOfExperience) && (
                <div className="px-4 mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-semibold text-gray-700">Languages</h4>
                        {yearsOfExperience && (
                            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                {yearsOfExperience} years experience
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {languagesDisplay.slice(0, 3).map((lang: string) => (
                            <span key={lang} className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1">
                                <span className="text-xs">🌐</span>
                                <span className="text-xs font-semibold">{lang}</span>
                            </span>
                        ))}
                        {languagesDisplay.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">+{languagesDisplay.length - 3}</span>
                        )}
                    </div>
                </div>
            )}

            {/* Amenities */}
            {displayAmenities.length > 0 && (
                <div className="px-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Amenities</h4>
                    <p className="text-xs text-gray-500 mb-2">Additional services provided during your massage session</p>
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

            {/* Massage Therapist Standards Link */}
            <div className="text-center mb-4 mt-2">
                <button
                    onClick={() => {
                        const isSharedProfile = window.location.pathname.includes('/share/');
                        if (isSharedProfile) {
                            // On shared profiles: navigate to mobile terms with custom context in same window
                            const baseUrl = window.location.origin;
                            const currentUrl = window.location.href;
                            window.location.href = `${baseUrl}/mobile-terms-and-conditions?returnTo=${encodeURIComponent(currentUrl)}&context=sharedProfile`;
                        } else {
                            // On home page: go to verification standards page  
                            onNavigate?.('verifiedProBadge');
                        }
                    }}
                    className="text-sm font-medium hover:underline"
                >
                    <span className="text-black">Massage Therapist </span><span className="text-orange-500">Standards</span>
                </button>
            </div>

            {/* Discounted Prices Header */}
            {isDiscountActive(place) && (
                <div className={`text-center mb-1 ${getDynamicSpacing('mt-3', 'mt-2', 'mt-1')}`}>
                    <p className="text-black font-semibold text-sm flex items-center justify-center gap-1">
                        🔥 Discounted Price's Displayed
                    </p>
                </div>
            )}

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-2 mb-3 px-1">
                {pricing["60"] > 0 && (
                    <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-500 min-h-[75px] flex flex-col justify-center ${
                        isDiscountActive(place)
                        ? 'bg-gray-100 border-orange-500 border-2 price-rim-fade' 
                        : 'bg-gray-100 border-gray-200'
                    }`}>
                        {/* Star Rating - Top Edge Left (50% inside, 50% outside) */}
                        {displayRating && (
                            <div className="absolute -top-2.5 left-2 bg-yellow-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {displayRating}
                            </div>
                        )}
                        <p className="text-gray-600 text-xs mb-1">60 min</p>
                        {isDiscountActive(place) ? (
                            <>
                                <p className="font-bold text-gray-800 text-sm leading-tight">
                                    Rp {formatPrice(Math.round(pricing["60"] * (1 - (place as any).discountPercentage / 100)))}
                                </p>
                                <p className="text-[11px] text-gray-500 line-through">
                                    Rp {formatPrice(pricing["60"])}
                                </p>
                            </>
                        ) : (
                            <p className="font-bold text-gray-800 text-sm leading-tight">
                                Rp {formatPrice(pricing["60"])}
                            </p>
                        )}
                    </div>
                )}
                {pricing["90"] > 0 && (
                    <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-500 min-h-[75px] flex flex-col justify-center ${
                        isDiscountActive(place)
                        ? 'bg-gray-100 border-orange-500 border-2 price-rim-fade' 
                        : 'bg-gray-100 border-gray-200'
                    }`}>
                        {/* Star Rating - Top Edge Left (50% inside, 50% outside) */}
                        {displayRating && (
                            <div className="absolute -top-2.5 left-2 bg-yellow-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {displayRating}
                            </div>
                        )}
                        <p className="text-gray-600 text-xs mb-1">90 min</p>
                        {isDiscountActive(place) ? (
                            <>
                                <p className="font-bold text-gray-800 text-sm leading-tight">
                                    Rp {formatPrice(Math.round(pricing["90"] * (1 - (place as any).discountPercentage / 100)))}
                                </p>
                                <p className="text-[11px] text-gray-500 line-through">
                                    Rp {formatPrice(pricing["90"])}
                                </p>
                            </>
                        ) : (
                            <p className="font-bold text-gray-800 text-sm leading-tight">
                                Rp {formatPrice(pricing["90"])}
                            </p>
                        )}
                    </div>
                )}
                {pricing["120"] > 0 && (
                    <div className={`p-2 rounded-lg border shadow-md relative transition-all duration-500 min-h-[75px] flex flex-col justify-center ${
                        isDiscountActive(place)
                        ? 'bg-gray-100 border-orange-500 border-2 price-rim-fade' 
                        : 'bg-gray-100 border-gray-200'
                    }`}>
                        {/* Star Rating - Top Edge Left (50% inside, 50% outside) */}
                        {displayRating && (
                            <div className="absolute -top-2.5 left-2 bg-yellow-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {displayRating}
                            </div>
                        )}
                        <p className="text-gray-600 text-xs mb-1">120 min</p>
                        {isDiscountActive(place) ? (
                            <>
                                <p className="font-bold text-gray-800 text-sm leading-tight">
                                    Rp {formatPrice(Math.round(pricing["120"] * (1 - (place as any).discountPercentage / 100)))}
                                </p>
                                <p className="text-[11px] text-gray-500 line-through">
                                    Rp {formatPrice(pricing["120"])}
                                </p>
                            </>
                        ) : (
                            <p className="font-bold text-gray-800 text-sm leading-tight">
                                Rp {formatPrice(pricing["120"])}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Action Buttons - Book Now & Schedule Booking (matching therapist card) */}
            <div className="flex gap-2 px-4 mt-4">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // Prevent multiple rapid clicks
                            if ((e.target as HTMLElement).hasAttribute('data-clicking')) {
                                return;
                            }
                            (e.target as HTMLElement).setAttribute('data-clicking', 'true');
                            requestAnimationFrame(() => {
                                (e.target as HTMLElement).removeAttribute('data-clicking');
                            });
                            
                            console.log('🟢 Book Now button clicked - opening chat window for massage place');
                            
                            // Show notification instead of opening chat
                            console.log('🔵 MassagePlaceCard: Instant booking notification for', place.name);
                            
                            addNotification(
                                'info',
                                'Instant Booking',
                                `Please complete booking with ${place.name} to start chatting`,
                                { duration: 4000 }
                            );
                        }}
                        className="w-1/2 flex items-center justify-center gap-1.5 font-bold py-4 px-3 rounded-lg transition-all duration-100 transform touch-manipulation min-h-[48px] bg-green-500 text-white hover:bg-green-600 active:bg-green-700 active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-sm">{_t?.home?.bookNow || 'Book Now'}</span>
                    </button>
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // Prevent multiple rapid clicks
                            if ((e.target as HTMLElement).hasAttribute('data-clicking')) {
                                return;
                            }
                            (e.target as HTMLElement).setAttribute('data-clicking', 'true');
                            requestAnimationFrame(() => {
                                (e.target as HTMLElement).removeAttribute('data-clicking');
                            });
                            
                            console.log('📅 Schedule button clicked - showing notification for massage place');
                            
                            addNotification(
                                'info',
                                'Scheduled Booking',
                                `Please complete booking with ${place.name} to start chatting`,
                                { duration: 4000 }
                            );
                            onIncrementAnalytics('bookings');
                        }} 
                        className="w-1/2 flex items-center justify-center gap-1.5 font-bold py-4 px-3 rounded-lg transition-all duration-100 transform touch-manipulation min-h-[48px] bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">{_t?.home?.scheduleBooking || 'Schedule Booking'}</span>
                    </button>
                </div>

            {/* Terms and Conditions Link - Below booking buttons */}
            <div className="text-center mt-3 px-4">
                <button 
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const isSharedProfile = window.location.pathname.includes('/share/');
                        const baseUrl = window.location.origin;
                        if (isSharedProfile) {
                            const currentUrl = window.location.href;
                            window.open(`${baseUrl}/mobile-terms-and-conditions?returnTo=${encodeURIComponent(currentUrl)}`, '_blank');
                        } else {
                            window.open(`${baseUrl}/mobile-terms-and-conditions`, '_blank');
                        }
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 underline font-medium cursor-pointer bg-transparent border-none p-0"
                >
                    Terms And Conditions
                </button>
            </div>

            {/* Massage Directory Link */}
            {onNavigate && (
                <div className="flex justify-center items-center gap-2 mt-3 px-1 pt-3 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            onNavigate('massageTypes');
                        }}
                        title={_t?.home?.massageDirectoryTitle || 'Go to Massage Directory'}
                        className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                    >
                        <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m0 0l-3.5 3.5M16 7l-3.5 3.5M5 12h14M5 16h14" />
                        </svg>
                        <span>{_t?.home?.massageDirectory || 'Massage Directory'}</span>
                    </button>
                </div>
            )}
            </div>
            
            {/* Price List Bottom Sheet Slider */}
            {showPriceListModal && (
                <div
                    className="fixed inset-0 z-[9999] bg-black bg-opacity-50 transition-opacity duration-300"
                    onClick={() => setShowPriceListModal(false)}
                >
                    <style>{`
                        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                    `}</style>
                    <div
                        className="absolute bottom-0 left-0 right-0 h-full w-full bg-white transform transition-transform duration-300 ease-out"
                        style={{ animation: 'slideUp 0.3s ease-out forwards' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header - Orange gradient with profile & rating */}
                        <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 sticky top-0">
                            <div className="flex items-center gap-3 flex-1">
                                <img
                                    src={(place as any).profilePicture || (place as any).mainImage || '/default-place.jpg'}
                                    alt={place.name}
                                    className="w-11 h-11 rounded-full border-2 border-white object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/default-place.jpg'; }}
                                />
                                <div>
                                    <h2 className="text-lg font-bold text-white leading-tight">{place.name}</h2>
                                    <div className="flex items-center gap-2 text-xs">
                                        <StarIcon className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                                        <span className="font-bold text-black bg-white/90 rounded px-1.5 py-0.5 shadow-sm">{formatRating(getDisplayRating(place.rating, place.reviewCount))}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPriceListModal(false)}
                                className="flex items-center justify-center w-8 h-8 bg-black/70 hover:bg-black rounded-full transition-colors"
                                aria-label="Close"
                            >
                                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Pricing Header Row */}
                        <div className="px-4 py-2 flex items-center justify-between">
                            <div className="text-sm sm:text-base font-bold text-gray-900">Service Prices</div>
                            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-orange-800 font-semibold">
                                <span className="hidden sm:inline">Preparation Time • ~1 hour</span>
                                <span className="sm:hidden">Preparation Time • ~1h</span>
                                <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                                    {formatCountdown(arrivalCountdown)}
                                </span>
                            </div>
                        </div>

                        {/* Price List Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4" style={{ height: 'calc(100vh - 180px)' }}>
                            {menuData.length > 0 ? (
                                <div className="bg-white rounded-lg border border-orange-200 overflow-hidden shadow-lg">
                                    {/* Table Header */}
                                    <div className="grid grid-cols-12 gap-1 sm:gap-2 bg-gradient-to-r from-orange-50 to-amber-50 px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-semibold text-orange-700 border-b border-orange-200">
                                        <div className="col-span-4">Service</div>
                                        <div className="col-span-2 text-center">60m</div>
                                        <div className="col-span-2 text-center">90m</div>
                                        <div className="col-span-2 text-center">120m</div>
                                        <div className="col-span-2 text-center">Action</div>
                                    </div>

                                    {/* Table Rows */}
                                    <div className="divide-y divide-orange-100">
                                        {menuData.map((service: any, index: number) => {
                                            const isRowSelected = selectedServiceIndex === index;

                                            return (
                                                <div key={index} className={`grid grid-cols-12 gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 transition-colors items-center ${
                                                    isRowSelected ? 'bg-orange-50 border-l-4 border-orange-500' : 'hover:bg-orange-50'
                                                }`}>
                                                    {/* Service Name */}
                                                    <div className="col-span-4 min-w-0">
                                                        <div className="font-medium text-xs sm:text-sm text-gray-900 truncate">{service.serviceName || service.name || 'Service'}</div>
                                                        {service.description && (
                                                            <div className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">{service.description}</div>
                                                        )}
                                                    </div>

                                                    {/* Price buttons */}
                                                    {['60', '90', '120'].map((duration) => (
                                                        <div key={duration} className="col-span-2 flex flex-col items-center gap-1 min-w-0">
                                                            {service[`price${duration}`] ? (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedServiceIndex(index);
                                                                        setSelectedDuration(duration as '60' | '90' | '120');
                                                                    }}
                                                                    className={`w-full px-0.5 sm:px-1 py-1 rounded text-[9px] sm:text-xs transition-all border-2 min-w-0 overflow-hidden ${
                                                                        isRowSelected && selectedDuration === duration
                                                                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold border-transparent shadow-lg'
                                                                            : 'bg-white text-gray-800 border-orange-200 hover:border-orange-400 hover:bg-orange-50'
                                                                    }`}
                                                                >
                                                                    <span className="block truncate w-full">
                                                                        {(Number(service[`price${duration}`]) * 1000).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                                    </span>
                                                                </button>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">-</span>
                                                            )}
                                                        </div>
                                                    ))}

                                                    {/* Action Buttons */}
                                                    <div className="col-span-2 text-center min-w-0">
                                                        <button
                                                            className={`w-full px-1 sm:px-2 py-1 text-[9px] sm:text-xs font-semibold rounded-lg transition-colors truncate ${
                                                                isRowSelected && selectedDuration
                                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 cursor-pointer'
                                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            }`}
                                                            onClick={(e) => {
                                                                if (isRowSelected && selectedDuration) {
                                                                    e.stopPropagation();
                                                                    setShowPriceListModal(false);
                                                                    // Trigger booking or navigate to place profile
                                                                    onSelectPlace(place);
                                                                }
                                                            }}
                                                            disabled={!isRowSelected || !selectedDuration}
                                                        >
                                                            {_t?.home?.bookNow || 'Book'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                // Fallback pricing when menu data fails to load
                                <div className="bg-white rounded-lg border border-orange-200 overflow-hidden shadow-lg">
                                    {/* Table Header */}
                                    <div className="grid grid-cols-12 gap-2 bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-2 text-xs font-semibold text-orange-700 border-b border-orange-200">
                                        <div className="col-span-4">Service</div>
                                        <div className="col-span-2 text-center">60 Min</div>
                                        <div className="col-span-2 text-center">90 Min</div>
                                        <div className="col-span-2 text-center">120 Min</div>
                                        <div className="col-span-2 text-center">Action</div>
                                    </div>

                                    {/* Fallback Service Row */}
                                    <div className="divide-y divide-orange-100">
                                        <div className="grid grid-cols-12 gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 hover:bg-orange-50 items-center">
                                            {/* Service Name */}
                                            <div className="col-span-4 min-w-0">
                                                <div className="font-medium text-xs sm:text-sm text-gray-900 truncate">Traditional Massage</div>
                                                <div className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">Traditional therapeutic massage</div>
                                            </div>

                                            {/* Price buttons - 3 columns for 60, 90, 120 min */}
                                            {['60', '90', '120'].map((duration) => {
                                                const price = pricing[duration as '60' | '90' | '120'];
                                                return (
                                                    <div key={duration} className="col-span-2 flex flex-col items-center gap-1 min-w-0">
                                                        {price > 0 ? (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedServiceIndex(0);
                                                                    setSelectedDuration(duration as '60' | '90' | '120');
                                                                }}
                                                                className={`w-full px-0.5 sm:px-1 py-1 rounded text-[9px] sm:text-xs transition-all border-2 min-w-0 overflow-hidden ${
                                                                    selectedServiceIndex === 0 && selectedDuration === duration
                                                                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold border-transparent shadow-lg'
                                                                        : 'bg-white text-gray-800 border-orange-200 hover:border-orange-400 hover:bg-orange-50'
                                                                }`}
                                                            >
                                                                <span className="block truncate w-full">
                                                                    {formatPrice(price)}
                                                                </span>
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">-</span>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Action Button */}
                                            <div className="col-span-2 text-center min-w-0">
                                                <button
                                                    className={`w-full px-1 sm:px-2 py-1 text-[9px] sm:text-xs font-semibold rounded-lg transition-colors truncate ${
                                                        selectedServiceIndex === 0 && selectedDuration
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 cursor-pointer'
                                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                                    onClick={(e) => {
                                                        if (selectedServiceIndex === 0 && selectedDuration) {
                                                            e.stopPropagation();
                                                            setShowPriceListModal(false);
                                                            onSelectPlace(place);
                                                        }
                                                    }}
                                                    disabled={selectedServiceIndex !== 0 || !selectedDuration}
                                                >
                                                    {_t?.home?.bookNow || 'Book'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Anonymous Review Modal */}
            {showReviewModal && (
                <AnonymousReviewModal
                    providerName={place.name}
                    providerId={place.$id || place.id}
                    providerType="place"
                    providerImage={(place as any).mainImage || 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382'}
                    onClose={() => setShowReviewModal(false)}
                    onSubmit={handleAnonymousReviewSubmit}
                />
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
                                className="w-full px-4 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors min-h-[44px] touch-manipulation active:bg-orange-700"
                            >
                                Register / Login
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes coin-fall-1 {
                    0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { transform: translateY(85px) rotate(360deg); opacity: 0.8; }
                    100% { transform: translateY(90px) rotate(360deg); opacity: 0.6; }
                }
                @keyframes coin-fall-2 {
                    0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { transform: translateY(88px) rotate(360deg); opacity: 0.8; }
                    100% { transform: translateY(93px) rotate(360deg); opacity: 0.6; }
                }
                @keyframes coin-fall-3 {
                    0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { transform: translateY(82px) rotate(360deg); opacity: 0.8; }
                    100% { transform: translateY(87px) rotate(360deg); opacity: 0.6; }
                }
                @keyframes coin-fall-4 {
                    0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { transform: translateY(86px) rotate(360deg); opacity: 0.8; }
                    100% { transform: translateY(91px) rotate(360deg); opacity: 0.6; }
                }
                @keyframes coin-fall-5 {
                    0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { transform: translateY(84px) rotate(360deg); opacity: 0.8; }
                    100% { transform: translateY(89px) rotate(360deg); opacity: 0.6; }
                }
                @keyframes coin-fall-6 {
                    0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { transform: translateY(87px) rotate(360deg); opacity: 0.8; }
                    100% { transform: translateY(92px) rotate(360deg); opacity: 0.6; }
                }
                @keyframes coin-float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-3px); }
                }
                .animate-coin-fall-1 { animation: coin-fall-1 3s ease-in forwards, coin-float 2s ease-in-out 3s infinite; }
                .animate-coin-fall-2 { animation: coin-fall-2 3s ease-in forwards, coin-float 2s ease-in-out 3.3s infinite; }
                .animate-coin-fall-3 { animation: coin-fall-3 3s ease-in forwards, coin-float 2s ease-in-out 3.6s infinite; }
                .animate-coin-fall-4 { animation: coin-fall-4 3s ease-in forwards, coin-float 2s ease-in-out 3.9s infinite; }
                .animate-coin-fall-5 { animation: coin-fall-5 3s ease-in forwards, coin-float 2s ease-in-out 4.2s infinite; }
                .animate-coin-fall-6 { animation: coin-fall-6 3s ease-in forwards, coin-float 2s ease-in-out 4.5s infinite; }
            `}</style>

        <SocialSharePopup
            isOpen={showSharePopup}
            onClose={() => setShowSharePopup(false)}
            title={place.name}
            description={`Check out ${place.name} on IndaStreet! ${place.description || 'Amazing massage place with great services.'}`}
            url={window.location.href}
            type="place"
        />

        {/* Report Profile Section - Footer Area */}
        <div className="text-center mt-4 mb-4 px-4">
            <button 
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onNavigate) {
                        onNavigate('contact');
                    } else {
                        window.location.href = '/contact';
                    }
                }}
                className="inline-flex flex-col items-center cursor-pointer bg-transparent border-none p-0"
            >
                <span className="text-sm font-bold text-red-600 hover:text-red-700">Report Profile</span>
                <span className="text-xs text-gray-500 mt-0.5">Violates Stated Standards</span>
            </button>
        </div>
        
        <MassagePlaceJoinPopup
            isOpen={showJoinPopup}
            onClose={() => setShowJoinPopup(false)}
            onNavigate={onNavigate}
        />

        {/* Gallery Photo Enlarged Modal */}
        {selectedGalleryPhoto && (
            <div
                className="fixed inset-0 z-[10000] bg-black bg-opacity-90 flex items-center justify-center p-4"
                onClick={() => setSelectedGalleryPhoto(null)}
            >
                <div
                    className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setSelectedGalleryPhoto(null)}
                        className="absolute top-3 right-3 z-10 w-10 h-10 bg-black/70 hover:bg-black rounded-full flex items-center justify-center transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Image */}
                    <div className="w-full bg-gray-100">
                        <img
                            src={selectedGalleryPhoto.url}
                            alt={selectedGalleryPhoto.title}
                            className="w-full max-h-[70vh] object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382';
                            }}
                        />
                    </div>

                    {/* Header and Description */}
                    <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600">
                        <h3 className="text-xl font-bold text-white mb-2">{selectedGalleryPhoto.title}</h3>
                        {selectedGalleryPhoto.description && (
                            <p className="text-sm text-white/90 leading-relaxed line-clamp-4">
                                {selectedGalleryPhoto.description.slice(0, 350)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default MassagePlaceCard;
// Force rebuild
