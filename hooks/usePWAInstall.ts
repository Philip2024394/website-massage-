import { useEffect, useState, useCallback } from 'react';

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
      e.preventDefault();
      setDeferredPrompt(e as any);
      // Dispatch custom event for global listeners if needed
      window.dispatchEvent(new CustomEvent('pwa-install-available'));
    };
    window.addEventListener('beforeinstallprompt', handler);

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
    };
  }, [isIOS, standaloneMatch]);

  const requestInstall = useCallback(async () => {
    // Already installed
    if (isInstalled) return { outcome: 'already-installed' };

    // Chromium flow
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      setDeferredPrompt(null); // cannot reuse
      return choiceResult; // { outcome: 'accepted' | 'dismissed' }
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
