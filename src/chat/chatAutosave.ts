/**
 * Elite Chat Autosave Module
 * 
 * Background autosave logic for chat messages and sessions.
 * Implements debounced saves, interval-based saves, and save-on-close.
 * 
 * @module chatAutosave
 */

import { logger } from '../utils/logger';
import * as chatStorage from './chatStorage';
import { enterpriseMonitoringService } from '../services/enterpriseMonitoringService';

export interface AutosaveConfig {
  enabled: boolean;
  intervalMs: number;
  debounceMs: number;
  saveOnClose: boolean;
  saveOnBlur: boolean;
}

const DEFAULT_CONFIG: AutosaveConfig = {
  enabled: true,
  intervalMs: 30000, // 30 seconds
  debounceMs: 1000,  // 1 second
  saveOnClose: true,
  saveOnBlur: true
};

class ChatAutosaveService {
  private config: AutosaveConfig = DEFAULT_CONFIG;
  private intervalId: NodeJS.Timeout | null = null;
  private debounceTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private pendingSaves: Map<string, chatStorage.ChatSession> = new Map();
  private isRunning: boolean = false;
  
  /**
   * Initialize autosave service
   */
  initialize(config?: Partial<AutosaveConfig>): void {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    if (this.config.enabled) {
      this.start();
    }
    
    // Setup event listeners
    if (this.config.saveOnClose) {
      window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }
    
    if (this.config.saveOnBlur) {
      window.addEventListener('blur', this.handleBlur.bind(this));
    }
    
    logger.info('💾 Chat autosave initialized', {
      config: this.config
    });
    
    enterpriseMonitoringService.recordBusinessMetric({
      name: 'chat_autosave_initialized',
      value: 1,
      unit: 'count'
    });
  }
  
  /**
   * Start autosave interval
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('⚠️ Autosave already running');
      return;
    }
    
    this.isRunning = true;
    
    this.intervalId = setInterval(() => {
      this.processPendingSaves();
    }, this.config.intervalMs);
    
    logger.info('▶️ Chat autosave started', {
      intervalMs: this.config.intervalMs
    });
    
    enterpriseMonitoringService.recordBusinessMetric({
      name: 'chat_autosave_started',
      value: 1,
      unit: 'count'
    });
  }
  
  /**
   * Stop autosave interval
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Clear all debounce timeouts
    this.debounceTimeouts.forEach(timeout => clearTimeout(timeout));
    this.debounceTimeouts.clear();
    
    logger.info('⏸️ Chat autosave stopped');
    
    enterpriseMonitoringService.recordBusinessMetric({
      name: 'chat_autosave_stopped',
      value: 1,
      unit: 'count'
    });
  }
  
  /**
   * Schedule autosave for session (debounced)
   */
  scheduleAutosave(sessionId: string, session: chatStorage.ChatSession): void {
    if (!this.config.enabled) {
      return;
    }
    
    // Clear existing debounce timeout
    const existingTimeout = this.debounceTimeouts.get(sessionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Add to pending saves
    this.pendingSaves.set(sessionId, session);
    
    // Set new debounce timeout
    const timeout = setTimeout(() => {
      this.saveSingle(sessionId);
    }, this.config.debounceMs);
    
    this.debounceTimeouts.set(sessionId, timeout);
    
    logger.debug(`⏱️ Scheduled autosave for session: ${sessionId}`);
  }
  
  /**
   * Save immediately (no debounce)
   */
  saveImmediately(sessionId: string, session: chatStorage.ChatSession): boolean {
    if (!this.config.enabled) {
      logger.warn('⚠️ Autosave is disabled');
      return false;
    }
    
    // Cancel debounced save if exists
    const existingTimeout = this.debounceTimeouts.get(sessionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.debounceTimeouts.delete(sessionId);
    }
    
    // Save immediately
    const success = chatStorage.saveSession(session);
    
    if (success) {
      logger.info(`💾 Immediate autosave completed: ${sessionId}`);
      
      enterpriseMonitoringService.recordBusinessMetric({
        name: 'chat_autosave_immediate',
        value: 1,
        unit: 'count'
      });
      
      // Remove from pending
      this.pendingSaves.delete(sessionId);
    }
    
    return success;
  }
  
  /**
   * Save single session from pending queue
   */
  private saveSingle(sessionId: string): void {
    const session = this.pendingSaves.get(sessionId);
    
    if (!session) {
      return;
    }
    
    const success = chatStorage.saveSession(session);
    
    if (success) {
      logger.info(`💾 Autosaved session: ${sessionId}`, {
        messageCount: session.messages.length
      });
      
      enterpriseMonitoringService.recordBusinessMetric({
        name: 'chat_autosave_success',
        value: 1,
        unit: 'count'
      });
      
      // Remove from pending
      this.pendingSaves.delete(sessionId);
      this.debounceTimeouts.delete(sessionId);
    } else {
      logger.error(`❌ Autosave failed for session: ${sessionId}`);
      
      enterpriseMonitoringService.recordBusinessMetric({
        name: 'chat_autosave_failed',
        value: 1,
        unit: 'count'
      });
    }
  }
  
  /**
   * Process all pending saves
   */
  private processPendingSaves(): void {
    if (this.pendingSaves.size === 0) {
      return;
    }
    
    logger.info(`💾 Processing ${this.pendingSaves.size} pending autosaves`);
    
    const sessions = Array.from(this.pendingSaves.entries());
    
    sessions.forEach(([sessionId, session]) => {
      this.saveSingle(sessionId);
    });
  }
  
  /**
   * Handle beforeunload event (save on page close)
   */
  private handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.pendingSaves.size > 0) {
      logger.info('💾 Saving pending chat sessions before page close');
      this.processPendingSaves();
      
      enterpriseMonitoringService.recordBusinessMetric({
        name: 'chat_autosave_on_close',
        value: 1,
        unit: 'count'
      });
    }
  }
  
  /**
   * Handle blur event (save when window loses focus)
   */
  private handleBlur(): void {
    if (this.pendingSaves.size > 0) {
      logger.info('💾 Saving pending chat sessions on blur');
      this.processPendingSaves();
      
      enterpriseMonitoringService.recordBusinessMetric({
        name: 'chat_autosave_on_blur',
        value: 1,
        unit: 'count'
      });
    }
  }
  
  /**
   * Get autosave status
   */
  getStatus(): {
    enabled: boolean;
    running: boolean;
    pendingSaves: number;
    config: AutosaveConfig;
  } {
    return {
      enabled: this.config.enabled,
      running: this.isRunning,
      pendingSaves: this.pendingSaves.size,
      config: this.config
    };
  }
  
  /**
   * Update autosave configuration
   */
  updateConfig(config: Partial<AutosaveConfig>): void {
    const wasRunning = this.isRunning;
    
    if (wasRunning) {
      this.stop();
    }
    
    this.config = { ...this.config, ...config };
    
    if (this.config.enabled && wasRunning) {
      this.start();
    }
    
    logger.info('⚙️ Chat autosave config updated', {
      config: this.config
    });
  }
  
  /**
   * Force save all pending sessions
   */
  forceFlush(): void {
    logger.info('💾 Force flushing all pending autosaves');
    
    // Clear all debounce timeouts
    this.debounceTimeouts.forEach(timeout => clearTimeout(timeout));
    this.debounceTimeouts.clear();
    
    // Process all pending
    this.processPendingSaves();
    
    enterpriseMonitoringService.recordBusinessMetric({
      name: 'chat_autosave_force_flush',
      value: 1,
      unit: 'count'
    });
  }
  
  /**
   * Clear pending saves for specific session
   */
  cancelPending(sessionId: string): void {
    const timeout = this.debounceTimeouts.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      this.debounceTimeouts.delete(sessionId);
    }
    
    this.pendingSaves.delete(sessionId);
    
    logger.info(`❌ Cancelled pending autosave: ${sessionId}`);
  }
  
  /**
   * Get last save time for session
   */
  getLastSaveTime(sessionId: string): Date | null {
    const session = chatStorage.loadSession(sessionId);
    
    if (!session) {
      return null;
    }
    
    return session.updatedAt instanceof Date 
      ? session.updatedAt 
      : new Date(session.updatedAt);
  }
  
  /**
   * Check if session has unsaved changes
   */
  hasUnsavedChanges(sessionId: string): boolean {
    return this.pendingSaves.has(sessionId);
  }
  
  /**
   * Get time since last save
   */
  getTimeSinceLastSave(sessionId: string): number | null {
    const lastSave = this.getLastSaveTime(sessionId);
    
    if (!lastSave) {
      return null;
    }
    
    return Date.now() - lastSave.getTime();
  }
  
  /**
   * Cleanup - stop autosave and remove event listeners
   */
  cleanup(): void {
    this.stop();
    
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    window.removeEventListener('blur', this.handleBlur.bind(this));
    
    logger.info('🧹 Chat autosave cleaned up');
  }
}

// Export singleton instance
export const chatAutosaveService = new ChatAutosaveService();

// Auto-initialize with default config
if (typeof window !== 'undefined') {
  chatAutosaveService.initialize();
}
