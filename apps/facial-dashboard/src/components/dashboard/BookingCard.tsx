/**
 * Booking Card Component
 * Displays booking information with action buttons
 * Max size: 15KB (Facebook/Amazon standard)
 */

import React from 'react';
import { BookingStatus } from '../../types';
import type { Booking } from '../../types';

interface BookingCardProps {
  booking: Booking;
  onUpdateStatus: (id: number, status: BookingStatus) => void;
  t: any;
}

const statusColors = {
  [BookingStatus.Pending]: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200 shadow-sm animate-pulse',
  [BookingStatus.Confirmed]: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 shadow-sm',
  [BookingStatus.OnTheWay]: 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border-blue-200 shadow-sm animate-bounce',
  [BookingStatus.Cancelled]: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200 shadow-sm',
  [BookingStatus.Completed]: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200 shadow-sm',
  [BookingStatus.TimedOut]: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200 shadow-sm',
  [BookingStatus.Reassigned]: 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200 shadow-sm',
};

const BookingCard: React.FC<BookingCardProps> = ({ 
  booking, 
  onUpdateStatus, 
  t 
}) => {
  const isPending = booking.status === BookingStatus.Pending;
  const isUpcoming = new Date(booking.startTime) > new Date();

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-gray-900 text-lg">{booking.userName}</p>
          <p className="text-sm text-gray-600 mt-1">
            {t?.service || 'Service'}: {booking.service} min
          </p>
        </div>
        <span 
          className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[booking.status]}`}
        >
          {booking.status}
        </span>
      </div>
      
      <p className="text-sm text-gray-600">
        {t?.date || 'Date'}: {new Date(booking.startTime).toLocaleString()}
      </p>
      
      {isPending && isUpcoming && (
        <div className="flex gap-2 pt-4 mt-4 border-t">
          <button 
            onClick={() => onUpdateStatus(booking.id, BookingStatus.Confirmed)} 
            className="flex-1 bg-orange-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-orange-600 transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
          >
            {t?.confirm || 'Confirm'}
          </button>
          <button 
            onClick={() => onUpdateStatus(booking.id, BookingStatus.Cancelled)} 
            className="flex-1 bg-white text-gray-700 font-semibold py-2.5 px-4 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200 hover:shadow-md hover:border-gray-400"
          >
            {t?.cancel || 'Cancel'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingCard;