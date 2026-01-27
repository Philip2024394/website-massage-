/**
 * 💾 ENTERPRISE SAVE OPERATIONS MANAGER
 * Guarantees data persistence with retry logic and offline support
 * Prevents data loss from network issues or server errors
 */

import React from 'react';
import { authService, therapistService } from '../lib/appwriteService';

interface SaveOperation {
  id: string;
  type: 'profile' | 'status' | 'availability' | 'payment' | 'settings';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface SaveResult {
  success: boolean;
  data?: any;
  error?: string;
  savedOffline?: boolean;
  operationId: string;
}

class EnterpriseSaveManager {
  private pendingSaves: Map<string, SaveOperation> = new Map();
  private isOnline: boolean = navigator.onLine;
  private saveQueue: SaveOperation[] = [];
  private readonly STORAGE_KEY = 'therapist_pending_saves';
  private readonly MAX_RETRY_ATTEMPTS = 5;

  constructor() {
    this.initializeOfflineSupport();
    this.loadPendingSaves();
    this.setupPeriodicSync();
  }

  private initializeOfflineSupport() {
    // Monitor online/offline status
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Page visibility change (resume sync when tab becomes active)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleOnline = () => {
    console.log('🌐 [SAVE MANAGER] Connection restored - syncing pending saves');
    this.isOnline = true;
    this.processPendingSaves();
  };

  private handleOffline = () => {
    console.log('📴 [SAVE MANAGER] Connection lost - enabling offline mode');
    this.isOnline = false;
  };

  private handleVisibilityChange = () => {
    if (!document.hidden && this.isOnline && this.saveQueue.length > 0) {
      console.log('👀 [SAVE MANAGER] Tab active - processing pending saves');
      this.processPendingSaves();
    }
  };

  private setupPeriodicSync() {
    // Attempt to sync every 30 seconds if online
    setInterval(() => {
      if (this.isOnline && this.saveQueue.length > 0) {
        this.processPendingSaves();
      }
    }, 30000);
  }

  /**
   * Enterprise-grade save with automatic retry and offline support
   */
  public async save(
    type: SaveOperation['type'],
    data: any,
    options: {
      maxRetries?: number;
      immediate?: boolean;
      critical?: boolean;
    } = {}
  ): Promise<SaveResult> {
    const operationId = this.generateOperationId();
    const operation: SaveOperation = {
      id: operationId,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: options.maxRetries || this.MAX_RETRY_ATTEMPTS
    };

    console.log(`💾 [SAVE MANAGER] Initiating ${type} save operation:`, {
      operationId,
      immediate: options.immediate,
      critical: options.critical,
      dataSize: JSON.stringify(data).length
    });

    // Add to queue
    this.saveQueue.push(operation);
    this.pendingSaves.set(operationId, operation);
    this.persistPendingSaves();

    // Attempt immediate save if online and immediate mode
    if (this.isOnline && (options.immediate || options.critical)) {
      return await this.attemptSave(operation);
    }

    // Offline or non-immediate - save locally
    this.saveOffline(operation);
    return {
      success: true,
      operationId,
      savedOffline: true
    };
  }

  private async attemptSave(operation: SaveOperation): Promise<SaveResult> {
    try {
      const startTime = Date.now();
      let result: any;

      // Route to appropriate save function based on type
      switch (operation.type) {
        case 'profile':
          result = await this.saveProfile(operation.data);
          break;
        case 'status':
          result = await this.saveStatus(operation.data);
          break;
        case 'availability':
          result = await this.saveAvailability(operation.data);
          break;
        case 'payment':
          result = await this.savePaymentInfo(operation.data);
          break;
        case 'settings':
          result = await this.saveSettings(operation.data);
          break;
        default:
          throw new Error(`Unknown save type: ${operation.type}`);
      }

      const duration = Date.now() - startTime;
      console.log(`✅ [SAVE MANAGER] ${operation.type} saved successfully in ${duration}ms`);

      // Remove from pending saves
      this.removePendingSave(operation.id);

      return {
        success: true,
        data: result,
        operationId: operation.id
      };

    } catch (error) {
      console.error(`❌ [SAVE MANAGER] Save failed for ${operation.type}:`, error);
      return await this.handleSaveError(operation, error as Error);
    }
  }

  private async handleSaveError(operation: SaveOperation, error: Error): Promise<SaveResult> {
    operation.retryCount++;

    console.warn(`⚠️ [SAVE MANAGER] Save attempt ${operation.retryCount}/${operation.maxRetries} failed:`, {
      operationId: operation.id,
      type: operation.type,
      error: error.message
    });

    if (operation.retryCount >= operation.maxRetries) {
      console.error(`🚨 [SAVE MANAGER] Max retries exceeded for ${operation.type} save`);
      
      // Keep in offline storage for manual retry
      this.saveOffline(operation);
      
      return {
        success: false,
        error: `Save failed after ${operation.maxRetries} attempts: ${error.message}`,
        operationId: operation.id,
        savedOffline: true
      };
    }

    // Exponential backoff retry
    const delay = Math.pow(2, operation.retryCount - 1) * 1000;
    console.log(`🔄 [SAVE MANAGER] Retrying ${operation.type} save in ${delay}ms`);
    
    setTimeout(async () => {
      await this.attemptSave(operation);
    }, delay);

    return {
      success: false,
      error: `Retrying... (${operation.retryCount}/${operation.maxRetries})`,
      operationId: operation.id
    };
  }

  // Specific save implementations
  private async saveProfile(data: any) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    // Update therapist profile via therapistService
    return await therapistService.updateTherapist(user.id, data);
  }

  private async saveStatus(data: any) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    // Update therapist online status
    return await therapistService.updateTherapist(user.id, { status: data.status });
  }

  private async saveAvailability(data: any) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    // Save availability schedule
    return await therapistService.updateTherapist(user.id, { schedule: data });
  }

  private async savePaymentInfo(data: any) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    // Update payment information
    return await therapistService.updateTherapist(user.id, data);
  }

  private async saveSettings(data: any) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    // Update user settings
    return await therapistService.updateTherapist(user.id, data);
  }

  // Offline operations
  private saveOffline(operation: SaveOperation) {
    try {
      const offlineData = {
        ...operation,
        savedAt: Date.now(),
        offline: true
      };
      
      localStorage.setItem(`save_${operation.id}`, JSON.stringify(offlineData));
      console.log(`💾 [SAVE MANAGER] Saved ${operation.type} offline with ID: ${operation.id}`);
    } catch (error) {
      console.error('Failed to save offline:', error);
    }
  }

  private async processPendingSaves() {
    if (!this.isOnline || this.saveQueue.length === 0) return;

    console.log(`🔄 [SAVE MANAGER] Processing ${this.saveQueue.length} pending saves`);
    
    // Process saves one by one to avoid overwhelming the server
    for (const operation of [...this.saveQueue]) {
      if (operation.retryCount < operation.maxRetries) {
        await this.attemptSave(operation);
        // Small delay between saves to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  // Utility methods
  private generateOperationId(): string {
    return `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private removePendingSave(operationId: string) {
    this.pendingSaves.delete(operationId);
    this.saveQueue = this.saveQueue.filter(op => op.id !== operationId);
    this.persistPendingSaves();
    
    // Remove offline storage
    localStorage.removeItem(`save_${operationId}`);
  }

  private persistPendingSaves() {
    try {
      const saveData = Array.from(this.pendingSaves.values());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saveData));
    } catch (error) {
      console.warn('Failed to persist pending saves:', error);
    }
  }

  private loadPendingSaves() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const operations: SaveOperation[] = JSON.parse(stored);
        operations.forEach(op => {
          this.pendingSaves.set(op.id, op);
          this.saveQueue.push(op);
        });
        console.log(`📁 [SAVE MANAGER] Loaded ${operations.length} pending saves from storage`);
      }
    } catch (error) {
      console.warn('Failed to load pending saves:', error);
    }
  }

  // Public methods for dashboard components
  public getPendingSaves(): SaveOperation[] {
    return Array.from(this.pendingSaves.values());
  }

  public async retryFailedSaves(): Promise<void> {
    console.log('🔄 [SAVE MANAGER] Manually retrying all failed saves');
    await this.processPendingSaves();
  }

  public clearPendingSaves(): void {
    console.log('🗑️ [SAVE MANAGER] Clearing all pending saves');
    this.pendingSaves.clear();
    this.saveQueue = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Cleanup
  public destroy() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}

// Export singleton instance
export const enterpriseSaveManager = new EnterpriseSaveManager();

// React hook for components
export const useEnterpriseSave = () => {
  const [pendingSaves, setPendingSaves] = React.useState<SaveOperation[]>([]);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const updatePendingSaves = () => {
      setPendingSaves(enterpriseSaveManager.getPendingSaves());
    };

    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Update pending saves every 5 seconds
    const interval = setInterval(updatePendingSaves, 5000);
    updatePendingSaves(); // Initial load

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  return {
    save: enterpriseSaveManager.save.bind(enterpriseSaveManager),
    pendingSaves,
    isOnline,
    retryFailedSaves: enterpriseSaveManager.retryFailedSaves.bind(enterpriseSaveManager),
    clearPendingSaves: enterpriseSaveManager.clearPendingSaves.bind(enterpriseSaveManager)
  };
};

export default enterpriseSaveManager;