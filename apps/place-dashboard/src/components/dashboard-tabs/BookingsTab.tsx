import React from 'react';
import { Calendar } from 'lucide-react';

interface Booking {
    id: string;
    [key: string]: any;
}

interface BookingsTabProps {
    upcomingBookings: Booking[];
    pastBookings: Booking[];
    onUpdateBookingStatus: (bookingId: string, status: string) => void;
    t: any;
    BookingCard: React.ComponentType<any>;
}

const BookingsTab: React.FC<BookingsTabProps> = ({
    upcomingBookings,
    pastBookings,
    onUpdateBookingStatus,
    t,
    BookingCard
}) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t?.bookings?.upcoming || 'Upcoming Bookings'}</h2>
                    <p className="text-xs text-gray-500">Manage your upcoming bookings</p>
                </div>
            </div>
            {upcomingBookings.length > 0 ? (
                <div className="grid gap-4">
                    {upcomingBookings.map(b => (
                        <BookingCard 
                            key={b.id} 
                            booking={b} 
                            onUpdateStatus={onUpdateBookingStatus} 
                            t={t?.bookings || {}} 
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                    <p className="text-gray-500">{t?.bookings?.noUpcoming || 'No upcoming bookings'}</p>
                </div>
            )}
            
            <div className="flex items-center gap-3 mt-8">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t?.bookings?.past || 'Past Bookings'}</h2>
                    <p className="text-xs text-gray-500">View past bookings</p>
                </div>
            </div>
            {pastBookings.length > 0 ? (
                <div className="grid gap-4">
                    {pastBookings.map(b => (
                        <BookingCard 
                            key={b.id} 
                            booking={b} 
                            onUpdateStatus={onUpdateBookingStatus} 
                            t={t?.bookings || {}} 
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                    <p className="text-gray-500">{t?.bookings?.noPast || 'No past bookings'}</p>
                </div>
            )}
        </div>
    );
};

export default BookingsTab;
