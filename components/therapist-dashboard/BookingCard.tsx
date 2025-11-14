import React, { useState, useEffect } from 'react';
import type { Booking } from '../../types';
import { BookingStatus } from '../../types';

interface BusyCountdownTimerProps {
    busyUntil: Date;
}

const BusyCountdownTimer: React.FC<BusyCountdownTimerProps> = ({ busyUntil }) => {
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date().getTime();
            const timeDiff = busyUntil.getTime() - now;

            if (timeDiff <= 0) {
                setTimeLeft('0s');
                return;
            }

            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            } else {
                setTimeLeft(`${minutes}m ${seconds}s`);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [busyUntil]);

    return (
        <span className="ml-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full font-bold">
            ⏱️ {timeLeft}
        </span>
    );
};

interface BookingCardProps {
    booking: Booking;
    onUpdateStatus: (id: number, status: BookingStatus) => void;
    t: any;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onUpdateStatus, t }) => {
    const isPending = booking.status === BookingStatus.Pending;
    const isUpcoming = new Date(booking.startTime) > new Date();

    const statusColors = {
        [BookingStatus.Pending]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        [BookingStatus.Confirmed]: 'bg-green-100 text-green-800 border-green-300',
        [BookingStatus.OnTheWay]: 'bg-blue-100 text-blue-800 border-blue-300',
        [BookingStatus.Cancelled]: 'bg-red-100 text-red-800 border-red-300',
        [BookingStatus.Completed]: 'bg-gray-100 text-gray-800 border-gray-300',
        [BookingStatus.TimedOut]: 'bg-red-100 text-red-800 border-red-300',
        [BookingStatus.Reassigned]: 'bg-purple-100 text-purple-800 border-purple-300',
    };

    return (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-all">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <p className="font-bold text-gray-900 text-lg">{booking.userName}</p>
                    <p className="text-sm text-gray-600 mt-1">{t.service}: {booking.service} min</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[booking.status]}`}>
                    {booking.status}
                </span>
            </div>
            <p className="text-sm text-gray-600">{t.date}: {new Date(booking.startTime).toLocaleString()}</p>
            {isPending && isUpcoming && (
                <div className="flex flex-col sm:flex-row gap-2 pt-4 mt-4 border-t">
                    <button 
                        onClick={() => onUpdateStatus(booking.id, BookingStatus.Confirmed)} 
                        className="flex-1 bg-orange-500 text-white font-semibold py-2.5 px-3 sm:px-4 rounded-lg hover:bg-orange-600 transition-all text-sm"
                    >
                        {t.confirm}
                    </button>
                    <button 
                        onClick={() => onUpdateStatus(booking.id, BookingStatus.Cancelled)} 
                        className="flex-1 bg-white text-gray-700 font-semibold py-2.5 px-3 sm:px-4 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-all text-sm"
                    >
                        {t.cancel}
                    </button>
                </div>
            )}
        </div>
    );
};

export { BookingCard, BusyCountdownTimer };