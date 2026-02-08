/**
 * PWA Chat State Manager
 * Facebook/Amazon Standard: Preserves chat state during PWA installation
 */

import React, { useEffect, useState, useCallback } from 'react';
import { pwaInstallStatePreservationService } from '../services/pwaInstallStatePreservation.service';
import { appwriteConnectionHealthMonitor } from '../services/appwriteConnectionHealthMonitor.service';
import type { ConnectionHealthStatus } from '../services/appwriteConnectionHealthMonitor.service';
import { logger } from '../utils/logger';

// Simple toast implementation since sonner may not be available
const toast = {
  success: (title: string, options?: { description?: string; duration?: number }) => {
    logger.info(`✅ ${title}${options?.description ? ': ' + options.description : ''}`);
    // Could implement custom toast UI here
  },
  error: (title: string, options?: { description?: string; duration?: number; action?: any }) => {
    logger.error(`❌ ${title}${options?.description ? ': ' + options.description : ''}`);
  },
  warning: (title: string, options?: { description?: string; duration?: number }) => {
    logger.warn(`⚠️ ${title}${options?.description ? ': ' + options.description : ''}`);
  }
};

interface PWAStateManagerProps {
  children: React.ReactNode;
  onStateRestored?: (restoredState: any) => void;
}

interface ConnectionAlert {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'success';
}

export const PWAStateManager: React.FC<PWAStateManagerProps> = ({ children, onStateRestored }) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionHealthStatus>({
    status: 'healthy',
    lastSuccessfulRequest: Date.now(),
    failedRequestCount: 0,
    latency: 0,
    services: {
      database: 'healthy',
      realtime: 'healthy',
      auth: 'healthy'
    }
  });
  const [isMonitoring, setIsMonitoring] = useState(false);

  /**
   * Initialize PWA state preservation and connection monitoring
   */
  useEffect(() => {
    logger.debug('🔧 Initializing PWA state manager...');

    // Check for preserved state on component mount
    const checkForRestoredState = async () => {
      try {
        const restoredState = pwaInstallStatePreservationService.restoreChatState();
        if (restoredState && onStateRestored) {
          logger.debug('✅ PWA state restored:', restoredState);
          onStateRestored(restoredState);
          
          // Show user notification
          toast.success('Chat restored', {
            description: 'Your conversation was preserved during app installation.',
            duration: 4000
          });
        }
      } catch (error) {
        logger.warn('⚠️ Failed to restore PWA state:', error);
      }
    };

    // Start connection health monitoring
    const startHealthMonitoring = () => {
      try {
        appwriteConnectionHealthMonitor.startMonitoring();
        setIsMonitoring(true);
        logger.debug('✅ Connection health monitoring started');
      } catch (error) {
        logger.error('❌ Failed to start health monitoring:', error);
      }
    };

    checkForRestoredState();
    startHealthMonitoring();

    // Listen for PWA installation events
    const handleBeforeInstallPrompt = (e: Event) => {
      logger.debug('📱 PWA installation prompt detected');
      e.preventDefault();
      
      // Preserve current chat state before installation
      const currentState = getCurrentChatState();
      if (currentState) {
        pwaInstallStatePreservationService.preserveChatState(currentState);
        logger.debug('💾 Chat state preserved for PWA installation');
      }
    };

    // Listen for successful PWA installation
    const handleAppInstalled = () => {
      logger.debug('✅ PWA installed successfully');
      toast.success('App Installed', {
        description: 'The app is now installed and your chat is preserved.',
        duration: 5000
      });
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      
      if (isMonitoring) {
        appwriteConnectionHealthMonitor.stopMonitoring();
        setIsMonitoring(false);
      }
    };
  }, [onStateRestored]);

  /**
   * Subscribe to connection health updates
   */
  useEffect(() => {
    const unsubscribe = appwriteConnectionHealthMonitor.addStatusListener((status) => {
      setConnectionStatus(status);
    });

    // Listen for health alerts
    const handleHealthAlert = (event: CustomEvent<ConnectionAlert>) => {
      const { title, message, type } = event.detail;
      
      switch (type) {
        case 'error':
          toast.error(title, {
            description: message,
            duration: 8000,
            action: {
              label: 'Retry',
              onClick: () => {
                // Trigger manual health check
                window.location.reload();
              }
            }
          });
          break;
        case 'warning':
          toast.warning(title, {
            description: message,
            duration: 6000
          });
          break;
        case 'success':
          toast.success(title, {
            description: message,
            duration: 4000
          });
          break;
      }
    };

    window.addEventListener('appwrite-health-alert', handleHealthAlert as EventListener);

    return () => {
      unsubscribe();
      window.removeEventListener('appwrite-health-alert', handleHealthAlert as EventListener);
    };
  }, []);

  /**
   * Get current chat state from DOM and localStorage
   */
  const getCurrentChatState = useCallback(() => {
    try {
      // Extract current chat state from various sources
      const chatData = {
        timestamp: Date.now(),
        isOpen: document.querySelector('[data-chat-open="true"]') !== null,
        currentBooking: JSON.parse(localStorage.getItem('currentBooking') || 'null'),
        messages: JSON.parse(localStorage.getItem('chatMessages') || '[]'),
        unreadCount: parseInt(localStorage.getItem('unreadChatCount') || '0'),
        therapistInfo: JSON.parse(localStorage.getItem('selectedTherapist') || 'null'),
        bookingStep: localStorage.getItem('currentBookingStep') || 'initial',
        formData: JSON.parse(localStorage.getItem('bookingFormData') || '{}'),
        connectionStatus: connectionStatus.status,
        preservationReason: 'pwa-installation'
      };

      return chatData;
    } catch (error) {
      logger.warn('⚠️ Failed to extract chat state:', error);
      return null;
    }
  }, [connectionStatus]);

  /**
   * Handle visibility change to preserve state during app switching
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Preserve state when user switches away (might be installing PWA)
        const currentState = getCurrentChatState();
        if (currentState) {
          pwaInstallStatePreservationService.preserveChatState(currentState);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [getCurrentChatState]);

  return (
    <>
      {children}
      
      {/* Connection Status Indicator - Only show for offline, not slow connection */}
      {connectionStatus.status === 'offline' && (
        <div className="fixed top-4 right-4 z-[9999] max-w-sm">
          <div className="px-4 py-3 rounded-lg shadow-lg border-l-4 bg-red-50 border-red-500 text-red-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="font-medium">Connection Lost</span>
            </div>
            <p className="text-sm mt-1">
              Your messages may not be sent until connection is restored.
            </p>
          </div>
        </div>
      )}

      {/* PWA Installation State Indicator */}
      {(() => {
        try {
          const preservationState = localStorage.getItem('pwa-install-state');
          return preservationState && JSON.parse(preservationState).installationInProgress;
        } catch {
          return false;
        }
      })() && (
        <div className="fixed bottom-4 left-4 z-[9999] max-w-sm">
          <div className="bg-blue-50 border-l-4 border-blue-500 px-4 py-3 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <span className="font-medium text-blue-800">Installing App</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Your chat will be preserved during installation.
            </p>
          </div>
        </div>
      )}
    </>
  );
};