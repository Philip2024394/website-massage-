/**
 * 📱 APP DOWNLOAD PROMPT FOR SCHEDULED BOOKINGS
 * 
 * Prompts customers to download the mobile app for:
 * - Better experience and offline functionality  
 * - Direct therapist communication
 * - Booking management and history
 * 
 * Features:
 * - Automatic prompt 5 hours before scheduled bookings
 * - Smart detection of mobile devices
 * - App store deep links (iOS App Store, Google Play)
 * - PWA installation option for web users
 * - Dismissal tracking to avoid spam
 * - Integration with booking reminder system
 */

import React, { useState, useEffect } from 'react';
import { X, Phone, Download, Bell, Calendar, MessageCircle } from 'lucide-react';

export interface AppDownloadPromptProps {
  isVisible: boolean;
  onDismiss: () => void;
  bookingId?: string;
  message?: string;
  urgency?: 'normal' | 'urgent';
  scheduledTime?: string;
  therapistName?: string;
  services?: string[];
}

export interface AppDownloadPromptState {
  bookingId: string;
  dismissedAt: Date;
  downloadAttempted: boolean;
}

const AppDownloadPrompt: React.FC<AppDownloadPromptProps> = ({
  isVisible,
  onDismiss,
  bookingId,
  message = "Download our app for MP3 notifications and better booking experience!",
  urgency = 'normal',
  scheduledTime,
  therapistName,
  services = []
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [isPWAInstallable, setIsPWAInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Detect device type and PWA installability
  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsPWAInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Animation effect
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Play attention sound for urgent prompts
      if (urgency === 'urgent') {
        playAttentionSound();
      }
    }
  }, [isVisible, urgency]);

  const playAttentionSound = () => {
    // Create a gentle notification sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const handleDismiss = () => {
    setIsAnimating(false);
    
    // Store dismissal to avoid repeated prompts
    if (bookingId) {
      const dismissalState: AppDownloadPromptState = {
        bookingId,
        dismissedAt: new Date(),
        downloadAttempted: false
      };
      localStorage.setItem(`app_download_dismissed_${bookingId}`, JSON.stringify(dismissalState));
    }
    
    // Delay actual dismissal for animation
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const handleDownload = (type: 'ios' | 'android' | 'pwa') => {
    console.log(`📱 [APP_DOWNLOAD] User attempting to download: ${type}`);
    
    // Track download attempt
    if (bookingId) {
      const dismissalState: AppDownloadPromptState = {
        bookingId,
        dismissedAt: new Date(),
        downloadAttempted: true
      };
      localStorage.setItem(`app_download_dismissed_${bookingId}`, JSON.stringify(dismissalState));
    }

    switch (type) {
      case 'ios':
        window.open('https://apps.apple.com/app/indastreet-massage/id1234567890', '_blank');
        break;
        
      case 'android':
        window.open('https://play.google.com/store/apps/details?id=com.indastreet.massage', '_blank');
        break;
        
      case 'pwa':
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('✅ [PWA] User accepted the install prompt');
            } else {
              console.log('❌ [PWA] User dismissed the install prompt');
            }
            setDeferredPrompt(null);
            setIsPWAInstallable(false);
          });
        }
        break;
    }
    
    // Don't auto-dismiss on download to let user complete the process
  };

  const getAppStoreLinks = () => {
    const links = [];
    
    if (deviceType === 'ios') {
      links.push({
        type: 'ios' as const,
        label: 'Download from App Store',
        icon: '🍎',
        primary: true
      });
    }
    
    if (deviceType === 'android') {
      links.push({
        type: 'android' as const,
        label: 'Get it on Google Play',
        icon: '🤖',
        primary: true
      });
    }
    
    if (isPWAInstallable) {
      links.push({
        type: 'pwa' as const,
        label: 'Install Web App',
        icon: '💻',
        primary: deviceType === 'desktop'
      });
    }
    
    return links;
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    try {
      return new Date(timeStr).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeStr;
    }
  };

  if (!isVisible) return null;

  const appLinks = getAppStoreLinks();
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleDismiss}
      />
      
      {/* Prompt Modal */}
      <div 
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50
                   bg-white rounded-2xl shadow-2xl max-w-sm mx-4 transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        } ${urgency === 'urgent' ? 'ring-4 ring-amber-400 ring-opacity-75' : ''}`}
      >
        {/* Header */}
        <div className={`p-6 rounded-t-2xl ${
          urgency === 'urgent' ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-600'
        } text-white relative`}>
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-full ${
              urgency === 'urgent' ? 'bg-white bg-opacity-20' : 'bg-white bg-opacity-20'
            }`}>
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Download Our App!</h3>
              <p className="text-sm opacity-90">
                {urgency === 'urgent' ? '🔔 Your booking is soon!' : '📱 Get the best experience'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Booking Info */}
          {(scheduledTime || therapistName) && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Your Booking</span>
              </div>
              
              {scheduledTime && (
                <p className="text-sm text-gray-600 mb-1">
                  Time: {formatTime(scheduledTime)}
                </p>
              )}
              
              {therapistName && (
                <p className="text-sm text-gray-600 mb-1">
                  Therapist: {therapistName}
                </p>
              )}
              
              {services.length > 0 && (
                <p className="text-sm text-gray-600">
                  Services: {services.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Bell className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">MP3 Sound Notifications</p>
                <p className="text-xs text-gray-500">Never miss booking updates</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Bell className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Smart Reminders</p>
                <p className="text-xs text-gray-500">Automatic booking reminders</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <MessageCircle className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Direct Chat</p>
                <p className="text-xs text-gray-500">Message your therapist instantly</p>
              </div>
            </div>
          </div>

          {/* Message */}
          <p className="text-center text-gray-600 text-sm mb-6">
            {message}
          </p>

          {/* Download Buttons */}
          <div className="space-y-3">
            {appLinks.map((link) => (
              <button
                key={link.type}
                onClick={() => handleDownload(link.type)}
                className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-medium transition-all ${
                  link.primary
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <Download className="w-4 h-4" />
                <span>{link.label}</span>
              </button>
            ))}
          </div>

          {/* Skip Option */}
          <button
            onClick={handleDismiss}
            className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </>
  );
};

// Global App Download Prompt Manager
class AppDownloadPromptManager {
  private static instance: AppDownloadPromptManager;
  private promptContainer: HTMLDivElement | null = null;

  static getInstance(): AppDownloadPromptManager {
    if (!AppDownloadPromptManager.instance) {
      AppDownloadPromptManager.instance = new AppDownloadPromptManager();
    }
    return AppDownloadPromptManager.instance;
  }

  /**
   * Show app download prompt
   */
  show(options: Omit<AppDownloadPromptProps, 'isVisible' | 'onDismiss'>): void {
    // Check if already dismissed for this booking
    if (options.bookingId && this.isRecentlyDismissed(options.bookingId)) {
      console.log('📱 [APP_DOWNLOAD] Skipping prompt - recently dismissed');
      return;
    }

    // Create container if not exists
    if (!this.promptContainer) {
      this.promptContainer = document.createElement('div');
      this.promptContainer.id = 'app-download-prompt-container';
      document.body.appendChild(this.promptContainer);
    }

    // Render the prompt
    const React = (window as any).React;
    const ReactDOM = (window as any).ReactDOM;
    
    if (React && ReactDOM) {
      ReactDOM.render(
        React.createElement(AppDownloadPrompt, {
          ...options,
          isVisible: true,
          onDismiss: () => this.hide()
        }),
        this.promptContainer
      );
    }
  }

  /**
   * Hide app download prompt
   */
  hide(): void {
    if (this.promptContainer) {
      const ReactDOM = (window as any).ReactDOM;
      if (ReactDOM) {
        ReactDOM.unmountComponentAtNode(this.promptContainer);
      }
      this.promptContainer.remove();
      this.promptContainer = null;
    }
  }

  /**
   * Check if prompt was recently dismissed for this booking
   */
  private isRecentlyDismissed(bookingId: string): boolean {
    try {
      const stored = localStorage.getItem(`app_download_dismissed_${bookingId}`);
      if (stored) {
        const state: AppDownloadPromptState = JSON.parse(stored);
        const dismissedAt = new Date(state.dismissedAt);
        const now = new Date();
        
        // Don't show again if dismissed within last 24 hours
        const hoursSinceDismissal = (now.getTime() - dismissedAt.getTime()) / (1000 * 60 * 60);
        return hoursSinceDismissal < 24;
      }
    } catch (error) {
      console.warn('Failed to check dismissal state:', error);
    }
    
    return false;
  }
}

// Global instance
export const appDownloadPromptManager = AppDownloadPromptManager.getInstance();

// Listen for global events to show app download prompt
if (typeof window !== 'undefined') {
  window.addEventListener('show-app-download-prompt', (event: any) => {
    const { detail } = event;
    appDownloadPromptManager.show({
      bookingId: detail.bookingId,
      message: detail.message || "Download our app for MP3 notifications and better booking experience!",
      urgency: detail.urgency || 'normal',
      scheduledTime: detail.scheduledTime,
      therapistName: detail.therapistName,
      services: detail.services
    });
  });
}

export default AppDownloadPrompt;