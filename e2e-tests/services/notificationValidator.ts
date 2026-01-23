/**
 * NotificationValidator - Audio & Vibration Testing Service
 * 
 * Purpose: Validate that audio and vibration notifications are triggered correctly
 * in the UI during E2E tests. This is critical for therapist notification UX.
 * 
 * Usage:
 * ```typescript
 * const validator = new NotificationValidator(page);
 * await validator.monitorAudio('audio[data-notification-sound]');
 * await validator.monitorVibration();
 * 
 * // Trigger notification...
 * 
 * const result = await validator.validate();
 * expect(result.audio).toBe(true);
 * expect(result.vibration).toBe(true);
 * ```
 */

import type { Page } from '@playwright/test';

export class NotificationValidator {
  private audioPlayed = false;
  private vibrationTriggered = false;
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Monitor audio playback
   * 
   * Intercepts HTMLAudioElement.play() calls to detect when notification sounds play.
   * 
   * @param selector - CSS selector for audio elements (e.g., 'audio[data-notification-sound]')
   */
  async monitorAudio(selector: string = 'audio'): Promise<void> {
    // Expose function to capture audio play events
    await this.page.exposeFunction('audioPlayHook', () => {
      this.audioPlayed = true;
    });

    // Inject script to intercept audio.play()
    await this.page.evaluate((sel) => {
      const audioElements = document.querySelectorAll<HTMLAudioElement>(sel);
      audioElements.forEach((audio) => {
        const originalPlay = audio.play;
        audio.play = async function () {
          // Hook into play event
          // @ts-ignore - audioPlayHook exposed from Playwright
          if ((window as any).audioPlayHook) {
            (window as any).audioPlayHook();
          }
          return originalPlay.call(audio);
        };
      });
    }, selector);
  }

  /**
   * Monitor vibration triggers
   * 
   * Intercepts navigator.vibrate() calls to detect when haptic feedback is triggered.
   * Useful for mobile-first notification testing.
   */
  async monitorVibration(): Promise<void> {
    // Expose function to capture vibration events
    await this.page.exposeFunction('vibrateHook', () => {
      this.vibrationTriggered = true;
    });

    // Inject script to intercept navigator.vibrate()
    await this.page.evaluate(() => {
      const originalVibrate = navigator.vibrate;
      navigator.vibrate = function (pattern: number | number[]) {
        // Hook into vibrate event
        // @ts-ignore - vibrateHook exposed from Playwright
        if ((window as any).vibrateHook) {
          (window as any).vibrateHook();
        }
        // Normalize pattern to array for originalVibrate call
        const normalizedPattern = Array.isArray(pattern) ? pattern : [pattern];
        // Call original if it exists (may not exist in desktop browsers)
        return originalVibrate?.call(navigator, normalizedPattern) ?? true;
      };
    });
  }

  /**
   * Monitor both audio and vibration
   * 
   * Convenience method to set up both monitors at once.
   */
  async monitorAll(audioSelector: string = 'audio'): Promise<void> {
    await this.monitorAudio(audioSelector);
    await this.monitorVibration();
  }

  /**
   * Validate notification triggers
   * 
   * @returns Object with audio and vibration status
   */
  async validate(): Promise<{ audio: boolean; vibration: boolean }> {
    return {
      audio: this.audioPlayed,
      vibration: this.vibrationTriggered,
    };
  }

  /**
   * Reset validator state
   * 
   * Useful when testing multiple notifications in sequence.
   */
  reset(): void {
    this.audioPlayed = false;
    this.vibrationTriggered = false;
  }

  /**
   * Wait for audio to play
   * 
   * @param timeout - Maximum time to wait in milliseconds (default: 5000)
   * @returns true if audio played within timeout, false otherwise
   */
  async waitForAudio(timeout: number = 5000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (this.audioPlayed) {
        return true;
      }
      await this.page.waitForTimeout(100);
    }
    return false;
  }

  /**
   * Wait for vibration to trigger
   * 
   * @param timeout - Maximum time to wait in milliseconds (default: 5000)
   * @returns true if vibration triggered within timeout, false otherwise
   */
  async waitForVibration(timeout: number = 5000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (this.vibrationTriggered) {
        return true;
      }
      await this.page.waitForTimeout(100);
    }
    return false;
  }

  /**
   * Wait for any notification (audio or vibration)
   * 
   * @param timeout - Maximum time to wait in milliseconds (default: 5000)
   * @returns Object indicating which notifications triggered
   */
  async waitForAny(timeout: number = 5000): Promise<{ audio: boolean; vibration: boolean }> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (this.audioPlayed || this.vibrationTriggered) {
        break;
      }
      await this.page.waitForTimeout(100);
    }
    return {
      audio: this.audioPlayed,
      vibration: this.vibrationTriggered,
    };
  }

  /**
   * Check if any notification was triggered
   */
  hasNotification(): boolean {
    return this.audioPlayed || this.vibrationTriggered;
  }

  /**
   * Get detailed notification status
   */
  getStatus(): {
    audio: boolean;
    vibration: boolean;
    hasAny: boolean;
    hasBoth: boolean;
  } {
    return {
      audio: this.audioPlayed,
      vibration: this.vibrationTriggered,
      hasAny: this.audioPlayed || this.vibrationTriggered,
      hasBoth: this.audioPlayed && this.vibrationTriggered,
    };
  }
}

/**
 * Usage Examples:
 * 
 * Example 1: Basic validation
 * ```typescript
 * const validator = new NotificationValidator(page);
 * await validator.monitorAll();
 * 
 * // Trigger notification (e.g., new booking)
 * await bookingService.createBooking(bookingData);
 * 
 * // Wait for notifications
 * const result = await validator.waitForAny(5000);
 * expect(result.audio || result.vibration).toBe(true);
 * ```
 * 
 * Example 2: Specific audio selector
 * ```typescript
 * const validator = new NotificationValidator(page);
 * await validator.monitorAudio('audio[data-notification="new-booking"]');
 * 
 * // Trigger booking notification
 * await triggerBooking();
 * 
 * const didPlay = await validator.waitForAudio(3000);
 * expect(didPlay).toBe(true);
 * ```
 * 
 * Example 3: Multiple notifications
 * ```typescript
 * const validator = new NotificationValidator(page);
 * await validator.monitorAll();
 * 
 * // First notification
 * await triggerNotification1();
 * await validator.waitForAny(2000);
 * expect(validator.hasNotification()).toBe(true);
 * 
 * // Reset for second notification
 * validator.reset();
 * 
 * // Second notification
 * await triggerNotification2();
 * await validator.waitForAny(2000);
 * expect(validator.hasNotification()).toBe(true);
 * ```
 * 
 * Example 4: Detailed status check
 * ```typescript
 * const validator = new NotificationValidator(page);
 * await validator.monitorAll('audio.notification-sound');
 * 
 * // Trigger multi-modal notification
 * await triggerBooking();
 * 
 * await validator.waitForAny(5000);
 * const status = validator.getStatus();
 * 
 * console.log('Audio played:', status.audio);
 * console.log('Vibration triggered:', status.vibration);
 * console.log('Has any notification:', status.hasAny);
 * console.log('Has both notifications:', status.hasBoth);
 * ```
 */
