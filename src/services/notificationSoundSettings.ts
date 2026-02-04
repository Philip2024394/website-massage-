/**
 * NOTIFICATION SOUND SETTINGS SERVICE
 * Manages user preferences for PWA notification sounds
 * 
 * PURPOSE: Allow users to enable/disable notification sounds
 * STORAGE: localStorage for instant access
 * DEFAULT: Sound enabled (ON)
 */

export interface NotificationSoundSettings {
  enabled: boolean;
  volume: number; // 0.0 to 1.0
  vibrationEnabled: boolean;
  lastUpdated: string;
}

const SETTINGS_KEY = 'indastreet_notification_sound_settings';

const DEFAULT_SETTINGS: NotificationSoundSettings = {
  enabled: true, // Default: ON (as per business requirements)
  volume: 0.8,
  vibrationEnabled: true,
  lastUpdated: new Date().toISOString()
};

class NotificationSoundSettingsService {
  private settings: NotificationSoundSettings;

  constructor() {
    this.settings = this.loadSettings();
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): NotificationSoundSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed
        };
      }
    } catch (error) {
      console.error('Failed to load notification sound settings:', error);
    }
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      this.settings.lastUpdated = new Date().toISOString();
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      console.log('✅ Notification sound settings saved:', this.settings);
    } catch (error) {
      console.error('Failed to save notification sound settings:', error);
    }
  }

  /**
   * Get current settings
   */
  getSettings(): NotificationSoundSettings {
    return { ...this.settings };
  }

  /**
   * Check if notification sound is enabled
   */
  isSoundEnabled(): boolean {
    return this.settings.enabled;
  }

  /**
   * Enable/disable notification sound
   */
  setSoundEnabled(enabled: boolean): void {
    this.settings.enabled = enabled;
    this.saveSettings();
    console.log(`🔔 Notification sound ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get volume level (0.0 to 1.0)
   */
  getVolume(): number {
    return this.settings.volume;
  }

  /**
   * Set volume level (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
    console.log(`🔊 Notification volume set to ${Math.round(this.settings.volume * 100)}%`);
  }

  /**
   * Check if vibration is enabled
   */
  isVibrationEnabled(): boolean {
    return this.settings.vibrationEnabled;
  }

  /**
   * Enable/disable vibration
   */
  setVibrationEnabled(enabled: boolean): void {
    this.settings.vibrationEnabled = enabled;
    this.saveSettings();
    console.log(`📳 Vibration ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Reset to default settings
   */
  resetToDefaults(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
    console.log('🔄 Notification sound settings reset to defaults');
  }

  /**
   * Toggle sound on/off
   */
  toggleSound(): boolean {
    this.setSoundEnabled(!this.settings.enabled);
    return this.settings.enabled;
  }
}

// Export singleton instance
export const notificationSoundSettings = new NotificationSoundSettingsService();

export default notificationSoundSettings;
