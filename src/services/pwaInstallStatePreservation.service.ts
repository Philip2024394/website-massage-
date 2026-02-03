/**
 * PWA Install State Preservation Service
 * Facebook/Amazon Standard: Preserves chat state during PWA installation
 */

interface ChatStateSnapshot {
  isOpen: boolean;
  currentBooking: any;
  messages: any[];
  therapistId: string;
  customerId: string;
  bookingStep: string;
  notificationPreferences: any;
  timestamp: number;
}

interface PWAInstallationState {
  preservedChatState?: ChatStateSnapshot;
  installationInProgress: boolean;
  preservationTimestamp: number;
}

class PWAInstallStatePreservationService {
  private readonly STORAGE_KEY = 'pwa-install-state-preservation';
  private readonly PRESERVATION_TIMEOUT = 300000; // 5 minutes

  /**
   * Preserve chat state before PWA installation
   */
  preserveChatState(chatState: any): void {
    try {
      const snapshot: ChatStateSnapshot = {
        isOpen: chatState.isOpen,
        currentBooking: chatState.currentBooking,
        messages: chatState.messages || [],
        therapistId: chatState.therapist?.id || '',
        customerId: chatState.customerId || '',
        bookingStep: chatState.bookingStep || '',
        notificationPreferences: chatState.notificationPreferences || {},
        timestamp: Date.now()
      };

      const installState: PWAInstallationState = {
        preservedChatState: snapshot,
        installationInProgress: true,
        preservationTimestamp: Date.now()
      };

      // Store in localStorage for persistence across page reloads
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(installState));
      
      // Also store in sessionStorage as backup
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(installState));

      console.log('✅ PWA: Chat state preserved for installation:', snapshot);

    } catch (error) {
      console.error('❌ PWA: Failed to preserve chat state:', error);
    }
  }

  /**
   * Restore chat state after PWA installation
   */
  restoreChatState(): ChatStateSnapshot | null {
    try {
      // Try localStorage first, then sessionStorage
      let data = localStorage.getItem(this.STORAGE_KEY) || sessionStorage.getItem(this.STORAGE_KEY);
      
      if (!data) return null;

      const installState: PWAInstallationState = JSON.parse(data);
      
      // Check if preservation is still valid (not expired)
      const elapsed = Date.now() - installState.preservationTimestamp;
      if (elapsed > this.PRESERVATION_TIMEOUT) {
        console.log('⚠️ PWA: Preserved state expired, clearing...');
        this.clearPreservedState();
        return null;
      }

      if (!installState.preservedChatState) return null;

      console.log('✅ PWA: Restoring preserved chat state:', installState.preservedChatState);
      
      // Clear the preserved state after restoration
      this.clearPreservedState();

      return installState.preservedChatState;

    } catch (error) {
      console.error('❌ PWA: Failed to restore chat state:', error);
      return null;
    }
  }

  /**
   * Clear preserved state
   */
  clearPreservedState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem(this.STORAGE_KEY);
      console.log('🗑️ PWA: Preserved state cleared');
    } catch (error) {
      console.error('❌ PWA: Failed to clear preserved state:', error);
    }
  }

  /**
   * Check if PWA installation is in progress
   */
  isInstallationInProgress(): boolean {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return false;

      const installState: PWAInstallationState = JSON.parse(data);
      return installState.installationInProgress && 
             (Date.now() - installState.preservationTimestamp) < this.PRESERVATION_TIMEOUT;

    } catch (error) {
      console.error('❌ PWA: Failed to check installation status:', error);
      return false;
    }
  }

  /**
   * Setup PWA installation listeners to automatically preserve state
   */
  setupInstallationListeners(): () => void {
    const handleBeforeInstallPrompt = () => {
      console.log('📱 PWA: Installation prompt detected, will preserve state...');
      // Note: We'll preserve state when user actually clicks install button
    };

    const handleAppInstalled = () => {
      console.log('✅ PWA: App installed, preserved state ready for restoration');
    };

    const handleVisibilityChange = () => {
      // If page becomes visible and we have preserved state, attempt restoration
      if (!document.hidden && this.isInstallationInProgress()) {
        console.log('📱 PWA: Page visible, checking for state restoration...');
        // Restoration will be handled by the chat component
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }
}

export const pwaInstallStatePreservationService = new PWAInstallStatePreservationService();
export type { ChatStateSnapshot };