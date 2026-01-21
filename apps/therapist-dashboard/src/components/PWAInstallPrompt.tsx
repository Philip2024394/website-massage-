// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Bell, CheckCircle2, Clock, Loader2 } from 'lucide-react';

interface PWAInstallPromptProps {
  dashboardName?: string;
}

type InstallState = 'idle' | 'waiting' | 'downloading' | 'installed';

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ dashboardName = 'Dashboard' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installState, setInstallState] = useState<InstallState>('idle');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);
  
  // Technical validation states
  const [manifestValid, setManifestValid] = useState(false);
  const [serviceWorkerActive, setServiceWorkerActive] = useState(false);
  const [isHTTPS, setIsHTTPS] = useState(false);

  useEffect(() => {
    console.log('PWA Dashboard: Initializing...');
    
    // Validate technical requirements
    validatePWARequirements();
    
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const isInstalled = localStorage.getItem('pwa-install-completed') === 'true';
    const runningAsApp = window.matchMedia('(display-mode: standalone)').matches || 
                         window.matchMedia('(display-mode: fullscreen)').matches ||
                         window.matchMedia('(display-mode: minimal-ui)').matches;
    
    if (isStandalone || isInWebAppiOS || isInstalled || runningAsApp) {
      console.log('PWA Dashboard: ✅ App already installed');
      setInstallState('installed');
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Check not already installed
      const alreadyInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone === true ||
                               localStorage.getItem('pwa-install-completed') === 'true';
      
      if (alreadyInstalled) {
        console.log('PWA Dashboard: ⛔ App already installed, ignoring prompt');
        return;
      }
      
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
      setInstallState('waiting');
      console.log('PWA Dashboard: ✅ Install prompt ready');
      
      // Store globally
      (window as any).deferredPrompt = e;
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA Dashboard: ✅ App installed successfully');
      setInstallState('installed');
      setShowPrompt(false);
      localStorage.setItem('pwa-install-completed', 'true');
      
      // Auto-request notification permission after install
      setTimeout(() => {
        requestNotificationPermission();
      }, 1000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const validatePWARequirements = async () => {
    // Check HTTPS
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    setIsHTTPS(isSecure);
    console.log('PWA Dashboard: HTTPS:', isSecure);

    // Check Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        setServiceWorkerActive(!!registration.active);
        console.log('PWA Dashboard: Service Worker active:', !!registration.active);
      } catch (error) {
        console.error('PWA Dashboard: Service Worker error:', error);
      }
    }

    // Check Manifest
    try {
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        const manifestUrl = (manifestLink as HTMLLinkElement).href;
        const response = await fetch(manifestUrl);
        const manifest = await response.json();
        
        // Validate required manifest fields
        const isValid = !!(
          manifest.name &&
          manifest.short_name &&
          manifest.icons &&
          manifest.icons.length >= 2 &&
          manifest.start_url &&
          manifest.display
        );
        
        setManifestValid(isValid);
        console.log('PWA Dashboard: Manifest valid:', isValid);
      }
    } catch (error) {
      console.error('PWA Dashboard: Manifest error:', error);
    }
  };

  const handleInstallClick = async () => {
    // Check if already installed
    const alreadyInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                             (window.navigator as any).standalone === true ||
                             localStorage.getItem('pwa-install-completed') === 'true';
    
    if (alreadyInstalled) {
      console.log('PWA Dashboard: ⛔ Already installed');
      setInstallState('installed');
      setShowPrompt(false);
      return;
    }
    
    if (!deferredPrompt) {
      console.error('PWA Dashboard: No install prompt available');
      alert('❌ Install not available\n\nYour browser doesn\'t support app installation.\n\nRequirements:\n• Chrome/Edge browser\n• HTTPS connection\n• Valid PWA manifest');
      return;
    }

    try {
      console.log('PWA Dashboard: Starting installation...');
      setInstallState('downloading');
      
      // Trigger native install prompt
      await deferredPrompt.prompt();
      
      // Wait for user choice
      const choiceResult = await deferredPrompt.userChoice;
      const outcome = choiceResult?.outcome || 'dismissed';
      
      console.log(`PWA Dashboard: Install outcome: ${outcome}`);

      if (outcome === 'accepted') {
        console.log('PWA Dashboard: ✅ Installation accepted');
        setInstallState('installed');
        localStorage.setItem('pwa-install-completed', 'true');
        
        // Clear deferred prompt
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
        
        // Auto-request notification permission
        setTimeout(() => {
          requestNotificationPermission();
        }, 1000);
        
        // Hide prompt after success
        setTimeout(() => {
          setShowPrompt(false);
        }, 3000);
      } else {
        console.log('PWA Dashboard: Installation cancelled by user');
        setInstallState('waiting');
      }
    } catch (error) {
      console.error('PWA Dashboard: Installation error:', error);
      setInstallState('waiting');
      alert('❌ Installation failed\n\nPlease try again or check:\n• Browser compatibility\n• Internet connection\n• Storage space');
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('⚠️ Notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      console.log('✅ Notification permission already granted');
      registerPushNotifications();
      return;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        registerPushNotifications();
        
        // Show welcome notification with STRONG vibration and sound
        new Notification('IndaStreet ' + dashboardName, {
          body: '🎉 Notifications enabled! You\'ll receive booking alerts instantly. You should feel strong vibrations!',
          icon: '/icons/therapist-icon-192.png',
          badge: '/icons/therapist-icon-192.png',
          vibrate: [500, 100, 500, 100, 500, 100, 500],  // 2+ seconds of strong vibration
          requireInteraction: true,  // Notification stays until user dismisses
          tag: 'welcome-notification',
          silent: false  // Allow system sound
        });
        
        // Play notification sound
        playNotificationSound();
      }
    }
  };

  const registerPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('⚠️ Push notifications not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker ready');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib37gp65t6Y-1MHlZmThPiXnVvQhyKJwl0qDxVG2k5k4OXqPvPNqFf3K7w'
        )
      });

      console.log('✅ Push subscription created');
    } catch (error) {
      console.error('❌ Push subscription failed:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/booking-notification.mp3');
      audio.volume = 1.0;  // Maximum volume
      
      // Set up Media Session API for lock screen controls
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'New Booking Notification',
          artist: 'Indastreet Massage',
          album: 'Therapist Notifications',
          artwork: [
            { src: '/icon-96.png', sizes: '96x96', type: 'image/png' },
            { src: '/icon-128.png', sizes: '128x128', type: 'image/png' },
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-384.png', sizes: '384x384', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
          ]
        });

        // Set up action handlers for media controls
        navigator.mediaSession.setActionHandler('play', () => {
          audio.play().catch(err => console.log('Play failed:', err));
        });
        
        navigator.mediaSession.setActionHandler('pause', () => {
          audio.pause();
        });
        
        navigator.mediaSession.setActionHandler('stop', () => {
          audio.pause();
          audio.currentTime = 0;
        });
      }
      
      audio.play().catch(err => {
        console.log('Sound play failed (may need user interaction):', err);
      });
      console.log('🔊 Playing notification sound with media controls');
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Debug helper functions
  if (typeof window !== 'undefined') {
    (window as any).resetPWAInstall = () => {
      localStorage.removeItem('pwa-install-completed');
      localStorage.removeItem('pwa-install-dismissed');
      setInstallState('idle');
      setShowPrompt(true);
      console.log('✅ PWA install reset');
    };
    
    (window as any).getPWAStatus = () => {
      return {
        installState,
        hasPrompt: !!deferredPrompt,
        manifestValid,
        serviceWorkerActive,
        isHTTPS,
        notificationPermission,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches
      };
    };
  }

  // Don't show if already installed
  if (installState === 'installed') {
    return null;
  }

  // Don't show if no prompt available and not waiting
  if (!showPrompt && !deferredPrompt) {
    return null;
  }

  // Render checklist UI
  return (
    <>
      <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up md:hidden">
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-2xl shadow-2xl p-5 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}/>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition-colors z-10"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <Smartphone className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Install {dashboardName}</h3>
                <p className="text-sm opacity-90">Quick access + notifications</p>
              </div>
            </div>

            {/* PWA Readiness Checklist */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 space-y-2.5">
              <div className="flex items-center gap-3">
                {manifestValid ? (
                  <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                )}
                <span className="text-sm font-medium">PWA Ready</span>
              </div>
              
              <div className="flex items-center gap-3">
                {deferredPrompt ? (
                  <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                )}
                <span className="text-sm font-medium">
                  {installState === 'waiting' ? 'Install Available' : 
                   installState === 'downloading' ? 'Installing...' :
                   installState === 'installed' ? 'Installed on Device' : 'Preparing...'}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {notificationPermission === 'granted' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                )}
                <span className="text-sm font-medium">
                  {notificationPermission === 'granted' ? 'Notification system ready' :
                   notificationPermission === 'denied' ? 'Notifications blocked' :
                   'Notifications pending'}
                </span>
              </div>
            </div>

            {/* Technical Requirements Status */}
            <div className="text-xs opacity-75 mb-4 space-y-1">
              <div className="flex items-center gap-2">
                {isHTTPS ? '✅' : '⚠️'} <span>HTTPS: {isHTTPS ? 'Secure' : 'Required'}</span>
              </div>
              <div className="flex items-center gap-2">
                {serviceWorkerActive ? '✅' : '⚠️'} <span>Service Worker: {serviceWorkerActive ? 'Active' : 'Loading...'}</span>
              </div>
              <div className="flex items-center gap-2">
                {manifestValid ? '✅' : '⚠️'} <span>Manifest: {manifestValid ? 'Valid' : 'Checking...'}</span>
              </div>
            </div>

            {/* Status Message */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-4">
              <p className="text-sm font-medium">
                {installState === 'idle' && '⏳ Preparing installation...'}
                {installState === 'waiting' && '✅ Ready to install! Tap button below.'}
                {installState === 'downloading' && '⬇️ Installing app to your device...'}
                {installState === 'installed' && '🎉 App successfully installed!'}
              </p>
            </div>

            {/* Install Button */}
            {installState !== 'installed' && (
              <button
                onClick={handleInstallClick}
                disabled={!deferredPrompt || installState === 'downloading'}
                className="w-full bg-white text-orange-600 font-bold py-3.5 px-6 rounded-xl hover:bg-gray-100 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {installState === 'downloading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Install App Now
                  </>
                )}
              </button>
            )}

            {/* Notification Button */}
            {installState === 'installed' && notificationPermission === 'default' && (
              <button
                onClick={requestNotificationPermission}
                className="w-full bg-white text-orange-600 font-bold py-3.5 px-6 rounded-xl hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Bell className="w-5 h-5" />
                Enable Notifications
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
};

export default PWAInstallPrompt;
