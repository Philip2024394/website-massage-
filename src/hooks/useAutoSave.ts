/**
 * 🔒 AUTOSAVE HOOK
 * 
 * React hook for automatic data saving:
 * - Auto-save every 30-60 seconds
 * - Sync on component unmount
 * - Sync on window/tab close
 * - Debounced updates
 * - Zero data loss
 * 
 * @author Expert Full-Stack Developer
 * @date 2026-01-28
 */

import { useEffect, useRef, useCallback } from 'react';
import { backendSyncService } from '../services/localStorage/backendSyncService';

export interface UseAutoSaveOptions {
  enabled?: boolean;
  interval?: number; // seconds
  syncOnUnmount?: boolean;
  syncOnWindowClose?: boolean;
  onSyncSuccess?: () => void;
  onSyncError?: (error: any) => void;
}

/**
 * useAutoSave Hook
 * 
 * Usage:
 * ```tsx
 * useAutoSave({
 *   enabled: true,
 *   interval: 45, // seconds
 *   syncOnUnmount: true,
 *   syncOnWindowClose: true,
 *   onSyncSuccess: () => console.log('Data saved'),
 *   onSyncError: (error) => console.error('Save failed', error)
 * });
 * ```
 */
export function useAutoSave(options: UseAutoSaveOptions = {}) {
  const {
    enabled = true,
    interval = 45,
    syncOnUnmount = true,
    syncOnWindowClose = true,
    onSyncSuccess,
    onSyncError
  } = options;

  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Perform sync
   */
  const performSync = useCallback(async () => {
    if (!isMountedRef.current || !enabled) return;

    console.log('💾 [AutoSave] Performing auto-save...');

    try {
      const result = await backendSyncService.syncAll();
      
      if (result.success) {
        console.log('✅ [AutoSave] Auto-save successful:', result.syncedCount);
        onSyncSuccess?.();
      } else {
        console.error('❌ [AutoSave] Auto-save had errors:', result.errors);
        onSyncError?.(result.errors);
      }
    } catch (error) {
      console.error('❌ [AutoSave] Auto-save failed:', error);
      onSyncError?.(error);
    }
  }, [enabled, onSyncSuccess, onSyncError]);

  /**
   * Start auto-save timer
   */
  useEffect(() => {
    if (!enabled) return;

    console.log(`⏰ [AutoSave] Starting auto-save every ${interval} seconds`);

    // Start timer
    syncTimerRef.current = setInterval(performSync, interval * 1000);

    // Cleanup
    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
        syncTimerRef.current = null;
        console.log('🛑 [AutoSave] Auto-save timer stopped');
      }
    };
  }, [enabled, interval, performSync]);

  /**
   * Sync on component unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      if (syncOnUnmount) {
        console.log('👋 [AutoSave] Component unmounting, syncing...');
        backendSyncService.syncAll({ force: true });
      }
    };
  }, [syncOnUnmount]);

  /**
   * Sync on window close
   */
  useEffect(() => {
    if (!enabled || !syncOnWindowClose) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log('👋 [AutoSave] Window closing, syncing...');
      
      const syncStatus = backendSyncService.getSyncStatus();
      
      if (syncStatus.needsSync) {
        // Show warning
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        
        // Attempt sync (best effort)
        backendSyncService.syncAll({ force: true });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, syncOnWindowClose]);

  /**
   * Manual sync trigger
   */
  const triggerSync = useCallback(async () => {
    return performSync();
  }, [performSync]);

  /**
   * Get sync status
   */
  const getSyncStatus = useCallback(() => {
    return backendSyncService.getSyncStatus();
  }, []);

  return {
    triggerSync,
    getSyncStatus,
    isEnabled: enabled
  };
}

/**
 * useDebounce Hook
 * 
 * Debounce function calls
 * 
 * Usage:
 * ```tsx
 * const debouncedUpdate = useDebounce((value) => {
 *   // Update localStorage
 * }, 500);
 * ```
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}
