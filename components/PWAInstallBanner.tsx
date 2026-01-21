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
    
    // NEW: Check if mobile device first
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobileDevice) {
      console.log('PWA Install Banner: Not a mobile device, not showing');
      return;
    }
    
    // Check if already installed - MULTIPLE CHECKS
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const isInstalled = localStorage.getItem('pwa-install-completed') === 'true';
    const runningAsApp = window.matchMedia('(display-mode: standalone)').matches || 
                         window.matchMedia('(display-mode: fullscreen)').matches ||
                         window.matchMedia('(display-mode: minimal-ui)').matches;
    
    console.log('PWA Install Banner: Standalone mode?', isStandalone);
    console.log('PWA Install Banner: iOS web app?', isInWebAppiOS);
    console.log('PWA Install Banner: Running as app?', runningAsApp);
    console.log('PWA Install Banner: Install completed flag?', isInstalled);

    // Don't show if already installed OR running as app
    if (isStandalone || isInWebAppiOS || isInstalled || runningAsApp) {
      console.log('PWA Install Banner: ✅ App already installed/running, not showing banner');
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
    console.log('PWA Install Banner: User agent:', navigator.userAgent);
    console.log('PWA Install Banner: Is standalone mode:', (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches);
    setIsIOS(iOS);

    // For non-iOS devices, capture install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      // Double-check not already installed
      const alreadyInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone === true ||
                               localStorage.getItem('pwa-install-completed') === 'true';
      
      if (alreadyInstalled) {
        console.log('PWA Install Banner: ⛔ App already installed, ignoring install prompt');
        return;
      }
      
      console.log('PWA Install Banner: ✅ beforeinstallprompt event fired - install prompt available!');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check after 3 seconds if prompt didn't fire
    const promptCheckTimer = setTimeout(() => {
      if (!iOS) {
        console.log('PWA Install Banner: ⚠️ beforeinstallprompt did NOT fire within 3 seconds');
        console.log('PWA Install Banner: Possible reasons:');
        console.log('  - App already installed');
        console.log('  - Browser doesn\'t support PWA installation');
        console.log('  - PWA requirements not met (manifest, service worker, HTTPS)');
        console.log('  - User previously dismissed the install prompt');
      }
    }, 3000);

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
      clearTimeout(promptCheckTimer);
    };
  }, []);

  const handleInstall = async () => {
    console.log('PWA Install: Install button clicked');
    
    // FIRST: Check if already installed - ALWAYS check this first
    const alreadyInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                             (window.navigator as any).standalone === true ||
                             localStorage.getItem('pwa-install-completed') === 'true';
    
    if (alreadyInstalled) {
      console.log('PWA Install: ⛔ Already installed, not showing anything');
      setShowBanner(false);
      return;
    }
    
    if (!deferredPrompt) {
      console.log('PWA Install: ⚠️ No install prompt available');
      
      // Detect platform - MOBILE ONLY
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/i.test(navigator.userAgent);
      
      if (isIOS) {
        // iOS SIMPLE instructions
        alert(
          '📱 TO INSTALL ON iPHONE/iPAD:\n\n' +
          '1️⃣ Tap Share button (⬆️) at bottom\n' +
          '2️⃣ Scroll down\n' +
          '3️⃣ Tap "Add to Home Screen"\n' +
          '4️⃣ Tap "Add"\n\n' +
          '✅ App icon will appear on home screen!'
        );
      } else if (isAndroid) {
        // Android SIMPLE instructions
        alert(
          '📱 TO INSTALL ON ANDROID:\n\n' +
          '1️⃣ Tap menu button (3 dots ⋮)\n' +
          '2️⃣ Look for "Install app"\n' +
          '3️⃣ Or "Add to Home screen"\n' +
          '4️⃣ Tap to install\n\n' +
          '✅ App will open automatically!'
        );
      } else {
        // Generic mobile
        alert(
          '📱 TO INSTALL:\n\n' +
          '1️⃣ Open browser menu\n' +
          '2️⃣ Look for "Install" or\n' +
          '   "Add to Home Screen"\n' +
          '3️⃣ Follow prompts\n\n' +
          '✅ Check home screen for app icon!'
        );
      }
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
      
      // Show detailed error-specific instructions
      const errorMsg = String(error);
      if (errorMsg.includes('user gesture')) {
        alert('⚠️ Installation requires a user action.\n\nPlease try:\n1. Tap the install button again\n2. Or use your browser\'s menu to install');
      } else {
        alert('Installation failed. Please try adding the app manually from your browser menu.\n\nLook for "Add to Home Screen" or "Install App" option.');
      }
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
    localStorage.removeItem('pwa-install-completed');
    console.log('PWA Install Banner: ✅ Cleared all dismissal flags from localStorage');
    setShowBanner(true);
    alert('✅ Installation banner reset!\n\nThe banner should now appear again.');
  };

  // Get PWA status for debugging
  const getPWAStatus = () => {
    const status = {
      isInstalled: localStorage.getItem('pwa-install-completed') === 'true',
      isDismissed: localStorage.getItem('pwa-banner-dismissed') === 'true',
      dismissedTime: localStorage.getItem('pwa-banner-dismissed-time'),
      isStandalone: (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches,
      hasPrompt: !!deferredPrompt,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      userAgent: navigator.userAgent
    };
    console.log('PWA Status:', status);
    return status;
  };

  // For debugging - call these in console
  if (typeof window !== 'undefined') {
    (window as any).clearPWADismissal = clearDismissal;
    (window as any).getPWAStatus = getPWAStatus;
    (window as any).showPWABanner = () => {
      setShowBanner(true);
      console.log('PWA Install Banner: Manually showing banner');
    };
  }

  if (!showBanner) {
    console.log('PWA Install Banner: Not showing banner, showBanner =', showBanner);
    return null;
  }

  console.log('PWA Install Banner: Rendering banner! isIOS =', isIOS, 'deferredPrompt =', !!deferredPrompt);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-2xl transition-transform duration-500 ease-out transform translate-y-0" style={{
      animation: 'slideDown 0.5s ease-out'
    }}>
      <style {...({} as any)}>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); }
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
