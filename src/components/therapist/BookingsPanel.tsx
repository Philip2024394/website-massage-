import React from 'react';
import { Calendar } from 'lucide-react';
import type { Booking } from '../types';
import { BookingStatus } from '../types';
import { BookingCard } from '../therapist-dashboard';

interface BookingsPanelProps {
    bookings?: Booking[];
    onUpdateStatus: (bookingId: number, status: BookingStatus) => void;
    t: any;
}

export const BookingsPanel: React.FC<BookingsPanelProps> = ({
    bookings,
    onUpdateStatus,
    t
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t.bookings || 'Bookings'}</h2>
            
            {bookings && bookings.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {bookings.map((booking) => (
                        <BookingCard
                            key={booking.id}
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
