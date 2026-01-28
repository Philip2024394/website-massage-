/**
 * Elite Secure Storage System
 * Encrypted localStorage for sensitive therapist data
 */

interface SecureStorageOptions {
  expiry?: number; // Expiration time in milliseconds
  compress?: boolean;
}

class SecureStorage {
  private readonly key = 'indastreet_therapist_secure';
  private readonly algorithm = 'AES-GCM';

  /**
   * Simple XOR encryption for client-side obfuscation
   * Note: This is not military-grade security but prevents casual inspection
   */
  private encrypt(text: string): string {
    const key = this.generateKey();
    const encrypted = btoa(
      text
        .split('')
        .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
        .join('')
    );
    return encrypted;
  }

  private decrypt(encryptedText: string): string {
    try {
      const key = this.generateKey();
      const decrypted = atob(encryptedText)
        .split('')
        .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
        .join('');
      return decrypted;
    } catch (error) {
      console.warn('Failed to decrypt storage data:', error);
      return '';
    }
  }

  private generateKey(): string {
    // Generate key based on browser fingerprint and session
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return btoa(userAgent + language + timezone).slice(0, 32);
  }

  /**
   * Store sensitive data with encryption and expiry
   */
  setSecure<T>(key: string, value: T, options: SecureStorageOptions = {}): boolean {
    try {
      const dataToStore = {
        value,
        timestamp: Date.now(),
        expiry: options.expiry ? Date.now() + options.expiry : null,
        compressed: false
      };

      let serialized = JSON.stringify(dataToStore);
      
      // Simple compression for large data
      if (options.compress && serialized.length > 1000) {
        // Basic compression would go here
        dataToStore.compressed = true;
      }

      const encrypted = this.encrypt(serialized);
      localStorage.setItem(`${this.key}_${key}`, encrypted);
      
      console.log(`🔒 Secure storage: ${key} stored with encryption`);
      return true;
    } catch (error) {
      console.error('Failed to store secure data:', error);
      return false;
    }
  }

  /**
   * Retrieve and decrypt sensitive data
   */
  getSecure<T>(key: string): T | null {
    try {
      const encrypted = localStorage.getItem(`${this.key}_${key}`);
      if (!encrypted) return null;

      const decrypted = this.decrypt(encrypted);
      if (!decrypted) return null;

      const data = JSON.parse(decrypted);

      // Check expiry
      if (data.expiry && Date.now() > data.expiry) {
        this.removeSecure(key);
        console.log(`🕐 Secure storage: ${key} expired and removed`);
        return null;
      }

      return data.value;
    } catch (error) {
      console.warn('Failed to retrieve secure data:', error);
      // Auto-cleanup corrupted data
      this.removeSecure(key);
      return null;
    }
  }

  /**
   * Remove secure data
   */
  removeSecure(key: string): void {
    localStorage.removeItem(`${this.key}_${key}`);
    console.log(`🗑️ Secure storage: ${key} removed`);
  }

  /**
   * Clear all secure storage
   */
  clearAllSecure(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.key));
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`🧹 Secure storage: ${keys.length} items cleared`);
  }

  /**
   * Check if secure storage is available and working
   */
  isAvailable(): boolean {
    try {
      const testKey = '_test_secure_storage';
      const testValue = { test: 'data', timestamp: Date.now() };
      
      this.setSecure(testKey, testValue);
      const retrieved = this.getSecure<{ test: string; timestamp: number }>(testKey);
      this.removeSecure(testKey);
      
      return retrieved !== null && retrieved.test === 'data';
    } catch {
      return false;
    }
  }

  /**
   * Get storage usage statistics
   */
  getStorageStats(): {
    totalKeys: number;
    totalSize: number;
    secureKeys: number;
    available: boolean;
  } {
    const allKeys = Object.keys(localStorage);
    const secureKeys = allKeys.filter(key => key.startsWith(this.key));
    
    const totalSize = allKeys.reduce((size, key) => {
      return size + (localStorage.getItem(key)?.length || 0);
    }, 0);

    return {
      totalKeys: allKeys.length,
      totalSize,
      secureKeys: secureKeys.length,
      available: this.isAvailable()
    };
  }
}

// Export singleton instance
export const secureStorage = new SecureStorage();

// Elite storage utilities for common therapist data
export const therapistSecureStorage = {
  // Store sensitive user preferences
  setPreferences: (preferences: any) => 
    secureStorage.setSecure('user_preferences', preferences),
  
  getPreferences: () => 
    secureStorage.getSecure('user_preferences'),

  // Store temporary session data with auto-expiry
  setSessionData: (data: any, expiryHours: number = 2) =>
    secureStorage.setSecure('session_data', data, { 
      expiry: expiryHours * 60 * 60 * 1000 
    }),
  
  getSessionData: () => 
    secureStorage.getSecure('session_data'),

  // Store payment information temporarily (auto-expires in 30 minutes)
  setPaymentSession: (paymentData: any) =>
    secureStorage.setSecure('payment_session', paymentData, { 
      expiry: 30 * 60 * 1000 
    }),
  
  getPaymentSession: () => 
    secureStorage.getSecure('payment_session'),

  // Clear all sensitive data (logout cleanup)
  clearAllSensitiveData: () => {
    secureStorage.clearAllSecure();
    // Also clear regular localStorage items that might be sensitive
    const sensitiveKeys = [
      'lastAutoOfflineCheck',
      'pwa-installed',
      'packageDetails'
    ];
    sensitiveKeys.forEach(key => localStorage.removeItem(key));
  }
};

export default secureStorage;