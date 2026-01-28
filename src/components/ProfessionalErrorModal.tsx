/**
 * 🎨 PROFESSIONAL ERROR MODAL
 * User-friendly error display - never shows raw errors
 * Always provides helpful guidance
 */

import React from 'react';
import { AlertCircle, RefreshCw, Home, X } from 'lucide-react';

export interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorType?: 'network' | 'auth' | 'feature' | 'booking' | 'payment' | 'generic';
  customMessage?: string;
  showHomeButton?: boolean;
  showRefreshButton?: boolean;
  onRetry?: () => void;
}

/**
 * Professional error modal - never shows raw error messages to users
 */
export function ProfessionalErrorModal({
  isOpen,
  onClose,
  errorType = 'generic',
  customMessage,
  showHomeButton = true,
  showRefreshButton = true,
  onRetry
}: ErrorModalProps) {
  if (!isOpen) return null;

  const errorMessages = {
    network: {
      title: 'Connection Issue',
      message: 'We are having trouble connecting to our servers. Please check your internet connection and try again.',
      icon: '🌐',
      color: 'blue'
    },
    auth: {
      title: 'Authentication Required',
      message: 'Your session has expired. Please log in again to continue.',
      icon: '🔐',
      color: 'yellow'
    },
    feature: {
      title: 'Feature Temporarily Unavailable',
      message: 'This feature is currently being updated. We will have it back up shortly. Thank you for your patience!',
      icon: '🔧',
      color: 'orange'
    },
    booking: {
      title: 'Booking Issue',
      message: 'We could not process your booking at this time. Your information is safe. Please try again in a moment.',
      icon: '📅',
      color: 'red'
    },
    payment: {
      title: 'Payment Processing',
      message: 'We encountered an issue processing your payment. Don\'t worry - no charges were made. Please try again.',
      icon: '💳',
      color: 'red'
    },
    generic: {
      title: 'Something Went Wrong',
      message: 'We encountered an unexpected issue. Our team has been notified and is working on it.',
      icon: '⚠️',
      color: 'gray'
    }
  };

  const errorConfig = errorMessages[errorType];
  const displayMessage = customMessage || errorConfig.message;

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    gray: 'bg-gray-100 text-gray-600'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-slideUp">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${colorClasses[errorConfig.color as keyof typeof colorClasses]}`}>
            <span className="text-3xl">{errorConfig.icon}</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
          {errorConfig.title}
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6 leading-relaxed">
          {displayMessage}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          )}

          {showRefreshButton && !onRetry && (
            <button
              onClick={handleRefresh}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Page
            </button>
          )}

          {showHomeButton && (
            <button
              onClick={handleGoHome}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go to Homepage
            </button>
          )}

          {!showHomeButton && !showRefreshButton && !onRetry && (
            <button
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all"
            >
              Close
            </button>
          )}
        </div>

        {/* Help text */}
        <p className="text-xs text-gray-500 text-center mt-6">
          If this problem continues, please contact our support team.
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

/**
 * Hook for managing error modal state
 */
export function useErrorModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [errorType, setErrorType] = React.useState<ErrorModalProps['errorType']>('generic');
  const [customMessage, setCustomMessage] = React.useState<string>();

  const showError = (
    type: ErrorModalProps['errorType'] = 'generic',
    message?: string
  ) => {
    setErrorType(type);
    setCustomMessage(message);
    setIsOpen(true);
  };

  const hideError = () => {
    setIsOpen(false);
    // Clear message after animation
    setTimeout(() => {
      setErrorType('generic');
      setCustomMessage(undefined);
    }, 300);
  };

  return {
    isOpen,
    errorType,
    customMessage,
    showError,
    hideError
  };
}
