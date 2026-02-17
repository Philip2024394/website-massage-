import { useEffect, useState, useCallback } from 'react';
import { checkPWAUpdateBeforeInstall } from '../utils/checkPWAUpdateBeforeInstall';

/**
 * Hook: usePWAInstall
 * Captures the beforeinstallprompt event (Chromium) and provides a requestInstall() API.
 * Falls back to iOS instruction detection where programmatic prompt is unavailable.
 */
export interface PWAInstallState {
  isSupported: boolean;            // Chromium prompt available
  isInstalled: boolean;            // Running in standalone / already installed
  deferredPrompt: any | null;      // Raw beforeinstallprompt event
  isIOS: boolean;                  // iOS device detection
  showIOSInstructions: boolean;    // Should show manual iOS A2HS instructions
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standaloneMatch = window.matchMedia('(display-mode: standalone)').matches || (window as any).navigator.standalone === true;

  useEffect(() => {
    const handler = (e: Event) => {
      // Only handle once
      console.log('🚀 [PWA] beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as any);
      // Store globally for other components
      (window as any).deferredPrompt = e;
      // Dispatch custom event for global listeners if needed
      window.dispatchEvent(new CustomEvent('pwa-install-available'));
    };
    
    // Listen for service worker ready event
    const handleSWReady = () => {
      console.log('🔧 [PWA] Service worker ready, listening for install prompt');
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('sw-registered', handleSWReady);

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowIOSInstructions(false);
    };
    window.addEventListener('appinstalled', onAppInstalled);

    // Initial install state
    if (standaloneMatch) {
      setIsInstalled(true);
    } else if (isIOS) {
      // If not installed and iOS, we can show instructions later when user acts
      setShowIOSInstructions(false); // lazy enable via requestInstall
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onAppInstalled);
      window.removeEventListener('sw-registered', handleSWReady);
    };
  }, [isIOS, standaloneMatch]);

  const requestInstall = useCallback(async () => {
    // Already installed
    if (isInstalled) return { outcome: 'already-installed' };

    // Chromium flow: ELITE – check for update before showing install prompt
    if (deferredPrompt) {
      return new Promise<{ outcome: 'accepted' | 'dismissed' }>((resolve) => {
        checkPWAUpdateBeforeInstall(async () => {
          deferredPrompt.prompt();
          const choiceResult = await deferredPrompt.userChoice;
          setDeferredPrompt(null); // cannot reuse
          resolve(choiceResult);
        });
      });
    }

    // iOS manual flow
    if (isIOS) {
      setShowIOSInstructions(true);
      return { outcome: 'ios-instructions' };
    }

    return { outcome: 'unavailable' };
  }, [deferredPrompt, isInstalled, isIOS]);

  return {
    isSupported: !!deferredPrompt,
    isInstalled,
    deferredPrompt,
    isIOS,
    showIOSInstructions,
    requestInstall,
    setShowIOSInstructions,
  } as PWAInstallState & { requestInstall: typeof requestInstall; setShowIOSInstructions: typeof setShowIOSInstructions };
};
