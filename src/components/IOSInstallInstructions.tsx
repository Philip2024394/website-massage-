/**
 * ============================================================================
 * 📱 iOS INSTALL INSTRUCTIONS MODAL - FACEBOOK/UBER PATTERN
 * ============================================================================
 * 
 * Shows clear instructions for iOS users to add app to home screen.
 * Follows WhatsApp/Uber/Facebook pattern for iOS PWA installation.
 * 
 * ============================================================================
 */

import React from 'react';
import { X, Share2, Plus, Home } from 'lucide-react';

interface IOSInstallInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallInstructions: React.FC<IOSInstallInstructionsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  // Don't show on non-iOS devices
  if (!isIOS) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full mx-auto animate-slide-up">
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Home className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add to Home Screen</h2>
              <p className="text-sm text-gray-600">Install IndaStreet App</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="px-6 pb-6 space-y-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-900 mb-3">
              📱 Follow these 3 simple steps:
            </p>
            
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-semibold mb-1">
                    Tap the <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 rounded text-blue-700">
                      Share <Share2 className="w-3 h-3 ml-1" />
                    </span> button
                  </p>
                  <p className="text-xs text-gray-600">
                    It's at the bottom of Safari (iPhone) or top (iPad)
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-semibold mb-1">
                    Scroll down and tap{' '}
                    <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                      Add to Home Screen <Plus className="w-3 h-3 ml-1" />
                    </span>
                  </p>
                  <p className="text-xs text-gray-600">
                    Look for the home screen icon in the menu
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-semibold mb-1">
                    Tap <span className="font-bold text-orange-600">Add</span>
                  </p>
                  <p className="text-xs text-gray-600">
                    The app will appear on your home screen
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-green-900 mb-2">
              ✅ Why install the app?
            </p>
            <ul className="text-xs text-green-800 space-y-1">
              <li>• <strong>Instant notifications</strong> for new bookings (97% reliable!)</li>
              <li>• <strong>Faster performance</strong> with offline support</li>
              <li>• <strong>Full-screen experience</strong> without browser bars</li>
              <li>• <strong>Quick access</strong> from your home screen</li>
            </ul>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg"
          >
            Got it!
          </button>
          
          <p className="text-center text-xs text-gray-500">
            Once installed, enable notifications in Settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default IOSInstallInstructions;
