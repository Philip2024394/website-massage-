// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Bell, Volume2 } from 'lucide-react';

interface PWAInstallPromptProps {
  dashboardName?: string;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ dashboardName = 'Dashboard' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    console.log('PWA Dashboard: Initializing install prompt...');
    console.log('PWA Dashboard: User agent:', navigator.userAgent);
    console.log('PWA Dashboard: Is standalone:', window.matchMedia('(display-mode: standalone)').matches);
    
    // Check if already installed - MULTIPLE CHECKS
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const isInstalled = localStorage.getItem('pwa-install-completed') === 'true';
    const runningAsApp = window.matchMedia('(display-mode: standalone)').matches || 
                         window.matchMedia('(display-mode: fullscreen)').matches ||
                         window.matchMedia('(display-mode: minimal-ui)').matches;
    
    if (isStandalone || isInWebAppiOS || isInstalled || runningAsApp) {
      console.log('PWA Dashboard: ✅ App already installed/running as app, not showing prompt');
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event with SMART AUTO-TRIGGER
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
      console.log('PWA Dashboard: ✅ beforeinstallprompt event fired - install prompt available!');
      
      // Store globally for other components to access
      (window as any).deferredPrompt = e;
      
      // AUTO-TRIGGER: Wait for user interaction, then show install prompt
      // Only auto-trigger if user hasn't manually dismissed recently
      const recentlyDismissed = localStorage.getItem('pwa-auto-dismissed');
      const dismissTime = recentlyDismissed ? parseInt(recentlyDismissed) : 0;
      const hoursSinceDismiss = (Date.now() - dismissTime) / (1000 * 60 * 60);
      
      if (!recentlyDismissed || hoursSinceDismiss > 24) {
        console.log('PWA Dashboard: 🚀 Auto-triggering PWA install after user interaction...');
        
        // Wait for user to interact with page, then auto-show
        const triggerOnInteraction = () => {
          setTimeout(() => {
            console.log('PWA Dashboard: ✨ Showing PWA install prompt automatically');
            handleInstallClick(e);
          }, 2000); // 2 second delay after interaction
          
          // Remove listeners after first trigger
          document.removeEventListener('click', triggerOnInteraction);
          document.removeEventListener('scroll', triggerOnInteraction);
          document.removeEventListener('touchstart', triggerOnInteraction);
        };
        
        document.addEventListener('click', triggerOnInteraction, { once: true });
        document.addEventListener('scroll', triggerOnInteraction, { once: true });
        document.addEventListener('touchstart', triggerOnInteraction, { once: true });
      } else {
        console.log('PWA Dashboard: Recently dismissed, not auto-triggering');
      }
    };

    // Check after 3 seconds if prompt didn't fire
    const promptCheckTimer = setTimeout(() => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (!isIOS && !deferredPrompt) {
        console.log('PWA Dashboard: ⚠️ beforeinstallprompt did NOT fire within 3 seconds');
        console.log('PWA Dashboard: Possible reasons:');
        console.log('  - App already installed');
        console.log('  - Browser doesn\'t support PWA installation');
        console.log('  - PWA requirements not met (manifest, service worker, HTTPS)');
        console.log('  - User previously dismissed the install prompt');
      }
    }, 3000);

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA Dashboard: ✅ App installed successfully');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      
      // Auto-request notification permission after install
      setTimeout(() => {
        requestNotificationPermission();
      }, 500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      console.log('PWA Dashboard: Current notification permission:', Notification.permission);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(promptCheckTimer);
    };
  }, []);

  const handleInstallClick = async (promptEvent?: any) => {
    const prompt = promptEvent || deferredPrompt;
    
    if (!prompt) {
      console.log('PWA Dashboard: ⚠️ No install prompt available');
      
      // Check if already installed first
      const runningAsApp = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;
      
      if (runningAsApp) {
        alert('✅ APP ALREADY INSTALLED!\n\nYou\'re using the installed app right now.\n\n🔔 Check your device settings to enable notifications.');
        return;
      }
      
      // Detect platform - MOBILE ONLY, SIMPLE
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/i.test(navigator.userAgent);
      
      if (isIOS) {
        // iOS SIMPLE
        alert(
          '📱 INSTALL ON iPHONE/iPAD:\n\n' +
          '1️⃣ Tap Share (⬆️) at bottom\n' +
          '2️⃣ Scroll down\n' +
          '3️⃣ Tap "Add to Home Screen"\n' +
          '4️⃣ Tap "Add"\n\n' +
          '🔔 Get booking notifications!'
        );
      } else if (isAndroid) {
        // Android SIMPLE
        alert(
          '📱 INSTALL ON ANDROID:\n\n' +
          '1️⃣ Tap menu (3 dots ⋮)\n' +
          '2️⃣ Look for "Install app"\n' +
          '3️⃣ Or "Add to Home screen"\n' +
          '4️⃣ Tap to install\n\n' +
          '🔔 Get booking notifications!'
        );
      } else {
        // Generic mobile
        alert(
          '📱 TO INSTALL:\n\n' +
          '1️⃣ Open browser menu\n' +
          '2️⃣ Find "Install" option\n' +
          '3️⃣ Follow prompts\n\n' +
          '🔔 Enable booking alerts!'
        );
      }
      return;
    }

    try {
      console.log('🚀 Showing PWA install prompt...');
      
      // Show install prompt
      await prompt.prompt();

      // Wait for user response
      const { outcome } = await prompt.userChoice;
      console.log(`📱 Install outcome: ${outcome}`);

      if (outcome === 'accepted') {
        console.log('✅ User accepted install - App will open in standalone mode');
        localStorage.setItem('pwa-install-completed', 'true');
        
        // Show success message
        setTimeout(() => {
          alert('App installed successfully! 🎉\n\nYou can now find it on your home screen.\n🔔 Notification permissions will be requested next.');
        }, 500);
        
        // Request notification permission after short delay
        setTimeout(() => {
          requestNotificationPermission();
        }, 1500);
      } else {
        console.log('❌ User declined install - marking as auto-dismissed');
        // Mark as dismissed to prevent auto-trigger for 24 hours
        localStorage.setItem('pwa-auto-dismissed', Date.now().toString());
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('❌ Install prompt error:', error);
      
      // Show detailed error-specific instructions
      const errorMsg = String(error);
      if (errorMsg.includes('user gesture')) {
        alert('⚠️ Installation requires a user action.\n\nPlease try:\n1. Tap the install button again\n2. Or use your browser\'s menu to install\n\n🔔 Once installed, you\'ll get booking notifications!');
      } else if (errorMsg.includes('already installed')) {
        alert('✅ App is already installed!\n\nCheck your home screen or app drawer.\n\n🔔 Make sure notifications are enabled in app settings.');
      } else {
        alert('Installation failed. Please try adding the app manually from your browser menu.\n\nLook for "Add to Home Screen" or "Install App" option.\n\n🔔 This enables push notifications for bookings!');
      }
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
        
        // Show test notification
        new Notification('IndaStreet ' + dashboardName, {
          body: '🎉 Notifications enabled! You\'ll receive alerts even when the app is closed.',
          icon: '/pwa-icon-192.png',
          badge: '/pwa-icon-192.png',
          vibrate: [200, 100, 200],
          tag: 'welcome-notification'
        });
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
      console.log('✅ Service Worker ready for push notifications');

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib37gp65t6Y-1MHlZmThPiXnVvQhyKJwl0qDxVG2k5k4OXqPvPNqFf3K7w'
        )
      });

      console.log('✅ Push subscription:', subscription);

      // Send subscription to server (implement this in your backend)
      // await sendSubscriptionToServer(subscription);
    } catch (error) {
      console.error('❌ Failed to subscribe to push notifications:', error);
    }
  };

  // Helper function to convert VAPID key
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

  const handleDismiss = () => {
    console.log('📱 PWA install banner dismissed by user');
    setShowInstallPrompt(false);
    
    // Mark as manually dismissed to prevent auto-trigger for 24 hours
    localStorage.setItem('pwa-auto-dismissed', Date.now().toString());
    
    // Also set traditional dismissal markers
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Debug helper functions
  const clearDismissal = () => {
    localStorage.removeItem('pwa-auto-dismissed');
    localStorage.removeItem('pwa-install-dismissed');
    localStorage.removeItem('pwa-install-completed');
    console.log('PWA Dashboard: ✅ Cleared all dismissal flags');
    setShowInstallPrompt(true);
    alert('✅ Installation prompt reset!\n\nThe install button should now work again.');
  };

  const getPWAStatus = () => {
    const status = {
      isInstalled: isInstalled || localStorage.getItem('pwa-install-completed') === 'true',
      isAutoDismissed: !!localStorage.getItem('pwa-auto-dismissed'),
      isDismissed: !!localStorage.getItem('pwa-install-dismissed'),
      dismissTime: localStorage.getItem('pwa-auto-dismissed'),
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      hasPrompt: !!deferredPrompt,
      notificationPermission: notificationPermission,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      userAgent: navigator.userAgent
    };
    console.log('PWA Dashboard Status:', status);
    return status;
  };

  // Expose debug functions globally
  if (typeof window !== 'undefined') {
    (window as any).clearDashboardPWADismissal = clearDismissal;
    (window as any).getDashboardPWAStatus = getPWAStatus;
    (window as any).showDashboardPWAPrompt = () => {
      setShowInstallPrompt(true);
      console.log('PWA Dashboard: Manually showing install prompt');
    };
  }

  // Don't show UI if app is already installed
  if (isInstalled) {
    return null;
  }

  // Show install banner only if we have a prompt or if user is on supported device
  if (!showInstallPrompt && !deferredPrompt) {
    return null;
  }

  return (
    <>
      {/* Install Banner - Mobile Only */}
      <div className="md:hidden fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-2xl p-4 text-white">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-xl p-3 flex-shrink-0">
              <Smartphone className="w-8 h-8" />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Install {dashboardName}</h3>
              <p className="text-sm opacity-90 mb-3">
                Add to your home screen for quick access and notifications
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Bell className="w-4 h-4" />
                  <span>Real-time booking alerts</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Volume2 className="w-4 h-4" />
                  <span>Sound notifications (even when closed)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Smartphone className="w-4 h-4" />
                  <span>Works offline</span>
                </div>
              </div>

              <button
                onClick={handleInstallClick}
                className="w-full bg-white text-orange-600 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Install App
              </button>

              {notificationPermission === 'default' && (
                <button
                  onClick={requestNotificationPermission}
                  className="w-full mt-2 bg-white/10 text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Bell className="w-4 h-4" />
                  Enable Notifications
                </button>
              )}
            </div>
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
      `}</style>
    </>
  );
};

export default PWAInstallPrompt;
