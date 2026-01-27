/**
 * 🔒 LOCAL STORAGE MANAGER
 * 
 * Centralized localStorage management with:
 * - Type-safe operations
 * - Error handling
 * - Automatic JSON serialization
 * - Versioning support
 * - Data validation
 * 
 * @author Expert Full-Stack Developer
 * @date 2026-01-28
 */

export interface LocalStorageOptions {
  version?: number;
  expiresIn?: number; // milliseconds
  encrypt?: boolean;
}

export interface StoredData<T> {
  data: T;
  version: number;
  timestamp: number;
  expiresAt?: number;
}

/**
 * LocalStorage Manager - Type-safe operations
 */
class LocalStorageManager {
  private prefix = 'massage_app_';

  /**
   * Set item in localStorage
   */
  set<T>(key: string, value: T, options: LocalStorageOptions = {}): boolean {
    try {
      const storageKey = this.prefix + key;
      const timestamp = Date.now();
      
      const storedData: StoredData<T> = {
        data: value,
        version: options.version || 1,
        timestamp,
        expiresAt: options.expiresIn ? timestamp + options.expiresIn : undefined
      };

      localStorage.setItem(storageKey, JSON.stringify(storedData));
      return true;
    } catch (error) {
      console.error(`❌ [LocalStorage] Failed to set ${key}:`, error);
      return false;
    }
  }

  /**
   * Get item from localStorage
   */
  get<T>(key: string): T | null {
    try {
      const storageKey = this.prefix + key;
      const item = localStorage.getItem(storageKey);
      
      if (!item) return null;

      const storedData: StoredData<T> = JSON.parse(item);

      // Check expiration
      if (storedData.expiresAt && Date.now() > storedData.expiresAt) {
        this.remove(key);
        return null;
      }

      return storedData.data;
    } catch (error) {
      console.error(`❌ [LocalStorage] Failed to get ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  remove(key: string): boolean {
    try {
      const storageKey = this.prefix + key;
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error(`❌ [LocalStorage] Failed to remove ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all items with prefix
   */
  clear(): boolean {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to clear:', error);
      return false;
    }
  }

  /**
   * Get all keys with prefix
   */
  keys(): string[] {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to get keys:', error);
      return [];
    }
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    const storageKey = this.prefix + key;
    return localStorage.getItem(storageKey) !== null;
  }

  /**
   * Get storage size in bytes
   */
  getSize(): number {
    try {
      let size = 0;
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          const item = localStorage.getItem(key);
          if (item) {
            size += item.length + key.length;
          }
        }
      });
      return size;
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to get size:', error);
      return 0;
    }
  }

  /**
   * Update partial data
   */
  update<T extends Record<string, any>>(
    key: string, 
    updates: Partial<T>
  ): boolean {
    try {
      const current = this.get<T>(key);
      if (!current) return false;

      const updated = { ...current, ...updates };
      return this.set(key, updated);
    } catch (error) {
      console.error(`❌ [LocalStorage] Failed to update ${key}:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const localStorageManager = new LocalStorageManager();
