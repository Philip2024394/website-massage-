import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import type { Booking } from '../types';
import { BookingStatus } from '../types';
import { BookingCard } from '../therapist-dashboard';
import { client, DATABASE_ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { logger } from '../../utils/logger';

interface BookingsPanelProps {
    bookings?: Booking[];
    onUpdateStatus: (bookingId: number, status: BookingStatus) => void;
    t: any;
    therapistId?: string; // Add therapist ID for real-time filtering
}

export const BookingsPanel: React.FC<BookingsPanelProps> = ({
    bookings,
    onUpdateStatus,
    t,
    therapistId
}) => {
    const [liveBookings, setLiveBookings] = useState<Booking[]>(bookings || []);

    // Keep local state in sync with props
    useEffect(() => {
        setLiveBookings(bookings || []);
    }, [bookings]);

    // ============================================================================
    // 🔄 REAL-TIME BOOKING SYNCHRONIZATION FOR BOOKINGS PANEL
    // ============================================================================
    // Subscribe to booking updates so panel stays in sync
    // ============================================================================
    useEffect(() => {
        if (!therapistId) {
            logger.debug('⚠️ [BOOKINGS PANEL] No therapist ID, skipping real-time sync');
            return;
        }

        logger.debug('🔄 [BOOKINGS PANEL] Starting real-time sync for therapist:', therapistId);

        try {
            const channelName = `databases.${DATABASE_ID}.collections.${APPWRITE_CONFIG.collections.bookings}.documents`;
            
            const unsubscribe = client.subscribe(channelName, (response: any) => {
                const booking = response.payload;
                
                // Only process bookings for this therapist
                if (booking.therapistId !== therapistId && booking.providerId !== therapistId) {
                    return;
                }

                logger.debug('📥 [BOOKINGS PANEL] Booking update received:', {
                    bookingId: booking.$id,
                    status: booking.bookingStatus || booking.status,
                    event: response.events[0]
                });

                // Handle new booking creation
                if (response.events.includes('databases.*.collections.*.documents.*.create')) {
                    setLiveBookings(prev => {
                        // Avoid duplicates
                        if (prev.some(b => b.id === booking.id || b.$id === booking.$id)) {
                            return prev;
                        }
                        return [booking as Booking, ...prev];
                    });
                }

                // Handle booking updates
                if (response.events.includes('databases.*.collections.*.documents.*.update')) {
                    setLiveBookings(prev => 
                        prev.map(b => 
                            (b.id === booking.id || b.$id === booking.$id) 
                                ? { ...b, ...booking } as Booking
                                : b
                        )
                    );
                }

                // Handle booking deletion
                if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
                    setLiveBookings(prev => 
                        prev.filter(b => b.id !== booking.id && b.$id !== booking.$id)
                    );
                }
            });

            logger.debug('✅ [BOOKINGS PANEL] Real-time sync active');

            return () => {
                logger.debug('🔌 [BOOKINGS PANEL] Unsubscribing from real-time sync');
                unsubscribe();
            };

        } catch (error) {
            logger.error('❌ [BOOKINGS PANEL] Failed to subscribe to booking updates:', error);
        }
    }, [therapistId]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t.bookings || 'Bookings'}</h2>
            
            {liveBookings && liveBookings.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {liveBookings.map((booking) => (
                        <BookingCard
                            key={booking.id || booking.$id}
                            booking={booking}
                            onUpdateStatus={onUpdateStatus}
                            t={t}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <Calendar className="w-16 h-16 mx-auto" />
                    </div>
                    <p className="text-gray-600">{t.noBookings || 'No bookings yet'}</p>
                </div>
            )}
        </div>
    );
};
