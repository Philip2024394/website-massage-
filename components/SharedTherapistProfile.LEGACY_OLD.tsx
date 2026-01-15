import React, { useState } from 'react';
import { Star, Heart, MessageCircle, Phone, MapPin, ArrowLeft, Share2, Calendar, ExternalLink, Clock } from 'lucide-react';
import type { Therapist, UserLocation } from '../types';
import { getRandomTherapistImage } from '../utils/therapistImageUtils';
import { getDisplayRating, getDisplayReviewCount, formatRating } from '../utils/ratingUtils';
import DistanceDisplay from './DistanceDisplay';
import BookingPopup from './BookingPopup';
import ScheduleBookingPopup from './ScheduleBookingPopup';

interface SharedTherapistProfileProps {
    therapist: Therapist;
    onViewAllTherapists: () => void;
    userLocation?: UserLocation | null;
    onQuickBookWithChat?: (therapist: Therapist) => void;
    loggedInCustomer?: any;
    currentLanguage?: 'en' | 'id'; // Only English and Indonesian
}

const SharedTherapistProfile: React.FC<SharedTherapistProfileProps> = ({
    therapist,
    onViewAllTherapists,
    userLocation,
    onQuickBookWithChat,
    loggedInCustomer,
    currentLanguage = 'en' // Default to English
}) => {
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [showBookingPopup, setShowBookingPopup] = useState(false);
    const [showScheduleBookingPopup, setShowScheduleBookingPopup] = useState(false);
    
    // Track shared link analytics for admin dashboard - identical to main app
    React.useEffect(() => {
        const trackSharedVisit = async () => {
            try {
                const visitData = {
                    therapistId: therapist.id || (therapist as any).$id,
                    therapistName: therapist.name,
                    timestamp: new Date().toISOString(),
                    source: 'shared_link', // Separate tracking identifier
                    userAgent: navigator.userAgent,
                    referrer: document.referrer || 'direct',
                    url: window.location.href,
                    // Same metrics as main app
                    deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                    location: userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null,
                    therapistData: {
                        status: therapist.status,
                        pricing: pricing,
                        rating: displayRating,
                        reviewCount: reviewCount,
                        membershipTier: membershipTier
                    }
                };
                
                // Store in session for tracking conversion funnel
                sessionStorage.setItem('shared_link_visit', JSON.stringify(visitData));
                sessionStorage.setItem('visit_source', 'shared_link');
                sessionStorage.setItem('source_therapist_id', String(therapist.id || (therapist as any).$id));
                
                console.log(`📊 [Shared Link Analytics] Visit tracked:`, visitData);
                
                // Increment view count (same as main app)
                const currentAnalytics = therapist.analytics ? JSON.parse(therapist.analytics) : {};
                const totalViews = (currentAnalytics.views || 0) + 1;
                const sharedViews = (currentAnalytics.shared_link_views || 0) + 1;
                
                console.log(`👀 Total views: ${totalViews} | Shared link views: ${sharedViews}`);
                
                // TODO: Send to backend (same endpoint as main app, just different source)
                // await analyticsService.incrementAnalytics(therapist.id, 'views', { source: 'shared_link' });
                
            } catch (error) {
                console.error('❌ Shared link analytics tracking failed:', error);
            }
        };
        trackSharedVisit();
    }, [therapist.id]);

    // Helper functions matching TherapistCard
    const formatPrice = (price: number): string => {
        return `Rp ${Math.round(price / 1000)}K`;
    };

    const getPricing = () => {
        console.log('💰 [SharedProfile Pricing Debug]', {
            therapistName: therapist.name,
            price60: therapist.price60,
            price90: therapist.price90,
            price120: therapist.price120,
            pricing: therapist.pricing,
            pricingType: typeof therapist.pricing
        });

        // Try new separate fields first - but only if they have valid values
        const hasValidSeparateFields = (
            (therapist.price60 && parseInt(therapist.price60) > 0) ||
            (therapist.price90 && parseInt(therapist.price90) > 0) ||
            (therapist.price120 && parseInt(therapist.price120) > 0)
        );

        if (hasValidSeparateFields) {
            const result = {
                '60': therapist.price60 ? parseInt(therapist.price60) * 1000 : 0,
                '90': therapist.price90 ? parseInt(therapist.price90) * 1000 : 0,
                '120': therapist.price120 ? parseInt(therapist.price120) * 1000 : 0,
            };
            console.log('💰 Using separate price fields:', result);
            return result;
        }

        // Fallback to old JSON format
        try {
            const parsed = typeof therapist.pricing === 'string' 
                ? JSON.parse(therapist.pricing) 
                : therapist.pricing;
            const result = {
                '60': (parsed?.['60'] || 0) * 1000,
                '90': (parsed?.['90'] || 0) * 1000,
                '120': (parsed?.['120'] || 0) * 1000,
            };
            console.log('💰 Using pricing JSON:', { parsed, result });
            return result;
        } catch (error) {
            console.warn('💰 Failed to parse pricing, using defaults:', error);
            return { '60': 200000, '90': 300000, '120': 400000 };
        }
    };

    const pricing = getPricing();
    const displayRating = getDisplayRating(therapist.rating, therapist.reviewCount);
    const reviewCount = getDisplayReviewCount(therapist.reviewCount);
    const displayImage = (therapist as any).mainImage || getRandomTherapistImage(therapist.id.toString());
    
    // Check if discount is active
    const isDiscountActive = (therapist: Therapist): boolean => {
        if (!therapist.discountEndTime || !therapist.discountPercentage) return false;
        const endTime = new Date(therapist.discountEndTime);
        return endTime > new Date();
    };

    // Membership tier
    const membershipTier = (therapist as any).membershipTier || 'basic';
    
    // Status display - handle showcase profiles
    let displayStatus = therapist.status || 'Available';
    
    // Special handling for showcase profiles - they should always be busy outside of Yogyakarta
    if ((therapist as any).isShowcaseProfile) {
        displayStatus = 'Busy';
        console.log(`🎭 Showcase profile ${therapist.name} showing as Busy in ${(therapist as any).showcaseCity}`);
    }
    
    // Join date calculation
    const joinedDate = therapist.membershipStartDate ? new Date(therapist.membershipStartDate) : new Date();
    const monthsJoined = Math.floor((new Date().getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const joinedDisplay = `Joined ${monthsJoined}m ago`;

    // Bookings count from analytics
    let bookingsCount = 0;
    try {
        const analytics = therapist.analytics ? JSON.parse(therapist.analytics) : {};
        bookingsCount = analytics.bookings || 0;
    } catch (error) {
        bookingsCount = 0;
    }

    const handleShare = () => {
        // Track share action (viral growth metric)
        const shareData = {
            therapistId: therapist.id || (therapist as any).$id,
            action: 'profile_shared',
            source: 'shared_link_reshare',
            timestamp: new Date().toISOString()
        };
        console.log(`🔗 [Shared Link] Profile reshared:`, shareData);
        
        // Store for viral tracking
        const shares = JSON.parse(localStorage.getItem('shared_link_reshares') || '[]');
        shares.push(shareData);
        localStorage.setItem('shared_link_reshares', JSON.stringify(shares));
        
        const sharePayload = {
            title: `${therapist.name} - Professional Massage Therapist`,
            text: `Check out ${therapist.name}'s massage therapy services on IndaStreet!`,
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(sharePayload).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('Profile link copied to clipboard!');
            });
        }
    };

    // REMOVED: handleBookingSubmit - BookingPopup and ScheduleBookingPopup handle Appwrite submission internally

    const handleQuickChat = () => {
        // Track chat initiation from shared link
        const chatData = {
            therapistId: therapist.id || (therapist as any).$id,
            therapistName: therapist.name,
            timestamp: new Date().toISOString(),
            source: 'shared_link_chat',
            action: 'chat_initiated'
        };
        
        console.log(`💬 [Analytics] Chat initiated from shared link:`, chatData);
        
        // Store for analytics
        const chats = JSON.parse(localStorage.getItem('shared_link_chats') || '[]');
        chats.push(chatData);
        localStorage.setItem('shared_link_chats', JSON.stringify(chats));
        
        // Open chat for quick questions
        window.dispatchEvent(new CustomEvent('openChat', {
            detail: {
                therapistId: therapist.id || (therapist as any).$id,
                therapistName: therapist.name,
                therapistType: 'therapist',
                therapistStatus: therapist.status || 'available',
                pricing: getPricing(),
                profilePicture: (therapist as any).profilePicture || (therapist as any).mainImage,
                mode: 'inquiry',
                initialMessage: `Hi ${therapist.name}! I found your profile via your shared link and I'm interested in booking a massage session. Could you tell me about your availability?`
            }
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={onViewAllTherapists}
                        className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm">Browse All</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <img src="https://ik.imagekit.io/7grri5v7d/indastreet-logo.png" alt="IndaStreet" className="h-6" />
                        <span className="font-bold text-orange-600 text-sm">IndaStreet</span>
                    </div>
                    <button
                        onClick={handleShare}
                        className="p-2 text-gray-600 hover:text-orange-600 transition-colors"
                        title="Share this profile"
                    >
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            {/* Main Card - Exactly matching TherapistCard design */}
            <div className="max-w-md mx-auto p-4">
                <style>{`
                    @keyframes discountFade {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.3; }
                    }
                    .discount-fade {
                        background: linear-gradient(to right, rgb(249, 115, 22), rgb(234, 88, 12));
                        animation: discountFade 2s ease-in-out infinite;
                    }
                `}</style>

                {/* External meta bar */}
                <div className="flex justify-between items-center mb-2 px-2">
                    <span className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {joinedDisplay}
                    </span>
                    <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        🔗 Direct Link
                    </span>
                    <span className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Orders: {bookingsCount}
                    </span>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-visible relative transition-all duration-300">
                    {/* Main Image Banner */}
                    <div className="h-48 w-full overflow-visible relative rounded-t-xl">
                        <div className="absolute inset-0 rounded-t-xl overflow-hidden bg-gradient-to-r from-orange-400 to-orange-600">
                            <img 
                                key={displayImage}
                                src={displayImage.includes('?') ? `${displayImage}&t=${Date.now()}` : `${displayImage}?t=${Date.now()}`}
                                alt={`${therapist.name} cover`} 
                                className={`w-full h-full object-cover transition-all duration-500 ${isDiscountActive(therapist) ? 'brightness-110 contrast-110 saturate-110' : ''}`}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/7grri5v7d/hotel%20massage%20indoniseas.png?updatedAt=1761154913720';
                                }}
                            />
                        </div>

                        {/* Discount Badge */}
                        {isDiscountActive(therapist) && (
                            <div className="absolute top-3 right-3 z-30 flex flex-col items-end gap-2">
                                <div className="relative text-white font-bold text-lg px-5 py-2 rounded-full shadow-lg discount-fade">
                                    {therapist.discountPercentage}% OFF
                                </div>
                            </div>
                        )}
                        
                        {/* Profile Image */}
                        <div className="absolute top-36 left-4 z-20 overflow-visible">
                            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-xl relative aspect-square overflow-visible">
                                {(therapist as any).profilePicture && (therapist as any).profilePicture.includes('appwrite.io') ? (
                                    <img 
                                        key={(therapist as any).profilePicture}
                                        className="w-full h-full rounded-full object-cover aspect-square" 
                                        src={(therapist as any).profilePicture.includes('?') ? `${(therapist as any).profilePicture}&t=${Date.now()}` : `${(therapist as any).profilePicture}?t=${Date.now()}`}
                                        alt={`${therapist.name} profile`} 
                                        onError={(e) => {
                                            const imgElement = e.target as HTMLImageElement;
                                            imgElement.style.display = 'none';
                                            const placeholder = imgElement.parentElement?.querySelector('.profile-placeholder') as HTMLElement;
                                            if (placeholder) placeholder.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                
                                <div 
                                    className="profile-placeholder w-full h-full rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-600"
                                    style={{ 
                                        display: (therapist as any).profilePicture && (therapist as any).profilePicture.includes('appwrite.io') ? 'none' : 'flex',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {therapist.name ? therapist.name.charAt(0).toUpperCase() : '👤'}
                                </div>

                                {/* Verified Pro Rosette */}
                                {therapist.isVerified && (
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-500">
                                        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 1.5l2.19 4.44 4.9.71-3.54 3.45.83 4.86L10 12.9l-4.38 2.33.83-4.86L2.91 6.65l4.9-.71L10 1.5zm-1.2 9.09l-1.6-1.6a.75.75 0 10-1.06 1.06l2.13 2.13a.75.75 0 001.06 0l4.13-4.13a.75.75 0 10-1.06-1.06l-3.6 3.6z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                )}
                                
                                {/* Star Rating Badge */}
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-white rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5 z-30">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="#eab308">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="font-bold text-gray-900 text-base">{formatRating(displayRating)}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Share Button */}
                        <button
                            onClick={handleShare}
                            className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-200 group z-30"
                            title="Share this therapist"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>
                    </div>

                    {/* Card Content */}
                    <div className="px-4 pt-16 pb-4 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate mb-2">{therapist.name}</h3>
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                                    displayStatus === 'Available' ? 'bg-green-100 text-green-800' :
                                    displayStatus === 'Busy' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    <span className="relative mr-1.5">
                                        <span className={`w-2 h-2 rounded-full block relative ${
                                            displayStatus === 'Available' ? 'bg-green-500' :
                                            displayStatus === 'Busy' ? 'bg-yellow-500' :
                                            'bg-gray-400'
                                        }`}></span>
                                    </span>
                                    {displayStatus}
                                </div>
                            </div>
                            
                            <div className="flex-shrink-0">
                                {userLocation && (
                                    <DistanceDisplay 
                                        providerLocation={{
                                            lat: parseFloat(therapist.latitude || '0'),
                                            lng: parseFloat(therapist.longitude || '0')
                                        }}
                                        userLocation={userLocation}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>⭐ {formatRating(displayRating)}</span>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="grid grid-cols-3 gap-2 text-center">
                                {Object.entries(pricing).map(([duration, price]) => (
                                    <div key={duration} className="bg-white rounded-md p-2">
                                        <div className="text-xs text-gray-500 mb-1">{duration} min</div>
                                        <div className="font-semibold text-sm">{formatPrice(price)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Primary Booking Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={() => setShowBookingPopup(true)}
                                disabled={displayStatus !== 'Available'}
                                className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-lg ${
                                    displayStatus === 'Available' 
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-xl hover:scale-105' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                <Calendar size={24} />
                                <span>{displayStatus === 'Available' ? '📅 Book Now - Immediate' : `Currently ${displayStatus}`}</span>
                            </button>
                            
                            <button
                                onClick={() => setShowScheduleBookingPopup(true)}
                                className="w-full py-3 px-6 rounded-lg font-medium text-lg flex items-center justify-center gap-3 transition-all duration-200 bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg"
                            >
                                <Clock size={20} />
                                <span>🗓️ Schedule for Later</span>
                            </button>
                        </div>

                        {/* Secondary Actions */}
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <button
                                onClick={handleQuickChat}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <MessageCircle size={18} />
                                <span>💬 Chat Now</span>
                            </button>
                            
                            <button
                                onClick={() => {                                    // Track phone click (same as main app)
                                    const phoneClickData = {
                                        therapistId: therapist.id || (therapist as any).$id,
                                        therapistName: therapist.name,
                                        action: 'phone_click',
                                        source: 'shared_link',
                                        timestamp: new Date().toISOString()
                                    };
                                    console.log(`📞 [Shared Link] Phone click tracked:`, phoneClickData);
                                    
                                    // Store for analytics (same as main app)
                                    const phoneClicks = JSON.parse(localStorage.getItem('shared_link_phone_clicks') || '[]');
                                    phoneClicks.push(phoneClickData);
                                    localStorage.setItem('shared_link_phone_clicks', JSON.stringify(phoneClicks));
                                    
                                    // TODO: Increment analytics (same endpoint as main app)
                                    // await analyticsService.incrementAnalytics(therapist.id, 'phone_clicks', { source: 'shared_link' });
                                    
                                    const phoneNumber = therapist.phoneNumber;
                                    if (phoneNumber) {
                                        window.location.href = `tel:${phoneNumber}`;
                                    }
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <Phone size={18} />
                                <span>📞 Call</span>
                            </button>
                        </div>
                    
                        <p className="text-sm text-gray-600 mb-4">
                            🌟 <strong>{therapist.name}</strong> is one of <strong>500+</strong> professional therapists on IndaStreet
                        </p>
                    
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={onViewAllTherapists}
                                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-orange-600 font-medium py-3 px-4 rounded-lg border border-orange-200 transition-colors"
                            >
                                <ExternalLink size={16} />
                                <span className="text-sm">Browse All Therapists</span>
                            </button>
                        
                            <button
                                onClick={() => {
                                    // Track referral click for SEO
                                    console.log(`🔗 Referral link clicked from ${therapist.name}'s shared profile`);
                                    window.open('https://indastreet.com', '_blank');
                                }}
                                className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                            >
                                <Star size={16} />
                                <span className="text-sm">Join IndaStreet</span>
                            </button>
                        </div>
                    
                        <p className="text-xs text-gray-500 mt-3">
                            Professional massage therapy • Verified therapists • Secure booking
                        </p>
                    </div>
                </div>
            </div>

            {/* Original Booking Popup */}
            {showBookingPopup && (
                <BookingPopup
                    isOpen={showBookingPopup}
                    onClose={() => setShowBookingPopup(false)}
                    therapistId={String(therapist.id || (therapist as any).$id)}
                    therapistName={therapist.name}
                    profilePicture={(therapist as any).profilePicture || (therapist as any).mainImage}
                    providerType="therapist"
                    pricing={{
                        "60": pricing['60'],
                        "90": pricing['90'],
                        "120": pricing['120']
                    }}
                    discountPercentage={0}
                    discountActive={false}
                />
            )}

            {/* Schedule Booking Popup */}
            {showScheduleBookingPopup && (
                <ScheduleBookingPopup
                    isOpen={showScheduleBookingPopup}
                    onClose={() => setShowScheduleBookingPopup(false)}
                    therapistId={String(therapist.id || (therapist as any).$id)}
                    therapistName={therapist.name}
                    therapistType="therapist"
                    profilePicture={(therapist as any).profilePicture || (therapist as any).mainImage}
                    pricing={{
                        "60": pricing['60'],
                        "90": pricing['90'],
                        "120": pricing['120']
                    }}
                    discountPercentage={0}
                    discountActive={false}
                />
            )}
        </div>
    );
};

export default SharedTherapistProfile;
