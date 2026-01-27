/**
 * Elite Booking Sync Module
 * 
 * Sync booking drafts to backend safely with retry logic.
 * Handles offline resilience and conflict resolution.
 * 
 * @module bookingSync
 */

import { logger } from '../utils/logger';
import * as bookingDraft from './bookingDraft';
import { enterpriseMonitoringService } from '../services/enterpriseMonitoringService';

export interface SyncOptions {
  url: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
  timeout?: number;
  retryOnFailure?: boolean;
  validateBeforeSync?: boolean;
}

export interface SyncResult {
  success: boolean;
  bookingId?: string;
  error?: string;
  timestamp: Date;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const RETRY_DELAYS = [1000, 3000, 5000]; // Exponential backoff

/**
 * Sync booking draft to backend
 */
export async function syncDraftToBackend(
  draft: bookingDraft.BookingDraft,
  options: SyncOptions
): Promise<SyncResult> {
  const startTime = Date.now();
  
  try {
    logger.info(`🔄 Syncing booking draft to backend: ${draft.id}`, {
      therapistId: draft.therapistId,
      version: draft.version,
      url: options.url
    });
    
    // Validate before sync if requested
    if (options.validateBeforeSync !== false) {
      const validation = await import('./bookingValidator');
      const validationResult = validation.validateBookingDraft(draft);
      
      if (!validationResult.isValid) {
        logger.error('❌ Validation failed before sync', {
          errors: validationResult.errors
        });
        
        enterpriseMonitoringService.recordBusinessMetric({
          name: 'booking_sync_validation_failed',
          value: 1,
          unit: 'count'
        });
        
        return {
          success: false,
          error: `Validation failed: ${validationResult.errors.join(', ')}`,
          timestamp: new Date()
        };
      }
    }
    
    // Prepare request
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      options.timeout || DEFAULT_TIMEOUT
    );
    
    const response = await fetch(options.url, {
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify({
        draft: draft.data,
        metadata: {
          draftId: draft.id,
          version: draft.version,
          timestamp: draft.timestamp
        }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    const syncTime = Date.now() - startTime;
    
    logger.info(`✅ Successfully synced booking draft: ${draft.id}`, {
      bookingId: result.bookingId,
      syncTime: `${syncTime}ms`
    });
    
    // Mark draft as synced
    bookingDraft.markSynced(draft.therapistId);
    
    enterpriseMonitoringService.recordBusinessMetric({
      name: 'booking_sync_success',
      value: 1,
      unit: 'count'
    });
    
    return {
      success: true,
      bookingId: result.bookingId,
      timestamp: new Date()
    };
    
  } catch (error) {
    const syncTime = Date.now() - startTime;
    
    logger.error(`❌ Failed to sync booking draft: ${draft.id}`, {
      error,
      syncTime: `${syncTime}ms`,
      attempt: draft.syncAttempts + 1
    });
    
    // Increment sync attempts
    bookingDraft.incrementSyncAttempts(draft.therapistId);
    
    enterpriseMonitoringService.recordBusinessMetric({
      name: 'booking_sync_failed',
      value: 1,
      unit: 'count',
      tags: { error: String(error) }
    });
    
    // Retry if requested and not max attempts
    if (options.retryOnFailure && !bookingDraft.hasReachedMaxAttempts(draft.therapistId)) {
      logger.info(`🔄 Retrying sync (attempt ${draft.syncAttempts + 1})...`);
      
      const delay = RETRY_DELAYS[Math.min(draft.syncAttempts, RETRY_DELAYS.length - 1)];
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return syncDraftToBackend(draft, options);
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date()
    };
  }
}

/**
 * Sync draft by therapist ID
 */
export async function syncByTherapistId(
  therapistId: string,
  options: SyncOptions
): Promise<SyncResult> {
  const draft = bookingDraft.loadDraft(therapistId);
  
  if (!draft) {
    logger.error(`❌ No draft found for therapist: ${therapistId}`);
    return {
      success: false,
      error: 'Draft not found',
      timestamp: new Date()
    };
  }
  
  return syncDraftToBackend(draft, options);
}

/**
 * Sync all pending drafts
 */
export async function syncAllPendingDrafts(
  baseUrl: string,
  options?: Partial<SyncOptions>
): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: Array<{ therapistId: string; result: SyncResult }>;
}> {
  const drafts = bookingDraft.getAllDrafts();
  const pendingDrafts = drafts.filter(d => !d.isSynced);
  
  logger.info(`🔄 Syncing ${pendingDrafts.length} pending drafts`);
  
  const results: Array<{ therapistId: string; result: SyncResult }> = [];
  let successful = 0;
  let failed = 0;
  
  for (const draft of pendingDrafts) {
    const syncOptions: SyncOptions = {
      url: baseUrl,
      ...options
    };
    
    const result = await syncDraftToBackend(draft, syncOptions);
    
    results.push({
      therapistId: draft.therapistId,
      result
    });
    
    if (result.success) {
      successful++;
    } else {
      failed++;
    }
    
    // Add delay between syncs to avoid overwhelming backend
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  logger.info(`✅ Sync complete: ${successful} successful, ${failed} failed`);
  
  enterpriseMonitoringService.recordBusinessMetric({
    name: 'booking_bulk_sync_completed',
    value: 1,
    unit: 'count'
  });
  
  return {
    total: pendingDrafts.length,
    successful,
    failed,
    results
  };
}

/**
 * Check backend connectivity
 */
export async function checkBackendConnectivity(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    return response.ok;
  } catch (error) {
    logger.warn('⚠️ Backend connectivity check failed', { error, url });
    return false;
  }
}

/**
 * Sync draft on window close
 */
export function setupSyncOnClose(
  therapistId: string,
  options: SyncOptions
): () => void {
  const handler = (event: BeforeUnloadEvent) => {
    const draft = bookingDraft.loadDraft(therapistId);
    
    if (!draft || draft.isSynced) {
      return;
    }
    
    logger.info('💾 Syncing draft before page close');
    
    // Use navigator.sendBeacon for reliable fire-and-forget
    const data = JSON.stringify({
      draft: draft.data,
      metadata: {
        draftId: draft.id,
        version: draft.version,
        timestamp: draft.timestamp
      }
    });
    
    const blob = new Blob([data], { type: 'application/json' });
    navigator.sendBeacon(options.url, blob);
    
    enterpriseMonitoringService.recordBusinessMetric({
      name: 'booking_sync_on_close',
      value: 1,
      unit: 'count'
    });
  };
  
  window.addEventListener('beforeunload', handler);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('beforeunload', handler);
  };
}

/**
 * Prefetch draft from backend
 */
export async function prefetchDraftFromBackend(
  therapistId: string,
  url: string
): Promise<bookingDraft.BookingDraft | null> {
  try {
    logger.info(`📥 Fetching draft from backend: ${therapistId}`);
    
    const response = await fetch(`${url}?therapistId=${therapistId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.draft) {
      return null;
    }
    
    logger.info(`✅ Fetched draft from backend: ${therapistId}`);
    
    enterpriseMonitoringService.recordBusinessMetric({
      name: 'booking_draft_prefetched',
      value: 1,
      unit: 'count'
    });
    
    return result.draft;
  } catch (error) {
    logger.error(`❌ Failed to prefetch draft from backend: ${therapistId}`, { error });
    return null;
  }
}

/**
 * Two-way sync (merge local and remote)
 */
export async function twoWaySync(
  therapistId: string,
  fetchUrl: string,
  syncUrl: string
): Promise<SyncResult> {
  try {
    // Fetch remote draft
    const remoteDraft = await prefetchDraftFromBackend(therapistId, fetchUrl);
    const localDraft = bookingDraft.loadDraft(therapistId);
    
    if (!localDraft && !remoteDraft) {
      return {
        success: false,
        error: 'No draft found locally or remotely',
        timestamp: new Date()
      };
    }
    
    if (!remoteDraft) {
      // Only local exists, sync to backend
      return syncByTherapistId(therapistId, { url: syncUrl });
    }
    
    if (!localDraft) {
      // Only remote exists, save locally
      bookingDraft.saveDraft(remoteDraft);
      return {
        success: true,
        bookingId: remoteDraft.id,
        timestamp: new Date()
      };
    }
    
    // Both exist, merge using versioning
    const versioning = await import('../utils/versioning');
    
    if (versioning.hasVersionConflict(
      { version: localDraft.version, timestamp: localDraft.timestamp, data: localDraft },
      { version: remoteDraft.version, timestamp: remoteDraft.timestamp, data: remoteDraft }
    )) {
      logger.warn('⚠️ Version conflict detected, resolving...');
      
      const resolved = versioning.resolveConflictLastWriteWins(
        { version: localDraft.version, timestamp: localDraft.timestamp, data: localDraft },
        { version: remoteDraft.version, timestamp: remoteDraft.timestamp, data: remoteDraft }
      );
      
      const mergedDraft: bookingDraft.BookingDraft = {
        ...resolved.data,
        version: resolved.version,
        timestamp: resolved.timestamp,
        lastModified: new Date()
      };
      
      bookingDraft.saveDraft(mergedDraft);
      
      return syncDraftToBackend(mergedDraft, { url: syncUrl });
    }
    
    // No conflict, use newer version
    const useLocal = versioning.isNewer(localDraft.version, remoteDraft.version);
    
    if (useLocal) {
      return syncDraftToBackend(localDraft, { url: syncUrl });
    } else {
      bookingDraft.saveDraft(remoteDraft);
      return {
        success: true,
        bookingId: remoteDraft.id,
        timestamp: new Date()
      };
    }
  } catch (error) {
    logger.error(`❌ Two-way sync failed: ${therapistId}`, { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date()
    };
  }
}
