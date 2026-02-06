/**
 * TherapistAcceptanceUI Component
 * Enhanced UI for when therapist accepts booking with profile, ETA, and location sharing
 */

import React from 'react';
import { Clock, MapPin, Star, Phone, MessageSquare, CheckCircle } from 'lucide-react';
import { formatTime } from '../../modules/chat/utils/chatHelpers';

export interface TherapistAcceptanceUIProps {
  therapist: {
    id: string;
    name: string;
    image?: string;
    rating?: number;
    whatsApp?: string;
  };
  booking: {
    estimatedArrival?: number; // minutes
    acceptedAt?: string;
    location?: string;
  };
  onConfirmBooking: () => void;
  onCancelBooking: () => void;
  onRequestLocation: () => void;
  onContactTherapist: () => void;
}

export const TherapistAcceptanceUI: React.FC<TherapistAcceptanceUIProps> = ({
  therapist,
  booking,
  onConfirmBooking,
  onCancelBooking,
  onRequestLocation,
  onContactTherapist
}) => {
  const eta = booking.estimatedArrival || 45;
  const acceptedTime = booking.acceptedAt ? new Date(booking.acceptedAt) : new Date();

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 m-4 shadow-lg">
      {/* Success Header - Text Status */}
      <div className="mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-4 shadow-lg text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle className="w-6 h-6" />
          <h3 className="text-lg font-bold">Therapist Accepted!</h3>
        </div>
        <p className="text-sm opacity-90">
          {therapist.name} has accepted your booking and is preparing to visit
        </p>
      </div>

      {/* Therapist Profile Card */}
      <div className="bg-white rounded-xl p-4 border border-green-100 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={therapist.image || '/placeholder-avatar.jpg'} 
              alt={therapist.name}
              className="w-16 h-16 rounded-full object-cover border-3 border-green-400"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-lg">{therapist.name}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>{therapist.rating || 4.9} • Licensed Therapist</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Accepted {formatTime(acceptedTime)} • Preparing to visit
            </p>
          </div>
        </div>
      </div>

      {/* ETA Information */}
      <div className="bg-green-100 rounded-xl p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Estimated Arrival</p>
              <p className="text-green-600 text-sm">~{eta} minutes from confirmation</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-700">{eta}min</div>
            <div className="text-xs text-green-600">ETA</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Confirm Booking */}
        <button
          onClick={onConfirmBooking}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          <CheckCircle className="w-5 h-5" />
          Confirm Booking - Let's Start!
        </button>

        {/* Contact Options */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onContactTherapist}
            className="bg-white border-2 border-green-400 text-green-600 font-semibold py-3 rounded-xl hover:bg-green-50 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Chat Now
          </button>
          <button
            onClick={onRequestLocation}
            className="bg-white border-2 border-blue-400 text-blue-600 font-semibold py-3 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Share Location
          </button>
        </div>

        {/* Cancel Option */}
        <button
          onClick={onCancelBooking}
          className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
        >
          Cancel this booking
        </button>
      </div>
    </div>
  );
};