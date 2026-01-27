/**
 * Elite Booking Draft Module
 * 
 * Create and update booking drafts in localStorage.
 * Manages booking form data with versioning and validation.
 * 
 * @module bookingDraft
 */

import { logger } from '../utils/logger';
import * as storage from '../utils/storageHelper';
import * as versioning from '../utils/versioning';
import { enterpriseMonitoringService } from '../services/enterpriseMonitoringService';

export interface BookingDraftData {
  // Customer Information
  customerName: string;
  whatsappNumber: string;
  countryCode: string;
  
  // Address
  addressLine1: string;
  addressLine2?: string;
  hotelVillaName?: string;
  roomNumber?: string;
  
  // Booking Details
  therapistId: string;
  massageType?: string;
  duration?: number;
  scheduledTime?: Date | string;
  
  // Additional
  discountCode?: string;
  specialInstructions?: string;
  
  // Metadata
  sessionId?: string;
  placeId?: string;
}

export interface BookingDraft {
  id: string;
  therapistId: string;
  data: BookingDraftData;
  version: number;
  timestamp: Date | string;
  lastModified: Date | string;
  syncAttempts: number;
  isSynced: boolean;
  isValid: boolean;
}

const DRAFT_PREFIX = 'booking_draft_';
const MAX_SYNC_ATTEMPTS = 3;

/**
 * Get storage key for draft
 */
function getDraftKey(therapistId: string): string {
  return `${DRAFT_PREFIX}${therapistId}`;
}

/**
 * Create new booking draft
 */
export function createDraft(
  therapistId: string,
  initialData?: Partial<BookingDraftData>
): BookingDraft {
  const draft: BookingDraft = {
    id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    therapistId,
    data: {
      customerName: '',
      whatsappNumber: '',
      countryCode: '+62',
      addressLine1: '',
      therapistId,
      ...initialData
    },
    version: 1,
    timestamp: new Date(),
    lastModified: new Date(),
    syncAttempts: 0,
    isSynced: false,
    isValid: false
  };
  
  saveDraft(draft);
  
  logger.info(`📝 Created new booking draft for therapist: ${therapistId}`);
  
  enterpriseMonitoringService.recordBusinessMetric({
    name: 'booking_draft_created',
    value: 1,
    unit: 'count'
  });
  
  return draft;
}

/**
 * Load booking draft from localStorage
 */
export function loadDraft(therapistId: string): BookingDraft | null {
  try {
    const key = getDraftKey(therapistId);
    const result = storage.getItem<BookingDraft>(key);
    
    if (!result.success || !result.data) {
      logger.info(`📝 No existing draft found for therapist: ${therapistId}`);
      return null;
    }
    
    logger.info(`📝 Loaded booking draft for therapist: ${therapistId}`, {
      version: result.data.version,
      isSynced: result.data.isSynced
    });
    
    enterpriseMonitoringService.recordBusinessMetric({
      name: 'booking_draft_loaded',
      value: 1,
      unit: 'count'
    });
    
    return result.data;
  } catch (error) {
    logger.error(`❌ Failed to load booking draft for therapist: ${therapistId}`, { error });
    return null;
  }
}

/**
 * Save booking draft to localStorage
 */
export function saveDraft(draft: BookingDraft): boolean {
  try {
    const key = getDraftKey(draft.therapistId);
    
    // Update timestamp
    draft.lastModified = new Date();
    
    // Create backup before saving
    const existing = loadDraft(draft.therapistId);
    if (existing) {
      storage.createBackup(key);
    }
    
    const result = storage.setItem(key, draft);
    
    if (!result.success) {
      logger.error(`❌ Failed to save booking draft for therapist: ${draft.therapistId}`, {
        error: result.error
      });
      return false;
    }
    
    logger.info(`💾 Saved booking draft for therapist: ${draft.therapistId}`, {
      version: draft.version,
      isValid: draft.isValid
    });
    
    enterpriseMonitoringService.recordBusinessMetric({
      name: 'booking_draft_saved',
      value: 1,
      unit: 'count'
    });
    
    return true;
  } catch (error) {
    logger.error(`❌ Failed to save booking draft for therapist: ${draft.therapistId}`, { error });
    return false;
  }
}

/**
 * Update booking draft field
 */
export function updateDraftField<K extends keyof BookingDraftData>(
  therapistId: string,
  field: K,
  value: BookingDraftData[K]
): boolean {
  try {
    let draft = loadDraft(therapistId);
    
    if (!draft) {
      draft = createDraft(therapistId);
    }
    
    // Update field
    draft.data[field] = value;
    
    // Increment version
    draft.version++;
    draft.lastModified = new Date();
    
    // Save draft
    const success = saveDraft(draft);
    
    if (success) {
      logger.info(`✏️ Updated booking draft field: ${field}`, {
        therapistId,
        version: draft.version
      });
      
      enterpriseMonitoringService.recordBusinessMetric({
        name: 'booking_draft_field_updated',
        value: 1,
        unit: 'count'
      });
    }
    
    return success;
  } catch (error) {
    logger.error(`❌ Failed to update booking draft field: ${field}`, { error, therapistId });
    return false;
  }
}

/**
 * Update multiple draft fields
 */
export function updateDraftFields(
  therapistId: string,
  updates: Partial<BookingDraftData>
): boolean {
  try {
    let draft = loadDraft(therapistId);
    
    if (!draft) {
      draft = createDraft(therapistId);
    }
    
    // Update fields
    draft.data = { ...draft.data, ...updates };
    
    // Increment version
    draft.version++;
    draft.lastModified = new Date();
    
    // Save draft
    const success = saveDraft(draft);
    
    if (success) {
      logger.info(`✏️ Updated ${Object.keys(updates).length} booking draft fields`, {
        therapistId,
        version: draft.version
      });
      
      enterpriseMonitoringService.recordBusinessMetric({
        name: 'booking_draft_bulk_updated',
        value: 1,
        unit: 'count'
      });
    }
    
    return success;
  } catch (error) {
    logger.error(`❌ Failed to update booking draft fields`, { error, therapistId });
    return false;
  }
}

/**
 * Clear booking draft
 */
export function clearDraft(therapistId: string): boolean {
  try {
    const key = getDraftKey(therapistId);
    
    // Create backup before clearing
    storage.createBackup(key);
    
    const result = storage.removeItem(key);
    
    if (result.success) {
      logger.info(`🗑️ Cleared booking draft for therapist: ${therapistId}`);
      
      enterpriseMonitoringService.recordBusinessMetric({
        name: 'booking_draft_cleared',
        value: 1,
        unit: 'count'
      });
    }
    
    return result.success;
  } catch (error) {
    logger.error(`❌ Failed to clear booking draft for therapist: ${therapistId}`, { error });
    return false;
  }
}

/**
 * Restore draft from backup
 */
export function restoreDraft(therapistId: string): BookingDraft | null {
  try {
    const key = getDraftKey(therapistId);
    const result = storage.restoreFromBackup<BookingDraft>(key);
    
    if (!result.success || !result.data) {
      logger.warn(`⚠️ No backup found for therapist: ${therapistId}`);
      return null;
    }
    
    logger.info(`♻️ Restored booking draft from backup: ${therapistId}`);
    
    enterpriseMonitoringService.recordBusinessMetric({
      name: 'booking_draft_restored',
      value: 1,
      unit: 'count'
    });
    
    return result.data;
  } catch (error) {
    logger.error(`❌ Failed to restore booking draft: ${therapistId}`, { error });
    return null;
  }
}

/**
 * Increment sync attempts
 */
export function incrementSyncAttempts(therapistId: string): boolean {
  const draft = loadDraft(therapistId);
  
  if (!draft) {
    logger.warn(`⚠️ Draft not found for therapist: ${therapistId}`);
    return false;
  }
  
  draft.syncAttempts++;
  
  return saveDraft(draft);
}

/**
 * Reset sync attempts
 */
export function resetSyncAttempts(therapistId: string): boolean {
  const draft = loadDraft(therapistId);
  
  if (!draft) {
    logger.warn(`⚠️ Draft not found for therapist: ${therapistId}`);
    return false;
  }
  
  draft.syncAttempts = 0;
  
  return saveDraft(draft);
}

/**
 * Mark draft as synced
 */
export function markSynced(therapistId: string): boolean {
  const draft = loadDraft(therapistId);
  
  if (!draft) {
    logger.warn(`⚠️ Draft not found for therapist: ${therapistId}`);
    return false;
  }
  
  draft.isSynced = true;
  draft.syncAttempts = 0;
  
  const success = saveDraft(draft);
  
  if (success) {
    logger.info(`✅ Marked draft as synced: ${therapistId}`);
    
    enterpriseMonitoringService.recordBusinessMetric({
      name: 'booking_draft_synced',
      value: 1,
      unit: 'count'
    });
  }
  
  return success;
}

/**
 * Check if max sync attempts reached
 */
export function hasReachedMaxAttempts(therapistId: string): boolean {
  const draft = loadDraft(therapistId);
  
  if (!draft) {
    return false;
  }
  
  return draft.syncAttempts >= MAX_SYNC_ATTEMPTS;
}

/**
 * Get all active drafts
 */
export function getAllDrafts(): BookingDraft[] {
  try {
    const keys = storage.getKeysByPrefix(DRAFT_PREFIX);
    const drafts: BookingDraft[] = [];
    
    keys.forEach(key => {
      const result = storage.getItem<BookingDraft>(key);
      if (result.success && result.data) {
        drafts.push(result.data);
      }
    });
    
    logger.info(`📝 Loaded ${drafts.length} booking drafts`);
    
    return drafts;
  } catch (error) {
    logger.error('❌ Failed to load all booking drafts', { error });
    return [];
  }
}

/**
 * Get draft statistics
 */
export function getDraftStats(therapistId: string): {
  exists: boolean;
  version: number;
  age: number;
  isSynced: boolean;
  isValid: boolean;
  syncAttempts: number;
} {
  const draft = loadDraft(therapistId);
  
  if (!draft) {
    return {
      exists: false,
      version: 0,
      age: 0,
      isSynced: false,
      isValid: false,
      syncAttempts: 0
    };
  }
  
  const age = versioning.getVersionAge(draft.lastModified);
  
  return {
    exists: true,
    version: draft.version,
    age,
    isSynced: draft.isSynced,
    isValid: draft.isValid,
    syncAttempts: draft.syncAttempts
  };
}

/**
 * Clean up old drafts (older than threshold)
 */
export function cleanupOldDrafts(thresholdMs: number = 7 * 24 * 60 * 60 * 1000): number {
  try {
    const drafts = getAllDrafts();
    let cleaned = 0;
    
    drafts.forEach(draft => {
      const age = versioning.getVersionAge(draft.lastModified);
      
      if (age > thresholdMs && draft.isSynced) {
        const key = getDraftKey(draft.therapistId);
        storage.removeItem(key);
        cleaned++;
        
        logger.info(`🗑️ Cleaned up old draft: ${draft.therapistId}`, {
          age: versioning.formatVersionAge(draft.lastModified)
        });
      }
    });
    
    if (cleaned > 0) {
      logger.info(`✅ Cleaned up ${cleaned} old booking drafts`);
      
      enterpriseMonitoringService.recordBusinessMetric({
        name: 'booking_drafts_cleaned',
        value: cleaned,
        unit: 'count'
      });
    }
    
    return cleaned;
  } catch (error) {
    logger.error('❌ Failed to cleanup old drafts', { error });
    return 0;
  }
}

/**
 * Export draft for debugging
 */
export function exportDraft(therapistId: string): string | null {
  const draft = loadDraft(therapistId);
  
  if (!draft) {
    return null;
  }
  
  try {
    return JSON.stringify(draft, null, 2);
  } catch (error) {
    logger.error(`❌ Failed to export draft: ${therapistId}`, { error });
    return null;
  }
}

/**
 * Import draft from JSON
 */
export function importDraft(jsonString: string): boolean {
  try {
    const draft: BookingDraft = JSON.parse(jsonString);
    
    return saveDraft(draft);
  } catch (error) {
    logger.error('❌ Failed to import draft', { error });
    return false;
  }
}
