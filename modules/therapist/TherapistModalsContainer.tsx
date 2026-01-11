import React from 'react';
import type { Therapist } from '../../types';
import AnonymousReviewModal from '../AnonymousReviewModal';
import BookingPopup from '../BookingPopup';
import ScheduleBookingPopup from '../ScheduleBookingPopup';
import SocialSharePopup from '../SocialSharePopup';
import TherapistJoinPopup from '../TherapistJoinPopup';
import { AvailabilityStatus } from '../../types';
import { isDiscountActive } from '../../utils/therapistCardHelpers';

interface TherapistModalsContainerProps {
    therapist: Therapist;
    showReviewModal: boolean;
    setShowReviewModal: (show: boolean) => void;
    showBusyModal: boolean;
    setShowBusyModal: (show: boolean) => void;
    showReferModal: boolean;
    setShowReferModal: (show: boolean) => void;
    showBookingPopup: boolean;
    setShowBookingPopup: (show: boolean) => void;
    showScheduleBookingPopup: boolean;
    setShowScheduleBookingPopup: (show: boolean) => void;
    showSharePopup: boolean;
    setShowSharePopup: (show: boolean) => void;
    showJoinPopup: boolean;
    setShowJoinPopup: (show: boolean) => void;
    pricing: { '60': number; '90': number; '120': number };
    displayRating: string;
    effectiveRating: number;
    displayStatus: AvailabilityStatus;
    selectedDuration: '60' | '90' | '120' | null;
    priceSliderBookingSource: string;
    setPriceSliderBookingSource: (source: string) => void;
    userReferralCode: string;
    shortShareUrl: string;
    handleAnonymousReviewSubmit: (reviewData: {
        name: string;
        whatsappNumber: string;
        rating: number;
        providerId: string | number;
        providerType: 'therapist' | 'place';
    }) => Promise<void>;
}

const TherapistModalsContainer: React.FC<TherapistModalsContainerProps> = ({
    therapist,
    showReviewModal,
    setShowReviewModal,
    showBusyModal,
    setShowBusyModal,
    showReferModal,
    setShowReferModal,
    showBookingPopup,
    setShowBookingPopup,
    showScheduleBookingPopup,
    setShowScheduleBookingPopup,
    showSharePopup,
    setShowSharePopup,
    showJoinPopup,
    setShowJoinPopup,
    pricing,
    displayRating,
    effectiveRating,
    displayStatus,
    selectedDuration,
    priceSliderBookingSource,
    setPriceSliderBookingSource,
    userReferralCode,
    shortShareUrl,
    handleAnonymousReviewSubmit
}) => {
    console.log('🧱 TherapistModalsContainer rendered');

    // Helper function to generate shareable URL
    const generateShareableURL = (therapist: Therapist) => {
        const baseUrl = window.location.origin;
        const therapistId = therapist.$id || therapist.id;
        return `${baseUrl}/share/therapist/${therapistId}`;
    };

    return (
        <>
            {/* Busy Therapist Confirmation Modal */}
            {showBusyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fadeIn">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">⏳</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Therapist Currently Busy</h3>
                            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                This therapist is currently booked and unavailable. Please try booking another available therapist or check back later.
                            </p>
                            <p className="text-sm font-semibold text-orange-600 mb-6">- <span className="text-black">Inda</span><span className="text-orange-500">street</span> Admin</p>
                            
                            <button
                                onClick={() => setShowBusyModal(false)}
                                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Refer Friend Modal */}
            {showReferModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowReferModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-[88vw] max-h-[80vh] sm:max-w-xs md:max-w-sm p-3 sm:p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3 sm:mb-4">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/refer%20a%20friend.png"
                                    alt="Refer a Friend"
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                    decoding="async"
                                    width="128"
                                    height="128"
                                />
                            </div>
                            
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Refer a Friend</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Share IndaStreet with friends! 🎁</p>
                            
                            <div className="space-y-2 mb-3 sm:mb-4">
                                <p className="text-xs text-gray-600 text-left">
                                    📱 Share your referral link:
                                </p>
                                <div className="flex gap-1">
                                    <input 
                                        type="text" 
                                        value={userReferralCode ? `https://www.indastreetmassage.com/ref/${userReferralCode}` : 'Loading...'} 
                                        readOnly 
                                        className="flex-1 px-2 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-gray-50 text-xs"
                                        placeholder="Your referral link"
                                        title="Your referral link to share with friends"
                                        aria-label="Referral link"
                                    />
                                    <button
                                        onClick={() => {
                                            const link = userReferralCode ? `https://www.indastreetmassage.com/ref/${userReferralCode}` : 'https://www.indastreetmassage.com';
                                            navigator.clipboard.writeText(link);
                                            alert('Link copied to clipboard!');
                                        }}
                                        className="px-3 py-1.5 sm:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-xs whitespace-nowrap"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-2 mb-3 sm:mb-4">
                                <p className="text-xs text-gray-600 mb-2">Share via:</p>
                                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                                    <button
                                        onClick={() => {
                                            const referralLink = userReferralCode ? `https://www.indastreetmassage.com/ref/${userReferralCode}` : 'https://www.indastreetmassage.com';
                                            const message = `Check out IndaStreet - Book amazing massages! 💆‍♀️ Use my referral link and we both earn coins! ${referralLink}`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                                        }}
                                        className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/whats%20app%20icon.png?updatedAt=1761844859402" 
                                            alt="WhatsApp"
                                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                            loading="lazy"
                                            decoding="async"
                                            width="40"
                                            height="40"
                                        />
                                        <span className="text-xs font-medium text-gray-700">WhatsApp</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const referralLink = userReferralCode ? `https://www.indastreetmassage.com/ref/${userReferralCode}` : 'https://www.indastreetmassage.com';
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
                                        }}
                                        className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/facebook.png?updatedAt=1761844676576" 
                                            alt="Facebook"
                                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                            loading="lazy"
                                            decoding="async"
                                            width="40"
                                            height="40"
                                        />
                                        <span className="text-xs font-medium text-gray-700">Facebook</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const referralLink = userReferralCode ? `https://www.indastreetmassage.com/ref/${userReferralCode}` : 'https://www.indastreetmassage.com';
                                            const message = `Check out IndaStreet - Book amazing massages! 💆‍♀️ ${referralLink}`;
                                            navigator.clipboard.writeText(message);
                                            alert('Instagram message copied! Open Instagram and paste to share.');
                                        }}
                                        className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/insta.png?updatedAt=1761845305146" 
                                            alt="Instagram"
                                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                            loading="lazy"
                                            decoding="async"
                                            width="40"
                                            height="40"
                                        />
                                        <span className="text-xs font-medium text-gray-700">Instagram</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const referralLink = userReferralCode ? `https://www.indastreetmassage.com/ref/${userReferralCode}` : 'https://www.indastreetmassage.com';
                                            const message = `Check out IndaStreet - Book amazing massages! 💆‍♀️ ${referralLink}`;
                                            navigator.clipboard.writeText(message);
                                            alert('TikTok message copied! Open TikTok and paste to share.');
                                        }}
                                        className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg transition-all hover:scale-105"
                                    >
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/tiktok.png?updatedAt=1761845101981" 
                                            alt="TikTok"
                                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                            loading="lazy"
                                            decoding="async"
                                            width="40"
                                            height="40"
                                        />
                                        <span className="text-xs font-medium text-gray-700">TikTok</span>
                                    </button>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setShowReferModal(false)}
                                className="w-full px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showReviewModal && (
                <AnonymousReviewModal
                    providerName={therapist.name}
                    providerId={therapist.$id || therapist.id}
                    providerType="therapist"
                    providerImage={(therapist as any).profilePicture || (therapist as any).mainImage}
                    onClose={() => setShowReviewModal(false)}
                    onSubmit={handleAnonymousReviewSubmit}
                />
            )}

            {showBookingPopup && (
                <BookingPopup
                    isOpen={showBookingPopup}
                    onClose={() => {
                        setShowBookingPopup(false);
                        setPriceSliderBookingSource('quick-book'); // Reset source
                    }}
                    therapistId={String(therapist.id)}
                    therapistName={therapist.name}
                    profilePicture={therapist.profilePicture || therapist.mainImage}
                    providerType="therapist"
                    pricing={{
                        "60": pricing["60"],
                        "90": pricing["90"],
                        "120": pricing["120"]
                    }}
                    discountPercentage={therapist.discountPercentage || 0}
                    discountActive={isDiscountActive(therapist)}
                    initialDuration={selectedDuration ? parseInt(selectedDuration) : undefined}
                    bookingSource={priceSliderBookingSource}
                />
            )}

            {showScheduleBookingPopup && (
                <ScheduleBookingPopup
                    isOpen={showScheduleBookingPopup}
                    onClose={() => setShowScheduleBookingPopup(false)}
                    therapistId={String(therapist.id)}
                    therapistName={therapist.name}
                    therapistType="therapist"
                    therapistStatus={displayStatus.toLowerCase() as 'available' | 'busy' | 'offline'}
                    profilePicture={therapist.profilePicture || therapist.mainImage}
                    isImmediateBooking={true}
                    pricing={{
                        "60": pricing["60"],
                        "90": pricing["90"],
                        "120": pricing["120"]
                    }}
                    providerRating={effectiveRating}
                    discountPercentage={therapist.discountPercentage || 0}
                    discountActive={isDiscountActive(therapist)}
                />
            )}

            {showSharePopup && (
                <SocialSharePopup
                    isOpen={showSharePopup}
                    onClose={() => {
                        console.log('🚪 Closing share popup');
                        setShowSharePopup(false);
                    }}
                    title={`Share My Profile`}
                    description={`${therapist.name} - Professional massage therapist in ${therapist.location}. Book now on IndaStreet!`}
                    url={(() => {
                        const finalUrl = userReferralCode && shortShareUrl ? 
                            `${shortShareUrl}?ref=${userReferralCode}` : 
                            (shortShareUrl || generateShareableURL(therapist));
                        console.log('🔗 Share popup URL:', finalUrl);
                        return finalUrl;
                    })()}
                    type="therapist"
                />
            )}

            {/* Therapist Join Popup */}
            <TherapistJoinPopup
                isOpen={showJoinPopup}
                onClose={() => setShowJoinPopup(false)}
            />
        </>
    );
};

export default TherapistModalsContainer;
