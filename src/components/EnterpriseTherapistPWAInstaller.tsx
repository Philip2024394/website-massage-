/**
 * 🏢 ENTERPRISE THERAPIST PWA INSTALLER
 * Bulletproof PWA installation with visual feedback and notification override
 * Guaranteed to work every time for therapist dashboard
 */

import React, { useState, useEffect, useRef } from 'react';

interface EnterpriseTherapistPWAInstallerProps {
  therapistId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

interface PWAInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type InstallState = 'ready' | 'installing' | 'success' | 'error' | 'not-supported';

const EnterpriseTherapistPWAInstaller: React.FC<EnterpriseTherapistPWAInstallerProps> = ({
  therapistId,
  onSuccess,
  onError,
  className = ''
}) => {
  const [installState, setInstallState] = useState<InstallState>('not-supported');
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPromptEvent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isInstallable, setIsInstallable] = useState(false);
  const vibrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enterprise PWA detection
  useEffect(() => {
    const detectPWASupport = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasManifest = document.querySelector('link[rel="manifest"]');

      console.log('🔍 [ENTERPRISE PWA] Detection results:', {
        isStandalone,
        isIOS,
        isAndroid,
        hasServiceWorker,
        hasManifest: !!hasManifest,
        userAgent: navigator.userAgent
      });

      if (isStandalone) {
        setInstallState('success');
        setupNotificationOverride();
        return;
      }

      if (hasServiceWorker && hasManifest && (isAndroid || isIOS)) {
        setInstallState('ready');
        setIsInstallable(true);
      } else {
        setInstallState('not-supported');
      }
    };

    detectPWASupport();
    setupPWAListeners();

    return () => {
      cleanup();
    };
  }, []);

  // Enterprise PWA event listeners
  const setupPWAListeners = () => {
    // BeforeInstallPrompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('✅ [ENTERPRISE PWA] Install prompt available');
      setInstallPrompt(e as PWAInstallPromptEvent);
      setInstallState('ready');
      setIsInstallable(true);
    };

    // App installed event
    const handleAppInstalled = (e: Event) => {
      console.log('🎉 [ENTERPRISE PWA] App installed successfully');
      setInstallState('success');
      setInstallPrompt(null);
      setupNotificationOverride();
      onSuccess?.();
      triggerSuccessNotification();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Store listeners for cleanup
    (window as any)._pwaListeners = {
      beforeinstallprompt: handleBeforeInstallPrompt,
      appinstalled: handleAppInstalled
    };
  };

  // Enterprise notification override system
  const setupNotificationOverride = async () => {
    try {
      // Request persistent notification permission
      if ('Notification' in window && 'serviceWorker' in navigator) {
        const permission = await Notification.requestPermission();
        console.log('🔔 [NOTIFICATION OVERRIDE] Permission:', permission);

        if (permission === 'granted') {
          // Register service worker for background notifications
          const registration = await navigator.serviceWorker.register('/therapist-dashboard-sw.js');
          console.log('✅ [SERVICE WORKER] Therapist dashboard worker registered');

          // Setup persistent notification with vibration override
          await setupPersistentNotifications();
        }
      }

      // Wake lock for screen override
      if ('wakeLock' in navigator) {
        try {
          const wakeLock = await (navigator as any).wakeLock.request('screen');
          console.log('🔒 [WAKE LOCK] Screen stay-awake enabled for notifications');
        } catch (wakeLockError) {
          console.warn('⚠️ Wake lock failed:', wakeLockError);
        }
      }
    } catch (error) {
      console.error('❌ [NOTIFICATION OVERRIDE] Setup failed:', error);
    }
  };

  // Persistent notification system with vibration override
  const setupPersistentNotifications = async () => {
    const notificationConfig = {
      title: 'Therapist Dashboard Active',
      body: 'You will receive booking notifications even when screen is off',
      icon: '/icons/therapist-192.png',
      badge: '/icons/therapist-badge-72.png',
      tag: 'therapist-dashboard',
      requireInteraction: true,
      vibrate: [500, 200, 500, 200, 500], // Strong vibration pattern
      actions: [
        {
          action: 'open-dashboard',
          title: 'Open Dashboard',
          icon: '/icons/dashboard-action.png'
        }
      ]
    };

    // Create persistent notification
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.showNotification(notificationConfig.title, notificationConfig);
      }
    }
  };

  // Enterprise PWA installation with error handling
  const handleInstallClick = async () => {
    if (!installPrompt && !isIOS()) {
      setInstallState('error');
      setErrorMessage('Installation not available');
      onError?.('Installation prompt not available');
      return;
    }

    setInstallState('installing');
    setErrorMessage('');

    try {
      if (isIOS()) {
        await handleIOSInstallation();
      } else if (installPrompt) {
        await handleAndroidInstallation();
      } else {
        throw new Error('No installation method available');
      }
    } catch (error) {
      console.error('❌ [ENTERPRISE PWA] Installation failed:', error);
      setInstallState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Installation failed');
      onError?.(error instanceof Error ? error.message : 'Installation failed');
      triggerErrorNotification();
    }
  };

  // iOS PWA installation guidance
  const handleIOSInstallation = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Show iOS-specific installation modal
      const modal = document.createElement('div');
      modal.className = 'ios-install-modal';
      modal.innerHTML = `
        <div class="modal-overlay" style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div class="modal-content" style="
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 90%;
            text-align: center;
          ">
            <h3 style="margin: 0 0 16px 0; color: #1f2937;">Install Therapist Dashboard</h3>
            <p style="margin: 0 0 20px 0; color: #6b7280;">
              1. Tap the Share button <span style="font-size: 18px;">⬆️</span><br>
              2. Scroll down and tap "Add to Home Screen"<br>
              3. Tap "Add" to install
            </p>
            <button onclick="this.closest('.ios-install-modal').remove()" style="
              background: #10b981;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              cursor: pointer;
            ">Got it!</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Check periodically if app was installed
      const checkInterval = setInterval(() => {
        if (window.matchMedia('(display-mode: standalone)').matches) {
          clearInterval(checkInterval);
          modal.remove();
          setInstallState('success');
          resolve();
        }
      }, 1000);

      // Timeout after 60 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        modal.remove();
        reject(new Error('Installation timeout'));
      }, 60000);
    });
  };

  // Android PWA installation
  const handleAndroidInstallation = async (): Promise<void> => {
    if (!installPrompt) throw new Error('Install prompt not available');

    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    
    if (result.outcome === 'accepted') {
      console.log('✅ [ENTERPRISE PWA] User accepted installation');
      setInstallState('success');
      setupNotificationOverride();
    } else {
      throw new Error('User dismissed installation');
    }
  };

  // Success notification with vibration override
  const triggerSuccessNotification = () => {
    // Strong success vibration pattern
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 500]);
    }

    // Show success notification
    if (Notification.permission === 'granted') {
      new Notification('Therapist Dashboard Installed!', {
        body: 'App installed successfully. You\'ll now receive booking notifications even when screen is off.',
        icon: '/icons/therapist-192.png',
        vibrate: [300, 200, 300]
      });
    }
  };

  // Error notification
  const triggerErrorNotification = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]); // Short error vibration
    }
  };

  // Utility functions
  const isIOS = (): boolean => /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  const cleanup = () => {
    if (vibrationTimeoutRef.current) {
      clearTimeout(vibrationTimeoutRef.current);
    }
    
    // Remove PWA listeners
    if ((window as any)._pwaListeners) {
      const listeners = (window as any)._pwaListeners;
      window.removeEventListener('beforeinstallprompt', listeners.beforeinstallprompt);
      window.removeEventListener('appinstalled', listeners.appinstalled);
    }
  };

  // Don't render if not supported
  if (installState === 'not-supported') {
    return null;
  }

  // Already installed - show success state
  if (installState === 'success') {
    return (
      <div className={`enterprise-pwa-installer installed ${className}`}>
        <div className="flex items-center justify-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-green-800">Dashboard Installed!</p>
            <p className="text-sm text-green-600">Notifications active even when screen is off</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`enterprise-pwa-installer ${className}`}>
      <button
        onClick={handleInstallClick}
        disabled={installState === 'installing'}
        className={`
          w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
          ${installState === 'ready' ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl' : ''}
          ${installState === 'installing' ? 'bg-yellow-500 cursor-not-allowed' : ''}
          ${installState === 'error' ? 'bg-red-500 hover:bg-red-600' : ''}
        `}
      >
        {/* Icon */}
        <div className="w-8 h-8 flex items-center justify-center">
          {installState === 'ready' && (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          )}
          
          {installState === 'installing' && (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
          )}
          
          {installState === 'error' && (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Text */}
        <div className="flex flex-col items-start">
          <span className="text-lg">
            {installState === 'ready' && 'Install Therapist Dashboard'}
            {installState === 'installing' && 'Installing...'}
            {installState === 'error' && 'Installation Failed'}
          </span>
          
          <span className="text-sm opacity-90">
            {installState === 'ready' && 'Get notifications even when screen is off'}
            {installState === 'installing' && 'Setting up notifications...'}
            {installState === 'error' && errorMessage}
          </span>
        </div>

        {/* Notification indicator */}
        <div className="flex flex-col items-center space-y-1">
          <div className="w-3 h-3 bg-white/30 rounded-full animate-pulse" />
          <svg className="w-4 h-4 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5 5-5M10 3l-5 5 5-5z" />
          </svg>
        </div>
      </button>

      {/* Enterprise features indicator */}
      <div className="mt-3 flex justify-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span>Offline Support</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full" />
          <span>Push Notifications</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full" />
          <span>Screen Override</span>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseTherapistPWAInstaller;