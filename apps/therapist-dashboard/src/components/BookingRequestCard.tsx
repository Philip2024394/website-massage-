// @ts-nocheck - Temporary fix for React 19 type incompatibility
import React, { useState, useEffect } from 'react';
import { Clock, Check, X, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { bookingAcknowledgmentService } from '../../../../lib/services/bookingAcknowledgmentService';
import { bookingSoundService } from '../../../../services/bookingSound.service';

interface BookingRequest {
    $id: string;
    bookingId: string;
    therapistId: string;
    customerName: string;
    customerLocation: string;
    serviceDuration: number;
    servicePrice: number;
    expiresAt: string;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

interface BookingRequestCardProps {
    therapistId: string;
    membershipTier: 'free' | 'plus';
}

export const BookingRequestCard: React.FC<BookingRequestCardProps> = ({ 
    therapistId,
    membershipTier 
}) => {
    const [pendingBookings, setPendingBookings] = useState<BookingRequest[]>([]);
    const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: number }>({});
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [processing, setProcessing] = useState<string | null>(null);

    // Audio element for notification
    const notificationAudio = React.useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Create audio element
        notificationAudio.current = new Audio('/sounds/booking-notification.mp3');
        notificationAudio.current.loop = true;

        // Load pending bookings
        loadPendingBookings();

        // Set up event listeners for new bookings
        window.addEventListener('playBookingNotification', handleNewBooking);
        window.addEventListener('stopBookingNotification', handleStopNotification);

        // Poll for updates every 10 seconds
        const pollInterval = setInterval(loadPendingBookings, 10000);

        return () => {
            window.removeEventListener('playBookingNotification', handleNewBooking);
            window.removeEventListener('stopBookingNotification', handleStopNotification);
            clearInterval(pollInterval);
            if (notificationAudio.current) {
                notificationAudio.current.pause();
            }
        };
    }, [therapistId]);

    // Update countdown timers
    useEffect(() => {
        const interval = setInterval(() => {
            const newTimeRemaining: { [key: string]: number } = {};
            
            pendingBookings.forEach(booking => {
                const remaining = Math.max(0, 
                    Math.floor((new Date(booking.expiresAt).getTime() - Date.now()) / 1000)
                );
                newTimeRemaining[booking.$id] = remaining;
                
                // Auto-expire if time runs out
                if (remaining === 0 && booking.status === 'pending') {
                    handleExpired(booking.$id);
                }
            });
            
            setTimeRemaining(newTimeRemaining);
        }, 1000);

        return () => clearInterval(interval);
    }, [pendingBookings]);

    const loadPendingBookings = async () => {
        try {
            // In production, fetch from Appwrite
            // For now, using mock data or actual service
            const stats = await bookingAcknowledgmentService.getTherapistStats(therapistId);
            
            // If there are pending bookings, fetch them
            // This would be implemented with proper Appwrite query
            console.log('Loading pending bookings for:', therapistId);
        } catch (error) {
            console.error('Error loading pending bookings:', error);
        }
    };

    const handleNewBooking = (event: any) => {
        const { bookingId, therapistId: notificationTherapistId } = event.detail;
        
        if (notificationTherapistId === therapistId && soundEnabled) {
            // Start both old and new sound systems for maximum alerting
            playNotificationSound();
            bookingSoundService.startBookingAlert(bookingId, 'pending');
        }
        
        // Reload bookings
        loadPendingBookings();
    };

    const handleStopNotification = () => {
        stopNotificationSound();
    };

    const playNotificationSound = () => {
        if (notificationAudio.current && soundEnabled) {
            notificationAudio.current.play().catch(err => {
                console.error('Error playing notification:', err);
            });
            setAudioPlaying(true);
        }
    };

    const stopNotificationSound = () => {
        if (notificationAudio.current) {
            notificationAudio.current.pause();
            notificationAudio.current.currentTime = 0;
            setAudioPlaying(false);
        }
    };

    const toggleSound = () => {
        setSoundEnabled(!soundEnabled);
        if (!soundEnabled && audioPlaying) {
            stopNotificationSound();
        }
    };

    const handleAccept = async (acknowledgmentId: string) => {
        setProcessing(acknowledgmentId);
        try {
            await bookingAcknowledgmentService.acceptBooking(acknowledgmentId, therapistId);
            
            // CRITICAL: Stop all notification sounds immediately
            stopNotificationSound();
            bookingSoundService.stopBookingAlert(acknowledgmentId);
            
            // Remove from pending list
            setPendingBookings(prev => prev.filter(b => b.$id !== acknowledgmentId));
            
            // Show success message
            alert('✅ Booking accepted! Customer has been notified.');
        } catch (error: any) {
            console.error('Error accepting booking:', error);
            
            if (error.message?.includes('PAYMENT_REQUIRED')) {
                alert('❌ Cannot accept booking: You must pay your previous booking commission first.');
            } else if (error.message?.includes('no longer available')) {
                alert('⚠️ Booking is no longer available. It may have been assigned to another therapist.');
                setPendingBookings(prev => prev.filter(b => b.$id !== acknowledgmentId));
            } else {
                alert('❌ Error accepting booking. Please try again.');
            }
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (acknowledgmentId: string) => {
        const reason = prompt('Why are you rejecting this booking? (Optional)');
        
        setProcessing(acknowledgmentId);
        try {
            await bookingAcknowledgmentService.rejectBooking(acknowledgmentId, therapistId, reason || undefined);
            
            // CRITICAL: Stop all notification sounds immediately
            stopNotificationSound();
            bookingSoundService.stopBookingAlert(acknowledgmentId);
            
            // Remove from pending list
            setPendingBookings(prev => prev.filter(b => b.$id !== acknowledgmentId));
            
            alert('✅ Booking rejected. It will be offered to other therapists.');
        } catch (error) {
            console.error('Error rejecting booking:', error);
            alert('❌ Error rejecting booking. Please try again.');
        } finally {
            setProcessing(null);
        }
    };

    const handleExpired = (acknowledgmentId: string) => {
        stopNotificationSound();
        setPendingBookings(prev => prev.filter(b => b.$id !== acknowledgmentId));
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (pendingBookings.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4 mb-6">
            {/* Sound Control */}
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                    {audioPlaying ? <Volume2 className="w-5 h-5 text-blue-600 animate-pulse" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                    <span className="text-sm font-medium text-blue-900">
                        {audioPlaying ? 'Notification Playing' : 'Notifications'}
                    </span>
                </div>
                <button
                    onClick={toggleSound}
                    className={`px-4 py-1 rounded-lg text-sm font-medium transition-colors ${
                        soundEnabled 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                    }`}
                >
                    {soundEnabled ? 'Sound On' : 'Sound Off'}
                </button>
            </div>

            {/* Booking Request Cards */}
            {pendingBookings.map(booking => {
                const remaining = timeRemaining[booking.$id] || 0;
                const isExpiring = remaining < 60;
                const isProcessing = processing === booking.$id;

                return (
                    <div 
                        key={booking.$id}
                        className={`bg-white border-2 rounded-lg p-6 shadow-lg animate-pulse-slow ${
                            isExpiring ? 'border-red-500 bg-red-50' : 'border-orange-500'
                        }`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">
                                🚨 NEW BOOKING REQUEST
                            </h3>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg ${
                                isExpiring ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-500 text-white'
                            }`}>
                                <Clock className="w-5 h-5" />
                                {formatTime(remaining)}
                            </div>
                        </div>

                        {/* Warning Banner for Pro Members */}
                        {membershipTier === 'free' && (
                            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-4">
                                <p className="text-sm text-yellow-800 font-semibold">
                                    ⚠️ PRO MEMBER: No WhatsApp provided. Use in-app chat only.
                                </p>
                            </div>
                        )}

                        {/* Booking Details */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">👤 Customer:</span>
                                <span className="text-gray-900">{booking.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">📍 Location:</span>
                                <span className="text-gray-900">{booking.customerLocation}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">⏱️ Duration:</span>
                                <span className="text-gray-900">{booking.serviceDuration} minutes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">💰 Price:</span>
                                <span className="text-gray-900 font-bold">
                                    Rp {booking.servicePrice.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleAccept(booking.$id)}
                                disabled={isProcessing}
                                className={`flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-bold text-lg transition-all ${
                                    isProcessing
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-xl transform hover:scale-105'
                                }`}
                            >
                                <Check className="w-6 h-6" />
                                {isProcessing ? 'Processing...' : 'Accept Booking'}
                            </button>
                            <button
                                onClick={() => handleReject(booking.$id)}
                                disabled={isProcessing}
                                className={`flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-bold text-lg transition-all ${
                                    isProcessing
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-xl transform hover:scale-105'
                                }`}
                            >
                                <X className="w-6 h-6" />
                                {isProcessing ? 'Processing...' : 'Reject Booking'}
                            </button>
                        </div>

                        {/* Expiring Warning */}
                        {isExpiring && (
                            <div className="mt-4 bg-red-100 border border-red-300 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                    <p className="text-sm text-red-800 font-bold">
                                        URGENT: Less than 1 minute remaining! Accept or reject now!
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Pro Member Warning */}
                        {membershipTier === 'free' && (
                            <div className="mt-4 bg-orange-50 border border-orange-300 rounded-lg p-3">
                                <p className="text-xs text-orange-800">
                                    ⚠️ <strong>Pro Member Notice:</strong> Operating outside Indastreet platform = 
                                    Immediate permanent deactivation + WhatsApp blocking. 
                                    <a href="/membership" className="underline ml-1">Upgrade to Plus</a> for WhatsApp access.
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default BookingRequestCard;
