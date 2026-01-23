/**
 * ErrorRecoveryUI Component
 * Handles various error states in the booking flow with recovery options
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Phone, 
  MessageSquare, 
  Wifi, 
  WifiOff,
  Clock,
  XCircle,
  CheckCircle,
  Info
} from 'lucide-react';

export type ErrorType = 
  | 'connection'
  | 'timeout'
  | 'therapist_unavailable'
  | 'payment_failed'
  | 'location_error'
  | 'booking_conflict'
  | 'service_error'
  | 'unknown';

interface ErrorRecoveryUIProps {
  errorType: ErrorType;
  errorMessage?: string;
  canRetry?: boolean;
  canCancel?: boolean;
  canContactSupport?: boolean;
  isRetrying?: boolean;
  retryCount?: number;
  maxRetries?: number;
  onRetry?: () => void;
  onCancel?: () => void;
  onContactSupport?: () => void;
  supportPhone?: string;
  supportChat?: boolean;
}

export const ErrorRecoveryUI: React.FC<ErrorRecoveryUIProps> = ({
  errorType,
  errorMessage,
  canRetry = true,
  canCancel = true,
  canContactSupport = true,
  isRetrying = false,
  retryCount = 0,
  maxRetries = 3,
  onRetry,
  onCancel,
  onContactSupport,
  supportPhone = "+1 (555) 123-4567",
  supportChat = true
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [autoRetryCountdown, setAutoRetryCountdown] = useState<number | null>(null);

  const getErrorConfig = (type: ErrorType) => {
    switch (type) {
      case 'connection':
        return {
          icon: <WifiOff className="w-8 h-8" />,
          title: 'Connection Lost',
          description: 'Unable to connect to our servers. Please check your internet connection.',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          suggestions: [
            'Check your WiFi or mobile data connection',
            'Try refreshing the page',
            'Contact support if the issue persists'
          ],
          autoRetry: true
        };
      
      case 'timeout':
        return {
          icon: <Clock className="w-8 h-8" />,
          title: 'Request Timed Out',
          description: 'The request took too long to complete. This might be due to high demand.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          suggestions: [
            'Wait a moment and try again',
            'Server might be experiencing high load',
            'Consider trying during off-peak hours'
          ],
          autoRetry: true
        };
      
      case 'therapist_unavailable':
        return {
          icon: <XCircle className="w-8 h-8" />,
          title: 'Therapist Unavailable',
          description: 'The selected therapist is no longer available for this time slot.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          suggestions: [
            'Choose a different therapist',
            'Select an alternative time slot',
            'We can search for available therapists nearby'
          ],
          autoRetry: false
        };
      
      case 'payment_failed':
        return {
          icon: <XCircle className="w-8 h-8" />,
          title: 'Payment Failed',
          description: 'There was an issue processing your payment. Please check your payment method.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          suggestions: [
            'Check your card details and billing information',
            'Ensure sufficient funds are available',
            'Try a different payment method',
            'Contact your bank if the issue continues'
          ],
          autoRetry: false
        };
      
      case 'location_error':
        return {
          icon: <AlertTriangle className="w-8 h-8" />,
          title: 'Location Access Required',
          description: 'We need access to your location to find nearby therapists and provide accurate arrival times.',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          suggestions: [
            'Allow location access in your browser settings',
            'Manually enter your address',
            'Check if location services are enabled'
          ],
          autoRetry: false
        };
      
      case 'booking_conflict':
        return {
          icon: <AlertTriangle className="w-8 h-8" />,
          title: 'Booking Conflict',
          description: 'This time slot is no longer available. Another customer may have booked it.',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          suggestions: [
            'Choose a different time slot',
            'We can suggest alternative times',
            'Consider booking for tomorrow'
          ],
          autoRetry: false
        };
      
      case 'service_error':
        return {
          icon: <XCircle className="w-8 h-8" />,
          title: 'Service Error',
          description: 'There was a temporary issue with our booking system.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          suggestions: [
            'Please try again in a few moments',
            'Our technical team has been notified',
            'Contact support for immediate assistance'
          ],
          autoRetry: true
        };
      
      default:
        return {
          icon: <AlertTriangle className="w-8 h-8" />,
          title: 'Something Went Wrong',
          description: errorMessage || 'An unexpected error occurred. Please try again.',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          suggestions: [
            'Try refreshing the page',
            'Check your internet connection',
            'Contact support if the issue persists'
          ],
          autoRetry: true
        };
    }
  };

  const config = getErrorConfig(errorType);
  const canRetryMore = retryCount < maxRetries;

  return (
    <div className={`mx-4 mb-4 p-6 rounded-xl border-2 ${config.bgColor} ${config.borderColor}`}>
      {/* Error Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className={config.color}>
          {config.icon}
        </div>
        <div>
          <h3 className={`font-bold text-lg ${config.color}`}>{config.title}</h3>
          <p className="text-gray-600">{config.description}</p>
        </div>
      </div>

      {/* Retry Information */}
      {canRetry && (
        <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Attempt {retryCount + 1} of {maxRetries}
            </span>
            {isRetrying && (
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Retrying...</span>
              </div>
            )}
          </div>
          {canRetryMore && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((retryCount + 1) / maxRetries) * 100}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Suggestions */}
      <div className="mb-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          <Info className="w-4 h-4" />
          {showDetails ? 'Hide' : 'Show'} troubleshooting suggestions
        </button>
        
        {showDetails && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-2">What you can try:</h4>
            <ul className="space-y-1">
              {config.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {/* Primary Actions */}
        <div className="flex gap-3">
          {canRetry && canRetryMore && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </button>
          )}
          
          {canCancel && (
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Cancel Booking
            </button>
          )}
        </div>

        {/* Support Actions */}
        {canContactSupport && (
          <div className="border-t pt-3 mt-2">
            <p className="text-sm text-gray-600 mb-3 text-center">
              Need help? Our support team is here to assist you.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => window.open(`tel:${supportPhone}`)}
                className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Support
              </button>
              
              {supportChat && (
                <button
                  onClick={onContactSupport}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Live Chat
                </button>
              )}
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              Phone: {supportPhone} • Available 24/7
            </p>
          </div>
        )}
      </div>

      {/* Max Retries Reached */}
      {!canRetryMore && canRetry && (
        <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Maximum retry attempts reached</span>
          </div>
          <p className="text-sm text-red-600 mt-1">
            Please contact support or try booking again later.
          </p>
        </div>
      )}
    </div>
  );
};