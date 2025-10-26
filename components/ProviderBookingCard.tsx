import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus, ProviderResponseStatus } from '../types';

interface ProviderBookingCardProps {
    booking: Booking;
    onConfirm: (bookingId: number) => Promise<void>;
    onSetOnTheWay: (bookingId: number) => Promise<void>;
    onDecline: (bookingId: number) => Promise<void>;
}

const ProviderBookingCard: React.FC<ProviderBookingCardProps> = ({
    booking,
    onConfirm,
    onSetOnTheWay,
    onDecline
}) => {
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Calculate time remaining until confirmation deadline
    useEffect(() => {
        if (!booking.confirmationDeadline) return;

        const updateTimer = () => {
            const deadline = new Date(booking.confirmationDeadline!);
            const now = new Date();
            const diff = deadline.getTime() - now.getTime();
            setTimeRemaining(Math.max(0, diff));
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [booking.confirmationDeadline]);

    const formatTimeRemaining = (ms: number): string => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            await onConfirm(booking.id);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOnTheWay = async () => {
        setIsProcessing(true);
        try {
            await onSetOnTheWay(booking.id);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDecline = async () => {
        setIsProcessing(true);
        try {
            await onDecline(booking.id);
        } finally {
            setIsProcessing(false);
        }
    };

    const isAwaitingResponse = booking.providerResponseStatus === ProviderResponseStatus.AwaitingResponse;
    const isConfirmed = booking.providerResponseStatus === ProviderResponseStatus.Confirmed;
    const isOnTheWay = booking.providerResponseStatus === ProviderResponseStatus.OnTheWay;
    const hasTimedOut = timeRemaining === 0 && isAwaitingResponse;

    return (
        <div className={`bg-white rounded-2xl shadow-lg border-l-4 p-6 mb-4 transition-all ${
            hasTimedOut ? 'border-red-500 opacity-60' :
            isAwaitingResponse ? 'border-yellow-500' :
            isOnTheWay ? 'border-blue-500' :
            isConfirmed ? 'border-green-500' : 'border-gray-300'
        }`}>
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {isAwaitingResponse && !hasTimedOut && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full flex items-center gap-1">
                            <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            AWAITING RESPONSE
                        </span>
                    )}
                    {isConfirmed && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            CONFIRMED
                        </span>
                    )}
                    {isOnTheWay && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                            </svg>
                            ON THE WAY
                        </span>
                    )}
                    {hasTimedOut && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                            TIMED OUT
                        </span>
                    )}
                </div>

                {/* Timer */}
                {isAwaitingResponse && !hasTimedOut && (
                    <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-lg">
                        <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-yellow-800 font-mono font-bold text-sm">
                            {formatTimeRemaining(timeRemaining)}
                        </span>
                    </div>
                )}
            </div>

            {/* Hotel/Villa & Guest Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-gray-600 text-xs mb-1">Hotel/Villa</p>
                        <p className="font-semibold text-gray-800">{booking.hotelVillaName}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-xs mb-1">Room Number</p>
                        <p className="font-semibold text-gray-800 flex items-center gap-1">
                            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            {booking.roomNumber}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-xs mb-1">Guest Name</p>
                        <p className="font-semibold text-gray-800">{booking.guestName}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-xs mb-1">Service Duration</p>
                        <p className="font-semibold text-gray-800">{booking.service} minutes</p>
                    </div>
                </div>
            </div>

            {/* Booking Details */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-gray-700">
                        {new Date(booking.startTime).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-gray-700">
                        {new Date(booking.startTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                    </span>
                </div>
                {booking.chargeToRoom && (
                    <div className="flex items-center gap-2 text-sm">
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span className="text-green-700 font-medium">Charge to room</span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            {isAwaitingResponse && !hasTimedOut && (
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handleConfirm}
                            disabled={isProcessing}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Confirmed
                        </button>
                        <button
                            onClick={handleOnTheWay}
                            disabled={isProcessing}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                            </svg>
                            On the Way
                        </button>
                    </div>
                    <button
                        onClick={handleDecline}
                        disabled={isProcessing}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
                    >
                        Decline
                    </button>
                </div>
            )}

            {/* Confirmed/On The Way Status Message */}
            {(isConfirmed || isOnTheWay) && (
                <div className={`p-4 rounded-xl ${
                    isOnTheWay ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'
                }`}>
                    <p className={`text-sm font-semibold ${
                        isOnTheWay ? 'text-blue-800' : 'text-green-800'
                    }`}>
                        {isOnTheWay 
                            ? '🚗 You have indicated you are on the way to the guest.'
                            : '✅ You have confirmed this booking.'
                        }
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                        Guest and hotel have been notified.
                    </p>
                </div>
            )}

            {/* Timed Out Message */}
            {hasTimedOut && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm font-semibold text-red-800">
                        ⏰ Response time expired. This booking may have been reassigned to another provider.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProviderBookingCard;
