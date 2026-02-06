/**
 * Customer "On The Way" Notification Component
 * Shows when therapist is traveling to customer location
 */

import React, { useState, useEffect } from 'react';
import { Car, MapPin, Clock, CheckCircle, Phone, MessageCircle } from 'lucide-react';
import { therapistOnTheWayService, OnTheWayStatus } from '../services/therapistOnTheWayService';

interface CustomerOnTheWayNotificationProps {
  bookingId: string;
  isVisible?: boolean;
  onClose?: () => void;
}

export const CustomerOnTheWayNotification: React.FC<CustomerOnTheWayNotificationProps> = ({
  bookingId,
  isVisible = true,
  onClose
}) => {
  const [journeyStatus, setJourneyStatus] = useState<OnTheWayStatus | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    // Check journey status periodically
    const checkStatus = () => {
      const status = therapistOnTheWayService.getJourneyStatus(bookingId);
      setJourneyStatus(status);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    // Update time remaining every minute
    if (!journeyStatus) return;

    const updateTime = () => {
      const remaining = journeyStatus.estimatedArrival.getTime() - Date.now();
      if (remaining <= 0) {
        setTimeRemaining('Should be arrived');
        return;
      }
      
      const minutes = Math.round(remaining / 60000);
      if (minutes < 60) {
        setTimeRemaining(`${minutes} min`);
      } else {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        setTimeRemaining(`${hours}h ${mins}m`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [journeyStatus]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = () => {
    if (!journeyStatus) return null;
    
    switch (journeyStatus.status) {
      case 'departed':
        return <Car className="w-6 h-6 text-blue-500" />;
      case 'en_route':
        return <Car className="w-6 h-6 text-orange-500 animate-pulse" />;
      case 'nearby':
        return <MapPin className="w-6 h-6 text-yellow-500 animate-bounce" />;
      case 'arrived':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      default:
        return <Car className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (!journeyStatus) return '';
    
    switch (journeyStatus.status) {
      case 'departed':
        return 'Therapist is on the way';
      case 'en_route':
        return 'Therapist is traveling to you';
      case 'nearby':
        return 'Therapist is nearby!';
      case 'arrived':
        return 'Therapist has arrived';
      default:
        return 'Therapist is coming';
    }
  };

  const getStatusColor = () => {
    if (!journeyStatus) return 'bg-gray-50 border-gray-200';
    
    switch (journeyStatus.status) {
      case 'departed':
        return 'bg-blue-50 border-blue-200';
      case 'en_route':
        return 'bg-orange-50 border-orange-200';
      case 'nearby':
        return 'bg-yellow-50 border-yellow-300';
      case 'arrived':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getPrepareMessage = () => {
    if (!journeyStatus) return '';
    
    switch (journeyStatus.status) {
      case 'departed':
        return '🏠 Please prepare your massage area and have towels ready';
      case 'en_route':
        return '📱 Keep your phone nearby for updates from your therapist';
      case 'nearby':
        return '🚪 Please be ready to answer the door - therapist is very close!';
      case 'arrived':
        return '✨ Your therapist is here! Please let them in and enjoy your massage';
      default:
        return '';
    }
  };

  // Don't show if no journey status or not visible
  if (!isVisible || !journeyStatus) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className={`${getStatusColor()} border-2 rounded-xl p-4 shadow-lg backdrop-blur-sm bg-opacity-95`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-bold text-gray-800">{getStatusText()}</h3>
              <p className="text-sm text-gray-600">{journeyStatus.therapistName}</p>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Time Info */}
        <div className="flex items-center justify-between mb-3 p-2 bg-white bg-opacity-60 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              ETA: {formatTime(journeyStatus.estimatedArrival)}
            </span>
          </div>
          <div className="text-sm font-bold text-gray-800">
            {timeRemaining}
          </div>
        </div>

        {/* Preparation Message */}
        <div className="mb-3 p-3 bg-white bg-opacity-60 rounded-lg">
          <p className="text-sm text-gray-700 font-medium">
            {getPrepareMessage()}
          </p>
        </div>

        {/* Action Buttons */}
        {journeyStatus.status !== 'arrived' && (
          <div className="flex gap-2">
            <a
              href={`tel:${journeyStatus.customerPhone}`}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
            
            <a
              href={`https://wa.me/${journeyStatus.customerPhone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        )}

        {/* Arrived State */}
        {journeyStatus.status === 'arrived' && (
          <div className="text-center p-3 bg-green-100 border border-green-300 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="font-semibold text-green-800">🎉 Your therapist is here!</div>
            <div className="text-sm text-green-700">
              Thank you for choosing IndasTreet Massage
            </div>
          </div>
        )}

        {/* Journey Progress Indicator */}
        <div className="mt-3 flex items-center gap-1">
          {['departed', 'en_route', 'nearby', 'arrived'].map((stage, index) => (
            <div
              key={stage}
              className={`flex-1 h-1 rounded ${
                journeyStatus && ['departed', 'en_route', 'nearby', 'arrived'].indexOf(journeyStatus.status) >= index
                  ? 'bg-blue-500'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Departed</span>
          <span>En Route</span>
          <span>Nearby</span>
          <span>Arrived</span>
        </div>

        {/* Last Updated */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default CustomerOnTheWayNotification;