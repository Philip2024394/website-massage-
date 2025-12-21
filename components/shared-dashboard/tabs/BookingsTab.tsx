/**
 * BookingsTab - Shared bookings management tab
 */

import React from 'react';
import BookingCard from '../cards/BookingCard';
import type { Booking } from '../../../types';

export interface BookingsTabProps {
    bookings: Booking[];
    onAccept: (bookingId: number) => Promise<void>;
    onDecline: (bookingId: number) => Promise<void>;
    onViewDetails: (booking: Booking) => void;
}

const BookingsTab: React.FC<BookingsTabProps> = ({
    bookings,
    onAccept,
    onDecline,
    onViewDetails,
}) => {
    const [filter, setFilter] = React.useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
    
    const filteredBookings = React.useMemo(() => {
        if (filter === 'all') return bookings;
        return bookings.filter(b => b.status.toLowerCase() === filter);
    }, [bookings, filter]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
                
                <div className="flex space-x-2">
                    {['all', 'pending', 'confirmed', 'completed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status as any)}
                            className={`px-4 py-2 rounded-lg capitalize ${
                                filter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>
            
            {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">No bookings found</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBookings.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            id={booking.id}
                            customerName={booking.userName}
                            date={new Date(booking.startTime).toLocaleDateString()}
                            time={new Date(booking.startTime).toLocaleTimeString()}
                            service={`${booking.service} min`}
                            status={booking.status.toLowerCase() as any}
                            price={booking.totalPrice ? `Rp ${booking.totalPrice.toLocaleString()}` : undefined}
                            onAccept={() => onAccept(booking.id as number)}
                            onDecline={() => onDecline(booking.id as number)}
                            onViewDetails={() => onViewDetails(booking)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookingsTab;
