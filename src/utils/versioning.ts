/**
 * Elite Versioning Utility
 * 
 * Manages version numbers and timestamps for conflict resolution.
 * Provides version comparison, increment, and conflict detection.
 * 
 * @module versioning
 */

import { logger } from './logger';

export interface VersionedData<T = any> {
  version: number;
  timestamp: Date | string;
  data: T;
  lastModifiedBy?: string;
  conflictResolved?: boolean;
}

export interface VersionInfo {
  version: number;
  timestamp: Date;
  isNewer: boolean;
  difference: number;
}

/**
 * Create new versioned data
 */
export function createVersionedData<T>(
  data: T, 
  version: number = 1,
  userId?: string
): VersionedData<T> {
  return {
    version,
    timestamp: new Date(),
    data,
    lastModifiedBy: userId,
    conflictResolved: false
  };
}

/**
 * Increment version number
 */
export function incrementVersion<T>(versionedData: VersionedData<T>): VersionedData<T> {
  return {
    ...versionedData,
    version: versionedData.version + 1,
    timestamp: new Date()
  };
}

/**
 * Compare two versioned data objects
 * Returns: positive if v1 is newer, negative if v2 is newer, 0 if equal
 */
export function compareVersions(v1: number, v2: number): number {
  return v1 - v2;
}

/**
 * Compare timestamps
 * Returns: positive if t1 is newer, negative if t2 is newer, 0 if equal
 */
export function compareTimestamps(t1: Date | string, t2: Date | string): number {
  const date1 = t1 instanceof Date ? t1 : new Date(t1);
  const date2 = t2 instanceof Date ? t2 : new Date(t2);
  
  return date1.getTime() - date2.getTime();
}

/**
 * Determine if version v1 is newer than v2
 */
export function isNewer(v1: number, v2: number): boolean {
  return v1 > v2;
}

/**
 * Determine if timestamp t1 is newer than t2
 */
export function isTimestampNewer(t1: Date | string, t2: Date | string): boolean {
  return compareTimestamps(t1, t2) > 0;
}

/**
 * Detect version conflict
 */
export function hasVersionConflict<T>(
  local: VersionedData<T>, 
  remote: VersionedData<T>
): boolean {
  // Version conflict if versions don't match
  if (local.version !== remote.version) {
    logger.warn('⚠️ Version conflict detected', {
      localVersion: local.version,
      remoteVersion: remote.version,
      localTimestamp: local.timestamp,
      remoteTimestamp: remote.timestamp
    });
    return true;
  }
  
  return false;
}

/**
 * Resolve conflict using "last write wins" strategy
 */
export function resolveConflictLastWriteWins<T>(
  local: VersionedData<T>, 
  remote: VersionedData<T>
): VersionedData<T> {
  const localTimestamp = local.timestamp instanceof Date 
    ? local.timestamp 
    : new Date(local.timestamp);
    
  const remoteTimestamp = remote.timestamp instanceof Date 
    ? remote.timestamp 
    : new Date(remote.timestamp);
  
  const winner = remoteTimestamp > localTimestamp ? remote : local;
  
  logger.info('✅ Conflict resolved (last write wins)', {
    winner: winner === local ? 'local' : 'remote',
    localTimestamp,
    remoteTimestamp
  });
  
  return {
    ...winner,
    version: Math.max(local.version, remote.version) + 1,
    conflictResolved: true,
    timestamp: new Date()
  };
}

/**
 * Resolve conflict using "highest version wins" strategy
 */
export function resolveConflictHighestVersion<T>(
  local: VersionedData<T>, 
  remote: VersionedData<T>
): VersionedData<T> {
  const winner = remote.version > local.version ? remote : local;
  
  logger.info('✅ Conflict resolved (highest version wins)', {
    winner: winner === local ? 'local' : 'remote',
    localVersion: local.version,
    remoteVersion: remote.version
  });
  
  return {
    ...winner,
    version: Math.max(local.version, remote.version) + 1,
    conflictResolved: true,
    timestamp: new Date()
  };
}

/**
 * Merge two versioned data objects (custom merge logic)
 */
export function mergeVersionedData<T extends Record<string, any>>(
  local: VersionedData<T>, 
  remote: VersionedData<T>,
  mergeStrategy: 'local-priority' | 'remote-priority' | 'merge-fields' = 'local-priority'
): VersionedData<T> {
  let mergedData: T;
  
  switch (mergeStrategy) {
    case 'remote-priority':
      mergedData = { ...local.data, ...remote.data };
      break;
      
    case 'merge-fields':
      mergedData = { ...local.data, ...remote.data };
      break;
      
    case 'local-priority':
    default:
      mergedData = { ...remote.data, ...local.data };
      break;
  }
  
  return {
    version: Math.max(local.version, remote.version) + 1,
    timestamp: new Date(),
    data: mergedData,
    lastModifiedBy: local.lastModifiedBy || remote.lastModifiedBy,
    conflictResolved: true
  };
}

/**
 * Get version information
 */
export function getVersionInfo(
  currentVersion: number, 
  compareVersion: number,
  currentTimestamp: Date | string,
  compareTimestamp: Date | string
): VersionInfo {
  const current = currentTimestamp instanceof Date 
    ? currentTimestamp 
    : new Date(currentTimestamp);
    
  const compare = compareTimestamp instanceof Date 
    ? compareTimestamp 
    : new Date(compareTimestamp);
  
  return {
    version: currentVersion,
    timestamp: current,
    isNewer: currentVersion > compareVersion && current > compare,
    difference: currentVersion - compareVersion
  };
}

/**
 * Generate version history key
 */
export function getVersionHistoryKey(baseKey: string): string {
  return `${baseKey}_version_history`;
}

/**
 * Save version to history
 */
export function saveVersionToHistory<T>(
  versionedData: VersionedData<T>,
  historyKey: string,
  maxHistorySize: number = 10
): void {
  try {
    const historyJson = localStorage.getItem(historyKey);
    const history: VersionedData<T>[] = historyJson ? JSON.parse(historyJson) : [];
    
    // Add new version
    history.unshift({
      ...versionedData,
      timestamp: versionedData.timestamp instanceof Date 
        ? versionedData.timestamp.toISOString() 
        : versionedData.timestamp
    });
    
    // Keep only maxHistorySize versions
    const trimmedHistory = history.slice(0, maxHistorySize);
    
    localStorage.setItem(historyKey, JSON.stringify(trimmedHistory));
    
    logger.info(`💾 Version saved to history: v${versionedData.version}`, {
      historySize: trimmedHistory.length,
      maxSize: maxHistorySize
    });
  } catch (error) {
    logger.error('❌ Failed to save version to history', { error, historyKey });
  }
}

/**
 * Load version history
 */
export function loadVersionHistory<T>(historyKey: string): VersionedData<T>[] {
  try {
    const historyJson = localStorage.getItem(historyKey);
    
    if (!historyJson) {
      return [];
    }
    
    const history: VersionedData<T>[] = JSON.parse(historyJson);
    
    logger.info(`📂 Loaded version history: ${history.length} versions`, {
      historyKey
    });
    
    return history;
  } catch (error) {
    logger.error('❌ Failed to load version history', { error, historyKey });
    return [];
  }
}

/**
 * Restore specific version from history
 */
export function restoreVersion<T>(
  historyKey: string, 
  version: number
): VersionedData<T> | null {
  try {
    const history = loadVersionHistory<T>(historyKey);
    const versionData = history.find(v => v.version === version);
    
    if (!versionData) {
      logger.warn(`⚠️ Version ${version} not found in history`);
      return null;
    }
    
    logger.info(`✅ Restored version ${version} from history`);
    return versionData;
  } catch (error) {
    logger.error('❌ Failed to restore version', { error, historyKey, version });
    return null;
  }
}

/**
 * Get latest version from history
 */
export function getLatestVersion<T>(historyKey: string): VersionedData<T> | null {
  try {
    const history = loadVersionHistory<T>(historyKey);
    
    if (history.length === 0) {
      return null;
    }
    
    return history[0]; // History is sorted with newest first
  } catch (error) {
    logger.error('❌ Failed to get latest version', { error, historyKey });
    return null;
  }
}

/**
 * Calculate version age in milliseconds
 */
export function getVersionAge(timestamp: Date | string): number {
  const versionTime = timestamp instanceof Date 
    ? timestamp 
    : new Date(timestamp);
    
  return Date.now() - versionTime.getTime();
}

/**
 * Check if version is stale (older than threshold)
 */
export function isVersionStale(
  timestamp: Date | string, 
  thresholdMs: number = 3600000 // 1 hour default
): boolean {
  const age = getVersionAge(timestamp);
  return age > thresholdMs;
}

/**
 * Format version age for display
 */
export function formatVersionAge(timestamp: Date | string): string {
  const age = getVersionAge(timestamp);
  
  const seconds = Math.floor(age / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

/**
 * Generate version checksum (simple hash)
 */
export function generateChecksum<T>(data: T): string {
  try {
    const str = JSON.stringify(data);
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(36);
  } catch (error) {
    logger.error('❌ Failed to generate checksum', { error });
    return '';
  }
}

/**
 * Verify data integrity with checksum
 */
export function verifyChecksum<T>(data: T, expectedChecksum: string): boolean {
  const actualChecksum = generateChecksum(data);
  const isValid = actualChecksum === expectedChecksum;
  
  if (!isValid) {
    logger.warn('⚠️ Checksum mismatch detected', {
      expected: expectedChecksum,
      actual: actualChecksum
    });
  }
  
  return isValid;
}
