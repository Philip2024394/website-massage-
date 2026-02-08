/**
 * 🏆 GOLD STANDARD PWA INSTALL BANNER - DASHBOARD
 * 
 * Minimal, non-blocking banner for dashboard pages
 * Platform-aware: Android/Chrome vs iOS
 * State-safe: Never interrupts dashboard sessions
 * 
 * LOCKED RULES:
 * - Only shows on dashboard pages (/therapist, /admin, /place)
 * - Requires user tap to trigger install (no auto-prompts)
 * - Dismissible with 7-day timeout
 * - Shows only when beforeinstallprompt available (Android/Chrome)
 * - Never shows if already installed or in standalone mode
 */

import React, { useState, useEffect } from 'react';
import { X, Download, Share2 } from 'lucide-react';

interface PWAInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const DashboardPWABanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // 🔒 GOLD STANDARD RULE: Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSWebApp = (window.navigator as any).standalone === true;
    const installCompleted = localStorage.getItem('pwa-dashboard-installed') === 'true';
    
    if (isStandalone || isIOSWebApp || installCompleted) {
      logger.debug('[Dashboard PWA] Already installed, not showing banner');
      return;
    }

    // 🔒 GOLD STANDARD RULE: Check if recently dismissed
    const dismissedTime = localStorage.getItem('pwa-dashboard-dismissed');
    if (dismissedTime) {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(dismissedTime) < sevenDays) {
        logger.debug('[Dashboard PWA] Banner dismissed recently, not showing');
        return;
      }
    }

    // Detect platform
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // 🔒 GOLD STANDARD RULE: Capture beforeinstallprompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      logger.debug('[Dashboard PWA] Install prompt available');
      setDeferredPrompt(e as PWAInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show banner after delay (no beforeinstallprompt on iOS)
    if (iOS) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        clearTimeout(timer);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // 🔒 GOLD STANDARD RULE: Handle install (user action required)
  const handleInstall = async () => {
    if (isIOS) {
      // iOS: Show simple instructions
      alert(
        '📱 Install Dashboard App\n\n' +
        '1. Tap Share button ⬆️\n' +
        '2. Scroll down\n' +
        '3. Tap "Add to Home Screen"\n' +
        '4. Tap "Add"\n\n' +
        '✅ Dashboard app will appear on home screen'
      );
      return;
    }

    if (!deferredPrompt) {
      logger.debug('[Dashboard PWA] No install prompt available');
      return;
    }

    try {
      setIsInstalling(true);
      logger.debug('[Dashboard PWA] Showing install prompt');
      
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        logger.debug('[Dashboard PWA] Installation accepted');
        localStorage.setItem('pwa-dashboard-installed', 'true');
        setShowBanner(false);
      } else {
        logger.debug('[Dashboard PWA] Installation dismissed');
        setIsInstalling(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      logger.error('[Dashboard PWA] Install error:', error);
      setIsInstalling(false);
    }
  };

  // 🔒 GOLD STANDARD RULE: Handle dismiss with 7-day timeout
  const handleDismiss = () => {
    logger.debug('[Dashboard PWA] Banner dismissed by user');
    localStorage.setItem('pwa-dashboard-dismissed', Date.now().toString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* 🔒 GOLD STANDARD: Minimal, non-blocking bottom banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-2xl">
          <div className="max-w-screen-xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              {/* Icon + Text */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  {isIOS ? (
                    <Share2 className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Download className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="text-white">
                  <div className="font-semibold text-sm">Install Dashboard App</div>
                  <div className="text-xs opacity-90">
                    {isIOS ? 'Tap Share → Add to Home Screen' : 'Quick access from home screen'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isIOS && (
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition disabled:opacity-50"
                    type="button"
                  >
                    {isInstalling ? 'Installing...' : 'Install'}
                  </button>
                )}
                
                {isIOS && (
                  <button
                    onClick={handleInstall}
                    className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition"
                    type="button"
                  >
                    How to Install
                  </button>
                )}

                <button
                  onClick={handleDismiss}
                  className="text-white hover:bg-white/20 p-1.5 rounded-lg transition"
                  type="button"
                  aria-label="Dismiss"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </>
  );
};

export default DashboardPWABanner;
