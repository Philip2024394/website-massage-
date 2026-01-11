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
    
    // Check if banner was dismissed
    const wasDismissed = localStorage.getItem('pwa-banner-dismissed') === 'true';
    console.log('PWA Install Banner: Was dismissed?', wasDismissed);
    
    // Check if already installed (removed isDismissed check to always show banner)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    console.log('PWA Install Banner: Already installed?', isStandalone || isInWebAppiOS);

    // Don't show if already installed
    if (isStandalone || isInWebAppiOS) {
      console.log('PWA Install Banner: App already installed, not showing banner');
      return;
    }

    // Don't show if user has dismissed it (unless it's been more than 7 days)
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

    // For iOS or if no beforeinstallprompt event, show banner after delay
    const showBannerTimer = setTimeout(() => {
      console.log('PWA Install Banner: Timer expired, showing banner for iOS or fallback');
      if (iOS || !deferredPrompt) {
        setShowBanner(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(showBannerTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA installed');
        localStorage.setItem('pwa-install-completed', 'true');
      }
      
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-banner-dismissed', 'true');
    localStorage.setItem('pwa-banner-dismissed-time', Date.now().toString());
    setShowBanner(false);
    onDismiss?.();
  };

  if (!showBanner) {
    console.log('PWA Install Banner: Not showing banner, showBanner =', showBanner);
    return null;
  }

  console.log('PWA Install Banner: Rendering banner! isIOS =', isIOS, 'deferredPrompt =', !!deferredPrompt);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-2xl transition-transform duration-500 ease-out transform translate-y-0" style={{
      animation: 'slideUp 0.5s ease-out'
    }}>
      <style jsx>{`
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
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstall}
                className="px-3 py-2 sm:px-6 sm:py-3 bg-white text-orange-600 font-bold rounded-lg sm:rounded-xl hover:bg-orange-50 transition-all flex items-center gap-1 sm:gap-2 shadow-lg text-xs sm:text-base"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Install</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="p-1.5 sm:p-2 hover:bg-orange-400 rounded-lg transition-all"
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
