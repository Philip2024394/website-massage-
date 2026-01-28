// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Clock, MapPin, User, Phone, Calendar } from 'lucide-react';
import { PWANotificationManager } from '../../lib/pwaFeatures';

interface BookingAlert {
  id: string;
  type: 'booking-alert';
  priority: 'high' | 'normal';
  title: string;
  message: string;
  booking: {
    id: string;
    customerName: string;
    customerPhone: string;
    serviceType: string;
    duration: number;
    location: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  };
  timestamp: number;
  acknowledged: boolean;
}

interface PersistentBookingAlertsProps {
  therapist?: any;
  onAcceptBooking: (bookingId: string) => void;
  onViewBooking: (bookingId: string) => void;
}

const PersistentBookingAlerts: React.FC<PersistentBookingAlertsProps> = ({
  therapist,
  onAcceptBooking,
  onViewBooking
}) => {
  const [alerts, setAlerts] = useState<BookingAlert[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Load initial alerts
    loadPersistentAlerts();

    // Listen for new persistent alerts
    const handleNewAlert = (event: CustomEvent) => {
      const newAlert = event.detail as BookingAlert;
      setAlerts(prev => {
        // Avoid duplicates
        const exists = prev.some(alert => alert.id === newAlert.id);
        if (exists) return prev;
        return [newAlert, ...prev];
      });
    };

    // Listen for acknowledged alerts
    const handleAcknowledged = (event: CustomEvent) => {
      const { alertId } = event.detail;
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    };

    window.addEventListener('persistentBookingAlert', handleNewAlert as EventListener);
    window.addEventListener('bookingAlertAcknowledged', handleAcknowledged as EventListener);

    // Refresh alerts every 30 seconds to catch any missed events
    const refreshInterval = setInterval(loadPersistentAlerts, 30000);

    return () => {
      window.removeEventListener('persistentBookingAlert', handleNewAlert as EventListener);
      window.removeEventListener('bookingAlertAcknowledged', handleAcknowledged as EventListener);
      clearInterval(refreshInterval);
    };
  }, []);

  const loadPersistentAlerts = () => {
    const persistentAlerts = PWANotificationManager.getPersistentBookingAlerts();
    setAlerts(persistentAlerts);
  };

  const handleAcknowledge = (alertId: string) => {
    PWANotificationManager.acknowledgeBookingAlert(alertId);
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleAccept = (alert: BookingAlert) => {
    handleAcknowledge(alert.id);
    onAcceptBooking(alert.booking.id);
  };

  const handleView = (alert: BookingAlert) => {
    handleAcknowledge(alert.id);
    onViewBooking(alert.booking.id);
  };

  const handleDismiss = (alertId: string) => {
    handleAcknowledge(alertId);
  };

  // Only show high priority (pending booking) alerts
  const highPriorityAlerts = alerts.filter(alert => 
    alert.priority === 'high' && 
    alert.booking.status === 'pending'
  );

  if (highPriorityAlerts.length === 0 || !isVisible) {
    return null;
  }

  // Show the most recent high priority alert
  const currentAlert = highPriorityAlerts[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full border-4 border-red-500 animate-pulse">
        {/* Header */}
        <div className="bg-red-500 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2 animate-bounce" />
            <h2 className="text-lg font-bold">🚨 NEW BOOKING REQUEST!</h2>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:bg-red-600 p-1 rounded"
            title="Hide (will reappear until acknowledged)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {currentAlert.booking.customerName} wants a massage!
            </h3>
            <p className="text-gray-600 mb-4">
              Respond quickly to secure this booking opportunity.
            </p>
          </div>

          {/* Booking Details */}
          <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center text-sm">
              <User className="w-4 h-4 mr-2 text-gray-500" />
              <span className="font-medium">{currentAlert.booking.customerName}</span>
            </div>
            {/* 🔒 PRIVACY RULE: Customer phone/WhatsApp hidden from therapists */}
            {/* Therapists must use in-app chat for communication */}
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2 text-gray-500" />
              <span>{currentAlert.booking.duration} min {currentAlert.booking.serviceType}</span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
              <span>{currentAlert.booking.location}</span>
            </div>
            <div className="flex items-center text-sm font-medium text-orange-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{currentAlert.booking.date} at {currentAlert.booking.time}</span>
            </div>
          </div>

          {/* Urgency Message */}
          <div className="bg-orange-50 border-l-4 border-orange-400 p-3 mb-6">
            <p className="text-orange-800 text-sm font-medium">
              ⏰ This request expires soon. Accept now to secure the booking!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => handleAccept(currentAlert)}
              className="flex-1 bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              ✅ Accept Booking
            </button>
            <button
              onClick={() => handleView(currentAlert)}
              className="flex-1 bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              👁️ View Details
            </button>
          </div>

          {/* Dismiss Option */}
          <button
            onClick={() => handleDismiss(currentAlert.id)}
            className="w-full mt-3 text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            Dismiss (I'll check later)
          </button>
        </div>

        {/* Footer */}
        {highPriorityAlerts.length > 1 && (
          <div className="bg-gray-50 px-6 py-3 rounded-b-lg border-t">
            <p className="text-xs text-gray-600 text-center">
              +{highPriorityAlerts.length - 1} more booking request{highPriorityAlerts.length - 1 > 1 ? 's' : ''} waiting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersistentBookingAlerts;