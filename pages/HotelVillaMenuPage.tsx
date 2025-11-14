import React, { useState, useEffect, useMemo } from 'react';
import type { Therapist, Place, Booking } from '../types';
import { HotelVillaServiceStatus } from '../types';
import type { Page } from '../types/pageTypes';
import PlaceCard from '../components/PlaceCard';
import TherapistCard from '../components/TherapistCard';
import ScheduleBookingPopup from '../components/ScheduleBookingPopup';
import { getRandomTherapistImageRandom } from '../utils/therapistImageUtils';
import { useTranslations } from '../lib/useTranslations';
import { Share, MessageCircle, Mail, Copy, ExternalLink } from 'lucide-react';

interface HotelVillaMenuPageProps {
    venueId: string;
    venueName: string;
    venueType?: 'hotel' | 'villa'; // Add venue type for proper booking flow
    therapists: Therapist[];
    places: Place[];
    language?: string;
    _onBook?: (provider: Therapist | Place, type: 'therapist' | 'place') => void;
    _onBookingSubmit?: (bookingData: Partial<Booking>) => Promise<void>;
    setPage?: (page: Page) => void;
    onBackToDashboard?: () => void; // New prop for back to dashboard functionality
}

const HotelVillaMenuPage: React.FC<HotelVillaMenuPageProps> = ({ 
    venueId,
    venueName,
    venueType = 'hotel', // Default to hotel if not specified
    therapists, 
    places,
    language: propLanguage = 'en',
    _onBook,
    _onBookingSubmit,
    onBackToDashboard
}) => {
    const [activeTab, setActiveTab] = useState<'therapists' | 'places'>('therapists');
    const [loading, setLoading] = useState(true);
    const [showLandingPage, setShowLandingPage] = useState(true);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<Therapist | Place | null>(null);
    const [selectedProviderType, setSelectedProviderType] = useState<'therapist' | 'place'>('therapist');
    const [currentLanguage] = useState<'en' | 'id'>(propLanguage as 'en' | 'id');
    const [showShareModal, setShowShareModal] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');
    
    // Use translations with current language
    // Use translations with current language
    const { t } = useTranslations(currentLanguage);

    // Generate the live menu URL for sharing
    const liveMenuUrl = `${window.location.origin}/live-menu/${venueType}/${venueId}`;
    
    // Sharing functions
    const shareViaWhatsApp = () => {
        const message = `🏨 ${venueName} Live Massage Menu\n\n🔴 LIVE NOW: Room Service & Massage Places Available 24/7\n\n✨ View our live menu here: ${liveMenuUrl}\n\n#IndaStreet #MassageService #${venueType === 'hotel' ? 'Hotel' : 'Villa'}Service`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const shareViaEmail = () => {
        const subject = `${venueName} - Live Massage Menu Available Now`;
        const body = `Dear Guest,

Welcome to ${venueName}!

Our live massage menu is now available with room service and massage places open 24/7.

🔴 LIVE Menu: ${liveMenuUrl}

✨ Available Services:
• Professional Room Service Massage (1 hour arrival time)
• Nearby Massage Places with special ${venueType} discounts
• 24/7 availability for your convenience

Book directly through our live menu system.

Best regards,
${venueName} Team

Powered by IndaStreet`;
        
        const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoUrl, '_blank');
    };

    const shareViaFacebook = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(liveMenuUrl)}&quote=${encodeURIComponent(`🏨 ${venueName} Live Massage Menu - Room Service Available 24/7! Book now through IndaStreet.`)}`;
        window.open(facebookUrl, '_blank');
    };

    const shareViaTwitter = () => {
        const tweet = `🏨 ${venueName} Live Massage Menu is LIVE! 🔴\n\nRoom Service & Massage Places available 24/7 with special ${venueType} discounts.\n\n📱 Book now: ${liveMenuUrl}\n\n#IndaStreet #MassageService #${venueType === 'hotel' ? 'Hotel' : 'Villa'}Service`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
        window.open(twitterUrl, '_blank');
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(liveMenuUrl);
            setCopySuccess('✅ Link copied!');
            setTimeout(() => setCopySuccess(''), 3000);
        } catch (err) {
            setCopySuccess('❌ Failed to copy');
            setTimeout(() => setCopySuccess(''), 3000);
        }
    };

    // Render therapist content
    const renderTherapistContent = () => {
        if (liveTherapists.length > 0) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {liveTherapists.map((therapist) => (
                        <div key={therapist.id} className="relative">
                            <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                {therapist.hotelDiscount}% OFF
                            </div>
                            <TherapistCard
                                therapist={therapist}
                                onBook={(provider) => handleBookProvider(provider, 'therapist')}
                                onRate={() => {}}
                                onIncrementAnalytics={() => {}}
                                t={t}
                            />
                        </div>
                    ))}
                </div>
            );
        }
        
        return (
            <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">💆‍♂️</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Room Massage Available
                </h3>
                <p className="text-gray-500">
                    Check back later for available therapists
                </p>
            </div>
        );
    };

    // Render place content
    const renderPlaceContent = () => {
        if (livePlaces.length > 0) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {livePlaces.map((place) => (
                        <div key={place.id} className="relative">
                            <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                {place.hotelDiscount}% OFF
                            </div>
                            <PlaceCard
                                place={place}
                                onClick={() => handleBookProvider(place, 'place')}
                                onRate={() => {}}
                            />
                        </div>
                    ))}
                </div>
            );
        }
        
        return (
            <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">🏢</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Massage Places Available
                </h3>
                <p className="text-gray-500">
                    Check back later for available places
                </p>
            </div>
        );
    };

    // Handle booking modal opening
    const handleBookProvider = (provider: Therapist | Place, type: 'therapist' | 'place') => {
        setSelectedProvider(provider);
        setSelectedProviderType(type);
        setShowBookingModal(true);
    };

    // Note: Booking submission now handled by ScheduleBookingPopup with accept links and status management

    useEffect(() => {
        // Minimal loading simulation
        setLoading(false);
    }, [venueId]);

    // Filter providers that have opted into hotel services with discounts
    const liveTherapists = useMemo(() => {
        return therapists
            .filter(therapist => 
                therapist.hotelVillaServiceStatus === HotelVillaServiceStatus.OptedIn && 
                (therapist.hotelDiscount || 0) > 0
            )
            .map(therapist => ({
                ...therapist,
                mainImage: (therapist as any).mainImage || getRandomTherapistImageRandom()
            }));
    }, [therapists]);
    
    const livePlaces = useMemo(() => {
        return places.filter(place => 
            place.hotelVillaServiceStatus === HotelVillaServiceStatus.OptedIn && 
            (place.hotelDiscount || 0) > 0
        );
    }, [places]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading menu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {showLandingPage ? (
                <div 
                    className="min-h-screen bg-cover bg-center bg-no-repeat relative"
                    style={{
                        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20app%20back%20ground%20indastreets.png?updatedAt=1762389590920)'
                    }}
                >
                    <div className="absolute inset-0 bg-black/40"></div>
                    
                    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 text-center">
                        <div className="mb-8">
                            <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
                                <span className="text-white">Inda</span>
                                <span className="text-orange-400">Street</span>
                            </h1>
                            <h2 className="text-2xl md:text-3xl font-semibold text-orange-100 mb-2">
                                Live Massage Menu
                            </h2>
                            <p className="text-xl md:text-2xl font-medium text-orange-200">
                                Room Service Available 24/7
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => setShowLandingPage(false)}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                            >
                                View Live Menu
                            </button>
                            
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-3"
                            >
                                <Share className="w-5 h-5" />
                                Share Live Menu
                            </button>
                        </div>
                    </div>

                    {/* Floating Action Buttons - Bottom Position for Landing */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-4">
                        {/* Share Button */}
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="w-14 h-14 bg-orange-500/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-orange-500/30 transition-all duration-300 hover:scale-110 shadow-lg border border-orange-300/30"
                            title="Share Live Menu"
                        >
                            <Share className="w-6 h-6" />
                        </button>

                        {/* Back to Dashboard Button */}
                        {onBackToDashboard && (
                            <button
                                onClick={onBackToDashboard}
                                className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg"
                                title="Back to Dashboard"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="min-h-screen bg-gray-50 relative">

                    <div className="bg-white shadow-sm border-b">
                        <div className="flex items-center justify-between p-4">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-orange-500 shadow-lg flex-shrink-0">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/massage%20app%20back%20ground%20indastreets.png?updatedAt=1762389590920" 
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            
                            <div className="flex-1 ml-4">
                                <h1 className="text-xl font-bold text-gray-900">
                                    Live Massage Menu
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Room Service Available 24/7
                                </p>
                            </div>

                            {/* Share Button */}
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="ml-4 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center"
                                title="Share Live Menu"
                            >
                                <Share className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border-b">
                        <div className="flex bg-gray-200 rounded-full p-1 mx-4 my-4">
                            <button
                                onClick={() => setActiveTab('therapists')}
                                className={`w-1/2 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-300 ${
                                    activeTab === 'therapists'
                                        ? 'bg-orange-500 text-white shadow'
                                        : 'text-gray-600'
                                }`}
                            >
                                Room Service
                            </button>
                            <button
                                onClick={() => setActiveTab('places')}
                                className={`w-1/2 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-300 ${
                                    activeTab === 'places'
                                        ? 'bg-orange-500 text-white shadow'
                                        : 'text-gray-600'
                                }`}
                            >
                                Massage Places
                            </button>
                        </div>
                        <div className="text-center pb-4">
                            <p className="text-sm text-gray-600 font-medium">
                                Allow 1 Hour For Therapist To Arrive
                            </p>
                        </div>
                    </div>

                    <div className="p-4 pb-20">
                        {activeTab === 'therapists' ? renderTherapistContent() : renderPlaceContent()}
                    </div>

                    {/* Floating Action Buttons - Bottom Position */}
                    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-4">
                        {/* Share Button */}
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-110 shadow-lg"
                            title="Share Live Menu"
                        >
                            <Share className="w-6 h-6" />
                        </button>

                        {/* Back to Dashboard Button */}
                        {onBackToDashboard && (
                            <button
                                onClick={onBackToDashboard}
                                className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-all duration-300 hover:scale-110 shadow-lg"
                                title="Back to Dashboard"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Share Modal - Static Non-Scrolling Container */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm h-fit flex flex-col transform transition-all overflow-hidden">
                        {/* Header with Orange Gradient - Fixed Height */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-t-2xl flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Share Live Menu</h3>
                                    <p className="text-orange-100 text-sm">Share with your guests</p>
                                </div>
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="text-white hover:text-orange-100 transition-colors p-2 rounded-full hover:bg-white/10"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content Area - Static No Scroll */}
                        <div className="p-4 flex flex-col">
                            <div>
                                {/* Venue Info Card */}
                                <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border-l-4 border-orange-500">
                                    <h4 className="font-semibold text-orange-900 mb-1 flex items-center gap-2">
                                        🏨 {venueName}
                                    </h4>
                                    <p className="text-sm text-orange-700">Live Massage Menu - Available 24/7</p>
                                </div>

                                {/* Sharing Options - Compact Layout */}
                                <div className="space-y-2 mb-4">
                                    {/* WhatsApp Share */}
                                    <button
                                        onClick={shareViaWhatsApp}
                                        className="w-full flex items-center gap-3 p-2.5 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-150 rounded-lg transition-all duration-200 border border-green-200"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                                            <MessageCircle className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-semibold text-green-800 text-sm">WhatsApp</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-green-600" />
                                    </button>

                                    {/* Email Share */}
                                    <button
                                        onClick={shareViaEmail}
                                        className="w-full flex items-center gap-3 p-2.5 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-150 rounded-lg transition-all duration-200 border border-orange-200"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                                            <Mail className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-semibold text-orange-800 text-sm">Email</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-orange-600" />
                                    </button>

                                    {/* Social Media Row */}
                                    <div className="flex gap-2">
                                        {/* Facebook Share */}
                                        <button
                                            onClick={shareViaFacebook}
                                            className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 rounded-lg transition-all duration-200 border border-blue-200"
                                        >
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                                </svg>
                                            </div>
                                            <span className="font-semibold text-blue-800 text-sm">Facebook</span>
                                        </button>

                                        {/* Twitter Share */}
                                        <button
                                            onClick={shareViaTwitter}
                                            className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-gradient-to-r from-sky-50 to-sky-100 hover:from-sky-100 hover:to-sky-150 rounded-lg transition-all duration-200 border border-sky-200"
                                        >
                                            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                                </svg>
                                            </div>
                                            <span className="font-semibold text-sky-800 text-sm">Twitter</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Copy Link Section - Compact */}
                            <div className="border-t border-orange-100 pt-3 mt-3">
                                <p className="text-sm text-orange-600 mb-2 font-medium">📋 Copy direct link:</p>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-orange-50 border border-orange-200 rounded-lg p-2 text-xs text-orange-800 font-mono truncate">
                                        {liveMenuUrl}
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1 font-medium"
                                    >
                                        <Copy className="w-3 h-3" />
                                        <span className="text-sm">Copy</span>
                                    </button>
                                </div>
                                {copySuccess && (
                                    <p className="text-xs text-green-600 mt-1 font-medium">{copySuccess}</p>
                                )}
                            </div>

                            {/* Close Button - Compact */}
                            <div className="mt-4 pt-3 border-t border-orange-100">
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium py-2 rounded-lg transition-colors text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Booking Modal with Accept Links */}
            {showBookingModal && selectedProvider && (
                <ScheduleBookingPopup
                    isOpen={showBookingModal}
                    onClose={() => {
                        setShowBookingModal(false);
                        setSelectedProvider(null);
                    }}
                    therapistId={selectedProvider.id?.toString() || ''}
                    therapistName={selectedProvider.name}
                    therapistType={selectedProviderType}
                    profilePicture={selectedProvider.profilePicture || selectedProvider.mainImage}
                    hotelVillaId={venueId}
                    hotelVillaName={venueName}
                    hotelVillaType={venueType}
                />
            )}
        </div>
    );
};

export default HotelVillaMenuPage;