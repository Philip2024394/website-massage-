/**
 * 🔧 TEST INSTRUMENTATION HOOKS
 * 
 * Purpose: Inject test hooks into browser context to detect:
 * - audio.play() invocations
 * - navigator.vibrate() calls
 * - System notifications
 * - Real-time events
 */

import { Page } from '@playwright/test';

export interface TestEvents {
  audioPlayed: Array<{ src: string; timestamp: number }>;
  vibrateCalled: Array<{ pattern: number | number[]; timestamp: number }>;
  notificationsShown: Array<{ title: string; body: string; timestamp: number }>;
  realtimeEvents: Array<{ type: string; data: any; timestamp: number }>;
}

/**
 * Inject test instrumentation into page
 */
export async function injectTestInstrumentation(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // Create global TEST_EVENTS object
    (window as any).TEST_EVENTS = {
      audioPlayed: [],
      vibrateCalled: [],
      notificationsShown: [],
      realtimeEvents: []
    };

    // Intercept Audio.play()
    const originalAudioPlay = HTMLAudioElement.prototype.play;
    HTMLAudioElement.prototype.play = function() {
      (window as any).TEST_EVENTS.audioPlayed.push({
        src: this.src,
        timestamp: Date.now()
      });
      console.log('🔊 [TEST] Audio played:', this.src);
      return originalAudioPlay.call(this);
    };

    // Intercept navigator.vibrate()
    if (navigator.vibrate) {
      const originalVibrate = navigator.vibrate.bind(navigator);
      navigator.vibrate = function(pattern: number | number[]) {
        (window as any).TEST_EVENTS.vibrateCalled.push({
          pattern,
          timestamp: Date.now()
        });
        console.log('📳 [TEST] Vibrate called:', pattern);
        return originalVibrate(pattern);
      };
    }

    // Intercept Notification API
    if ('Notification' in window) {
      const OriginalNotification = window.Notification;
      (window as any).Notification = class extends OriginalNotification {
        constructor(title: string, options?: NotificationOptions) {
          (window as any).TEST_EVENTS.notificationsShown.push({
            title,
            body: options?.body || '',
            timestamp: Date.now()
          });
          console.log('🔔 [TEST] Notification shown:', title);
          super(title, options);
        }
      };
      // Copy static properties
      Object.setPrototypeOf(window.Notification, OriginalNotification);
      Object.keys(OriginalNotification).forEach(key => {
        (window.Notification as any)[key] = (OriginalNotification as any)[key];
      });
    }

    console.log('✅ [TEST] Instrumentation hooks injected');
  });
}

/**
 * Get test events from page
 */
export async function getTestEvents(page: Page): Promise<TestEvents> {
  return await page.evaluate(() => (window as any).TEST_EVENTS);
}

/**
 * Clear test events
 */
export async function clearTestEvents(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as any).TEST_EVENTS = {
      audioPlayed: [],
      vibrateCalled: [],
      notificationsShown: [],
      realtimeEvents: []
    };
  });
}

/**
 * Wait for audio to be played
 */
export async function waitForAudio(page: Page, timeout = 5000): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const events = await getTestEvents(page);
    if (events.audioPlayed.length > 0) {
      return true;
    }
    await page.waitForTimeout(100);
  }
  
  return false;
}

/**
 * Wait for vibration to be called
 */
export async function waitForVibration(page: Page, timeout = 5000): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const events = await getTestEvents(page);
    if (events.vibrateCalled.length > 0) {
      return true;
    }
    await page.waitForTimeout(100);
  }
  
  return false;
}

/**
 * Wait for notification to be shown
 */
export async function waitForNotification(page: Page, timeout = 5000): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const events = await getTestEvents(page);
    if (events.notificationsShown.length > 0) {
      return true;
    }
    await page.waitForTimeout(100);
  }
  
  return false;
}
