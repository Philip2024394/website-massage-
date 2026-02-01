// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
/**
 * 🔍 FACEBOOK AI COMPLIANCE - ADMIN ERROR NOTIFICATION SYSTEM
 * 
 * This component provides real-time error monitoring and notifications
 * for admin testing of the booking flow compliance.
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Eye, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface ComplianceError {
  id: string;
  type: 'redirect' | 'navigation' | 'booking-failure' | 'chat-failure' | 'infrastructure';
  message: string;
  component: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AdminErrorNotificationProps {
  isVisible?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const AdminErrorNotification: React.FC<AdminErrorNotificationProps> = ({
  isVisible = true,
  position = 'top-right'
}) => {
  const [errors, setErrors] = useState<ComplianceError[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  // Monitor for booking flow compliance errors
  useEffect(() => {
    if (!isMonitoring) return;

    const checkInterval = setInterval(() => {
      performComplianceCheck();
      setLastCheck(new Date());
    }, 2000); // Check every 2 seconds

    // Listen for custom error events
    const handleComplianceError = (event: CustomEvent<ComplianceError>) => {
      addError(event.detail);
    };

    window.addEventListener('booking-compliance-error', handleComplianceError as EventListener);
    
    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('booking-compliance-error', handleComplianceError as EventListener);
    };
  }, [isMonitoring]);

  const performComplianceCheck = () => {
    // Check for URL changes (redirects)
    const currentUrl = window.location.href;
    const expectedUrl = window.sessionStorage.getItem('booking_initial_url');
    
    if (expectedUrl && currentUrl !== expectedUrl && !currentUrl.includes('#')) {
      addError({
        id: Date.now().toString(),
        type: 'redirect',
        message: `Unexpected redirect from ${expectedUrl} to ${currentUrl}`,
        component: 'Navigation',
        timestamp: new Date(),
        severity: 'critical'
      });
    }

    // Check for chat window errors
    const chatWindow = document.querySelector('[data-testid="persistent-chat-window"]');
    const chatError = document.querySelector('.chat-error');
    
    if (chatError) {
      addError({
        id: Date.now().toString(),
        type: 'chat-failure',
        message: chatError.textContent || 'Chat system error detected',
        component: 'PersistentChatWindow',
        timestamp: new Date(),
        severity: 'high'
      });
    }

    // Check for booking form errors
    const bookingError = document.querySelector('.booking-error');
    if (bookingError) {
      addError({
        id: Date.now().toString(),
        type: 'booking-failure',
        message: bookingError.textContent || 'Booking form error detected',
        component: 'BookingFlow',
        timestamp: new Date(),
        severity: 'high'
      });
    }
  };

  const addError = (error: ComplianceError) => {
    setErrors(prev => {
      // Prevent duplicate errors within 5 seconds
      const isDuplicate = prev.some(e => 
        e.type === error.type && 
        e.component === error.component && 
        Math.abs(e.timestamp.getTime() - error.timestamp.getTime()) < 5000
      );
      
      if (isDuplicate) return prev;
      
      return [error, ...prev.slice(0, 9)]; // Keep only last 10 errors
    });
  };

  const clearErrors = () => setErrors([]);
  const toggleMonitoring = () => setIsMonitoring(!isMonitoring);

  const getSeverityColor = (severity: ComplianceError['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: ComplianceError['type']) => {
    switch (type) {
      case 'redirect': return <RefreshCw className="w-4 h-4" />;
      case 'navigation': return <RefreshCw className="w-4 h-4" />;
      case 'chat-failure': return <WifiOff className="w-4 h-4" />;
      case 'booking-failure': return <XCircle className="w-4 h-4" />;
      case 'infrastructure': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4', 
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed ${positionClasses[position]} z-[9999] max-w-md`}>
      {/* Error List */}
      {errors.length > 0 && (
        <div className="space-y-2 max-h-96 ">
          {errors.map((error) => (
            <div
              key={error.id}
              className="bg-white border-l-4 border-red-500 shadow-lg rounded-lg p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded text-white ${getSeverityColor(error.severity)}`}>
                    {getTypeIcon(error.type)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">
                      {error.type.replace('-', ' ').toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-600">{error.component}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {error.timestamp.toLocaleTimeString()}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-800">
                {error.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Global error reporting function for other components to use
declare global {
  interface Window {
    reportBookingComplianceError: (error: Omit<ComplianceError, 'id' | 'timestamp'>) => void;
  }
}

// Initialize global error reporting
if (typeof window !== 'undefined') {
  window.reportBookingComplianceError = (error) => {
    window.dispatchEvent(new CustomEvent('booking-compliance-error', {
      detail: {
        ...error,
        id: Date.now().toString(),
        timestamp: new Date()
      }
    }));
  };
}

export default AdminErrorNotification;