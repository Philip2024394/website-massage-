import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface PWAInstallBannerProps {
  onDismiss?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onDismiss }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    console.log('PWA Install Banner: Checking conditions...');
    
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const isInstalled = localStorage.getItem('pwa-install-completed') === 'true';
    
    console.log('PWA Install Banner: Standalone mode?', isStandalone);
    console.log('PWA Install Banner: iOS web app?', isInWebAppiOS);
    console.log('PWA Install Banner: Install completed?', isInstalled);

    // Don't show if already installed
    if (isStandalone || isInWebAppiOS || isInstalled) {
      console.log('PWA Install Banner: App already installed, not showing banner');
      return;
    }

    // Check if banner was dismissed recently
    const wasDismissed = localStorage.getItem('pwa-banner-dismissed') === 'true';
    if (wasDismissed) {
      const dismissedTime = localStorage.getItem('pwa-banner-dismissed-time');
      const now = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      
      if (dismissedTime && (now - parseInt(dismissedTime)) < sevenDays) {
        console.log('PWA Install Banner: Recently dismissed, not showing');
        return;
      } else {
        // Clear old dismissal after 7 days
        console.log('PWA Install Banner: Dismissal expired, clearing');
        localStorage.removeItem('pwa-banner-dismissed');
        localStorage.removeItem('pwa-banner-dismissed-time');
      }
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    console.log('PWA Install Banner: Is iOS?', iOS);
    setIsIOS(iOS);

    // For non-iOS devices, capture install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('PWA Install Banner: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS or fallback, show banner after short delay
    const showBannerTimer = setTimeout(() => {
      console.log('PWA Install Banner: Timer expired, checking if should show');
      if (iOS || !deferredPrompt) {
        console.log('PWA Install Banner: Showing banner for iOS or as fallback');
        setShowBanner(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(showBannerTimer);
    };
  }, []);

  const handleInstall = async () => {
    console.log('PWA Install: Install button clicked');
    
    if (!deferredPrompt) {
      console.log('PWA Install: No deferred prompt available');
      // For browsers that don't support beforeinstallprompt
      alert('To install this app:\n\n1. Open your browser menu\n2. Look for "Add to Home Screen" or "Install App"\n3. Follow the prompts');
      return;
    }

    try {
      console.log('PWA Install: Showing install prompt');
      await deferredPrompt.prompt();
      
      const choiceResult = await deferredPrompt.userChoice;
      console.log('PWA Install: User choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA Install: Installation accepted');
        localStorage.setItem('pwa-install-completed', 'true');
        setShowBanner(false);
        
        // Show success message
        setTimeout(() => {
          alert('App installed successfully! 🎉\nYou can now find it on your home screen.');
        }, 500);
      } else {
        console.log('PWA Install: Installation dismissed by user');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('PWA Install: Error during installation:', error);
      alert('Installation failed. Please try adding the app manually from your browser menu.');
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-banner-dismissed', 'true');
    localStorage.setItem('pwa-banner-dismissed-time', Date.now().toString());
    console.log('PWA Install Banner: Dismissed and stored in localStorage');
    setShowBanner(false);
    onDismiss?.();
  };

  // Add function to clear localStorage for testing
  const clearDismissal = () => {
    localStorage.removeItem('pwa-banner-dismissed');
    localStorage.removeItem('pwa-banner-dismissed-time');
    console.log('PWA Install Banner: Cleared dismissal from localStorage');
  };

  // For debugging - call this in console: window.clearPWADismissal()
  if (typeof window !== 'undefined') {
    (window as any).clearPWADismissal = clearDismissal;
  }

  if (!showBanner) {
    console.log('PWA Install Banner: Not showing banner, showBanner =', showBanner);
    return null;
  }

  console.log('PWA Install Banner: Rendering banner! isIOS =', isIOS, 'deferredPrompt =', !!deferredPrompt);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-2xl transition-transform duration-500 ease-out transform translate-y-0" style={{
      animation: 'slideUp 0.5s ease-out'
    }}>
      <style {...({} as any)}>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0%); }
        }
      `}</style>
      <div className="max-w-4xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl sm:text-3xl">📱</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-lg leading-tight">APP INSTALLATION</h3>
              <p className="text-xs sm:text-sm text-orange-100 mt-0.5 sm:mt-1 leading-tight">
                {isIOS 
                  ? 'Tap Share (⬆️) → "Add to Home Screen"'
                  : 'Install for notifications & offline access'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Show install button based on platform and availability */}
            {isIOS ? (
              <button
                onClick={() => {
                  alert('To install this app:\n\n📱 Tap the Share button (⬆️)\n➕ Select "Add to Home Screen"\n✅ Confirm installation');
                }}
                className="px-3 py-2 sm:px-6 sm:py-3 bg-white text-orange-600 font-bold rounded-lg sm:rounded-xl hover:bg-orange-50 transition-all flex items-center gap-1 sm:gap-2 shadow-lg text-xs sm:text-base"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Instructions</span>
                <span className="sm:hidden">Help</span>
              </button>
            ) : (
              <button
                onClick={handleInstall}
                className="px-3 py-2 sm:px-6 sm:py-3 bg-white text-orange-600 font-bold rounded-lg sm:rounded-xl hover:bg-orange-50 transition-all flex items-center gap-1 sm:gap-2 shadow-lg text-xs sm:text-base"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Install</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
            
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="p-2 sm:p-3 hover:bg-orange-400 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallBanner;
