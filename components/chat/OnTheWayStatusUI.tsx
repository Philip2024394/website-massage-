/**
 * OnTheWayStatusUI Component
 * UI for when therapist is on the way with live updates and contact options
 */

import React, { useState, useEffect } from 'react';
import { Navigation, Clock, Phone, MessageCircle, MapPin, Car } from 'lucide-react';
import { formatTime } from '../../modules/chat/utils/chatHelpers';

export interface OnTheWayStatusUIProps {
  therapist: {
    id: string;
    name: string;
    image?: string;
    whatsApp?: string;
    phone?: string;
  };
  booking: {
    estimatedArrival?: number; // minutes
    departedAt?: string;
    currentLocation?: string;
    notes?: string;
  };
  onContactTherapist: (method: 'whatsapp' | 'call' | 'chat') => void;
  onUpdateLocation: () => void;
}

export const OnTheWayStatusUI: React.FC<OnTheWayStatusUIProps> = ({
  therapist,
  booking,
  onContactTherapist,
  onUpdateLocation
}) => {
  const [currentETA, setCurrentETA] = useState(booking.estimatedArrival || 30);
  const [isMoving, setIsMoving] = useState(true);

  // Simulate ETA countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentETA(prev => Math.max(0, prev - 1));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Animate car icon
  useEffect(() => {
    const interval = setInterval(() => {
      setIsMoving(prev => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const departedTime = booking.departedAt ? new Date(booking.departedAt) : new Date();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4 m-4 shadow-lg">
      {/* Header with Animation */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <Car className={`w-6 h-6 text-white transition-transform duration-500 ${isMoving ? 'translate-x-1' : 'translate-x-0'}`} />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-blue-800 text-lg">Therapist On The Way!</h3>
          <p className="text-blue-600 text-sm">🚗 {therapist.name} is heading to your location</p>
        </div>
      </div>

      {/* Live ETA Display */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="w-6 h-6" />
            <div>
              <p className="font-semibold text-lg">Live ETA</p>
              <p className="text-blue-100 text-sm">
                Departed {formatTime(departedTime)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold font-mono">{currentETA}min</div>
            <div className="text-blue-200 text-xs">Arriving Soon</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-1000 relative overflow-hidden"
              style={{ width: `${Math.max(10, 100 - (currentETA * 2))}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-blue-200 mt-1">
            <span>Departed</span>
            <span>Arriving</span>
          </div>
        </div>
      </div>

      {/* Therapist Info */}
      <div className="bg-white rounded-xl p-4 border border-blue-100 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <img 
            src={therapist.image || '/placeholder-avatar.jpg'} 
            alt={therapist.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
          />
          <div>
            <h4 className="font-bold text-gray-900">{therapist.name}</h4>
            <p className="text-sm text-gray-600">Licensed Professional</p>
          </div>
        </div>
        
        {booking.currentLocation && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>Currently: {booking.currentLocation}</span>
          </div>
        )}

        {booking.notes && (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💬 <strong>Update:</strong> {booking.notes}
            </p>
          </div>
        )}
      </div>

      {/* Contact Options */}
      <div className="space-y-3">
        <p className="text-center text-sm text-gray-600 font-medium">
          Need to contact your therapist?
        </p>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onContactTherapist('whatsapp')}
            className="bg-green-500 text-white font-semibold py-3 rounded-xl hover:bg-green-600 transition-all flex flex-col items-center gap-1"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">WhatsApp</span>
          </button>
          
          <button
            onClick={() => onContactTherapist('call')}
            className="bg-blue-500 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition-all flex flex-col items-center gap-1"
          >
            <Phone className="w-5 h-5" />
            <span className="text-xs">Call</span>
          </button>
          
          <button
            onClick={() => onContactTherapist('chat')}
            className="bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition-all flex flex-col items-center gap-1"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">In-App</span>
          </button>
        </div>

        {/* Update Location */}
        <button
          onClick={onUpdateLocation}
          className="w-full bg-white border-2 border-blue-400 text-blue-600 font-semibold py-3 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          Share My Current Location
        </button>
      </div>

      {/* Preparation Checklist */}
      <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
        <h5 className="font-semibold text-blue-800 mb-2">🏠 Preparation Checklist</h5>
        <div className="space-y-1 text-sm text-blue-700">
          <p>✓ Clear path to massage area</p>
          <p>✓ Towels and water ready</p>
          <p>✓ Phone accessible for updates</p>
          <p>✓ Payment method prepared</p>
        </div>
      </div>
    </div>
  );
};