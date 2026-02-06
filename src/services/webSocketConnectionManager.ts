/**
 * WebSocket Connection Manager
 * Prevents multiple simultaneous connections and manages connection lifecycle
 */

import { logger } from '../lib/logger';

export class WebSocketConnectionManager {
  private static instance: WebSocketConnectionManager | null = null;
  private activeConnections = new Map<string, { unsubscribe: () => void; timestamp: number }>();
  private connectionLocks = new Map<string, boolean>();

  static getInstance(): WebSocketConnectionManager {
    if (!WebSocketConnectionManager.instance) {
      WebSocketConnectionManager.instance = new WebSocketConnectionManager();
    }
    return WebSocketConnectionManager.instance;
  }

  /**
   * Register a new connection
   */
  registerConnection(connectionId: string, unsubscribe: () => void): boolean {
    // Check if connection is locked
    if (this.connectionLocks.get(connectionId)) {
      logger.warn(`🔒 [CONNECTION_MANAGER] Connection ${connectionId} is locked`);
      return false;
    }

    // Check if connection already exists
    const existing = this.activeConnections.get(connectionId);
    if (existing) {
      logger.info(`🔄 [CONNECTION_MANAGER] Replacing existing connection ${connectionId}`);
      try {
        existing.unsubscribe();
      } catch (error) {
        logger.warn(`⚠️ [CONNECTION_MANAGER] Failed to cleanup existing connection:`, error);
      }
    }

    // Register new connection
    this.activeConnections.set(connectionId, {
      unsubscribe,
      timestamp: Date.now()
    });

    logger.info(`✅ [CONNECTION_MANAGER] Registered connection ${connectionId}`);
    return true;
  }

  /**
   * Unregister a connection
   */
  unregisterConnection(connectionId: string): void {
    const connection = this.activeConnections.get(connectionId);
    if (connection) {
      try {
        connection.unsubscribe();
      } catch (error) {
        logger.warn(`⚠️ [CONNECTION_MANAGER] Failed to unsubscribe:`, error);
      }
      this.activeConnections.delete(connectionId);
      logger.info(`🗑️ [CONNECTION_MANAGER] Unregistered connection ${connectionId}`);
    }
  }

  /**
   * Lock a connection to prevent replacement
   */
  lockConnection(connectionId: string): void {
    this.connectionLocks.set(connectionId, true);
    logger.info(`🔒 [CONNECTION_MANAGER] Locked connection ${connectionId}`);
  }

  /**
   * Unlock a connection
   */
  unlockConnection(connectionId: string): void {
    this.connectionLocks.delete(connectionId);
    logger.info(`🔓 [CONNECTION_MANAGER] Unlocked connection ${connectionId}`);
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): { activeConnections: number; connections: string[] } {
    return {
      activeConnections: this.activeConnections.size,
      connections: Array.from(this.activeConnections.keys())
    };
  }

  /**
   * Clean up stale connections (older than 5 minutes)
   */
  cleanupStaleConnections(): void {
    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [connectionId, connection] of this.activeConnections.entries()) {
      if (now - connection.timestamp > staleThreshold) {
        logger.info(`🧹 [CONNECTION_MANAGER] Cleaning up stale connection ${connectionId}`);
        this.unregisterConnection(connectionId);
      }
    }
  }

  /**
   * Emergency cleanup - close all connections
   */
  emergencyCleanup(): void {
    logger.warn('🚨 [CONNECTION_MANAGER] Emergency cleanup initiated');
    
    for (const [connectionId, connection] of this.activeConnections.entries()) {
      try {
        connection.unsubscribe();
        logger.info(`🧹 [CONNECTION_MANAGER] Emergency cleanup: ${connectionId}`);
      } catch (error) {
        logger.error(`❌ [CONNECTION_MANAGER] Emergency cleanup failed for ${connectionId}:`, error);
      }
    }
    
    this.activeConnections.clear();
    this.connectionLocks.clear();
    
    logger.info('✅ [CONNECTION_MANAGER] Emergency cleanup completed');
  }
}

export const connectionManager = WebSocketConnectionManager.getInstance();