/**
 * BookingCard - Shared booking display component
 */

import React from 'react';

export interface BookingCardProps {
    id: string | number;
    customerName: string;
    date: string;
    time: string;
    service: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    price?: string;
    onAccept?: () => void;
    onDecline?: () => void;
    onViewDetails?: () => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
    customerName,
    date,
    time,
    service,
    status,
    price,
    onAccept,
    onDecline,
    onViewDetails,
}) => {
    const statusColors = {
        pending: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200 shadow-sm',
        confirmed: 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border border-blue-200 shadow-sm',
        completed: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm',
        cancelled: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200 shadow-sm',
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{customerName}</h3>
                    <p className="text-sm text-gray-600">{service}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
                    {status}
                </span>
            </div>
            
            <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📅</span>
                    <span>{date}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">🕐</span>
                    <span>{time}</span>
                </div>
                {price && (
                    <div className="flex items-center text-sm font-semibold text-gray-900">
                        <span className="mr-2">💰</span>
                        <span>{price}</span>
                    </div>
                )}
            </div>
            
            {status === 'pending' && (onAccept || onDecline) && (
                <div className="flex space-x-2">
                    {onAccept && (
                        <button
                            onClick={onAccept}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Accept
                        </button>
                    )}
                    {onDecline && (
                        <button
                            onClick={onDecline}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Decline
                        </button>
                    )}
                </div>
            )}
            
            {onViewDetails && (
                <button
                    onClick={onViewDetails}
                    className="w-full mt-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    View Details
                </button>
            )}
        </div>
    );
};

export default BookingCard;
