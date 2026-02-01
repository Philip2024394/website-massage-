// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
/**
 * 🛡️ ERROR FALLBACK PAGE
 * Professional full-page error display
 * Used when errors can't be recovered inline
 */

import React from 'react';
import { AlertCircle, RefreshCw, Home, MessageCircle } from 'lucide-react';

export interface ErrorFallbackPageProps {
  errorType?: 'critical' | 'maintenance' | 'notfound' | 'unauthorized';
  message?: string;
  showContactSupport?: boolean;
}

/**
 * Full-page error fallback - used for critical errors
 */
export function ErrorFallbackPage({
  errorType = 'critical',
  message,
  showContactSupport = true
}: ErrorFallbackPageProps) {
  
  const errorConfigs = {
    critical: {
      title: 'Service Temporarily Unavailable',
      defaultMessage: 'We are experiencing technical difficulties. Our team has been notified and is working to resolve this quickly.',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    maintenance: {
      title: 'Scheduled Maintenance',
      defaultMessage: 'We are currently performing scheduled maintenance to improve your experience. We will be back shortly!',
      icon: AlertCircle,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    notfound: {
      title: 'Page Not Found',
      defaultMessage: 'The page you are looking for does not exist or has been moved.',
      icon: AlertCircle,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    unauthorized: {
      title: 'Access Denied',
      defaultMessage: 'You do not have permission to access this page. Please log in or contact support.',
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  };

  const config = errorConfigs[errorType];
  const displayMessage = message || config.defaultMessage;
  const IconComponent = config.icon;

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleContactSupport = () => {
    const whatsappMessage = encodeURIComponent(
      `Hello, I'm experiencing an issue with the website. Error type: ${errorType}`
    );
    window.open(`https://wa.me/6281392000050?text=${whatsappMessage}`, '_blank');
  };

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`w-24 h-24 ${config.bgColor} rounded-full flex items-center justify-center`}>
              <IconComponent className={`w-14 h-14 ${config.iconColor}`} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
            {config.title}
          </h1>

          {/* Message */}
          <p className="text-lg text-gray-600 text-center mb-8 leading-relaxed max-w-lg mx-auto">
            {displayMessage}
          </p>

          {/* Action Buttons */}
          <div className="space-y-4 max-w-md mx-auto">
            <button
              onClick={handleRefresh}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
            >
              <RefreshCw className="w-6 h-6" />
              Try Again
            </button>

            <button
              onClick={handleGoHome}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3"
            >
              <Home className="w-6 h-6" />
              Go to Homepage
            </button>

            {showContactSupport && (
              <button
                onClick={handleContactSupport}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-3"
              >
                <MessageCircle className="w-6 h-6" />
                Contact Support
              </button>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Error Reference: {errorType.toUpperCase()}-{Date.now().toString().slice(-6)}
            </p>
            <p className="text-xs text-gray-400 text-center mt-2">
              Our technical team has been automatically notified of this issue.
            </p>
          </div>
        </div>

        {/* Additional Help Card */}
        <div className="mt-6 bg-white bg-opacity-50 backdrop-blur-sm rounded-2xl p-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Need immediate assistance?</strong>
          </p>
          <p className="text-sm text-gray-500">
            Our support team is available 24/7 via WhatsApp
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Redirect to error page
 */
export function redirectToErrorPage(errorType: ErrorFallbackPageProps['errorType'] = 'critical', message?: string) {
  // Store error info in sessionStorage
  sessionStorage.setItem('errorPageInfo', JSON.stringify({ errorType, message }));
  
  // Redirect to error page
  window.location.href = '/error';
}
