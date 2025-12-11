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
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
      console.log('📱 PWA install prompt ready');
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('✅ PWA installed successfully');
      setIsInstalled(true);
      setShowInstallPrompt(false);
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

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('⚠️ No install prompt available');
      return;
    }

    // Show install prompt
    deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`📱 Install outcome: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('✅ User accepted install');
      requestNotificationPermission();
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
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
    setShowInstallPrompt(false);
    // Show again after 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed or dismissed recently
  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  const dismissedTime = localStorage.getItem('pwa-install-dismissed');
  if (dismissedTime && Date.now() - parseInt(dismissedTime) < 7 * 24 * 60 * 60 * 1000) {
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
