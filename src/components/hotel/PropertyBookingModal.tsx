// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React from 'react';
import { X, Star } from 'lucide-react';

type DurationKey = '60' | '90' | '120';
type ProviderType = 'therapist' | 'place';

interface ProviderCard {
    id: string | number;
    name: string;
    type: ProviderType;
    image: string;
    location: string;
    rating: number;
    reviewCount: number;
    pricing: Record<DurationKey, number>;
    discount: number;
    whatsappNumber?: string;
    description: string;
    massageTypes: string[];
    status?: 'Available' | 'Busy' | 'Offline';
    languages?: string[];
}

interface PropertyBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProvider: ProviderCard | null;
    selectedDuration: DurationKey;
    onDurationChange: (duration: DurationKey) => void;
    guestName: string;
    onGuestNameChange: (name: string) => void;
    roomNumber: string;
    onRoomNumberChange: (room: string) => void;
    onProceedBooking: () => void;
    isProcessing: boolean;
    bookingConfirmed: boolean;
    bookingId: string;
    bookingTime: string;
    onCloseBookingModal: () => void;
}

const PropertyBookingModal: React.FC<PropertyBookingModalProps> = ({
    isOpen,
    onClose,
    selectedProvider,
    selectedDuration,
    onDurationChange,
    guestName,
    onGuestNameChange,
    roomNumber,
    onRoomNumberChange,
    onProceedBooking,
    isProcessing,
    bookingConfirmed,
    bookingId,
    bookingTime,
    onCloseBookingModal
}) => {
    if (!isOpen || !selectedProvider) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] ">
                {!bookingConfirmed ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Book Massage</h2>
                                <button 
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Provider Info */}
                            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                <img 
                                    src={selectedProvider.image} 
                                    alt={selectedProvider.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900">{selectedProvider.name}</h3>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/>
                                        <span className="text-sm font-medium text-gray-700">{selectedProvider.rating.toFixed(1)}</span>
                                        <span className="text-xs text-gray-500">({selectedProvider.reviewCount})</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{selectedProvider.location}</p>
                                </div>
                            </div>

                            {/* Duration Selection */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Duration</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['60', '90', '120'] as DurationKey[]).map((duration) => (
                                        <button
                                            key={duration}
                                            onClick={() => onDurationChange(duration)}
                                            className={`p-3 rounded-lg border-2 transition-colors text-center ${
                                                selectedDuration === duration
                                                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                    : 'border-gray-200 hover:border-orange-300'
                                            }`}
                                        >
                                            <div className="text-sm font-semibold">{duration} min</div>
                                            <div className="text-xs text-gray-600">
                                                Rp {(selectedProvider.pricing[duration] / 1000).toFixed(0)}K
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Selected Service Summary */}
                            <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600">Duration</p>
                                        <p className="font-bold text-lg text-orange-600">{selectedDuration} minutes</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Price</p>
                                        <p className="font-bold text-lg text-orange-600">
                                            Rp {(selectedProvider.pricing[selectedDuration] / 1000).toFixed(0)}K
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Guest Information Form */}
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Guest Name
                                    </label>
                                    <input 
                                        type="text"
                                        value={guestName}
                                        onChange={(e) => onGuestNameChange(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Room Number
                                    </label>
                                    <input 
                                        type="text"
                                        value={roomNumber}
                                        onChange={(e) => onRoomNumberChange(e.target.value)}
                                        placeholder="Enter your room number"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Proceed Button */}
                            <button 
                                onClick={onProceedBooking}
                                disabled={!guestName || !roomNumber || isProcessing}
                                className="w-full bg-orange-500 text-white font-bold py-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    'Proceed'
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Confirmation Screen */}
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Massage Booked Successfully!
                            </h2>
                            
                            <p className="text-gray-600 mb-6">
                                Your massage therapist will arrive at your room shortly.
                            </p>

                            {/* Booking Details */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                                    <span className="text-sm text-gray-600">Booking ID:</span>
                                    <span className="font-bold text-gray-900">{bookingId}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Booking Time:</span>
                                    <span className="font-semibold text-gray-900 text-sm">{bookingTime}</span>
                                </div>
                            </div>

                            <button 
                                onClick={onCloseBookingModal}
                                className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PropertyBookingModal;