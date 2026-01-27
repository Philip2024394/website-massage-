/**
 * Elite Storage Helper Utility
 * 
 * Generic localStorage wrapper with JSON serialization, error handling,
 * and type safety. Provides robust storage operations with integrity checks.
 * 
 * @module storageHelper
 */

import { logger } from './logger';

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface StorageMetadata {
  version: number;
  timestamp: Date;
  checksum?: string;
}

/**
 * Safely get JSON data from localStorage
 */
export function getItem<T>(key: string): StorageResult<T> {
  try {
    const item = localStorage.getItem(key);
    
    if (!item) {
      return {
        success: true,
        data: undefined
      };
    }
    
    const parsed = JSON.parse(item) as T;
    
    return {
      success: true,
      data: parsed
    };
  } catch (error) {
    logger.error(`❌ Failed to get item from localStorage: ${key}`, { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Safely set JSON data to localStorage
 */
export function setItem<T>(key: string, value: T): StorageResult<T> {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    
    return {
      success: true,
      data: value
    };
  } catch (error) {
    logger.error(`❌ Failed to set item in localStorage: ${key}`, { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Remove item from localStorage
 */
export function removeItem(key: string): StorageResult<void> {
  try {
    localStorage.removeItem(key);
    
    return {
      success: true
    };
  } catch (error) {
    logger.error(`❌ Failed to remove item from localStorage: ${key}`, { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Check if key exists in localStorage
 */
export function hasItem(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    logger.error(`❌ Failed to check localStorage key: ${key}`, { error });
    return false;
  }
}

/**
 * Clear all items from localStorage (use with caution)
 */
export function clearAll(): StorageResult<void> {
  try {
    localStorage.clear();
    
    return {
      success: true
    };
  } catch (error) {
    logger.error('❌ Failed to clear localStorage', { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Get all keys matching a prefix
 */
export function getKeysByPrefix(prefix: string): string[] {
  try {
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    
    return keys;
  } catch (error) {
    logger.error(`❌ Failed to get keys by prefix: ${prefix}`, { error });
    return [];
  }
}

/**
 * Get localStorage usage statistics
 */
export function getStorageStats(): {
  totalKeys: number;
  estimatedSize: number;
  availableSpace: number;
  usagePercent: number;
} {
  try {
    let totalSize = 0;
    const totalKeys = localStorage.length;
    
    for (let i = 0; i < totalKeys; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        totalSize += key.length + (value?.length || 0);
      }
    }
    
    // Estimate: most browsers allow 5-10MB, we'll use 5MB conservative
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const availableSpace = maxSize - totalSize;
    const usagePercent = (totalSize / maxSize) * 100;
    
    return {
      totalKeys,
      estimatedSize: totalSize,
      availableSpace,
      usagePercent
    };
  } catch (error) {
    logger.error('❌ Failed to get storage stats', { error });
    return {
      totalKeys: 0,
      estimatedSize: 0,
      availableSpace: 0,
      usagePercent: 0
    };
  }
}

/**
 * Check localStorage integrity
 */
export function checkIntegrity(key: string): boolean {
  try {
    const item = localStorage.getItem(key);
    
    if (!item) {
      return true; // No item = no corruption
    }
    
    // Try parsing to check JSON integrity
    JSON.parse(item);
    return true;
  } catch (error) {
    logger.error(`❌ localStorage integrity check failed for key: ${key}`, { error });
    return false;
  }
}

/**
 * Safely update item with merge strategy
 */
export function updateItem<T extends Record<string, any>>(
  key: string, 
  updates: Partial<T>
): StorageResult<T> {
  try {
    const result = getItem<T>(key);
    
    if (!result.success) {
      return result;
    }
    
    const current = result.data || {} as T;
    const updated = { ...current, ...updates };
    
    return setItem(key, updated);
  } catch (error) {
    logger.error(`❌ Failed to update item in localStorage: ${key}`, { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Get item with default value if not found
 */
export function getItemOrDefault<T>(key: string, defaultValue: T): T {
  const result = getItem<T>(key);
  
  if (result.success && result.data !== undefined) {
    return result.data;
  }
  
  return defaultValue;
}

/**
 * Set item with expiration (stored as metadata)
 */
export function setItemWithExpiry<T>(
  key: string, 
  value: T, 
  expiryMs: number
): StorageResult<{ value: T; expiry: number }> {
  try {
    const expiryTime = Date.now() + expiryMs;
    
    const wrapper = {
      value,
      expiry: expiryTime
    };
    
    return setItem(key, wrapper);
  } catch (error) {
    logger.error(`❌ Failed to set item with expiry: ${key}`, { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Get item with expiration check
 */
export function getItemWithExpiry<T>(key: string): StorageResult<T> {
  try {
    const result = getItem<{ value: T; expiry: number }>(key);
    
    if (!result.success || !result.data) {
      return {
        success: true,
        data: undefined
      };
    }
    
    const { value, expiry } = result.data;
    
    // Check if expired
    if (Date.now() > expiry) {
      removeItem(key);
      return {
        success: true,
        data: undefined
      };
    }
    
    return {
      success: true,
      data: value
    };
  } catch (error) {
    logger.error(`❌ Failed to get item with expiry: ${key}`, { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Backup item to a backup key
 */
export function createBackup<T>(key: string): StorageResult<T> {
  try {
    const result = getItem<T>(key);
    
    if (!result.success || !result.data) {
      return result;
    }
    
    const backupKey = `${key}_backup`;
    return setItem(backupKey, result.data);
  } catch (error) {
    logger.error(`❌ Failed to create backup for key: ${key}`, { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Restore item from backup
 */
export function restoreFromBackup<T>(key: string): StorageResult<T> {
  try {
    const backupKey = `${key}_backup`;
    const result = getItem<T>(backupKey);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: 'No backup found'
      };
    }
    
    return setItem(key, result.data);
  } catch (error) {
    logger.error(`❌ Failed to restore from backup for key: ${key}`, { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Get size of item in bytes
 */
export function getItemSize(key: string): number {
  try {
    const item = localStorage.getItem(key);
    if (!item) return 0;
    
    return key.length + item.length;
  } catch (error) {
    logger.error(`❌ Failed to get item size for key: ${key}`, { error });
    return 0;
  }
}

/**
 * Check if localStorage is available and working
 */
export function isAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    const testValue = 'test';
    
    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    return retrieved === testValue;
  } catch (error) {
    logger.error('❌ localStorage is not available', { error });
    return false;
  }
}

/**
 * Export all data matching prefix (for debugging/backup)
 */
export function exportData(prefix: string): Record<string, any> {
  try {
    const keys = getKeysByPrefix(prefix);
    const data: Record<string, any> = {};
    
    keys.forEach(key => {
      const result = getItem(key);
      if (result.success && result.data) {
        data[key] = result.data;
      }
    });
    
    return data;
  } catch (error) {
    logger.error(`❌ Failed to export data for prefix: ${prefix}`, { error });
    return {};
  }
}

/**
 * Import data into localStorage (use with caution)
 */
export function importData(data: Record<string, any>): StorageResult<void> {
  try {
    Object.entries(data).forEach(([key, value]) => {
      setItem(key, value);
    });
    
    return {
      success: true
    };
  } catch (error) {
    logger.error('❌ Failed to import data', { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
