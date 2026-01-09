import React from 'react';
import { X, Clock, FileText } from 'lucide-react';
import type { Therapist } from '../../types';
import { getRandomTherapistImage } from '../../utils/therapistImageUtils';
import { getDisplayRating, getDisplayReviewCount, formatRating } from '../../utils/ratingUtils';
import { isDiscountActive } from '../../utils/therapistCardHelpers';
import { StarIcon } from './TherapistIcons';
import AnonymousReviewModal from '../AnonymousReviewModal';
// REMOVED: BookingConfirmationPopup - using original booking system
// REMOVED: BookingFormPopup - using original booking system
import SocialSharePopup from '../SocialSharePopup';
import { generateShareableURL } from '../../utils/seoSlugGenerator';

interface TherapistCardModalsProps {
    therapist: Therapist;
    showReviewModal: boolean;
    showLoginRequiredModal: boolean;
    showBookingConfirmation: boolean;
    showBookingForm: boolean;
    showPriceListModal: boolean;
    showSharePopup: boolean;
    onCloseReviewModal: () => void;
    onCloseLoginModal: () => void;
    onCloseBookingConfirmation: () => void;
    onCloseBookingForm: () => void;
    onClosePriceList: () => void;
    onCloseShare: () => void;
    onSubmitReview: (reviewData: { name: string; whatsappNumber: string; rating: number; providerId: string | number; providerType: 'therapist' | 'place' }) => Promise<void>;
    onConfirmedBooking: () => void;
    onSubmitBookingForm: (data: BookingData) => Promise<void>;
    onShowRegisterPrompt?: () => void;
    pricing: { '60': number; '90': number; '120': number };
    currentLanguage: 'en' | 'id';
    chatLang: string;
    menuData: any[];
    selectedServiceIndex: number | null;
    selectedDuration: '60' | '90' | '120' | null;
    highlightedCell: {serviceIndex: number, duration: '60' | '90' | '120'} | null;
    arrivalCountdown: number;
    displayStatus: string;
    onSelectService: (index: number, duration: '60' | '90' | '120') => void;
    formatCountdown: (seconds: number) => string;
    getPricing: () => { '60': number; '90': number; '120': number };
}

const TherapistCardModals: React.FC<TherapistCardModalsProps> = ({
    therapist,
    showReviewModal,
    showLoginRequiredModal,
    showBookingConfirmation,
    showBookingForm,
    showPriceListModal,
    showSharePopup,
    onCloseReviewModal,
    onCloseLoginModal,
    onCloseBookingConfirmation,
    onCloseBookingForm,
    onClosePriceList,
    onCloseShare,
    onSubmitReview,
    onConfirmedBooking,
    onSubmitBookingForm,
    onShowRegisterPrompt,
    pricing,
    currentLanguage,
    chatLang,
    menuData,
    selectedServiceIndex,
    selectedDuration,
    highlightedCell,
    arrivalCountdown,
    displayStatus,
    onSelectService,
    formatCountdown,
    getPricing
}) => {
    return (
        <>
            {/* Anonymous Review Modal */}
            {showReviewModal && (
                <AnonymousReviewModal
                    providerName={therapist.name}
                    providerId={therapist.$id || therapist.id}
                    providerType="therapist"
                    providerImage={therapist.profilePicture || (therapist as any).mainImage || getRandomTherapistImage(therapist.id.toString())}
                    onClose={onCloseReviewModal}
                    onSubmit={onSubmitReview}
                />
            )}

            {/* Login Required Modal */}
            {showLoginRequiredModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onCloseLoginModal}>
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Login Required</h3>
                            <p className="text-sm text-gray-600 mb-4">You must be logged into a registered account to leave a review.</p>
                            
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        onCloseLoginModal();
                                        if (onShowRegisterPrompt) {
                                            onShowRegisterPrompt();
                                        }
                                    }}
                                    className="w-full px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors text-sm"
                                >
                                    Login / Sign Up
                                </button>
                                <button
                                    onClick={onCloseLoginModal}
                                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* REMOVED: BookingConfirmationPopup and BookingFormPopup - using original BookingPopup and ScheduleBookingPopup system */}

            {/* Price List Bottom Sheet Slider */}
            {showPriceListModal && (
                <div 
                    className="fixed inset-0 z-[9999] bg-black bg-opacity-50 transition-opacity duration-300"
                    onClick={onClosePriceList}
                >
                    <div 
                        className="absolute bottom-0 left-0 right-0 h-full w-full bg-white transform transition-transform duration-300 ease-out"
                        style={{ animation: 'slideUp 0.3s ease-out forwards' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <style>{`
                            @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                            @keyframes slideDown { from { transform: translateY(0); } to { transform: translateY(100%); } }
                        `}</style>
                        
                        {/* Header with Profile */}
                        <div className="px-4 py-2.5 flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600">
                            <div className="flex items-center gap-2.5 flex-1">
                                <img
                                    src={(therapist as any).profilePicture || therapist.mainImage || '/default-avatar.jpg'}
                                    alt={therapist.name}
                                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.jpg'; }}
                                />
                                <div>
                                    <h4 className="font-bold text-sm text-white">{therapist.name}</h4>
                                    <div className="flex items-center gap-1 text-xs">
                                        <StarIcon className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                                        <span className="font-bold text-black bg-white/90 rounded px-1.5 py-0.5 shadow-sm">{getDisplayRating(therapist.rating, therapist.reviewCount)}</span>
                                        <span className="text-orange-100">({getDisplayReviewCount(therapist.reviewCount)})</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClosePriceList} className="flex items-center justify-center w-8 h-8 bg-black hover:bg-gray-800 rounded-full transition-colors" aria-label="Close">
                                <X className="h-5 w-5 text-white" />
                            </button>
                        </div>

                        {/* Section Header */}
                        <div className="bg-white px-4 pt-3 pb-2">
                            <h3 className="text-left text-gray-800 font-semibold text-sm">
                                {chatLang === 'id' ? 'Layanan Yang Disediakan' : 'Services Provided'}
                            </h3>
                        </div>

                        {/* Pricing Header Row */}
                        <div className="px-4 py-2 flex items-center justify-between">
                            <div className="text-sm sm:text-base font-bold text-gray-900">Service Prices</div>
                            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-orange-800 font-semibold">
                                <span className="hidden sm:inline">Estimated Arrival • ~1 hour</span>
                                <span className="sm:hidden">Estimated Arrival • ~1h</span>
                                <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                                    {formatCountdown(arrivalCountdown)}
                                </span>
                            </div>
                        </div>

                        {/* Booking Arrival Time */}
                        <div className="px-4 py-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-orange-600" />
                                    <span className="text-xs text-gray-700 font-medium">
                                        {chatLang === 'id' ? 'Pesan Sekarang Waktu Kedatangan' : 'Book Now Arrival Time'} 
                                        <span className="text-orange-600 font-semibold ml-1">1 {chatLang === 'id' ? 'Jam' : 'Hour'}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-bold text-orange-600 tabular-nums">{formatCountdown(arrivalCountdown)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Price List Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4" style={{ height: 'calc(100vh - 180px)' }}>
                            {menuData.length > 0 ? (
                                <div className="bg-white rounded-lg border border-orange-200 overflow-hidden shadow-lg">
                                    <div className="grid grid-cols-12 gap-1.5 bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-2 text-xs font-semibold text-orange-700 border-b border-orange-200">
                                        <div className="col-span-3">Service</div>
                                        <div className="col-span-2 text-center">60 Min</div>
                                        <div className="col-span-2 text-center">90 Min</div>
                                        <div className="col-span-2 text-center">120 Min</div>
                                        <div className="col-span-3 text-center">Action</div>
                                    </div>
                                    
                                    <div className="divide-y divide-orange-100">
                                        {menuData.map((service: any, index: number) => {
                                            const isRowSelected = selectedServiceIndex === index;
                                            return (
                                                <div key={index} className={`grid grid-cols-12 gap-1.5 px-3 py-3 transition-colors items-center bg-white ${
                                                    isRowSelected ? 'border-l-4 border-orange-500 bg-orange-50' : 'hover:bg-orange-50'
                                                }`}>
                                                    <div className="col-span-3">
                                                        <div className="font-medium text-gray-900 text-sm">{service.serviceName}</div>
                                                    </div>
                                                    
                                                    {/* Duration buttons - wider containers for better price display */}
                                                    {['60', '90', '120'].map((duration) => (
                                                        <div key={duration} className="col-span-2 flex flex-col items-center gap-1">
                                                            {service[`price${duration}`] ? (
                                                                <button
                                                                    onClick={() => onSelectService(index, duration as '60' | '90' | '120')}
                                                                    className={`w-full px-1.5 py-1.5 rounded text-xs transition-all border-2 min-w-0 ${
                                                                        isRowSelected && selectedDuration === duration
                                                                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold border-transparent shadow-lg'
                                                                            : 'bg-white text-gray-800 border-orange-200 hover:border-orange-400 hover:bg-orange-50'
                                                                    }`}
                                                                >
                                                                    <span className="block text-[10px] leading-tight whitespace-nowrap">
                                                                        Rp {(Number(service[`price${duration}`]) * 1000).toLocaleString('id-ID')}
                                                                    </span>
                                                                </button>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">-</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                    
                                                    <div className="col-span-3 flex justify-center">
                                                        <button
                                                            onClick={(e) => {
                                                                if (!isRowSelected || !selectedDuration) {
                                                                    alert(chatLang === 'id' ? 'Silakan pilih durasi terlebih dahulu' : 'Please select a duration first');
                                                                    return;
                                                                }
                                                                const selectedPrice = service[`price${selectedDuration}`];
                                                                setTimeout(() => onClosePriceList(), 200);
                                                                
                                                                const normalizedStatus = displayStatus.toLowerCase() as 'available' | 'busy' | 'offline';
                                                                window.dispatchEvent(new CustomEvent('openChat', {
                                                                    detail: {
                                                                        therapistId: typeof therapist.id === 'string' ? therapist.id : therapist.id?.toString(),
                                                                        therapistName: therapist.name,
                                                                        therapistType: 'therapist',
                                                                        therapistStatus: normalizedStatus,
                                                                        pricing: getPricing(),
                                                                        profilePicture: (therapist as any).profilePicture || (therapist as any).mainImage,
                                                                        providerRating: getDisplayRating(therapist.rating, therapist.reviewCount),
                                                                        discountPercentage: therapist.discountPercentage || 0,
                                                                        discountActive: isDiscountActive(therapist),
                                                                        mode: 'immediate',
                                                                        selectedService: {
                                                                            name: service.serviceName,
                                                                            duration: selectedDuration,
                                                                            price: Number(selectedPrice) * 1000
                                                                        }
                                                                    }
                                                                }));
                                                            }}
                                                            disabled={!isRowSelected || !selectedDuration}
                                                            className={`px-3 py-1 text-xs rounded transition-colors ${
                                                                isRowSelected && selectedDuration
                                                                    ? 'bg-orange-600 text-white hover:bg-orange-700 cursor-pointer'
                                                                    : 'bg-orange-500 text-white hover:bg-orange-600 cursor-not-allowed opacity-60'
                                                            }`}
                                                        >
                                                            {chatLang === 'id' ? 'Pesan Sekarang' : 'Book Now'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FileText size={48} className="mx-auto mb-3 text-orange-200" />
                                    <p className="text-gray-600">{chatLang === 'id' ? 'Memuat menu harga...' : 'Loading price menu...'}</p>
                                </div>
                            )}
                        </div>
                        
                    </div>
                </div>
            )}

            {/* Social Share Popup */}
            <SocialSharePopup
                isOpen={showSharePopup}
                onClose={onCloseShare}
                title={therapist.name}
                description={`Check out ${therapist.name} on IndaStreet! Amazing massage therapist offering professional services.`}
                url={generateShareableURL(therapist)}
                type="therapist"
            />
        </>
    );
};

export default TherapistCardModals;
