/**
 * PWA Installation Status Utilities
 * Centralized PWA installation detection and state management
 */

export interface PWAInstallationStatus {
  isInstalled: boolean;
  isInstallable: boolean;
  canInstall: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'other';
  installMethod: 'native' | 'manual' | 'unavailable';
  hasNotificationPermission: boolean;
  needsServiceWorker: boolean;
}

export class PWAInstallationStatusChecker {
  /**
   * Comprehensive PWA installation status check
   */
  static checkStatus(): PWAInstallationStatus {
    // Platform detection
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    const isMobile = isIOS || isAndroid;
    
    let platform: PWAInstallationStatus['platform'] = 'other';
    if (isIOS) platform = 'ios';
    else if (isAndroid) platform = 'android';
    else if (!isMobile) platform = 'desktop';

    // Installation detection
    const isInstalled = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      localStorage.getItem('pwa-install-completed') === 'true' ||
      localStorage.getItem('pwa-installed') === 'true';

    // Installability detection
    const hasDeferredPrompt = !!(window as any).deferredPrompt;
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasManifest = !!document.querySelector('link[rel="manifest"]');
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';

    const canInstall = hasServiceWorker && hasManifest && isSecure && !isInstalled;
    const isInstallable = canInstall && (hasDeferredPrompt || isIOS);

    // Install method determination
    let installMethod: PWAInstallationStatus['installMethod'] = 'unavailable';
    if (hasDeferredPrompt) installMethod = 'native';
    else if (isIOS && canInstall) installMethod = 'manual';
    else if (!canInstall) installMethod = 'unavailable';

    // Notification permission
    const hasNotificationPermission = 
      'Notification' in window && Notification.permission === 'granted';

    const needsServiceWorker = !hasServiceWorker;

    return {
      isInstalled,
      isInstallable,
      canInstall,
      platform,
      installMethod,
      hasNotificationPermission,
      needsServiceWorker
    };
  }

  /**
   * Get installation instructions based on platform and status
   */
  static getInstallationInstructions(status: PWAInstallationStatus): string {
    if (status.isInstalled) {
      return '✅ App is already installed and ready to use!';
    }

    if (!status.canInstall) {
      if (!status.needsServiceWorker) {
        return '⚠️ PWA installation requires HTTPS and a web manifest.';
      }
      return '⚠️ PWA installation not supported on this browser.';
    }

    switch (status.platform) {
      case 'ios':
        return '📱 iOS: Tap Share (⬆️) → "Add to Home Screen" → "Add"';
      
      case 'android':
        if (status.installMethod === 'native') {
          return '📱 Android: Tap the install button or browser menu → "Install app"';
        }
        return '📱 Android: Browser menu (⋮) → "Add to Home screen"';
      
      default:
        if (status.installMethod === 'native') {
          return '💻 Desktop: Click the install button or look for install prompt';
        }
        return '💻 Desktop: Browser menu → "Install [App Name]"';
    }
  }

  /**
   * Enhanced installation trigger with better error handling
   */
  static async triggerInstallation(): Promise<{
    success: boolean;
    result?: string;
    error?: string;
  }> {
    const status = this.checkStatus();

    if (status.isInstalled) {
      return { success: false, error: 'App is already installed' };
    }

    if (!status.canInstall) {
      return { 
        success: false, 
        error: 'Installation not available: ' + this.getInstallationInstructions(status)
      };
    }

    // Try native installation
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt && status.installMethod === 'native') {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          localStorage.setItem('pwa-install-completed', 'true');
          localStorage.setItem('pwa-installed', 'true');
          
          // Request notifications if not granted
          if ('Notification' in window && Notification.permission === 'default') {
            setTimeout(async () => {
              await Notification.requestPermission();
            }, 1000);
          }
          
          return { success: true, result: 'accepted' };
        } else {
          return { success: false, result: 'dismissed' };
        }
      } catch (error) {
        return { 
          success: false, 
          error: `Installation failed: ${(error as Error).message}` 
        };
      }
    }

    // Manual installation instructions
    if (status.installMethod === 'manual') {
      alert(this.getInstallationInstructions(status));
      return { success: true, result: 'manual-instructions-shown' };
    }

    return { 
      success: false, 
      error: 'No installation method available' 
    };
  }

  /**
   * Mark app as manually installed (for platforms that can't be detected)
   */
  static markAsInstalled(): void {
    localStorage.setItem('pwa-install-completed', 'true');
    localStorage.setItem('pwa-installed', 'true');
  }

  /**
   * Clear installation status (for testing)
   */
  static clearInstallationStatus(): void {
    localStorage.removeItem('pwa-install-completed');
    localStorage.removeItem('pwa-installed');
    localStorage.removeItem('pwa-added-to-homescreen');
  }
}

/**
 * React hook for PWA installation status
 */
export function usePWAInstallationStatus() {
  const [status, setStatus] = React.useState<PWAInstallationStatus>(() => 
    PWAInstallationStatusChecker.checkStatus()
  );

  React.useEffect(() => {
    const updateStatus = () => {
      setStatus(PWAInstallationStatusChecker.checkStatus());
    };

    // Listen for PWA-related events
    window.addEventListener('beforeinstallprompt', updateStatus);
    window.addEventListener('appinstalled', updateStatus);
    window.addEventListener('pwa-install-available', updateStatus);
    
    // Check for changes in display mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', updateStatus);

    return () => {
      window.removeEventListener('beforeinstallprompt', updateStatus);
      window.removeEventListener('appinstalled', updateStatus);
      window.removeEventListener('pwa-install-available', updateStatus);
      mediaQuery.removeEventListener('change', updateStatus);
    };
  }, []);

  const triggerInstall = React.useCallback(async () => {
    const result = await PWAInstallationStatusChecker.triggerInstallation();
    // Update status after installation attempt
    setStatus(PWAInstallationStatusChecker.checkStatus());
    return result;
  }, []);

  return {
    ...status,
    triggerInstall,
    instructions: PWAInstallationStatusChecker.getInstallationInstructions(status),
    clearStatus: PWAInstallationStatusChecker.clearInstallationStatus
  };
}

// For non-React usage
declare global {
  interface Window {
    deferredPrompt?: any;
  }
}

// Auto-import React if available
let React: any;
try {
  React = require('react');
} catch {
  // React not available, hooks won't work but utilities will
}